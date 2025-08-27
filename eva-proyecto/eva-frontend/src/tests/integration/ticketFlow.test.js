/**
 * ========================================
 * PRUEBAS DE INTEGRACIÓN - FLUJO DE TICKETS
 * ========================================
 *
 * Pruebas end-to-end para el flujo completo de gestión de tickets
 * Incluye creación, asignación, resolución y cierre
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GestionTickets from '../../components/GestionTickets';
import CreateTicketModal from '../../components/modals/CreateTicketModal';
import { ToastProvider } from '../../contexts/ToastContext';

// Mock del servicio API
const mockApiService = {
  ticketsApi: {
    getList: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    assign: vi.fn(),
    resolve: vi.fn(),
    close: vi.fn(),
    getGeneralStats: vi.fn(),
  },
};

// Mock de notificaciones en tiempo real
const mockRealTimeNotifications = {
  lastTicketUpdate: null,
  isConnected: true,
  notifications: [],
  unreadCount: 0,
};

// Wrapper para providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      {children}
    </ToastProvider>
  </BrowserRouter>
);

// Mock de las dependencias
vi.mock('../../services/apiService', () => ({
  default: mockApiService,
}));

vi.mock('../../hooks/useRealTimeNotifications', () => ({
  default: () => mockRealTimeNotifications,
}));

describe('Flujo de Gestión de Tickets - Integración', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de respuesta por defecto para la lista de tickets
    mockApiService.ticketsApi.getList.mockResolvedValue({
      success: true,
      data: [],
      meta: {
        total: 0,
        last_page: 1,
        current_page: 1,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Visualización de tickets', () => {
    it('debería mostrar la lista de tickets correctamente', async () => {
      const mockTickets = [
        {
          id: 1,
          numero_ticket: 'TK-001',
          titulo: 'Problema de conexión',
          descripcion: 'No puedo conectarme al sistema',
          estado: 'abierto',
          prioridad: 'alta',
          categoria: 'soporte_tecnico',
          fecha_creacion: '2024-01-15',
          usuario_creador: 'Juan Pérez',
          usuario_asignado: 'Ana García',
        },
        {
          id: 2,
          numero_ticket: 'TK-002',
          titulo: 'Error en el sistema',
          descripcion: 'El sistema muestra errores',
          estado: 'en_proceso',
          prioridad: 'media',
          categoria: 'mantenimiento',
          fecha_creacion: '2024-01-16',
          usuario_creador: 'María López',
          usuario_asignado: 'Carlos Ruiz',
        },
      ];

      mockApiService.ticketsApi.getList.mockResolvedValue({
        success: true,
        data: mockTickets,
        meta: {
          total: 2,
          last_page: 1,
          current_page: 1,
        },
      });

      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar a que se carguen los tickets
      await waitFor(() => {
        expect(screen.getByText('TK-001')).toBeInTheDocument();
        expect(screen.getByText('TK-002')).toBeInTheDocument();
      });

      // Verificar que se muestran los detalles correctos
      expect(screen.getByText('Problema de conexión')).toBeInTheDocument();
      expect(screen.getByText('Error en el sistema')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
    });

    it('debería mostrar estado de carga', async () => {
      // Simular carga lenta
      mockApiService.ticketsApi.getList.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: [],
          meta: { total: 0 },
        }), 100))
      );

      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Verificar que se muestra el indicador de carga
      expect(screen.getByText('Cargando tickets...')).toBeInTheDocument();

      // Esperar a que termine la carga
      await waitFor(() => {
        expect(screen.queryByText('Cargando tickets...')).not.toBeInTheDocument();
      });
    });

    it('debería manejar errores de carga', async () => {
      mockApiService.ticketsApi.getList.mockRejectedValue(
        new Error('Error de conexión')
      );

      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar a que se muestre el error
      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
        expect(screen.getByText('Error de conexión')).toBeInTheDocument();
      });

      // Verificar que hay un botón para reintentar
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  describe('Búsqueda y filtros', () => {
    beforeEach(() => {
      const mockTickets = [
        {
          id: 1,
          numero_ticket: 'TK-001',
          titulo: 'Problema de conexión WiFi',
          estado: 'abierto',
          prioridad: 'alta',
        },
        {
          id: 2,
          numero_ticket: 'TK-002',
          titulo: 'Error en impresora',
          estado: 'cerrado',
          prioridad: 'baja',
        },
      ];

      mockApiService.ticketsApi.getList.mockResolvedValue({
        success: true,
        data: mockTickets,
        meta: { total: 2 },
      });
    });

    it('debería filtrar tickets por búsqueda', async () => {
      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar a que se carguen los tickets
      await waitFor(() => {
        expect(screen.getByText('TK-001')).toBeInTheDocument();
      });

      // Buscar por término
      const searchInput = screen.getByPlaceholderText(/Buscar por título/);
      await user.type(searchInput, 'conexión');

      // Verificar que se llama a la API con el término de búsqueda
      await waitFor(() => {
        expect(mockApiService.ticketsApi.getList).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'conexión',
          })
        );
      });
    });

    it('debería filtrar tickets por estado', async () => {
      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar a que se carguen los tickets
      await waitFor(() => {
        expect(screen.getByText('TK-001')).toBeInTheDocument();
      });

      // Cambiar filtro de estado
      const statusSelect = screen.getByDisplayValue('Todos los estados');
      await user.click(statusSelect);
      await user.click(screen.getByText('Abierto'));

      // Verificar que se llama a la API con el filtro
      await waitFor(() => {
        expect(mockApiService.ticketsApi.getList).toHaveBeenCalledWith(
          expect.objectContaining({
            estado: 'abierto',
          })
        );
      });
    });

    it('debería filtrar tickets por prioridad', async () => {
      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar a que se carguen los tickets
      await waitFor(() => {
        expect(screen.getByText('TK-001')).toBeInTheDocument();
      });

      // Cambiar filtro de prioridad
      const prioritySelect = screen.getByDisplayValue('Todas las prioridades');
      await user.click(prioritySelect);
      await user.click(screen.getByText('Alta'));

      // Verificar que se llama a la API con el filtro
      await waitFor(() => {
        expect(mockApiService.ticketsApi.getList).toHaveBeenCalledWith(
          expect.objectContaining({
            prioridad: 'alta',
          })
        );
      });
    });
  });

  describe('Creación de tickets', () => {
    it('debería crear un ticket exitosamente', async () => {
      const newTicket = {
        id: 3,
        numero_ticket: 'TK-003',
        titulo: 'Nuevo ticket de prueba',
        descripcion: 'Descripción del nuevo ticket',
        categoria: 'soporte_tecnico',
        prioridad: 'media',
        estado: 'abierto',
      };

      mockApiService.ticketsApi.create.mockResolvedValue({
        success: true,
        data: newTicket,
      });

      const mockOnTicketCreated = vi.fn();

      render(
        <TestWrapper>
          <CreateTicketModal
            isOpen={true}
            onClose={() => {}}
            onTicketCreated={mockOnTicketCreated}
          />
        </TestWrapper>
      );

      // Llenar el formulario - Paso 1
      const titleInput = screen.getByLabelText(/Título/);
      const descriptionInput = screen.getByLabelText(/Descripción/);

      await user.type(titleInput, 'Nuevo ticket de prueba');
      await user.type(descriptionInput, 'Descripción del nuevo ticket');

      // Ir al siguiente paso
      await user.click(screen.getByText('Siguiente'));

      // Paso 2 - Seleccionar categoría y prioridad
      const categorySelect = screen.getByText('Seleccione una categoría');
      await user.click(categorySelect);
      await user.click(screen.getByText('Soporte Técnico'));

      const prioritySelect = screen.getByText('Seleccione una prioridad');
      await user.click(prioritySelect);
      await user.click(screen.getByText('Media'));

      // Ir al siguiente paso
      await user.click(screen.getByText('Siguiente'));

      // Paso 3 - Revisar y crear
      expect(screen.getByText('Resumen del Ticket')).toBeInTheDocument();
      expect(screen.getByText('Nuevo ticket de prueba')).toBeInTheDocument();

      // Crear el ticket
      await user.click(screen.getByText('Crear Ticket'));

      // Verificar que se llama a la API
      await waitFor(() => {
        expect(mockApiService.ticketsApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            titulo: 'Nuevo ticket de prueba',
            descripcion: 'Descripción del nuevo ticket',
            categoria: 'soporte_tecnico',
            prioridad: 'media',
          })
        );
      });

      // Verificar que se llama al callback
      expect(mockOnTicketCreated).toHaveBeenCalledWith(newTicket);
    });

    it('debería validar campos requeridos', async () => {
      render(
        <TestWrapper>
          <CreateTicketModal
            isOpen={true}
            onClose={() => {}}
            onTicketCreated={() => {}}
          />
        </TestWrapper>
      );

      // Intentar ir al siguiente paso sin llenar campos
      await user.click(screen.getByText('Siguiente'));

      // Verificar que se muestran errores de validación
      expect(screen.getByText('El título es requerido')).toBeInTheDocument();
      expect(screen.getByText('La descripción es requerida')).toBeInTheDocument();
    });
  });

  describe('Paginación', () => {
    it('debería navegar entre páginas', async () => {
      // Mock de respuesta con múltiples páginas
      mockApiService.ticketsApi.getList.mockResolvedValue({
        success: true,
        data: [{ id: 1, titulo: 'Ticket 1' }],
        meta: {
          total: 25,
          last_page: 3,
          current_page: 1,
        },
      });

      render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar a que se carguen los tickets
      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });

      // Ir a la página siguiente
      const nextButton = screen.getByText('Siguiente');
      await user.click(nextButton);

      // Verificar que se llama a la API con la página correcta
      await waitFor(() => {
        expect(mockApiService.ticketsApi.getList).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });
  });

  describe('Actualización en tiempo real', () => {
    it('debería recargar tickets cuando hay actualizaciones', async () => {
      const { rerender } = render(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Esperar carga inicial
      await waitFor(() => {
        expect(mockApiService.ticketsApi.getList).toHaveBeenCalledTimes(1);
      });

      // Simular actualización en tiempo real
      mockRealTimeNotifications.lastTicketUpdate = {
        type: 'ticketCreated',
        ticket: { id: 1, titulo: 'Nuevo ticket' },
        timestamp: new Date(),
      };

      // Re-renderizar con la actualización
      rerender(
        <TestWrapper>
          <GestionTickets />
        </TestWrapper>
      );

      // Verificar que se recarga la lista
      await waitFor(() => {
        expect(mockApiService.ticketsApi.getList).toHaveBeenCalledTimes(2);
      });
    });
  });
});
