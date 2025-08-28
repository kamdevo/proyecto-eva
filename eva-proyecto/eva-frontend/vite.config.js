/**
 * Configuración de Vite Optimizada - Sistema EVA
 *
 * Características:
 * - Bundle splitting optimizado
 * - Compresión y minificación
 * - Code splitting por rutas
 * - Performance optimizations
 * - Proxy para desarrollo
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],

  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true,
    cors: true,
  },

  // Configuración de build simplificada
  build: {
    outDir: "dist",
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
