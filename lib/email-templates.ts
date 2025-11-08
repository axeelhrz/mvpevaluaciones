interface EmailTemplateProps {
  nombre: string;
  [key: string]: unknown;
}

export function getResultadosEmailTemplate({ nombre }: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultados de Evaluación</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Resultados de tu Evaluación
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${nombre}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hemos procesado tu evaluación y tus resultados están listos. Adjunto a este correo encontrarás un reporte detallado en formato PDF con:
              </p>
              
              <ul style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 20px;">
                <li>Tus respuestas completas</li>
                <li>Puntajes naturales por escala y competencia</li>
                <li>Puntajes en deciles</li>
                <li>Análisis detallado de resultados</li>
              </ul>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Gracias por completar la evaluación. Si tienes alguna pregunta sobre tus resultados, no dudes en contactarnos.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; text-align: left;">
                  <p style="color: #666666; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>Nota:</strong> Este reporte es confidencial y está destinado únicamente para ti. Por favor, guárdalo en un lugar seguro.
                  </p>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Sistema de Evaluaciones
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getAdminNotificationTemplate({ nombre, correo }: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evaluación Completada</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ✓ Evaluación Completada
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Un evaluado ha completado su cuestionario:
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 14px; font-weight: bold; width: 120px;">Nombre:</td>
                    <td style="color: #333333; font-size: 14px;">${nombre}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; font-weight: bold;">Correo:</td>
                    <td style="color: #333333; font-size: 14px;">${correo}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; font-weight: bold;">Fecha:</td>
                    <td style="color: #333333; font-size: 14px;">${new Date().toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Los resultados han sido procesados automáticamente y están disponibles en el panel de administración.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/evaluados" 
                   style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Ver en Panel Admin
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Sistema de Evaluaciones - Notificación Automática
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getResultadosToThirdPartyTemplate({ 
  nombre, 
  nombreEvaluado 
}: EmailTemplateProps & { nombreEvaluado: string }): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultados de Evaluación</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Resultados de Evaluación
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${nombre}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Adjunto a este correo encontrarás el reporte de evaluación de <strong>${nombreEvaluado}</strong>.
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                El reporte incluye:
              </p>
              
              <ul style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 20px;">
                <li>Respuestas completas del cuestionario</li>
                <li>Puntajes naturales y deciles</li>
                <li>Análisis detallado de resultados</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; text-align: left;">
                  <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                    <strong>Confidencial:</strong> Este reporte contiene información sensible. Por favor, manéjalo con la debida confidencialidad.
                  </p>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Sistema de Evaluaciones
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
