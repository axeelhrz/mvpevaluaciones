import { NextRequest, NextResponse } from "next/server";
import { activarVersionNorma } from "@/lib/supabase/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const versionActivada = await activarVersionNorma(id);

    return NextResponse.json({ 
      ok: true, 
      version: versionActivada 
    });
  } catch (error: unknown) {
    console.error('Error al activar versión de norma:', error);
    const message = error instanceof Error ? error.message : "Error al activar versión de norma";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
