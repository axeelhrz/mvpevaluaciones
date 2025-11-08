import { NextRequest, NextResponse } from "next/server";
import { getAllConfiguraciones, getConfiguracion, upsertConfiguracion } from "@/lib/supabase/db";

// GET - Obtener configuraciones
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clave = searchParams.get('clave');
    const categoria = searchParams.get('categoria');

    if (clave) {
      const config = await getConfiguracion(clave);
      return NextResponse.json(config || null);
    }

    const configs = await getAllConfiguraciones(categoria || undefined);
    return NextResponse.json(configs || []);
  } catch (error: unknown) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// POST - Guardar configuración
export async function POST(req: NextRequest) {
  try {
    const { clave, valor, descripcion, categoria } = await req.json();

    if (!clave || valor === undefined) {
      return NextResponse.json(
        { error: "clave y valor son requeridos" },
        { status: 400 }
      );
    }

    const config = await upsertConfiguracion(clave, valor, descripcion, categoria);

    return NextResponse.json({ 
      ok: true, 
      configuracion: config 
    });
  } catch (error: unknown) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar configuración" },
      { status: 500 }
    );
  }
}
