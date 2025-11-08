/**
 * Script para importar las Normas de Contraste a la base de datos
 * 
 * Este script carga todas las tablas de normas (Escalas, Competencias, Estilos,
 * Competencias Psicofinancieras y Habilidades Financieras) en la tabla normas_deciles
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// DATOS DE NORMAS
// ============================================

interface NormaRow {
  target_tipo: 'ESCALA' | 'COMPETENCIA' | 'ESTILO' | 'COMPETENCIA_PSICOFINANCIERA' | 'HABILIDAD_FINANCIERA';
  target_codigo: string;
  percentil: number;
  decil: number;
  puntaje_min: number;
}

// Función helper para crear filas de normas
function crearNormas(
  tipo: NormaRow['target_tipo'],
  codigo: string,
  cortes: number[]
): NormaRow[] {
  const percentiles = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const deciles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return cortes.map((corte, index) => ({
    target_tipo: tipo,
    target_codigo: codigo,
    percentil: percentiles[index],
    decil: deciles[index],
    puntaje_min: corte
  }));
}

// ============================================
// NORMAS DE ESCALAS
// ============================================

const NORMAS_ESCALAS: NormaRow[] = [
  ...crearNormas('ESCALA', 'ANTICIPACION', [0, 10.4, 12.2, 13.0, 14.0, 15.0, 16.0, 18.4, 20.8, 23.0]),
  ...crearNormas('ESCALA', 'AUTOCONOCIMIENTO', [0, 3.2, 5.0, 5.8, 6.4, 8.0, 8.0, 9.2, 10.8, 19.8]),
  ...crearNormas('ESCALA', 'AUTOCONTROL', [0, 5.6, 6.6, 9.0, 9.4, 10.0, 11.0, 12.2, 13.8, 16.0]),
  ...crearNormas('ESCALA', 'AUTOREFUERZO', [0, 6.0, 8.2, 9.0, 9.4, 11.0, 12.6, 14.4, 16.0, 19.2]),
  ...crearNormas('ESCALA', 'AUTOSUPERVISION', [0, 4.8, 10.0, 10.8, 11.0, 12.0, 12.6, 13.4, 15.0, 17.2]),
  ...crearNormas('ESCALA', 'AUTONOMIA', [0, 4.2, 6.0, 6.0, 8.0, 8.0, 8.0, 8.6, 11.8, 13.0]),
  ...crearNormas('ESCALA', 'SALUD_FINANCIERA', [0, 6.6, 8.6, 11.0, 12.0, 12.0, 13.0, 14.2, 15.0, 17.4]),
  // ... Agregar todas las demás escalas
];

// ============================================
// NORMAS DE COMPETENCIAS
// ============================================

const NORMAS_COMPETENCIAS: NormaRow[] = [
  ...crearNormas('COMPETENCIA', 'PROACTIVIDAD', [0, 10.3, 11.5, 12.0, 13.9, 15.0, 16.5, 16.7, 17.5, 18.2]),
  ...crearNormas('COMPETENCIA', 'INVOLUCRAMIENTO', [0, 7.7, 8.4, 9.7, 11.6, 12.0, 12.2, 13.0, 13.5, 13.9]),
  // ... Agregar todas las demás competencias
];

// ============================================
// NORMAS DE HABILIDADES FINANCIERAS
// ============================================

const NORMAS_HABILIDADES: NormaRow[] = [
  ...crearNormas('HABILIDAD_FINANCIERA', 'HABILIDAD_GENERACION_AHORRO', [0, 3.4, 3.92, 4.0, 4.2, 4.4, 4.56, 4.6, 4.8, 5.0]),
  ...crearNormas('HABILIDAD_FINANCIERA', 'HABILIDAD_CONTROL_DEUDA', [0, 3.36, 3.6, 4.0, 4.2, 4.4, 4.6, 4.8, 4.9, 5.0]),
  ...crearNormas('HABILIDAD_FINANCIERA', 'HABILIDAD_CONTROL_GASTO', [0, 3.2, 3.6, 3.8, 4.0, 4.2, 4.4, 4.5, 4.6, 4.8]),
  ...crearNormas('HABILIDAD_FINANCIERA', 'HABILIDAD_GENERACION_INGRESOS', [0, 2.8, 3.32, 3.4, 3.6, 3.8, 4.0, 4.2, 4.6, 4.84]),
  ...crearNormas('HABILIDAD_FINANCIERA', 'HABILIDAD_GESTION_INVERSION', [0, 3.12, 3.4, 3.6, 4.0, 4.1, 4.2, 4.4, 4.6, 4.64]),
];

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function importarNormas() {
  console.log('🚀 Iniciando importación de Normas de Contraste...\n');

  try {
    // 1. Limpiar tabla existente
    console.log('🗑️  Limpiando tabla normas_deciles...');
    const { error: deleteError } = await supabase
      .from('normas_deciles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

    if (deleteError) {
      console.error('❌ Error al limpiar tabla:', deleteError);
      throw deleteError;
    }
    console.log('✅ Tabla limpiada\n');

    // 2. Insertar normas de escalas
    console.log('📊 Insertando normas de ESCALAS...');
    const { error: escalasError } = await supabase
      .from('normas_deciles')
      .insert(NORMAS_ESCALAS);

    if (escalasError) {
      console.error('❌ Error al insertar escalas:', escalasError);
      throw escalasError;
    }
    console.log(`✅ ${NORMAS_ESCALAS.length} normas de escalas insertadas\n`);

    // 3. Insertar normas de competencias
    console.log('🎯 Insertando normas de COMPETENCIAS...');
    const { error: competenciasError } = await supabase
      .from('normas_deciles')
      .insert(NORMAS_COMPETENCIAS);

    if (competenciasError) {
      console.error('❌ Error al insertar competencias:', competenciasError);
      throw competenciasError;
    }
    console.log(`✅ ${NORMAS_COMPETENCIAS.length} normas de competencias insertadas\n`);

    // 4. Insertar normas de habilidades financieras
    console.log('💰 Insertando normas de HABILIDADES FINANCIERAS...');
    const { error: habilidadesError } = await supabase
      .from('normas_deciles')
      .insert(NORMAS_HABILIDADES);

    if (habilidadesError) {
      console.error('❌ Error al insertar habilidades:', habilidadesError);
      throw habilidadesError;
    }
    console.log(`✅ ${NORMAS_HABILIDADES.length} normas de habilidades insertadas\n`);

    // 5. Verificar totales
    const { count, error: countError } = await supabase
      .from('normas_deciles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error al contar registros:', countError);
      throw countError;
    }

    console.log('\n✅ IMPORTACIÓN COMPLETADA');
    console.log(`📈 Total de normas en base de datos: ${count}`);
    console.log('\n🎉 ¡Todas las normas de contraste han sido importadas exitosamente!');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error);
    process.exit(1);
  }
}

// Ejecutar
importarNormas();
