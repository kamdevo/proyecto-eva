/**
 * ========================================
 * CONFIGURACIÓN DE VITEST
 * ========================================
 *
 * Configuración para pruebas unitarias e integración
 * con soporte para React Testing Library y mocks
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Entorno de pruebas
    environment: 'jsdom',
    
    // Archivos de configuración
    setupFiles: ['./src/tests/setup.js'],
    
    // Patrones de archivos de prueba
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    
    // Archivos a excluir
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
    ],
    
    // Configuración de cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        'src/tests/**',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/main.jsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Configuración de timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Configuración de reporters
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },
    
    // Variables de entorno para pruebas
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:8001/api',
      VITE_WS_URL: 'ws://localhost:8001/ws',
    },
    
    // Configuración de mocks globales
    globals: true,
    
    // Configuración de alias (igual que en vite.config.js)
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Configuración de resolución
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
