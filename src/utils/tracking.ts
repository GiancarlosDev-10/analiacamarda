// ============================================
// UTILIDAD DE TRACKING PARA GOOGLE ANALYTICS Y GOOGLE ADS
// Usar en botones importantes (CTAs) para medir conversiones
// ============================================

interface TrackingEvent {
  event_name: string;
  category?: string;
  label?: string;
  value?: number;
}

/**
 * Envía evento a Google Analytics y Google Ads
 * Usar en onclick de botones importantes
 *
 * Ejemplo de uso:
 * onclick="trackEvent('click_academy', 'cta', 'hero_button', 1)"
 */
export function trackEvent(eventName: string, category?: string, label?: string, value?: number): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: category,
      event_label:    label,
      value:          value,
    });
  }

  // Google Ads — solo para eventos de conversión o compra
  if ((window as any).gtag && (eventName.includes('conversion') || eventName.includes('purchase'))) {
    (window as any).gtag('event', 'conversion', {
      send_to: 'AW-XXXXXXXXXX', // reemplazar con el ID de conversión de Google Ads cuando Analía tenga acceso
    });
  }

  // Solo mostrar logs en desarrollo
  if (import.meta.env.DEV) {
    console.log(`[Tracking] ${eventName}`, { category, label, value });
  }
}

/**
 * Eventos predefinidos para botones comunes
 */
export const trackingEvents = {
  // CTAs principales
  clickAcademyHero:    () => trackEvent('click_academy',   'cta',        'hero_button',     1),
  clickAcademySection: () => trackEvent('click_academy',   'cta',        'academy_section', 1),
  clickBooks:          () => trackEvent('click_books',     'cta',        'hero_button',     1),

  // Conversiones de compra
  purchaseBook: (bookName: string, value: number) =>
    trackEvent('purchase', 'ecommerce', bookName, value),

  // Lead magnet
  downloadGuide: () => trackEvent('download_guide', 'lead_magnet', 'free_guide', 1),

  // Contacto / Redes sociales
  clickWhatsApp:  () => trackEvent('click_whatsapp',  'contact', 'whatsapp_button', 1),
  clickInstagram: () => trackEvent('click_instagram', 'social',  'footer_link',     1),
};

// Exponer al window para uso inline en componentes Astro
if (typeof window !== 'undefined') {
  (window as any).trackEvent      = trackEvent;
  (window as any).trackingEvents  = trackingEvents;
}