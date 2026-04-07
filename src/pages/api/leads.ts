import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { head } from '@vercel/blob';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY as string);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, lang } = data;

    if (!email || !lang) {
      return new Response(JSON.stringify({ error: 'Missing email or lang' }), { status: 400 });
    }

    // Identificar qué PDF mandar según el idioma
    const pdfUrl = lang === 'en' 
      ? import.meta.env.BLOB_URL_LEADM_EN
      : import.meta.env.BLOB_URL_LEADM_ES;
      
    const subject = lang === 'en'
      ? 'Here is your Free Guide 🎁'
      : 'Aquí tienes tu Guía Gratuita 🎁';

    // Generar la URL temporal firmada para acceder al PDF protegido
    await head(pdfUrl as string, {
      token: import.meta.env.BLOB_READ_WRITE_TOKEN as string,
    });
    
    // Anexamos el token para que resuelva la descarga por 1 hora
    const downloadUrl = `${pdfUrl}?token=${import.meta.env.BLOB_READ_WRITE_TOKEN}`;

    // Enviar el correo usando Resend
    await resend.emails.send({
      from: 'Analía Camarda <hola@analiacamarda.com>',
      to: [email],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f2eee8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2eee8;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFAF5;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
                  
                  <tr>
                    <td style="background:#a35c33;padding:32px 40px;text-align:center;">
                      <p style="color:#FFFAF5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;font-weight:600;">ANALÍA CAMARDA</p>
                      <h1 style="color:#FFFAF5;font-size:26px;margin:0;font-weight:800;">
                        ${lang === 'en' ? 'Welcome to the journey!' : '¡Bienvenido(a) a la aventura!'}
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:40px;">
                      <p style="color:#2C1810;font-size:16px;line-height:1.7;margin:0 0 20px 0;">
                        ${lang === 'en' 
                          ? 'Thank you for your interest! Your free guide <strong>"5 Passive Income Streams You Can Start Today"</strong> is ready for you.' 
                          : '¡Gracias por tu interés! Tu guía gratuita <strong>"5 Fuentes de Ingresos Pasivos que Podés Iniciar Hoy"</strong> está lista para ti.'}
                      </p>

                      <p style="color:#7A6055;font-size:14px;line-height:1.7;margin:0 0 32px 0;">
                        ${lang === 'en'
                          ? 'Click the button below to download your PDF. <strong>The link is valid for 1 hour</strong>, so please save it to your device right away.'
                          : 'Haz clic en el botón a continuación para descargar tu PDF. <strong>El enlace es válido por 1 hora</strong>, así que guárdalo en tu dispositivo de inmediato.'}
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${downloadUrl}"
                               style="display:inline-block;background:#a35c33;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                              ${lang === 'en' ? '📥 Download My Guide' : '📥 Descargar Mi Guía'}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error('Error sending lead magnet:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
