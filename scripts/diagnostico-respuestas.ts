/**
 * Script de diagnóstico de respuestas
 * 
 * Este script verifica:
 * - Si las respuestas se están guardando correctamente
 * - Si los reactivos tienen escalaId asignado
 * - Si el scoring se está calculando correctamente
 * 
 * Uso:
 * npx tsx scripts/diagnostico-respuestas.ts
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

async function verificarRespuestas() {
  console.log('\n🔍 VERIFICANDO RESPUESTAS');
  console.log('='.repeat(60));
  
  // Obtener todas las respuestas
  const { data: respuestas, error } = await supabase
    .from('Respuesta')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error al obtener respuestas:', error);
    return;
  }

  console.log(`\n📊 Total de respuestas en la base de datos: ${respuestas?.length || 0}`);
  
  if (respuestas && respuestas.length > 0) {
    console.log('\n📋 Últimas 5 respuestas:');
    respuestas.slice(0, 5).forEach((r, idx) => {
      console.log(`\n${idx + 1}. Respuesta ID: ${r.id}`);
      console.log(`   Evaluado ID: ${r.evaluadoId}`);
      console.log(`   Pregunta ID: ${r.preguntaId}`);
      console.log(`   Respuesta: ${r.respuesta}`);
      console.log(`   Reactivo Elegido ID: ${r.reactivoElegidoId || 'N/A'}`);
      console.log(`   Fecha: ${r.createdAt}`);
    });
  } else {
    console.log('⚠️  No hay respuestas en la base de datos');
  }
}

async function verificarReactivosConEscala() {
  console.log('\n\n🔍 VERIFICANDO REACTIVOS Y SUS ESCALAS');
  console.log('='.repeat(60));
  
  const { data: reactivos } = await supabase
    .from('Reactivo')
    .select(`
      id,
      texto,
      tipo,
      escalaId,
      pairId,
      seccion,
      escala:Escala(id, codigo, nombre)
    `)
    .limit(10);

  if (!reactivos) {
    console.error('❌ No se pudieron obtener los reactivos');
    return;
  }

  console.log(`\n📊 Total de reactivos verificados: ${reactivos.length}`);
  
  const sinEscala = reactivos.filter(r => !r.escalaId);
  const conEscala = reactivos.filter(r => r.escalaId);

  console.log(`   ✅ Con escala asignada: ${conEscala.length}`);
  console.log(`   ❌ Sin escala asignada: ${sinEscala.length}`);

  if (conEscala.length > 0) {
    console.log('\n📋 Ejemplo de reactivos con escala:');
    conEscala.slice(0, 3).forEach((r, idx) => {
      const escalaArray = Array.isArray(r.escala) ? r.escala : [r.escala];
      const escala = escalaArray && escalaArray.length > 0 ? escalaArray[0] : null;
      console.log(`\n${idx + 1}. ${r.texto.substring(0, 50)}...`);
      console.log(`   Tipo: ${r.tipo}, Sección: ${r.seccion}`);
      console.log(`   Escala: ${escala?.codigo || 'N/A'} - ${escala?.nombre || 'N/A'}`);
    });
  }

  if (sinEscala.length > 0) {
    console.log('\n⚠️  Reactivos SIN escala asignada:');
    sinEscala.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.texto.substring(0, 50)}... (Tipo: ${r.tipo})`);
    });
  }
}

async function verificarPreguntasYRespuestas() {
  console.log('\n\n🔍 VERIFICANDO RELACIÓN PREGUNTAS-RESPUESTAS');
  console.log('='.repeat(60));
  
  // Obtener respuestas con sus preguntas
  const { data: respuestas } = await supabase
    .from('Respuesta')
    .select(`
      *,
      pregunta:Pregunta(
        id,
        texto,
        tipo,
        pairId,
        escalaId
      )
    `)
    .limit(5);

  if (!respuestas || respuestas.length === 0) {
    console.log('⚠️  No hay respuestas para verificar');
    return;
  }

  console.log(`\n📊 Respuestas con preguntas: ${respuestas.length}`);
  
  respuestas.forEach((r, idx) => {
    console.log(`\n${idx + 1}. Respuesta: ${r.respuesta}`);
    console.log(`   Pregunta: ${r.pregunta?.texto?.substring(0, 50) || 'N/A'}...`);
    console.log(`   Tipo: ${r.pregunta?.tipo || 'N/A'}`);
    console.log(`   Escala ID: ${r.pregunta?.escalaId || 'N/A'}`);
    console.log(`   Pair ID: ${r.pregunta?.pairId || 'N/A'}`);
  });
}

async function verificarEscalasYCompetencias() {
  console.log('\n\n🔍 VERIFICANDO ESCALAS Y COMPETENCIAS');
  console.log('='.repeat(60));
  
  // Verificar escalas
  const { data: escalas } = await supabase
    .from('Escala')
    .select('*');

  console.log(`\n📊 Total de escalas: ${escalas?.length || 0}`);

  // Verificar competencias
  const { data: competencias } = await supabase
    .from('Competencia')
    .select('*');

  console.log(`📊 Total de competencias: ${competencias?.length || 0}`);

  // Verificar relaciones CompetenciaEscala
  const { data: relaciones } = await supabase
    .from('CompetenciaEscala')
    .select('*');

  console.log(`📊 Total de relaciones Competencia-Escala: ${relaciones?.length || 0}`);

  if (escalas && escalas.length > 0) {
    console.log('\n📋 Primeras 5 escalas:');
    escalas.slice(0, 5).forEach((e, idx) => {
      console.log(`${idx + 1}. ${e.codigo} - ${e.nombre}`);
    });
  }
}

async function simularCalculoScoring() {
  console.log('\n\n🔍 SIMULANDO CÁLCULO DE SCORING');
  console.log('='.repeat(60));
  
  // Obtener el último evaluado con respuestas
  const { data: respuestas } = await supabase
    .from('Respuesta')
    .select('evaluadoId')
    .limit(1);

  if (!respuestas || respuestas.length === 0) {
    console.log('⚠️  No hay respuestas para calcular scoring');
    return;
  }

  const evaluadoId = respuestas[0].evaluadoId;
  console.log(`\n📊 Calculando scoring para evaluado: ${evaluadoId}`);

  // Obtener todas las respuestas del evaluado con reactivos
  const { data: respuestasCompletas } = await supabase
    .from('Respuesta')
    .select(`
      *,
      pregunta:Pregunta(
        id,
        pairId,
        escalaId
      )
    `)
    .eq('evaluadoId', evaluadoId);

  if (!respuestasCompletas) {
    console.log('❌ No se pudieron obtener las respuestas');
    return;
  }

  console.log(`\n📊 Total de respuestas del evaluado: ${respuestasCompletas.length}`);

  // Intentar calcular puntajes por escala
  const puntajesPorEscala = new Map<string, number>();

  for (const respuesta of respuestasCompletas) {
    const escalaId = respuesta.pregunta?.escalaId;
    
    if (escalaId) {
      const puntajeActual = puntajesPorEscala.get(escalaId) || 0;
      const valorRespuesta = parseInt(respuesta.respuesta) || 0;
      puntajesPorEscala.set(escalaId, puntajeActual + valorRespuesta);
    }
  }

  console.log(`\n📊 Escalas con puntaje calculado: ${puntajesPorEscala.size}`);

  if (puntajesPorEscala.size > 0) {
    console.log('\n📋 Puntajes por escala:');
    for (const [escalaId, puntaje] of puntajesPorEscala.entries()) {
      // Obtener info de la escala
      const { data: escala } = await supabase
        .from('Escala')
        .select('codigo, nombre')
        .eq('id', escalaId)
        .single();

      console.log(`   ${escala?.codigo || escalaId}: ${puntaje} puntos`);
    }
  } else {
    console.log('⚠️  No se pudieron calcular puntajes (las preguntas no tienen escalaId asignado)');
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🔍 DIAGNÓSTICO DE RESPUESTAS Y SCORING');
  console.log('='.repeat(60));

  try {
    await verificarRespuestas();
    await verificarReactivosConEscala();
    await verificarPreguntasYRespuestas();
    await verificarEscalasYCompetencias();
    await simularCalculoScoring();

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