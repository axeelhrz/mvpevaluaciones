/**
 * Script para verificar la estructura de las tablas
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLAS\n');

  // Verificar Cuestionario
  console.log('📋 Tabla: Cuestionario');
  const { data: cuestionarios, error: errorCuestionario } = await supabase
    .from('Cuestionario')
    .select('*')
    .limit(1);
  
  if (errorCuestionario) {
    console.log('❌ Error:', errorCuestionario.message);
  } else if (cuestionarios && cuestionarios.length > 0) {
    console.log('✅ Columnas:', Object.keys(cuestionarios[0]).join(', '));
  } else {
    console.log('⚠️  Tabla vacía');
  }

  // Verificar Evaluado
  console.log('\n📋 Tabla: Evaluado');
  const { data: evaluados, error: errorEvaluado } = await supabase
    .from('Evaluado')
    .select('*')
    .limit(1);
  
  if (errorEvaluado) {
    console.log('❌ Error:', errorEvaluado.message);
  } else if (evaluados && evaluados.length > 0) {
    console.log('✅ Columnas:', Object.keys(evaluados[0]).join(', '));
  } else {
    console.log('⚠️  Tabla vacía - intentando insertar registro de prueba...');
    
    // Intentar insertar para ver qué columnas acepta
    const { error: insertError } = await supabase
      .from('Evaluado')
      .insert({
        nombre: 'Test',
        email: 'test@test.com'
      });
    
    if (insertError) {
      console.log('❌ Error al insertar:', insertError.message);
    }
  }

  // Verificar Reactivo
  console.log('\n📋 Tabla: Reactivo');
  const { data: reactivos, error: errorReactivo } = await supabase
    .from('Reactivo')
    .select('*')
    .limit(1);
  
  if (errorReactivo) {
    console.log('❌ Error:', errorReactivo.message);
  } else if (reactivos && reactivos.length > 0) {
    console.log('✅ Columnas:', Object.keys(reactivos[0]).join(', '));
    console.log('📊 Total de reactivos:', reactivos.length);
  }

  // Verificar Escala
  console.log('\n📋 Tabla: Escala');
  const { data: escalas, error: errorEscala } = await supabase
    .from('Escala')
    .select('*')
    .limit(1);
  
  if (errorEscala) {
    console.log('❌ Error:', errorEscala.message);
  } else if (escalas && escalas.length > 0) {
    console.log('✅ Columnas:', Object.keys(escalas[0]).join(', '));
  }

  // Verificar Pregunta
  console.log('\n📋 Tabla: Pregunta');
  const { data: preguntas, error: errorPregunta } = await supabase
    .from('Pregunta')
    .select('*')
    .limit(1);
  
  if (errorPregunta) {
    console.log('❌ Error:', errorPregunta.message);
  } else if (preguntas && preguntas.length > 0) {
    console.log('✅ Columnas:', Object.keys(preguntas[0]).join(', '));
  } else {
    console.log('⚠️  Tabla vacía');
  }

  // Verificar Respuesta - intentar con diferentes combinaciones
  console.log('\n📋 Tabla: Respuesta');
  const { data: respuestas, error: errorRespuesta } = await supabase
    .from('Respuesta')
    .select('*')
    .limit(1);
  
  if (errorRespuesta) {
    console.log('❌ Error:', errorRespuesta.message);
  } else if (respuestas && respuestas.length > 0) {
    console.log('✅ Columnas:', Object.keys(respuestas[0]).join(', '));
  } else {
    console.log('⚠️  Tabla vacía - probando diferentes estructuras...');
    
    // Obtener un evaluado y una pregunta para probar
    const { data: evaluados } = await supabase
      .from('Evaluado')
      .select('id')
      .limit(1);
    
    const { data: preguntas } = await supabase
      .from('Pregunta')
      .select('id')
      .limit(1);
    
    if (evaluados && evaluados.length > 0 && preguntas && preguntas.length > 0) {
      console.log('\n   Probando estructura 1: evaluadoId (UUID) + preguntaId (INT) + respuesta (TEXT)');
      
      // Primero, obtener el ID numérico de la pregunta
      const preguntaId = preguntas[0].id;
      console.log(`   Pregunta ID: ${preguntaId} (tipo: ${typeof preguntaId})`);
      
      const { data: test1, error: error1 } = await supabase
        .from('Respuesta')
        .insert({
          evaluadoId: evaluados[0].id,
          preguntaId: preguntaId,
          respuesta: '1'
        })
        .select();
      
      if (error1) {
        console.log('   ❌ Error:', error1.message);
        console.log('   Detalles completos:', JSON.stringify(error1, null, 2));
      } else {
        console.log('   ✅ Éxito! Columnas:', test1 && test1[0] ? Object.keys(test1[0]).join(', ') : 'N/A');
        
        // Limpiar el registro de prueba
        if (test1 && test1[0]) {
          await supabase
            .from('Respuesta')
            .delete()
            .eq('id', test1[0].id);
          console.log('   🧹 Registro de prueba eliminado');
        }
      }
    } else {
      console.log('   ⚠️  No hay evaluados o preguntas para probar');
    }
  }

  // Verificar NormaDecil
  console.log('\n📋 Tabla: NormaDecil');
  const { data: normas, error: errorNorma } = await supabase
    .from('NormaDecil')
    .select('*')
    .limit(1);
  
  if (errorNorma) {
    console.log('❌ Error:', errorNorma.message);
  } else if (normas && normas.length > 0) {
    console.log('✅ Columnas:', Object.keys(normas[0]).join(', '));
  }
}

main();