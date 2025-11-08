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
  console.log('🔍 VERIFICANDO PARES DE REACTIVOS\n');

  // Total de reactivos POS
  const { data: reactivos, error } = await supabase
    .from('Reactivo')
    .select('id, pairId, ordenEnPar, tipo, escalaId')
    .eq('tipo', 'POS');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 ESTADÍSTICAS DE REACTIVOS:');
  console.log(`Total reactivos POS: ${reactivos?.length || 0}`);

  // Agrupar por pairId
  const pares = new Map<string, typeof reactivos>();
  for (const r of reactivos || []) {
    if (!pares.has(r.pairId)) {
      pares.set(r.pairId, []);
    }
    pares.get(r.pairId)!.push(r);
  }

  console.log(`Total pares únicos: ${pares.size}`);

  // Contar pares completos e incompletos
  let completos = 0;
  let incompletos = 0;
  const paresIncompletos: Array<{ pairId: string; reactivos: number; problema: string }> = [];

  for (const [pairId, reactivosDelPar] of pares.entries()) {
    if (reactivosDelPar.length === 2) {
      const tiene1 = reactivosDelPar.some(r => r.ordenEnPar === 1);
      const tiene2 = reactivosDelPar.some(r => r.ordenEnPar === 2);
      if (tiene1 && tiene2) {
        completos++;
      } else {
        incompletos++;
        paresIncompletos.push({ 
          pairId, 
          reactivos: reactivosDelPar.length, 
          problema: 'ordenEnPar incorrecto' 
        });
      }
    } else {
      incompletos++;
      paresIncompletos.push({ 
        pairId, 
        reactivos: reactivosDelPar.length, 
        problema: `tiene ${reactivosDelPar.length} reactivo(s)` 
      });
    }
  }

  console.log(`\n✅ Pares completos: ${completos}`);
  console.log(`❌ Pares incompletos: ${incompletos}`);

  if (paresIncompletos.length > 0) {
    console.log('\n⚠️  PARES INCOMPLETOS (primeros 10):');
    paresIncompletos.slice(0, 10).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.pairId.substring(0, 8)}... - ${p.problema}`);
    });
  }

  console.log('\n📋 RESUMEN:');
  console.log('Se esperan: 168 pares (336 reactivos POS)');
  console.log(`Se tienen: ${completos} pares completos (${completos * 2} reactivos)`);
  console.log(`Faltan: ${168 - completos} pares (${(168 - completos) * 2} reactivos)`);

  // Verificar reactivos sin escala
  const sinEscala = reactivos?.filter(r => !r.escalaId) || [];
  if (sinEscala.length > 0) {
    console.log(`\n⚠️  Reactivos sin escala asignada: ${sinEscala.length}`);
  }
}

main();
