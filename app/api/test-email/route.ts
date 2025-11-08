import { NextResponse } from "next/server";

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const resendKeyLength = process.env.RESEND_API_KEY?.length || 0;
  const resendKeyPreview = process.env.RESEND_API_KEY 
    ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` 
    : 'No configurada';
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'No configurada';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'No configurada';

  return NextResponse.json({
    status: 'ok',
    config: {
      hasResendKey,
      resendKeyLength,
      resendKeyPreview,
      fromEmail,
      appUrl,
    },
    message: hasResendKey 
      ? 'Resend está configurado' 
      : 'Resend NO está configurado - verifica tu .env.local'
  });
}