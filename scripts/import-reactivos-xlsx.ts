/**
 * Script de importación completo del archivo Reactivos.xlsx
 * 
 * Este script importa:
 * - Reactivos desde la hoja "Reactivos Test"
 * - Escalas y Competencias desde la hoja "Scoring" (con estructura jerárquica)
 * - Normas desde la hoja "Norma"
 * 
 * Uso:
 * npx tsx scripts/import-reactivos-xlsx.ts
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
// MAPEO DE NOMBRES DE ESCALAS
// ============================================

const MAPEO_ESCALAS: Record<string, string> = {
  'Esfuerzo': 'E1',
  'Apertura a oportunidades': 'E2',
  'Autorefuerzo': 'E3',
  'Confiabilidad': 'E4',
  'Optimismo': 'E5',
  'Aprovechamiento de talentos': 'E6',
  'Percepción Interpersonal': 'E7',
  'Merecimiento': 'E8',
  'Visión Sistémica': 'E9',
  'Emprendimiento': 'E10',
  'Habilidad administrativa': 'E11',
  'Autoconfianza': 'E12',
  'Capacidad de reacción': 'E13',
  'Expectativas': 'E14',
  'Tenacidad': 'E15',
  'Alineamiento de Acciones': 'E16',
  'Autocontrol': 'E17',
  'Recuperación': 'E18',
  'Pensamiento Lógico': 'E19',
  'Sociabilidad': 'E20',
  'Resolución': 'E21',
  'Tolerancia al Conflicto': 'E22',
  'Enfoque': 'E23',
  'Sentido de contribución': 'E24',
  'Influencia': 'E25',
  'Claridad de estrategia': 'E26',
  'Rectitud': 'E27',
  'Energía': 'E28',
  'Temple': 'E29',
  'Consciencia del entorno': 'E30',
  'Superación': 'E31',
  'Adaptación': 'E32',
  'Pensamiento divergente': 'E33',
  'Perseverancia': 'E34',
  'Satisfacción': 'E35',
  'Compromiso': 'E36',
  'Anticipación': 'E37',
  'Automejoramiento': 'E38',
  'Mente Abierta': 'E39',
  'Participación': 'E40',
  'Control Percibido': 'E41',
  'Autosupervisión': 'E42',
  'Salud Financiera': 'E43',
  'Visión Clara': 'E44',
  'Expectativa Profesional': 'E45',
  'Autoconocimiento': 'E46',
  'Anteposición de intereses': 'E47',
  'Autonomía': 'E48',
  'Habilidad generación de ahorro': 'HF1',
  'Habilidad control de gasto': 'HF2',
  'Habilidad generación de ingresos': 'HF3',
  'Habilidad gestión de inversión': 'HF4',
  'Habilidad control de la deuda': 'HF5',
};

// ============================================
// TIPOS E INTERFACES
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

interface CompetenciaExcel {
  nombre: string;
  nombreVisualizacion: string;
  escalas: string[];
  seccionPDF: string;
  tipo: 'COMPETENCIA' | 'POTENCIAL';
}

interface EscalaExcel {
  nombre: string;
  nombreVisualizacion: string;
  codigo: string;
}

interface NormaExcel {
  codigo: string;
  decil: number;
  puntajeMin: number;
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

function extraerReactivos(workbook: XLSX.WorkBook): ReactivoExcel[] {
  const sheetName = 'Reactivos Test';
  
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`No se encontró la hoja "${sheetName}"`);
  }

  console.log(`\n📋 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  const reactivos: ReactivoExcel[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    const idOrd = row[1];
    const itemPareado = row[2];
    const reactivo = row[3];
    const tipo = row[4];
    const puntajeFijo = row[5];
    const test = row[6];
    const escala = row[7];

    if (!idOrd || !reactivo) continue;

    const escalaNombre = String(escala || '').trim();
    const escalaCodigo = escalaNombre ? (MAPEO_ESCALAS[escalaNombre] || escalaNombre) : 'SIN_CLASIFICAR';

    reactivos.push({
      idOrd: parseInt(String(idOrd)),
      itemPareado: String(itemPareado || ''),
      reactivo: String(reactivo).trim(),
      tipo: String(tipo || 'NEUTRAL').toUpperCase(),
      puntajeFijo: parseFloat(String(puntajeFijo || 0)),
      test: String(test || ''),
      escala: escalaCodigo
    });
  }

  console.log(`✓ ${reactivos.length} reactivos extraídos`);
  return reactivos;
}

function extraerEscalasDeReactivos(reactivos: ReactivoExcel[]): EscalaExcel[] {
  console.log('\n📊 Extrayendo escalas únicas de reactivos...');
  
  const escalasUnicas = new Map<string, string>();
  
  for (const reactivo of reactivos) {
    if (reactivo.escala && reactivo.escala !== 'SIN_CLASIFICAR') {
      escalasUnicas.set(reactivo.escala, reactivo.escala);
    }
  }
  
  const escalas: EscalaExcel[] = Array.from(escalasUnicas.keys()).map(codigo => ({
    codigo,
    nombre: codigo,
    nombreVisualizacion: codigo
  }));
  
  console.log(`✓ ${escalas.length} escalas únicas encontradas`);
  return escalas;
}

function extraerEscalasYCompetencias(workbook: XLSX.WorkBook): { 
  competencias: CompetenciaExcel[], 
  escalas: EscalaExcel[] 
} {
  const sheetName = 'Scoring';
  
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`No se encontró la hoja "${sheetName}"`);
  }

  console.log(`\n📊 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  const competencias: CompetenciaExcel[] = [];
  const escalas: EscalaExcel[] = [];
  
  let competenciaActual: CompetenciaExcel | null = null;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const tipo = String(row[0] || '').trim();
    const nombre = String(row[1] || '').trim();
    const composicion = String(row[2] || '').trim();
    const nombreVisualizacion = String(row[4] || nombre).trim();
    const seccionPDF = String(row[5] || '').trim();

    // Detectar competencia
    if (tipo.toLowerCase().includes('competencia') || tipo.toLowerCase().includes('potencial')) {
      if (competenciaActual) {
        competencias.push(competenciaActual);
      }
      
      competenciaActual = {
        nombre,
        nombreVisualizacion,
        escalas: composicion ? [composicion] : [],
        seccionPDF,
        tipo: tipo.toLowerCase().includes('potencial') ? 'POTENCIAL' : 'COMPETENCIA'
      };
    }
    // Detectar escalas adicionales de la competencia (filas con celdas vacías al inicio)
    else if (!tipo && !nombre && composicion && competenciaActual) {
      competenciaActual.escalas.push(composicion);
    }
    // Detectar escala independiente
    else if (tipo.toLowerCase().includes('escala') && nombre) {
      const codigo = MAPEO_ESCALAS[nombre] || nombre;
      escalas.push({
        nombre,
        nombreVisualizacion: nombreVisualizacion || nombre,
        codigo
      });
    }
  }
  
  if (competenciaActual) {
    competencias.push(competenciaActual);
  }

  console.log(`✓ ${competencias.length} competencias extraídas`);
  console.log(`✓ ${escalas.length} escalas extraídas de Scoring`);
  
  return { competencias, escalas };
}

function extraerNormas(workbook: XLSX.WorkBook): NormaExcel[] {
  const sheetName = 'Norma';
  
  if (!workbook.SheetNames.includes(sheetName)) {
    console.warn('⚠️  No se encontró la hoja "Norma"');
    return [];
  }

  console.log(`\n📈 Procesando hoja: ${sheetName}`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  const normas: NormaExcel[] = [];
  
  // La estructura es:
  // Fila 0: Vacío
  // Fila 1: Encabezados con nombres de escalas (cada escala ocupa 2 columnas)
  // Fila 2+: Datos donde col 0 = percentil, luego pares de (decil, puntaje) para cada escala
  
  if (data.length < 3) {
    console.warn('⚠️  La hoja Norma no tiene suficientes datos');
    return [];
  }

  // Leer encabezados (fila 1)
  const headerRow = data[1];
  const escalas: string[] = [];
  
  // Extraer nombres de escalas (están en columnas impares, empezando desde índice 1)
  for (let i = 1; i < headerRow.length; i += 2) {
    const nombreEscala = String(headerRow[i] || '').trim();
    if (nombreEscala) {
      const codigoEscala = MAPEO_ESCALAS[nombreEscala] || nombreEscala;
      escalas.push(codigoEscala);
    }
  }

  console.log(`  📊 Escalas encontradas: ${escalas.length}`);

  // Procesar filas de datos (empezando desde fila 2)
  for (let rowIdx = 2; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (!row || row.length === 0) continue;

    const percentil = row[0];
    if (percentil === undefined || percentil === null) continue;

    // Procesar cada escala (cada una ocupa 2 columnas: decil y puntaje)
    for (let escalaIdx = 0; escalaIdx < escalas.length; escalaIdx++) {
      const codigoEscala = escalas[escalaIdx];
      
      // Calcular índices de columnas para esta escala
      // Columna base = 1 + (escalaIdx * 2)
      const colDecil = 1 + (escalaIdx * 2);
      const colPuntaje = colDecil + 1;

      const decil = row[colDecil];
      const puntajeMin = row[colPuntaje];

      if (decil === undefined || puntajeMin === undefined) continue;

      const deciNum = parseInt(String(decil));
      const puntajeNum = parseFloat(String(puntajeMin));

      if (isNaN(deciNum) || isNaN(puntajeNum)) continue;

      normas.push({
        codigo: codigoEscala,
        decil: deciNum,
        puntajeMin: puntajeNum
      });
    }
  }

  console.log(`✓ ${normas.length} normas extraídas`);
  return normas;
}

// ============================================
// FUNCIONES DE IMPORTACIÓN A SUPABASE
// ============================================

async function importarCompetencias(competencias: CompetenciaExcel[]) {
  console.log('\n🎯 Importando competencias...');
  
  if (competencias.length === 0) {
    console.log('⚠️  No hay competencias para importar');
    return new Map<string, string>();
  }

  const competenciasParaInsertar = competencias.map((c) => {
    // Generar código único basado en el nombre
    const codigo = c.nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase()
      .substring(0, 50);

    // Mapear tipo: A = Competencia normal, B = Potencial
    return {
      codigo,
      nombre: c.nombreVisualizacion,
      tipo: c.tipo === 'POTENCIAL' ? 'B' : 'A'
    };
  });

  const { data, error } = await supabase
    .from('Competencia')
    .upsert(competenciasParaInsertar, { onConflict: 'codigo' })
    .select();

  if (error) {
    console.error('❌ Error al importar competencias:', error);
    throw error;
  }

  console.log(`✓ ${data.length} competencias importadas`);
  
  // Crear mapa de nombre -> id
  const competenciasMap = new Map<string, string>();
  data.forEach(c => {
    const original = competencias.find(comp => 
      comp.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().substring(0, 50) === c.codigo
    );
    if (original) {
      competenciasMap.set(original.nombre, c.id);
    }
  });
  
  return competenciasMap;
}

async function importarEscalas(
  escalas: EscalaExcel[], 
  competencias: CompetenciaExcel[],
  competenciasMap: Map<string, string>
) {
  console.log('\n📊 Importando escalas...');
  
  if (escalas.length === 0) {
    console.log('⚠️  No hay escalas para importar');
    return new Map<string, string>();
  }

  // Deduplicar escalas por código (mantener la primera ocurrencia)
  const escalasUnicas = new Map<string, EscalaExcel>();
  for (const escala of escalas) {
    if (!escalasUnicas.has(escala.codigo)) {
      escalasUnicas.set(escala.codigo, escala);
    }
  }

  const escalasDeduplicadas = Array.from(escalasUnicas.values());
  
  if (escalasDeduplicadas.length < escalas.length) {
    console.log(`⚠️  Se encontraron ${escalas.length - escalasDeduplicadas.length} escalas duplicadas, usando ${escalasDeduplicadas.length} únicas`);
  }

  // Agregar escala para reactivos sin clasificar
  escalasDeduplicadas.push({
    codigo: 'SIN_CLASIFICAR',
    nombre: 'Sin clasificar',
    nombreVisualizacion: 'Sin clasificar'
  });

  const escalasParaInsertar = escalasDeduplicadas.map((e) => {
    return {
      codigo: e.codigo,
      nombre: e.nombreVisualizacion
    };
  });

  const { data, error } = await supabase
    .from('Escala')
    .upsert(escalasParaInsertar, { onConflict: 'codigo' })
    .select();

  if (error) {
    console.error('❌ Error al importar escalas:', error);
    throw error;
  }

  console.log(`✓ ${data.length} escalas importadas (incluyendo "Sin clasificar")`);
  
  // Crear relaciones CompetenciaEscala
  const escalasMap = new Map(data.map(e => [e.codigo, e.id]));
  await crearRelacionesCompetenciaEscala(competencias, competenciasMap, escalasMap);
  
  return escalasMap;
}

async function crearRelacionesCompetenciaEscala(
  competencias: CompetenciaExcel[],
  competenciasMap: Map<string, string>,
  escalasMap: Map<string, string>
) {
  console.log('\n🔗 Creando relaciones Competencia-Escala...');
  
  const relaciones: any[] = [];
  
  for (const comp of competencias) {
    const competenciaId = competenciasMap.get(comp.nombre);
    if (!competenciaId) continue;
    
    for (const escalaNombre of comp.escalas) {
      const escalaCodigo = MAPEO_ESCALAS[escalaNombre] || escalaNombre;
      const escalaId = escalasMap.get(escalaCodigo);
      
      if (escalaId) {
        relaciones.push({
          competenciaId,
          escalaId
        });
      }
    }
  }

  if (relaciones.length === 0) {
    console.log('⚠️  No hay relaciones para crear');
    return;
  }

  const { data, error } = await supabase
    .from('CompetenciaEscala')
    .upsert(relaciones, { onConflict: 'competenciaId,escalaId', ignoreDuplicates: true })
    .select();

  if (error) {
    console.error('❌ Error al crear relaciones:', error);
    throw error;
  }

  console.log(`✓ ${data?.length || 0} relaciones creadas`);
}

async function importarReactivos(reactivos: ReactivoExcel[], escalasMap: Map<string, string>) {
  console.log('\n📋 Importando reactivos...');
  
  // Generar UUIDs únicos para cada par
  const pairIdMap = new Map<string, string>();
  const pares = new Map<string, ReactivoExcel[]>();
  
  for (const reactivo of reactivos) {
    const pairKey = reactivo.itemPareado || `single-${reactivo.idOrd}`;
    
    if (!pairIdMap.has(pairKey)) {
      pairIdMap.set(pairKey, uuidv4());
    }
    
    if (!pares.has(pairKey)) {
      pares.set(pairKey, []);
    }
    pares.get(pairKey)!.push(reactivo);
  }

  console.log(`📦 Total de pares: ${pares.size}`);

  const reactivosParaInsertar: any[] = [];
  let reactivosSinClasificar = 0;

  for (const [pairKey, reactivosDelPar] of pares.entries()) {
    reactivosDelPar.sort((a, b) => a.idOrd - b.idOrd);
    const pairId = pairIdMap.get(pairKey)!;

    for (let i = 0; i < reactivosDelPar.length; i++) {
      const reactivo = reactivosDelPar[i];
      const escalaId = escalasMap.get(reactivo.escala);

      if (!escalaId) {
        console.error(`❌ No se encontró escalaId para código: "${reactivo.escala}"`);
        throw new Error(`Escala no encontrada: ${reactivo.escala}`);
      }

      if (reactivo.escala === 'SIN_CLASIFICAR') {
        reactivosSinClasificar++;
      }

      let tipoReactivo = 'NEUTRAL';
      if (reactivo.tipo === 'POSITIVO' || reactivo.tipo === 'POS') {
        tipoReactivo = 'POS';
      } else if (reactivo.tipo === 'NEGATIVO' || reactivo.tipo === 'NEG') {
        tipoReactivo = 'NEG';
      } else if (reactivo.tipo === 'LIKERT') {
        tipoReactivo = 'LIKERT';
      }

      // Mapear seccion a los valores permitidos por el constraint
      let seccion: string | null = null;
      const testLower = String(reactivo.test || '').toLowerCase();
      
      if (testLower.includes('pareado') || testLower.includes('positivo')) {
        seccion = 'POSITIVOS';
      } else if (testLower.includes('negativo')) {
        seccion = 'NEGATIVOS';
      } else if (testLower.includes('likert')) {
        seccion = 'LIKERT';
      } else if (tipoReactivo === 'POS') {
        seccion = 'POSITIVOS';
      } else if (tipoReactivo === 'NEG') {
        seccion = 'NEGATIVOS';
      } else if (tipoReactivo === 'LIKERT') {
        seccion = 'LIKERT';
      } else {
        // Por defecto, asignar según el tipo de reactivo
        seccion = 'POSITIVOS';
      }

      reactivosParaInsertar.push({
        texto: reactivo.reactivo,
        tipo: tipoReactivo,
        escalaId: escalaId,
        seccion: seccion,
        ordenGlobal: reactivo.idOrd,
        activo: true,
        pairId: pairId,
        ordenEnPar: i + 1,
        puntosSiElegido: reactivo.puntajeFijo,
        puntosSiNoElegido: 0
      });
    }
  }

  if (reactivosSinClasificar > 0) {
    console.warn(`⚠️  ${reactivosSinClasificar} reactivos asignados a "Sin clasificar"`);
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

async function importarNormas(normas: NormaExcel[], escalasMap: Map<string, string>) {
  console.log('\n📈 Importando normas...');
  
  if (normas.length === 0) {
    console.log('⚠️  No hay normas para importar');
    return 0;
  }

  // Agrupar normas por código de escala
  const normasPorEscala = new Map<string, NormaExcel[]>();
  
  for (const norma of normas) {
    if (!normasPorEscala.has(norma.codigo)) {
      normasPorEscala.set(norma.codigo, []);
    }
    normasPorEscala.get(norma.codigo)!.push(norma);
  }

  console.log(`📊 Procesando normas para ${normasPorEscala.size} escalas`);

  let totalImportadas = 0;

  // Procesar cada escala
  for (const [codigoEscala, normasEscala] of normasPorEscala.entries()) {
    // Verificar que la escala existe
    if (!escalasMap.has(codigoEscala)) {
      console.warn(`⚠️  Escala "${codigoEscala}" no encontrada, omitiendo sus normas`);
      continue;
    }

    // Preparar normas para insertar usando la estructura correcta de la tabla
    // La tabla tiene: escala, percentil, decil, puntaje_natural
    const normasParaInsertar = normasEscala.map(n => ({
      escala: codigoEscala,
      percentil: n.decil * 10, // Convertir decil a percentil (1->10, 2->20, etc.)
      decil: n.decil,
      puntaje_natural: n.puntajeMin
    }));

    // Insertar nuevas normas
    const { data, error } = await supabase
      .from('NormaDecil')
      .insert(normasParaInsertar)
      .select();

    if (error) {
      console.error(`❌ Error al importar normas para ${codigoEscala}:`, error);
      continue;
    }

    totalImportadas += data.length;
    console.log(`  ✓ ${data.length} normas importadas para escala ${codigoEscala}`);
  }

  console.log(`✓ ${totalImportadas} normas importadas en total`);
  return totalImportadas;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Iniciando importación desde Reactivos.xlsx\n');
  console.log('='.repeat(60));

  try {
    const workbook = leerExcel(ARCHIVO_EXCEL);

    console.log('\n📦 Extrayendo datos del Excel...');
    const reactivos = extraerReactivos(workbook);
    const escalasDeReactivos = extraerEscalasDeReactivos(reactivos);
    const { competencias, escalas: escalasDeScoring } = extraerEscalasYCompetencias(workbook);
    
    // Combinar escalas de ambas fuentes
    const todasLasEscalas = [...escalasDeScoring, ...escalasDeReactivos];
    
    const normas = extraerNormas(workbook);

    console.log('\n📊 Resumen de datos extraídos:');
    console.log(`  - Reactivos: ${reactivos.length}`);
    console.log(`  - Competencias: ${competencias.length}`);
    console.log(`  - Escalas totales: ${todasLasEscalas.length}`);
    console.log(`  - Normas: ${normas.length}`);

    console.log('\n⚠️  ¿Deseas continuar con la importación? (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n💾 Importando a Supabase...');
    console.log('='.repeat(60));

    const competenciasMap = await importarCompetencias(competencias);
    const escalasMap = await importarEscalas(todasLasEscalas, competencias, competenciasMap);
    await importarReactivos(reactivos, escalasMap);

    if (normas.length > 0) {
      await importarNormas(normas, escalasMap);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`  ✓ ${competenciasMap.size} competencias`);
    console.log(`  ✓ ${escalasMap.size} escalas`);
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

main();