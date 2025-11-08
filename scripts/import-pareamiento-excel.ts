/**
 * Script de importación de datos desde Excel para el sistema de pareamiento forzado
 * 
 * Este script importa:
 * - 391 reactivos (168 positivos + 168 negativos + 55 neutrales)
 * - 48 escalas
 * - 33 competencias
 * - Normas y percentiles
 * 
 * Uso:
 * npx tsx scripts/import-pareamiento-excel.ts <archivo.xlsx>
 */

import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

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

// ============================================
// TIPOS E INTERFACES
// ============================================

interface ReactivoExcel {
  id?: number;
  codigo: string;
  texto: string;
  tipo: 'POSITIVO' | 'NEGATIVO' | 'NEUTRAL';
  escala: string;
  seccion?: string;
  ordenGlobal: number;
  activo: boolean;
}

interface EscalaExcel {
  codigo: string;
  nombre: string;
  descripcion?: string;
  competencia: string;
  tipo: 'POSITIVO' | 'NEGATIVO' | 'NEUTRAL';
  ordenVisualizacion?: number;
}

interface CompetenciaExcel {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  ordenVisualizacion?: number;
}

interface NormaExcel {
  escala: string;
  percentil: number;
  puntuacionDirecta: number;
  puntuacionT: number;
  interpretacion?: string;
}

// ============================================
// FUNCIONES DE LECTURA DE EXCEL
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

interface ExcelRow {
  [key: string]: string | number | boolean | null | undefined;
}

function extraerReactivos(workbook: XLSX.WorkBook): ReactivoExcel[] {
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('reactivo') || 
    name.toLowerCase().includes('items') ||
    name.toLowerCase().includes('preguntas')
  );

  if (!sheetName) {
    throw new Error('No se encontró la hoja de reactivos. Hojas disponibles: ' + workbook.SheetNames.join(', '));
  }

  console.log(`📋 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

  const reactivos: ReactivoExcel[] = data.map((row: ExcelRow, index) => {
    // Intentar diferentes nombres de columnas
    const codigo = row['Código'] || row['Codigo'] || row['ID'] || row['codigo'] || `R${index + 1}`;
    const texto = row['Texto'] || row['Reactivo'] || row['Pregunta'] || row['texto'] || row['Item'];
    const tipo = String(row['Tipo'] || row['tipo'] || 'NEUTRAL').toUpperCase();
    const escala = row['Escala'] || row['escala'] || row['Scale'] || '';
    const seccion = row['Sección'] || row['Seccion'] || row['seccion'] || null;
    const ordenGlobal = row['Orden'] || row['orden'] || row['OrdenGlobal'] || (index + 1);
    const activo = row['Activo'] !== undefined ? row['Activo'] : true;

    const textoStr = typeof texto === 'string' ? texto.trim() : String(texto || '').trim();
    if (!textoStr) {
      console.warn(`⚠️  Fila ${index + 1}: Texto vacío, se omitirá`);
      return null;
    }
    const escalaStr = String(escala || '').trim();
    const seccionStr = seccion ? String(seccion).trim() : undefined;

    return {
      codigo,
      texto: textoStr,
      tipo: tipo as 'POSITIVO' | 'NEGATIVO' | 'NEUTRAL',
      escala: escalaStr,
      seccion: seccionStr,
      ordenGlobal: parseInt(String(ordenGlobal), 10),
      activo: Boolean(activo)
    };
  }).filter(Boolean) as ReactivoExcel[];

  console.log(`✓ ${reactivos.length} reactivos extraídos`);
  return reactivos;
}

function extraerEscalas(workbook: XLSX.WorkBook): EscalaExcel[] {
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('escala') || 
    name.toLowerCase().includes('scale')
  );

  if (!sheetName) {
    console.warn('⚠️  No se encontró la hoja de escalas');
    return [];
  }

  console.log(`📊 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

  const escalas: EscalaExcel[] = data.map((row: ExcelRow, index) => {
    const codigo = row['Código'] || row['Codigo'] || row['codigo'] || `E${index + 1}`;
    const nombre = row['Nombre'] || row['nombre'] || row['Name'] || '';
    const descripcion = row['Descripción'] || row['Descripcion'] || row['descripcion'] || undefined;
    const competencia = row['Competencia'] || row['competencia'] || row['Competency'] || '';
    const tipo = String(row['Tipo'] || row['tipo'] || 'NEUTRAL').toUpperCase();
    const ordenVisualizacion = row['Orden'] || row['orden'] || (index + 1);

    if (!nombre || !competencia) {
      console.warn(`⚠️  Fila ${index + 1}: Datos incompletos, se omitirá`);
      return null;
    }

    return {
      codigo: String(codigo).trim(),
      nombre: String(nombre).trim(),
      descripcion: descripcion != null ? String(descripcion).trim() : undefined,
      competencia: String(competencia).trim(),
      tipo: tipo as 'POSITIVO' | 'NEGATIVO' | 'NEUTRAL',
      ordenVisualizacion: parseInt(String(ordenVisualizacion), 10)
    };
  }).filter(Boolean) as EscalaExcel[];

  console.log(`✓ ${escalas.length} escalas extraídas`);
  return escalas;
}

function extraerCompetencias(workbook: XLSX.WorkBook): CompetenciaExcel[] {
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('competencia') || 
    name.toLowerCase().includes('competency')
  );

  if (!sheetName) {
    console.warn('⚠️  No se encontró la hoja de competencias');
    return [];
  }

  console.log(`🎯 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

  const competencias: CompetenciaExcel[] = data.map((row: ExcelRow, index) => {
    const codigo = row['Código'] || row['Codigo'] || row['codigo'] || `C${index + 1}`;
    const nombre = row['Nombre'] || row['nombre'] || row['Name'] || '';
    const descripcion = row['Descripción'] || row['Descripcion'] || row['descripcion'] || undefined;
    const categoria = row['Categoría'] || row['Categoria'] || row['categoria'] || undefined;
    const ordenVisualizacion = row['Orden'] || row['orden'] || (index + 1);

    if (!nombre) {
      console.warn(`⚠️  Fila ${index + 1}: Nombre vacío, se omitirá`);
      return null;
    }

    return {
      codigo: String(codigo).trim(),
      nombre: String(nombre).trim(),
      descripcion: descripcion ? String(descripcion).trim() : undefined,
      categoria: categoria ? String(categoria).trim() : undefined,
      ordenVisualizacion: parseInt(String(ordenVisualizacion))
    };
  }).filter(Boolean) as CompetenciaExcel[];

  console.log(`✓ ${competencias.length} competencias extraídas`);
  return competencias;
}

function extraerNormas(workbook: XLSX.WorkBook): NormaExcel[] {
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('norma') || 
    name.toLowerCase().includes('percentil') ||
    name.toLowerCase().includes('baremo')
  );

  if (!sheetName) {
    console.warn('⚠️  No se encontró la hoja de normas');
    return [];
  }

  console.log(`📈 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as ExcelRow[];

  const normas: NormaExcel[] = data.map((row: ExcelRow) => {
    const escala = row['Escala'] || row['escala'] || '';
    const percentil = row['Percentil'] || row['percentil'] || 0;
    const puntuacionDirecta = row['PuntuacionDirecta'] || row['Puntuacion'] || row['puntuacion'] || 0;
    const puntuacionT = row['PuntuacionT'] || row['T'] || row['t'] || 0;
    const interpretacion = row['Interpretación'] || row['Interpretacion'] || row['interpretacion'] || undefined;

    const escalaStr = String(escala || '').trim();
    const percentilNum = parseInt(String(percentil), 10);
    const puntuacionDirectaNum = parseFloat(String(puntuacionDirecta));
    const puntuacionTNum = parseFloat(String(puntuacionT));
    const interpretacionStr = interpretacion != null ? String(interpretacion).trim() : undefined;

    if (!escalaStr || Number.isNaN(percentilNum)) {
      return null;
    }

    return {
      escala: escalaStr,
      percentil: percentilNum,
      puntuacionDirecta: puntuacionDirectaNum,
      puntuacionT: puntuacionTNum,
      interpretacion: interpretacionStr
    };
  }).filter(Boolean) as NormaExcel[];

  console.log(`✓ ${normas.length} normas extraídas`);
  return normas;
}

// ============================================
// FUNCIONES DE IMPORTACIÓN A SUPABASE
// ============================================

async function importarCompetencias(competencias: CompetenciaExcel[]) {
  console.log('\n🎯 Importando competencias...');
  
  const { data, error } = await supabase
    .from('Competencia')
    .upsert(
      competencias.map(c => ({
        codigo: c.codigo,
        nombre: c.nombre,
        descripcion: c.descripcion,
        categoria: c.categoria,
        ordenVisualizacion: c.ordenVisualizacion
      })),
      { onConflict: 'codigo' }
    )
    .select();

  if (error) {
    console.error('❌ Error al importar competencias:', error);
    throw error;
  }

  console.log(`✓ ${data.length} competencias importadas`);
  return data;
}

async function importarEscalas(escalas: EscalaExcel[], competenciasMap: Map<string, number>) {
  console.log('\n📊 Importando escalas...');
  
  const escalasConCompetencia = escalas.map(e => {
    const competenciaId = competenciasMap.get(e.competencia);
    
    if (!competenciaId) {
      console.warn(`⚠️  Competencia no encontrada para escala ${e.codigo}: ${e.competencia}`);
      return null;
    }

    return {
      codigo: e.codigo,
      nombre: e.nombre,
      descripcion: e.descripcion,
      competenciaId,
      tipo: e.tipo,
      ordenVisualizacion: e.ordenVisualizacion
    };
  }).filter(Boolean);

  const { data, error } = await supabase
    .from('Escala')
    .upsert(escalasConCompetencia, { onConflict: 'codigo' })
    .select();

  if (error) {
    console.error('❌ Error al importar escalas:', error);
    throw error;
  }

  console.log(`✓ ${data.length} escalas importadas`);
  return data;
}

async function importarReactivos(reactivos: ReactivoExcel[], escalasMap: Map<string, number>) {
  console.log('\n📋 Importando reactivos...');
  
  const reactivosConEscala = reactivos.map(r => {
    const escalaId = escalasMap.get(r.escala);
    
    if (!escalaId) {
      console.warn(`⚠️  Escala no encontrada para reactivo ${r.codigo}: ${r.escala}`);
      return null;
    }

    return {
      codigo: r.codigo,
      texto: r.texto,
      tipo: r.tipo,
      escalaId,
      seccion: r.seccion,
      ordenGlobal: r.ordenGlobal,
      activo: r.activo
    };
  }).filter(Boolean);

  // Importar en lotes de 100
  const batchSize = 100;
  let totalImportados = 0;

  for (let i = 0; i < reactivosConEscala.length; i += batchSize) {
    const batch = reactivosConEscala.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('Reactivo')
      .upsert(batch, { onConflict: 'codigo' })
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

async function importarNormas(normas: NormaExcel[], escalasMap: Map<string, number>) {
  console.log('\n📈 Importando normas...');
  
  // Primero, crear una versión de norma
  const { data: version, error: versionError } = await supabase
    .from('VersionNorma')
    .insert({
      nombre: `Norma ${new Date().toISOString().split('T')[0]}`,
      descripcion: 'Importada desde Excel',
      activa: true
    })
    .select()
    .single();

  if (versionError) {
    console.error('❌ Error al crear versión de norma:', versionError);
    throw versionError;
  }

  console.log(`✓ Versión de norma creada: ${version.nombre}`);

  // Importar normas
  const normasConEscala = normas.map(n => {
    const escalaId = escalasMap.get(n.escala);
    
    if (!escalaId) {
      console.warn(`⚠️  Escala no encontrada para norma: ${n.escala}`);
      return null;
    }

    return {
      versionNormaId: version.id,
      escalaId,
      percentil: n.percentil,
      puntuacionDirecta: n.puntuacionDirecta,
      puntuacionT: n.puntuacionT,
      interpretacion: n.interpretacion
    };
  }).filter(Boolean);

  // Importar en lotes
  const batchSize = 100;
  let totalImportadas = 0;

  for (let i = 0; i < normasConEscala.length; i += batchSize) {
    const batch = normasConEscala.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('Norma')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error al importar lote ${i / batchSize + 1}:`, error);
      throw error;
    }

    totalImportadas += data.length;
    console.log(`  ✓ Lote ${i / batchSize + 1}: ${data.length} normas`);
  }

  console.log(`✓ ${totalImportadas} normas importadas en total`);
  return totalImportadas;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Iniciando importación de datos desde Excel\n');
  console.log('='.repeat(60));

  // Validar argumentos
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ Error: Debes proporcionar la ruta del archivo Excel');
    console.log('\nUso: npx tsx scripts/import-pareamiento-excel.ts <archivo.xlsx>');
    process.exit(1);
  }

  try {
    // 1. Leer Excel
    const workbook = leerExcel(filePath);

    // 2. Extraer datos
    console.log('\n📦 Extrayendo datos del Excel...');
    const competencias = extraerCompetencias(workbook);
    const escalas = extraerEscalas(workbook);
    const reactivos = extraerReactivos(workbook);
    const normas = extraerNormas(workbook);

    console.log('\n📊 Resumen de datos extraídos:');
    console.log(`  - Competencias: ${competencias.length}`);
    console.log(`  - Escalas: ${escalas.length}`);
    console.log(`  - Reactivos: ${reactivos.length}`);
    console.log(`  - Normas: ${normas.length}`);

    // Confirmar importación
    console.log('\n⚠️  ¿Deseas continuar con la importación? (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Importar a Supabase
    console.log('\n💾 Importando a Supabase...');
    console.log('='.repeat(60));

    // Importar competencias
    const competenciasImportadas = await importarCompetencias(competencias);
    const competenciasMap = new Map(
      competenciasImportadas.map(c => [c.codigo, c.id])
    );

    // Importar escalas
    const escalasImportadas = await importarEscalas(escalas, competenciasMap);
    const escalasMap = new Map(
      escalasImportadas.map(e => [e.codigo, e.id])
    );

    // Importar reactivos
    await importarReactivos(reactivos, escalasMap);

    // Importar normas (opcional)
    if (normas.length > 0) {
      await importarNormas(normas, escalasMap);
    }

    // 4. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`  ✓ ${competenciasImportadas.length} competencias`);
    console.log(`  ✓ ${escalasImportadas.length} escalas`);
    console.log(`  ✓ ${reactivos.length} reactivos`);
    if (normas.length > 0) {
      console.log(`  ✓ ${normas.length} normas`);
    }
    console.log('\n🎉 ¡Datos importados correctamente!\n');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA IMPORTACIÓN:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();
