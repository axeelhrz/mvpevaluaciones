/**
 * Script de diagnóstico profundo para entender la estructura de reactivos
 * Analiza qué representan los códigos como E314, E59, E76, etc.
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

function analizarHojaReactivos(workbook: XLSX.WorkBook) {
  const sheetName = 'Reactivos Test';
  
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`⚠️  No se encontró la hoja "${sheetName}"`);
    return [];
  }

  console.log(`\n📊 Analizando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  console.log(`\n📋 Primeras 50 filas de reactivos:`);
  console.log('─'.repeat(150));
  console.log('Fila | IdOrd | ItemPareado | Reactivo (primeros 50 chars) | Tipo | Puntaje | Test | Escala');
  console.log('─'.repeat(150));
  
  const reactivos: any[] = [];
  
  for (let i = 1; i < Math.min(51, data.length); i++) {
    const row = data[i];
    
    const idOrd = row[1];
    const itemPareado = row[2];
    const reactivo = row[3];
    const tipo = row[4];
    const puntajeFijo = row[5];
    const test = row[6];
    const escala = row[7];

    if (!idOrd || !reactivo) continue;

    const reactivoCorto = String(reactivo).substring(0, 50).replace(/\n/g, ' ');
    console.log(`${i.toString().padEnd(4)} | ${String(idOrd).padEnd(6)} | ${String(itemPareado).padEnd(11)} | ${reactivoCorto.padEnd(50)} | ${String(tipo).padEnd(4)} | ${String(puntajeFijo).padEnd(7)} | ${String(test).padEnd(20)} | ${String(escala).padEnd(30)}`);
    
    reactivos.push({
      fila: i,
      idOrd,
      itemPareado,
      reactivo,
      tipo,
      puntajeFijo,
      test,
      escala
    });
  }

  console.log('─'.repeat(150));
  console.log(`\n✓ Total de reactivos en hoja: ${data.length - 1}`);
  
  return reactivos;
}

async function analizarBaseDatos() {
  console.log('\n\n📊 ANALIZANDO BASE DE DATOS');
  console.log('═'.repeat(150));
  
  // Obtener reactivos
  const { data: reactivos } = await supabase
    .from('Reactivo')
    .select('id, texto, tipo, escalaId, ordenGlobal, pairId, ordenEnPar')
    .order('ordenGlobal')
    .limit(50);

  console.log(`\n📋 Primeros 50 reactivos en BD:`);
  console.log('─'.repeat(150));
  console.log('ID | Texto (primeros 50 chars) | Tipo | EscalaId | OrdenGlobal | PairId | OrdenEnPar');
  console.log('─'.repeat(150));
  
  if (reactivos && reactivos.length > 0) {
    for (let i = 0; i < Math.min(50, reactivos.length); i++) {
      const r = reactivos[i];
      const textoCorto = r.texto.substring(0, 50).replace(/\n/g, ' ');
      console.log(`${i.toString().padEnd(2)} | ${textoCorto.padEnd(50)} | ${String(r.tipo).padEnd(4)} | ${String(r.escalaId).padEnd(8)} | ${String(r.ordenGlobal).padEnd(11)} | ${String(r.pairId).substring(0, 8).padEnd(6)} | ${String(r.ordenEnPar).padEnd(9)}`);
    }
  }

  console.log('─'.repeat(150));
  console.log(`\n✓ Total de reactivos en BD: ${reactivos?.length || 0}`);
}

async function analizarResultados() {
  console.log('\n\n📊 ANALIZANDO ESTRUCTURA DE RESULTADOS');
  console.log('═'.repeat(150));

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
  
  console.log('\n📊 Estructura de Puntajes Naturales:');
  console.log('─'.repeat(150));
  
  if (resultado.puntajesNaturales && typeof resultado.puntajesNaturales === 'object') {
    const keys = Object.keys(resultado.puntajesNaturales);
    console.log(`Total de claves: ${keys.length}`);
    console.log('\nPrimeras 30 claves:');
    
    for (let i = 0; i < Math.min(30, keys.length); i++) {
      const key = keys[i];
      const valor = resultado.puntajesNaturales[key];
      console.log(`  ${i + 1}. "${key}" = ${valor}`);
    }
    
    if (keys.length > 30) {
      console.log(`  ... y ${keys.length - 30} más`);
    }
  }

  console.log('\n📊 Estructura de Puntajes Deciles:');
  console.log('─'.repeat(150));
  
  if (resultado.puntajesDeciles && typeof resultado.puntajesDeciles === 'object') {
    const keys = Object.keys(resultado.puntajesDeciles);
    console.log(`Total de claves: ${keys.length}`);
    console.log('\nPrimeras 30 claves:');
    
    for (let i = 0; i < Math.min(30, keys.length); i++) {
      const key = keys[i];
      const valor = resultado.puntajesDeciles[key];
      console.log(`  ${i + 1}. "${key}" = ${valor}`);
    }
    
    if (keys.length > 30) {
      console.log(`  ... y ${keys.length - 30} más`);
    }
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🔍 DIAGNÓSTICO PROFUNDO DE REACTIVOS\n');
  console.log('═'.repeat(150));

  try {
    // Analizar Excel
    console.log('\n📖 ANALIZANDO ARCHIVO EXCEL');
    console.log('═'.repeat(150));
    
    const workbook = leerExcel(ARCHIVO_EXCEL);
    const reactivosExcel = analizarHojaReactivos(workbook);

    // Analizar BD
    await analizarBaseDatos();

    // Analizar resultados
    await analizarResultados();

    console.log('\n\n' + '═'.repeat(150));
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('═'.repeat(150) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL DIAGNÓSTICO:');
    console.error(error);
    process.exit(1);
  }
}

main();