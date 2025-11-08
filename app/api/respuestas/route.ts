import { getInvitacionByToken, upsertRespuesta, updateEvaluadoEstado } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { token, preguntaId, respuesta } = await req.json();

    // validar token
    const inv = await getInvitacionByToken(token);
    
    if (!inv) {
      return new Response("Token inválido/expirado", { status: 401 });
    }

    // upsert respuesta única por (evaluadoId, preguntaId)
    await upsertRespuesta(inv.evaluadoId, preguntaId, respuesta);

    // opcional: marcar en_curso
    await updateEvaluadoEstado(inv.evaluadoId, "en_curso");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error al guardar respuesta:", error);
    return Response.json({ error: "Error al guardar respuesta" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { evaluadoId, preguntaId, respuestaMas, mensajeRespuesta } = await req.json();

    if (!evaluadoId || preguntaId === undefined) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Guardar la respuesta de pareamiento
    const preguntaIdStr = `pair-${preguntaId}`;
    const respuestaValor = respuestaMas === 1 ? 1 : 2;

    const { error } = await supabase
      .from('RespuestaCustom')
      .upsert({
        evaluadoId,
        preguntaId: preguntaIdStr,
        valorNumerico: respuestaValor,
        valorTexto: mensajeRespuesta || null,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'evaluadoId,preguntaId'
      });

    if (error) {
      console.error(`❌ Error al guardar pareamiento ${preguntaId}:`, error);
      throw error;
    }

    console.log(`✅ Pareamiento ${preguntaId} guardado: ${preguntaIdStr} = ${respuestaValor}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error al guardar respuesta:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar respuesta" },
      { status: 500 }
    );
  }
}