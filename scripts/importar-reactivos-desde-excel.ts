/**
 * Script simplificado para importar reactivos desde Reactivos.xlsx
 * 
 * Este script importa los reactivos con estructura de pares
 * y asigna una escala genérica que luego puede ser actualizada.
 * 
 * Uso:
 * npx tsx scripts/importar-reactivos-desde-excel.ts
 */

import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ARCHIVO_EXCEL = 'Reactivos.xlsx';

// ============================================
// FUNCIONES
// ============================================

interface ReactivoExcel {
  idOrd: number;
  itemPareado: string;
  reactivo: string;
  tipo: string;
  puntajeFijo: number;
  test: string;
  escala: string;
}

function leerReactivosDesdeExcel(): ReactivoExcel[] {
  console.log(`📖 Leyendo archivo: ${ARCHIVO_EXCEL}`);
  
  if (!fs.existsSync(ARCHIVO_EXCEL)) {
    throw new Error(`Archivo no encontrado: ${ARCHIVO_EXCEL}`);
  }

  const workbook = XLSX.readFile(ARCHIVO_EXCEL);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  console.log(`✓ ${data.length} reactivos encontrados en el Excel`);

  const reactivos: ReactivoExcel[] = data.map(row => ({
    idOrd: parseInt(String(row.idOrd || row.IdOrd || 0)),
    itemPareado: String(row.itemPareado || row.ItemPareado || ''),
    reactivo: String(row.reactivo || row.Reactivo || '').trim(),
    tipo: String(row.tipo || row.Tipo || 'NEUTRAL').toUpperCase(),
    puntajeFijo: parseFloat(String(row.puntajeFijo || row.PuntajeFijo || 0)),
    test: String(row.test || row.Test || ''),
    escala: String(row.escala || row.Escala || 'SIN_CLASIFICAR')
  }));

  return reactivos;
}

async function crearEscalaGenerica() {
  console.log('\n📊 Verificando escala genérica...');
  
  const { data: escalaExistente } = await supabase
    .from('Escala')
    .select('id')
    .eq('codigo', 'ESCALA_GENERICA')
    .single();

  if (escalaExistente) {
    console.log('✓ Escala genérica ya existe');
    return escalaExistente.id;
  }

  const { data: nuevaEscala, error } = await supabase
    .from('Escala')
    .insert({
      codigo: 'ESCALA_GENERICA',
      nombre: 'Escala Genérica (Temporal)'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error al crear escala genérica:', error);
    throw error;
  }

  console.log('✓ Escala genérica creada');
  return nuevaEscala.id;
}

async function limpiarReactivosExistentes() {
  console.log('\n🗑️  Limpiando reactivos existentes...');
  
  const { error } = await supabase
    .from('Reactivo')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (error) {
    console.error('❌ Error al limpiar reactivos:', error);
    throw error;
  }

  console.log('✓ Reactivos existentes eliminados');
}

async function importarReactivos(reactivos: ReactivoExcel[], escalaGenericaId: string) {
  console.log('\n📋 Importando reactivos...');
  
  // Agrupar por pares
  const pares = new Map<string, ReactivoExcel[]>();
  for (const reactivo of reactivos) {
    if (!pares.has(reactivo.itemPareado)) {
      pares.set(reactivo.itemPareado, []);
    }
    pares.get(reactivo.itemPareado)!.push(reactivo);
  }

  console.log(`📦 Total de pares: ${pares.size}`);

  // Convertir pairId de texto a UUID
  const pairIdMap = new Map<string, string>();
  for (const pairKey of pares.keys()) {
    pairIdMap.set(pairKey, uuidv4());
  }

  const reactivosParaInsertar: any[] = [];

  for (const [pairKey, reactivosDelPar] of pares.entries()) {
    // Ordenar por idOrd
    reactivosDelPar.sort((a, b) => a.idOrd - b.idOrd);
    
    const pairId = pairIdMap.get(pairKey)!;

    for (let i = 0; i < reactivosDelPar.length; i++) {
      const reactivo = reactivosDelPar[i];

      // Determinar sección basada en el tipo
      let seccion: string;
      if (reactivo.tipo === 'POS') {
        seccion = 'POSITIVOS';
      } else if (reactivo.tipo === 'NEG') {
        seccion = 'NEGATIVOS';
      } else {
        seccion = 'LIKERT';
      }

      // Determinar puntos
      const puntosSiElegido = reactivo.tipo === 'POS' ? reactivo.puntajeFijo : 0;
      const puntosSiNoElegido = reactivo.tipo === 'NEG' ? reactivo.puntajeFijo : 0;

      reactivosParaInsertar.push({
        texto: reactivo.reactivo,
        tipo: reactivo.tipo,
        escalaId: escalaGenericaId,
        seccion: seccion,
        ordenGlobal: reactivo.idOrd,
        activo: true,
        pairId: pairId,
        ordenEnPar: i + 1,
        puntosSiElegido: puntosSiElegido,
        puntosSiNoElegido: puntosSiNoElegido
      });
    }
  }

  // Importar en lotes
  const batchSize = 100;
  let totalImportados = 0;

  for (let i = 0; i < reactivosParaInsertar.length; i += batchSize) {
    const batch = reactivosParaInsertar.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('Reactivo')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error al importar lote ${i / batchSize + 1}:`, error);
      throw error;
    }

    totalImportados += data.length;
    console.log(`  ✓ Lote ${i / batchSize + 1}: ${data.length} reactivos`);
  }

  console.log(`✓ ${totalImportados} reactivos importados en total`);
  return totalImportados;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Iniciando importación de reactivos desde Excel\n');
  console.log('='.repeat(60));

  try {
    // 1. Leer reactivos del Excel
    const reactivos = leerReactivosDesdeExcel();

    // 2. Crear escala genérica
    const escalaGenericaId = await crearEscalaGenerica();

    // 3. Confirmar antes de continuar
    console.log('\n⚠️  ADVERTENCIA:');
    console.log('   - Se eliminarán todos los reactivos existentes');
    console.log(`   - Se importarán ${reactivos.length} nuevos reactivos`);
    console.log('   - Todos los reactivos usarán la escala genérica temporalmente');
    console.log('\n¿Deseas continuar? (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Limpiar reactivos existentes
    await limpiarReactivosExistentes();

    // 5. Importar nuevos reactivos
    await importarReactivos(reactivos, escalaGenericaId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`  ✓ ${reactivos.length} reactivos importados`);
    console.log(`  ✓ Todos asignados a escala genérica`);
    console.log('\n📝 Siguiente paso:');
    console.log('   Asignar las escalas correctas a cada reactivo');
    console.log('   usando el panel de administración o un script adicional.');
    console.log('\n🎉 ¡Importación completada!\n');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA IMPORTACIÓN:');
    console.error(error);
    process.exit(1);
  }
}

main();