import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error en login:", error);
      return NextResponse.json(
        { error: error.message || "Credenciales inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sesión iniciada correctamente",
      user: data.user,
    });
  } catch (error: unknown) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}