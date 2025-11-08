import { upsertEvaluado, updateInvitacionesEstado, createInvitacion, getAllInvitaciones, getCuestionarios } from "@/lib/supabase/db";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Configurar transporte de Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT || "2525"),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

// GET - Obtener todas las invitaciones
export async function GET() {
  try {
    const invitaciones = await getAllInvitaciones();
    return NextResponse.json(invitaciones);
  } catch (error: unknown) {
    console.error('❌ Error al obtener invitaciones:', error);
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message
      : "Error al obtener invitaciones";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Crear nueva invitación
export async function POST(req: Request) {
  try {
    const { nombre, correo, politicaEntrega = "SOLO_ADMIN", correoTercero = null, envioAutomatico = false } = await req.json();

    console.log('📧 Iniciando proceso de invitación para:', { nombre, correo, politicaEntrega, correoTercero });

    // Validación de datos
    if (!nombre || !correo) {
      console.error('❌ Error: Faltan datos requeridos');
      return NextResponse.json(
        { error: "Nombre y correo son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      console.error('❌ Error: Formato de correo inválido:', correo);
      return NextResponse.json(
        { error: "Formato de correo inválido" },
        { status: 400 }
      );
    }

    // Validar correo de tercero si aplica
    if (politicaEntrega === "TERCERO") {
      if (!correoTercero || !emailRegex.test(correoTercero)) {
        console.error('❌ Error: Correo de tercero inválido:', correoTercero);
        return NextResponse.json(
          { error: "Correo de tercero inválido" },
          { status: 400 }
        );
      }
    }

    // Obtener el cuestionario activo (debería haber solo uno)
    console.log('🔍 Buscando cuestionario activo...');
    const cuestionarios = await getCuestionarios(true);
    
    if (!cuestionarios || cuestionarios.length === 0) {
      console.error('❌ Error: No hay cuestionarios activos');
      return NextResponse.json(
        { error: "No hay cuestionarios activos disponibles" },
        { status: 404 }
      );
    }

    const cuestionario = cuestionarios[0]; // Tomar el primer cuestionario activo
    console.log('✅ Cuestionario encontrado:', cuestionario.titulo, '- ID:', cuestionario.id);

    // Verificar que las credenciales de Mailtrap estén configuradas
    if (!process.env.MAILTRAP_HOST || !process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASSWORD) {
      console.error('❌ ERROR CRÍTICO: Credenciales de Mailtrap no están configuradas en .env.local');
      console.error('   Por favor, configura MAILTRAP_HOST, MAILTRAP_USER y MAILTRAP_PASSWORD');
      return NextResponse.json(
        { error: "Configuración de email no disponible. Credenciales de Mailtrap no configuradas." },
        { status: 500 }
      );
    }

    console.log('✅ Credenciales de Mailtrap están configuradas');
    console.log('📧 Host:', process.env.MAILTRAP_HOST);

    // Upsert evaluado
    console.log('💾 Creando/actualizando evaluado en la base de datos...');
    const evaluado = await upsertEvaluado(correo, nombre);
    console.log('✅ Evaluado creado/actualizado:', evaluado.id);

    // Cerrar invitaciones activas anteriores
    console.log('🔄 Cerrando invitaciones activas anteriores...');
    await updateInvitacionesEstado(evaluado.id, "expirada");
    console.log('✅ Invitaciones anteriores cerradas');

    // Crear nueva invitación (30 días) con el cuestionario activo
    console.log('📝 Creando nueva invitación...');
    const inv = await createInvitacion({
      evaluadoId: evaluado.id,
      cuestionarioId: cuestionario.id,
      fechaExpiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      politicaEntrega,
      correoTercero: politicaEntrega === "TERCERO" ? correoTercero : null,
      envioAutomatico
    });
    console.log('✅ Invitación creada:', inv.id);
    console.log('🔗 Token:', inv.token);

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/cuestionario/${inv.token}`;
    console.log('🔗 Link de invitación:', link);

    // Determinar a quién enviar el correo según la política
    let correoDestino: string | null = null;
    let tipoEnvio = "";

    if (politicaEntrega === "AUTOMATICO_EVALUADO") {
      correoDestino = correo;
      tipoEnvio = "al evaluado";
    } else if (politicaEntrega === "TERCERO") {
      correoDestino = correoTercero;
      tipoEnvio = "al tercero";
    } else {
      // SOLO_ADMIN: no enviar correo automático
      console.log('📋 Política SOLO_ADMIN: No se enviará correo automático');
      console.log('✅ Proceso completado exitosamente!');
      return NextResponse.json({ 
        ok: true, 
        message: "Invitación creada exitosamente",
        invitacionId: inv.id,
        token: inv.token,
        politicaEntrega,
        nota: "El enlace está disponible en el panel de administración"
      });
    }

    // Enviar mail con Mailtrap si aplica
    if (correoDestino) {
      console.log(`📧 Intentando enviar email ${tipoEnvio} con Mailtrap...`);
      console.log('   From:', process.env.MAILTRAP_FROM_EMAIL || "noreply@evaluaciones.com");
      console.log('   To:', correoDestino);
      
      try {
        const mailOptions = {
          from: process.env.MAILTRAP_FROM_EMAIL || "noreply@evaluaciones.com",
          to: correoDestino,
          subject: "Invitación: Evaluación Psicofinanciera",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invitación a Evaluación Psicofinanciera</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 40px 30px; margin-bottom: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                    Evaluación Psicofinanciera
                  </h1>
                  <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">
                    Cuestionario de Competencias y Habilidades
                  </p>
                </div>

                <div style="background-color: white; border-radius: 10px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #2563eb; margin-top: 0; font-size: 22px;">¡Hola ${nombre}!</h2>
                  <p style="font-size: 16px; margin-bottom: 20px; color: #555;">
                    Has sido invitado/a a completar una evaluación psicofinanciera. Este cuestionario te ayudará a conocer tus competencias y habilidades en la gestión de recursos.
                  </p>

                  <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                      <strong>📋 Estructura:</strong> 4 secciones con 193 preguntas<br>
                      <strong>⏱️ Duración:</strong> Aproximadamente 30 minutos<br>
                      <strong>📊 Resultado:</strong> Informe detallado de tus competencias
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${link}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Comenzar Evaluación
                    </a>
                  </div>

                  <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
                    O copia y pega este enlace en tu navegador:
                  </p>
                  <p style="font-size: 13px; color: #2563eb; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; text-align: center; font-family: monospace;">
                    ${link}
                  </p>
                </div>

                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    ⏰ <strong>Importante:</strong> Este enlace expirará en <strong>30 días</strong>. Te recomendamos completar la evaluación en una sola sesión para obtener mejores resultados.
                  </p>
                </div>

                <div style="background-color: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h3 style="color: #374151; margin-top: 0; font-size: 16px;">📝 Recomendaciones:</h3>
                  <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                    <li>Busca un lugar tranquilo y sin distracciones</li>
                    <li>Responde con honestidad, no hay respuestas correctas o incorrectas</li>
                    <li>Completa todas las secciones en una sola sesión</li>
                    <li>Tómate tu tiempo para leer cada pregunta cuidadosamente</li>
                  </ul>
                </div>

                <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 5px 0;">Si no solicitaste esta invitación, puedes ignorar este correo.</p>
                  <p style="margin: 5px 0;">Este es un correo automático, por favor no respondas a este mensaje.</p>
                  <p style="margin: 15px 0 5px 0; color: #6b7280; font-weight: bold;">Sistema de Evaluación Psicofinanciera</p>
                </div>
              </body>
            </html>
          `,
        };

        const emailResult = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado exitosamente con Mailtrap!');
        console.log('📧 Message ID:', emailResult.messageId);

      } catch (emailError: unknown) {
        console.error('❌ ERROR al enviar email con Mailtrap:');
        const errorMessage =
          typeof emailError === "object" && emailError !== null && "message" in emailError
            ? (emailError as { message?: string }).message
            : String(emailError);

        console.error('   Mensaje:', errorMessage);
        console.error('   Detalles completos:', JSON.stringify(emailError, null, 2));
        
        return NextResponse.json(
          { error: `Error al enviar el correo: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    console.log('✅ Proceso completado exitosamente!');
    return NextResponse.json({ 
      ok: true, 
      message: "Invitación enviada exitosamente",
      invitacionId: inv.id,
      token: inv.token,
      politicaEntrega,
      correoDestino: correoDestino || "No se envió correo automático"
    });
  } catch (error: unknown) {
    console.error('❌ ERROR GENERAL en el proceso de invitación:');
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message
      : "Error al crear invitación";
    const errorStack = typeof error === "object" && error !== null && "stack" in error
      ? (error as { stack?: string }).stack
      : undefined;
    console.error('   Mensaje:', errorMessage);
    console.error('   Stack:', errorStack);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}