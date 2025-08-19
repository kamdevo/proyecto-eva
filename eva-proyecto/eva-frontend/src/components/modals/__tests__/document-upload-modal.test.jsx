import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentUploadModal } from "../document-upload-modal";
import httpService from "@/services/httpService";
import { toast } from "sonner";

// Mock de dependencias
vi.mock("@/services/httpService");
vi.mock("sonner");

const mockEquipment = {
  id: 1,
  code: "EQ001",
  name: "Equipo de Prueba",
  serial: "SN123456",
};

const mockDocumentTypes = [
  { id: 1, name: "Manual de Usuario" },
  { id: 2, name: "Certificado de Calibración" },
  { id: 9, name: "Capacitación" },
  { id: 19, name: "Otro Documento" },
];

describe("DocumentUploadModal - Drag & Drop Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    httpService.get.mockResolvedValue({
      data: { success: true, data: mockDocumentTypes },
    });
  });

  it("debería renderizar el área de drag & drop correctamente", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Arrastra tu archivo aquí")).toBeInTheDocument();
      expect(
        screen.getByText("o haz clic para seleccionar")
      ).toBeInTheDocument();
      expect(screen.getByText("Formatos permitidos:")).toBeInTheDocument();
    });
  });

  it("debería cambiar la apariencia durante el drag over", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;

      // Simular drag over
      fireEvent.dragOver(dropZone);
      expect(screen.getByText("¡Suelta el archivo aquí!")).toBeInTheDocument();
    });
  });

  it("debería validar el tamaño del archivo (máximo 10MB)", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    // Crear un archivo grande (más de 10MB)
    const largeFile = new File(
      ["x".repeat(11 * 1024 * 1024)],
      "large-file.pdf",
      {
        type: "application/pdf",
      }
    );

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;

      // Simular drop con archivo grande
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [largeFile] },
      });
    });

    expect(toast.error).toHaveBeenCalledWith(
      "El archivo es demasiado grande. Máximo 10MB permitido."
    );
  });

  it("debería validar el tipo de archivo permitido", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    // Crear un archivo con tipo no permitido
    const invalidFile = new File(["content"], "test.exe", {
      type: "application/x-executable",
    });

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;

      // Simular drop con archivo inválido
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [invalidFile] },
      });
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Tipo de archivo no permitido. Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG o PNG."
    );
  });

  it("debería aceptar archivos válidos y mostrar información", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    // Crear un archivo válido
    const validFile = new File(["PDF content"], "test-document.pdf", {
      type: "application/pdf",
    });

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;

      // Simular drop con archivo válido
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [validFile] },
      });
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Archivo "test-document.pdf" seleccionado correctamente'
    );

    await waitFor(() => {
      expect(screen.getByText("✅ Archivo Seleccionado")).toBeInTheDocument();
      expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
      expect(screen.getByText("Remover")).toBeInTheDocument();
      expect(screen.getByText("Cambiar")).toBeInTheDocument();
    });
  });

  it("debería permitir remover el archivo seleccionado", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    // Crear un archivo válido
    const validFile = new File(["PDF content"], "test-document.pdf", {
      type: "application/pdf",
    });

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [validFile] },
      });
    });

    await waitFor(() => {
      const removeButton = screen.getByText("Remover");
      fireEvent.click(removeButton);
    });

    expect(toast.info).toHaveBeenCalledWith("Archivo removido");

    await waitFor(() => {
      expect(screen.getByText("Arrastra tu archivo aquí")).toBeInTheDocument();
    });
  });

  it("debería manejar el click en el área de drop para abrir el selector", async () => {
    const mockClick = vi.fn();

    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;

      // Mock del input file click
      const fileInput = dropZone.querySelector('input[type="file"]');
      fileInput.click = mockClick;

      fireEvent.click(dropZone);
    });

    expect(mockClick).toHaveBeenCalled();
  });

  it("debería mostrar información del equipo de manera compacta", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("🔧 Equipo de Prueba")).toBeInTheDocument();
      expect(
        screen.getByText("#1 | EQ001 | Serie: SN123456")
      ).toBeInTheDocument();
    });
  });
});

describe("DocumentUploadModal - Funcionalidad Empresarial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    httpService.get.mockResolvedValue({
      data: { success: true, data: mockDocumentTypes },
    });
  });

  it("debería validar campos obligatorios antes de subir", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    await waitFor(() => {
      const uploadButton = screen.getByText("Subir Documento");
      fireEvent.click(uploadButton);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Por favor selecciona un tipo de documento"
    );
  });

  it("debería requerir fecha y hora para capacitaciones", async () => {
    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={vi.fn()}
        equipment={mockEquipment}
        onDocumentUploaded={vi.fn()}
      />
    );

    await waitFor(() => {
      // Seleccionar tipo "Capacitación" (id: 9)
      const select = screen.getByRole("combobox");
      fireEvent.click(select);
    });

    await waitFor(() => {
      const capacitacionOption = screen.getByText("Capacitación");
      fireEvent.click(capacitacionOption);
    });

    // Agregar archivo válido
    const validFile = new File(["PDF content"], "capacitacion.pdf", {
      type: "application/pdf",
    });

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [validFile] },
      });
    });

    await waitFor(() => {
      const uploadButton = screen.getByText("Subir Documento");
      fireEvent.click(uploadButton);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Para capacitaciones, la fecha y hora son obligatorias"
    );
  });

  it("debería subir el documento exitosamente", async () => {
    const mockOnDocumentUploaded = vi.fn();
    const mockOnOpenChange = vi.fn();

    httpService.post.mockResolvedValue({
      data: {
        success: true,
        data: { id: 123, name: "documento-subido.pdf" },
      },
    });

    render(
      <DocumentUploadModal
        open={true}
        onOpenChange={mockOnOpenChange}
        equipment={mockEquipment}
        onDocumentUploaded={mockOnDocumentUploaded}
      />
    );

    // Seleccionar tipo de documento
    await waitFor(() => {
      const select = screen.getByRole("combobox");
      fireEvent.click(select);
    });

    await waitFor(() => {
      const manualOption = screen.getByText("Manual de Usuario");
      fireEvent.click(manualOption);
    });

    // Agregar archivo válido
    const validFile = new File(["PDF content"], "manual.pdf", {
      type: "application/pdf",
    });

    await waitFor(() => {
      const dropZone = screen
        .getByText("Arrastra tu archivo aquí")
        .closest("div").parentElement;
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [validFile] },
      });
    });

    await waitFor(() => {
      const uploadButton = screen.getByText("Subir Documento");
      fireEvent.click(uploadButton);
    });

    await waitFor(() => {
      expect(httpService.post).toHaveBeenCalledWith(
        `/v1/equipos/${mockEquipment.id}/upload-document`,
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    expect(toast.success).toHaveBeenCalledWith("Documento subido exitosamente");
    expect(mockOnDocumentUploaded).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
