import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient();

    console.log("\n🔍 ===== TEST DE CONEXIÓN A BASE DE DATOS =====");

    // Test 1: Contar reactivos
    const { data: reactivos, error: reactivosError } = await supabaseAdmin
      .from('Reactivo')
      .select('*', { count: 'exact', head: true });

    console.log("Test 1 - Reactivos:");
    console.log("  Error:", reactivosError);
    console.log("  Count:", reactivos);

    // Test 2: Contar normas
    const { data: normas, error: normasError } = await supabaseAdmin
      .from('NormaDecil')
      .select('*', { count: 'exact', head: true });

    console.log("\nTest 2 - Normas:");
    console.log("  Error:", normasError);
    console.log("  Count:", normas);

    // Test 3: Contar escalas
    const { data: escalas, error: escalasError } = await supabaseAdmin
      .from('Escala')
      .select('*', { count: 'exact', head: true });

    console.log("\nTest 3 - Escalas:");
    console.log("  Error:", escalasError);
    console.log("  Count:", escalas);

    // Test 4: Intentar leer algunos datos
    const { data: reactivosData, error: reactivosDataError } = await supabaseAdmin
      .from('Reactivo')
      .select('*')
      .limit(5);

    console.log("\nTest 4 - Primeros 5 reactivos:");
    console.log("  Error:", reactivosDataError);
    console.log("  Data:", reactivosData);

    const { data: normasData, error: normasDataError } = await supabaseAdmin
      .from('NormaDecil')
      .select('*')
      .limit(5);

    console.log("\nTest 5 - Primeras 5 normas:");
    console.log("  Error:", normasDataError);
    console.log("  Data:", normasData);

    // Test 6: Intentar insertar un reactivo de prueba
    const testReactivo = {
      pairId: 'TEST_1',
      ordenEnPar: 1,
      tipo: 'POS',
      texto: 'Reactivo de prueba'
    };

    console.log("\nTest 6 - Intentar insertar reactivo de prueba:");
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('Reactivo')
      .insert(testReactivo)
      .select();

    console.log("  Error:", insertError);
    console.log("  Data:", insertData);

    // Limpiar el reactivo de prueba
    if (insertData && insertData.length > 0) {
      await supabaseAdmin
        .from('Reactivo')
        .delete()
        .eq('id', insertData[0].id);
      console.log("  ✓ Reactivo de prueba eliminado");
    }

    return NextResponse.json({
      ok: true,
      tests: {
        reactivos: {
          error: reactivosError,
          count: reactivos
        },
        normas: {
          error: normasError,
          count: normas
        },
        escalas: {
          error: escalasError,
          count: escalas
        },
        sampleReactivos: reactivosData,
        sampleNormas: normasData,
        insertTest: {
          error: insertError,
          success: !insertError
        }
      }
    });

  } catch (error: unknown) {
    console.error("❌ Error en test de DB:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
