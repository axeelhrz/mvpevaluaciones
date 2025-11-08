import { 
  getRespuestasByEvaluadoId,
  getRespuestasCustomByEvaluadoId,
  createResultado
} from "@/lib/supabase/db";
import { getReactivosByOrdenPares } from "@/lib/supabase/db-pareamiento";
import { createAdminClient } from "@/lib/supabase/server";
import { PREGUNTAS_LIKERT } from "./cuestionario-config";

interface ScoringWarning {
  type: 'warning' | 'error';
  pairId?: string;
  reactivoId?: number;
  message: string;
}

interface ResultadoEscala {
  codigo: string;
  nombre: string;
  puntajeNatural: number;
  decil: number;
}

interface ResultadoCompetenciaA {
  codigo: string;
  nombre: string;
  puntajeNatural: number;
  decil: number;
  escalas: ResultadoEscala[];
}

interface ResultadoCompetenciaB {
  codigo: string;
  nombre: string;
  puntajeNatural: number;
  decil: number;
  competenciasA: ResultadoCompetenciaA[];
}

interface ScoringResult {
  escalas: ResultadoEscala[];
  competenciasA: ResultadoCompetenciaA[];
  competenciasB: ResultadoCompetenciaB[];
  warnings: ScoringWarning[];
  puntajesNaturales: Record<string, number>;
  puntajesDeciles: Record<string, number>;
}

/**
 * Calcular decil desde la base de datos usando las normas importadas del Excel
 */
async function calcularDecilDesdeDB(
  puntajeNatural: number,
  escala: string
): Promise<number> {
  try {
    const supabase = await createAdminClient();
    
    // Buscar el decil correspondiente al puntaje natural
    const { data, error } = await supabase
      .from('NormaDecil')
      .select('decil, puntaje_natural')
      .eq('escala', escala)
      .order('puntaje_natural', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn(`⚠️  No se encontraron normas para la escala: ${escala}`);
      return 1; // Decil por defecto
    }

    // Encontrar el decil más cercano
    let decilEncontrado = 1;
    
    for (const norma of data) {
      if (puntajeNatural >= norma.puntaje_natural) {
        decilEncontrado = norma.decil;
      } else {
        break;
      }
    }

    return decilEncontrado;
  } catch (error) {
    console.error(`❌ Error al calcular decil para ${escala}:`, error);
    return 1;
  }
}

/**
 * Obtener configuración de scoring desde la base de datos
 */
async function obtenerConfiguracionScoring() {
  const supabase = await createAdminClient();
  
  const { data: escalas } = await supabase
    .from('ScoringConfig')
    .select('*')
    .eq('tipo', 'ESCALA');

  const { data: competenciasA } = await supabase
    .from('ScoringConfig')
    .select('*')
    .eq('tipo', 'COMPETENCIA_A');

  const { data: competenciasB } = await supabase
    .from('ScoringConfig')
    .select('*')
    .eq('tipo', 'COMPETENCIA_B');

  return {
    escalas: escalas || [],
    competenciasA: competenciasA || [],
    competenciasB: competenciasB || []
  };
}

/**
 * Función principal de scoring mejorada con datos del Excel
 */
export async function scoreEvaluadoEnhanced(evaluadoId: string): Promise<ScoringResult> {
  const warnings: ScoringWarning[] = [];

  console.log(`\n📊 INICIANDO SCORING MEJORADO PARA EVALUADO: ${evaluadoId}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ============================================
  // PASO 1: OBTENER RESPUESTAS
  // ============================================
  
  const respuestasPares = await getRespuestasByEvaluadoId(evaluadoId);
  const respuestasCustom = await getRespuestasCustomByEvaluadoId(evaluadoId);

  const respuestasPareamiento = respuestasCustom?.filter(r => r.preguntaId.startsWith('pair-')) || [];
  const respuestasLikert = respuestasCustom?.filter(r => r.preguntaId.startsWith('likert-')) || [];

  console.log(`📋 Respuestas de pareamiento: ${respuestasPareamiento.length}`);
  console.log(`📋 Respuestas Likert: ${respuestasLikert.length}`);

  if (respuestasPareamiento.length === 0 && respuestasLikert.length === 0) {
    warnings.push({
      type: 'warning',
      message: 'No hay respuestas para este evaluado.'
    });
    return {
      escalas: [],
      competenciasA: [],
      competenciasB: [],
      warnings,
      puntajesNaturales: {},
      puntajesDeciles: {}
    };
  }

  // ============================================
  // PASO 2: OBTENER CONFIGURACIÓN DEL EXCEL
  // ============================================
  
  console.log('\n📋 Obteniendo configuración de scoring desde la base de datos...');
  const config = await obtenerConfiguracionScoring();
  
  console.log(`✅ Escalas configuradas: ${config.escalas.length}`);
  console.log(`✅ Competencias A configuradas: ${config.competenciasA.length}`);
  console.log(`✅ Competencias B configuradas: ${config.competenciasB.length}\n`);

  // ============================================
  // PASO 3: PROCESAR REACTIVOS DE PAREAMIENTO
  // ============================================
  
  const sumaPorEscala = new Map<string, number>();

  console.log('🔍 Procesando respuestas de pareamiento...');
  
  const todasRespuestasPareamiento = [
    ...(respuestasPares || []),
    ...respuestasPareamiento.map(r => ({
      orden: parseInt(r.preguntaId.replace('pair-', '')),
      respuesta: r.valorNumerico || 0,
      evaluadoId: r.evaluadoId
    }))
  ];

  if (todasRespuestasPareamiento.length > 0) {
    const ordenesPares = Array.from(new Set(
      todasRespuestasPareamiento.map(r => r.orden).filter(n => !isNaN(n))
    ));
    
    const reactivos = await getReactivosByOrdenPares(ordenesPares);
    
    if (reactivos && reactivos.length > 0) {
      // Agrupar reactivos por pairId
      const pares = new Map<string, unknown[]>();
      for (const r of reactivos) {
        const key = (r as unknown as { pairId: string }).pairId;
        if (!pares.has(key)) pares.set(key, []);
        pares.get(key)!.push(r);
      }

      // Crear mapa orden -> pairId
      const ordenToPairId = new Map<number, string>();
      for (const r of reactivos) {
        const ordenPar = (r as unknown as { ordenPar?: number }).ordenPar;
        const pairId = (r as unknown as { pairId: string }).pairId;
        if (ordenPar && !ordenToPairId.has(ordenPar)) {
          ordenToPairId.set(ordenPar, pairId);
        }
      }

      // Calcular puntajes por escala
      for (const resp of todasRespuestasPareamiento) {
        const pairId = ordenToPairId.get(resp.orden);
        if (!pairId) continue;

        const par = pares.get(pairId);
        if (!par || par.length !== 2) continue;

        const elegido = resp.respuesta === 1 ? par[0] : resp.respuesta === 2 ? par[1] : null;
        if (!elegido) continue;

        const elegidoTyped = elegido as unknown as { escala?: Array<{ codigo: string }>, puntosSiElegido?: number };
        if (!elegidoTyped.escala || elegidoTyped.escala.length === 0) continue;

        const pts = elegidoTyped.puntosSiElegido ?? 0;
        const escalaKey = elegidoTyped.escala[0].codigo;
        
        sumaPorEscala.set(escalaKey, (sumaPorEscala.get(escalaKey) || 0) + pts);
      }
    }
  }

  console.log(`✅ Escalas calculadas de pareamiento: ${sumaPorEscala.size}\n`);

  // ============================================
  // PASO 4: PROCESAR REACTIVOS LIKERT
  // ============================================
  
  console.log('🔍 Procesando respuestas Likert...');
  
  const promedioPorEscalaLikert = new Map<string, { suma: number, count: number }>();

  if (respuestasLikert && respuestasLikert.length > 0) {
    for (const resp of respuestasLikert) {
      const preguntaIdStr = resp.preguntaId;
      if (!preguntaIdStr || !preguntaIdStr.startsWith('likert-')) continue;

      const valor = resp.valorNumerico;
      if (valor === null || valor === undefined) continue;

      const numeroPregunta = parseInt(preguntaIdStr.replace('likert-', ''));
      const preguntaConfig = PREGUNTAS_LIKERT.find(p => p.numero === numeroPregunta);
      
      if (!preguntaConfig) continue;

      const escalaId = preguntaConfig.escala;
      const curr = promedioPorEscalaLikert.get(escalaId) || { suma: 0, count: 0 };
      curr.suma += valor;
      curr.count += 1;
      promedioPorEscalaLikert.set(escalaId, curr);
    }
  }

  console.log(`✅ Escalas calculadas de Likert: ${promedioPorEscalaLikert.size}\n`);

  // ============================================
  // PASO 5: CALCULAR ESCALAS CON DECILES
  // ============================================
  
  console.log('📊 Calculando deciles para escalas...');
  
  const escalasResultados = new Map<string, ResultadoEscala>();
  
  // Escalas de pareamiento
  for (const [codigo, total] of sumaPorEscala.entries()) {
    const escalaConfig = config.escalas.find((e: Record<string, unknown>) => (e as Record<string, unknown>).nombre === codigo);
    const nombrePdf = escalaConfig ? (escalaConfig as Record<string, unknown>).nombre_pdf : undefined;
    const nombre = typeof nombrePdf === 'string' ? nombrePdf : codigo;
    
    const decil = await calcularDecilDesdeDB(total, codigo);
    
    escalasResultados.set(codigo, {
      codigo,
      nombre,
      puntajeNatural: total,
      decil
    });
  }

  // Escalas Likert
  for (const [codigo, { suma, count }] of promedioPorEscalaLikert.entries()) {
    const escalaConfig = config.escalas.find((e: Record<string, unknown>) => (e as Record<string, unknown>).nombre === codigo);
    const nombrePdf = escalaConfig ? (escalaConfig as Record<string, unknown>).nombre_pdf : undefined;
    const nombre = typeof nombrePdf === 'string' ? nombrePdf : codigo;
    const promedio = suma / count;
    
    const decil = await calcularDecilDesdeDB(promedio, codigo);
    
    escalasResultados.set(codigo, {
      codigo,
      nombre,
      puntajeNatural: promedio,
      decil
    });
  }

  console.log(`✅ Total de escalas con deciles: ${escalasResultados.size}\n`);

  // ============================================
  // PASO 6: CALCULAR COMPETENCIAS A
  // ============================================
  
  console.log('📊 Calculando Competencias A...');
  
  const competenciasAResultados = new Map<string, ResultadoCompetenciaA>();

  for (const compConfig of config.competenciasA) {
    // Parsear composición (ej: "Escala1 + Escala2 + Escala3")
    const escalasCompetencia = (compConfig as Record<string, unknown>).composicion
      ?.toString()
      .split('+')
      .map((e: string) => e.trim())
      .filter((e: string) => e !== '') || [];

    if (escalasCompetencia.length === 0) continue;

    // Obtener escalas que componen esta competencia
    const escalasEncontradas = escalasCompetencia
      .map(nombre => escalasResultados.get(nombre))
      .filter(e => e !== undefined) as ResultadoEscala[];

    if (escalasEncontradas.length === 0) continue;

    // Calcular promedio de puntajes naturales
    const puntajeNatural = escalasEncontradas.reduce((sum, e) => sum + e.puntajeNatural, 0) / escalasEncontradas.length;
    
    // Calcular decil usando normas
    const compConfigTyped = compConfig as Record<string, unknown>;
    const compNombreRaw = compConfigTyped.nombre;
    if (typeof compNombreRaw !== 'string') continue;
    
    const decil = await calcularDecilDesdeDB(puntajeNatural, compNombreRaw);
    const nombrePdf = typeof compConfigTyped.nombre_pdf === 'string' ? compConfigTyped.nombre_pdf : compNombreRaw;

    competenciasAResultados.set(compNombreRaw, {
      codigo: compNombreRaw,
      nombre: nombrePdf,
      puntajeNatural,
      decil,
      escalas: escalasEncontradas
    });
  }

  console.log(`✅ Total de Competencias A calculadas: ${competenciasAResultados.size}\n`);

  // ============================================
  // PASO 7: CALCULAR COMPETENCIAS B
  // ============================================
  
  console.log('📊 Calculando Competencias B (Potenciales)...');
  
  const competenciasBResultados: ResultadoCompetenciaB[] = [];

  for (const compConfig of config.competenciasB) {
    // Parsear composición
    const competenciasA = (compConfig as Record<string, unknown>).composicion
      ?.toString()
      .split('+')
      .map((c: string) => c.trim())
      .filter((c: string) => c !== '') || [];

    if (competenciasA.length === 0) continue;

    // Obtener competencias A que componen esta competencia B
    const competenciasEncontradas = competenciasA
      .map(nombre => competenciasAResultados.get(nombre))
      .filter(c => c !== undefined) as ResultadoCompetenciaA[];

    if (competenciasEncontradas.length === 0) continue;

    // Calcular promedio de puntajes naturales
    const puntajeNatural = competenciasEncontradas.reduce((sum, c) => sum + c.puntajeNatural, 0) / competenciasEncontradas.length;
    
    // Calcular promedio de deciles
    const decilPromedio = Math.round(
      competenciasEncontradas.reduce((sum, c) => sum + c.decil, 0) / competenciasEncontradas.length
    );

    const compConfigTypedB = compConfig as Record<string, unknown>;
    const compNombreBRaw = compConfigTypedB.nombre;
    if (typeof compNombreBRaw !== 'string') continue;
    
    const nombrePdfB = typeof compConfigTypedB.nombre_pdf === 'string' ? compConfigTypedB.nombre_pdf : compNombreBRaw;
    competenciasBResultados.push({
      codigo: compNombreBRaw,
      nombre: nombrePdfB,
      puntajeNatural,
      decil: decilPromedio,
      competenciasA: competenciasEncontradas
    });
  }

  console.log(`✅ Total de Competencias B calculadas: ${competenciasBResultados.length}\n`);

  // ============================================
  // PASO 8: PREPARAR DATOS PARA PERSISTENCIA
  // ============================================
  
  const puntajesNaturales: Record<string, number> = {};
  const puntajesDeciles: Record<string, number> = {};

  escalasResultados.forEach((escala) => {
    puntajesNaturales[`escala_${escala.codigo}`] = escala.puntajeNatural;
    puntajesDeciles[`escala_${escala.codigo}`] = escala.decil;
  });

  Array.from(competenciasAResultados.values()).forEach((comp) => {
    puntajesNaturales[`competenciaA_${comp.codigo}`] = comp.puntajeNatural;
    puntajesDeciles[`competenciaA_${comp.codigo}`] = comp.decil;
  });

  competenciasBResultados.forEach((comp) => {
    puntajesNaturales[`competenciaB_${comp.codigo}`] = comp.puntajeNatural;
    puntajesDeciles[`competenciaB_${comp.codigo}`] = comp.decil;
  });

  // ============================================
  // PASO 9: PERSISTIR EN BASE DE DATOS
  // ============================================
  
  console.log('💾 Guardando resultados en base de datos...');
  await createResultado(evaluadoId, puntajesNaturales, puntajesDeciles);
  console.log('✅ Resultados guardados exitosamente\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ SCORING COMPLETADO EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📊 Escalas: ${escalasResultados.size}`);
  console.log(`📊 Competencias A: ${competenciasAResultados.size}`);
  console.log(`📊 Competencias B: ${competenciasBResultados.length}`);
  console.log(`⚠️  Advertencias: ${warnings.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return { 
    escalas: Array.from(escalasResultados.values()),
    competenciasA: Array.from(competenciasAResultados.values()),
    competenciasB: competenciasBResultados,
    warnings,
    puntajesNaturales,
    puntajesDeciles
  };
}