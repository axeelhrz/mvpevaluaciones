import { 
  getRespuestasByEvaluadoId,
  getRespuestasCustomByEvaluadoId,
  createResultado
} from "@/lib/supabase/db";
import { getReactivosByOrdenPares } from "@/lib/supabase/db-pareamiento";
import { createAdminClient } from "@/lib/supabase/server";
import { validarRespuestaLikert } from "./reactivo-test-config";
import { PREGUNTAS_LIKERT } from "./cuestionario-config";
import {
  ResultadoEscala,
  ResultadoCompetenciaA,
  ResultadoCompetenciaB,
  calcularPromedioEscalas,
  calcularPromedioCompetenciasA,
  construirResultadoCompetenciaA,
  construirResultadoCompetenciaB,
  agruparResultadosPorSeccion
} from "./scoring-utils";

export interface ScoringWarning {
  type: 'warning' | 'error';
  pairId?: string;
  reactivoId?: number;
  message: string;
}

export interface ScoringResult {
  escalas: ResultadoEscala[];
  competenciasA: ResultadoCompetenciaA[];
  competenciasB: ResultadoCompetenciaB[];
  seccionesPDF: ReturnType<typeof agruparResultadosPorSeccion>;
  warnings: ScoringWarning[];
  puntajesNaturales: Record<string, number>;
  puntajesDeciles: Record<string, number>;
}

// ============================================
// CONFIGURACIÓN DESDE BASE DE DATOS
// ============================================

interface EscalaConfig {
  id: string;
  codigo: string;
  nombre: string;
}

interface CompetenciaConfig {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'A' | 'B';
  escalas?: string[]; // Para competencias A
  competenciasA?: string[]; // Para competencias B
}

async function obtenerConfiguracionScoring() {
  const supabase = await createAdminClient();
  
  // Obtener todas las escalas
  const { data: escalas } = await supabase
    .from('Escala')
    .select('id, codigo, nombre');

  // Obtener todas las competencias
  const { data: competencias } = await supabase
    .from('Competencia')
    .select('id, codigo, nombre, tipo');

  // Obtener relaciones Competencia-Escala
  const { data: relaciones } = await supabase
    .from('CompetenciaEscala')
    .select(`
      competenciaId,
      escalaId,
      competencia:Competencia(codigo),
      escala:Escala(codigo)
    `);

  // Construir mapa de competencias con sus escalas
  const competenciasMap = new Map<string, CompetenciaConfig>();
  
  if (competencias) {
    for (const comp of competencias) {
      competenciasMap.set(comp.id, {
        id: comp.id,
        codigo: comp.codigo,
        nombre: comp.nombre,
        tipo: comp.tipo as 'A' | 'B',
        escalas: [],
        competenciasA: []
      });
    }
  }

  // Agregar escalas a competencias A
  if (relaciones) {
    for (const rel of relaciones) {
      const comp = competenciasMap.get(rel.competenciaId);
      if (comp && comp.tipo === 'A' && rel.escala) {
        const escalaTyped = rel.escala as unknown as { codigo: string };
        comp.escalas!.push(escalaTyped.codigo);
      }
    }
  }

  // Para competencias B, necesitamos obtener las competencias A que las componen
  // Esto requiere una tabla adicional o usar la composición del nombre
  // Por ahora, las competencias B se calcularán basándose en todas las competencias A

  const escalasConfig: EscalaConfig[] = escalas || [];
  const competenciasA: CompetenciaConfig[] = Array.from(competenciasMap.values()).filter(c => c.tipo === 'A');
  const competenciasB: CompetenciaConfig[] = Array.from(competenciasMap.values()).filter(c => c.tipo === 'B');

  return {
    escalas: escalasConfig,
    competenciasA,
    competenciasB
  };
}

function getEscalaPorCodigo(codigo: string, escalasConfig: EscalaConfig[]): EscalaConfig | undefined {
  return escalasConfig.find(e => e.codigo === codigo);
}

// ============================================
// HELPERS
// ============================================

interface Reactivo {
  id: string;
  pairId: string;
  ordenEnPar: number;
  escala: { id: string; codigo: string } | null;
  tipo: string;
  puntosSiElegido?: number;
  puntosSiNoElegido?: number;
  ordenPar?: number;
}

function validatePair(pairId: string, reactivos: Reactivo[]): ScoringWarning | null {
  if (reactivos.length !== 2) {
    return {
      type: 'error',
      pairId,
      message: `Par incompleto: "${pairId}" tiene ${reactivos.length} reactivo(s). Se omitirá del cálculo.`
    };
  }

  const orden1 = reactivos.find(r => r.ordenEnPar === 1);
  const orden2 = reactivos.find(r => r.ordenEnPar === 2);

  if (!orden1 || !orden2) {
    return {
      type: 'error',
      pairId,
      message: `Par mal formado: "${pairId}" no tiene ordenEnPar 1 y 2 correctos. Se omitirá del cálculo.`
    };
  }

  if (!orden1.escala || !orden2.escala) {
    return {
      type: 'warning',
      pairId,
      message: `Par sin escala: "${pairId}" tiene reactivos sin escala asignada. Se omitirá del cálculo.`
    };
  }

  return null;
}

// ============================================
// FUNCIÓN PRINCIPAL DE SCORING
// ============================================

/**
 * Calcular puntajes y deciles para un evaluado
 * 
 * FLUJO DE 4 PASOS (según especificación del Reactivo Test):
 * 
 * PASO 1 - REACTIVOS:
 *   - Reactivo A (1-336): Pareamiento forzado, puntaje fijo
 *   - Reactivo B (337-361): Likert 1-5
 * 
 * PASO 2 - ESCALAS:
 *   - Escala A: Sumatoria de puntajes fijos de Reactivos A elegidos
 *   - Escala B: Promedio de respuestas Likert (1-5)
 * 
 * PASO 3 - COMPETENCIAS:
 *   - Competencia A: Promedio de Escalas A + contraste con norma → decil
 *   - Competencia B: Promedio de Escalas B (sin norma, base 10)
 * 
 * PASO 4 - DECILES Y RESULTADOS:
 *   - Contraste con normas decílicas usando tablas de percentiles
 *   - Generación de tablas y gráficas para PDF
 */
export async function scoreEvaluado(evaluadoId: string): Promise<ScoringResult> {
  const warnings: ScoringWarning[] = [];

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 CALCULANDO SCORING PARA EVALUADO: ${evaluadoId}`);
  console.log('='.repeat(80));

  // ============================================
  // PASO 0: OBTENER CONFIGURACIÓN DE LA BD
  // ============================================
  
  console.log('\n📋 Obteniendo configuración de scoring desde la base de datos...');
  const config = await obtenerConfiguracionScoring();
  
  console.log(`✅ Escalas configuradas: ${config.escalas.length}`);
  console.log(`✅ Competencias A configuradas: ${config.competenciasA.length}`);
  console.log(`✅ Competencias B configuradas: ${config.competenciasB.length}`);

  // ============================================
  // PASO 1: OBTENER RESPUESTAS
  // ============================================
  
  const respuestasPares = await getRespuestasByEvaluadoId(evaluadoId);
  const respuestasCustom = await getRespuestasCustomByEvaluadoId(evaluadoId);

  // Separar respuestas custom en pareamiento y Likert
  const respuestasPareamiento = respuestasCustom?.filter(r => r.preguntaId.startsWith('pair-')) || [];
  const respuestasLikert = respuestasCustom?.filter(r => r.preguntaId.startsWith('likert-')) || [];

  console.log(`\n📊 PASO 1: Obteniendo respuestas del evaluado ${evaluadoId}`);
  console.log(`  📋 Respuestas de pareamiento (RespuestaCustom): ${respuestasPareamiento.length}`);
  console.log(`  📋 Respuestas Likert (RespuestaCustom): ${respuestasLikert.length}`);
  console.log(`  📋 Respuestas antiguas (Respuesta): ${respuestasPares?.length || 0}`);

  if (respuestasPareamiento.length === 0 && respuestasPares.length === 0 && respuestasLikert.length === 0) {
    warnings.push({
      type: 'warning',
      message: 'No hay respuestas para este evaluado.'
    });
    return {
      escalas: [],
      competenciasA: [],
      competenciasB: [],
      seccionesPDF: [],
      warnings,
      puntajesNaturales: {},
      puntajesDeciles: {}
    };
  }

  // ============================================
  // PASO 2A: PROCESAR REACTIVOS A (PAREAMIENTO)
  // ============================================
  
  const sumaPorEscalaA = new Map<string, { codigo: string, total: number }>();

  // Combinar respuestas de pareamiento de ambas fuentes
  const todasRespuestasPareamiento = [
    ...(respuestasPares || []),
    ...respuestasPareamiento.map((r: Record<string, unknown>) => ({
      orden: parseInt((r.preguntaId as string).replace('pair-', '')), // Extraer el número del par
      respuesta: r.valorNumerico || 0,
      evaluadoId: r.evaluadoId
    }))
  ];

  console.log(`\n🔍 PASO 2A: Procesando ${todasRespuestasPareamiento.length} respuestas de pareamiento...`);

  if (todasRespuestasPareamiento.length > 0) {
    // Extraer los órdenes de los pares
    const ordenesPares = Array.from(new Set(
      todasRespuestasPareamiento.map(r => r.orden).filter(n => !isNaN(n))
    ));
    
    console.log(`  📋 Total de pares únicos: ${ordenesPares.length}`);
    console.log(`  📋 Primeros 5 órdenes:`, ordenesPares.slice(0, 5));
    console.log(`  🔍 Buscando reactivos para órdenes:`, ordenesPares.slice(0, 5).join(', ') + '...');
    
    const reactivos = await getReactivosByOrdenPares(ordenesPares);
    console.log(`  ✅ Reactivos encontrados: ${reactivos?.length || 0}`);
    console.log(`  📋 Reactivos encontrados en BD: ${reactivos?.length || 0}`);

    if (reactivos && reactivos.length > 0) {
      console.log(`  📋 Primeros 3 reactivos:`, reactivos.slice(0, 3).map(r => {
        const escalaArray = r.escala as unknown as Array<{ codigo: string }>;
        const escalaCodigo = Array.isArray(escalaArray) && escalaArray.length > 0 ? escalaArray[0].codigo : undefined;
        return {
          id: r.id,
          pairId: r.pairId,
          ordenEnPar: r.ordenEnPar,
          escala: escalaCodigo,
          puntosSiElegido: r.puntosSiElegido
        };
      }));

      // Agrupar reactivos por pairId
      const pares = new Map<string, { r1: Reactivo | null; r2: Reactivo | null }>();
      for (const rRaw of reactivos) {
        // Convertir escala de array a objeto si es necesario
        const r = rRaw as unknown as Reactivo;
        const escalaArray = rRaw.escala as unknown as Array<{ id: string; codigo: string }>;
        if (Array.isArray(escalaArray) && escalaArray.length > 0) {
          r.escala = escalaArray[0];
        }
        
        const key = r.pairId;
        const rec = pares.get(key) || { r1: null, r2: null };
        if (r.ordenEnPar === 1) rec.r1 = r; else rec.r2 = r;
        pares.set(key, rec);
      }

      console.log(`  📋 Pares agrupados: ${pares.size}`);

      // Validar pares
      const paresValidos = new Map<string, { r1: Reactivo | null; r2: Reactivo | null }>();
      for (const [pairId, par] of pares.entries()) {
        const reactivosDelPar = [par.r1, par.r2].filter(r => r !== null);
        const validationError = validatePair(pairId, reactivosDelPar);
        
        if (validationError) {
          warnings.push(validationError);
          if (validationError.type === 'error') continue;
        }

        if (par.r1 && par.r2) {
          paresValidos.set(pairId, par);
        }
      }

      console.log(`  ✅ Pares válidos: ${paresValidos.size}`);

      // Crear un mapa de orden -> pairId usando el ordenPar que viene de la BD
      const ordenToPairId = new Map<number, string>();
      
      for (const r of reactivos) {
        // Usar el ordenPar que viene del reactivo (agregado por getReactivosByOrdenPares)
        const rTyped = r as unknown as { ordenPar?: number };
        const ordenPar = rTyped.ordenPar;
        if (ordenPar && !ordenToPairId.has(ordenPar)) {
          ordenToPairId.set(ordenPar, r.pairId);
        }
      }

      console.log(`  📋 Mapa orden->pairId creado con ${ordenToPairId.size} entradas`);
      console.log(`  📋 Primeros 5 mapeos:`, Array.from(ordenToPairId.entries()).slice(0, 5));

      // Calcular puntajes por escala A
      let respuestasProcesadas = 0;
      for (const resp of todasRespuestasPareamiento) {
        // Buscar el pairId usando el orden
        const pairId = ordenToPairId.get(resp.orden);
        
        if (!pairId) {
          console.log(`  ⚠️  No se encontró pairId para orden ${resp.orden}`);
          warnings.push({
            type: 'warning',
            message: `No se encontró el par para orden ${resp.orden}`
          });
          continue;
        }

        const par = paresValidos.get(pairId);
        if (!par || !par.r1 || !par.r2) {
          console.log(`  ⚠️  Par inválido para pairId ${pairId}`);
          continue;
        }

        const elegido = resp.respuesta === 1 ? par.r1 : resp.respuesta === 2 ? par.r2 : null;
        if (!elegido) {
          warnings.push({
            type: 'warning',
            pairId: pairId,
            message: `Respuesta inválida para par orden ${resp.orden}. Valor: ${resp.respuesta}`
          });
          continue;
        }

        const pts = elegido.puntosSiElegido ?? 0;
        if (!elegido.escala) {
          warnings.push({
            type: 'warning',
            pairId: pairId,
            reactivoId: parseInt(elegido.id),
            message: `El reactivo elegido no tiene escala asignada.`
          });
          continue;
        }

        const key = elegido.escala.codigo;
        const curr = sumaPorEscalaA.get(key) || { codigo: elegido.escala.codigo, total: 0 };
        curr.total += pts;
        sumaPorEscalaA.set(key, curr);
        respuestasProcesadas++;
      }

      console.log(`  ✅ Respuestas procesadas: ${respuestasProcesadas}`);
      console.log(`  ✅ Escalas A calculadas: ${sumaPorEscalaA.size}`);
      
      if (sumaPorEscalaA.size > 0) {
        console.log(`  📊 Primeras 5 escalas A:`);
        let count = 0;
        for (const [codigo, data] of sumaPorEscalaA.entries()) {
          if (count < 5) {
            console.log(`    - ${codigo}: ${data.total} puntos`);
            count++;
          }
        }
      }
    } else {
      console.log(`  ⚠️  No se encontraron reactivos en la base de datos para los pairIds`);
    }
  } else {
    console.log(`  ⚠️  No hay respuestas de pareamiento para procesar`);
  }

  // ============================================
  // PASO 2B: PROCESAR REACTIVOS B (LIKERT 1-5)
  // ============================================
  
  const promedioPorEscalaB = new Map<string, { codigo: string, suma: number, count: number }>();

  if (respuestasLikert && respuestasLikert.length > 0) {
    for (const resp of respuestasLikert) {
      // Extraer el ID del preguntaId (ej: "likert-169" -> 169)
      const preguntaIdStr = resp.preguntaId;
      if (!preguntaIdStr || !preguntaIdStr.startsWith('likert-')) continue;

      const valor = resp.valorNumerico;
      if (valor === null || valor === undefined) continue;

      const validacion = validarRespuestaLikert(valor);
      if (!validacion.valido) {
        warnings.push({
          type: 'warning',
          message: validacion.error || 'Respuesta Likert inválida'
        });
        continue;
      }

      // Obtener el número de pregunta del preguntaId (ej: "likert-169" -> 169)
      const numeroPregunta = parseInt(preguntaIdStr.replace('likert-', ''));
      
      // Buscar la pregunta en la configuración para obtener el reactivoId real
      const preguntaConfig = PREGUNTAS_LIKERT.find(p => p.numero === numeroPregunta);
      
      if (!preguntaConfig) {
        warnings.push({
          type: 'warning',
          message: `Pregunta Likert ${numeroPregunta} no encontrada en configuración`
        });
        continue;
      }

  const escalaId = preguntaConfig.escala;

      // La escala ya está validada en la configuración de preguntas Likert
      const key = escalaId;
      const curr = promedioPorEscalaB.get(key) || { codigo: escalaId, suma: 0, count: 0 };
      curr.suma += valor;
      curr.count += 1;
      promedioPorEscalaB.set(key, curr);
    }
  }

  // ============================================
  // PASO 3: CALCULAR ESCALAS CON DECILES
  // ============================================
  
  console.log('\n📊 PASO 3: Calculando escalas con deciles...');
  
  const escalasResultados = new Map<string, ResultadoEscala>();
  
  // Escalas A (sumatoria + norma de contraste)
  for (const [, { codigo, total }] of sumaPorEscalaA.entries()) {
    const escalaConfig = getEscalaPorCodigo(codigo, config.escalas);
    const nombre = escalaConfig?.nombre || codigo;
    
    // Calcular decil usando tabla de normas desde la BD
    const decil = await calcularDecilDesdeDB(total, codigo);
    
    escalasResultados.set(codigo, {
      codigo,
      nombre,
      puntajeNatural: total,
      decil
    });
  }

  console.log(`✅ Escalas A calculadas: ${sumaPorEscalaA.size}`);

  // Escalas B (promedio Likert + norma de contraste para habilidades)
  for (const [, { codigo, suma, count }] of promedioPorEscalaB.entries()) {
    const escalaConfig = getEscalaPorCodigo(codigo, config.escalas);
    const nombre = escalaConfig?.nombre || codigo;
    const promedio = suma / count;
    
    // Calcular decil usando tabla de normas de habilidades financieras desde la BD
    const decil = await calcularDecilDesdeDB(promedio, codigo);
    
    escalasResultados.set(codigo, {
      codigo,
      nombre,
      puntajeNatural: promedio, // Promedio original (1-5)
      decil
    });
  }

  console.log(`✅ Escalas B calculadas: ${promedioPorEscalaB.size}`);
  console.log(`✅ Total de escalas: ${escalasResultados.size}`);
  
  // ============================================
  // PASO 4: CALCULAR COMPETENCIAS A
  // ============================================
  
  console.log('\n📊 PASO 4: Calculando Competencias A...');
  
  const competenciasAResultados = new Map<string, ResultadoCompetenciaA>();

  for (const compConfig of config.competenciasA) {
    if (!compConfig.escalas || compConfig.escalas.length === 0) {
      warnings.push({
        type: 'warning',
        message: `Competencia "${compConfig.nombre}" no tiene escalas configuradas.`
      });
      continue;
    }

    const puntajeNatural = calcularPromedioEscalas(
      escalasResultados,
      compConfig.escalas,
      1
    );

    if (puntajeNatural === 0) {
      warnings.push({
        type: 'warning',
        message: `No se pudo calcular la competencia "${compConfig.nombre}" por falta de escalas.`
      });
      continue;
    }

    // Calcular decil usando tabla de normas desde la BD
    const decil = await calcularDecilDesdeDB(puntajeNatural, compConfig.codigo);
    
    const resultado = construirResultadoCompetenciaA(
      compConfig.codigo,
      puntajeNatural,
      decil,
      escalasResultados
    );

    if (resultado) {
      competenciasAResultados.set(compConfig.codigo, resultado);
    }
  }

  console.log(`✅ Competencias A calculadas: ${competenciasAResultados.size}`);

  // ============================================
  // PASO 5: CALCULAR COMPETENCIAS B (POTENCIALES)
  // ============================================
  
  console.log('\n📊 PASO 5: Calculando Competencias B (Potenciales)...');
  
  const competenciasBResultados: ResultadoCompetenciaB[] = [];

  for (const compConfig of config.competenciasB) {
    // Para competencias B, calculamos el promedio de TODAS las competencias A
    // ya que representan potenciales generales
    const todasCompetenciasA = Array.from(competenciasAResultados.keys());
    
    if (todasCompetenciasA.length === 0) {
      warnings.push({
        type: 'warning',
        message: `No se pudo calcular el potencial "${compConfig.nombre}" por falta de competencias A.`
      });
      continue;
    }

    const puntajeNatural = calcularPromedioCompetenciasA(
      competenciasAResultados,
      todasCompetenciasA
    );

    if (puntajeNatural === 0) {
      warnings.push({
        type: 'warning',
        message: `No se pudo calcular el potencial "${compConfig.nombre}" por falta de competencias A.`
      });
      continue;
    }

    // Las Competencias B NO tienen norma de contraste
    // Se usa el promedio de deciles de las Competencias A
    const decilesCompA = todasCompetenciasA
      .map((codCompA: string) => competenciasAResultados.get(codCompA)?.decil)
      .filter((d: number | undefined) => d !== undefined) as number[];
    
    const decilPromedio = decilesCompA.length > 0
      ? Math.round(decilesCompA.reduce((sum, d) => sum + d, 0) / decilesCompA.length)
      : 1;

    const resultado = construirResultadoCompetenciaB(
      compConfig.codigo,
      puntajeNatural,
      decilPromedio,
      competenciasAResultados
    );

    if (resultado) {
      competenciasBResultados.push(resultado);
    }
  }

  console.log(`✅ Competencias B calculadas: ${competenciasBResultados.length}`);

  // ============================================
  // PASO 6: AGRUPAR POR SECCIONES DEL PDF
  // ============================================
  
  const competenciasAArray = Array.from(competenciasAResultados.values());
  const seccionesPDF = agruparResultadosPorSeccion(competenciasAArray, competenciasBResultados);

  // ============================================
  // PASO 7: PREPARAR DATOS PARA PERSISTENCIA
  // ============================================
  
  const puntajesNaturales: Record<string, number> = {};
  const puntajesDeciles: Record<string, number> = {};

  console.log('\n💾 Preparando datos para persistencia...');
  console.log(`  📊 Escalas a guardar: ${escalasResultados.size}`);
  console.log(`  📊 Competencias A a guardar: ${competenciasAArray.length}`);
  console.log(`  📊 Competencias B a guardar: ${competenciasBResultados.length}`);

  // Guardar escalas con nombres descriptivos
  escalasResultados.forEach((escala) => {
    // Usar el nombre completo de la escala como clave
    const nombreClave = escala.nombre || escala.codigo;
    const puntajeNatural = escala.puntajeNatural || 0;
    const decil = escala.decil || 1;
    
    // Validar que no sean null/undefined
    if (nombreClave && !isNaN(puntajeNatural) && !isNaN(decil)) {
      puntajesNaturales[nombreClave] = Math.round(puntajeNatural * 100) / 100;
      puntajesDeciles[nombreClave] = decil;
    }
  });

  console.log(`  ✅ Escalas guardadas: ${Object.keys(puntajesNaturales).length}`);

  // Guardar competencias A con nombres descriptivos
  competenciasAArray.forEach((comp) => {
    const nombreClave = comp.nombre || comp.codigo;
    const puntajeNatural = comp.puntajeNatural || 0;
    const decil = comp.decil || 1;
    
    // Validar que no sean null/undefined
    if (nombreClave && !isNaN(puntajeNatural) && !isNaN(decil)) {
      puntajesNaturales[nombreClave] = Math.round(puntajeNatural * 100) / 100;
      puntajesDeciles[nombreClave] = decil;
    }
  });

  console.log(`  ✅ Competencias A guardadas: ${competenciasAArray.length}`);

  // Guardar competencias B con nombres descriptivos
  competenciasBResultados.forEach((comp) => {
    const nombreClave = comp.nombre || comp.codigo;
    const puntajeNatural = comp.puntajeNatural || 0;
    const decil = comp.decil || 1;
    
    // Validar que no sean null/undefined
    if (nombreClave && !isNaN(puntajeNatural) && !isNaN(decil)) {
      puntajesNaturales[nombreClave] = Math.round(puntajeNatural * 100) / 100;
      puntajesDeciles[nombreClave] = decil;
    }
  });

  console.log(`  ✅ Competencias B guardadas: ${competenciasBResultados.length}`);
  console.log(`  ✅ Total de puntajes guardados: ${Object.keys(puntajesNaturales).length}`);

  // Mostrar primeros 10 puntajes para verificación
  console.log(`\n  📋 Primeros 10 puntajes naturales:`);
  Object.entries(puntajesNaturales).slice(0, 10).forEach(([nombre, valor]) => {
    console.log(`    • ${nombre}: ${valor}`);
  });

  // Validar que no estén vacíos
  if (Object.keys(puntajesNaturales).length === 0) {
    console.warn('⚠️  No se calcularon puntajes naturales');
    puntajesNaturales['Sin datos'] = 0;
    puntajesDeciles['Sin datos'] = 1;
  }

  // ============================================
  // PASO 8: PERSISTIR EN BASE DE DATOS
  // ============================================
  
  console.log('\n💾 Guardando resultados en base de datos...');
  await createResultado(evaluadoId, puntajesNaturales, puntajesDeciles);
  console.log('✅ Resultados guardados exitosamente');

  // ============================================
  // PASO 9: RETORNAR RESULTADOS COMPLETOS
  // ============================================
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ SCORING COMPLETADO');
  console.log('='.repeat(80));
  console.log(`📊 Escalas calculadas: ${escalasResultados.size}`);
  console.log(`📊 Competencias A calculadas: ${competenciasAArray.length}`);
  console.log(`📊 Competencias B calculadas: ${competenciasBResultados.length}`);
  console.log(`⚠️  Advertencias: ${warnings.length}`);
  console.log('='.repeat(80) + '\n');
  
  return { 
    escalas: Array.from(escalasResultados.values()),
    competenciasA: competenciasAArray,
    competenciasB: competenciasBResultados,
    seccionesPDF,
    warnings,
    puntajesNaturales,
    puntajesDeciles
  };
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

export function validarResultadosCompletos(resultado: ScoringResult): {
  completo: boolean;
  faltantes: string[];
} {
  const faltantes: string[] = [];

  // Validación básica: al menos debe haber algunas escalas y competencias
  if (resultado.escalas.length === 0) {
    faltantes.push('No se calcularon escalas');
  }

  if (resultado.competenciasA.length === 0) {
    faltantes.push('No se calcularon competencias A');
  }

  if (resultado.competenciasB.length === 0) {
    faltantes.push('No se calcularon competencias B (potenciales)');
  }

  return {
    completo: faltantes.length === 0,
    faltantes
  };
}