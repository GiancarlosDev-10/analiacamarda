import type { APIRoute } from "astro";

export const prerender = false;

// Mapeo de claves → URLs del blob en Vercel
const PDF_MAP: Record<string, string> = {
  "leadm-en": import.meta.env.BLOB_URL_LEADM_EN as string,
  "leadm-es": import.meta.env.BLOB_URL_LEADM_ES as string,
  "silent-success": import.meta.env.BLOB_URL_SILENT_SUCCESS as string,
  "plan-30-en": import.meta.env.BLOB_URL_PLAN_30_DAYS_EN as string,
  exito: import.meta.env.BLOB_URL_EXITO_SILENCIOSO as string,
  "plan-30-es": import.meta.env.BLOB_URL_PLAN_30_DIAS_ES as string,
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const file = url.searchParams.get("file");
  const secret = url.searchParams.get("secret");

  // Verificar secret para evitar acceso no autorizado
  if (secret !== import.meta.env.DOWNLOAD_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!file || !PDF_MAP[file]) {
    return new Response("File not found", { status: 404 });
  }

  // Descargar el blob internamente usando el token
  const blobUrl = PDF_MAP[file];
  const response = await fetch(blobUrl, {
    headers: {
      Authorization: `Bearer ${import.meta.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!response.ok) {
    return new Response("Error fetching file", { status: 500 });
  }

  const blob = await response.blob();

  return new Response(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file}.pdf"`,
    },
  });
};
