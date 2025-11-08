import { NextRequest, NextResponse } from "next/server";
import { getCamposEstadisticos, upsertCampoEstadistico, deleteCampoEstadistico } from "@/lib/supabase/db";

// GET - Obtener campos estadísticos configurados
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activosOnly = searchParams.get('activos') !== 'false';

    const campos = await getCamposEstadisticos(activosOnly);
    
    return NextResponse.json(campos || []);
  } catch (error: unknown) {
    console.error('Error al obtener campos estadísticos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener campos estadísticos" },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar campo estadístico
export async function POST(req: NextRequest) {
  try {
    const campo = await req.json();

    const campoGuardado = await upsertCampoEstadistico(campo);

    return NextResponse.json({ 
      ok: true, 
      campo: campoGuardado 
    });
  } catch (error: unknown) {
    console.error('Error al guardar campo estadístico:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar campo estadístico" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar campo estadístico
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "id es requerido" },
        { status: 400 }
      );
    }

    await deleteCampoEstadistico(id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Error al eliminar campo estadístico:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar campo estadístico" },
      { status: 500 }
    );
  }
}
