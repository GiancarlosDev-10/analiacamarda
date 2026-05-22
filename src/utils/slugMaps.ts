export const slugMap: Record<string, string> = {
  // Books
  "silent-success": "exito-silencioso",
  "ultimate-passive-income-blueprint": "descubre-ingresos-pasivos",
  "why-passive-income": "por-que-ingresos-pasivos",

  // Blog
  "reasons-cybersecurity": "razones-ciberseguridad",
  "accesible-entrepreneurship": "emprendimiento-accesible",
  "first-digital-product-7-days": "tu-primer-producto-digital-7-dias",

  // Static Pages
  aboutme: "sobre-mi",
  academy: "academia",
  gallery: "galeria",
  "thank-you": "exito",
};

// Helper to get translated slug (EN -> ES or ES -> EN)
export function getTranslatedSlug(slug: string): string | undefined {
  if (slugMap[slug]) return slugMap[slug]; // EN -> ES
  const rev = Object.entries(slugMap).find(([, es]) => es === slug);
  return rev ? rev[0] : undefined; // ES -> EN
}
