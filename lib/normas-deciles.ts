/**
 * NORMAS DE CONTRASTE - TABLAS DE DECILES
 * Sistema de Evaluación Psicofinanciera
 * 
 * Estas tablas convierten puntajes naturales en deciles (1-10)
 * mediante percentiles de referencia (0.0 a 0.9)
 */

// ============================================
// TIPOS
// ============================================

export interface NormaDecil {
  percentil: number;
  decil: number;
  corte: number;
}

export type TablaNormas = Record<string, NormaDecil[]>;

// ============================================
// NORMAS DE ESCALAS (32 Escalas A)
// ============================================

export const NORMAS_ESCALAS: TablaNormas = {
  // Anticipación
  'ANTICIPACION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 10.4 },
    { percentil: 0.2, decil: 3, corte: 12.2 },
    { percentil: 0.3, decil: 4, corte: 13.0 },
    { percentil: 0.4, decil: 5, corte: 14.0 },
    { percentil: 0.5, decil: 6, corte: 15.0 },
    { percentil: 0.6, decil: 7, corte: 16.0 },
    { percentil: 0.7, decil: 8, corte: 18.4 },
    { percentil: 0.8, decil: 9, corte: 20.8 },
    { percentil: 0.9, decil: 10, corte: 23.0 }
  ],
  
  // Autoconocimiento
  'AUTOCONOCIMIENTO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 3.2 },
    { percentil: 0.2, decil: 3, corte: 5.0 },
    { percentil: 0.3, decil: 4, corte: 5.8 },
    { percentil: 0.4, decil: 5, corte: 6.4 },
    { percentil: 0.5, decil: 6, corte: 8.0 },
    { percentil: 0.6, decil: 7, corte: 8.0 },
    { percentil: 0.7, decil: 8, corte: 9.2 },
    { percentil: 0.8, decil: 9, corte: 10.8 },
    { percentil: 0.9, decil: 10, corte: 19.8 }
  ],

  // Autocontrol
  'AUTOCONTROL': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 5.6 },
    { percentil: 0.2, decil: 3, corte: 6.6 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 9.4 },
    { percentil: 0.5, decil: 6, corte: 10.0 },
    { percentil: 0.6, decil: 7, corte: 11.0 },
    { percentil: 0.7, decil: 8, corte: 12.2 },
    { percentil: 0.8, decil: 9, corte: 13.8 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Autorefuerzo
  'AUTOREFUERZO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.2 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 9.4 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.6 },
    { percentil: 0.7, decil: 8, corte: 14.4 },
    { percentil: 0.8, decil: 9, corte: 16.0 },
    { percentil: 0.9, decil: 10, corte: 19.2 }
  ],

  // Autosupervisión
  'AUTOSUPERVISION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 4.8 },
    { percentil: 0.2, decil: 3, corte: 10.0 },
    { percentil: 0.3, decil: 4, corte: 10.8 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 12.6 },
    { percentil: 0.7, decil: 8, corte: 13.4 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.2 }
  ],

  // Autonomía
  'AUTONOMIA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 4.2 },
    { percentil: 0.2, decil: 3, corte: 6.0 },
    { percentil: 0.3, decil: 4, corte: 6.0 },
    { percentil: 0.4, decil: 5, corte: 8.0 },
    { percentil: 0.5, decil: 6, corte: 8.0 },
    { percentil: 0.6, decil: 7, corte: 8.0 },
    { percentil: 0.7, decil: 8, corte: 8.6 },
    { percentil: 0.8, decil: 9, corte: 11.8 },
    { percentil: 0.9, decil: 10, corte: 13.0 }
  ],

  // Alineamiento de Acciones
  'ALINEAMIENTO_ACCIONES': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 8.0 },
    { percentil: 0.2, decil: 3, corte: 10.0 },
    { percentil: 0.3, decil: 4, corte: 11.0 },
    { percentil: 0.4, decil: 5, corte: 12.0 },
    { percentil: 0.5, decil: 6, corte: 13.0 },
    { percentil: 0.6, decil: 7, corte: 14.0 },
    { percentil: 0.7, decil: 8, corte: 15.0 },
    { percentil: 0.8, decil: 9, corte: 16.0 },
    { percentil: 0.9, decil: 10, corte: 18.0 }
  ],

  // Claridad de Estrategia
  'CLARIDAD_ESTRATEGIA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Visión Clara
  'VISION_CLARA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Control Percibido
  'CONTROL_PERCIBIDO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.7, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Anteposición de Intereses
  'ANTEPOSICION_INTERESES': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 5.0 },
    { percentil: 0.2, decil: 3, corte: 7.0 },
    { percentil: 0.3, decil: 4, corte: 8.0 },
    { percentil: 0.4, decil: 5, corte: 9.0 },
    { percentil: 0.5, decil: 6, corte: 10.0 },
    { percentil: 0.6, decil: 7, corte: 11.0 },
    { percentil: 0.7, decil: 8, corte: 12.0 },
    { percentil: 0.8, decil: 9, corte: 13.0 },
    { percentil: 0.9, decil: 10, corte: 15.0 }
  ],

  // Habilidad Administrativa
  'HABILIDAD_ADMINISTRATIVA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 8.0 },
    { percentil: 0.2, decil: 3, corte: 10.0 },
    { percentil: 0.3, decil: 4, corte: 11.0 },
    { percentil: 0.4, decil: 5, corte: 12.0 },
    { percentil: 0.5, decil: 6, corte: 13.0 },
    { percentil: 0.6, decil: 7, corte: 14.0 },
    { percentil: 0.7, decil: 8, corte: 15.0 },
    { percentil: 0.8, decil: 9, corte: 16.0 },
    { percentil: 0.9, decil: 10, corte: 18.0 }
  ],

  // Tolerancia al Conflicto
  'TOLERANCIA_CONFLICTO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Salud Financiera
  'SALUD_FINANCIERA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.6 },
    { percentil: 0.2, decil: 3, corte: 8.6 },
    { percentil: 0.3, decil: 4, corte: 11.0 },
    { percentil: 0.4, decil: 5, corte: 12.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.2 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.4 }
  ],

  // Merecimiento
  'MERECIMIENTO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Autoconfianza
  'AUTOCONFIANZA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 8.0 },
    { percentil: 0.2, decil: 3, corte: 10.0 },
    { percentil: 0.3, decil: 4, corte: 11.0 },
    { percentil: 0.4, decil: 5, corte: 12.0 },
    { percentil: 0.5, decil: 6, corte: 13.0 },
    { percentil: 0.6, decil: 7, corte: 14.0 },
    { percentil: 0.7, decil: 8, corte: 15.0 },
    { percentil: 0.8, decil: 9, corte: 16.0 },
    { percentil: 0.9, decil: 10, corte: 18.0 }
  ],

  // Confiabilidad
  'CONFIABILIDAD': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Rectitud
  'RECTITUD': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Tenacidad
  'TENACIDAD': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Aprovechamiento de Talentos
  'APROVECHAMIENTO_TALENTOS': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Emprendimiento
  'EMPRENDIMIENTO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Influencia
  'INFLUENCIA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Apertura a Oportunidades
  'APERTURA_OPORTUNIDADES': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Capacidad de Reacción
  'CAPACIDAD_REACCION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Temple
  'TEMPLE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Perseverancia
  'PERSEVERANCIA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Superación
  'SUPERACION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Consciencia del Entorno
  'CONSCIENCIA_ENTORNO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Esfuerzo
  'ESFUERZO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Enfoque
  'ENFOQUE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Recuperación
  'RECUPERACION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Resolución
  'RESOLUCION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Sentido de Contribución
  'SENTIDO_CONTRIBUCION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Satisfacción (Escala especial para Cuadrantes)
  'SATISFACCION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],
};

// ============================================
// NORMAS DE COMPETENCIAS A (32 competencias)
// ============================================

export const NORMAS_COMPETENCIAS: TablaNormas = {
  // 3 Capacidades clave de éxito financiero
  'VISION_ESTRATEGICA': [
    { percentil: 0.0, decil: 1, corte: 0.00 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  'AUTODOMINIO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  'COMPETENCIA_FINANCIERA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // Cuadrantes de Realización
  'SITUACION_FINANCIERA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  // 8 Factores de disposición psicoemocional a la abundancia
  'MERECIMIENTO_AUTOCONFIANZA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.5 },
    { percentil: 0.2, decil: 3, corte: 9.5 },
    { percentil: 0.3, decil: 4, corte: 10.5 },
    { percentil: 0.4, decil: 5, corte: 11.5 },
    { percentil: 0.5, decil: 6, corte: 12.5 },
    { percentil: 0.6, decil: 7, corte: 13.5 },
    { percentil: 0.7, decil: 8, corte: 14.5 },
    { percentil: 0.8, decil: 9, corte: 15.5 },
    { percentil: 0.9, decil: 10, corte: 17.5 }
  ],

  'PROYECTAR_FUTURO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'CONTROL_FINANZAS': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.5 },
    { percentil: 0.2, decil: 3, corte: 9.5 },
    { percentil: 0.3, decil: 4, corte: 10.5 },
    { percentil: 0.4, decil: 5, corte: 11.5 },
    { percentil: 0.5, decil: 6, corte: 12.5 },
    { percentil: 0.6, decil: 7, corte: 13.5 },
    { percentil: 0.7, decil: 8, corte: 14.5 },
    { percentil: 0.8, decil: 9, corte: 15.5 },
    { percentil: 0.9, decil: 10, corte: 17.5 }
  ],

  'ADMINISTRACION_CONGRUENTE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5},
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'TOLERANCIA_TENSION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  'CONFIABILIDAD_RECTITUD': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'TENACIDAD': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  'APROVECHAMIENTO_TALENTOS': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  // Precursores en la Generación de Ingresos
  'EMPRENDIMIENTO_EVOLUTIVO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 5.2 },
    { percentil: 0.2, decil: 3, corte: 6.6 },
    { percentil: 0.3, decil: 4, corte: 8.6 },
    { percentil: 0.4, decil: 5, corte: 9.5 },
    { percentil: 0.5, decil: 6, corte: 9.5 },
    { percentil: 0.6, decil: 7, corte: 10.8 },
    { percentil: 0.7, decil: 8, corte: 12.6 },
    { percentil: 0.8, decil: 9, corte: 13.0 },
    { percentil: 0.9, decil: 10, corte: 13.9 }
  ],

  'FOCO_PERSISTENTE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  'INFLUENCIA_PROACTIVA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'RESULTADO_DINAMICO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  // Precursores del Control Efectivo del Gasto
  'DECISION_CONGRUENTE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  'GESTION_REFLEXIVA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'DISCIPLINA_FINANCIERA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'ELECCION_AUTONOMA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 5.5 },
    { percentil: 0.2, decil: 3, corte: 7.5 },
    { percentil: 0.3, decil: 4, corte: 8.5 },
    { percentil: 0.4, decil: 5, corte: 9.5 },
    { percentil: 0.5, decil: 6, corte: 10.5 },
    { percentil: 0.6, decil: 7, corte: 11.5 },
    { percentil: 0.7, decil: 8, corte: 12.5 },
    { percentil: 0.8, decil: 9, corte: 13.5 },
    { percentil: 0.9, decil: 10, corte: 15.5 }
  ],

  // Precursores de la Generación de Ahorros
  'SUPERACION_PROGRESIVA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'AUTOCONTROL_CONSISTENTE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'ADMINISTRACION_INFORMADA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  'ESFUERZO_CONSTANTE': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  // Precursores de la Gestión Efectiva de la Deuda
  'HABITOS_SALUDABLES': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'AUTONOMIA_RESOLUTIVA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  'RESPUESTA_AGIL': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.0 },
    { percentil: 0.2, decil: 3, corte: 8.0 },
    { percentil: 0.3, decil: 4, corte: 9.0 },
    { percentil: 0.4, decil: 5, corte: 10.0 },
    { percentil: 0.5, decil: 6, corte: 11.0 },
    { percentil: 0.6, decil: 7, corte: 12.0 },
    { percentil: 0.7, decil: 8, corte: 13.0 },
    { percentil: 0.8, decil: 9, corte: 14.0 },
    { percentil: 0.9, decil: 10, corte: 16.0 }
  ],

  'RESILIENCIA_ECONOMICA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  // Precursores de Gestión de Inversiones Financieras
  'MENTALIDAD_ABIERTA_INVERSIONES': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],

  'RESPUESTA_OPORTUNA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  'ANTICIPACION_OPORTUNIDADES': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 7.0 },
    { percentil: 0.2, decil: 3, corte: 9.0 },
    { percentil: 0.3, decil: 4, corte: 10.0 },
    { percentil: 0.4, decil: 5, corte: 11.0 },
    { percentil: 0.5, decil: 6, corte: 12.0 },
    { percentil: 0.6, decil: 7, corte: 13.0 },
    { percentil: 0.7, decil: 8, corte: 14.0 },
    { percentil: 0.8, decil: 9, corte: 15.0 },
    { percentil: 0.9, decil: 10, corte: 17.0 }
  ],

  'ESTRATEGIA_PROPOSITIVA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 6.5 },
    { percentil: 0.2, decil: 3, corte: 8.5 },
    { percentil: 0.3, decil: 4, corte: 9.5 },
    { percentil: 0.4, decil: 5, corte: 10.5 },
    { percentil: 0.5, decil: 6, corte: 11.5 },
    { percentil: 0.6, decil: 7, corte: 12.5 },
    { percentil: 0.7, decil: 8, corte: 13.5 },
    { percentil: 0.8, decil: 9, corte: 14.5 },
    { percentil: 0.9, decil: 10, corte: 16.5 }
  ],
};

// ============================================
// NORMAS DE HABILIDADES FINANCIERAS (5 Escalas B)
// ============================================

export const NORMAS_HABILIDADES_FINANCIERAS: TablaNormas = {
  // Habilidad generación de ahorro
  'HABILIDAD_GENERACION_AHORRO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 3.4 },
    { percentil: 0.2, decil: 3, corte: 3.92 },
    { percentil: 0.3, decil: 4, corte: 4.0 },
    { percentil: 0.4, decil: 5, corte: 4.2 },
    { percentil: 0.5, decil: 6, corte: 4.4 },
    { percentil: 0.6, decil: 7, corte: 4.56 },
    { percentil: 0.7, decil: 8, corte: 4.6 },
    { percentil: 0.8, decil: 9, corte: 4.8 },
    { percentil: 0.9, decil: 10, corte: 5.0 }
  ],

  // Habilidad control de la deuda
  'HABILIDAD_CONTROL_DEUDA': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 3.36 },
    { percentil: 0.2, decil: 3, corte: 3.6 },
    { percentil: 0.3, decil: 4, corte: 4.0 },
    { percentil: 0.4, decil: 5, corte: 4.2 },
    { percentil: 0.5, decil: 6, corte: 4.4 },
    { percentil: 0.6, decil: 7, corte: 4.6 },
    { percentil: 0.7, decil: 8, corte: 4.8 },
    { percentil: 0.8, decil: 9, corte: 4.9 },
    { percentil: 0.9, decil: 10, corte: 5.0 }
  ],

  // Habilidad control de gasto
  'HABILIDAD_CONTROL_GASTO': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 3.2 },
    { percentil: 0.2, decil: 3, corte: 3.6 },
    { percentil: 0.3, decil: 4, corte: 3.8 },
    { percentil: 0.4, decil: 5, corte: 4.0 },
    { percentil: 0.5, decil: 6, corte: 4.2 },
    { percentil: 0.6, decil: 7, corte: 4.4 },
    { percentil: 0.7, decil: 8, corte: 4.5 },
    { percentil: 0.8, decil: 9, corte: 4.6 },
    { percentil: 0.9, decil: 10, corte: 4.8 }
  ],

  // Habilidad generación de ingresos
  'HABILIDAD_GENERACION_INGRESOS': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 2.8 },
    { percentil: 0.2, decil: 3, corte: 3.32 },
    { percentil: 0.3, decil: 4, corte: 3.4 },
    { percentil: 0.4, decil: 5, corte: 3.6 },
    { percentil: 0.5, decil: 6, corte: 3.8 },
    { percentil: 0.6, decil: 7, corte: 4.0 },
    { percentil: 0.7, decil: 8, corte: 4.2 },
    { percentil: 0.8, decil: 9, corte: 4.6 },
    { percentil: 0.9, decil: 10, corte: 4.84 }
  ],

  // Habilidad gestión de inversión
  'HABILIDAD_GESTION_INVERSION': [
    { percentil: 0.0, decil: 1, corte: 0 },
    { percentil: 0.1, decil: 2, corte: 3.12 },
    { percentil: 0.2, decil: 3, corte: 3.4 },
    { percentil: 0.3, decil: 4, corte: 3.6 },
    { percentil: 0.4, decil: 5, corte: 4.0 },
    { percentil: 0.5, decil: 6, corte: 4.1 },
    { percentil: 0.6, decil: 7, corte: 4.2 },
    { percentil: 0.7, decil: 8, corte: 4.4 },
    { percentil: 0.8, decil: 9, corte: 4.6 },
    { percentil: 0.9, decil: 10, corte: 4.64 }
  ]
};

// ============================================
// FUNCIÓN PRINCIPAL DE CÁLCULO DE DECIL
// ============================================

/**
 * Calcula el decil para un puntaje dado usando la tabla de normas correspondiente
 */
export function calcularDecil(
  puntaje: number,
  tablaNormas: NormaDecil[]
): number {
  // Validar entrada
  if (puntaje < 0) {
    console.warn(`Puntaje negativo recibido: ${puntaje}. Retornando decil 1.`);
    return 1;
  }

  if (!tablaNormas || tablaNormas.length === 0) {
    console.warn('Tabla de normas vacía. Retornando decil 1.');
    return 1;
  }

  // Ordenar tabla por corte
  const tablaOrdenada = [...tablaNormas].sort((a, b) => a.corte - b.corte);

  // Caso 1: Puntaje menor al mínimo
  if (puntaje < tablaOrdenada[0].corte) {
    return 1;
  }

  // Caso 2: Puntaje mayor al máximo
  const ultimaFila = tablaOrdenada[tablaOrdenada.length - 1];
  if (puntaje >= ultimaFila.corte) {
    return 10;
  }

  // Caso 3: Buscar el mayor corte ≤ puntaje
  let decilResultado = 1;
  
  for (const fila of tablaOrdenada) {
    if (puntaje >= fila.corte) {
      decilResultado = fila.decil;
    } else {
      break;
    }
  }

  return decilResultado;
}

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtener la tabla de normas correcta según el tipo y código
 */
export function obtenerTablaNormas(
  tipo: 'ESCALA' | 'COMPETENCIA' | 'HABILIDAD_FINANCIERA',
  codigo: string
): NormaDecil[] | null {
  let tabla: TablaNormas;

  switch (tipo) {
    case 'ESCALA':
      tabla = NORMAS_ESCALAS;
      break;
    case 'COMPETENCIA':
      tabla = NORMAS_COMPETENCIAS;
      break;
    case 'HABILIDAD_FINANCIERA':
      tabla = NORMAS_HABILIDADES_FINANCIERAS;
      break;
    default:
      console.error(`Tipo de norma desconocido: ${tipo}`);
      return null;
  }

  const normas = tabla[codigo];
  
  if (!normas) {
    console.warn(`No se encontraron normas para ${tipo} con código: ${codigo}`);
    return null;
  }

  return normas;
}

/**
 * Calcular decil con tipo y código
 */
export function calcularDeciPorTipo(
  puntaje: number,
  tipo: 'ESCALA' | 'COMPETENCIA' | 'HABILIDAD_FINANCIERA',
  codigo: string
): number {
  const tablaNormas = obtenerTablaNormas(tipo, codigo);
  
  if (!tablaNormas) {
    console.warn(`No se pudo obtener tabla de normas para ${tipo} ${codigo}. Retornando decil 1.`);
    return 1;
  }

  return calcularDecil(puntaje, tablaNormas);
}

/**
 * Validar que una tabla de normas esté bien formada
 */
export function validarTablaNormas(tabla: NormaDecil[]): {
  valida: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (!tabla || tabla.length === 0) {
    errores.push('Tabla vacía');
    return { valida: false, errores };
  }

  // Verificar que tenga 10 filas
  if (tabla.length !== 10) {
    errores.push(`Tabla debe tener 10 filas, tiene ${tabla.length}`);
  }

  // Verificar que los deciles vayan de 1 a 10
  const deciles = tabla.map(f => f.decil).sort((a, b) => a - b);
  const decilesEsperados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  if (JSON.stringify(deciles) !== JSON.stringify(decilesEsperados)) {
    errores.push('Los deciles no van de 1 a 10 correctamente');
  }

  // Verificar que los cortes estén en orden ascendente
  for (let i = 1; i < tabla.length; i++) {
    if (tabla[i].corte < tabla[i - 1].corte) {
      errores.push(`Cortes no están en orden ascendente en fila ${i}`);
    }
  }

  return {
    valida: errores.length === 0,
    errores
  };
}

// ============================================
// EXPORTAR TODO
// ============================================

export const TODAS_LAS_NORMAS = {
  ESCALAS: NORMAS_ESCALAS,
  COMPETENCIAS: NORMAS_COMPETENCIAS,
  HABILIDADES_FINANCIERAS: NORMAS_HABILIDADES_FINANCIERAS
};
