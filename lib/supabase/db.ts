import { createAdminClient } from './server';

// Helper types for database operations
export type DbResult<T> = {
  data: T | null;
  error: Error | null;
};

// Get admin client
async function getAdminClient() {
  return await createAdminClient();
}

// Cuestionarios
export async function getCuestionarios(activo?: boolean) {
  const supabaseAdmin = await getAdminClient();
  
  let query = supabaseAdmin
    .from('Cuestionario')
    .select(`
      *,
      preguntas:Pregunta(count),
      invitaciones:Invitacion(count)
    `)
    .order('createdAt', { ascending: false });

  if (activo !== undefined) {
    query = query.eq('activo', activo);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform to match expected format
  return data?.map(item => ({
    ...item,
    _count: {
      preguntas: item.preguntas?.[0]?.count || 0,
      invitaciones: item.invitaciones?.[0]?.count || 0
    }
  }));
}

export async function getCuestionarioById(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Cuestionario')
    .select(`
      *,
      preguntas:Pregunta(
        *,
        opciones:OpcionRespuesta(*),
        escala:Escala(*)
      )
    `)
    .eq('id', id)
    .order('orden', { foreignTable: 'Pregunta', ascending: true })
    .order('orden', { foreignTable: 'Pregunta.OpcionRespuesta', ascending: true })
    .single();

  if (error) throw error;
  return data;
}

export async function createCuestionario(data: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data: cuestionario, error } = await supabaseAdmin
    .from('Cuestionario')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return cuestionario;
}

export async function updateCuestionario(id: string, data: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data: cuestionario, error } = await supabaseAdmin
    .from('Cuestionario')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return cuestionario;
}

export async function deleteCuestionario(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Cuestionario')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Preguntas
export async function getPreguntasByCuestionarioId(cuestionarioId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Pregunta')
    .select(`
      *,
      opciones:OpcionRespuesta(*),
      escala:Escala(*)
    `)
    .eq('cuestionarioId', cuestionarioId)
    .order('orden', { ascending: true })
    .order('orden', { foreignTable: 'OpcionRespuesta', ascending: true });

  if (error) throw error;
  return data;
}

export async function getPreguntaById(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Pregunta')
    .select(`
      *,
      opciones:OpcionRespuesta(*),
      escala:Escala(*),
      cuestionario:Cuestionario(*)
    `)
    .eq('id', id)
    .order('orden', { foreignTable: 'OpcionRespuesta', ascending: true })
    .single();

  if (error) throw error;
  return data;
}

export async function createPregunta(
  data: Record<string, unknown>,
  opciones?: Array<{ texto: string; valor?: number; orden?: number }>
) {
  const supabaseAdmin = await getAdminClient();
  
  // Create pregunta
  const { data: pregunta, error: preguntaError } = await supabaseAdmin
    .from('Pregunta')
    .insert(data)
    .select()
    .single();

  if (preguntaError) throw preguntaError;

  // Create opciones if provided
  if (opciones && opciones.length > 0) {
    const opcionesData = opciones.map((opcion, index) => ({
      preguntaId: pregunta.id,
      texto: opcion.texto,
      valor: opcion.valor ?? index + 1,
      orden: opcion.orden ?? index + 1
    }));

    const { error: opcionesError } = await supabaseAdmin
      .from('OpcionRespuesta')
      .insert(opcionesData);

    if (opcionesError) throw opcionesError;
  }

  // Return pregunta with opciones
  return getPreguntaById(pregunta.id);
}

export async function updatePregunta(id: string, data: Record<string, unknown>, opciones?: Array<{ texto: string; valor?: number; orden?: number }>) {
  const supabaseAdmin = await getAdminClient();
  
  // Update pregunta
  const { error: preguntaError } = await supabaseAdmin
    .from('Pregunta')
    .update(data)
    .eq('id', id);

  if (preguntaError) throw preguntaError;

  // Update opciones if provided
  if (opciones !== undefined) {
    // Delete existing opciones
    await supabaseAdmin
      .from('OpcionRespuesta')
      .delete()
      .eq('preguntaId', id);

    // Insert new opciones
    if (opciones.length > 0) {
      const opcionesData = opciones.map((opcion, index) => ({
        preguntaId: id,
        texto: opcion.texto,
        valor: opcion.valor ?? index + 1,
        orden: opcion.orden ?? index + 1
      }));

      const { error: opcionesError } = await supabaseAdmin
        .from('OpcionRespuesta')
        .insert(opcionesData);

      if (opcionesError) throw opcionesError;
    }
  }

  return getPreguntaById(id);
}

export async function deletePregunta(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Pregunta')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getMaxOrdenPregunta(cuestionarioId: string): Promise<number> {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Pregunta')
    .select('orden')
    .eq('cuestionarioId', cuestionarioId)
    .order('orden', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data?.orden ?? 0;
}

// Invitaciones
export async function getAllInvitaciones() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Invitacion')
    .select(`
      *,
      evaluado:Evaluado(*),
      cuestionario:Cuestionario(id, titulo)
    `)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInvitacionByToken(token: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Invitacion')
    .select(`
      *,
      evaluado:Evaluado(*),
      cuestionario:Cuestionario(
        *,
        preguntas:Pregunta(
          *,
          opciones:OpcionRespuesta(*),
          escala:Escala(*)
        )
      )
    `)
    .eq('token', token)
    .eq('estado', 'activa')
    .gte('fechaExpiracion', new Date().toISOString())
    .order('orden', { foreignTable: 'cuestionario.preguntas', ascending: true })
    .order('orden', { foreignTable: 'cuestionario.preguntas.OpcionRespuesta', ascending: true })
    .single();

  if (error) throw error;
  return data;
}

export async function createInvitacion(data: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data: invitacion, error } = await supabaseAdmin
    .from('Invitacion')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return invitacion;
}

export async function updateInvitacionesEstado(evaluadoId: string, estado: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Invitacion')
    .update({ estado })
    .eq('evaluadoId', evaluadoId)
    .eq('estado', 'activa');

  if (error) throw error;
}

export async function deleteInvitacion(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Invitacion')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Evaluados
export async function getAllEvaluados(cuestionarioId?: string) {
  const supabaseAdmin = await getAdminClient();
  
  let query = supabaseAdmin
    .from('Evaluado')
    .select(`
      *,
      invitaciones:Invitacion(count),
      respuestas:RespuestaCustom(count),
      resultados:Resultado(count)
    `)
    .order('createdAt', { ascending: false });

  // Si se proporciona un cuestionarioId, filtrar evaluados que tengan invitaciones para ese cuestionario
  if (cuestionarioId) {
    // Primero obtenemos los IDs de evaluados que tienen invitaciones para este cuestionario
    const { data: invitaciones } = await supabaseAdmin
      .from('Invitacion')
      .select('evaluadoId')
      .eq('cuestionarioId', cuestionarioId);
    
    if (invitaciones && invitaciones.length > 0) {
      const evaluadoIds = [...new Set(invitaciones.map(inv => inv.evaluadoId))];
      query = query.in('id', evaluadoIds);
    } else {
      // Si no hay invitaciones para este cuestionario, retornar array vacío
      return [];
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform to match expected format
  return data?.map(item => ({
    ...item,
    _count: {
      invitaciones: item.invitaciones?.[0]?.count || 0,
      respuestas: item.respuestas?.[0]?.count || 0,
      resultados: item.resultados?.[0]?.count || 0
    }
  }));
}

export async function getEvaluadoById(id: string) {
   const supabaseAdmin = await getAdminClient();
   
   const { data, error } = await supabaseAdmin
     .from('Evaluado')
     .select(`
       *,
       invitaciones:Invitacion(
         *,
         cuestionario:Cuestionario(id, titulo)
       ),
       respuestas:RespuestaCustom(*),
       resultados:Resultado(*)
     `)
     .eq('id', id)
     .single();

   if (error) throw error;
   
   // Fetch preguntas and reactivos separately to enrich respuestas
   if (data && data.respuestas && data.respuestas.length > 0) {
     const preguntaIds = [...new Set(data.respuestas.map((r: any) => r.preguntaId))];
     
     // Fetch from Pregunta table
     const { data: preguntas } = await supabaseAdmin
       .from('Pregunta')
       .select(`
         id,
         texto,
         tipo,
         cuestionarioId,
         opciones:OpcionRespuesta(id, texto, valor)
       `)
       .in('id', preguntaIds);
     
     // Fetch from Reactivo table (for pair-based questions)
     const { data: reactivos } = await supabaseAdmin
       .from('Reactivo')
       .select(`
         id,
         texto,
         tipo,
         pairId,
         ordenEnPar,
         escala:Escala(id, codigo, nombre)
       `)
       .in('id', preguntaIds);
     
     // If we have reactivos with pairId, fetch ALL reactivos in those pairs
     let allPairReactivos: any[] = [];
     if (reactivos && reactivos.length > 0) {
       const pairIds = [...new Set(reactivos.map((r: any) => r.pairId).filter(Boolean))];
       if (pairIds.length > 0) {
         const { data: allReactivos } = await supabaseAdmin
           .from('Reactivo')
           .select(`
             id,
             texto,
             tipo,
             pairId,
             ordenEnPar,
             escala:Escala(id, codigo, nombre)
           `)
           .in('pairId', pairIds);
         allPairReactivos = allReactivos || [];
       }
     }
     
     // Create maps
     const preguntasMap = new Map((preguntas || []).map((p: any) => [p.id, p]));
     const reactivosMap = new Map((reactivos || []).map((r: any) => [r.id, r]));
     
     // Create a map of pairId -> [reactivo1, reactivo2]
     const pairsMap = new Map<string, any[]>();
     for (const reactivo of allPairReactivos) {
       if (!pairsMap.has(reactivo.pairId)) {
         pairsMap.set(reactivo.pairId, []);
       }
       pairsMap.get(reactivo.pairId)!.push(reactivo);
     }
     
     // Enrich respuestas with pregunta or reactivo data
     data.respuestas = data.respuestas.map((r: any) => {
       const pregunta = preguntasMap.get(r.preguntaId) || reactivosMap.get(r.preguntaId);
       
       // If it's a reactivo with a pair, add both reactivos of the pair
       if (pregunta && pregunta.pairId && pairsMap.has(pregunta.pairId)) {
         const pairReactivos = pairsMap.get(pregunta.pairId)!;
         const reactivo1 = pairReactivos.find((re: any) => re.ordenEnPar === 1);
         const reactivo2 = pairReactivos.find((re: any) => re.ordenEnPar === 2);
         
         return {
           ...r,
           pregunta,
           pairReactivos: {
             reactivo1,
             reactivo2
           }
         };
       }
       
       return {
         ...r,
         pregunta: pregunta || null
       };
     });
   }
   
   return data;
}

export async function upsertEvaluado(correo: string, nombre: string) {
  const supabaseAdmin = await getAdminClient();
  
  // Check if evaluado exists
  const { data: existing } = await supabaseAdmin
    .from('Evaluado')
    .select('*')
    .eq('correo', correo)
    .single();

  if (existing) {
    // Update
    const { data, error } = await supabaseAdmin
      .from('Evaluado')
      .update({ nombre })
      .eq('correo', correo)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create
    const { data, error } = await supabaseAdmin
      .from('Evaluado')
      .insert({ correo, nombre })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function updateEvaluadoEstado(id: string, estado: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('Evaluado')
    .update({ estado })
    .eq('id', id);

  if (error) throw error;
}

// Respuestas
export async function upsertRespuesta(evaluadoId: string, preguntaId: number, respuesta: number) {
  const supabaseAdmin = await getAdminClient();
  
  // Check if exists
  const { data: existing } = await supabaseAdmin
    .from('Respuesta')
    .select('id')
    .eq('evaluadoId', evaluadoId)
    .eq('preguntaId', preguntaId)
    .single();

  if (existing) {
    // Update
    const { error } = await supabaseAdmin
      .from('Respuesta')
      .update({ respuesta, updatedAt: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    // Insert
    const { error } = await supabaseAdmin
      .from('Respuesta')
      .insert({ evaluadoId, preguntaId, respuesta });

    if (error) throw error;
  }
}

export async function getRespuestasByEvaluadoId(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Respuesta')
    .select('*')
    .eq('evaluadoId', evaluadoId);

  if (error) throw error;
  return data;
}

// Respuestas Custom
export async function upsertRespuestaCustom(
  evaluadoId: string,
  preguntaId: string,
  valorNumerico?: number,
  valorTexto?: string,
  valoresMultiples?: string[] | number[] | Record<string, unknown> | null
) {
  const supabaseAdmin = await getAdminClient();
  
  // Check if exists
  const { data: existing } = await supabaseAdmin
    .from('RespuestaCustom')
    .select('id')
    .eq('evaluadoId', evaluadoId)
    .eq('preguntaId', preguntaId)
    .single();

  const updateData = {
    valorNumerico: valorNumerico ?? null,
    valorTexto: valorTexto ?? null,
    valoresMultiples: valoresMultiples ?? null,
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    // Update
    const { data, error } = await supabaseAdmin
      .from('RespuestaCustom')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert
    const { data, error } = await supabaseAdmin
      .from('RespuestaCustom')
      .insert({
        evaluadoId,
        preguntaId,
        ...updateData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getRespuestasCustomByEvaluadoId(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('RespuestaCustom')
    .select('*')
    .eq('evaluadoId', evaluadoId);

  if (error) throw error;
  return data;
}

// Escalas
export async function getEscalaByCodigo(codigo: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Escala')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertEscala(
  dataOrCodigo: string | { codigo: string; nombre?: string },
  nombre?: string
) {
  const supabaseAdmin = await getAdminClient();
  
  // Support both signatures: upsertEscala({codigo, nombre}) and upsertEscala(codigo, nombre)
  const codigo = typeof dataOrCodigo === 'string' ? dataOrCodigo : dataOrCodigo.codigo;
  const finalNombre = nombre || (typeof dataOrCodigo === 'object' ? dataOrCodigo.nombre : undefined);
  
  const { data: existing } = await supabaseAdmin
    .from('Escala')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('Escala')
      .update({ nombre: finalNombre })
      .eq('codigo', codigo)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('Escala')
      .insert({ codigo, nombre: finalNombre })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Competencias
export async function getCompetenciaByCodigo(codigo: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Competencia')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertCompetencia(
  dataOrCodigo: string | { codigo: string; nombre?: string },
  nombre?: string
) {
  const supabaseAdmin = await getAdminClient();
  
  // Support both signatures: upsertCompetencia({codigo, nombre}) and upsertCompetencia(codigo, nombre)
  const codigo = typeof dataOrCodigo === 'string' ? dataOrCodigo : dataOrCodigo.codigo;
  const finalNombre = nombre || (typeof dataOrCodigo === 'object' ? dataOrCodigo.nombre : undefined);
  
  const { data: existing } = await supabaseAdmin
    .from('Competencia')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('Competencia')
      .update({ nombre: finalNombre })
      .eq('codigo', codigo)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('Competencia')
      .insert({ codigo, nombre: finalNombre })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Competencia Escala
type CompetenciaEscalaInput = {
  competenciaId: string;
  escalaId?: string;
  peso?: number;
};

export async function upsertCompetenciaEscala(
  dataOrCompetenciaId: string | CompetenciaEscalaInput,
  escalaId?: string,
  peso?: number
) {
  const supabaseAdmin = await getAdminClient();
  
  // Support both signatures
  const competenciaId = typeof dataOrCompetenciaId === 'string' ? dataOrCompetenciaId : dataOrCompetenciaId.competenciaId;
  const finalEscalaId = escalaId || (typeof dataOrCompetenciaId === 'object' ? dataOrCompetenciaId.escalaId : undefined);
  const finalPeso = peso || (typeof dataOrCompetenciaId === 'object' ? dataOrCompetenciaId.peso : undefined) || 1;
  
  const { data: existing } = await supabaseAdmin
    .from('CompetenciaEscala')
    .select('*')
    .eq('competenciaId', competenciaId)
    .eq('escalaId', finalEscalaId)
    .single();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('CompetenciaEscala')
      .update({ peso: finalPeso })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('CompetenciaEscala')
      .insert({ competenciaId, escalaId: finalEscalaId, peso: finalPeso });

    if (error) throw error;
  }
}

// Reactivos
export type ReactivoInput = {
  id?: string;
  pairId?: string;
  escalaId?: string;
  texto?: string;
  orden?: number;
  // Add other fields as needed
};

export async function upsertReactivo(data: ReactivoInput) {
  const supabaseAdmin = await getAdminClient();
  
  if (data.id) {
    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from('Reactivo')
      .select('id')
      .eq('id', data.id)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('Reactivo')
        .update(data)
        .eq('id', data.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('Reactivo')
        .insert(data);

      if (error) throw error;
    }
  } else {
    const { error } = await supabaseAdmin
      .from('Reactivo')
      .insert(data);

    if (error) throw error;
  }
}

export async function getReactivosByPairIds(pairIds: string[]) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Reactivo')
    .select(`
      *,
      escala:Escala(*)
    `)
    .in('pairId', pairIds);

  if (error) throw error;
  return data;
}

// Norma Decil
export async function deleteAllNormaDecil() {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('NormaDecil')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) throw error;
}

export async function createNormaDecil(data: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('NormaDecil')
    .insert(data);

  if (error) throw error;
}

export async function getNormaDecilByTarget(targetTipo: string, targetCodigo: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('NormaDecil')
    .select('*')
    .eq('targetTipo', targetTipo)
    .eq('targetCodigo', targetCodigo)
    .order('puntajeMin', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllCompetencias() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Competencia')
    .select(`
      *,
      escalas:CompetenciaEscala(
        *,
        escala:Escala(*)
      )
    `);

  if (error) throw error;
  return data;
}

// Resultados
export async function createResultado(
  evaluadoId: string,
  puntajesNaturales: Record<string, number>,
  puntajesDeciles: Record<string, number>
) {
  const supabaseAdmin = await getAdminClient();
  
  // Primero intentar actualizar si existe
  const { data: existing } = await supabaseAdmin
    .from('Resultado')
    .select('id')
    .eq('evaluadoId', evaluadoId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    // Actualizar el resultado existente
    const { data, error } = await supabaseAdmin
      .from('Resultado')
      .update({
        puntajesNaturales,
        puntajesDeciles
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Crear nuevo resultado
    const { data, error } = await supabaseAdmin
      .from('Resultado')
      .insert({
        evaluadoId,
        puntajesNaturales,
        puntajesDeciles
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ============================================
// NUEVAS FUNCIONES PARA DATOS ESTADÍSTICOS
// ============================================

export async function getDatosEstadisticosByEvaluadoId(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('DatosEstadisticos')
    .select('*')
    .eq('evaluadoId', evaluadoId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export interface DatosEstadisticosInput {
  edad?: number | null;
  genero?: string | null;
  region?: string | null;
  ocupacion?: string | null;
  nivelEducativo?: string | null;
  estadoCivil?: string | null;
  datosAdicionales?: Record<string, unknown> | null;
}

export async function upsertDatosEstadisticos(evaluadoId: string, datos: DatosEstadisticosInput) {
  const supabaseAdmin = await getAdminClient();
  
  const { data: existing } = await supabaseAdmin
    .from('DatosEstadisticos')
    .select('id')
    .eq('evaluadoId', evaluadoId)
    .single();

  const datosToSave = {
    evaluadoId,
    edad: datos.edad || null,
    genero: datos.genero || null,
    region: datos.region || null,
    ocupacion: datos.ocupacion || null,
    nivelEducativo: datos.nivelEducativo || null,
    estadoCivil: datos.estadoCivil || null,
    datosAdicionales: datos.datosAdicionales || null,
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('DatosEstadisticos')
      .update(datosToSave)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('DatosEstadisticos')
      .insert(datosToSave)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ============================================
// FUNCIONES PARA CONFIGURACIÓN DEL SISTEMA
// ============================================

export async function getConfiguracion(clave: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('ConfiguracionSistema')
    .select('*')
    .eq('clave', clave)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllConfiguraciones(categoria?: string) {
  const supabaseAdmin = await getAdminClient();
  
  let query = supabaseAdmin
    .from('ConfiguracionSistema')
    .select('*')
    .order('categoria', { ascending: true });

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function upsertConfiguracion(clave: string, valor: unknown, descripcion?: string, categoria?: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data: existing } = await supabaseAdmin
    .from('ConfiguracionSistema')
    .select('id')
    .eq('clave', clave)
    .single();

  const configData = {
    clave,
    valor,
    descripcion: descripcion || null,
    categoria: categoria || 'general',
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('ConfiguracionSistema')
      .update(configData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('ConfiguracionSistema')
      .insert(configData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ============================================
// FUNCIONES PARA CAMPOS ESTADÍSTICOS
// ============================================

export async function getCamposEstadisticos(activosOnly: boolean = true) {
  const supabaseAdmin = await getAdminClient();
  
  let query = supabaseAdmin
    .from('CampoEstadistico')
    .select('*')
    .order('orden', { ascending: true });

  if (activosOnly) {
    query = query.eq('activo', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export interface CampoEstadisticoInput {
  id?: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  opciones?: string[] | null;
  activo?: boolean;
  orden?: number;
  // Add other fields as needed
}

export async function upsertCampoEstadistico(campo: CampoEstadisticoInput) {
  const supabaseAdmin = await getAdminClient();
  
  if (campo.id) {
    const { data, error } = await supabaseAdmin
      .from('CampoEstadistico')
      .update(campo)
      .eq('id', campo.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('CampoEstadistico')
      .insert(campo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function deleteCampoEstadistico(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('CampoEstadistico')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// FUNCIONES PARA TEMPLATES DE REPORTE
// ============================================

export async function getTemplatesReporte(activosOnly: boolean = false) {
  const supabaseAdmin = await getAdminClient();
  
  let query = supabaseAdmin
    .from('TemplateReporte')
    .select('*')
    .order('createdAt', { ascending: false });

  if (activosOnly) {
    query = query.eq('activo', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getTemplateReporteById(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('TemplateReporte')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTemplateReporte(template: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('TemplateReporte')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemplateReporte(id: string, template: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('TemplateReporte')
    .update({ ...template, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// FUNCIONES PARA VERSIONES DE NORMAS
// ============================================

export async function getVersionesNorma() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('VersionNorma')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getVersionNormaActiva() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('VersionNorma')
    .select('*')
    .eq('activa', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createVersionNorma(version: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  // Si se marca como activa, desactivar las demás
  if (version.activa) {
    await supabaseAdmin
      .from('VersionNorma')
      .update({ activa: false })
      .eq('activa', true);
  }

  const { data, error } = await supabaseAdmin
    .from('VersionNorma')
    .insert(version)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function activarVersionNorma(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  // Desactivar todas las versiones
  await supabaseAdmin
    .from('VersionNorma')
    .update({ activa: false })
    .eq('activa', true);

  // Activar la versión seleccionada
  const { data, error } = await supabaseAdmin
    .from('VersionNorma')
    .update({ 
      activa: true, 
      fechaActivacion: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// FUNCIONES PARA TRANSACCIONES
// ============================================

export async function createTransaccion(transaccion: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Transaccion')
    .insert(transaccion)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaccion(id: string, updates: Record<string, unknown>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Transaccion')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransaccionByStripePaymentIntent(paymentIntentId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Transaccion')
    .select('*')
    .eq('stripePaymentIntentId', paymentIntentId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getTransaccionesByEvaluadoId(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Transaccion')
    .select('*')
    .eq('evaluadoId', evaluadoId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

// Actualizar getEvaluadoById para incluir datos estadísticos
export async function getEvaluadoByIdExtended(id: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Evaluado')
    .select(`
      *,
      datosEstadisticos:DatosEstadisticos(*),
      invitaciones:Invitacion(
        *,
        cuestionario:Cuestionario(id, titulo)
      ),
      respuestas:RespuestaCustom(
        *,
        pregunta:Pregunta(
          *,
          opciones:OpcionRespuesta(*)
        )
      ),
      resultados:Resultado(*),
      transacciones:Transaccion(*)
    `)
    .eq('id', id)
    .order('createdAt', { foreignTable: 'invitaciones', ascending: false })
    .order('updatedAt', { foreignTable: 'respuestas', ascending: false })
    .order('createdAt', { foreignTable: 'resultados', ascending: false })
    .order('createdAt', { foreignTable: 'transacciones', ascending: false })
    .single();

  if (error) throw error;
  return data;
}

// Actualizar createInvitacion para incluir política de entrega
export interface InvitacionExtendedInput {
  evaluadoId: string;
  cuestionarioId: string;
  fechaExpiracion: string;
  politicaEntrega?: string;
  correoTercero?: string | null;
  envioAutomatico?: boolean;
}

export async function createInvitacionExtended(data: InvitacionExtendedInput) {
  const supabaseAdmin = await getAdminClient();
  
  const invitacionData = {
    evaluadoId: data.evaluadoId,
    cuestionarioId: data.cuestionarioId,
    fechaExpiracion: data.fechaExpiracion,
    politicaEntrega: data.politicaEntrega || 'SOLO_ADMIN',
    correoTercero: data.correoTercero || null,
    envioAutomatico: data.envioAutomatico || false
  };

  const { data: invitacion, error } = await supabaseAdmin
    .from('Invitacion')
    .insert(invitacionData)
    .select()
    .single();

  if (error) throw error;
  return invitacion;
}

// Actualizar createReporte para incluir template y versión de norma
export interface ReporteExtendedInput {
  evaluadoId: string;
  urlPdf: string;
  templateId?: string | null;
  versionNormaId?: string | null;
  enviadoA?: string[];
  metadatos?: Record<string, unknown> | null;
}

export async function createReporteExtended(data: ReporteExtendedInput) {
  const supabaseAdmin = await getAdminClient();
  
  const reporteData = {
    evaluadoId: data.evaluadoId,
    urlPdf: data.urlPdf,
    templateId: data.templateId || null,
    versionNormaId: data.versionNormaId || null,
    enviadoA: data.enviadoA || [],
    metadatos: data.metadatos || null
  };

  const { data: reporte, error } = await supabaseAdmin
    .from('Reporte')
    .insert(reporteData)
    .select()
    .single();

  if (error) throw error;
  return reporte;
}

// ============================================
// FUNCIONES PARA NUEVO SISTEMA DE SCORING
// ============================================

/**
 * Obtener todas las escalas con sus competencias relacionadas
 */
export async function getAllEscalasConCompetencias() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Escala')
    .select(`
      *,
      competencias:CompetenciaEscala(
        peso,
        competencia:Competencia(*)
      )
    `)
    .order('codigo', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtener competencias por tipo (A o B)
 */
export async function getCompetenciasByTipo(tipo: 'A' | 'B') {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Competencia')
    .select(`
      *,
      escalas:CompetenciaEscala(
        peso,
        escala:Escala(*)
      )
    `)
    .eq('tipo', tipo)
    .order('codigo', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtener resultado más reciente de un evaluado
 */
export async function getResultadoByEvaluadoId(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Resultado')
    .select('*')
    .eq('evaluadoId', evaluadoId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Obtener todos los resultados de un evaluado
 */
export async function getAllResultadosByEvaluadoId(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Resultado')
    .select('*')
    .eq('evaluadoId', evaluadoId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Actualizar resultado existente
 */
export async function updateResultado(
  id: string,
  puntajesNaturales: Record<string, number>,
  puntajesDeciles: Record<string, number>
) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Resultado')
    .update({
      puntajesNaturales,
      puntajesDeciles
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener o crear resultado para un evaluado
 */
export async function upsertResultado(
  evaluadoId: string,
  puntajesNaturales: Record<string, number>,
  puntajesDeciles: Record<string, number>
) {
  const supabaseAdmin = await getAdminClient();
  
  // Buscar resultado existente
  const { data: existing } = await supabaseAdmin
    .from('Resultado')
    .select('id')
    .eq('evaluadoId', evaluadoId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    // Actualizar existente
    return updateResultado(existing.id, puntajesNaturales, puntajesDeciles);
  } else {
    // Crear nuevo
    return createResultado(evaluadoId, puntajesNaturales, puntajesDeciles);
  }
}

/**
 * Obtener escalas por códigos
 */
export async function getEscalasByCodigos(codigos: string[]) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Escala')
    .select('*')
    .in('codigo', codigos);

  if (error) throw error;
  return data;
}

/**
 * Obtener competencias por códigos
 */
export async function getCompetenciasByCodigos(codigos: string[]) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Competencia')
    .select(`
      *,
      escalas:CompetenciaEscala(
        peso,
        escala:Escala(*)
      )
    `)
    .in('codigo', codigos);

  if (error) throw error;
  return data;
}

/**
 * Obtener normas decílicas para múltiples targets
 */
export async function getNormasDecilesByTargets(
  targets: Array<{ tipo: string; codigo: string }>
) {
  const supabaseAdmin = await getAdminClient();
  
  const normas = new Map<string, Record<string, unknown>[]>();
  
  for (const target of targets) {
    const { data, error } = await supabaseAdmin
      .from('NormaDecil')
      .select('*')
      .eq('targetTipo', target.tipo)
      .eq('targetCodigo', target.codigo)
      .order('puntajeMin', { ascending: true });

    if (!error && data) {
      normas.set(`${target.tipo}_${target.codigo}`, data);
    }
  }
  
  return normas;
}

/**
 * Crear múltiples normas decílicas en batch
 */
export async function createNormasDecilesBatch(normas: Array<Record<string, unknown>>) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('NormaDecil')
    .insert(normas)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Eliminar normas decílicas por target
 */
export async function deleteNormasDecilesByTarget(targetTipo: string, targetCodigo: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('NormaDecil')
    .delete()
    .eq('targetTipo', targetTipo)
    .eq('targetCodigo', targetCodigo);

  if (error) throw error;
}

/**
 * Obtener estadísticas de resultados
 */
export async function getEstadisticasResultados() {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Resultado')
    .select('puntajesDeciles, createdAt');

  if (error) throw error;
  return data;
}

/**
 * Obtener evaluado con resultados completos para PDF
 */
export async function getEvaluadoConResultadosParaPDF(evaluadoId: string) {
  const supabaseAdmin = await getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('Evaluado')
    .select(`
      *,
      datosEstadisticos:DatosEstadisticos(*),
      resultados:Resultado(*)
    `)
    .eq('id', evaluadoId)
    .order('createdAt', { foreignTable: 'resultados', ascending: false })
    .single();

  if (error) throw error;
  return data;
}