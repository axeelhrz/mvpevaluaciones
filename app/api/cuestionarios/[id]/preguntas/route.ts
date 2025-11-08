import { NextRequest } from "next/server";
import { getPreguntasByCuestionarioId, createPregunta, getMaxOrdenPregunta } from "@/lib/supabase/db";

// GET - Obtener todas las preguntas de un cuestionario
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const preguntas = await getPreguntasByCuestionarioId(id);

    return Response.json(preguntas);
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    return Response.json({ error: "Error al obtener preguntas" }, { status: 500 });
  }
}

// POST - Crear nueva pregunta
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    const {
      tipo,
      texto,
      descripcion,
      requerida,
      configuracion,
      mostrarSi,
      escalaId,
      pesoEnEscala,
      opciones
    } = body;

    if (!tipo || !texto) {
      return Response.json({ error: "Tipo y texto son requeridos" }, { status: 400 });
    }

    // Obtener el siguiente orden
    const maxOrden = await getMaxOrdenPregunta(id);
    const nuevoOrden = maxOrden + 1;

    // Crear pregunta con opciones
    const pregunta = await createPregunta(
      {
        cuestionarioId: id,
        tipo,
        texto,
        descripcion,
        orden: nuevoOrden,
        requerida: requerida ?? true,
        configuracion: configuracion || null,
        mostrarSi: mostrarSi || null,
        escalaId: escalaId || null,
        pesoEnEscala: pesoEnEscala ?? 1
      },
      opciones
    );

    return Response.json(pregunta, { status: 201 });
  } catch (error) {
    console.error("Error al crear pregunta:", error);
    return Response.json({ error: "Error al crear pregunta" }, { status: 500 });
  }
}