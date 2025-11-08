/**
 * FUNCIONES DE BASE DE DATOS PARA PAREAMIENTO FORZADO
 * 
 * Este módulo contiene funciones específicas para trabajar con el sistema
 * de pareamiento forzado de reactivos.
 */

import { createAdminClient } from './server';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ParReactivos {
  pairId: string;
  seccion: 'POSITIVOS' | 'NEGATIVOS' | 'LIKERT';
  ordenGlobal: number;
  reactivo1: {
    id: string;
    texto: string;
    tipo: 'POS' | 'NEG' | 'LIKERT';
    puntosSiElegido: number | null;
    puntosSiNoElegido: number | null;
    ordenEnPar: number;
    escala: {
      id: string;
      codigo: string;
      nombre: string;
    };
  };
  reactivo2: {
    id: string;
    texto: string;
    tipo: 'POS' | 'NEG' | 'LIKERT';
    puntosSiElegido: number | null;
    puntosSiNoElegido: number | null;
    ordenEnPar: number;
    escala: {
      id: string;
      codigo: string;
      nombre: string;
    };
  };
}

export interface PreguntaLikert {
  id: string;
  texto: string;
  descripcion?: string;
  orden: number;
  escala?: {
    id: string;
    codigo: string;
    nombre: string;
  };
}

export interface ConfiguracionCuestionario {
  id: string;
  cuestionarioId: string;
  totalParesPositivos: number;
  totalParesNegativos: number;
  totalPreguntasLikert: number;
  ordenSecciones: string[];
  configuracion: Record<string, unknown>;
}

export interface CompetenciaEscalaInput {
  competenciaId: string;
  [key: string]: unknown;
}

export interface NormaDecilInput {
  targetTipo: string;
  targetCodigo: string;
  [key: string]: unknown;
}

// ============================================
// FUNCIONES PARA OBTENER PARES
// ============================================

/**
 * Obtiene todos los pares de reactivos de una sección específica
 */
export async function getParesPorSeccion(
  seccion: 'POSITIVOS' | 'NEGATIVOS'
): Promise<ParReactivos[]> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Reactivo')
    .select(`
      id,
      pairId,
      texto,
      tipo,
      puntosSiElegido,
      puntosSiNoElegido,
      ordenEnPar,
      seccion,
      ordenGlobal,
      escala:Escala!inner(
        id,
        codigo,
        nombre
      )
    `)
    .eq('seccion', seccion)
    .eq('activo', true)
    .order('ordenGlobal', { ascending: true });

  if (error) throw error;

  // Agrupar reactivos por pairId
  const paresMap = new Map<string, Array<typeof data[0]>>();
  
  for (const reactivo of data || []) {
    const pairId = reactivo.pairId;
    if (!paresMap.has(pairId)) {
      paresMap.set(pairId, []);
    }
    paresMap.get(pairId)!.push(reactivo);
  }

  // Construir array de pares completos
  const pares: ParReactivos[] = [];
  
  for (const [pairId, reactivos] of paresMap.entries()) {
    if (reactivos.length !== 2) {
      console.warn(`Par ${pairId} incompleto: tiene ${reactivos.length} reactivos`);
      continue;
    }

    const r1 = reactivos.find(r => r.ordenEnPar === 1);
    const r2 = reactivos.find(r => r.ordenEnPar === 2);

    if (!r1 || !r2) {
      console.warn(`Par ${pairId} mal formado: no tiene ordenEnPar 1 y 2`);
      continue;
    }

    pares.push({
      pairId,
      seccion: r1.seccion,
      ordenGlobal: r1.ordenGlobal,
      reactivo1: {
        id: r1.id,
        texto: r1.texto,
        tipo: r1.tipo,
        puntosSiElegido: r1.puntosSiElegido,
        puntosSiNoElegido: r1.puntosSiNoElegido,
        ordenEnPar: r1.ordenEnPar,
        escala: Array.isArray(r1.escala) ? r1.escala[0] : r1.escala
      },
      reactivo2: {
        id: r2.id,
        texto: r2.texto,
        tipo: r2.tipo,
        puntosSiElegido: r2.puntosSiElegido,
        puntosSiNoElegido: r2.puntosSiNoElegido,
        ordenEnPar: r2.ordenEnPar,
        escala: Array.isArray(r2.escala) ? r2.escala[0] : r2.escala
      }
    });
  }

  return pares.sort((a, b) => a.ordenGlobal - b.ordenGlobal);
}

/**
 * Obtiene un par específico por su pairId
 */
export async function getParPorId(pairId: string): Promise<ParReactivos | null> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Reactivo')
    .select(`
      id,
      pairId,
      texto,
      tipo,
      puntosSiElegido,
      puntosSiNoElegido,
      ordenEnPar,
      seccion,
      ordenGlobal,
      escala:Escala!inner(
        id,
        codigo,
        nombre
      )
    `)
    .eq('pairId', pairId)
    .eq('activo', true);

  if (error) throw error;
  if (!data || data.length !== 2) return null;

  const r1 = data.find(r => r.ordenEnPar === 1);
  const r2 = data.find(r => r.ordenEnPar === 2);

  if (!r1 || !r2) return null;

  return {
    pairId,
    seccion: r1.seccion,
    ordenGlobal: r1.ordenGlobal,
    reactivo1: {
      id: r1.id,
      texto: r1.texto,
      tipo: r1.tipo,
      puntosSiElegido: r1.puntosSiElegido,
      puntosSiNoElegido: r1.puntosSiNoElegido,
      ordenEnPar: r1.ordenEnPar,
      escala: Array.isArray(r1.escala) ? r1.escala[0] : r1.escala
    },
    reactivo2: {
      id: r2.id,
      texto: r2.texto,
      tipo: r2.tipo,
      puntosSiElegido: r2.puntosSiElegido,
      puntosSiNoElegido: r2.puntosSiNoElegido,
      ordenEnPar: r2.ordenEnPar,
      escala: Array.isArray(r2.escala) ? r2.escala[0] : r2.escala
    }
  };
}

// ============================================
// FUNCIONES PARA PREGUNTAS LIKERT
// ============================================

/**
 * Obtiene todas las preguntas Likert
 */
export async function getPreguntasLikert(): Promise<PreguntaLikert[]> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Reactivo')
    .select(`
      id,
      texto,
      tipo,
      ordenGlobal,
      escala:Escala!inner(
        id,
        codigo,
        nombre
      )
    `)
    .eq('tipo', 'LIKERT')
    .eq('seccion', 'LIKERT')
    .eq('activo', true)
    .order('ordenGlobal', { ascending: true });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    texto: item.texto,
    orden: item.ordenGlobal,
    escala: Array.isArray(item.escala) ? item.escala[0] : item.escala
  }));
}

// ============================================
// FUNCIONES PARA CONFIGURACIÓN
// ============================================

/**
 * Obtiene la configuración del cuestionario
 */
export async function getConfiguracionCuestionario(
  cuestionarioId: string
): Promise<ConfiguracionCuestionario | null> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('ConfiguracionCuestionario')
    .select('*')
    .eq('cuestionarioId', cuestionarioId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Crea o actualiza la configuración del cuestionario
 */
export async function upsertConfiguracionCuestionario(
  cuestionarioId: string,
  config: Partial<ConfiguracionCuestionario>
): Promise<ConfiguracionCuestionario> {
  const supabaseAdmin = await createAdminClient();
  
  const { data: existing } = await supabaseAdmin
    .from('ConfiguracionCuestionario')
    .select('id')
    .eq('cuestionarioId', cuestionarioId)
    .single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('ConfiguracionCuestionario')
      .update({
        ...config,
        updatedAt: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('ConfiguracionCuestionario')
      .insert({
        cuestionarioId,
        ...config
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

//
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida la integridad de todos los pares
 */
export async function validarIntegridadPares(): Promise<unknown[]> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin.rpc('validar_integridad_pares');
  if (error) throw error;
  return data || [];
}

/**
 * Valida la estructura de todas las escalas
 */
export async function validarEscalas(): Promise<unknown[]> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin.rpc('validar_escalas');
  if (error) throw error;
  return data || [];
}

/**
 * Obtiene estadísticas del cuestionario
 */
export async function getEstadisticasCuestionario(): Promise<unknown[]> {
  const supabaseAdmin = await createAdminClient();
  
  const { data, error } = await supabaseAdmin.rpc('estadisticas_cuestionario');
  if (error) throw error;
  return data || [];
}

// ============================================

/**
 * Importa múltiples reactivos en una transacción
 */
export async function importarReactivos(reactivos: unknown[]): Promise<void> {
  const supabaseAdmin = await createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Reactivo')
    .insert(reactivos);

  if (error) throw error;
}

/**
 * Importa múltiples escalas
 */
export async function importarEscalas(escalas: unknown[]): Promise<void> {
  const supabaseAdmin = await createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Escala')
    .upsert(escalas, { onConflict: 'codigo' });
  if (error) throw error;
}

/**
 * Importa múltiples competencias
 */
export async function importarCompetencias(competencias: unknown[]): Promise<void> {
  const supabaseAdmin = await createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Competencia')
    .upsert(competencias, { onConflict: 'codigo' });
  if (error) throw error;
}

/**
 * Importa relaciones CompetenciaEscala
 */
export async function importarCompetenciaEscalas(relaciones: CompetenciaEscalaInput[]): Promise<void> {
  const supabaseAdmin = await createAdminClient();
  
  const competenciaIds = [...new Set(relaciones.map(r => r.competenciaId))];

  for (const compId of competenciaIds) {
    const { error: delError } = await supabaseAdmin
      .from('CompetenciaEscala')
      .delete()
      .eq('competenciaId', compId);
    if (delError) throw delError;
  }

  const { error } = await supabaseAdmin
    .from('CompetenciaEscala')
    .insert(relaciones);

  if (error) throw error;
}

/**
 * Importa normas decílicas
 */
export async function importarNormasDeciles(normas: NormaDecilInput[]): Promise<void> {
  const supabaseAdmin = await createAdminClient();
  
  // Agrupar por targetTipo y targetCodigo
  const grupos = new Map<string, NormaDecilInput[]>();
  
  for (const norma of normas) {
    const key = `${norma.targetTipo}-${norma.targetCodigo}`;
    if (!grupos.has(key)) {
      grupos.set(key, []);
    }
    grupos.get(key)!.push(norma);
  }

  // Eliminar normas existentes e insertar nuevas por grupo
  for (const [, normasGrupo] of grupos.entries()) {
    const { targetTipo, targetCodigo } = normasGrupo[0] as NormaDecilInput;
    
    const { error: delError } = await supabaseAdmin
      .from('NormaDecil')
      .delete()
      .eq('targetTipo', targetTipo)
      .eq('targetCodigo', targetCodigo);
    if (delError) throw delError;

    const { error } = await supabaseAdmin
      .from('NormaDecil')
      .insert(normasGrupo);

    if (error) throw error;
  }
}

// ============================================
// FUNCIONES PARA OBTENER DATOS COMPLETOS
// ============================================

/**
 * Obtiene todos los datos necesarios para el cuestionario
 */
export async function getDatosCuestionarioCompleto(cuestionarioId: string) {
  const [
    paresPositivos,
    paresNegativos,
    preguntasLikert,
    configuracion
  ] = await Promise.all([
    getParesPorSeccion('POSITIVOS'),
    getParesPorSeccion('NEGATIVOS'),
    getPreguntasLikert(),
    getConfiguracionCuestionario(cuestionarioId)
  ]);

  return {
    paresPositivos,
    paresNegativos,
    preguntasLikert,
    configuracion,
    totales: {
      paresPositivos: paresPositivos.length,
      paresNegativos: paresNegativos.length,
      preguntasLikert: preguntasLikert.length,
      total: paresPositivos.length + paresNegativos.length + preguntasLikert.length
    }
  };
}

/**
 * Obtiene el progreso de un evaluado en el cuestionario
 */
export async function getProgresoCuestionario(evaluadoId: string) {
  const supabaseAdmin = await createAdminClient();
  
  // Obtener todas las respuestas del evaluado
  const { data: respuestas, error } = await supabaseAdmin
    .from('Respuesta')
    .select('preguntaId')
    .eq('evaluadoId', evaluadoId);

  if (error) throw error;

  // Obtener totales esperados
  const [paresPositivos, paresNegativos, preguntasLikert] = await Promise.all([
    getParesPorSeccion('POSITIVOS'),
    getParesPorSeccion('NEGATIVOS'),
    getPreguntasLikert()
  ]);

  const totalEsperado = paresPositivos.length + paresNegativos.length + preguntasLikert.length;
  const totalRespondidas = respuestas?.length || 0;

  return {
    totalEsperado,
    totalRespondidas,
    porcentaje: totalEsperado > 0 ? (totalRespondidas / totalEsperado) * 100 : 0,
    completado: totalRespondidas >= totalEsperado,
    desglose: {
      paresPositivos: {
        total: paresPositivos.length,
        respondidas: 0 // TODO: calcular por sección
      },
      paresNegativos: {
        total: paresNegativos.length,
        respondidas: 0
      },
      preguntasLikert: {
        total: preguntasLikert.length,
        respondidas: 0
      }
    }
  };
}

/**
 * Funciones específicas para el sistema de pareamiento forzado
 */

/**
 * Obtener reactivos por orden de par en el cuestionario
 * 
 * VERSIÓN TEMPORAL: Busca por índice de par en lugar de ordenGlobal
 * ya que ordenGlobal está null en la BD actual
 * 
 * @param ordenPares - Array de órdenes de pares (ej: [1, 2, 3])
 * @returns Array de reactivos con sus escalas
 */
export async function getReactivosByOrdenPares(ordenPares: number[]) {
  const supabaseAdmin = await createAdminClient();
  
  console.log(`  🔍 Buscando reactivos para órdenes: ${ordenPares.slice(0, 5).join(', ')}...`);
  
  // SOLUCIÓN TEMPORAL: Como ordenGlobal está null, vamos a obtener TODOS los reactivos
  // y luego filtrarlos por índice
  const { data: todosReactivos, error } = await supabaseAdmin
    .from('Reactivo')
    .select(`
      id,
      pairId,
      ordenEnPar,
      puntosSiElegido,
      puntosSiNoElegido,
      tipo,
      ordenGlobal,
      escala:Escala(
        id,
        codigo,
        nombre
      )
    `)
    .eq('tipo', 'POS')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener reactivos:', error);
    throw error;
  }

  if (!todosReactivos || todosReactivos.length === 0) {
    console.log('  ⚠️  No se encontraron reactivos en la base de datos');
    return [];
  }

  console.log(`  📋 Total de reactivos POS en BD: ${todosReactivos.length}`);

  // Agrupar por pairId para obtener pares únicos
  const paresMap = new Map<string, Array<typeof todosReactivos[0]>>();
  for (const reactivo of todosReactivos) {
    const pairId = reactivo.pairId;
    if (!paresMap.has(pairId)) {
      paresMap.set(pairId, []);
    }
    paresMap.get(pairId)!.push(reactivo);
  }

  const paresUnicos = Array.from(paresMap.keys());
  console.log(`  📋 Total de pares únicos: ${paresUnicos.length}`);

  // Seleccionar los pares según los índices solicitados
  const paresSeleccionados: string[] = [];
  const ordenParMap = new Map<string, number>(); // Mapeo de pairId -> orden original
  
  for (const orden of ordenPares) {
    // orden - 1 porque los arrays empiezan en 0
    const index = orden - 1;
    if (index >= 0 && index < paresUnicos.length) {
      const pairId = paresUnicos[index];
      paresSeleccionados.push(pairId);
      ordenParMap.set(pairId, orden); // Guardar el orden original
    }
  }

  console.log(`  📋 Pares seleccionados: ${paresSeleccionados.length}`);

  if (paresSeleccionados.length === 0) {
    return [];
  }

  // Obtener todos los reactivos de esos pares
  const { data: reactivosFinales, error: errorFinales } = await supabaseAdmin
    .from('Reactivo')
    .select(`
      id,
      pairId,
      ordenEnPar,
      puntosSiElegido,
      puntosSiNoElegido,
      tipo,
      ordenGlobal,
      escala:Escala(
        id,
        codigo,
        nombre
      )
    `)
    .in('pairId', paresSeleccionados);

  if (errorFinales) {
    console.error('Error al obtener reactivos finales:', errorFinales);
    throw errorFinales;
  }

  console.log(`  ✅ Reactivos encontrados: ${reactivosFinales?.length || 0}`);

  // Agregar el orden original a cada reactivo
  const reactivosConOrden = (reactivosFinales || []).map(r => ({
    ...r,
    ordenPar: ordenParMap.get(r.pairId) || 0
  }));

  return reactivosConOrden;
}

/**
 * Obtener un par de reactivos por su orden en el cuestionario
 * 
 * @param ordenPar - Orden del par (1, 2, 3, ..., 168)
 * @returns Par de reactivos (positivo y negativo)
 */
export async function getParByOrden(ordenPar: number) {
  const reactivos = await getReactivosByOrdenPares([ordenPar]);
  
  if (reactivos.length < 1) {
    console.warn(`Par ${ordenPar} no encontrado`);
    return null;
  }

  // Como solo hay reactivos POS, retornar lo que haya
  return {
    positivo: reactivos[0],
    negativo: reactivos[1] || null
  };
}