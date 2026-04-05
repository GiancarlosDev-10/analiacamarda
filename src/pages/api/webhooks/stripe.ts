import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { head } from '@vercel/blob';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

const resend = new Resend(import.meta.env.RESEND_API_KEY as string);

// Mapeo: Stripe Payment Link ID → PDF en Vercel Blob + info del libro
// Para obtener el Payment Link ID: abre cada link de Stripe y copia el ID (plink_XXXX)
// desde el panel Stripe > Payment Links

const PRODUCT_MAP: Record<string, { blobUrl: string; title: string }> = {
  // Silent Success (EN)
  'plink_1TIeJ7Ey1gF0PaKE5WNOuuYp': {
    blobUrl: import.meta.env.BLOB_URL_SILENT_SUCCESS as string,
    title: 'Silent Success',
  },
  // The Ultimate Passive Income Blueprint (EN)
  'plink_1TTeTIEy1gF0PaKE8HNADkYN': {
    blobUrl: import.meta.env.BLOB_URL_PLAN_30_DAYS_EN as string,
    title: 'The Ultimate Passive Income Blueprint',
  },
  // Éxito Silencioso (ES)
  'plink_1TIeHuEy1gF0PaKEQhgGw010': {
    blobUrl: import.meta.env.BLOB_URL_EXITO_SILENCIOSO as string,
    title: 'Éxito Silencioso',
  },
  // La Última Guía de Ingresos Pasivos (ES)
  'plink_1TIdkjEy1gF0PaKEGwGNJsq6': {
    blobUrl: import.meta.env.BLOB_URL_PLAN_30_DIAS_ES as string,
    title: 'Descubre la Última Guía de Ingresos Pasivos',
  },
};

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const rawBody = await request.text();

    // Verify authenticity – this is the critical security step
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerEmail = session.customer_details?.email;
      const paymentLinkId = session.payment_link as string | null;

      if (!customerEmail) {
        return new Response('No customer email', { status: 400 });
      }

      // Identify which book was purchased
      const product = paymentLinkId ? PRODUCT_MAP[paymentLinkId] : null;

      if (!product) {
        // Fallback: we still notify Analia but don't know which book
        console.warn(`Unknown payment_link: ${paymentLinkId}`);
        return new Response('Unknown product', { status: 200 });
      }

      // Generate a temporary signed URL (valid 1 hour) so the private blob is accessible
      const blobInfo = await head(product.blobUrl, {
        token: import.meta.env.BLOB_READ_WRITE_TOKEN as string,
      });

      // Build the download URL (for private blobs you need a signed token)
      // Using the blob URL directly with token as query param for temporary access
      const downloadUrl = `${product.blobUrl}?token=${import.meta.env.BLOB_READ_WRITE_TOKEN}`;

      // Send email via Resend
      await resend.emails.send({
        from: 'Analía Camarda <hola@analiacamarda.com>',
        to: [customerEmail],
        subject: `¡Tu E-Book "${product.title}" está listo! 📚`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head><meta charset="UTF-8"></head>
          <body style="margin:0;padding:0;background:#f2eee8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2eee8;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFAF5;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background:#a35c33;padding:32px 40px;text-align:center;">
                        <p style="color:#FFFAF5;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;font-weight:600;">ANALÍA CAMARDA</p>
                        <h1 style="color:#FFFAF5;font-size:26px;margin:0;font-weight:800;">¡Tu compra fue exitosa! 🎉</h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="color:#2C1810;font-size:16px;line-height:1.7;margin:0 0 20px 0;">
                          Gracias por tu confianza. Tu e-book <strong>"${product.title}"</strong> ya está listo para leer.
                        </p>

                        <p style="color:#7A6055;font-size:14px;line-height:1.7;margin:0 0 32px 0;">
                          Haz clic en el botón a continuación para descargar tu PDF. <strong>El enlace es válido por 1 hora</strong>, así que guárdalo en tu dispositivo de inmediato.
                        </p>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${downloadUrl}"
                                 style="display:inline-block;background:#a35c33;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                                📥 Descargar mi E-Book
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="color:#7A6055;font-size:13px;text-align:center;margin:24px 0 0 0;">
                          ¿Problemas con la descarga? Responde a este correo y te ayudo personalmente.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f2eee8;padding:20px 40px;text-align:center;border-top:1px solid #DDD0C0;">
                        <p style="color:#7A6055;font-size:11px;margin:0;">
                          © ${new Date().getFullYear()} Analía Camarda · <a href="https://analiacamarda.com" style="color:#a35c33;">analiacamarda.com</a>
                        </p>
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

      return new Response(JSON.stringify({ received: true, email_sent: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
};
