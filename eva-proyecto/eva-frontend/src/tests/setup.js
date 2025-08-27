/**
 * ========================================
 * CONFIGURACIÓN DE PRUEBAS
 * ========================================
 *
 * Configuración global para todas las pruebas
 * Incluye mocks, polyfills y configuraciones de testing library
 */

import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender expect con matchers de testing-library
expect.extend(matchers);

// Limpiar después de cada prueba
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock de ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock de fetch
global.fetch = vi.fn();

// Mock de WebSocket
global.WebSocket = vi.fn(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock de Notification API
global.Notification = vi.fn(() => ({
  close: vi.fn(),
}));

Object.defineProperty(Notification, 'permission', {
  value: 'granted',
  writable: true,
});

Object.defineProperty(Notification, 'requestPermission', {
  value: vi.fn(() => Promise.resolve('granted')),
  writable: true,
});

// Mock de URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock de FileReader
global.FileReader = vi.fn(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  result: null,
  error: null,
  readyState: 0,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
}));

// Mock de console para pruebas más limpias
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Configuración de timeouts para pruebas asíncronas
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000,
});

// Helper para crear mocks de componentes
export const createMockComponent = (name) => {
  return vi.fn(({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': `mock-${name}`,
      ...props,
    }, children);
  });
};

// Helper para crear mocks de hooks
export const createMockHook = (returnValue) => {
  return vi.fn(() => returnValue);
};

// Helper para simular eventos de usuario
export const createMockEvent = (type, properties = {}) => {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {
      value: '',
      checked: false,
      ...properties.target,
    },
    currentTarget: {
      value: '',
      checked: false,
      ...properties.currentTarget,
    },
    ...properties,
  };
};

// Helper para crear datos de prueba
export const createMockTicket = (overrides = {}) => {
  return {
    id: 1,
    numero_ticket: 'TK-001',
    titulo: 'Ticket de prueba',
    descripcion: 'Descripción del ticket de prueba',
    categoria: 'soporte_tecnico',
    prioridad: 'media',
    estado: 'abierto',
    equipo_id: null,
    usuario_creador: 'Usuario Test',
    usuario_asignado: null,
    fecha_creacion: '2024-01-15T10:00:00Z',
    fecha_limite: null,
    fecha_asignacion: null,
    fecha_cierre: null,
    solucion: null,
    comentarios_cierre: null,
    satisfaccion: null,
    archivo_adjunto: null,
    ...overrides,
  };
};

// Helper para crear respuestas de API mock
export const createMockApiResponse = (data, meta = {}) => {
  return {
    success: true,
    data,
    meta: {
      total: Array.isArray(data) ? data.length : 1,
      current_page: 1,
      last_page: 1,
      per_page: 10,
      ...meta,
    },
    message: 'Operación exitosa',
  };
};

// Helper para crear errores de API mock
export const createMockApiError = (message = 'Error de prueba', status = 500) => {
  const error = new Error(message);
  error.response = {
    status,
    data: {
      message,
      errors: {},
    },
  };
  return error;
};

// Configuración de React Testing Library
import '@testing-library/jest-dom';

// Configurar testing-library para mejores mensajes de error
import { configure } from '@testing-library/react';

configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: false,
});

// Exportar utilidades comunes
export {
  vi,
  expect,
  cleanup,
};
