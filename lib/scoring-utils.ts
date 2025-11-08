/**
 * UTILIDADES PARA SISTEMA DE SCORING
 * Funciones helper para cálculo de competencias y aplicación de normas
 */

import { 
  getCompetenciaAPorCodigo,
  getCompetenciaBPorCodigo,
  COMPETENCIAS_A
} from './competencias-config';

// ============================================
// TIPOS
// ============================================

export interface ResultadoEscala {
  codigo: string;
  nombre: string;
  puntajeNatural: number;
  decil: number;
}

export interface ResultadoCompetenciaA {
  codigo: string;
  nombre: string;
  puntajeNatural: number;
  decil: number;
  escalas: ResultadoEscala[];
  seccionPDF: string;
  visualizacionPDF: string;
}

export interface ResultadoCompetenciaB {
  codigo: string;
  nombre: string;
  puntajeNatural: number;
  decil: number;
  competenciasA: ResultadoCompetenciaA[];
  seccionPDF: string;
  visualizacionPDF: string;
}

export interface ResultadosPorSeccion {
  seccion: string;
  competenciasA: ResultadoCompetenciaA[];
  competenciasB: ResultadoCompetenciaB[];
}

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

/**
 * Calcular promedio ponderado de escalas para una Competencia A
 */
export function calcularPromedioEscalas(
  escalasResultados: Map<string, ResultadoEscala>,
  codigosEscalas: string[],
  peso: number = 1
): number {
  let suma = 0;
  let totalPeso = 0;

  for (const codigoEscala of codigosEscalas) {
    const escala = escalasResultados.get(codigoEscala);
    if (escala) {
      suma += escala.puntajeNatural * peso;
      totalPeso += peso;
    }
  }

  return totalPeso > 0 ? suma / totalPeso : 0;
}

/**
 * Calcular promedio de Competencias A para una Competencia B
 */
export function calcularPromedioCompetenciasA(
  competenciasAResultados: Map<string, ResultadoCompetenciaA>,
  codigosCompetenciasA: string[]
): number {
  let suma = 0;
  let count = 0;

  for (const codigoCompA of codigosCompetenciasA) {
    const compA = competenciasAResultados.get(codigoCompA);
    if (compA) {
      suma += compA.puntajeNatural;
      count++;
    }
  }

  return count > 0 ? suma / count : 0;
}

/**
 * Construir resultado de Competencia A con sus escalas
 */
export function construirResultadoCompetenciaA(
  codigoCompetencia: string,
  puntajeNatural: number,
  decil: number,
  escalasResultados: Map<string, ResultadoEscala>
): ResultadoCompetenciaA | null {
  const config = getCompetenciaAPorCodigo(codigoCompetencia);
  if (!config) return null;

  const escalas: ResultadoEscala[] = [];
  for (const codigoEscala of config.escalas) {
    const escala = escalasResultados.get(codigoEscala);
    if (escala) {
      escalas.push(escala);
    }
  }

  return {
    codigo: config.codigo,
    nombre: config.nombre,
    puntajeNatural,
    decil,
    escalas,
    seccionPDF: config.seccionPDF,
    visualizacionPDF: config.visualizacionPDF
  };
}

/**
 * Construir resultado de Competencia B con sus Competencias A
 */
export function construirResultadoCompetenciaB(
  codigoCompetencia: string,
  puntajeNatural: number,
  decil: number,
  competenciasAResultados: Map<string, ResultadoCompetenciaA>
): ResultadoCompetenciaB | null {
  const config = getCompetenciaBPorCodigo(codigoCompetencia);
  if (!config) return null;

  const competenciasA: ResultadoCompetenciaA[] = [];
  for (const codigoCompA of config.competenciasA) {
    const compA = competenciasAResultados.get(codigoCompA);
    if (compA) {
      competenciasA.push(compA);
    }
  }

  return {
    codigo: config.codigo,
    nombre: config.nombre,
    puntajeNatural,
    decil,
    competenciasA,
    seccionPDF: config.seccionPDF,
    visualizacionPDF: config.visualizacionPDF
  };
}

/**
 * Agrupar resultados por sección del PDF
 */
export function agruparResultadosPorSeccion(
  competenciasA: ResultadoCompetenciaA[],
  competenciasB: ResultadoCompetenciaB[]
): ResultadosPorSeccion[] {
  const seccionesMap = new Map<string, ResultadosPorSeccion>();

  // Agrupar Competencias A
  for (const compA of competenciasA) {
    if (!seccionesMap.has(compA.seccionPDF)) {
      seccionesMap.set(compA.seccionPDF, {
        seccion: compA.seccionPDF,
        competenciasA: [],
        competenciasB: []
      });
    }
    seccionesMap.get(compA.seccionPDF)!.competenciasA.push(compA);
  }

  // Agrupar Competencias B
  for (const compB of competenciasB) {
    if (!seccionesMap.has(compB.seccionPDF)) {
      seccionesMap.set(compB.seccionPDF, {
        seccion: compB.seccionPDF,
        competenciasA: [],
        competenciasB: []
      });
    }
    seccionesMap.get(compB.seccionPDF)!.competenciasB.push(compB);
  }

  return Array.from(seccionesMap.values());
}

/**
 * Obtener interpretación textual del decil
 */
export function interpretarDecil(decil: number): {
  nivel: string;
  descripcion: string;
  color: string;
} {
  if (decil >= 9) {
    return {
      nivel: "Muy Alto",
      descripcion: "Desempeño excepcional en esta área",
      color: "#10b981"
    };
  } else if (decil >= 7) {
    return {
      nivel: "Alto",
      descripcion: "Desempeño superior al promedio",
      color: "#3b82f6"
    };
  } else if (decil >= 5) {
    return {
      nivel: "Medio-Alto",
      descripcion: "Desempeño ligeramente por encima del promedio",
      color: "#8b5cf6"
    };
  } else if (decil >= 3) {
    return {
      nivel: "Medio",
      descripcion: "Desempeño promedio",
      color: "#f59e0b"
    };
  } else {
    return {
      nivel: "Bajo",
      descripcion: "Área de oportunidad para desarrollo",
      color: "#ef4444"
    };
  }
}

/**
 * Calcular estadísticas generales de los resultados
 */
export function calcularEstadisticasGenerales(
  competenciasA: ResultadoCompetenciaA[],
  competenciasB: ResultadoCompetenciaB[]
): {
  promedioDecilesA: number;
  promedioDecilesB: number;
  competenciasMasFuertes: ResultadoCompetenciaA[];
  competenciasMasDebiles: ResultadoCompetenciaA[];
  potencialMasFuerte: ResultadoCompetenciaB | null;
  potencialMasDebil: ResultadoCompetenciaB | null;
} {
  const sumaDecilesA = competenciasA.reduce((sum, comp) => sum + comp.decil, 0);
  const promedioDecilesA = competenciasA.length > 0 ? sumaDecilesA / competenciasA.length : 0;

  const sumaDecilesB = competenciasB.reduce((sum, comp) => sum + comp.decil, 0);
  const promedioDecilesB = competenciasB.length > 0 ? sumaDecilesB / competenciasB.length : 0;

  const competenciasMasFuertes = [...competenciasA]
    .sort((a, b) => b.decil - a.decil)
    .slice(0, 5);

  const competenciasMasDebiles = [...competenciasA]
    .sort((a, b) => a.decil - b.decil)
    .slice(0, 5);

  const potencialMasFuerte = competenciasB.length > 0
    ? competenciasB.reduce((max, comp) => comp.decil > max.decil ? comp : max)
    : null;

  const potencialMasDebil = competenciasB.length > 0
    ? competenciasB.reduce((min, comp) => comp.decil < min.decil ? comp : min)
    : null;

  return {
    promedioDecilesA,
    promedioDecilesB,
    competenciasMasFuertes,
    competenciasMasDebiles,
    potencialMasFuerte,
    potencialMasDebil
  };
}

/**
 * Formatear puntaje natural para visualización
 */
export function formatearPuntaje(puntaje: number, decimales: number = 2): string {
  return puntaje.toFixed(decimales);
}

/**
 * Obtener rango de puntajes para una escala de visualización
 */
export function obtenerRangoPuntajes(
  resultados: (ResultadoCompetenciaA | ResultadoCompetenciaB)[]
): { min: number; max: number; rango: number } {
  if (resultados.length === 0) {
    return { min: 0, max: 100, rango: 100 };
  }

  const puntajes = resultados.map(r => r.puntajeNatural);
  const min = Math.min(...puntajes);
  const max = Math.max(...puntajes);
  const rango = max - min;

  return { min, max, rango };
}

/**
 * Normalizar puntaje a escala 0-100
 */
export function normalizarPuntaje(
  puntaje: number,
  min: number,
  max: number
): number {
  if (max === min) return 50;
  return ((puntaje - min) / (max - min)) * 100;
}

/**
 * Validar que todos los resultados necesarios estén presentes
 */
export function validarResultadosCompletos(
  escalasResultados: Map<string, ResultadoEscala>
): { completo: boolean; escalasFaltantes: string[] } {
  const escalasRequeridas = new Set<string>();
  
  COMPETENCIAS_A.forEach(comp => {
    comp.escalas.forEach(escala => escalasRequeridas.add(escala));
  });

  const escalasPresentes = new Set(escalasResultados.keys());
  const escalasFaltantes: string[] = [];

  escalasRequeridas.forEach(escala => {
    if (!escalasPresentes.has(escala)) {
      escalasFaltantes.push(escala);
    }
  });

  return {
    completo: escalasFaltantes.length === 0,
    escalasFaltantes
  };
}

/**
 * Generar recomendaciones basadas en los resultados
 */
export function generarRecomendaciones(
  competenciasA: ResultadoCompetenciaA[]
): Array<{ competencia: string; recomendacion: string; prioridad: 'alta' | 'media' | 'baja' }> {
  const recomendaciones: Array<{ competencia: string; recomendacion: string; prioridad: 'alta' | 'media' | 'baja' }> = [];

  const competenciasBajas = competenciasA.filter(comp => comp.decil <= 3);

  competenciasBajas.forEach(comp => {
    let recomendacion = '';
    let prioridad: 'alta' | 'media' | 'baja' = 'media';

    if (comp.codigo.includes('FINANCIERA') || comp.codigo.includes('ADMINISTRACION')) {
      recomendacion = 'Considera tomar un curso de educación financiera o buscar asesoría profesional.';
      prioridad = 'alta';
    } else if (comp.codigo.includes('AUTOCONTROL') || comp.codigo.includes('DISCIPLINA')) {
      recomendacion = 'Establece metas pequeñas y alcanzables para desarrollar hábitos consistentes.';
      prioridad = 'alta';
    } else if (comp.codigo.includes('VISION') || comp.codigo.includes('ESTRATEGIA')) {
      recomendacion = 'Dedica tiempo a planificar tus objetivos financieros a corto y largo plazo.';
      prioridad = 'media';
    } else {
      recomendacion = 'Identifica acciones concretas para fortalecer esta área.';
      prioridad = 'baja';
    }

    recomendaciones.push({
      competencia: comp.nombre,
      recomendacion,
      prioridad
    });
  });

  return recomendaciones.sort((a, b) => {
    const prioridadOrden = { alta: 0, media: 1, baja: 2 };
    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
  });
}