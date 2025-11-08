import { NextRequest } from "next/server";
import { getCuestionarioById, updateCuestionario, deleteCuestionario } from "@/lib/supabase/db";

// GET - Obtener un cuestionario específico
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cuestionario = await getCuestionarioById(id);

    if (!cuestionario) {
      return Response.json({ error: "Cuestionario no encontrado" }, { status: 404 });
    }

    return Response.json(cuestionario);
  } catch (error) {
    console.error("Error al obtener cuestionario:", error);
    return Response.json({ error: "Error al obtener cuestionario" }, { status: 500 });
  }
}

// PUT - Actualizar cuestionario
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    const cuestionario = await updateCuestionario(id, {
      titulo: body.titulo,
      descripcion: body.descripcion,
      activo: body.activo,
      colorPrimario: body.colorPrimario,
      colorSecundario: body.colorSecundario,
      logoUrl: body.logoUrl,
      imagenFondoUrl: body.imagenFondoUrl,
      textoInicio: body.textoInicio,
      textoFinal: body.textoFinal,
      mostrarProgreso: body.mostrarProgreso,
      permitirRetroceso: body.permitirRetroceso,
      tiempoLimite: body.tiempoLimite,
      usarScoringCustom: body.usarScoringCustom,
      reglasScoring: body.reglasScoring
    });

    return Response.json(cuestionario);
  } catch (error) {
    console.error("Error al actualizar cuestionario:", error);
    return Response.json({ error: "Error al actualizar cuestionario" }, { status: 500 });
  }
}

// DELETE - Eliminar cuestionario
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await deleteCuestionario(id);

    return Response.json({ message: "Cuestionario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cuestionario:", error);
    return Response.json({ error: "Error al eliminar cuestionario" }, { status: 500 });
  }
}