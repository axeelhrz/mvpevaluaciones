import { NextRequest, NextResponse } from "next/server";
import { getInvitacionByToken } from "@/lib/supabase/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: token } = await context.params;

    const invitacion = await getInvitacionByToken(token);

    if (!invitacion) {
      return NextResponse.json(
        { error: "Invitación no encontrada o expirada" },
        { status: 404 }
      );
    }

    return NextResponse.json(invitacion);
  } catch (error: unknown) {
    console.error('Error al obtener invitación:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener invitación" },
      { status: 500 }
    );
  }
}