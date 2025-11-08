/**
 * SISTEMA DE SCORING PARA PAREAMIENTO FORZADO
 * 
 * Este módulo re-exporta la función de scoring principal desde lib/scoring.ts
 * para mantener compatibilidad con el código existente.
 */

export { scoreEvaluado, validarResultadosCompletos } from './scoring';
export type { ScoringResult, ScoringWarning } from './scoring';