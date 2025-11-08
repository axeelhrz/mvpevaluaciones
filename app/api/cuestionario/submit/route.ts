// app/api/cuestionario/submit/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { scoreEvaluadoEnhanced } from "@/lib/scoring-enhanced";

export async function POST(req: Request) {
  try {
    const { token, evaluadoId } = await req.json();

    console.log('📝 Finalizando cuestionario:', { token, evaluadoId });

    if (!token && !evaluadoId) {
      return NextResponse.json(
        { error: "Token o evaluadoId requerido" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Verificar cuántas respuestas se guardaron
    const { data: respuestas, error: errorRespuestas } = await supabase
      .from('RespuestaCustom')
      .select('preguntaId, valorNumerico')
      .eq('evaluadoId', evaluadoId);

    if (errorRespuestas) {
      console.error('❌ Error al verificar respuestas:', errorRespuestas);
    } else {
      console.log(`✅ Total de respuestas guardadas: ${respuestas?.length || 0}`);
      
      // Contar por tipo
      const pareamiento = respuestas?.filter(r => r.preguntaId.startsWith('pair-')).length || 0;
      const likert = respuestas?.filter(r => r.preguntaId.startsWith('likert-')).length || 0;
      
      console.log(`   📊 Pareamiento: ${pareamiento}, Likert: ${likert}`);
      
      if (pareamiento + likert < 193) {
        console.warn(`⚠️ Advertencia: Se esperaban 193 respuestas, pero solo hay ${pareamiento + likert}`);
      }
    }

    // Actualizar estado del evaluado
    console.log('🔄 Actualizando estado del evaluado a "completado"...');
    const { error: errorEvaluado } = await supabase
      .from('Evaluado')
      .update({ estado: 'completado' })
      .eq('id', evaluadoId);

    if (errorEvaluado) {
      console.error('❌ Error al actualizar evaluado:', errorEvaluado);
    }

    // Si hay token, actualizar estado de la invitación
    if (token) {
      console.log('🔄 Actualizando estado de la invitación...');
      const { error: errorInvitacion } = await supabase
        .from('Invitacion')
        .update({ estado: 'completada' })
        .eq('token', token);

      if (errorInvitacion) {
        console.error('❌ Error al actualizar invitación:', errorInvitacion);
      }
    }

    // CALCULAR SCORING CON SISTEMA MEJORADO
    console.log('\n🧮 Calculando puntajes con sistema mejorado...');
    try {
      const scoringResult = await scoreEvaluadoEnhanced(evaluadoId);
      console.log('✅ Scoring completado:', {
        escalas: scoringResult.escalas?.length || 0,
        competenciasA: scoringResult.competenciasA?.length || 0,
        competenciasB: scoringResult.competenciasB?.length || 0,
        warnings: scoringResult.warnings?.length || 0
      });

      if (scoringResult.warnings.length > 0) {
        console.log('\n⚠️  Advertencias del scoring:');
        scoringResult.warnings.forEach(w => {
          console.log(`   - ${w.message}`);
        });
      }
    } catch (scoringError) {
      console.error('❌ Error al calcular scoring:', scoringError);
      // No fallar la request si el scoring falla, pero registrar el error
    }

    console.log('✅ Cuestionario completado exitosamente');
    return NextResponse.json({ 
      ok: true, 
      message: "Cuestionario completado exitosamente",
      totalRespuestas: respuestas?.length || 0
    });
  } catch (error) {
    console.error("❌ Error al procesar cuestionario:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar cuestionario" },
      { status: 500 }
    );
  }
}