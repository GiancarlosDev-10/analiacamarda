/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#f2eee8',
        primary:    '#a35c33',
        dark:       '#2C1810',
        card:       '#FFFAF5',
        cta:        '#8B4513',
        'cta-hover':'#6B3410',
        border:     '#DDD0C0',
        muted:      '#7A6055',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body:    ['Roboto', 'sans-serif'],
        outfit:  ['Outfit', 'sans-serif'],   // usado como font-outfit en todos los componentes
      },
      width: {
        '115': '28.75rem',   // usado en MentorSection md:w-115 (460px)
      },
      height: {
        '115': '28.75rem',   // usado en MentorSection md:h-115 (460px)
      },
    },
  },
  plugins: [],
}
