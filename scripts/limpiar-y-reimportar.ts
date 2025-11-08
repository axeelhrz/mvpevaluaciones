import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) continue;
    
    const key = trimmed.substring(0, equalIndex).trim();
    let value = trimmed.substring(equalIndex + 1).trim();
    
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🧹 LIMPIEZA Y REIMPORTACIÓN DE REACTIVOS\n');
  console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los reactivos actuales');
  console.log('    y los reimportará desde el archivo Excel.\n');

  // Paso 1: Contar reactivos actuales
  const { count: countBefore } = await supabase
    .from('Reactivo')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Reactivos actuales en BD: ${countBefore || 0}\n`);

  // Paso 2: Eliminar TODOS los reactivos
  console.log('🗑️  Eliminando todos los reactivos...');
  
  const { error: deleteError } = await supabase
    .from('Reactivo')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Error al eliminar reactivos:', deleteError);
    return;
  }

  // Verificar eliminación
  const { count: countAfter } = await supabase
    .from('Reactivo')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Reactivos eliminados. Quedan: ${countAfter || 0}\n`);

  // Paso 3: Reimportar desde Excel
  console.log('📥 Reimportando reactivos desde Excel...');
  console.log('    Ejecutando: npx tsx scripts/import-reactivos-xlsx.ts\n');
  
  // Importar el módulo de importación
  try {
    const { execSync } = require('child_process');
    execSync('npx tsx scripts/import-reactivos-xlsx.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error: any) {
    console.error('❌ Error durante la importación:', error.message);
    return;
  }

  // Paso 4: Verificar resultados
  console.log('\n📊 Verificando resultados...\n');

  const { data: reactivos, error: errorVerify } = await supabase
    .from('Reactivo')
    .select('id, tipo, pairId, escalaId')
    .eq('tipo', 'POS');

  if (errorVerify) {
    console.error('❌ Error al verificar:', errorVerify);
    return;
  }

  // Agrupar por pares
  const pares = new Map<string, typeof reactivos>();
  for (const r of reactivos || []) {
    if (!pares.has(r.pairId)) {
      pares.set(r.pairId, []);
    }
    pares.get(r.pairId)!.push(r);
  }

  // Contar pares completos e incompletos
  let completos = 0;
  let incompletos = 0;

  for (const [, items] of pares.entries()) {
    if (items.length === 2) {
      completos++;
    } else {
      incompletos++;
    }
  }

  console.log('='.repeat(80));
  console.log('✅ RESULTADOS FINALES');
  console.log('='.repeat(80));
  console.log(`Total reactivos POS: ${reactivos?.length || 0}`);
  console.log(`Total pares únicos: ${pares.size}`);
  console.log(`Pares completos: ${completos}`);
  console.log(`Pares incompletos: ${incompletos}`);
  console.log(`\nEsperado: 168 pares (336 reactivos POS)`);
  
  if (pares.size === 168 && completos === 168 && incompletos === 0) {
    console.log('\n🎉 ¡PERFECTO! La base de datos está correcta.');
  } else {
    console.log('\n⚠️  Hay diferencias con lo esperado. Revisa la importación.');
  }
}

main();