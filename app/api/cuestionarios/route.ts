import { getCuestionarios, createCuestionario } from "@/lib/supabase/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activoParam = searchParams.get('activo');
    
    // Si se especifica el parámetro activo, filtrar por ese valor
    const activo = activoParam !== null ? activoParam === 'true' : undefined;
    
    const cuestionarios = await getCuestionarios(activo);
    
    // Devolver directamente el array para mantener compatibilidad
    return NextResponse.json(cuestionarios || []);
  } catch (error: unknown) {
    console.error('Error al obtener cuestionarios:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener cuestionarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const cuestionario = await createCuestionario(data);
    
    return NextResponse.json(cuestionario);
  } catch (error: unknown) {
    console.error('Error al crear cuestionario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear cuestionario" },
      { status: 500 }
    );
  }
}