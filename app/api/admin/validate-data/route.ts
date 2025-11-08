import { NextResponse } from "next/server";
import { getAllCompetencias } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/server";

interface ValidationIssue {
  type: 'error' | 'warning' | 'duda';
  category: 'pares' | 'escalas' | 'competencias' | 'normas';
  pairId?: string;
  message: string;
  details?: unknown;
}

/**
 * Endpoint para validar la integridad de los datos en la base de datos
 * Verifica que todos los pares estén completos y correctamente formados
 */
export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient();
    const issues: ValidationIssue[] = [];

    // 1. Validar Reactivos y Pares
    const { data: allReactivos, error: reactivosError } = await supabaseAdmin
      .from('Reactivo')
      .select(`
        *,
        escala:Escala(*)
      `)
      .order('pairId', { ascending: true })
      .order('ordenEnPar', { ascending: true });

    if (reactivosError) throw reactivosError;

    // Agrupar por pairId
        interface Reactivo {
          id: string;
          pairId: string;
          ordenEnPar: number | null;
          texto?: string | null;
          tipo?: string | null;
          escalaId?: string | null;
          escala?: { id?: string | null; codigo?: string | null; nombre?: string | null } | null;
        }
    
        const pairMap = new Map<string, Reactivo[]>();
        for (const r of (allReactivos || []) as Reactivo[]) {
          if (!pairMap.has(r.pairId)) {
            pairMap.set(r.pairId, []);
          }
          pairMap.get(r.pairId)!.push(r);
        }

    // Validar cada par
    for (const [pairId, reactivos] of pairMap.entries()) {
      // REGLA 1: Cada par debe tener exactamente 2 reactivos
      if (reactivos.length !== 2) {
        issues.push({
          type: 'error',
          category: 'pares',
          pairId,
          message: `Par incompleto: "${pairId}" tiene ${reactivos.length} reactivo(s). Debe tener exactamente 2.`,
          details: { reactivos: reactivos.map(r => ({ id: r.id, ordenEnPar: r.ordenEnPar, texto: r.texto })) }
        });
        continue;
      }

      // REGLA 2: Debe haber un ordenEnPar=1 y un ordenEnPar=2
      const orden1 = reactivos.find(r => r.ordenEnPar === 1);
      const orden2 = reactivos.find(r => r.ordenEnPar === 2);

      if (!orden1 || !orden2) {
        issues.push({
          type: 'error',
          category: 'pares',
          pairId,
          message: `Par mal formado: "${pairId}" no tiene ordenEnPar 1 y 2 correctos.`,
          details: { ordenes: reactivos.map(r => r.ordenEnPar) }
        });
        continue;
      }

      // REGLA 3: Validar que tengan escalas asignadas
      if (!orden1.escala || !orden2.escala) {
        issues.push({
          type: 'duda',
          category: 'pares',
          pairId,
          message: `Par sin escala: "${pairId}" tiene reactivos sin escala asignada.`,
          details: { 
            orden1Escala: orden1.escala?.codigo || 'sin escala',
            orden2Escala: orden2.escala?.codigo || 'sin escala'
          }
        });
      }

      // REGLA 4: Advertencia si ambos son del mismo tipo
      if (orden1.tipo === orden2.tipo) {
        issues.push({
          type: 'warning',
          category: 'pares',
          pairId,
          message: `Par con mismo tipo: "${pairId}" tiene ambos reactivos como ${orden1.tipo}.`,
          details: { tipo: orden1.tipo }
        });
      }

      // REGLA 5: Validar que los textos no estén vacíos
      if (!orden1.texto?.trim() || !orden2.texto?.trim()) {
        issues.push({
          type: 'error',
          category: 'pares',
          pairId,
          message: `Par con texto vacío: "${pairId}" tiene reactivos sin texto.`
        });
      }
    }

    // 2. Validar Escalas
    const { data: escalas, error: escalasError } = await supabaseAdmin
      .from('Escala')
      .select('*');

    if (escalasError) throw escalasError;

    // Verificar que cada escala tenga al menos un reactivo
    for (const escala of escalas || []) {
      const reactivosDeEscala = allReactivos?.filter(r => r.escalaId === escala.id) || [];
      if (reactivosDeEscala.length === 0) {
        issues.push({
          type: 'warning',
          category: 'escalas',
          message: `Escala "${escala.codigo}" (${escala.nombre}) no tiene reactivos asignados.`,
          details: { escalaCodigo: escala.codigo }
        });
      }
    }

    // 3. Validar Competencias
    const competencias = await getAllCompetencias();

    for (const comp of competencias || []) {
      if (!comp.escalas || comp.escalas.length === 0) {
        issues.push({
          type: 'warning',
          category: 'competencias',
          message: `Competencia "${comp.codigo}" (${comp.nombre}) no tiene escalas asignadas.`,
          details: { competenciaCodigo: comp.codigo }
        });
      }
    }

    // 4. Validar Normas
    const { data: normas, error: normasError } = await supabaseAdmin
      .from('NormaDecil')
      .select('*')
      .order('targetTipo', { ascending: true })
      .order('targetCodigo', { ascending: true })
      .order('decil', { ascending: true });

    if (normasError) throw normasError;

    // Agrupar normas por target
    interface NormaDecil {
      id?: string | null;
      targetTipo: string;
      targetCodigo: string;
      decil: number;
      puntajeMin: number;
      // Permitir otros campos retornados por la consulta
      [key: string]: unknown;
    }

    const normasByTarget = new Map<string, NormaDecil[]>();
    for (const norma of normas || []) {
      const key = `${norma.targetTipo}:${norma.targetCodigo}`;
      if (!normasByTarget.has(key)) {
        normasByTarget.set(key, []);
      }
      normasByTarget.get(key)!.push(norma as NormaDecil);
    }

    // Validar cada grupo de normas
    for (const [key, normasGrupo] of normasByTarget.entries()) {
      const [targetTipo, targetCodigo] = key.split(':');

      // Validar que haya 10 deciles
      const deciles = new Set(normasGrupo.map(n => n.decil));
      if (deciles.size !== 10) {
        issues.push({
          type: 'warning',
          category: 'normas',
          message: `${targetTipo} "${targetCodigo}" tiene ${deciles.size} deciles. Se esperan 10 deciles (1-10).`,
          details: { targetTipo, targetCodigo, decilesEncontrados: Array.from(deciles).sort() }
        });
      }

      // Validar que no haya deciles duplicados
      const decilCounts = new Map<number, number>();
      for (const norma of normasGrupo) {
        decilCounts.set(norma.decil, (decilCounts.get(norma.decil) || 0) + 1);
      }
      for (const [decil, count] of decilCounts.entries()) {
        if (count > 1) {
          issues.push({
            type: 'error',
            category: 'normas',
            message: `${targetTipo} "${targetCodigo}" tiene el decil ${decil} duplicado ${count} veces.`,
            details: { targetTipo, targetCodigo, decil, count }
          });
        }
      }

      // Validar que los rangos sean crecientes
      const normasOrdenadas = [...normasGrupo].sort((a, b) => a.decil - b.decil);
      for (let i = 1; i < normasOrdenadas.length; i++) {
        if (normasOrdenadas[i].puntajeMin <= normasOrdenadas[i - 1].puntajeMin) {
          issues.push({
            type: 'error',
            category: 'normas',
            message: `${targetTipo} "${targetCodigo}": puntajeMin no es creciente entre deciles ${normasOrdenadas[i - 1].decil} y ${normasOrdenadas[i].decil}.`,
            details: {
              targetTipo,
              targetCodigo,
              decil1: normasOrdenadas[i - 1].decil,
              puntaje1: normasOrdenadas[i - 1].puntajeMin,
              decil2: normasOrdenadas[i].decil,
              puntaje2: normasOrdenadas[i].puntajeMin
            }
          });
        }
      }
    }

    // Verificar que todas las escalas y competencias tengan normas
    for (const escala of escalas || []) {
      const key = `ESCALA:${escala.codigo}`;
      if (!normasByTarget.has(key)) {
        issues.push({
          type: 'warning',
          category: 'normas',
          message: `Escala "${escala.codigo}" no tiene normas definidas.`,
          details: { escalaCodigo: escala.codigo }
        });
      }
    }

    for (const comp of competencias || []) {
      const key = `COMPETENCIA:${comp.codigo}`;
      if (!normasByTarget.has(key)) {
        issues.push({
          type: 'warning',
          category: 'normas',
          message: `Competencia "${comp.codigo}" no tiene normas definidas.`,
          details: { competenciaCodigo: comp.codigo }
        });
      }
    }

    // Separar por tipo
    const errors = issues.filter(i => i.type === 'error');
    const warnings = issues.filter(i => i.type === 'warning');
    const dudas = issues.filter(i => i.type === 'duda');

    return NextResponse.json({
      ok: true,
      valid: errors.length === 0,
      summary: {
        totalIssues: issues.length,
        errors: errors.length,
        warnings: warnings.length,
        dudas: dudas.length,
        totalPares: pairMap.size,
        totalReactivos: allReactivos?.length || 0,
        totalEscalas: escalas?.length || 0,
        totalCompetencias: competencias?.length || 0,
        totalNormas: normas?.length || 0
      },
      issues: {
        errors,
        warnings,
        dudas
      }
    });

  } catch (error: unknown) {
    console.error('Error validando datos:', error);
    const errorMessage = error instanceof Error ? error.message : "Error al validar datos";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
