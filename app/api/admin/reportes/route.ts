import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { data: reportes, error } = await supabaseAdmin
      .from('Reporte')
      .select(`
        *,
        evaluado:Evaluado(
          id,
          nombre,
          correo
        )
      `)
      .order('fechaGeneracion', { ascending: false });

    if (error) throw error;

    return NextResponse.json(reportes || []);
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return NextResponse.json(
      { error: "Error al obtener reportes" },
      { status: 500 }
    );
  }
}
