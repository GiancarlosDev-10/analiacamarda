import type { APIRoute } from "astro";
import Stripe from "stripe";
import { Resend } from "resend";

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

const resend = new Resend(import.meta.env.RESEND_API_KEY as string);

// Mapeo: Stripe Payment Link ID → PDF en Vercel Blob + info del libro
const PRODUCT_MAP: Record<
  string,
  { blobUrl: string; title: string; lang: "en" | "es" }
> = {
  // Silent Success (EN)
  plink_1TIeJ7Ey1gF0PaKE5WNOuuYp: {
    blobUrl: import.meta.env.BLOB_URL_SILENT_SUCCESS as string,
    title: "Silent Success",
    lang: "en",
  },
  // The Ultimate Passive Income Blueprint (EN)
  plink_1TTeTIEy1gF0PaKE8HNADkYN: {
    blobUrl: import.meta.env.BLOB_URL_PLAN_30_DAYS_EN as string,
    title: "The Ultimate Passive Income Blueprint",
    lang: "en",
  },
  // Éxito Silencioso (ES)
  plink_1TIeHuEy1gF0PaKEQhgGw010: {
    blobUrl: import.meta.env.BLOB_URL_EXITO_SILENCIOSO as string,
    title: "Éxito Silencioso",
    lang: "es",
  },
  // La Última Guía de Ingresos Pasivos (ES)
  plink_1TIdkjEy1gF0PaKEGwGNJsq6: {
    blobUrl: import.meta.env.BLOB_URL_PLAN_30_DIAS_ES as string,
    title: "Descubre la Última Guía de Ingresos Pasivos",
    lang: "es",
  },
};

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const rawBody = await request.text();

    // Verificar autenticidad del webhook
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET as string,
    );

    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "";
    const paymentLinkId = session.payment_link as string | null;

    if (!customerEmail) {
      return new Response("No customer email", { status: 400 });
    }

    const product = paymentLinkId ? PRODUCT_MAP[paymentLinkId] : null;

    if (!product) {
      console.warn(`Unknown payment_link: ${paymentLinkId}`);
      return new Response("Unknown product", { status: 200 });
    }

    const { blobUrl, title, lang } = product;
    const firstName =
      customerName.split(" ")[0] || (lang === "en" ? "friend" : "amigo/a");

    // Generar URL con token codificado para acceso al blob privado
    const token = import.meta.env.BLOB_READ_WRITE_TOKEN as string;
    const downloadUrl = `${blobUrl}?token=${encodeURIComponent(token)}`;

    // Textos según idioma
    const subject =
      lang === "en"
        ? `Your E-Book "${title}" is ready! 📚`
        : `¡Tu E-Book "${title}" está listo! 📚`;

    const heading =
      lang === "en"
        ? `Your purchase was successful! 🎉`
        : `¡Tu compra fue exitosa! 🎉`;

    const bodyText =
      lang === "en"
        ? `Thank you for your trust, <strong>${firstName}</strong>! Your e-book <strong>"${title}"</strong> is ready to read.`
        : `Gracias por tu confianza, <strong>${firstName}</strong>. Tu e-book <strong>"${title}"</strong> ya está listo para leer.`;

    const urgencyText =
      lang === "en"
        ? "Click the button below to download your PDF. <strong>The link is valid for 1 hour</strong>, so please save it to your device right away."
        : "Haz clic en el botón a continuación para descargar tu PDF. <strong>El enlace es válido por 1 hora</strong>, así que guárdalo en tu dispositivo de inmediato.";

    const btnText =
      lang === "en" ? "📥 Download my E-Book" : "📥 Descargar mi E-Book";
    const helpText =
      lang === "en"
        ? "Having trouble downloading? Reply to this email and I'll help you personally."
        : "¿Problemas con la descarga? Responde a este correo y te ayudo personalmente.";

    await resend.emails.send({
      from: "Analía Camarda <hola@analiacamarda.com>",
      to: [customerEmail],
      subject,
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
                      <h1 style="color:#FFFAF5;font-size:26px;margin:0;font-weight:800;">${heading}</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:40px;">
                      <p style="color:#2C1810;font-size:16px;line-height:1.7;margin:0 0 20px 0;">
                        ${bodyText}
                      </p>
                      <p style="color:#7A6055;font-size:14px;line-height:1.7;margin:0 0 32px 0;">
                        ${urgencyText}
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${downloadUrl}"
                               style="display:inline-block;background:#a35c33;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                              ${btnText}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color:#7A6055;font-size:13px;text-align:center;margin:24px 0 0 0;">
                        ${helpText}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#f2eee8;padding:20px 40px;text-align:center;border-top:1px solid #DDD0C0;">
                      <p style="color:#7A6055;font-size:11px;margin:0;">
                        © ${new Date().getFullYear()} Analía Camarda · <a href="https://www.analiacamarda.com" style="color:#a35c33;">analiacamarda.com</a>
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

    console.log(`✅ Email enviado a ${customerEmail} para: ${title}`);
    return new Response(JSON.stringify({ received: true, email_sent: true }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
};
