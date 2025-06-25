/**
 * Suite de Pruebas para Circuit Breaker - Sistema EVA
 * 
 * Pruebas de integración para el patrón Circuit Breaker:
 * - Estados del circuito (CLOSED, OPEN, HALF_OPEN)
 * - Transiciones de estado
 * - Umbrales de fallo y éxito
 * - Timeouts y recuperación
 * - Métricas y monitoreo
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import circuitBreakerManager, { CircuitBreaker, CIRCUIT_STATES } from '../utils/circuitBreaker.js';

describe('Circuit Breaker', () => {
  let circuitBreaker;
  let mockFunction;

  beforeEach(() => {
    // Crear nuevo Circuit Breaker para cada prueba
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      monitoringPeriod: 500
    });

    // Mock function para pruebas
    mockFunction = vi.fn();
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Estado CLOSED (Normal)', () => {
    test('debe permitir ejecución en estado CLOSED', async () => {
      mockFunction.mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(mockFunction);
      
      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.CLOSED);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    test('debe registrar éxitos correctamente', async () => {
      mockFunction.mockResolvedValue('success');
      
      await circuitBreaker.execute(mockFunction);
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.metrics.successfulRequests).toBe(1);
      expect(metrics.metrics.totalRequests).toBe(1);
      expect(metrics.failureCount).toBe(0);
    });

    test('debe registrar fallos sin cambiar estado hasta alcanzar umbral', async () => {
      mockFunction.mockRejectedValue(new Error('Service error'));
      
      // Primer fallo
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service error');
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.CLOSED);
      expect(circuitBreaker.failureCount).toBe(1);

      // Segundo fallo
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service error');
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.CLOSED);
      expect(circuitBreaker.failureCount).toBe(2);
    });

    test('debe cambiar a OPEN al alcanzar umbral de fallos', async () => {
      mockFunction.mockRejectedValue(new Error('Service error'));
      
      // Fallos hasta alcanzar umbral (3)
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service error');
      }
      
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.OPEN);
      expect(circuitBreaker.failureCount).toBe(3);
    });

    test('debe resetear contador de fallos después de éxito', async () => {
      mockFunction
        .mockRejectedValueOnce(new Error('Service error'))
        .mockResolvedValue('success');
      
      // Un fallo
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service error');
      expect(circuitBreaker.failureCount).toBe(1);
      
      // Un éxito
      await circuitBreaker.execute(mockFunction);
      expect(circuitBreaker.failureCount).toBe(0);
    });
  });

  describe('Estado OPEN (Bloqueado)', () => {
    beforeEach(async () => {
      // Forzar estado OPEN
      mockFunction.mockRejectedValue(new Error('Service error'));
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service error');
      }
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.OPEN);
    });

    test('debe rechazar ejecuciones en estado OPEN', async () => {
      mockFunction.mockResolvedValue('success');
      
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Circuit breaker is OPEN');
      expect(mockFunction).not.toHaveBeenCalled();
    });

    test('debe registrar rechazos en métricas', async () => {
      mockFunction.mockResolvedValue('success');
      
      try {
        await circuitBreaker.execute(mockFunction);
      } catch (error) {
        // Esperado
      }
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.metrics.rejectedRequests).toBe(1);
    });

    test('debe cambiar a HALF_OPEN después del timeout', async () => {
      mockFunction.mockResolvedValue('success');
      
      // Avanzar tiempo más allá del timeout
      vi.advanceTimersByTime(1500);
      
      // Ahora debería permitir ejecución (HALF_OPEN)
      const result = await circuitBreaker.execute(mockFunction);
      
      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.HALF_OPEN);
    });

    test('no debe cambiar estado antes del timeout', async () => {
      mockFunction.mockResolvedValue('success');
      
      // Avanzar tiempo pero no lo suficiente
      vi.advanceTimersByTime(500);
      
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Circuit breaker is OPEN');
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.OPEN);
    });
  });

  describe('Estado HALF_OPEN (Probando)', () => {
    beforeEach(async () => {
      // Forzar estado HALF_OPEN
      mockFunction.mockRejectedValue(new Error('Service error'));
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service error');
      }
      
      // Avanzar tiempo para permitir transición a HALF_OPEN
      vi.advanceTimersByTime(1500);
      
      // Ejecutar una vez para cambiar a HALF_OPEN
      mockFunction.mockResolvedValueOnce('success');
      await circuitBreaker.execute(mockFunction);
      
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.HALF_OPEN);
    });

    test('debe permitir ejecuciones limitadas en HALF_OPEN', async () => {
      mockFunction.mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(mockFunction);
      
      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.HALF_OPEN);
    });

    test('debe cambiar a CLOSED después de éxitos suficientes', async () => {
      mockFunction.mockResolvedValue('success');
      
      // Necesita 2 éxitos para cerrar (successThreshold = 2)
      // Ya tenemos 1 del beforeEach, necesitamos 1 más
      await circuitBreaker.execute(mockFunction);
      
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.CLOSED);
      expect(circuitBreaker.successCount).toBe(0); // Se resetea al cerrar
    });

    test('debe cambiar a OPEN inmediatamente en caso de fallo', async () => {
      mockFunction.mockRejectedValue(new Error('Service still failing'));
      
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Service still failing');
      
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.OPEN);
      expect(circuitBreaker.successCount).toBe(0);
    });
  });

  describe('Métricas y Monitoreo', () => {
    test('debe calcular tiempo promedio de respuesta', async () => {
      mockFunction
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve('fast'), 100)))
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve('slow'), 300)));
      
      await circuitBreaker.execute(mockFunction);
      vi.advanceTimersByTime(100);
      
      await circuitBreaker.execute(mockFunction);
      vi.advanceTimersByTime(300);
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.metrics.averageResponseTime).toBeGreaterThan(0);
    });

    test('debe mantener historial de ejecuciones', async () => {
      mockFunction
        .mockResolvedValueOnce('success1')
        .mockRejectedValueOnce(new Error('error1'))
        .mockResolvedValueOnce('success2');
      
      await circuitBreaker.execute(mockFunction);
      
      try {
        await circuitBreaker.execute(mockFunction);
      } catch (error) {
        // Esperado
      }
      
      await circuitBreaker.execute(mockFunction);
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.recentActivity.total).toBe(3);
      expect(metrics.recentActivity.successes).toBe(2);
      expect(metrics.recentActivity.failures).toBe(1);
    });

    test('debe proporcionar estado de salud', () => {
      const health = circuitBreaker.getHealthStatus();
      
      expect(health.status).toBe('HEALTHY');
      expect(health.state).toBe(CIRCUIT_STATES.CLOSED);
      expect(health.successRate).toBeDefined();
      expect(health.averageResponseTime).toBeDefined();
    });

    test('debe reportar estado degradado con baja tasa de éxito', async () => {
      mockFunction.mockRejectedValue(new Error('Service error'));
      
      // Generar muchos fallos para bajar tasa de éxito
      for (let i = 0; i < 5; i++) {
        try {
          await circuitBreaker.execute(mockFunction);
        } catch (error) {
          // Esperado
        }
      }
      
      const health = circuitBreaker.getHealthStatus();
      expect(health.status).toBe('UNHEALTHY');
    });
  });

  describe('Errores Esperados', () => {
    test('no debe contar errores esperados como fallos', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      mockFunction.mockRejectedValue(validationError);
      
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('Validation failed');
      
      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.CLOSED);
    });

    test('debe contar errores no esperados como fallos', async () => {
      const systemError = new Error('System failure');
      
      mockFunction.mockRejectedValue(systemError);
      
      await expect(circuitBreaker.execute(mockFunction)).rejects.toThrow('System failure');
      
      expect(circuitBreaker.failureCount).toBe(1);
    });
  });

  describe('Callbacks y Eventos', () => {
    test('debe llamar callback onStateChange', async () => {
      const onStateChange = vi.fn();
      circuitBreaker.onStateChange = onStateChange;
      
      mockFunction.mockRejectedValue(new Error('Service error'));
      
      // Generar fallos para cambiar estado
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(mockFunction);
        } catch (error) {
          // Esperado
        }
      }
      
      expect(onStateChange).toHaveBeenCalledWith(
        CIRCUIT_STATES.CLOSED,
        CIRCUIT_STATES.OPEN,
        expect.any(Object)
      );
    });

    test('debe llamar callback onFailure', async () => {
      const onFailure = vi.fn();
      circuitBreaker.onFailure = onFailure;
      
      const error = new Error('Service error');
      mockFunction.mockRejectedValue(error);
      
      try {
        await circuitBreaker.execute(mockFunction);
      } catch (e) {
        // Esperado
      }
      
      expect(onFailure).toHaveBeenCalledWith(error, expect.any(Object));
    });

    test('debe llamar callback onSuccess', async () => {
      const onSuccess = vi.fn();
      circuitBreaker.onSuccess = onSuccess;
      
      mockFunction.mockResolvedValue('success');
      
      await circuitBreaker.execute(mockFunction);
      
      expect(onSuccess).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Reset y Limpieza', () => {
    test('debe resetear estado y métricas', async () => {
      mockFunction.mockRejectedValue(new Error('Service error'));
      
      // Generar algunos fallos
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(mockFunction);
        } catch (error) {
          // Esperado
        }
      }
      
      expect(circuitBreaker.failureCount).toBe(2);
      
      circuitBreaker.reset();
      
      expect(circuitBreaker.state).toBe(CIRCUIT_STATES.CLOSED);
      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.metrics.totalRequests).toBe(0);
    });

    test('debe limpiar historial antiguo automáticamente', async () => {
      mockFunction.mockResolvedValue('success');
      
      // Ejecutar varias veces
      for (let i = 0; i < 5; i++) {
        await circuitBreaker.execute(mockFunction);
      }
      
      // Simular paso del tiempo
      vi.advanceTimersByTime(10000); // 10 segundos
      
      // Ejecutar limpieza
      circuitBreaker.cleanupHistory();
      
      // El historial debería mantenerse ya que no es tan antiguo
      expect(circuitBreaker.executionHistory.length).toBeGreaterThan(0);
    });
  });
});

describe('Circuit Breaker Manager', () => {
  beforeEach(() => {
    // Limpiar manager antes de cada prueba
    circuitBreakerManager.resetAll();
  });

  test('debe crear y reutilizar Circuit Breakers', () => {
    const breaker1 = circuitBreakerManager.getBreaker('service1');
    const breaker2 = circuitBreakerManager.getBreaker('service1');
    const breaker3 = circuitBreakerManager.getBreaker('service2');
    
    expect(breaker1).toBe(breaker2); // Mismo servicio, misma instancia
    expect(breaker1).not.toBe(breaker3); // Servicios diferentes
  });

  test('debe proporcionar métricas de todos los breakers', async () => {
    const breaker1 = circuitBreakerManager.getBreaker('service1');
    const breaker2 = circuitBreakerManager.getBreaker('service2');
    
    // Ejecutar algunas operaciones
    await breaker1.execute(() => Promise.resolve('success'));
    await breaker2.execute(() => Promise.reject(new Error('error')));
    
    const allMetrics = circuitBreakerManager.getAllMetrics();
    
    expect(allMetrics.service1).toBeDefined();
    expect(allMetrics.service2).toBeDefined();
    expect(allMetrics.service1.metrics.successfulRequests).toBe(1);
    expect(allMetrics.service2.metrics.failedRequests).toBe(1);
  });

  test('debe proporcionar estado de salud de todos los breakers', () => {
    circuitBreakerManager.getBreaker('service1');
    circuitBreakerManager.getBreaker('service2');
    
    const healthStatus = circuitBreakerManager.getHealthStatus();
    
    expect(healthStatus.service1).toBeDefined();
    expect(healthStatus.service2).toBeDefined();
    expect(healthStatus.service1.status).toBe('HEALTHY');
    expect(healthStatus.service2.status).toBe('HEALTHY');
  });

  test('debe resetear todos los breakers', async () => {
    const breaker1 = circuitBreakerManager.getBreaker('service1');
    const breaker2 = circuitBreakerManager.getBreaker('service2');
    
    // Generar algunos fallos
    try {
      await breaker1.execute(() => Promise.reject(new Error('error')));
    } catch (e) {
      // Esperado
    }
    
    try {
      await breaker2.execute(() => Promise.reject(new Error('error')));
    } catch (e) {
      // Esperado
    }
    
    expect(breaker1.failureCount).toBe(1);
    expect(breaker2.failureCount).toBe(1);
    
    circuitBreakerManager.resetAll();
    
    expect(breaker1.failureCount).toBe(0);
    expect(breaker2.failureCount).toBe(0);
  });
});
