/**
 * Script de diagnóstico detallado
 * 
 * Este script analiza en profundidad:
 * - Los pares incompletos
 * - Las normas incompletas
 * - La estructura de los reactivos
 * 
 * Uso:
 * npx tsx scripts/diagnostico-detallado.ts
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

// ============================================
// FUNCIONES DE DIAGNÓSTICO
// ============================================

async function analizarParesIncompletos() {
  console.log('\n🔍 ANÁLISIS DE PARES INCOMPLETOS');
  console.log('='.repeat(60));
  
  const { data: reactivos } = await supabase
    .from('Reactivo')
    .select(`
      id,
      texto,
      tipo,
      pairId,
      ordenEnPar,
      seccion,
      ordenGlobal,
      escala:Escala(codigo, nombre)
    `)
    .not('pairId', 'is', null)
    .order('ordenGlobal', { ascending: true });

  if (!reactivos) {
    console.error('❌ No se pudieron obtener los reactivos');
    return;
  }

  // Agrupar por pairId
  const pares = new Map<string, any[]>();
  
  for (const reactivo of reactivos) {
    if (!pares.has(reactivo.pairId)) {
      pares.set(reactivo.pairId, []);
    }
    pares.get(reactivo.pairId)!.push(reactivo);
  }

  // Analizar pares incompletos
  const paresIncompletos: any[] = [];
  
  for (const [pairId, reactivosDelPar] of pares.entries()) {
    if (reactivosDelPar.length !== 2) {
      paresIncompletos.push({
        pairId,
        cantidad: reactivosDelPar.length,
        reactivos: reactivosDelPar
      });
    }
  }

  console.log(`\n📊 Total de pares incompletos: ${paresIncompletos.length}`);
  
  if (paresIncompletos.length > 0) {
    console.log('\n📋 Detalles de pares incompletos:\n');
    
    paresIncompletos.slice(0, 10).forEach((par, idx) => {
      console.log(`${idx + 1}. Par ${par.pairId.substring(0, 8)}... (${par.cantidad} reactivo${par.cantidad > 1 ? 's' : ''})`);
      par.reactivos.forEach((r: any) => {
        console.log(`   - Orden ${r.ordenEnPar}: "${r.texto.substring(0, 50)}..."`);
        console.log(`     Tipo: ${r.tipo}, Sección: ${r.seccion}, Escala: ${r.escala?.codigo}`);
      });
      console.log('');
    });

    if (paresIncompletos.length > 10) {
      console.log(`   ... y ${paresIncompletos.length - 10} pares más\n`);
    }

    // Analizar patrones
    const porSeccion = paresIncompletos.reduce((acc: any, par) => {
      const seccion = par.reactivos[0]?.seccion || 'DESCONOCIDA';
      acc[seccion] = (acc[seccion] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Pares incompletos por sección:');
    Object.entries(porSeccion).forEach(([seccion, cantidad]) => {
      console.log(`   ${seccion}: ${cantidad}`);
    });

    const porTipo = paresIncompletos.reduce((acc: any, par) => {
      const tipo = par.reactivos[0]?.tipo || 'DESCONOCIDO';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Pares incompletos por tipo:');
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      console.log(`   ${tipo}: ${cantidad}`);
    });
  }
}

async function analizarNormasIncompletas() {
  console.log('\n\n🔍 ANÁLISIS DE NORMAS INCOMPLETAS');
  console.log('='.repeat(60));
  
  const { data: normas } = await supabase
    .from('NormaDecil')
    .select('*')
    .order('targetCodigo', { ascending: true })
    .order('decil', { ascending: true });

  if (!normas) {
    console.error('❌ No se pudieron obtener las normas');
    return;
  }

  // Agrupar por escala
  const normasPorEscala = new Map<string, any[]>();
  
  for (const norma of normas) {
    const key = `${norma.targetTipo}:${norma.targetCodigo}`;
    if (!normasPorEscala.has(key)) {
      normasPorEscala.set(key, []);
    }
    normasPorEscala.get(key)!.push(norma);
  }

  // Analizar completitud
  const escalasIncompletas: any[] = [];
  
  for (const [key, normasEscala] of normasPorEscala.entries()) {
    const deciles = normasEscala.map(n => n.decil);
    const decilesUnicos = [...new Set(deciles)];
    const minDecil = Math.min(...deciles);
    const maxDecil = Math.max(...deciles);
    
    if (decilesUnicos.length < 10) {
      escalasIncompletas.push({
        escala: key,
        totalNormas: normasEscala.length,
        decilesUnicos: decilesUnicos.length,
        deciles: deciles.sort((a, b) => a - b),
        minDecil,
        maxDecil,
        normas: normasEscala
      });
    }
  }

  console.log(`\n📊 Total de escalas con normas incompletas: ${escalasIncompletas.length}`);
  
  if (escalasIncompletas.length > 0) {
    console.log('\n📋 Detalles de escalas con normas incompletas:\n');
    
    escalasIncompletas.forEach((escala, idx) => {
      console.log(`${idx + 1}. ${escala.escala}`);
      console.log(`   Total de normas: ${escala.totalNormas}`);
      console.log(`   Deciles únicos: ${escala.decilesUnicos} (esperados: 10)`);
      console.log(`   Rango de deciles: ${escala.minDecil} - ${escala.maxDecil}`);
      console.log(`   Deciles presentes: ${[...new Set(escala.deciles)].join(', ')}`);
      
      // Mostrar primeras 5 normas
      console.log('   Primeras normas:');
      escala.normas.slice(0, 5).forEach((norma: any) => {
        console.log(`     Decil ${norma.decil}: puntaje ≥ ${norma.puntajeMin}`);
      });
      console.log('');
    });
  }
}

async function analizarEstructuraReactivos() {
  console.log('\n\n🔍 ANÁLISIS DE ESTRUCTURA DE REACTIVOS');
  console.log('='.repeat(60));
  
  const { data: reactivos } = await supabase
    .from('Reactivo')
    .select('tipo, seccion, pairId')
    .order('tipo', { ascending: true });

  if (!reactivos) {
    console.error('❌ No se pudieron obtener los reactivos');
    return;
  }

  // Contar por tipo y sección
  const porTipoYSeccion = reactivos.reduce((acc: any, r) => {
    const key = `${r.tipo}-${r.seccion}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Distribución de reactivos por tipo y sección:\n');
  Object.entries(porTipoYSeccion)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, cantidad]) => {
      const [tipo, seccion] = key.split('-');
      console.log(`   ${tipo.padEnd(8)} en ${seccion.padEnd(12)}: ${cantidad}`);
    });

  // Analizar reactivos sin par
  const sinPar = reactivos.filter(r => !r.pairId);
  console.log(`\n📊 Reactivos sin pairId: ${sinPar.length}`);
  
  if (sinPar.length > 0) {
    const porTipo = sinPar.reduce((acc: any, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   Por tipo:');
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      console.log(`     ${tipo}: ${cantidad}`);
    });
  }
}

async function verificarConsistenciaExcel() {
  console.log('\n\n🔍 VERIFICACIÓN DE CONSISTENCIA CON EXCEL');
  console.log('='.repeat(60));
  
  const XLSX = require('xlsx');
  
  if (!fs.existsSync('Reactivos.xlsx')) {
    console.log('⚠️  Archivo Reactivos.xlsx no encontrado');
    return;
  }

  const workbook = XLSX.readFile('Reactivos.xlsx');
  const sheet = workbook.Sheets['Reactivos Test'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  console.log(`\n📊 Reactivos en Excel: ${data.length - 1} (excluyendo encabezado)`);

  // Contar por tipo en Excel
  const tiposExcel: any = {};
  for (let i = 1; i < data.length; i++) {
    const tipo = String(data[i][4] || '').toUpperCase();
    if (tipo) {
      tiposExcel[tipo] = (tiposExcel[tipo] || 0) + 1;
    }
  }

  console.log('\n📊 Reactivos por tipo en Excel:');
  Object.entries(tiposExcel).forEach(([tipo, cantidad]) => {
    console.log(`   ${tipo}: ${cantidad}`);
  });

  // Comparar con base de datos
  const { data: reactivosDB } = await supabase
    .from('Reactivo')
    .select('tipo');

  if (reactivosDB) {
    const tiposDB = reactivosDB.reduce((acc: any, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Reactivos por tipo en Base de Datos:');
    Object.entries(tiposDB).forEach(([tipo, cantidad]) => {
      console.log(`   ${tipo}: ${cantidad}`);
    });

    console.log('\n📊 Comparación:');
    const todosLosTipos = new Set([...Object.keys(tiposExcel), ...Object.keys(tiposDB)]);
    todosLosTipos.forEach(tipo => {
      const enExcel = tiposExcel[tipo] || 0;
      const enDB = tiposDB[tipo] || 0;
      const diferencia = enDB - enExcel;
      const icono = diferencia === 0 ? '✅' : '⚠️';
      console.log(`   ${icono} ${tipo}: Excel=${enExcel}, DB=${enDB}, Diferencia=${diferencia}`);
    });
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🔍 DIAGNÓSTICO DETALLADO DE LA IMPORTACIÓN');
  console.log('='.repeat(60));

  try {
    await analizarParesIncompletos();
    await analizarNormasIncompletas();
    await analizarEstructuraReactivos();
    await verificarConsistenciaExcel();

    console.log('\n' + '='.repeat(60));
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL DIAGNÓSTICO:');
    console.error(error);
    process.exit(1);
  }
}

main();