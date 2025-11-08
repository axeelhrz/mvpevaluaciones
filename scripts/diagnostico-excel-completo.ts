/**
 * Script de diagnóstico completo del Excel y la base de datos
 * Analiza la estructura del Excel y compara con lo que está en la BD
 */

import * as XLSX from 'xlsx';
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ARCHIVO_EXCEL = 'Reactivos.xlsx';

// ============================================
// FUNCIONES DE LECTURA DEL EXCEL
// ============================================

function leerExcel(filePath: string) {
  console.log(`📖 Leyendo archivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  console.log(`✓ Archivo leído. Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
  
  return workbook;
}

function analizarHojaScoring(workbook: XLSX.WorkBook) {
  const sheetName = 'Scoring';
  
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`⚠️  No se encontró la hoja "${sheetName}"`);
    return { competencias: [], escalas: [] };
  }

  console.log(`\n📊 Analizando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  const competencias: any[] = [];
  const escalas: any[] = [];
  
  console.log(`\n📋 Primeras 20 filas de la hoja Scoring:`);
  console.log('─'.repeat(120));
  
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    const tipo = String(row[0] || '').trim();
    const nombre = String(row[1] || '').trim();
    const composicion = String(row[2] || '').trim();
    const nombreVisualizacion = String(row[4] || nombre).trim();
    
    console.log(`Fila ${i}: [${tipo}] [${nombre}] [${composicion}] [${nombreVisualizacion}]`);
    
    if (tipo.toLowerCase().includes('competencia') || tipo.toLowerCase().includes('potencial')) {
      competencias.push({
        fila: i,
        tipo,
        nombre,
        nombreVisualizacion,
        composicion
      });
    } else if (tipo.toLowerCase().includes('escala')) {
      escalas.push({
        fila: i,
        tipo,
        nombre,
        nombreVisualizacion
      });
    }
  }

  console.log('─'.repeat(120));
  console.log(`\n✓ Competencias encontradas: ${competencias.length}`);
  console.log(`✓ Escalas encontradas: ${escalas.length}`);
  
  return { competencias, escalas };
}

async function analizarBaseDatos() {
  console.log('\n\n📊 ANALIZANDO BASE DE DATOS');
  console.log('═'.repeat(120));
  
  // Obtener escalas
  const { data: escalas } = await supabase
    .from('Escala')
    .select('id, codigo, nombre')
    .order('codigo');

  console.log(`\n📋 Escalas en BD: ${escalas?.length || 0}`);
  if (escalas && escalas.length > 0) {
    console.log('Primeras 20 escalas:');
    for (let i = 0; i < Math.min(20, escalas.length); i++) {
      const e = escalas[i];
      console.log(`  ${i + 1}. ${e.codigo} -> ${e.nombre}`);
    }
  }

  // Obtener competencias
  const { data: competencias } = await supabase
    .from('Competencia')
    .select('id, codigo, nombre, tipo')
    .order('codigo');

  console.log(`\n📋 Competencias en BD: ${competencias?.length || 0}`);
  if (competencias && competencias.length > 0) {
    console.log('Primeras 20 competencias:');
    for (let i = 0; i < Math.min(20, competencias.length); i++) {
      const c = competencias[i];
      console.log(`  ${i + 1}. ${c.codigo} (${c.tipo}) -> ${c.nombre}`);
    }
  }

  // Obtener relaciones
  const { data: relaciones } = await supabase
    .from('CompetenciaEscala')
    .select('competenciaId, escalaId')
    .limit(10);

  console.log(`\n📋 Relaciones CompetenciaEscala: ${relaciones?.length || 0}`);

  // Obtener reactivos
  const { data: reactivos, count: reactivoCount } = await supabase
    .from('Reactivo')
    .select('id, escalaId', { count: 'exact' })
    .limit(1);

  console.log(`\n📋 Total de reactivos en BD: ${reactivoCount || 0}`);

  // Obtener resultados
  const { data: resultados, count: resultadoCount } = await supabase
    .from('Resultado')
    .select('id', { count: 'exact' })
    .limit(1);

  console.log(`📋 Total de resultados en BD: ${resultadoCount || 0}`);

  // Obtener normas
  const { data: normas, count: normaCount } = await supabase
    .from('NormaDecil')
    .select('id', { count: 'exact' })
    .limit(1);

  console.log(`📋 Total de normas en BD: ${normaCount || 0}`);

  return { escalas, competencias, relaciones };
}

async function analizarResultados() {
  console.log('\n\n📊 ANALIZANDO RESULTADOS');
  console.log('═'.repeat(120));

  // Obtener un resultado de ejemplo
  const { data: resultados } = await supabase
    .from('Resultado')
    .select('id, evaluadoId, puntajesNaturales, puntajesDeciles')
    .limit(1);

  if (!resultados || resultados.length === 0) {
    console.log('⚠️  No hay resultados en la base de datos');
    return;
  }

  const resultado = resultados[0];
  console.log(`\n📋 Resultado de ejemplo (ID: ${resultado.id})`);
  console.log(`Evaluado: ${resultado.evaluadoId}`);
  
  console.log('\n📊 Puntajes Naturales:');
  if (resultado.puntajesNaturales) {
    const keys = Object.keys(resultado.puntajesNaturales).slice(0, 20);
    for (const key of keys) {
      console.log(`  ${key}: ${resultado.puntajesNaturales[key]}`);
    }
    if (Object.keys(resultado.puntajesNaturales).length > 20) {
      console.log(`  ... y ${Object.keys(resultado.puntajesNaturales).length - 20} más`);
    }
  }

  console.log('\n📊 Puntajes Deciles:');
  if (resultado.puntajesDeciles) {
    const keys = Object.keys(resultado.puntajesDeciles).slice(0, 20);
    for (const key of keys) {
      console.log(`  ${key}: ${resultado.puntajesDeciles[key]}`);
    }
    if (Object.keys(resultado.puntajesDeciles).length > 20) {
      console.log(`  ... y ${Object.keys(resultado.puntajesDeciles).length - 20} más`);
    }
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 DIAGNÓSTICO COMPLETO DEL SISTEMA\n');
  console.log('═'.repeat(120));

  try {
    // Analizar Excel
    console.log('\n📖 ANALIZANDO ARCHIVO EXCEL');
    console.log('═'.repeat(120));
    
    const workbook = leerExcel(ARCHIVO_EXCEL);
    const { competencias: compExcel, escalas: escalasExcel } = analizarHojaScoring(workbook);

    // Analizar BD
    await analizarBaseDatos();

    // Analizar resultados
    await analizarResultados();

    console.log('\n\n' + '═'.repeat(120));
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('═'.repeat(120) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL DIAGNÓSTICO:');
    console.error(error);
    process.exit(1);
  }
}

main();