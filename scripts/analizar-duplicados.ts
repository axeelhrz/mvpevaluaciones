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
  console.log('🔍 ANÁLISIS DE DUPLICADOS Y DATOS EXCEDENTES\n');

  // Obtener todos los reactivos POS
  const { data: reactivos, error } = await supabase
    .from('Reactivo')
    .select('id, texto, tipo, pairId, escalaId, Escala:escalaId(codigo, nombre)')
    .eq('tipo', 'POS');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total reactivos POS: ${reactivos?.length || 0}`);

  // Agrupar por texto para encontrar duplicados
  const porTexto = new Map<string, typeof reactivos>();
  for (const r of reactivos || []) {
    const textoNormalizado = r.texto.trim().toLowerCase();
    if (!porTexto.has(textoNormalizado)) {
      porTexto.set(textoNormalizado, []);
    }
    porTexto.get(textoNormalizado)!.push(r);
  }

  // Encontrar textos duplicados
  const duplicados = Array.from(porTexto.entries()).filter(([, items]) => items.length > 1);
  
  console.log(`\n📋 Reactivos con texto duplicado: ${duplicados.length}`);
  console.log(`📋 Total de instancias duplicadas: ${duplicados.reduce((sum, [, items]) => sum + items.length, 0)}`);

  if (duplicados.length > 0) {
    console.log('\n⚠️  PRIMEROS 10 TEXTOS DUPLICADOS:\n');
    duplicados.slice(0, 10).forEach(([texto, items], i) => {
      console.log(`${i + 1}. "${texto.substring(0, 60)}..." (${items.length} copias)`);
      items.forEach((item: any) => {
        const escala = Array.isArray(item.Escala) ? item.Escala[0] : item.Escala;
        console.log(`   - ID: ${item.id.substring(0, 8)}... | Escala: ${escala?.codigo || 'N/A'} | Par: ${item.pairId?.substring(0, 8) || 'N/A'}...`);
      });
      console.log('');
    });
  }

  // Analizar pares
  const pares = new Map<string, typeof reactivos>();
  for (const r of reactivos || []) {
    if (!pares.has(r.pairId)) {
      pares.set(r.pairId, []);
    }
    pares.get(r.pairId)!.push(r);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 ESTADÍSTICAS DE PARES');
  console.log('='.repeat(80));
  console.log(`Total pares únicos: ${pares.size}`);
  console.log(`Pares esperados: 168`);
  console.log(`Pares excedentes: ${pares.size - 168}`);

  // Contar por tamaño de par
  const porTamaño = new Map<number, number>();
  for (const [, items] of pares.entries()) {
    const tamaño = items.length;
    porTamaño.set(tamaño, (porTamaño.get(tamaño) || 0) + 1);
  }

  console.log('\n📊 Distribución por tamaño de par:');
  Array.from(porTamaño.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([tamaño, count]) => {
      console.log(`  Pares con ${tamaño} reactivo(s): ${count}`);
    });

  // Analizar por escala
  const porEscala = new Map<string, number>();
  for (const r of reactivos || []) {
    const escala = Array.isArray(r.Escala) ? r.Escala[0] : r.Escala;
    const codigo = escala?.codigo || 'SIN_ESCALA';
    porEscala.set(codigo, (porEscala.get(codigo) || 0) + 1);
  }

  console.log('\n📊 Reactivos por escala:');
  Array.from(porEscala.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([escala, count]) => {
      console.log(`  ${escala}: ${count} reactivos`);
    });

  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMENDACIONES');
  console.log('='.repeat(80));
  console.log('1. Hay datos duplicados en la base de datos');
  console.log('2. Se recomienda limpiar y reimportar desde el Excel original');
  console.log('3. El sistema espera exactamente 168 pares (336 reactivos POS)');
  console.log(`4. Actualmente hay ${pares.size} pares (${reactivos?.length || 0} reactivos POS)`);
}

main();