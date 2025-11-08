import { NextRequest, NextResponse } from "next/server";
import { getVersionesNorma, getVersionNormaActiva, createVersionNorma } from "@/lib/supabase/db";

// GET - Obtener versiones de normas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const soloActiva = searchParams.get('activa') === 'true';

    if (soloActiva) {
      const versionActiva = await getVersionNormaActiva();
      return NextResponse.json(versionActiva || null);
    }

    const versiones = await getVersionesNorma();
    return NextResponse.json(versiones || []);
  } catch (error: unknown) {
    console.error('Error al obtener versiones de norma:', error);
    const message = error instanceof Error ? error.message : "Error al obtener versiones de norma";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
// POST - Crear nueva versión de norma
export async function POST(req: NextRequest) {
  try {
    const version = await req.json();

    const nuevaVersion = await createVersionNorma(version);

    return NextResponse.json({ 
      ok: true, 
      version: nuevaVersion 
    });
  } catch (error: unknown) {
    console.error('Error al crear versión de norma:', error);
    const message = error instanceof Error ? error.message : "Error al crear versión de norma";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
