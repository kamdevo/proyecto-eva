/**
 * ========================================
 * VITE CONFIG - APLICACIÓN DE TICKETS
 * ========================================
 * 
 * Configuración específica para la aplicación de tickets
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react({
      // React optimizations
      fastRefresh: true,
    }),
  ],

  // Configuración del servidor de desarrollo
  server: {
    port: 3001,
    host: true,
    cors: true,
    open: true, // Abrir automáticamente en el navegador
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("Proxy error:", err);
          });
        },
      },
    },
  },

  // Configuración de build
  build: {
    outDir: "dist-tickets",
    assetsDir: "assets",
    sourcemap: true,
    
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./ticket-index.html', import.meta.url))
      },
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },

  // Configuración de alias
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@components": fileURLToPath(new URL('./src/components', import.meta.url)),
      "@services": fileURLToPath(new URL('./src/services', import.meta.url)),
      "@utils": fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },

  // Variables de entorno específicas para tickets
  define: {
    __APP_NAME__: JSON.stringify("Sistema EVA - Tickets"),
    __APP_VERSION__: JSON.stringify("2.0.0"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Configuración de optimización
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react-router-dom",
      "lucide-react",
      "sonner"
    ],
  },
});
