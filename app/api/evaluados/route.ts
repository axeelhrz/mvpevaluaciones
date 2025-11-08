import { getAllEvaluados } from "@/lib/supabase/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cuestionarioId = searchParams.get('cuestionarioId');
    
    const evaluados = await getAllEvaluados(cuestionarioId || undefined);
    
    return NextResponse.json(evaluados || []);
  } catch (error: unknown) {
    console.error('Error al obtener evaluados:', error);
    const message = error instanceof Error ? error.message : "Error al obtener evaluados";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}