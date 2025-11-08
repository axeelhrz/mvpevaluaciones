import { 
  upsertRespuestaCustom, 
  updateEvaluadoEstado,
  getRespuestasCustomByEvaluadoId 
} from "@/lib/supabase/db";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST - Guardar o actualizar respuesta personalizada
export async function POST(req: Request) {
  try {
    const { evaluadoId, preguntaId, valorNumerico, valorTexto, valoresMultiples } = await req.json();

    console.log('📝 Guardando respuesta:', { evaluadoId, preguntaId, valorNumerico, valorTexto, valoresMultiples });

    // Validar datos requeridos
    if (!evaluadoId || !preguntaId) {
      console.error('❌ Faltan datos requeridos');
      return NextResponse.json(
        { error: "evaluadoId y preguntaId son requeridos" },
        { status: 400 }
      );
    }

    // Actualizar estado del evaluado a "en_curso" si está pendiente
    const { data: evaluado } = await supabaseAdmin
      .from('Evaluado')
      .select('estado')
      .eq('id', evaluadoId)
      .single();

    if (evaluado?.estado === 'pendiente') {
      console.log('🔄 Actualizando estado del evaluado a "en_curso"');
      await updateEvaluadoEstado(evaluadoId, 'en_curso');
    }

    // Guardar o actualizar respuesta
    console.log('💾 Guardando respuesta en la base de datos...');
    const respuesta = await upsertRespuestaCustom(
      evaluadoId,
      preguntaId,
      valorNumerico,
      valorTexto,
      valoresMultiples
    );

    console.log('✅ Respuesta guardada exitosamente');
    return NextResponse.json({ ok: true, respuesta });
  } catch (error: unknown) {
    console.error("❌ Error al guardar respuesta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar respuesta" },
      { status: 500 }
    );
  }
}

// PUT - Guardar o actualizar respuesta personalizada (mantener compatibilidad)
export async function PUT(req: Request) {
  return POST(req);
}

// GET - Obtener respuestas de un evaluado
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const evaluadoId = searchParams.get("evaluadoId");

    if (!evaluadoId) {
      return NextResponse.json(
        { error: "evaluadoId requerido" },
        { status: 400 }
      );
    }

    const respuestas = await getRespuestasCustomByEvaluadoId(evaluadoId);

    return NextResponse.json(respuestas);
  } catch (error: unknown) {
    console.error("Error al obtener respuestas:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener respuestas" },
      { status: 500 }
    );
  }
}