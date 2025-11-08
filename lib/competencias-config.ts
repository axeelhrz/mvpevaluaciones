/**
 * CONFIGURACIÓN COMPLETA DE COMPETENCIAS Y ESCALAS
 * Sistema de Evaluación Psicofinanciera
 */

// ============================================
// TIPOS Y ESTRUCTURAS
// ============================================

export interface EscalaConfig {
  codigo: string;
  nombre: string;
}

export interface CompetenciaAConfig {
  codigo: string;
  nombre: string;
  escalas: string[]; // Códigos de las escalas
  normaContraste: string;
  visualizacionPDF: string;
  seccionPDF: string;
}

export interface CompetenciaBConfig {
  codigo: string;
  nombre: string;
  competenciasA: string[]; // Códigos de las Competencias A
  visualizacionPDF: string;
  seccionPDF: string;
}

// ============================================
// ESCALAS (38 escalas: 32 A + 1 Satisfacción + 5 B)
// ============================================

export const ESCALAS: EscalaConfig[] = [
  // 32 Escalas A (existentes)
  { codigo: "ALINEAMIENTO_ACCIONES", nombre: "Alineamiento de Acciones" },
  { codigo: "CLARIDAD_ESTRATEGIA", nombre: "Claridad de Estrategia" },
  { codigo: "VISION_CLARA", nombre: "Visión Clara" },
  { codigo: "CONTROL_PERCIBIDO", nombre: "Control Percibido" },
  { codigo: "AUTOCONTROL", nombre: "Autocontrol" },
  { codigo: "ANTEPOSICION_INTERESES", nombre: "Anteposición de intereses" },
  { codigo: "HABILIDAD_ADMINISTRATIVA", nombre: "Habilidad Administrativa" },
  { codigo: "TOLERANCIA_CONFLICTO", nombre: "Tolerancia al Conflicto" },
  { codigo: "SALUD_FINANCIERA", nombre: "Salud financiera" },
  { codigo: "MERECIMIENTO", nombre: "Merecimiento" },
  { codigo: "AUTOCONFIANZA", nombre: "Autoconfianza" },
  { codigo: "AUTOSUPERVISION", nombre: "Autosupervisión" },
  { codigo: "CONFIABILIDAD", nombre: "Confiabilidad" },
  { codigo: "RECTITUD", nombre: "Rectitud" },
  { codigo: "TENACIDAD", nombre: "Tenacidad" },
  { codigo: "APROVECHAMIENTO_TALENTOS", nombre: "Aprovechamiento de talentos" },
  { codigo: "EMPRENDIMIENTO", nombre: "Emprendimiento" },
  { codigo: "INFLUENCIA", nombre: "Influencia" },
  { codigo: "APERTURA_OPORTUNIDADES", nombre: "Apertura a Oportunidades" },
  { codigo: "ANTICIPACION", nombre: "Anticipación" },
  { codigo: "CAPACIDAD_REACCION", nombre: "Capacidad de Reacción" },
  { codigo: "TEMPLE", nombre: "Temple" },
  { codigo: "PERSEVERANCIA", nombre: "Perseverancia" },
  { codigo: "AUTOCONOCIMIENTO", nombre: "Autoconocimiento" },
  { codigo: "AUTONOMIA", nombre: "Autonomía" },
  { codigo: "SUPERACION", nombre: "Superación" },
  { codigo: "CONSCIENCIA_ENTORNO", nombre: "Consciencia del Entorno" },
  { codigo: "ESFUERZO", nombre: "Esfuerzo" },
  { codigo: "ENFOQUE", nombre: "Enfoque" },
  { codigo: "RECUPERACION", nombre: "Recuperación" },
  { codigo: "RESOLUCION", nombre: "Resolución" },
  { codigo: "SENTIDO_CONTRIBUCION", nombre: "Sentido de Contribución" },
  
  // 1 Escala especial para Cuadrantes
  { codigo: "SATISFACCION", nombre: "Satisfacción" },
  
  // 5 Escalas B (Habilidades financieras)
  { codigo: "HABILIDAD_GENERACION_INGRESOS", nombre: "Habilidad generación de Ingresos" },
  { codigo: "HABILIDAD_CONTROL_GASTO", nombre: "Habilidad control de gasto" },
  { codigo: "HABILIDAD_GENERACION_AHORRO", nombre: "Habilidad generación de ahorro" },
  { codigo: "HABILIDAD_CONTROL_DEUDA", nombre: "Habilidad control de la deuda" },
  { codigo: "HABILIDAD_GESTION_INVERSION", nombre: "Habilidad gestión de inversión" },
];

// ============================================
// COMPETENCIAS A (32 competencias)
// ============================================

export const COMPETENCIAS_A: CompetenciaAConfig[] = [
  // 3 Capacidades clave de éxito financiero
  {
    codigo: "VISION_ESTRATEGICA",
    nombre: "Visión estratégica",
    escalas: ["ALINEAMIENTO_ACCIONES", "CLARIDAD_ESTRATEGIA", "VISION_CLARA"],
    normaContraste: "Visión estratégica",
    visualizacionPDF: "Visión estratégica",
    seccionPDF: "Resultados 3 Capacidades clave de éxito financiero"
  },
  {
    codigo: "AUTODOMINIO",
    nombre: "Autodominio",
    escalas: ["CONTROL_PERCIBIDO", "AUTOCONTROL", "ANTEPOSICION_INTERESES"],
    normaContraste: "Autodominio",
    visualizacionPDF: "Autodominio",
    seccionPDF: "Resultados 3 Capacidades clave de éxito financiero"
  },
  {
    codigo: "COMPETENCIA_FINANCIERA",
    nombre: "Competencia financiera",
    escalas: ["CONTROL_PERCIBIDO", "HABILIDAD_ADMINISTRATIVA", "TOLERANCIA_CONFLICTO"],
    normaContraste: "Competencia financiera",
    visualizacionPDF: "Competencia financiera",
    seccionPDF: "Resultados 3 Capacidades clave de éxito financiero"
  },

  // Cuadrantes de Realización
  {
    codigo: "SITUACION_FINANCIERA",
    nombre: "Situación financiera",
    escalas: ["HABILIDAD_ADMINISTRATIVA", "SALUD_FINANCIERA"],
    normaContraste: "Situación financiera",
    visualizacionPDF: "Situación financiera",
    seccionPDF: "Resultados Cuadrantes de Realización"
  },

  // 8 Factores de disposición psicoemocional a la abundancia
  {
    codigo: "MERECIMIENTO_AUTOCONFIANZA",
    nombre: "Merecimiento y Autoconfianza",
    escalas: ["MERECIMIENTO", "AUTOCONFIANZA"],
    normaContraste: "Merecimiento y Autoconfianza",
    visualizacionPDF: "Merecimiento y Autoconfianza",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "PROYECTAR_FUTURO",
    nombre: "Proyectar el futuro",
    escalas: ["VISION_CLARA", "CLARIDAD_ESTRATEGIA"],
    normaContraste: "Proyectar el futuro",
    visualizacionPDF: "Proyectar el futuro",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "CONTROL_FINANZAS",
    nombre: "Control de las finanzas",
    escalas: ["CONTROL_PERCIBIDO", "HABILIDAD_ADMINISTRATIVA"],
    normaContraste: "Control de las finanzas",
    visualizacionPDF: "Control de las finanzas",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "ADMINISTRACION_CONGRUENTE",
    nombre: "Administración congruente",
    escalas: ["ALINEAMIENTO_ACCIONES", "AUTOSUPERVISION"],
    normaContraste: "Administración congruente",
    visualizacionPDF: "Administración congruente",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "TOLERANCIA_TENSION",
    nombre: "Tolerancia a la tensión",
    escalas: ["AUTOCONTROL", "TOLERANCIA_CONFLICTO"],
    normaContraste: "Tolerancia a la tensión",
    visualizacionPDF: "Tolerancia a la tensión",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "CONFIABILIDAD_RECTITUD",
    nombre: "Confiabilidad y Rectitud",
    escalas: ["CONFIABILIDAD", "RECTITUD"],
    normaContraste: "Confiabilidad y Rectitud",
    visualizacionPDF: "Confiabilidad y Rectitud",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "TENACIDAD",
    nombre: "Tenacidad",
    escalas: ["TENACIDAD"],
    normaContraste: "Tenacidad",
    visualizacionPDF: "Tenacidad",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },
  {
    codigo: "APROVECHAMIENTO_TALENTOS",
    nombre: "Aprovechamiento de talentos",
    escalas: ["APROVECHAMIENTO_TALENTOS"],
    normaContraste: "Aprovechamiento de talentos",
    visualizacionPDF: "Aprovechamiento de talentos",
    seccionPDF: "Resultados 8 Factores de disposición psicoemocional a la abundancia"
  },

  // Precursores en la Generación de Ingresos
  {
    codigo: "EMPRENDIMIENTO_EVOLUTIVO",
    nombre: "Emprendimiento evolutivo",
    escalas: ["EMPRENDIMIENTO", "APROVECHAMIENTO_TALENTOS"],
    normaContraste: "Emprendimiento evolutivo",
    visualizacionPDF: "Emprendimiento evolutivo",
    seccionPDF: "Resultados en Precursores en la Generación de Ingresos"
  },
  {
    codigo: "FOCO_PERSISTENTE",
    nombre: "Foco persistente",
    escalas: ["CLARIDAD_ESTRATEGIA", "TENACIDAD"],
    normaContraste: "Foco persistente",
    visualizacionPDF: "Foco persistente",
    seccionPDF: "Resultados en Precursores en la Generación de Ingresos"
  },
  {
    codigo: "INFLUENCIA_PROACTIVA",
    nombre: "Influencia proactiva",
    escalas: ["INFLUENCIA", "APERTURA_OPORTUNIDADES"],
    normaContraste: "Influencia proactiva",
    visualizacionPDF: "Influencia proactiva",
    seccionPDF: "Resultados en Precursores en la Generación de Ingresos"
  },
  {
    codigo: "RESULTADO_DINAMICO",
    nombre: "Resultado dinámico",
    escalas: ["ANTICIPACION", "CAPACIDAD_REACCION"],
    normaContraste: "Resultado dinámico",
    visualizacionPDF: "Resultado dinámico",
    seccionPDF: "Resultados en Precursores en la Generación de Ingresos"
  },

  // Precursores del Control Efectivo del Gasto
  {
    codigo: "DECISION_CONGRUENTE",
    nombre: "Decisión congruente",
    escalas: ["ANTEPOSICION_INTERESES", "TEMPLE"],
    normaContraste: "Decisión congruente",
    visualizacionPDF: "Decisión congruente",
    seccionPDF: "Resultados en Precursores del Control Efectivo del Gasto"
  },
  {
    codigo: "GESTION_REFLEXIVA",
    nombre: "Gestión reflexiva",
    escalas: ["AUTOSUPERVISION", "TOLERANCIA_CONFLICTO"],
    normaContraste: "Gestión reflexiva",
    visualizacionPDF: "Gestión reflexiva",
    seccionPDF: "Resultados en Precursores del Control Efectivo del Gasto"
  },
  {
    codigo: "DISCIPLINA_FINANCIERA",
    nombre: "Disciplina financiera",
    escalas: ["PERSEVERANCIA", "RECTITUD"],
    normaContraste: "Disciplina financiera",
    visualizacionPDF: "Disciplina financiera",
    seccionPDF: "Resultados en Precursores del Control Efectivo del Gasto"
  },
  {
    codigo: "ELECCION_AUTONOMA",
    nombre: "Elección autónoma",
    escalas: ["AUTOCONOCIMIENTO", "AUTONOMIA"],
    normaContraste: "Elección autónoma",
    visualizacionPDF: "Elección autónoma",
    seccionPDF: "Resultados en Precursores del Control Efectivo del Gasto"
  },

  // Precursores de la Generación de Ahorros
  {
    codigo: "SUPERACION_PROGRESIVA",
    nombre: "Superación progresiva",
    escalas: ["TENACIDAD", "SUPERACION"],
    normaContraste: "Superación progresiva",
    visualizacionPDF: "Superación progresiva",
    seccionPDF: "Resultados en Precursores de la Generación de Ahorros"
  },
  {
    codigo: "AUTOCONTROL_CONSISTENTE",
    nombre: "Autocontrol consistente",
    escalas: ["AUTOCONTROL", "PERSEVERANCIA"],
    normaContraste: "Autocontrol consistente",
    visualizacionPDF: "Autocontrol consistente",
    seccionPDF: "Resultados en Precursores de la Generación de Ahorros"
  },
  {
    codigo: "ADMINISTRACION_INFORMADA",
    nombre: "Administración informada",
    escalas: ["HABILIDAD_ADMINISTRATIVA", "CONSCIENCIA_ENTORNO"],
    normaContraste: "Administración informada",
    visualizacionPDF: "Administración informada",
    seccionPDF: "Resultados en Precursores de la Generación de Ahorros"
  },
  {
    codigo: "ESFUERZO_CONSTANTE",
    nombre: "Esfuerzo constante",
    escalas: ["ESFUERZO", "SUPERACION"],
    normaContraste: "Esfuerzo constante",
    visualizacionPDF: "Esfuerzo constante",
    seccionPDF: "Resultados en Precursores de la Generación de Ahorros"
  },

  // Precursores de la Gestión Efectiva de la Deuda
  {
    codigo: "HABITOS_SALUDABLES",
    nombre: "Hábitos saludables",
    escalas: ["RECTITUD", "HABILIDAD_ADMINISTRATIVA"],
    normaContraste: "Hábitos saludables",
    visualizacionPDF: "Hábitos saludables",
    seccionPDF: "Resultados en Precursores de la Gestión Efectiva de la Deuda"
  },
  {
    codigo: "AUTONOMIA_RESOLUTIVA",
    nombre: "Autonomía resolutiva",
    escalas: ["AUTONOMIA", "TOLERANCIA_CONFLICTO"],
    normaContraste: "Autonomía resolutiva",
    visualizacionPDF: "Autonomía resolutiva",
    seccionPDF: "Resultados en Precursores de la Gestión Efectiva de la Deuda"
  },
  {
    codigo: "RESPUESTA_AGIL",
    nombre: "Respuesta ágil",
    escalas: ["CAPACIDAD_REACCION", "ENFOQUE"],
    normaContraste: "Respuesta ágil",
    visualizacionPDF: "Respuesta ágil",
    seccionPDF: "Resultados en Precursores de la Gestión Efectiva de la Deuda"
  },
  {
    codigo: "RESILIENCIA_ECONOMICA",
    nombre: "Resiliencia económica",
    escalas: ["RECUPERACION", "TENACIDAD"],
    normaContraste: "Resiliencia económica",
    visualizacionPDF: "Resiliencia económica",
    seccionPDF: "Resultados en Precursores de la Gestión Efectiva de la Deuda"
  },

  // Precursores de Gestión de Inversiones Financieras
  {
    codigo: "MENTALIDAD_ABIERTA_INVERSIONES",
    nombre: "Mentalidad abierta a las inversiones",
    escalas: ["APERTURA_OPORTUNIDADES", "AUTOSUPERVISION"],
    normaContraste: "Mentalidad abierta a las inversiones",
    visualizacionPDF: "Mentalidad abierta a las inversiones",
    seccionPDF: "Resultados en Precursores de Gestión de Inversiones Financieras"
  },
  {
    codigo: "RESPUESTA_OPORTUNA",
    nombre: "Respuesta oportuna",
    escalas: ["RESOLUCION", "AUTOSUPERVISION"],
    normaContraste: "Respuesta oportuna",
    visualizacionPDF: "Respuesta oportuna",
    seccionPDF: "Resultados en Precursores de Gestión de Inversiones Financieras"
  },
  {
    codigo: "ANTICIPACION_OPORTUNIDADES",
    nombre: "Anticipación a oportunidades",
    escalas: ["APERTURA_OPORTUNIDADES", "ANTICIPACION"],
    normaContraste: "Anticipación a oportunidades",
    visualizacionPDF: "Anticipación a oportunidades",
    seccionPDF: "Resultados en Precursores de Gestión de Inversiones Financieras"
  },
  {
    codigo: "ESTRATEGIA_PROPOSITIVA",
    nombre: "Estrategia propositiva",
    escalas: ["CLARIDAD_ESTRATEGIA", "SENTIDO_CONTRIBUCION"],
    normaContraste: "Estrategia propositiva",
    visualizacionPDF: "Estrategia propositiva",
    seccionPDF: "Resultados en Precursores de Gestión de Inversiones Financieras"
  },
];

// ============================================
// COMPETENCIAS B (5 competencias)
// ============================================

export const COMPETENCIAS_B: CompetenciaBConfig[] = [
  {
    codigo: "POTENCIAL_GENERACION_INGRESOS",
    nombre: "Potencial generación de ingresos",
    competenciasA: [
      "EMPRENDIMIENTO_EVOLUTIVO",
      "FOCO_PERSISTENTE",
      "INFLUENCIA_PROACTIVA",
      "RESULTADO_DINAMICO"
    ],
    visualizacionPDF: "Potencial generación de ingresos",
    seccionPDF: "Resultados Potencial Psicofinanciero"
  },
  {
    codigo: "POTENCIAL_GESTION_GASTOS",
    nombre: "Potencial gestión de gastos",
    competenciasA: [
      "DECISION_CONGRUENTE",
      "GESTION_REFLEXIVA",
      "DISCIPLINA_FINANCIERA",
      "ELECCION_AUTONOMA"
    ],
    visualizacionPDF: "Potencial gestión de gastos",
    seccionPDF: "Resultados Potencial Psicofinanciero"
  },
  {
    codigo: "POTENCIAL_GENERACION_AHORRO",
    nombre: "Potencial generación de ahorro",
    competenciasA: [
      "SUPERACION_PROGRESIVA",
      "AUTOCONTROL_CONSISTENTE",
      "ADMINISTRACION_INFORMADA",
      "ESFUERZO_CONSTANTE"
    ],
    visualizacionPDF: "Potencial generación de ahorro",
    seccionPDF: "Resultados Potencial Psicofinanciero"
  },
  {
    codigo: "POTENCIAL_CONTROL_DEUDA",
    nombre: "Potencial control de la deuda",
    competenciasA: [
      "HABITOS_SALUDABLES",
      "AUTONOMIA_RESOLUTIVA",
      "RESPUESTA_AGIL",
      "RESILIENCIA_ECONOMICA"
    ],
    visualizacionPDF: "Potencial control de la deuda",
    seccionPDF: "Resultados Potencial Psicofinanciero"
  },
  {
    codigo: "POTENCIAL_GESTION_INVERSION",
    nombre: "Potencial gestión de inversión",
    competenciasA: [
      "MENTALIDAD_ABIERTA_INVERSIONES",
      "RESPUESTA_OPORTUNA",
      "ANTICIPACION_OPORTUNIDADES",
      "ESTRATEGIA_PROPOSITIVA"
    ],
    visualizacionPDF: "Potencial gestión de inversión",
    seccionPDF: "Resultados Potencial Psicofinanciero"
  },
];

// ============================================
// SECCIONES DEL PDF (10 secciones)
// ============================================

export interface SeccionPDF {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  orden: number;
}

export const SECCIONES_PDF: SeccionPDF[] = [
  {
    codigo: "CUADRANTES_REALIZACION",
    nombre: "Resultados Cuadrantes de Realización",
    descripcion: "Análisis de tu posición en los cuadrantes de realización financiera y satisfacción personal.",
    icono: "📊",
    orden: 1
  },
  {
    codigo: "CAPACIDADES_CLAVE",
    nombre: "Resultados 3 Capacidades clave de éxito financiero",
    descripcion: "Evaluación de las tres capacidades fundamentales para el éxito financiero.",
    icono: "🎯",
    orden: 2
  },
  {
    codigo: "FACTORES_ABUNDANCIA",
    nombre: "Resultados 8 Factores de disposición psicoemocional a la abundancia",
    descripcion: "Análisis de los factores psicoemocionales que influyen en tu relación con la abundancia.",
    icono: "💎",
    orden: 3
  },
  {
    codigo: "HABILIDAD_FINANCIERA",
    nombre: "Resultados de tu habilidad financiera",
    descripcion: "Evaluación de tus habilidades prácticas en la gestión financiera.",
    icono: "💰",
    orden: 4
  },
  {
    codigo: "PRECURSORES_INGRESOS",
    nombre: "Resultados en Precursores en la Generación de Ingresos",
    descripcion: "Factores que impulsan tu capacidad para generar ingresos.",
    icono: "📈",
    orden: 5
  },
  {
    codigo: "PRECURSORES_GASTOS",
    nombre: "Resultados en Precursores del Control Efectivo del Gasto",
    descripcion: "Competencias que te ayudan a controlar y optimizar tus gastos.",
    icono: "💳",
    orden: 6
  },
  {
    codigo: "PRECURSORES_AHORRO",
    nombre: "Resultados en Precursores de la Generación de Ahorros",
    descripcion: "Habilidades que facilitan la creación y mantenimiento de ahorros.",
    icono: "🏦",
    orden: 7
  },
  {
    codigo: "PRECURSORES_DEUDA",
    nombre: "Resultados en Precursores de la Gestión Efectiva de la Deuda",
    descripcion: "Capacidades para manejar y reducir deudas de manera efectiva.",
    icono: "📉",
    orden: 8
  },
  {
    codigo: "PRECURSORES_INVERSION",
    nombre: "Resultados en Precursores de Gestión de Inversiones Financieras",
    descripcion: "Competencias para tomar decisiones de inversión inteligentes.",
    icono: "📊",
    orden: 9
  },
  {
    codigo: "POTENCIAL_PSICOFINANCIERO",
    nombre: "Resultados Potencial Psicofinanciero",
    descripcion: "Tu potencial global en las cinco áreas clave de las finanzas personales.",
    icono: "🚀",
    orden: 10
  }
];

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtener competencias A por sección del PDF
 */
export function getCompetenciasAPorSeccion(seccion: string): CompetenciaAConfig[] {
  return COMPETENCIAS_A.filter(comp => comp.seccionPDF === seccion);
}

/**
 * Obtener competencias B por sección del PDF
 */
export function getCompetenciasBPorSeccion(seccion: string): CompetenciaBConfig[] {
  return COMPETENCIAS_B.filter(comp => comp.seccionPDF === seccion);
}

/**
 * Obtener competencia A por código
 */
export function getCompetenciaAPorCodigo(codigo: string): CompetenciaAConfig | undefined {
  return COMPETENCIAS_A.find(comp => comp.codigo === codigo);
}

/**
 * Obtener competencia B por código
 */
export function getCompetenciaBPorCodigo(codigo: string): CompetenciaBConfig | undefined {
  return COMPETENCIAS_B.find(comp => comp.codigo === codigo);
}

/**
 * Obtener escala por código
 */
export function getEscalaPorCodigo(codigo: string): EscalaConfig | undefined {
  return ESCALAS.find(escala => escala.codigo === codigo);
}

/**
 * Obtener sección del PDF por código
 */
export function getSeccionPorCodigo(codigo: string): SeccionPDF | undefined {
  return SECCIONES_PDF.find(s => s.codigo === codigo);
}

/**
 * Obtener sección del PDF por nombre
 */
export function getSeccionPorNombre(nombre: string): SeccionPDF | undefined {
  return SECCIONES_PDF.find(s => s.nombre === nombre);
}

/**
 * Obtener sección del PDF para una competencia
 */
export function getSeccionPorCompetencia(codigoCompetencia: string): SeccionPDF | undefined {
  const compA = COMPETENCIAS_A.find(c => c.codigo === codigoCompetencia);
  if (compA) {
    return SECCIONES_PDF.find(s => s.nombre === compA.seccionPDF);
  }
  
  const compB = COMPETENCIAS_B.find(c => c.codigo === codigoCompetencia);
  if (compB) {
    return SECCIONES_PDF.find(s => s.nombre === compB.seccionPDF);
  }
  
  return undefined;
}

/**
 * Obtener todas las competencias de una sección
 */
export function getCompetenciasPorSeccion(nombreSeccion: string): {
  competenciasA: CompetenciaAConfig[];
  competenciasB: CompetenciaBConfig[];
} {
  return {
    competenciasA: COMPETENCIAS_A.filter(c => c.seccionPDF === nombreSeccion),
    competenciasB: COMPETENCIAS_B.filter(c => c.seccionPDF === nombreSeccion)
  };
}

/**
 * Validar que todas las escalas referenciadas existen
 */
export function validarConfiguracion(): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  const codigosEscalas = new Set(ESCALAS.map(e => e.codigo));

  // Validar Competencias A
  COMPETENCIAS_A.forEach(comp => {
    comp.escalas.forEach(escala => {
      if (!codigosEscalas.has(escala)) {
        errores.push(`Competencia A "${comp.codigo}" referencia escala inexistente: "${escala}"`);
      }
    });
  });

  // Validar Competencias B
  const codigosCompetenciasA = new Set(COMPETENCIAS_A.map(c => c.codigo));
  COMPETENCIAS_B.forEach(comp => {
    comp.competenciasA.forEach(compA => {
      if (!codigosCompetenciasA.has(compA)) {
        errores.push(`Competencia B "${comp.codigo}" referencia Competencia A inexistente: "${compA}"`);
      }
    });
  });

  return {
    valido: errores.length === 0,
    errores
  };
}