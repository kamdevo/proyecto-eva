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
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // React optimizations
      fastRefresh: true
    }),
    tailwindcss()
  ],

  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
        }
      }
    }
  },

  // Configuración de build
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',

    // Configuración de terser para minificación
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },

    // Configuración de rollup
    rollupOptions: {
      output: {
        // Configuración de chunks
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['axios'],

          // Utility chunks
          'utils-monitoring': [
            './src/services/realUserMonitoring.js',
            './src/services/connectionPool.js',
            './src/services/websocketManager.js'
          ],
          'utils-error-handling': [
            './src/utils/errorHandler.js',
            './src/utils/circuitBreaker.js',
            './src/utils/smartCache.js'
          ]
        },

        // Configuración de nombres de archivos
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },

    // Configuración de CSS
    cssCodeSplit: true,
    cssMinify: true,

    // Configuración de assets
    assetsInlineLimit: 4096, // 4KB

    // Configuración de chunks
    chunkSizeWarningLimit: 1000,

    // Configuración de reportes
    reportCompressedSize: true
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
      "@assets": path.resolve(__dirname, "./src/assets")
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  // Configuración de optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'axios'
    ]
  },

  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: process.env.NODE_ENV === 'development'
  },

  // Configuración de esbuild
  esbuild: {
    target: 'es2020',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  }
});
