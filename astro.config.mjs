import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "ignore",
  site: "https://www.analiacamarda.com",

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: "always",
  },

  integrations: [sitemap()],
  adapter: vercel(),
});
