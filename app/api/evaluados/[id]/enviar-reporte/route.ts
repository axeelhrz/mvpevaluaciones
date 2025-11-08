import { NextRequest, NextResponse } from "next/server";
import { getEvaluadoByIdExtended, getVersionNormaActiva } from "@/lib/supabase/db";
import { generateUnifiedPDF } from "@/lib/pdf-generator-unified";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { id } = await context.params;
    const body = await req.json();
    const { 
      destinatarios, // Array de correos
      templateId,
      mensaje,
      asunto 
    } = body;

    if (!destinatarios || destinatarios.length === 0) {
      return NextResponse.json(
        { error: "Debe especificar al menos un destinatario" },
        { status: 400 }
      );
    }

    // Obtener datos del evaluado
    const evaluado = await getEvaluadoByIdExtended(id);

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

    // Enviar correo a cada destinatario
    const resultados = [];
    for (const destinatario of destinatarios) {
      try {
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: destinatario,
          subject: asunto || `Reporte de Evaluación - ${evaluado.nombre}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reporte de Evaluación</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; margin-bottom: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">📊 Reporte de Evaluación</h1>
                </div>
                
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 20px;">
                  <h2 style="color: #2563eb; margin-top: 0;">Hola,</h2>
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    ${mensaje || 'Adjunto encontrarás el reporte de evaluación completo con los resultados detallados.'}
                  </p>
                  
                  <div style="background-color: white; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px;">
                      <strong>Evaluado:</strong> ${evaluado.nombre}<br>
                      <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <p style="font-size: 14px; color: #666;">
                    El reporte incluye:
                  </p>
                  <ul style="font-size: 14px; color: #666;">
                    <li>Resultados detallados por escala y competencia</li>
                    <li>Gráficas visuales de los resultados</li>
                    <li>Tablas comparativas con interpretaciones</li>
                    <li>Información demográfica</li>
                  </ul>
                </div>

                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    📎 <strong>Nota:</strong> El reporte está adjunto en formato PDF.
                  </p>
                </div>

                <div style="font-size: 12px; color: #999; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p>Este es un correo automático del Sistema de Evaluaciones.</p>
                  <p>Si tienes alguna pregunta, por favor contacta al administrador.</p>
                </div>
              </body>
            </html>
          `,
          attachments: [
            {
              filename: fileName,
              content: pdfBase64,
            },
          ],
        });

        resultados.push({
          destinatario,
          exito: true,
          emailId: emailResult.data?.id
        });

        console.log(`✅ Reporte enviado a ${destinatario}`);
      } catch (emailError: unknown) {
        console.error(`❌ Error al enviar a ${destinatario}:`, emailError);
        const errorMessage = emailError instanceof Error ? emailError.message : typeof emailError === 'string' ? emailError : 'Error desconocido';
        resultados.push({
          destinatario,
          exito: false,
          error: errorMessage
        });
      }
    }

    // Actualizar registro de reporte
    const versionNorma = await getVersionNormaActiva();
    await supabaseAdmin
      .from('Reporte')
      .insert({
        evaluadoId: id,
        urlPdf: fileName,
        templateId: templateId || null,
        versionNormaId: versionNorma?.id || null,
        enviadoA: destinatarios,
        metadatos: {
          enviadoEn: new Date().toISOString(),
          resultados
        }
      });

    const exitosos = resultados.filter(r => r.exito).length;
    const fallidos = resultados.filter(r => !r.exito).length;

    return NextResponse.json({
      ok: true,
      mensaje: `Reporte enviado a ${exitosos} destinatario(s)${fallidos > 0 ? `, ${fallidos} fallido(s)` : ''}`,
      resultados
    });
  } catch (error: unknown) {
    console.error("Error al enviar reporte:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al enviar el reporte";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}