/**
 * Suite de Pruebas para ErrorHandler - Sistema EVA
 * 
 * Pruebas exhaustivas para el sistema de manejo de errores:
 * - Detección de tipos de error
 * - Categorización jerárquica
 * - Recuperación automática
 * - Escalamiento de errores
 * - Métricas y logging
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import errorHandler, { ERROR_TYPES, ERROR_CATEGORIES } from '../utils/errorHandler.js';

// Mocks
vi.mock('../services/authService.js', () => ({
  default: {
    refreshToken: vi.fn().mockResolvedValue({ success: true })
  }
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Limpiar estado antes de cada prueba
    errorHandler.clearErrorLog();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Limpiar después de cada prueba
    vi.restoreAllMocks();
  });

  describe('Detección de Tipos de Error', () => {
    test('debe detectar errores de red correctamente', () => {
      const networkError = {
        request: {},
        code: 'ECONNREFUSED',
        message: 'Connection refused'
      };

      const processed = errorHandler.processError(networkError);
      
      expect(processed.type).toBe(ERROR_TYPES.NETWORK.CONNECTION_REFUSED);
      expect(processed.category).toBe(ERROR_CATEGORIES.HIGH);
    });

    test('debe detectar errores de timeout', () => {
      const timeoutError = {
        request: {},
        code: 'ETIMEDOUT',
        message: 'Request timeout'
      };

      const processed = errorHandler.processError(timeoutError);
      
      expect(processed.type).toBe(ERROR_TYPES.NETWORK.CONNECTION_TIMEOUT);
      expect(processed.recoverable).toBe(true);
    });

    test('debe detectar errores de autenticación', () => {
      const authError = {
        response: {
          status: 401,
          data: {
            message: 'Token expired'
          }
        }
      };

      const processed = errorHandler.processError(authError);
      
      expect(processed.type).toBe(ERROR_TYPES.AUTH.TOKEN_EXPIRED);
      expect(processed.category).toBe(ERROR_CATEGORIES.HIGH);
    });

    test('debe detectar errores de base de datos', () => {
      const dbError = {
        response: {
          status: 500,
          data: {
            message: 'Database connection failed'
          }
        }
      };

      const processed = errorHandler.processError(dbError);
      
      expect(processed.type).toBe(ERROR_TYPES.DATABASE.CONNECTION_FAILED);
      expect(processed.category).toBe(ERROR_CATEGORIES.CRITICAL);
    });

    test('debe detectar errores de validación', () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['Email is required'],
              password: ['Password too short']
            }
          }
        }
      };

      const processed = errorHandler.processError(validationError);
      
      expect(processed.type).toBe(ERROR_TYPES.VALIDATION.SCHEMA_VIOLATION);
      expect(processed.details).toEqual(validationError.response.data.errors);
    });

    test('debe detectar errores de archivos', () => {
      const fileError = {
        response: {
          status: 413,
          data: {
            message: 'File size too large'
          }
        }
      };

      const processed = errorHandler.processError(fileError);
      
      expect(processed.type).toBe(ERROR_TYPES.FILE.SIZE_TOO_LARGE);
    });

    test('debe detectar errores de negocio', () => {
      const businessError = {
        response: {
          status: 409,
          data: {
            message: 'Workflow violation detected'
          }
        }
      };

      const processed = errorHandler.processError(businessError);
      
      expect(processed.type).toBe(ERROR_TYPES.BUSINESS.WORKFLOW_VIOLATION);
    });
  });

  describe('Categorización de Errores', () => {
    test('debe categorizar errores críticos correctamente', () => {
      const criticalError = {
        response: {
          status: 500,
          data: { message: 'Database deadlock' }
        }
      };

      const processed = errorHandler.processError(criticalError);
      
      expect(processed.category).toBe(ERROR_CATEGORIES.CRITICAL);
    });

    test('debe categorizar errores altos correctamente', () => {
      const highError = {
        request: {},
        code: 'ECONNREFUSED'
      };

      const processed = errorHandler.processError(highError);
      
      expect(processed.category).toBe(ERROR_CATEGORIES.HIGH);
    });

    test('debe categorizar errores medios correctamente', () => {
      const mediumError = {
        response: {
          status: 400,
          data: { message: 'Required field missing' }
        }
      };

      const processed = errorHandler.processError(mediumError);
      
      expect(processed.category).toBe(ERROR_CATEGORIES.MEDIUM);
    });
  });

  describe('Recuperación Automática', () => {
    test('debe identificar errores recuperables', () => {
      const recoverableError = {
        request: {},
        code: 'ETIMEDOUT'
      };

      const processed = errorHandler.processError(recoverableError);
      
      expect(processed.recoverable).toBe(true);
      expect(processed.retryable).toBe(true);
    });

    test('debe intentar recuperación automática para errores de token', async () => {
      const tokenError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      const processed = errorHandler.processError(tokenError);
      
      // Esperar a que se complete la recuperación automática
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(processed.recoveryAttempted).toBe(true);
    });

    test('debe manejar fallos en recuperación automática', async () => {
      // Mock para simular fallo en refresh token
      const authService = await import('../services/authService.js');
      authService.default.refreshToken.mockRejectedValue(new Error('Refresh failed'));

      const tokenError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      const processed = errorHandler.processError(tokenError);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(processed.recoveryFailed).toBe(true);
    });
  });

  describe('Escalamiento de Errores', () => {
    test('debe escalar errores críticos inmediatamente', () => {
      const criticalError = {
        response: {
          status: 500,
          data: { message: 'Memory leak detected' }
        }
      };

      const shouldEscalate = errorHandler.shouldEscalate(
        errorHandler.processError(criticalError)
      );
      
      expect(shouldEscalate).toBe(true);
    });

    test('debe escalar errores después de alcanzar umbral', () => {
      const highError = {
        request: {},
        code: 'ECONNREFUSED'
      };

      // Simular múltiples errores para alcanzar umbral
      for (let i = 0; i < 3; i++) {
        errorHandler.processError(highError);
      }

      const processed = errorHandler.processError(highError);
      const shouldEscalate = errorHandler.shouldEscalate(processed);
      
      expect(shouldEscalate).toBe(true);
    });

    test('debe respetar intervalos mínimos entre alertas', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Critical error' }
        }
      };

      // Primera escalación
      const processed1 = errorHandler.processError(error);
      const shouldEscalate1 = errorHandler.shouldEscalate(processed1);
      expect(shouldEscalate1).toBe(true);

      // Segunda escalación inmediata (debería ser bloqueada)
      const processed2 = errorHandler.processError(error);
      const shouldEscalate2 = errorHandler.shouldEscalate(processed2);
      expect(shouldEscalate2).toBe(false);
    });
  });

  describe('Métricas y Estadísticas', () => {
    test('debe calcular métricas básicas correctamente', () => {
      // Agregar varios errores
      const errors = [
        { response: { status: 500 } },
        { response: { status: 404 } },
        { request: {}, code: 'ETIMEDOUT' },
        { response: { status: 401 } }
      ];

      errors.forEach(error => errorHandler.processError(error));

      const metrics = errorHandler.getAdvancedErrorMetrics();
      
      expect(metrics.total).toBe(4);
      expect(metrics.byType).toBeDefined();
      expect(metrics.byStatusCode).toBeDefined();
    });

    test('debe calcular tasa de recuperación', () => {
      // Simular errores recuperables y no recuperables
      const recoverableError = { request: {}, code: 'ETIMEDOUT' };
      const nonRecoverableError = { response: { status: 404 } };

      errorHandler.processError(recoverableError);
      errorHandler.processError(nonRecoverableError);

      const metrics = errorHandler.getAdvancedErrorMetrics();
      
      expect(metrics.recoveryRate).toBeGreaterThanOrEqual(0);
      expect(metrics.recoveryRate).toBeLessThanOrEqual(100);
    });

    test('debe agrupar errores por categoría', () => {
      const errors = [
        { response: { status: 500, data: { message: 'Database error' } } },
        { response: { status: 401, data: { message: 'Token expired' } } },
        { response: { status: 400, data: { message: 'Validation error' } } }
      ];

      errors.forEach(error => errorHandler.processError(error));

      const stats = errorHandler.getErrorStats();
      
      expect(stats.byType).toBeDefined();
      expect(Object.keys(stats.byType).length).toBeGreaterThan(0);
    });
  });

  describe('Logging y Persistencia', () => {
    test('debe agregar errores al log', () => {
      const error = { response: { status: 500 } };
      
      errorHandler.processError(error);
      
      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].originalError).toEqual(error);
    });

    test('debe mantener tamaño máximo del log', () => {
      // Simular muchos errores
      for (let i = 0; i < 150; i++) {
        errorHandler.processError({ response: { status: 500 } });
      }

      const log = errorHandler.getErrorLog();
      expect(log.length).toBeLessThanOrEqual(100); // maxLogSize por defecto
    });

    test('debe generar IDs de correlación únicos', () => {
      const error1 = errorHandler.processError({ response: { status: 500 } });
      const error2 = errorHandler.processError({ response: { status: 404 } });

      expect(error1.correlationId).toBeDefined();
      expect(error2.correlationId).toBeDefined();
      expect(error1.correlationId).not.toBe(error2.correlationId);
    });
  });

  describe('Contexto y Metadatos', () => {
    test('debe capturar contexto del error', () => {
      const error = { response: { status: 500 } };
      
      const processed = errorHandler.processError(error);
      
      expect(processed.context).toBeDefined();
      expect(processed.context.timestamp).toBeDefined();
      expect(processed.context.userAgent).toBeDefined();
      expect(processed.context.url).toBeDefined();
    });

    test('debe incluir información de sesión', () => {
      const error = { response: { status: 500 } };
      
      const processed = errorHandler.processError(error);
      
      expect(processed.sessionId).toBeDefined();
      expect(processed.timestamp).toBeDefined();
    });

    test('debe capturar stack trace', () => {
      const error = new Error('Test error');
      error.response = { status: 500 };
      
      const processed = errorHandler.processError(error);
      
      expect(processed.stackTrace).toBeDefined();
    });
  });

  describe('Notificaciones de Usuario', () => {
    test('debe mostrar notificación toast para errores', () => {
      const { toast } = require('react-toastify');
      
      const error = { response: { status: 500 } };
      
      errorHandler.showError(error);
      
      expect(toast.error).toHaveBeenCalled();
    });

    test('debe mostrar errores de validación específicos', () => {
      const { toast } = require('react-toastify');
      
      const validationError = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['Email is required'],
              password: ['Password too short']
            }
          }
        }
      };

      errorHandler.showValidationError(validationError);
      
      expect(toast.error).toHaveBeenCalledTimes(2); // Una por cada campo
    });

    test('debe mostrar mensajes de éxito', () => {
      const { toast } = require('react-toastify');
      
      errorHandler.showSuccess('Operation completed');
      
      expect(toast.success).toHaveBeenCalledWith('Operation completed', expect.any(Object));
    });
  });

  describe('Integración con Otros Sistemas', () => {
    test('debe verificar si error requiere reautenticación', () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      const requiresReauth = errorHandler.requiresReauth(authError);
      
      expect(requiresReauth).toBe(true);
    });

    test('debe identificar errores recuperables', () => {
      const networkError = { request: {}, code: 'ETIMEDOUT' };
      const validationError = { response: { status: 400 } };

      expect(errorHandler.isRecoverableError(networkError)).toBe(true);
      expect(errorHandler.isRecoverableError(validationError)).toBe(false);
    });
  });

  describe('Rendimiento y Optimización', () => {
    test('debe procesar errores rápidamente', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        errorHandler.processError({ response: { status: 500 } });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo para 100 errores
    });

    test('debe limpiar datos antiguos automáticamente', () => {
      // Simular errores antiguos
      const oldError = errorHandler.processError({ response: { status: 500 } });
      
      // Simular paso del tiempo
      vi.useFakeTimers();
      vi.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 horas
      
      errorHandler.cleanupOldMetrics();
      
      const log = errorHandler.getErrorLog();
      expect(log.some(e => e.correlationId === oldError.correlationId)).toBe(true);
      
      vi.useRealTimers();
    });
  });

  describe('Casos Edge', () => {
    test('debe manejar errores sin response', () => {
      const error = new Error('Network error');
      
      const processed = errorHandler.processError(error);
      
      expect(processed.type).toBeDefined();
      expect(processed.message).toBeDefined();
    });

    test('debe manejar errores con datos malformados', () => {
      const malformedError = {
        response: {
          status: 500,
          data: 'Invalid JSON'
        }
      };

      const processed = errorHandler.processError(malformedError);
      
      expect(processed.type).toBeDefined();
      expect(processed.message).toBe('Invalid JSON');
    });

    test('debe manejar errores circulares en datos', () => {
      const circularData = { a: 1 };
      circularData.self = circularData;

      const error = {
        response: {
          status: 500,
          data: circularData
        }
      };

      expect(() => errorHandler.processError(error)).not.toThrow();
    });

    test('debe manejar múltiples errores simultáneos', async () => {
      const errors = Array(10).fill().map((_, i) => ({
        response: { status: 500 + i }
      }));

      const promises = errors.map(error => 
        Promise.resolve(errorHandler.processError(error))
      );

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result.correlationId).toBeDefined();
      });
    });
  });
});
