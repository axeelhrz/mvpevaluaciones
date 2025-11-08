import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { evaluadoId, datos } = await req.json();

    console.log('📝 Guardando datos estadísticos:', { evaluadoId, datos });

    if (!evaluadoId || !datos) {
      return NextResponse.json(
        { error: "evaluadoId y datos son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Guardar cada dato estadístico
    for (const [campoNombre, valor] of Object.entries(datos)) {
      if (!valor) continue; // Saltar valores vacíos

      await supabase
        .from('DatoEstadistico')
        .upsert({
          evaluadoId,
          campoNombre,
          valor: String(valor),
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'evaluadoId,campoNombre'
        });
    }

    console.log('✅ Datos estadísticos guardados');
    return NextResponse.json({ ok: true, message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar datos estadísticos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar datos" },
      { status: 500 }
    );
  }
}