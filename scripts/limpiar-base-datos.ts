/**
 * Script para limpiar la base de datos
 * 
 * Este script elimina todos los datos de:
 * - Reactivos
 * - Escalas
 * - Competencias
 * - Normas
 * - Relaciones CompetenciaEscala
 * 
 * ADVERTENCIA: Esta operación es irreversible
 * 
 * Uso:
 * npx tsx scripts/limpiar-base-datos.ts --confirmar
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// CARGAR VARIABLES DE ENTORNO
// ============================================

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

// ============================================
// CONFIGURACIÓN
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar si se pasó el flag --confirmar
const confirmarAutomatico = process.argv.includes('--confirmar');

// ============================================
// FUNCIONES DE LIMPIEZA
// ============================================

async function contarRegistros() {
  console.log('\n📊 Contando registros actuales...\n');

  const tablas = [
    'Reactivo',
    'Escala',
    'Competencia',
    'NormaDecil',
    'CompetenciaEscala'
  ];

  const conteos: Record<string, number> = {};

  for (const tabla of tablas) {
    const { count, error } = await supabase
      .from(tabla)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ Error al contar ${tabla}:`, error.message);
      conteos[tabla] = 0;
    } else {
      conteos[tabla] = count || 0;
      console.log(`  ${tabla}: ${count || 0} registros`);
    }
  }

  return conteos;
}

async function limpiarReactivos() {
  console.log('\n🗑️  Eliminando reactivos...');
  
  const { error } = await supabase
    .from('Reactivo')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✓ Reactivos eliminados');
  return true;
}

async function limpiarNormas() {
  console.log('\n🗑️  Eliminando normas...');
  
  const { error } = await supabase
    .from('NormaDecil')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✓ Normas eliminadas');
  return true;
}

async function limpiarRelaciones() {
  console.log('\n🗑️  Eliminando relaciones Competencia-Escala...');
  
  const { error } = await supabase
    .from('CompetenciaEscala')
    .delete()
    .neq('competenciaId', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✓ Relaciones eliminadas');
  return true;
}

async function limpiarEscalas() {
  console.log('\n🗑️  Eliminando escalas...');
  
  const { error } = await supabase
    .from('Escala')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✓ Escalas eliminadas');
  return true;
}

async function limpiarCompetencias() {
  console.log('\n🗑️  Eliminando competencias...');
  
  const { error } = await supabase
    .from('Competencia')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✓ Competencias eliminadas');
  return true;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🗑️  LIMPIEZA DE BASE DE DATOS');
  console.log('='.repeat(60));
  console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de:');
  console.log('  - Reactivos');
  console.log('  - Escalas');
  console.log('  - Competencias');
  console.log('  - Normas Decílicas');
  console.log('  - Relaciones Competencia-Escala');
  console.log('\n⚠️  Esta operación es IRREVERSIBLE\n');

  // Contar registros actuales
  const conteosAntes = await contarRegistros();
  const totalRegistros = Object.values(conteosAntes).reduce((a, b) => a + b, 0);

  if (totalRegistros === 0) {
    console.log('\n✓ La base de datos ya está vacía. No hay nada que limpiar.');
    return;
  }

  console.log(`\n📊 Total de registros a eliminar: ${totalRegistros}`);

  // Verificar confirmación
  if (!confirmarAutomatico) {
    console.log('\n❌ Para ejecutar la limpieza, usa el flag --confirmar:');
    console.log('   npx tsx scripts/limpiar-base-datos.ts --confirmar');
    return;
  }

  console.log('\n🚀 Iniciando limpieza...');
  console.log('='.repeat(60));

  try {
    // Orden de eliminación (respetando dependencias)
    // 1. Primero eliminar reactivos (dependen de escalas)
    await limpiarReactivos();
    
    // 2. Eliminar normas (dependen de escalas)
    await limpiarNormas();
    
    // 3. Eliminar relaciones (dependen de competencias y escalas)
    await limpiarRelaciones();
    
    // 4. Eliminar escalas
    await limpiarEscalas();
    
    // 5. Finalmente eliminar competencias
    await limpiarCompetencias();

    console.log('\n' + '='.repeat(60));
    console.log('✅ LIMPIEZA COMPLETADA');
    console.log('='.repeat(60));

    // Verificar que todo se eliminó
    const conteosDespues = await contarRegistros();
    const totalDespues = Object.values(conteosDespues).reduce((a, b) => a + b, 0);

    if (totalDespues === 0) {
      console.log('\n✓ Todos los registros fueron eliminados correctamente');
      console.log('\n💡 Ahora puedes ejecutar el script de importación:');
      console.log('   npx tsx scripts/import-reactivos-xlsx.ts');
    } else {
      console.log('\n⚠️  Algunos registros no pudieron ser eliminados:');
      Object.entries(conteosDespues).forEach(([tabla, count]) => {
        if (count > 0) {
          console.log(`  - ${tabla}: ${count} registros restantes`);
        }
      });
    }

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA LIMPIEZA:');
    console.error(error);
    process.exit(1);
  }
}

main();