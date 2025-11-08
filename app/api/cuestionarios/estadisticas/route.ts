import { NextResponse } from "next/server";
import { getCuestionarios, getAllInvitaciones } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET - Obtener estadísticas del cuestionario único
 * 
 * Retorna:
 * - Total de preguntas
 * - Total de invitaciones enviadas
 * - Total de cuestionarios completados
 * - Tiempo promedio de respuesta
 */
export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Obtener el cuestionario activo (debería haber solo uno)
    const cuestionarios = await getCuestionarios(true);
    
    if (!cuestionarios || cuestionarios.length === 0) {
      return NextResponse.json({
        totalPreguntas: 193,
        totalInvitaciones: 0,
        totalRespuestas: 0,
        tiempoPromedio: 30
      });
    }

    const cuestionario = cuestionarios[0];

    // Obtener todas las invitaciones
    const invitaciones = await getAllInvitaciones();
    const totalInvitaciones = invitaciones?.length || 0;

    // Contar cuestionarios completados (invitaciones con estado "completada")
    const totalRespuestas = invitaciones?.filter(inv => inv.estado === "completada").length || 0;

    // Obtener total de preguntas del cuestionario
    const { data: preguntas } = await supabase
      .from('Pregunta')
      .select('id')
      .eq('cuestionarioId', cuestionario.id);

    const totalPreguntas = preguntas?.length || 193;

    // Calcular tiempo promedio (por ahora es fijo, pero se puede mejorar)
    const tiempoPromedio = 30;

    console.log('📊 Estadísticas del cuestionario:', {
      totalPreguntas,
      totalInvitaciones,
      totalRespuestas,
      tiempoPromedio
    });

    return NextResponse.json({
      totalPreguntas,
      totalInvitaciones,
      totalRespuestas,
      tiempoPromedio
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}