import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient();

    console.log("\n🔍 ===== VERIFICACIÓN DE DATOS =====");

    // Contar registros en cada tabla
    const { count: reactivosCount } = await supabaseAdmin
      .from('Reactivo')
      .select('*', { count: 'exact', head: true });

    const { count: normasCount } = await supabaseAdmin
      .from('NormaDecil')
      .select('*', { count: 'exact', head: true });

    const { count: escalasCount } = await supabaseAdmin
      .from('Escala')
      .select('*', { count: 'exact', head: true });

    const { count: competenciasCount } = await supabaseAdmin
      .from('Competencia')
      .select('*', { count: 'exact', head: true });

    console.log("Conteo de registros:");
    console.log(`  Reactivos: ${reactivosCount}`);
    console.log(`  Normas: ${normasCount}`);
    console.log(`  Escalas: ${escalasCount}`);
    console.log(`  Competencias: ${competenciasCount}`);

    // Obtener algunos datos de ejemplo
    const { data: escalas } = await supabaseAdmin
      .from('Escala')
      .select('*')
      .limit(5);

    const { data: reactivos } = await supabaseAdmin
      .from('Reactivo')
      .select('*, escala:Escala(*)')
      .limit(5);

    const { data: normas } = await supabaseAdmin
      .from('NormaDecil')
      .select('*')
      .limit(10);

    console.log("\nEscalas (primeras 5):");
    console.log(escalas);

    console.log("\nReactivos (primeros 5):");
    console.log(reactivos);

    console.log("\nNormas (primeras 10):");
    console.log(normas);

    return NextResponse.json({
      ok: true,
      counts: {
        reactivos: reactivosCount,
        normas: normasCount,
        escalas: escalasCount,
        competencias: competenciasCount
      },
      samples: {
        escalas,
        reactivos,
        normas
      }
    });

  } catch (error: unknown) {
    console.error("❌ Error verificando datos:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
