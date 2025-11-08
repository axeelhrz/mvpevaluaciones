import { createAdminClient } from '../lib/supabase/server';

async function main() {
  console.log('🧹 Iniciando limpieza del cuestionario...');
  
  const supabase = await createAdminClient();

  // 1. Buscar el cuestionario
  const { data: cuestionarios } = await supabase
    .from('Cuestionario')
    .select('id')
    .eq('titulo', 'Evaluación Psicofinanciera');

  if (!cuestionarios || cuestionarios.length === 0) {
    console.log('ℹ️  No se encontró el cuestionario para limpiar');
    return;
  }

  const cuestionarioId = cuestionarios[0].id;
  console.log(`📝 Cuestionario encontrado: ${cuestionarioId}`);

  // 2. Eliminar preguntas
  console.log('🗑️  Eliminando preguntas...');
  const { error: preguntasError } = await supabase
    .from('Pregunta')
    .delete()
    .eq('cuestionarioId', cuestionarioId);

  if (preguntasError) {
    console.error('❌ Error al eliminar preguntas:', preguntasError);
  } else {
    console.log('✅ Preguntas eliminadas');
  }

  // 3. Eliminar cuestionario
  console.log('🗑️  Eliminando cuestionario...');
  const { error: cuestionarioError } = await supabase
    .from('Cuestionario')
    .delete()
    .eq('id', cuestionarioId);

  if (cuestionarioError) {
    console.error('❌ Error al eliminar cuestionario:', cuestionarioError);
  } else {
    console.log('✅ Cuestionario eliminado');
  }

  // 4. Eliminar campos estadísticos
  console.log('🗑️  Eliminando campos estadísticos...');
  const { error: camposError } = await supabase
    .from('CampoEstadistico')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

  if (camposError) {
    console.error('❌ Error al eliminar campos estadísticos:', camposError);
  } else {
    console.log('✅ Campos estadísticos eliminados');
  }

  console.log('\n✅ Limpieza completada');
}

main()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });
