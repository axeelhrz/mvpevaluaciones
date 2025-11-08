/**
 * Script para limpiar todos los datos de evaluados del sistema
 * 
 * ADVERTENCIA: Este script eliminará TODOS los datos de:
 * - Evaluados
 * - Invitaciones
 * - Respuestas
 * - Resultados
 * - Datos Estadísticos
 * - Reportes
 * - Transacciones
 * 
 * Uso: npx tsx scripts/limpiar-evaluados.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para preguntar confirmación
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function limpiarDatos() {
  console.log('\n🚨 ADVERTENCIA: OPERACIÓN DESTRUCTIVA 🚨\n');
  console.log('Este script eliminará PERMANENTEMENTE todos los datos de:');
  console.log('  ✗ Evaluados');
  console.log('  ✗ Invitaciones');
  console.log('  ✗ Respuestas (RespuestaCustom)');
  console.log('  ✗ Resultados');
  console.log('  ✗ Datos Estadísticos');
  console.log('  ✗ Reportes');
  console.log('  ✗ Transacciones\n');

  const confirmar = await askConfirmation('¿Estás SEGURO de que quieres continuar? (s/n): ');
  
  if (!confirmar) {
    console.log('\n✅ Operación cancelada. No se eliminó ningún dato.');
    process.exit(0);
  }

  const confirmarDosVeces = await askConfirmation('\n⚠️  ÚLTIMA CONFIRMACIÓN: ¿Realmente quieres ELIMINAR TODOS los datos? (s/n): ');
  
  if (!confirmarDosVeces) {
    console.log('\n✅ Operación cancelada. No se eliminó ningún dato.');
    process.exit(0);
  }

  console.log('\n🔄 Iniciando limpieza de datos...\n');

  try {
    // 1. Eliminar Reportes
    console.log('🗑️  Eliminando reportes...');
    const { error: reportesError } = await supabase
      .from('Reporte')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (reportesError) throw reportesError;
    console.log('✅ Reportes eliminados');

    // 2. Eliminar Transacciones
    console.log('🗑️  Eliminando transacciones...');
    const { error: transaccionesError } = await supabase
      .from('Transaccion')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (transaccionesError) throw transaccionesError;
    console.log('✅ Transacciones eliminadas');

    // 3. Eliminar Resultados
    console.log('🗑️  Eliminando resultados...');
    const { error: resultadosError } = await supabase
      .from('Resultado')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (resultadosError) throw resultadosError;
    console.log('✅ Resultados eliminados');

    // 4. Eliminar Respuestas Custom
    console.log('🗑️  Eliminando respuestas...');
    const { error: respuestasError } = await supabase
      .from('RespuestaCustom')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (respuestasError) throw respuestasError;
    console.log('✅ Respuestas eliminadas');

    // 5. Eliminar Datos Estadísticos
    console.log('🗑️  Eliminando datos estadísticos...');
    const { error: datosError } = await supabase
      .from('DatosEstadisticos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (datosError) throw datosError;
    console.log('✅ Datos estadísticos eliminados');

    // 6. Eliminar Invitaciones
    console.log('🗑️  Eliminando invitaciones...');
    const { error: invitacionesError } = await supabase
      .from('Invitacion')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (invitacionesError) throw invitacionesError;
    console.log('✅ Invitaciones eliminadas');

    // 7. Eliminar Evaluados
    console.log('🗑️  Eliminando evaluados...');
    const { error: evaluadosError } = await supabase
      .from('Evaluado')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (evaluadosError) throw evaluadosError;
    console.log('✅ Evaluados eliminados');

    console.log('\n✅ ¡Limpieza completada exitosamente!');
    console.log('\n📊 Todos los datos de evaluados han sido eliminados.');
    console.log('📝 El Cuestionario Psicofinanciero y sus preguntas se mantienen intactos.');
    console.log('\n🎯 Ahora puedes comenzar a enviar nuevas invitaciones.\n');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

// Ejecutar
limpiarDatos();
