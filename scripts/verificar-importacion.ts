/**
 * Script de verificación de la importación
 * 
 * Este script verifica que todos los datos se hayan importado correctamente:
 * - Competencias
 * - Escalas
 * - Reactivos y pares
 * - Normas decílicas
 * 
 * Uso:
 * npx tsx scripts/verificar-importacion.ts
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
// FUNCIONES DE VERIFICACIÓN
// ============================================

async function verificarCompetencias() {
  console.log('\n🎯 Verificando Competencias...');
  
  const { data: competenciasData, error, count } = await supabase
    .from('Competencia')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log(`✓ Total de competencias: ${count}`);
  
  if (competenciasData?.length) {
    console.log('\n📋 Primeras 5 competencias:');
    competenciasData.slice(0, 5).forEach((comp, idx) => {
      console.log(`  ${idx + 1}. ${comp.codigo} - ${comp.nombre} (Tipo: ${comp.tipo})`);
    });
  }

  return true;
}

async function verificarEscalas() {
  console.log('\n📊 Verificando Escalas...');
  
  const { data, error, count } = await supabase
    .from('Escala')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log(`✓ Total de escalas: ${count}`);
  
  if (data && data.length > 0) {
    console.log('\n📋 Primeras 10 escalas:');
    data.slice(0, 10).forEach((escala, idx) => {
      console.log(`  ${idx + 1}. ${escala.codigo} - ${escala.nombre}`);
    });
  }

  return true;
}

async function verificarReactivos() {
  console.log('\n📋 Verificando Reactivos...');
  
  const { error, count } = await supabase
    .from('Reactivo')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log(`✓ Total de reactivos: ${count}`);

  // Contar por tipo
  const { data: porTipoData } = await supabase
    .from('Reactivo')
    .select('tipo');

  if (porTipoData) {
    const conteo = porTipoData.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
      const tipo = String(r.tipo);
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Reactivos por tipo:');
    Object.entries(conteo).forEach(([tipo, cantidad]) => {
      console.log(`  - ${tipo}: ${cantidad}`);
    });
  }

  // Contar por sección
  const { data: porSeccionData } = await supabase
    .from('Reactivo')
    .select('seccion');

  if (porSeccionData) {
    const conteo = porSeccionData.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
      const seccion = String(r.seccion);
      acc[seccion] = (acc[seccion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Reactivos por sección:');
    Object.entries(conteo).forEach(([seccion, cantidad]) => {
      console.log(`  - ${seccion}: ${cantidad}`);
    });
  }

  return true;
}

async function verificarPares() {
  console.log('\n🔗 Verificando Pares de Reactivos...');
  
  const { data, error } = await supabase
    .from('Reactivo')
    .select('pairId, ordenEnPar')
    .not('pairId', 'is', null);

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  // Agrupar por pairId
  const pares = new Map<string, Array<Record<string, unknown>>>();
  
  for (const reactivo of data || []) {
    if (!pares.has(reactivo.pairId)) {
      pares.set(reactivo.pairId, []);
    }
    pares.get(reactivo.pairId)!.push(reactivo as Record<string, unknown>);
  }

  console.log(`✓ Total de pares únicos: ${pares.size}`);

  // Verificar integridad de pares
  let paresCompletos = 0;
  let paresIncompletos = 0;
  let paresConProblemas = 0;

  for (const [pairId, reactivos] of pares.entries()) {
    if (reactivos.length === 2) {
      const tieneOrden1 = reactivos.some(r => Number(r.ordenEnPar) === 1);
      const tieneOrden2 = reactivos.some(r => Number(r.ordenEnPar) === 2);
      
      if (tieneOrden1 && tieneOrden2) {
        paresCompletos++;
      } else {
        paresConProblemas++;
        if (paresConProblemas <= 3) {
          console.warn(`  ⚠️  Par ${pairId} tiene problemas de orden`);
        }
      }
    } else {
      paresIncompletos++;
      if (paresIncompletos <= 3) {
        console.warn(`  ⚠️  Par ${pairId} incompleto (${reactivos.length} reactivos)`);
      }
    }
  }

  console.log(`\n📊 Estado de los pares:`);
  console.log(`  ✓ Pares completos: ${paresCompletos}`);
  if (paresIncompletos > 0) {
    console.log(`  ⚠️  Pares incompletos: ${paresIncompletos}`);
  }
  if (paresConProblemas > 0) {
    console.log(`  ⚠️  Pares con problemas de orden: ${paresConProblemas}`);
  }

  return paresIncompletos === 0 && paresConProblemas === 0;
}

async function verificarNormas() {
  console.log('\n📈 Verificando Normas Decílicas...');
  
  const { data, error, count } = await supabase
    .from('NormaDecil')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log(`✓ Total de normas: ${count}`);

  // Agrupar por targetCodigo
  const normasPorEscala = new Map<string, Array<Record<string, unknown>>>();
  
  for (const norma of data || []) {
    const key = `${norma.targetTipo}:${norma.targetCodigo}`;
    if (!normasPorEscala.has(key)) {
      normasPorEscala.set(key, []);
    }
    normasPorEscala.get(key)!.push(norma as Record<string, unknown>);
  }

  console.log(`✓ Escalas con normas: ${normasPorEscala.size}`);

  // Verificar que cada escala tenga normas completas
  let escalasCompletas = 0;
  let escalasIncompletas = 0;

  console.log('\n📊 Verificando completitud de normas:');
  
  for (const [key, normas] of normasPorEscala.entries()) {
    const deciles = normas.map(n => Number(n.decil)).sort((a: number, b: number) => a - b);
    const decilesUnicos = [...new Set(deciles)];
    
    if (decilesUnicos.length >= 10) {
      escalasCompletas++;
    } else {
      escalasIncompletas++;
      if (escalasIncompletas <= 5) {
        console.warn(`  ⚠️  ${key}: solo ${decilesUnicos.length} deciles`);
      }
    }
  }

  console.log(`  ✓ Escalas con normas completas (≥10 deciles): ${escalasCompletas}`);
  if (escalasIncompletas > 0) {
    console.log(`  ⚠️  Escalas con normas incompletas: ${escalasIncompletas}`);
  }

  // Mostrar ejemplo de una escala
  if (normasPorEscala.size > 0) {
    const [primeraEscala, normas] = Array.from(normasPorEscala.entries())[0];
    console.log(`\n📋 Ejemplo de normas para ${primeraEscala}:`);
    normas
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => Number(a.decil) - Number(b.decil))
      .slice(0, 10)
      .forEach(norma => {
        console.log(`  Decil ${norma.decil}: puntaje mínimo = ${norma.puntajeMin}`);
      });
  }

  return true;
}

async function verificarRelaciones() {
  console.log('\n🔗 Verificando Relaciones Competencia-Escala...');
  
  const { error, count } = await supabase
    .from('CompetenciaEscala')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log(`✓ Total de relaciones: ${count}`);

  if (count === 0) {
    console.warn('⚠️  No hay relaciones entre competencias y escalas');
    console.warn('   Esto puede ser normal si las relaciones se crean de otra forma');
  }

  return true;
}

async function verificarEjemploCompleto() {
  console.log('\n🔍 Verificando Ejemplo Completo...');
  console.log('   (Obteniendo un par completo con sus escalas y normas)');
  
  // Obtener un par de reactivos
  const { data: reactivos } = await supabase
    .from('Reactivo')
    .select(`
      id,
      texto,
      tipo,
      pairId,
      ordenEnPar,
      puntosSiElegido,
      puntosSiNoElegido,
      escala:Escala(
        id,
        codigo,
        nombre
      )
    `)
    .not('pairId', 'is', null)
    .limit(2);

  if (!reactivos || reactivos.length < 2) {
    console.warn('⚠️  No se pudo obtener un par de ejemplo');
    return false;
  }

  const par = reactivos.filter(r => r.pairId === reactivos[0].pairId);
  
  if (par.length === 2) {
    console.log('\n✓ Par de ejemplo encontrado:');
    console.log(`  PairID: ${par[0].pairId}`);
    console.log(`\n  Reactivo 1 (orden ${par[0].ordenEnPar}):`);
    console.log(`    Texto: "${par[0].texto}"`);
    console.log(`    Tipo: ${par[0].tipo}`);
    const escalaArray1 = Array.isArray(par[0].escala) ? par[0].escala : [par[0].escala];
    const escala1 = escalaArray1 && escalaArray1.length > 0 ? escalaArray1[0] : null;
    console.log(`    Escala: ${escala1?.codigo} - ${escala1?.nombre}`);
    console.log(`    Puntos si elegido: ${par[0].puntosSiElegido}`);
    
    console.log(`\n  Reactivo 2 (orden ${par[1].ordenEnPar}):`);
    console.log(`    Texto: "${par[1].texto}"`);
    console.log(`    Tipo: ${par[1].tipo}`);
    const escalaArray2 = Array.isArray(par[1].escala) ? par[1].escala : [par[1].escala];
    const escala2 = escalaArray2 && escalaArray2.length > 0 ? escalaArray2[0] : null;
    console.log(`    Escala: ${escala2?.codigo} - ${escala2?.nombre}`);
    console.log(`    Puntos si elegido: ${par[1].puntosSiElegido}`);

    // Buscar normas para esta escala
    const escalaId = escala1?.codigo;
    if (escalaId) {
      const { data: normas } = await supabase
        .from('NormaDecil')
        .select('*')
        .eq('targetTipo', 'ESCALA')
        .eq('targetCodigo', escalaId)
        .order('decil', { ascending: true })
        .limit(5);

      if (normas && normas.length > 0) {
        console.log(`\n  ✓ Normas encontradas para escala ${escalaId}:`);
        normas.forEach(norma => {
          console.log(`    Decil ${norma.decil}: puntaje ≥ ${norma.puntajeMin}`);
        });
      }
    }
  }

  return true;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🔍 VERIFICACIÓN DE IMPORTACIÓN');
  console.log('='.repeat(60));

  const resultados = {
    competencias: false,
    escalas: false,
    reactivos: false,
    pares: false,
    normas: false,
    relaciones: false,
    ejemplo: false
  };

  try {
    resultados.competencias = await verificarCompetencias();
    resultados.escalas = await verificarEscalas();
    resultados.reactivos = await verificarReactivos();
    resultados.pares = await verificarPares();
    resultados.normas = await verificarNormas();
    resultados.relaciones = await verificarRelaciones();
    resultados.ejemplo = await verificarEjemploCompleto();

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(60));

    const checks = [
      { nombre: 'Competencias', resultado: resultados.competencias },
      { nombre: 'Escalas', resultado: resultados.escalas },
      { nombre: 'Reactivos', resultado: resultados.reactivos },
      { nombre: 'Pares', resultado: resultados.pares },
      { nombre: 'Normas', resultado: resultados.normas },
      { nombre: 'Relaciones', resultado: resultados.relaciones },
      { nombre: 'Ejemplo completo', resultado: resultados.ejemplo }
    ];

    checks.forEach(check => {
      const icono = check.resultado ? '✅' : '⚠️';
      console.log(`${icono} ${check.nombre}`);
    });

    const todosOk = Object.values(resultados).every(r => r);
    
    if (todosOk) {
      console.log('\n🎉 ¡Todos los datos se importaron correctamente!');
    } else {
      console.log('\n⚠️  Algunos datos tienen advertencias. Revisa los detalles arriba.');
    }

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA VERIFICACIÓN:');
    console.error(error);
    process.exit(1);
  }
}

main();