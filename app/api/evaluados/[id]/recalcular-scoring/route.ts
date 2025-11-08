import { NextRequest, NextResponse } from "next/server";
import { scoreEvaluado } from "@/lib/scoring";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log(`🧮 Recalculando scoring para evaluado: ${id}`);
    
    const resultado = await scoreEvaluado(id);

    console.log('✅ Scoring recalculado exitosamente:', {
      escalas: resultado.escalas.length,
      competenciasA: resultado.competenciasA.length,
      competenciasB: resultado.competenciasB.length,
      warnings: resultado.warnings.length
    });

    return NextResponse.json({
      success: true,
      message: "Scoring recalculado exitosamente",
      resultado: {
        escalas: resultado.escalas.length,
        competenciasA: resultado.competenciasA.length,
        competenciasB: resultado.competenciasB.length,
        warnings: resultado.warnings,
        puntajesNaturales: resultado.puntajesNaturales,
        puntajesDeciles: resultado.puntajesDeciles
      }
    });
  } catch (error) {
    console.error("❌ Error al recalcular scoring:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error al recalcular scoring", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}