import { NextRequest, NextResponse } from "next/server";
import { getEvaluadoById } from "@/lib/supabase/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("Fetching evaluado with id:", id);
    const evaluado = await getEvaluadoById(id);

    if (!evaluado) {
      return NextResponse.json(
        { error: "Evaluado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluado);
  } catch (error) {
    console.error("Error al obtener evaluado:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Error al obtener evaluado", details: errorMessage },
      { status: 500 }
    );
  }
}