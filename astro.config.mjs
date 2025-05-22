// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server", // Habilita SSR
  adapter: node({
    mode: "standalone",
  }),
  // Configuración para el manejo de cookies y headers
  vite: {
    ssr: {
      noExternal: ["@headlessui/react"],
    },
  },
});
