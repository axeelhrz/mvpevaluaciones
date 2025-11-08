import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Obtener los primeros 10 reactivos positivos
    const { data: reactivosPos, error: errorPos } = await supabase
      .from('Reactivo')
      .select('id, pairId, ordenGlobal, ordenEnPar, tipo, texto, escala:Escala(codigo, nombre)')
      .eq('tipo', 'POS')
      .order('ordenGlobal', { ascending: true })
      .limit(10);

    if (errorPos) throw errorPos;

    // Obtener los primeros 10 reactivos negativos
    const { data: reactivosNeg, error: errorNeg } = await supabase
      .from('Reactivo')
      .select('id, pairId, ordenGlobal, ordenEnPar, tipo, texto, escala:Escala(codigo, nombre)')
      .eq('tipo', 'NEG')
      .order('ordenGlobal', { ascending: true })
      .limit(10);

    if (errorNeg) throw errorNeg;

    // Contar totales
    const { count: totalPos } = await supabase
      .from('Reactivo')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'POS');

    const { count: totalNeg } = await supabase
      .from('Reactivo')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'NEG');

    const { count: totalLikert } = await supabase
      .from('Reactivo')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'LIKERT');

    return NextResponse.json({
      totales: {
        positivos: totalPos,
        negativos: totalNeg,
        likert: totalLikert
      },
      muestras: {
        positivos: reactivosPos,
        negativos: reactivosNeg
      }
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}