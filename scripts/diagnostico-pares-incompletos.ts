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

const paresIncompletos = [
  '9d524676-ef9c-4ab2-8ba4-dea6a7814656',
  '3cf881dc-d289-4bec-a8e8-51b933d701c9',
  'aeaba5a4-e4e0-4eff-833d-c77cb1e7126e',
  'd204b937-5dfd-4a66-a2d1-3b13875d63ed',
  '877eaf25-9eb6-48b5-818f-253df12b0299',
  '9cf60102-5f30-4925-ab87-17c913e1d00d',
  'b11919ed-a53d-4845-a3a2-348a715a9979',
  'ace41291-21e0-42a6-b22a-e01705e26f08',
  'e4968714-5bc7-478b-aa87-7ac7130af7d4',
  'c1cea122-5a83-4867-bc25-0c0c5e71badd',
  '27429c0d-c0fb-4a18-a91d-084ffe5b45d7',
  '57eed60a-47e6-41bb-9088-7bbe7574f84f',
  '8b6f0890-b280-42ad-adc7-736b60d499e0',
  'f3cb495b-2634-404e-8ff3-808d1f656e9b',
  '64fbeae2-c4bd-4098-bb65-dda92b2cb929',
  '8f903bb2-c0a7-46f7-bbc1-2459872cae8b'
];

async function main() {
  console.log('🔍 DIAGNÓSTICO DETALLADO DE PARES INCOMPLETOS\n');
  console.log(`Total de pares a analizar: ${paresIncompletos.length}\n`);

  for (let i = 0; i < paresIncompletos.length; i++) {
    const pairId = paresIncompletos[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Par ${i + 1}/${paresIncompletos.length}: ${pairId}`);
    console.log('='.repeat(80));

    const { data: reactivos, error } = await supabase
      .from('Reactivo')
      .select('id, texto, tipo, pairId, ordenEnPar, escalaId, Escala:escalaId(codigo, nombre)')
      .eq('pairId', pairId)
      .order('ordenEnPar');

    if (error) {
      console.error('❌ Error:', error);
      continue;
    }

    console.log(`\n📊 Reactivos encontrados: ${reactivos?.length || 0}`);

    if (reactivos && reactivos.length > 0) {
      reactivos.forEach((r: any) => {
        console.log(`\n  Reactivo ID: ${r.id}`);
        console.log(`    - Tipo: ${r.tipo}`);
        console.log(`    - Orden en par: ${r.ordenEnPar}`);
        console.log(`    - Escala: ${r.Escala?.codigo || 'SIN ESCALA'} (${r.Escala?.nombre || 'N/A'})`);
        console.log(`    - Texto: ${r.texto.substring(0, 60)}...`);
      });

      console.log('\n⚠️  ANÁLISIS:');
      const tieneOrden1 = reactivos.some((r: any) => r.ordenEnPar === 1);
      const tieneOrden2 = reactivos.some((r: any) => r.ordenEnPar === 2);
      
      if (!tieneOrden1) console.log('  ❌ Falta reactivo con ordenEnPar = 1');
      if (!tieneOrden2) console.log('  ❌ Falta reactivo con ordenEnPar = 2');
    } else {
      console.log('  ⚠️  No se encontraron reactivos para este par');
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('RESUMEN: REACTIVOS SIN PAR ASIGNADO');
  console.log('='.repeat(80));

  const { data: sinPar, error: errorSinPar } = await supabase
    .from('Reactivo')
    .select('id, texto, tipo, escalaId, Escala:escalaId(codigo, nombre)')
    .is('pairId', null)
    .order('id');

  if (errorSinPar) {
    console.error('❌ Error:', errorSinPar);
  } else if (sinPar && sinPar.length > 0) {
    console.log(`\n📊 Total reactivos sin par: ${sinPar.length}\n`);
    
    const porTipo = sinPar.reduce((acc: any, r: any) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {});

    console.log('Por tipo:');
    Object.entries(porTipo).forEach(([tipo, count]) => {
      console.log(`  - ${tipo}: ${count}`);
    });

    console.log('\nPrimeros 20 reactivos sin par:');
    sinPar.slice(0, 20).forEach((r: any) => {
      console.log(`  ID: ${r.id} [${r.tipo}] - Escala: ${r.Escala?.codigo || 'SIN ESCALA'}`);
      console.log(`    ${r.texto.substring(0, 60)}...`);
    });
  } else {
    console.log('\n✅ No hay reactivos sin par asignado');
  }
}

main();