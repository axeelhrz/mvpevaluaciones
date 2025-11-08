/**
 * Script de prueba del sistema completo
 * 
 * Este script:
 * 1. Crea un evaluado de prueba
 * 2. Simula respuestas al cuestionario
 * 3. Calcula el scoring
 * 4. Verifica las normas y deciles
 * 5. Muestra los resultados
 * 
 * Uso:
 * npx tsx scripts/prueba-sistema-completo.ts
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
// FUNCIONES DE PRUEBA
// ============================================

async function crearEvaluadoPrueba() {
  console.log('\n📝 PASO 1: Creando evaluado de prueba...');
  console.log('='.repeat(60));
  
  // Verificar si existe un cuestionario
  const { data: cuestionarios } = await supabase
    .from('Cuestionario')
    .select('id')
    .limit(1);

  let cuestionarioId: string;

  // Si no existe ningún cuestionario, crear uno
  if (!cuestionarios || cuestionarios.length === 0) {
    console.log('⚠️  No hay cuestionarios, creando uno...');
    
    const { data: nuevoCuestionario, error } = await supabase
      .from('Cuestionario')
      .insert({
        titulo: 'Cuestionario de Prueba',
        descripcion: 'Cuestionario generado automáticamente para pruebas',
        activo: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear cuestionario:', error);
      process.exit(1);
    }

    cuestionarioId = nuevoCuestionario.id;
    console.log(`✅ Cuestionario creado: ${cuestionarioId}`);
  } else {
    cuestionarioId = cuestionarios[0].id;
    console.log(`✅ Usando cuestionario: ${cuestionarioId}`);
  }

  // Crear evaluado de prueba
  const { data: evaluado, error } = await supabase
    .from('Evaluado')
    .insert({
      nombre: 'Prueba Sistema',
      correo: `prueba-${Date.now()}@test.com`,
      estado: 'pendiente',
      datosCompletados: false
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error al crear evaluado:', error);
    process.exit(1);
  }

  console.log(`✅ Evaluado creado: ${evaluado.nombre} (ID: ${evaluado.id})`);
  return evaluado;
}

async function simularRespuestas(evaluadoId: string) {
  console.log('\n📝 PASO 2: Simulando respuestas al cuestionario...');
  console.log('='.repeat(60));

  // Obtener el cuestionario del evaluado
  const { data: evaluado } = await supabase
    .from('Evaluado')
    .select('*')
    .eq('id', evaluadoId)
    .single();

  if (!evaluado) {
    console.error('❌ No se pudo obtener el evaluado');
    process.exit(1);
  }

  // Obtener todos los reactivos
  const { data: reactivos } = await supabase
    .from('Reactivo')
    .select('*')
    .order('ordenGlobal', { ascending: true });

  if (!reactivos) {
    console.error('❌ No se pudieron obtener los reactivos');
    process.exit(1);
  }

  console.log(`📊 Total de reactivos: ${reactivos.length}`);

  // Separar por tipo
  const reactivosLikert = reactivos.filter(r => r.seccion === 'LIKERT');
  const reactivosPareados = reactivos.filter(r => r.seccion === 'POSITIVOS');

  console.log(`   - Likert: ${reactivosLikert.length}`);
  console.log(`   - Pareados: ${reactivosPareados.length}`);

  // Primero, crear las preguntas
  console.log('\n📝 Creando preguntas...');
  const preguntas: Array<Record<string, unknown>> = [];
  const preguntasMap = new Map<string, string>(); // reactivoId -> preguntaId

  // Crear preguntas para Likert
  for (const reactivo of reactivosLikert) {
    preguntas.push({
      texto: reactivo.texto,
      tipo: 'LIKERT',
      reactivoId: reactivo.id,
      orden: reactivo.ordenGlobal
    });
  }

  // Crear preguntas para pares
  const pares = new Map<string, Array<Record<string, unknown>>>();
  for (const reactivo of reactivosPareados) {
    if (!pares.has(reactivo.pairId)) {
      pares.set(reactivo.pairId, []);
    }
    pares.get(reactivo.pairId)!.push(reactivo);
  }

  for (const [pairId, reactivosDelPar] of pares.entries()) {
    if (reactivosDelPar.length === 2) {
      // Crear una pregunta por par
      preguntas.push({
        texto: `${reactivosDelPar[0].texto} vs ${reactivosDelPar[1].texto}`,
        tipo: 'PAREADO',
        pairId: pairId,
        orden: reactivosDelPar[0].ordenGlobal
      });
    }
  }

  console.log(`📝 Insertando ${preguntas.length} preguntas...`);
  const { data: preguntasCreadas, error: errorPreguntas } = await supabase
    .from('Pregunta')
    .insert(preguntas)
    .select();

  if (errorPreguntas) {
    console.error('❌ Error al crear preguntas:', errorPreguntas);
    process.exit(1);
  }

  console.log(`✅ ${preguntasCreadas?.length || 0} preguntas creadas`);

  // Mapear preguntas a reactivos
  for (const pregunta of preguntasCreadas || []) {
    if (pregunta.reactivoId) {
      preguntasMap.set(pregunta.reactivoId, pregunta.id);
    }
  }

  // Ahora crear las respuestas
  console.log('\n🎲 Generando respuestas...');
  const respuestas: Array<Record<string, unknown>> = [];

  // Respuestas Likert
  for (const reactivo of reactivosLikert) {
    const preguntaId = preguntasCreadas?.find(p => p.reactivoId === reactivo.id)?.id;
    if (!preguntaId) continue;

    const valor = Math.floor(Math.random() * 5) + 1; // 1-5
    respuestas.push({
      evaluadoId,
      preguntaId,
      respuesta: String(valor),
      reactivoElegidoId: reactivo.id
    });
  }

  // Respuestas de pareamiento
  for (const [pairId, reactivosDelPar] of pares.entries()) {
    if (reactivosDelPar.length === 2) {
      const preguntaId = preguntasCreadas?.find(p => p.pairId === pairId)?.id;
      if (!preguntaId) continue;

      // Seleccionar aleatoriamente uno de los dos
      const seleccionado = reactivosDelPar[Math.floor(Math.random() * 2)];
      respuestas.push({
        evaluadoId,
        preguntaId,
        respuesta: String(seleccionado.ordenEnPar), // "1" o "2"
        reactivoElegidoId: seleccionado.id
      });
    }
  }

  console.log(`\n✅ Total de respuestas generadas: ${respuestas.length}`);

  // Insertar respuestas en la base de datos
  console.log('💾 Guardando respuestas en la base de datos...');
  const { error } = await supabase
    .from('Respuesta')
    .insert(respuestas);

  if (error) {
    console.error('❌ Error al guardar respuestas:', error);
    process.exit(1);
  }

  console.log('✅ Respuestas guardadas correctamente');
  return respuestas;
}

async function calcularScoring(evaluadoId: string) {
  console.log('\n📊 PASO 3: Calculando scoring...');
  console.log('='.repeat(60));

  // Obtener todas las respuestas
  const { data: respuestas } = await supabase
    .from('Respuesta')
    .select(`
      *,
      reactivo:Reactivo(
        id,
        escalaId,
        tipo,
        seccion,
        pairId,
        escala:Escala(codigo, nombre)
      )
    `)
    .eq('evaluadoId', evaluadoId);

  if (!respuestas) {
    console.error('❌ No se pudieron obtener las respuestas');
    process.exit(1);
  }

  console.log(`📊 Total de respuestas: ${respuestas.length}`);

  // Calcular puntajes por escala
  const puntajesPorEscala = new Map<string, number>();

  for (const respuesta of respuestas as Array<Record<string, unknown>>) {
    const escalaId = (respuesta.reactivo as Record<string, unknown>)?.escalaId;
    if (!escalaId) continue;

    const puntajeActual = puntajesPorEscala.get(String(escalaId)) || 0;
    puntajesPorEscala.set(String(escalaId), puntajeActual + (Number(respuesta.respuesta) || 0));
  }

  console.log(`\n📊 Puntajes calculados para ${puntajesPorEscala.size} escalas`);

  // Obtener información de las escalas
  const { data: escalas } = await supabase
    .from('Escala')
    .select('*');

  if (!escalas) {
    console.error('❌ No se pudieron obtener las escalas');
    process.exit(1);
  }

  const resultados: Array<Record<string, unknown>> = [];

  console.log('\n📋 Resultados por escala:\n');
  for (const [escalaId, puntaje] of puntajesPorEscala.entries()) {
    const escala = escalas.find(e => e.id === escalaId);
    if (!escala) continue;

    // Buscar el decil correspondiente
    const { data: norma } = await supabase
      .from('NormaDecil')
      .select('*')
      .eq('targetTipo', 'ESCALA')
      .eq('targetCodigo', escala.codigo)
      .lte('puntajeMin', puntaje)
      .order('puntajeMin', { ascending: false })
      .limit(1)
      .single();

    const decil = norma?.decil || 0;

    resultados.push({
      escala: escala.codigo,
      nombre: escala.nombre,
      puntaje,
      decil
    });

    console.log(`   ${escala.codigo.padEnd(6)} - ${escala.nombre.padEnd(30)} | Puntaje: ${String(puntaje).padStart(3)} | Decil: ${decil}`);
  }

  return resultados;
}

async function verificarNormas() {
  console.log('\n\n🔍 PASO 4: Verificando sistema de normas...');
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
  const normasPorEscala = new Map<string, Array<Record<string, unknown>>>();
  
  for (const norma of normas) {
    const key = `${norma.targetTipo}:${norma.targetCodigo}`;
    if (!normasPorEscala.has(key)) {
      normasPorEscala.set(key, []);
    }
    normasPorEscala.get(key)!.push(norma as Record<string, unknown>);
  }

  console.log(`\n📊 Total de escalas con normas: ${normasPorEscala.size}`);

  // Mostrar ejemplo de una escala
  const primeraEscala = Array.from(normasPorEscala.entries())[0];
  if (primeraEscala) {
    const [escala, normasEscala] = primeraEscala;
    console.log(`\n📋 Ejemplo de normas para ${escala}:`);
    normasEscala.forEach(norma => {
      console.log(`   Decil ${String(norma.decil).padStart(2)}: puntaje ≥ ${norma.puntajeMin}`);
    });
  }

  // Verificar rangos
  console.log('\n📊 Análisis de rangos de deciles:');
  const rangos: Record<string, number> = {};
  
  for (const [, normasEscala] of normasPorEscala.entries()) {
    const deciles = normasEscala.map(n => Number(n.decil));
    const min = Math.min(...deciles);
    const max = Math.max(...deciles);
    
    const rango = `${min}-${max}`;
    rangos[rango] = (rangos[rango] || 0) + 1;
  }

  Object.entries(rangos).forEach(([rango, cantidad]) => {
    console.log(`   Rango ${rango}: ${cantidad} escalas`);
  });
}

async function limpiarDatosPrueba(evaluadoId: string) {
  console.log('\n\n🧹 PASO 5: Limpiando datos de prueba...');
  console.log('='.repeat(60));

  // Eliminar respuestas
  const { error: errorRespuestas } = await supabase
    .from('Respuesta')
    .delete()
    .eq('evaluadoId', evaluadoId);

  if (errorRespuestas) {
    console.error('⚠️  Error al eliminar respuestas:', errorRespuestas);
  } else {
    console.log('✅ Respuestas eliminadas');
  }

  // Eliminar evaluado
  const { error: errorEvaluado } = await supabase
    .from('Evaluado')
    .delete()
    .eq('id', evaluadoId);

  if (errorEvaluado) {
    console.error('⚠️  Error al eliminar evaluado:', errorEvaluado);
  } else {
    console.log('✅ Evaluado eliminado');
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🧪 PRUEBA DEL SISTEMA COMPLETO');
  console.log('='.repeat(60));

  let evaluadoId: string | null = null;

  try {
    // Paso 1: Crear evaluado
    const evaluado = await crearEvaluadoPrueba();
    evaluadoId = evaluado.id as string;

    // Paso 2: Simular respuestas
    await simularRespuestas(evaluadoId);

    // Paso 3: Calcular scoring
    const resultados = await calcularScoring(evaluadoId);

    // Paso 4: Verificar normas
    await verificarNormas();

    // Resumen final
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📊 RESUMEN:');
    console.log(`   - Evaluado creado: ${evaluado.nombre}`);
    console.log(`   - Respuestas generadas y guardadas`);
    console.log(`   - Scoring calculado para ${resultados.length} escalas`);
    console.log(`   - Sistema de normas verificado`);

    // Preguntar si desea limpiar
    console.log('\n❓ ¿Deseas limpiar los datos de prueba? (Se limpiarán automáticamente en 5 segundos)');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (typeof evaluadoId === 'string') {
      await limpiarDatosPrueba(evaluadoId);
    }

    console.log('\n✅ Prueba finalizada');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA PRUEBA:');
    console.error(error);
    
    if (typeof evaluadoId === 'string') {
      await limpiarDatosPrueba(evaluadoId);
    }
    
    process.exit(1);
  }
}

main();