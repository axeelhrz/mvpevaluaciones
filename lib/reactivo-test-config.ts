/**
 * CONFIGURACIÓN DEL REACTIVO TEST
 * Sistema de Evaluación Psicofinanciera
 * 
 * Estructura:
 * - Reactivos A (ID 1-336): Pareamiento forzado (168 pares)
 * - Reactivos B (ID 337-361): Escala Likert 1-5 (25 reactivos)
 */

// ============================================
// TIPOS Y ESTRUCTURAS
// ============================================

export interface ReactivoA {
  id: number;
  itemPareado: number; // Índice del par (1-168)
  reactivo: number; // Número del reactivo (1-336)
  tipo: 'Pos' | 'Neg';
  puntajeFijo: number;
  test: 'Pareado';
  escala: string;
  texto: string;
}

export interface ReactivoB {
  id: number;
  reactivo: number; // Número del reactivo (337-361)
  tipo: 'Pos';
  puntajeFijo: string; // "Likert 1-5"
  test: 'Likert 1-5';
  escala: string;
  texto: string;
}

// ============================================
// MAPEO DE ESCALAS B (HABILIDADES FINANCIERAS)
// ============================================

export const ESCALAS_B_REACTIVOS: Record<string, number[]> = {
  'HABILIDAD_GENERACION_AHORRO': [337, 340, 344, 349, 355, 357],
  'HABILIDAD_CONTROL_GASTO': [338, 341, 348, 350, 357],
  'HABILIDAD_GENERACION_INGRESOS': [339, 343, 345, 356, 359],
  'HABILIDAD_GESTION_INVERSION': [342, 346, 351, 354, 358],
  'HABILIDAD_CONTROL_DEUDA': [347, 352, 353, 360, 361]
};

// ============================================
// REGLAS DE PUNTUACIÓN
// ============================================

/**
 * REACTIVO A - PAREAMIENTO FORZADO
 * 
 * Reglas:
 * 1. Cada ítem pareado tiene 2 reactivos (A y B)
 * 2. El evaluado elige UNO o NINGUNO
 * 3. Si elige un reactivo, se suma su puntajeFijo a la escala indicada
 * 4. NO hay restas: los Neg no quitan puntos
 * 5. Resultado por Escala A = sumatoria de puntajes fijos elegidos
 * 
 * Ejemplo Par 1:
 * - R1: "Planeo certificarme..." → Pos, 4, Expectativas
 * - R2: "Soy bueno para ayudar..." → Pos, 4, Influencia
 * Si elige R1 → suma 4 a Expectativas
 * Si elige R2 → suma 4 a Influencia
 * Si no elige ninguno → suma 0
 */

/**
 * REACTIVO B - LIKERT 1-5
 * 
 * Reglas:
 * 1. Cada reactivo es independiente (no pareado)
 * 2. El evaluado responde de 1 a 5
 * 3. Puntaje para la Escala = respuesta Likert (1-5)
 * 4. Resultado por Escala B = promedio de todas las respuestas
 * 
 * Ejemplo:
 * - R337: "Tengo claras mis metas de ahorro..." → Habilidad generación de ahorro
 * Si responde 4 → suma 4 a la colección de respuestas de esa escala
 * Al final → promedio de todas las respuestas de esa escala
 */

// ============================================
// AGREGACIÓN POR NIVELES
// ============================================

/**
 * FLUJO DE CÁLCULO:
 * 
 * 1. ESCALAS A = sumatoria de puntajes fijos de Reactivos A elegidos
 * 2. ESCALAS B = promedio de respuestas Likert (1-5)
 * 3. COMPETENCIAS A = promedio de sus Escalas A asociadas
 *    → Se contrasta con norma para ubicar deciles
 * 4. COMPETENCIAS B = promedio de sus Escalas B asociadas
 *    → NO tienen norma de contraste
 *    → Se expresan en base 10 o escala nativa
 * 5. DECILES = resultado de contrastar con norma de contraste
 * 6. TABLAS/GRÁFICAS del PDF se construyen con deciles y promedios
 */

// ============================================
// VALIDACIONES
// ============================================

/**
 * Validar que un par de reactivos A sea válido
 */
export function validarParReactivoA(
  itemPareado: number,
  reactivos: ReactivoA[]
): { valido: boolean; error?: string } {
  if (reactivos.length !== 2) {
    return {
      valido: false,
      error: `Par ${itemPareado} debe tener exactamente 2 reactivos, tiene ${reactivos.length}`
    };
  }

  const r1 = reactivos[0];
  const r2 = reactivos[1];

  if (r1.itemPareado !== r2.itemPareado) {
    return {
      valido: false,
      error: `Los reactivos no pertenecen al mismo par: ${r1.itemPareado} vs ${r2.itemPareado}`
    };
  }

  return { valido: true };
}

/**
 * Validar que una respuesta Likert sea válida
 */
export function validarRespuestaLikert(valor: number): { valido: boolean; error?: string } {
  if (valor < 1 || valor > 5) {
    return {
      valido: false,
      error: `Respuesta Likert debe estar entre 1 y 5, recibido: ${valor}`
    };
  }

  if (!Number.isInteger(valor)) {
    return {
      valido: false,
      error: `Respuesta Likert debe ser un número entero, recibido: ${valor}`
    };
  }

  return { valido: true };
}

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtener el rango de IDs para Reactivos A
 */
export function esReactivoA(id: number): boolean {
  return id >= 1 && id <= 336;
}

/**
 * Obtener el rango de IDs para Reactivos B
 */
export function esReactivoB(id: number): boolean {
  return id >= 337 && id <= 361;
}

/**
 * Obtener el número de par para un reactivo A
 */
export function obtenerItemPareado(reactivoId: number): number | null {
  if (!esReactivoA(reactivoId)) return null;
  return Math.ceil(reactivoId / 2);
}

/**
 * Obtener la escala B a la que pertenece un reactivo B
 */
export function obtenerEscalaBParaReactivo(reactivoId: number): string | null {
  if (!esReactivoB(reactivoId)) return null;

  for (const [escala, reactivos] of Object.entries(ESCALAS_B_REACTIVOS)) {
    if (reactivos.includes(reactivoId)) {
      return escala;
    }
  }

  return null;
}

/**
 * Obtener todos los reactivos B de una escala B
 */
export function obtenerReactivosBPorEscala(escalaB: string): number[] {
  return ESCALAS_B_REACTIVOS[escalaB] || [];
}

/**
 * Estadísticas del test
 */
export function obtenerEstadisticasTest() {
  return {
    totalReactivos: 361,
    reactivosA: 336,
    reactivosB: 25,
    totalPares: 168,
    escalasA: 32,
    escalasB: 5,
    competenciasA: 32,
    competenciasB: 5
  };
}

// ============================================
// CONSTANTES
// ============================================

export const RANGO_REACTIVOS_A = { min: 1, max: 336 } as const;
export const RANGO_REACTIVOS_B = { min: 337, max: 361 } as const;
export const TOTAL_PARES = 168;
export const RANGO_LIKERT = { min: 1, max: 5 } as const;

// ============================================
// TIPOS PARA RESPUESTAS
// ============================================

export interface RespuestaReactivoA {
  itemPareado: number;
  reactivoElegidoId: number; // ID del reactivo elegido (1-336)
  escala: string;
  puntajeFijo: number;
}

export interface RespuestaReactivoB {
  reactivoId: number; // ID del reactivo (337-361)
  escala: string;
  valorLikert: number; // 1-5
}

// ============================================
// SALIDA ESPERADA POR PARTICIPANTE
// ============================================

export interface ResultadoParticipante {
  // Escalas A (sumatorias)
  escalasA: Record<string, {
    puntajeSumado: number;
    decil: number;
  }>;
  
  // Escalas B (promedios 1-5)
  escalasB: Record<string, {
    promedioLikert: number; // 1-5
    puntajeBase10: number; // Convertido a base 10
  }>;
  
  // Competencias A (promedios + deciles)
  competenciasA: Record<string, {
    promedio: number;
    decil: number;
  }>;
  
  // Competencias B (promedios sin norma)
  competenciasB: Record<string, {
    promedio: number;
    puntajeBase10: number;
  }>;
}
