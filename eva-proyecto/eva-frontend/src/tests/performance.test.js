/**
 * Suite de Pruebas de Performance - Sistema EVA
 * 
 * Pruebas de carga y estrés para validar:
 * - Performance del sistema de errores
 * - Eficiencia del cache
 * - Rendimiento del Circuit Breaker
 * - Throughput del sistema de logging
 * - Memoria y recursos
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import errorHandler from '../utils/errorHandler.js';
import smartCache from '../utils/smartCache.js';
import circuitBreakerManager from '../utils/circuitBreaker.js';
import logger from '../utils/logger.js';

describe('Performance Tests', () => {
  beforeEach(() => {
    // Limpiar estado antes de cada prueba
    errorHandler.clearErrorLog();
    smartCache.clear();
    circuitBreakerManager.resetAll();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Handler Performance', () => {
    test('debe procesar 1000 errores en menos de 1 segundo', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        errorHandler.processError({
          response: {
            status: 500,
            data: { message: `Error ${i}` }
          }
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
      expect(errorHandler.getErrorLog().length).toBe(1000);
    });

    test('debe mantener performance constante con muchos errores', () => {
      const measurements = [];
      
      // Medir tiempo para diferentes cantidades de errores
      for (const count of [100, 500, 1000, 2000]) {
        errorHandler.clearErrorLog();
        
        const startTime = performance.now();
        
        for (let i = 0; i < count; i++) {
          errorHandler.processError({
            response: { status: 500, data: { message: `Error ${i}` } }
          });
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const avgTimePerError = duration / count;
        
        measurements.push(avgTimePerError);
      }
      
      // El tiempo promedio por error no debería aumentar significativamente
      const firstAvg = measurements[0];
      const lastAvg = measurements[measurements.length - 1];
      
      expect(lastAvg).toBeLessThan(firstAvg * 2); // No más del doble
    });

    test('debe manejar errores concurrentes eficientemente', async () => {
      const concurrentErrors = 100;
      const startTime = performance.now();
      
      const promises = Array(concurrentErrors).fill().map((_, i) => 
        Promise.resolve(errorHandler.processError({
          response: { status: 500, data: { message: `Concurrent error ${i}` } }
        }))
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Menos de 500ms
      expect(results.length).toBe(concurrentErrors);
      expect(errorHandler.getErrorLog().length).toBe(concurrentErrors);
    });

    test('debe mantener uso de memoria bajo control', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Generar muchos errores
      for (let i = 0; i < 5000; i++) {
        errorHandler.processError({
          response: { 
            status: 500, 
            data: { 
              message: `Error ${i}`,
              details: `Large error details for error number ${i}`.repeat(10)
            }
          }
        });
      }
      
      const afterErrorsMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterErrorsMemory - initialMemory;
      
      // El aumento de memoria no debería ser excesivo (menos de 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      // Verificar que el log se mantiene en el límite
      expect(errorHandler.getErrorLog().length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Smart Cache Performance', () => {
    test('debe tener acceso rápido al cache', async () => {
      // Llenar cache con datos
      const cacheSize = 1000;
      const testData = { message: 'Test data', timestamp: Date.now() };
      
      // Llenar cache
      for (let i = 0; i < cacheSize; i++) {
        await smartCache.set(`key_${i}`, { ...testData, id: i });
      }
      
      // Medir tiempo de acceso
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const randomKey = `key_${Math.floor(Math.random() * cacheSize)}`;
        await smartCache.get(randomKey);
      }
      
      const endTime = performance.now();
      const avgAccessTime = (endTime - startTime) / 100;
      
      expect(avgAccessTime).toBeLessThan(1); // Menos de 1ms por acceso
    });

    test('debe manejar cache hits vs misses eficientemente', async () => {
      const testData = { message: 'Cached data' };
      
      // Llenar cache parcialmente
      for (let i = 0; i < 500; i++) {
        await smartCache.set(`cached_${i}`, testData);
      }
      
      const startTime = performance.now();
      let hits = 0;
      let misses = 0;
      
      // Mezclar hits y misses
      for (let i = 0; i < 1000; i++) {
        const key = i < 500 ? `cached_${i}` : `missing_${i}`;
        const result = await smartCache.get(key);
        
        if (result) hits++;
        else misses++;
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Menos de 100ms total
      expect(hits).toBe(500);
      expect(misses).toBe(500);
    });

    test('debe evictar elementos eficientemente', async () => {
      const largeData = 'x'.repeat(1024); // 1KB de datos
      
      const startTime = performance.now();
      
      // Llenar cache hasta forzar evicción
      for (let i = 0; i < 1000; i++) {
        await smartCache.set(`large_${i}`, { data: largeData, id: i });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
      
      // Verificar que el cache no creció indefinidamente
      const metrics = smartCache.getMetrics();
      expect(metrics.itemCount).toBeLessThan(1000);
    });

    test('debe comprimir datos grandes eficientemente', async () => {
      const largeObject = {
        data: 'x'.repeat(10000), // 10KB
        metadata: Array(100).fill().map((_, i) => ({ id: i, value: `item_${i}` }))
      };
      
      const startTime = performance.now();
      
      await smartCache.set('large_object', largeObject, { compress: true });
      const retrieved = await smartCache.get('large_object');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Menos de 50ms
      expect(retrieved).toEqual(largeObject);
    });
  });

  describe('Circuit Breaker Performance', () => {
    test('debe manejar múltiples servicios concurrentemente', async () => {
      const serviceCount = 50;
      const requestsPerService = 20;
      
      const startTime = performance.now();
      
      const promises = [];
      
      for (let serviceId = 0; serviceId < serviceCount; serviceId++) {
        const breaker = circuitBreakerManager.getBreaker(`service_${serviceId}`);
        
        for (let reqId = 0; reqId < requestsPerService; reqId++) {
          const promise = breaker.execute(async () => {
            // Simular trabajo
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            return `result_${serviceId}_${reqId}`;
          });
          
          promises.push(promise);
        }
      }
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
      expect(results.length).toBe(serviceCount * requestsPerService);
    });

    test('debe mantener performance con circuit breakers abiertos', async () => {
      const breaker = circuitBreakerManager.getBreaker('failing_service', {
        failureThreshold: 3,
        timeout: 100
      });
      
      // Forzar apertura del circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('Service down')));
        } catch (e) {
          // Esperado
        }
      }
      
      expect(breaker.state).toBe('OPEN');
      
      // Medir tiempo de rechazo
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        try {
          await breaker.execute(() => Promise.resolve('success'));
        } catch (e) {
          // Esperado - circuit breaker abierto
        }
      }
      
      const endTime = performance.now();
      const avgRejectionTime = (endTime - startTime) / 1000;
      
      expect(avgRejectionTime).toBeLessThan(0.1); // Menos de 0.1ms por rechazo
    });

    test('debe limpiar métricas antiguas eficientemente', async () => {
      const breaker = circuitBreakerManager.getBreaker('test_service');
      
      // Generar muchas ejecuciones
      for (let i = 0; i < 1000; i++) {
        await breaker.execute(() => Promise.resolve(`result_${i}`));
      }
      
      expect(breaker.executionHistory.length).toBeLessThanOrEqual(100); // Límite de historial
      
      const startTime = performance.now();
      breaker.cleanupHistory();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Menos de 10ms para limpiar
    });
  });

  describe('Logger Performance', () => {
    test('debe manejar alto volumen de logs', () => {
      const logCount = 10000;
      const startTime = performance.now();
      
      for (let i = 0; i < logCount; i++) {
        logger.info('PERFORMANCE', `Log message ${i}`, { 
          data: `Additional data for log ${i}`,
          timestamp: Date.now()
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTimePerLog = duration / logCount;
      
      expect(avgTimePerLog).toBeLessThan(0.1); // Menos de 0.1ms por log
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo total
    });

    test('debe mantener buffer de logs eficientemente', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Generar muchos logs
      for (let i = 0; i < 5000; i++) {
        logger.error('PERFORMANCE', `Error log ${i}`, {
          stack: new Error().stack,
          details: `Error details ${i}`.repeat(5)
        });
      }
      
      const afterLogsMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterLogsMemory - initialMemory;
      
      // El aumento de memoria debería ser razonable
      expect(memoryIncrease).toBeLessThan(30 * 1024 * 1024); // Menos de 30MB
      
      // Verificar que el buffer se mantiene en límites
      expect(logger.logs.length).toBeLessThanOrEqual(1000);
    });

    test('debe procesar logs concurrentes sin bloqueos', async () => {
      const concurrentLogs = 1000;
      const startTime = performance.now();
      
      const promises = Array(concurrentLogs).fill().map((_, i) => 
        Promise.resolve(logger.info('PERFORMANCE', `Concurrent log ${i}`, { id: i }))
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Menos de 200ms
    });
  });

  describe('Integrated System Performance', () => {
    test('debe manejar carga mixta del sistema completo', async () => {
      const startTime = performance.now();
      
      // Simular carga mixta
      const promises = [];
      
      // Errores
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(errorHandler.processError({
          response: { status: 500, data: { message: `System error ${i}` } }
        })));
      }
      
      // Cache operations
      for (let i = 0; i < 200; i++) {
        promises.push(smartCache.set(`mixed_${i}`, { data: `value_${i}` }));
        promises.push(smartCache.get(`mixed_${i}`));
      }
      
      // Circuit breaker operations
      for (let i = 0; i < 50; i++) {
        const breaker = circuitBreakerManager.getBreaker(`mixed_service_${i % 10}`);
        promises.push(breaker.execute(() => Promise.resolve(`result_${i}`)));
      }
      
      // Logs
      for (let i = 0; i < 300; i++) {
        promises.push(Promise.resolve(logger.info('PERFORMANCE', `Mixed log ${i}`)));
      }
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Menos de 2 segundos para toda la carga
    });

    test('debe mantener responsividad bajo carga sostenida', async () => {
      const testDuration = 1000; // 1 segundo
      const startTime = performance.now();
      let operations = 0;
      
      // Ejecutar operaciones continuas por 1 segundo
      while (performance.now() - startTime < testDuration) {
        // Mix de operaciones
        errorHandler.processError({ response: { status: 500 } });
        await smartCache.set(`sustained_${operations}`, { value: operations });
        logger.info('PERFORMANCE', `Sustained operation ${operations}`);
        
        operations++;
        
        // Pequeña pausa para no bloquear completamente
        if (operations % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      const actualDuration = performance.now() - startTime;
      const operationsPerSecond = operations / (actualDuration / 1000);
      
      expect(operationsPerSecond).toBeGreaterThan(1000); // Al menos 1000 ops/sec
      expect(operations).toBeGreaterThan(500); // Al menos 500 operaciones
    });

    test('debe recuperarse rápidamente después de picos de carga', async () => {
      // Generar pico de carga
      const peakOperations = 2000;
      
      for (let i = 0; i < peakOperations; i++) {
        errorHandler.processError({ response: { status: 500 } });
        logger.error('PERFORMANCE', `Peak load error ${i}`);
      }
      
      // Medir tiempo de recuperación
      const recoveryStartTime = performance.now();
      
      // Operaciones normales después del pico
      for (let i = 0; i < 100; i++) {
        await smartCache.set(`recovery_${i}`, { data: i });
        const result = await smartCache.get(`recovery_${i}`);
        expect(result.data).toBe(i);
      }
      
      const recoveryTime = performance.now() - recoveryStartTime;
      
      expect(recoveryTime).toBeLessThan(100); // Recuperación en menos de 100ms
    });
  });

  describe('Memory and Resource Management', () => {
    test('debe liberar memoria correctamente', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Crear muchos objetos temporales
      const tempData = [];
      for (let i = 0; i < 1000; i++) {
        tempData.push({
          id: i,
          data: 'x'.repeat(1000),
          timestamp: Date.now()
        });
        
        await smartCache.set(`temp_${i}`, tempData[i]);
        errorHandler.processError({
          response: { 
            status: 500, 
            data: { message: `Temp error ${i}`, details: tempData[i] }
          }
        });
      }
      
      // Limpiar referencias
      tempData.length = 0;
      await smartCache.clear();
      errorHandler.clearErrorLog();
      
      // Forzar garbage collection si está disponible
      if (global.gc) {
        global.gc();
      }
      
      // Esperar un poco para que se libere memoria
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // El aumento de memoria debería ser mínimo después de la limpieza
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Menos de 10MB
    });

    test('debe manejar límites de recursos gracefully', async () => {
      // Intentar llenar cache hasta el límite
      const largeData = 'x'.repeat(1024 * 1024); // 1MB
      let successfulSets = 0;
      
      try {
        for (let i = 0; i < 100; i++) { // Intentar 100MB
          await smartCache.set(`large_${i}`, { data: largeData });
          successfulSets++;
        }
      } catch (error) {
        // Esperado cuando se alcancen límites
      }
      
      // Debería haber manejado algunos datos antes de alcanzar límites
      expect(successfulSets).toBeGreaterThan(0);
      
      // El sistema debería seguir funcionando
      const testResult = await smartCache.get('large_0');
      expect(testResult).toBeDefined();
    });
  });
});
