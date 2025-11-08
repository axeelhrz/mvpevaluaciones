/**
 * Script para analizar completamente la estructura del archivo Reactivos.xlsx
 * Lee todas las hojas, columnas, datos y detecta patrones
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';

const ARCHIVO = 'Reactivos.xlsx';

interface AnalisisHoja {
  nombre: string;
  filas: number;
  columnas: number;
  encabezados: string[];
  tiposColumnas: string[];
  datosEjemplo: (string | number | boolean | null | undefined)[][];
  datosUnicos: Map<number, Set<string | number | boolean | null | undefined>>;
  columnasVacias: number[];
  estadisticas: Record<string, unknown>;
}

function analizarHoja(workbook: XLSX.WorkBook, nombreHoja: string): AnalisisHoja {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 ANALIZANDO HOJA: ${nombreHoja}`);
  console.log(`${'='.repeat(80)}`);

  const sheet = workbook.Sheets[nombreHoja];
  if (!sheet) {
    console.error(`❌ Hoja no encontrada: ${nombreHoja}`);
    return {} as AnalisisHoja;
  }

  // Leer datos sin procesar
  const datosRaw = XLSX.utils.sheet_to_json(sheet, { 
    header: 1,
    defval: null,
    blankrows: true
  }) as (string | number | boolean | null | undefined)[][];

  console.log(`\n📊 DIMENSIONES:`);
  console.log(`   Filas totales: ${datosRaw.length}`);
  console.log(`   Columnas máximas: ${Math.max(...datosRaw.map(r => r.length))}`);

  // Obtener encabezados (primera fila)
  const encabezados = datosRaw[0] || [];
  console.log(`\n📌 ENCABEZADOS (Fila 1):`);
  encabezados.forEach((col, idx) => {
    console.log(`   [${idx}] ${col || '(vacío)'}`);
  });

  // Analizar tipos de datos por columna
  const tiposColumnas: string[] = [];
  const datosUnicos = new Map<number, Set<string | number | boolean | null | undefined>>();
  const columnasVacias: number[] = [];

  for (let colIdx = 0; colIdx < encabezados.length; colIdx++) {
    const valores = datosRaw.slice(1).map(row => row[colIdx]).filter((v: string | number | boolean | null | undefined) => v !== null && v !== undefined && v !== '');
    
    if (valores.length === 0) {
      columnasVacias.push(colIdx);
      tiposColumnas.push('VACÍA');
      continue;
    }

    // Detectar tipo
    let tipo = 'MIXTO';
    const tipos = new Set<string>();
    
    for (const val of valores) {
      if (typeof val === 'number') tipos.add('NÚMERO');
      else if (typeof val === 'string') tipos.add('TEXTO');
      else if (typeof val === 'boolean') tipos.add('BOOLEANO');
      else tipos.add('OTRO');
    }

    if (tipos.size === 1) {
      tipo = Array.from(tipos)[0] || 'MIXTO';
    }

    tiposColumnas.push(tipo);
    datosUnicos.set(colIdx, new Set(valores as (string | number | boolean | null | undefined)[]));
  }

  console.log(`\n🔍 TIPOS DE DATOS POR COLUMNA:`);
  tiposColumnas.forEach((tipo, idx) => {
    const encabezado = encabezados[idx] || '(vacío)';
    const unicos = datosUnicos.get(idx)?.size || 0;
    console.log(`   [${idx}] ${encabezado.toString().padEnd(30)} → ${tipo.padEnd(10)} (${unicos} valores únicos)`);
  });

  if (columnasVacias.length > 0) {
    console.log(`\n⚠️  COLUMNAS VACÍAS: ${columnasVacias.join(', ')}`);
  }

  // Mostrar primeras 5 filas de datos
  console.log(`\n📄 PRIMERAS 5 FILAS DE DATOS:`);
  console.log(`${'─'.repeat(80)}`);
  
  for (let i = 1; i <= Math.min(5, datosRaw.length - 1); i++) {
    console.log(`\nFila ${i}:`);
    const fila = datosRaw[i];
    fila.forEach((valor, idx) => {
      const encabezado = encabezados[idx] || `Col${idx}`;
      console.log(`  [${idx}] ${encabezado.toString().padEnd(30)} = ${JSON.stringify(valor)}`);
    });
  }

  // Estadísticas por columna
  console.log(`\n📈 ESTADÍSTICAS POR COLUMNA:`);
  console.log(`${'─'.repeat(80)}`);

  const estadisticas: Record<string, unknown> = {};

  for (let colIdx = 0; colIdx < encabezados.length; colIdx++) {
    const encabezadoRaw = encabezados[colIdx];
    const encabezado = String(encabezadoRaw || `Col${colIdx}`);
    const valores = datosRaw.slice(1).map(row => row[colIdx]);
    const valoresNoVacios = valores.filter((v: string | number | boolean | null | undefined) => v !== null && v !== undefined && v !== '');
    const valoresVacios = valores.filter((v: string | number | boolean | null | undefined) => v === null || v === undefined || v === '').length;

    const stats: Record<string, unknown> = {
      total: valores.length,
      noVacios: valoresNoVacios.length,
      vacios: valoresVacios,
      porcentajeVacio: ((valoresVacios / valores.length) * 100).toFixed(2) + '%',
      unicos: new Set(valoresNoVacios).size
    };

    // Si es numérico, agregar min/max
    if (tiposColumnas[colIdx] === 'NÚMERO') {
      const numeros = valoresNoVacios.map((v: string | number | boolean | null | undefined) => Number(v)).filter(n => !isNaN(n));
      if (numeros.length > 0) {
        stats.min = Math.min(...numeros);
        stats.max = Math.max(...numeros);
        stats.promedio = (numeros.reduce((a, b) => a + b, 0) / numeros.length).toFixed(2);
      }
    }

    // Si es texto, mostrar ejemplos
    if (tiposColumnas[colIdx] === 'TEXTO' || tiposColumnas[colIdx] === 'MIXTO') {
      const textos = valoresNoVacios.slice(0, 3).map((v: string | number | boolean | null | undefined) => String(v));
      stats.ejemplos = textos as string[];
    }

    estadisticas[encabezado] = stats;

    console.log(`\n[${colIdx}] ${encabezado}`);
    console.log(`    Total: ${stats.total} | No vacíos: ${stats.noVacios} | Vacíos: ${stats.vacios} (${stats.porcentajeVacio})`);
    console.log(`    Valores únicos: ${stats.unicos}`);
    const minValue = stats.min;
    const maxValue = stats.max;
    const promValue = stats.promedio;
    if (typeof minValue === 'number' && typeof maxValue === 'number') {
      console.log(`    Rango: ${minValue} - ${maxValue} | Promedio: ${promValue}`);
    }
    const ejemplosValue = stats.ejemplos;
    if (Array.isArray(ejemplosValue)) {
      console.log(`    Ejemplos: ${ejemplosValue.join(' | ')}`);
    }
  }

  // Mostrar últimas 5 filas
  console.log(`\n📄 ÚLTIMAS 5 FILAS DE DATOS:`);
  console.log(`${'─'.repeat(80)}`);
  
  const inicio = Math.max(1, datosRaw.length - 5);
  for (let i = inicio; i < datosRaw.length; i++) {
    console.log(`\nFila ${i}:`);
    const fila = datosRaw[i];
    fila.forEach((valor, idx) => {
      const encabezado = encabezados[idx] || `Col${idx}`;
      console.log(`  [${idx}] ${encabezado.toString().padEnd(30)} = ${JSON.stringify(valor)}`);
    });
  }

  return {
    nombre: nombreHoja,
    filas: datosRaw.length,
    columnas: encabezados.length,
    encabezados: encabezados.map(e => String(e)),
    tiposColumnas,
    datosEjemplo: datosRaw.slice(1, 6),
    datosUnicos,
    columnasVacias,
    estadisticas
  };
}

async function main() {
  console.log('\n🚀 ANÁLISIS COMPLETO DE REACTIVOS.XLSX');
  console.log('='.repeat(80));

  try {
    if (!fs.existsSync(ARCHIVO)) {
      console.error(`❌ Archivo no encontrado: ${ARCHIVO}`);
      process.exit(1);
    }

    console.log(`\n📂 Leyendo archivo: ${ARCHIVO}`);
    const workbook = XLSX.readFile(ARCHIVO);

    console.log(`\n📑 HOJAS DISPONIBLES:`);
    workbook.SheetNames.forEach((nombre, idx) => {
      console.log(`   [${idx}] ${nombre}`);
    });

    // Analizar cada hoja
    const analisis: AnalisisHoja[] = [];
    for (const nombreHoja of workbook.SheetNames) {
      const resultado = analizarHoja(workbook, nombreHoja);
      analisis.push(resultado);
    }

    // Resumen final
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(80));

    analisis.forEach(hoja => {
      console.log(`\n📋 ${hoja.nombre}`);
      console.log(`   Filas: ${hoja.filas} | Columnas: ${hoja.columnas}`);
      console.log(`   Columnas vacías: ${hoja.columnasVacias.length}`);
    });

    console.log(`\n✅ Análisis completado`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();