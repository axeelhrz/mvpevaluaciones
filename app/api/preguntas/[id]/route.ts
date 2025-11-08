import { NextRequest } from "next/server";
import { getPreguntaById, updatePregunta, deletePregunta } from "@/lib/supabase/db";

// GET - Obtener una pregunta específica
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const pregunta = await getPreguntaById(id);

    if (!pregunta) {
      return Response.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    return Response.json(pregunta);
  } catch (error) {
    console.error("Error al obtener pregunta:", error);
    return Response.json({ error: "Error al obtener pregunta" }, { status: 500 });
  }
}

// PUT - Actualizar pregunta
export async function PUT(
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
      orden,
      requerida,
      configuracion,
      mostrarSi,
      escalaId,
      pesoEnEscala,
      opciones
    } = body;

    const pregunta = await updatePregunta(
      id,
      {
        tipo,
        texto,
        descripcion,
        orden,
        requerida,
        configuracion: configuracion || null,
        mostrarSi: mostrarSi || null,
        escalaId: escalaId || null,
        pesoEnEscala
      },
      opciones
    );

    return Response.json(pregunta);
  } catch (error) {
    console.error("Error al actualizar pregunta:", error);
    return Response.json({ error: "Error al actualizar pregunta" }, { status: 500 });
  }
}

// DELETE - Eliminar pregunta
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await deletePregunta(id);

    return Response.json({ message: "Pregunta eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar pregunta:", error);
    return Response.json({ error: "Error al eliminar pregunta" }, { status: 500 });
  }
}