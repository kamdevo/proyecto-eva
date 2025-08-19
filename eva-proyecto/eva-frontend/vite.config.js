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
      sourcemap: isDev,
      minify: "terser",

      // Configuración de terser para minificación
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.debug"],
        },
        mangle: {
          safari10: true,
        },
      },

      // Configuración de rollup
      rollupOptions: {
        output: {
          // Configuración de chunks
          manualChunks: {
            // Vendor chunks
            "vendor-react": ["react", "react-dom"],
            "vendor-utils": ["axios"],

            // Utility chunks
            "utils-monitoring": [
              "./src/services/realUserMonitoring.js",
              "./src/services/connectionPool.js",
              "./src/services/websocketManager.js",
            ],
            "utils-error-handling": [
              "./src/utils/errorHandler.js",
              "./src/utils/circuitBreaker.js",
              "./src/utils/smartCache.js",
            ],
          },

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
        "@": new URL("./src", import.meta.url).pathname,
        "@components": new URL("./src/components", import.meta.url).pathname,
        "@pages": new URL("./src/pages", import.meta.url).pathname,
        "@services": new URL("./src/services", import.meta.url).pathname,
        "@utils": new URL("./src/utils", import.meta.url).pathname,
        "@hooks": new URL("./src/hooks", import.meta.url).pathname,
        "@config": new URL("./src/config", import.meta.url).pathname,
        "@assets": new URL("./src/assets", import.meta.url).pathname,
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
