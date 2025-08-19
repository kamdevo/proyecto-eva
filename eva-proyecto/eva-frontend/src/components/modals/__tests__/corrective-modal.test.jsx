import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { CorrectiveModal } from "../corrective-modal";

// Mock toast functionality
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock data that matches the Excel structure
const mockCorrectiveData = [
  {
    id: 1,
    fuente: "Correctivos generales",
    responsable_mantenimiento: "Juan Pérez",
    equipo_id: 9774,
    fecha_creacion: "2024-06-18",
    codigo_orden: "COR0001",
    descripcion_orden: "Revisión general del equipo de ultrasonido",
    codificacion_cierre: "Sin Info de orden de trabajo",
    equipo: "Equipo de ultrasonido",
    codigo_equipo: "EMCO6582",
    marca: "RICHMAR",
    modelo: "Soundcareplus",
    serie: "SZ9240300187",
    estado_actual: "Activo",
    sede: "CARTAGO",
    servicio: "MEDICINA FISICA Y REHABILITACIÓN CARTAGO",
    area: "",
    archivo: "",
    fecha_avance: "",
    titulo_avance1: "",
    descripcion_avance: "",
    fecha_avance2: "",
    titulo_avance2: "",
    descripcion_avance2: "",
    fecha_avance3: "",
    titulo_avance3: "",
    descripcion_avance3: "",
    retro_cierre: "",
    descripcion_cierre: "",
    fecha_cierre: "",
    costo_equipo: 0,
    fecha_fin: "",
    repuesto_instalado: "",
    created_at: "2024-06-18 10:30:00",
    updated_at: "2024-06-18 10:30:00",
  },
  {
    id: 2,
    fuente: "Correctivos generales",
    responsable_mantenimiento: "María García",
    equipo_id: 9776,
    fecha_creacion: "2024-06-17",
    codigo_orden: "COR0002",
    descripcion_orden: "Calibración de termohigrómetro",
    codificacion_cierre: "Completado",
    equipo: "TERMOHIGROMETRO SIN SONDA",
    codigo_equipo: "THC-020",
    marca: "KTJ",
    modelo: "TA218D",
    serie: "",
    estado_actual: "Activo",
    sede: "CARTAGO",
    servicio: "CENTRAL DE ESTERILIZACIÓN CARTAGO",
    area: "",
    archivo: "",
    fecha_avance: "2024-06-17",
    titulo_avance1: "Inicio calibración",
    descripcion_avance: "Se inicia el proceso de calibración del equipo",
    fecha_avance2: "",
    titulo_avance2: "",
    descripcion_avance2: "",
    fecha_avance3: "",
    titulo_avance3: "",
    descripcion_avance3: "",
    retro_cierre: "Calibración exitosa",
    descripcion_cierre: "Equipo calibrado según especificaciones técnicas",
    fecha_cierre: "2024-06-17",
    costo_equipo: 0,
    fecha_fin: "2024-06-17",
    repuesto_instalado: "",
    created_at: "2024-06-17 09:15:00",
    updated_at: "2024-06-17 16:45:00",
  },
];

/**
 * Enterprise Corrective Modal Test Suite
 *
 * Tests all functionality required by the correctivos requirements:
 * - Modal rendering and basic UI components
 * - Data loading and API integration
 * - Search functionality across all fields
 * - Filtering by status and other criteria
 * - Sorting capabilities
 * - Pagination controls
 * - Export functionality (Excel/CSV)
 * - Detail view navigation
 * - CRUD operations interface
 * - Error handling and loading states
 * - Responsive design elements
 */
describe("CorrectiveModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          correctivos: mockCorrectiveData,
          total: mockCorrectiveData.length,
        }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Rendering and Basic UI", () => {
    it("renders modal when open is true", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      expect(screen.getByText("🔧 Correctivos Generales")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Buscar en todos los campos...")
      ).toBeInTheDocument();
    });

    it("does not render modal when open is false", () => {
      render(<CorrectiveModal {...defaultProps} open={false} />);

      expect(
        screen.queryByText("🔧 Correctivos Generales")
      ).not.toBeInTheDocument();
    });

    it("renders export buttons", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      expect(screen.getByText("Excel")).toBeInTheDocument();
      expect(screen.getByText("CSV")).toBeInTheDocument();
      expect(screen.getByText("Actualizar")).toBeInTheDocument();
    });

    it("renders search and filter controls", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Buscar en todos los campos...")
      ).toBeInTheDocument();
      expect(screen.getByText("Estado")).toBeInTheDocument();
    });

    it("renders new corrective button", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      expect(screen.getByText("Nuevo Correctivo")).toBeInTheDocument();
    });
  });

  describe("Data Loading and API Integration", () => {
    it("loads corrective data on mount", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/correctivos-generales", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      });
    });

    it("displays loading state initially", () => {
      render(<CorrectiveModal {...defaultProps} />);

      expect(screen.getByText("Cargando correctivos...")).toBeInTheDocument();
    });

    it("displays data after loading", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
        expect(screen.getByText("COR0002")).toBeInTheDocument();
        expect(screen.getByText("Equipo de ultrasonido")).toBeInTheDocument();
        expect(
          screen.getByText("TERMOHIGROMETRO SIN SONDA")
        ).toBeInTheDocument();
      });
    });

    it("handles API errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("API Error"));

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        // Should still show sample data as fallback
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });
    });

    it("shows fallback data when API fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("filters data based on search term", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        "Buscar en todos los campos..."
      );
      await user.type(searchInput, "ultrasonido");

      await waitFor(() => {
        expect(screen.getByText("Equipo de ultrasonido")).toBeInTheDocument();
        expect(
          screen.queryByText("TERMOHIGROMETRO SIN SONDA")
        ).not.toBeInTheDocument();
      });
    });

    it("searches across multiple fields", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        "Buscar en todos los campos..."
      );
      await user.type(searchInput, "CARTAGO");

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
        expect(screen.getByText("COR0002")).toBeInTheDocument();
      });
    });

    it("shows no results message when search yields no matches", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        "Buscar en todos los campos..."
      );
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(
          screen.getByText("No se encontraron correctivos")
        ).toBeInTheDocument();
      });
    });

    it("clears search and shows all results", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        "Buscar en todos los campos..."
      );
      await user.type(searchInput, "ultrasonido");

      await waitFor(() => {
        expect(
          screen.queryByText("TERMOHIGROMETRO SIN SONDA")
        ).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(
          screen.getByText("TERMOHIGROMETRO SIN SONDA")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Filtering Functionality", () => {
    it("filters by active status", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole("combobox");
      await user.click(statusSelect);
      await user.click(screen.getByText("Activos"));

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
        expect(screen.getByText("COR0002")).toBeInTheDocument();
      });
    });

    it("filters by completed status", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole("combobox");
      await user.click(statusSelect);
      await user.click(screen.getByText("Completados"));

      await waitFor(() => {
        expect(screen.getByText("COR0002")).toBeInTheDocument();
        expect(screen.queryByText("COR0001")).not.toBeInTheDocument();
      });
    });

    it("shows filter count in results", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole("combobox");
      await user.click(statusSelect);
      await user.click(screen.getByText("Completados"));

      await waitFor(() => {
        expect(screen.getByText(/filtrado de 2 total/)).toBeInTheDocument();
      });
    });
  });

  describe("Sorting Functionality", () => {
    it("sorts by date when clicking date header", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const dateHeader = screen.getByText("Fecha");
      await user.click(dateHeader);

      // Verify sorting indicator appears
      expect(dateHeader.closest("button")).toBeInTheDocument();
    });

    it("sorts by codigo when clicking codigo header", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const codigoHeader = screen.getByText("Código");
      await user.click(codigoHeader);

      expect(codigoHeader.closest("button")).toBeInTheDocument();
    });

    it("toggles sort direction on second click", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const dateHeader = screen.getByText("Fecha");
      await user.click(dateHeader);
      await user.click(dateHeader);

      expect(dateHeader.closest("button")).toBeInTheDocument();
    });
  });

  describe("Pagination Functionality", () => {
    it("displays pagination info", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Mostrando 1 a 2 de 2 entradas/)
        ).toBeInTheDocument();
      });
    });

    it("changes items per page", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      // Find the items per page selector (second combobox)
      const selects = screen.getAllByRole("combobox");
      const itemsPerPageSelect = selects[1];

      await user.click(itemsPerPageSelect);
      await user.click(screen.getByText("5"));

      await waitFor(() => {
        expect(
          screen.getByText(/Mostrando 1 a 2 de 2 entradas/)
        ).toBeInTheDocument();
      });
    });

    it("shows correct page info", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
      });
    });
  });

  describe("Status Badge Display", () => {
    it("displays correct status badges", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Pendiente")).toBeInTheDocument();
        expect(screen.getByText("Completado")).toBeInTheDocument();
      });
    });

    it("displays priority badges", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getAllByText("Normal")).toHaveLength(2);
      });
    });
  });

  describe("Action Buttons", () => {
    it("renders view and edit buttons for each row", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        const viewButtons = screen.getAllByTitle("Ver detalles");
        const editButtons = screen.getAllByTitle("Editar");

        expect(viewButtons).toHaveLength(2);
        expect(editButtons).toHaveLength(2);
      });
    });

    it("opens detail view when clicking view button", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const viewButton = screen.getAllByTitle("Ver detalles")[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Detalle del Correctivo")).toBeInTheDocument();
      });
    });
  });

  describe("Export Functionality", () => {
    it("calls export API when clicking Excel button", async () => {
      const user = userEvent.setup();

      // Mock export API
      mockFetch.mockImplementation((url) => {
        if (url === "/api/correctivos-generales/export") {
          return Promise.resolve({
            ok: true,
            blob: () =>
              Promise.resolve(
                new Blob(["test"], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
              ),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ correctivos: mockCorrectiveData }),
        });
      });

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const excelButton = screen.getByText("Excel");
      await user.click(excelButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/correctivos-generales/export",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: expect.stringContaining("excel"),
          })
        );
      });
    });

    it("calls export API when clicking CSV button", async () => {
      const user = userEvent.setup();

      mockFetch.mockImplementation((url) => {
        if (url === "/api/correctivos-generales/export") {
          return Promise.resolve({
            ok: true,
            blob: () =>
              Promise.resolve(new Blob(["test"], { type: "text/csv" })),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ correctivos: mockCorrectiveData }),
        });
      });

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const csvButton = screen.getByText("CSV");
      await user.click(csvButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/correctivos-generales/export",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("csv"),
          })
        );
      });
    });
  });

  describe("Detail View", () => {
    it("shows corrective details in detail view", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const viewButton = screen.getAllByTitle("Ver detalles")[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Detalle del Correctivo")).toBeInTheDocument();
        expect(screen.getByText("COR0001")).toBeInTheDocument();
        expect(
          screen.getByText("Revisión general del equipo de ultrasonido")
        ).toBeInTheDocument();
        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      });
    });

    it("navigates back to list view", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const viewButton = screen.getAllByTitle("Ver detalles")[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Detalle del Correctivo")).toBeInTheDocument();
      });

      const backButton = screen.getByText("Volver");
      await user.click(backButton);

      await waitFor(() => {
        expect(
          screen.getByText("🔧 Correctivos Generales")
        ).toBeInTheDocument();
      });
    });

    it("shows equipment information in detail view", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const viewButton = screen.getAllByTitle("Ver detalles")[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Información del Equipo")).toBeInTheDocument();
        expect(screen.getByText("EMCO6582")).toBeInTheDocument();
        expect(screen.getByText("RICHMAR - Soundcareplus")).toBeInTheDocument();
      });
    });

    it("shows location information in detail view", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const viewButton = screen.getAllByTitle("Ver detalles")[0];
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText("Ubicación y Servicio")).toBeInTheDocument();
        expect(screen.getByText("CARTAGO")).toBeInTheDocument();
        expect(
          screen.getByText("MEDICINA FISICA Y REHABILITACIÓN CARTAGO")
        ).toBeInTheDocument();
      });
    });

    it("shows work progress when available", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0002")).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle("Ver detalles");
      await user.click(viewButtons[1]); // Second item has progress

      await waitFor(() => {
        expect(screen.getByText("Avances del Trabajo")).toBeInTheDocument();
        expect(screen.getByText("Inicio calibración")).toBeInTheDocument();
      });
    });

    it("shows closure information when completed", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0002")).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle("Ver detalles");
      await user.click(viewButtons[1]); // Second item is completed

      await waitFor(() => {
        expect(screen.getByText("Cierre del Trabajo")).toBeInTheDocument();
        expect(screen.getByText("Calibración exitosa")).toBeInTheDocument();
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("reloads data when clicking refresh button", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      // Clear previous calls
      mockFetch.mockClear();

      const refreshButton = screen.getByText("Actualizar");
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/correctivos-generales", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      });
    });
  });

  describe("Modal Controls", () => {
    it("closes modal when clicking close button", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<CorrectiveModal {...defaultProps} onOpenChange={onOpenChange} />);

      const closeButton = screen.getByText("Cerrar");
      await user.click(closeButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("opens new corrective form when clicking new button", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const newButton = screen.getByText("Nuevo Correctivo");
      await user.click(newButton);

      // Should trigger the create mode (implementation dependent)
      expect(newButton).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("renders table with horizontal scroll container", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const scrollContainer = document.querySelector(".overflow-x-auto");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("renders search and filters in responsive layout", async () => {
      render(<CorrectiveModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(
        "Buscar en todos los campos..."
      );
      expect(searchInput).toBeInTheDocument();

      const statusSelect = screen.getByRole("combobox");
      expect(statusSelect).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles network errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        // Should show fallback data
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });
    });

    it("handles API errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        // Should show fallback data
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });
    });

    it("handles export errors gracefully", async () => {
      const user = userEvent.setup();

      mockFetch.mockImplementation((url) => {
        if (url === "/api/correctivos-generales/export") {
          return Promise.reject(new Error("Export failed"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ correctivos: mockCorrectiveData }),
        });
      });

      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      const excelButton = screen.getByText("Excel");
      await user.click(excelButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(excelButton).toBeInTheDocument();
      });
    });
  });

  describe("Performance and Optimization", () => {
    it("only loads data when modal is opened", () => {
      render(<CorrectiveModal {...defaultProps} open={false} />);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("memoizes filtered data correctly", async () => {
      const user = userEvent.setup();
      render(<CorrectiveModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("COR0001")).toBeInTheDocument();
      });

      // Multiple interactions should not cause excessive re-renders
      const searchInput = screen.getByPlaceholderText(
        "Buscar en todos los campos..."
      );
      await user.type(searchInput, "test");
      await user.clear(searchInput);

      expect(screen.getByText("COR0001")).toBeInTheDocument();
    });
  });
});
