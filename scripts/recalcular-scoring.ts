/**
 * Script para recalcular el scoring de todos los evaluados completados
 * 
 * Uso:
 * npx tsx scripts/recalcular-scoring.ts
 */

import { createClient } from '@supabase/supabase-js';
import { scoreEvaluado } from '../lib/scoring';

// Crear cliente de Supabase directamente
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function recalcularScoring() {
  console.log('🚀 Iniciando recálculo de scoring...\n');

  const supabase = createAdminClient();

  // Obtener todos los evaluados completados
  const { data: evaluados, error } = await supabase
    .from('Evaluado')
    .select('id, nombre, correo, estado')
    .eq('estado', 'completado');

  if (error) {
    console.error('❌ Error al obtener evaluados:', error);
    return;
  }

  if (!evaluados || evaluados.length === 0) {
    console.log('⚠️  No hay evaluados completados para procesar.');
    return;
  }

  console.log(`📊 Se encontraron ${evaluados.length} evaluados completados\n`);

  let exitosos = 0;
  let fallidos = 0;

  for (const evaluado of evaluados) {
    console.log(`\n🔄 Procesando: ${evaluado.nombre} (${evaluado.correo})`);
    console.log(`   ID: ${evaluado.id}`);

    try {
      const resultado = await scoreEvaluado(evaluado.id);

      console.log(`   ✅ Scoring calculado exitosamente:`);
      console.log(`      - Escalas: ${resultado.escalas.length}`);
      console.log(`      - Competencias A: ${resultado.competenciasA.length}`);
      console.log(`      - Competencias B: ${resultado.competenciasB.length}`);
      
      if (resultado.warnings.length > 0) {
        console.log(`      ⚠️  Advertencias: ${resultado.warnings.length}`);
        resultado.warnings.forEach(w => {
          console.log(`         - ${w.message}`);
        });
      }

      exitosos++;
    } catch (error) {
      console.error(`   ❌ Error al calcular scoring:`, error);
      fallidos++;
    }
  }

  console.log(`\n\n📈 RESUMEN:`);
  console.log(`   ✅ Exitosos: ${exitosos}`);
  console.log(`   ❌ Fallidos: ${fallidos}`);
  console.log(`   📊 Total: ${evaluados.length}`);
  console.log(`\n✨ Proceso completado\n`);
}

// Ejecutar el script
recalcularScoring()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });