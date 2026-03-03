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
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath, URL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));



// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react({
        // React optimizations
        fastRefresh: true,
      }),
      tailwindcss(),
    ],

    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      host: true,
      cors: true,
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
        "/sanctum": {
          target: "http://localhost:8001",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Configuración de build
    build: {
      target: "es2020",
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      minify: "esbuild", // Cambié de terser a esbuild (más estable)
      
      // esbuild options (más simple y estable que terser)
      esbuildOptions: {
        drop: isDev ? [] : ['console', 'debugger'],
      },

      // Configuración de rollup
      rollupOptions: {
        output: {
          // NO usar manualChunks - dejar que Rollup resuelva automáticamente
          // el orden de inicialización de módulos (evita "Cannot access before initialization")

          // Configuración de nombres de archivos
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },

      // Configuración de CSS
      cssCodeSplit: true,
      cssMinify: true,

      // Configuración de assets
      assetsInlineLimit: 4096, // 4KB

      // Configuración de chunks
      chunkSizeWarningLimit: 1000,

      // Configuración de reportes
      reportCompressedSize: true,
    },

    resolve: {
      alias: {
       "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@config": path.resolve(__dirname, "./src/config"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    },

    // Configuración de optimización de dependencias
    optimizeDeps: {
      include: ["react", "react-dom", "axios"],
    },

    // Variables de entorno
    define: {
      __APP_VERSION__: JSON.stringify("1.0.0"),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDev,
    },

    // Configuración de esbuild
    esbuild: {
      target: "es2020",
      drop: !isDev ? ["console", "debugger"] : [],
      legalComments: "none",
    },
  };
});
