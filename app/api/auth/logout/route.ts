import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error en logout:", error);
      return NextResponse.json(
        { error: "Error al cerrar sesión" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}