import { NextRequest, NextResponse } from "next/server";
import { getEvaluadoConResultadosParaPDF } from "@/lib/supabase/db";
import { generateUnifiedPDF } from "@/lib/pdf-generator-unified";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const evaluado = await getEvaluadoConResultadosParaPDF(id);

    if (!evaluado) {
      return NextResponse.json(
        { error: "Evaluado no encontrado" },
        { status: 404 }
      );
    }

    console.log('📄 Generando PDF Premium para:', evaluado.nombre);

    const evaluadoData = {
      nombre: evaluado.nombre,
      correo: evaluado.correo,
      estado: evaluado.estado,
      createdAt: evaluado.createdAt,
      datosEstadisticos: evaluado.datosEstadisticos ? {
        edad: evaluado.datosEstadisticos.edad || undefined,
        genero: evaluado.datosEstadisticos.genero || undefined,
        region: evaluado.datosEstadisticos.region || undefined,
        ocupacion: evaluado.datosEstadisticos.ocupacion || undefined,
        nivelEducativo: evaluado.datosEstadisticos.nivelEducativo || undefined,
        estadoCivil: evaluado.datosEstadisticos.estadoCivil || undefined,
      } : undefined,
      resultados: evaluado.resultados?.map((r: Record<string, unknown>) => ({
        puntajesNaturales: r.puntajesNaturales || {},
        puntajesDeciles: r.puntajesDeciles || {},
        createdAt: r.createdAt
      })) || []
    };

    console.log('✨ Generando PDF con diseño unificado...');
    const pdf = generateUnifiedPDF(evaluadoData);
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    const fileName = `reporte-psicofinanciero-${evaluado.nombre.replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    console.log('✅ PDF generado exitosamente:', fileName);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}