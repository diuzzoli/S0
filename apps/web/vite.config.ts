import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Debe ir antes que react(): genera src/routeTree.gen.ts desde src/routes.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    // Web y API en el mismo origen también en desarrollo: sin CORS y cookies first-party.
    proxy: { "/api": { target: "http://localhost:3000", changeOrigin: false } },
  },
  // Lee el .env de la raíz del monorepo (solo variables VITE_* llegan al navegador).
  envDir: "../../",
  build: { sourcemap: true },
});
