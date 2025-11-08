import { NextRequest, NextResponse } from "next/server";
import { getEvaluadoById } from "@/lib/supabase/db";
import { generateUnifiedPDF } from "@/lib/pdf-generator-unified";
import { Resend } from "resend";
import { getResultadosEmailTemplate } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { emailDestino, nombreDestino } = body;
    
    // Obtener datos del evaluado
    const evaluado = await getEvaluadoById(id);

    if (!evaluado) {
      return NextResponse.json(
        { error: "Evaluado no encontrado" },
        { status: 404 }
      );
    }

    // Generar PDF
    const pdf = generateUnifiedPDF(evaluado);
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const pdfBase64 = pdfBuffer.toString('base64');
    const fileName = `reporte-${evaluado.nombre.replace(/\s+/g, '-')}.pdf`;

    // Determinar destinatario
    const destinatario = emailDestino || evaluado.correo;
    const nombreDestinatario = nombreDestino || evaluado.nombre;

    // Enviar email con PDF adjunto
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: destinatario,
      subject: 'Resultados de tu Evaluación',
      html: getResultadosEmailTemplate({ nombre: nombreDestinatario }),
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("Error al enviar email:", error);
      throw new Error("Error al enviar el correo");
    }

    return NextResponse.json({ 
      success: true,
      message: `Resultados enviados a ${destinatario}`,
      emailId: data?.id
    });
  } catch (error: unknown) {
    console.error("Error al enviar resultados:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al enviar resultados" },
      { status: 500 }
    );
  }
}