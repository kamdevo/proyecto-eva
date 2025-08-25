import { Eye, Edit, Paperclip, FileText, Trash2, Files } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Componente reutilizable para botones de acciones por fila de equipo
 * Funciona tanto para equipos biomédicos como industriales
 */
export function RowActionButtons({
  equipment,
  onViewClick,
  onEditClick,
  onDocumentsClick,
  onUploadClick,
  onDeleteClick,
  onCopyClick,
  equipmentType = "biomedical", // "biomedical" | "industrial"
  showCopyButton = true,
}) {
  const getTooltips = () => {
    switch (equipmentType) {
      case "industrial":
        return {
          view: "Consultar Equipo Industrial",
          edit: "Editar Información",
          documents: "Documentos Técnicos",
          upload: "Cargar Documentos",
          delete: "Eliminar Equipo",
          copy: "Copiar Equipo",
        };
      case "biomedical":
      default:
        return {
          view: "Consultar Equipo Médico",
          edit: "Editar Información",
          documents: "Documentos Técnicos",
          upload: "Cargar Documentos",
          delete: "Eliminar Equipo",
          copy: "Copiar Equipo",
        };
    }
  };

  const tooltips = getTooltips();

  return (
    <div className="flex flex-col gap-0.5 xs:gap-1">
      {/* View Button */}
      <Button
        size="sm"
        className="bg-cyan-500 hover:bg-cyan-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
        title={tooltips.view}
        onClick={() => onViewClick(equipment)}
      >
        <Eye className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>

      {/* Edit Button */}
      <Button
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
        title={tooltips.edit}
        onClick={() => onEditClick(equipment)}
      >
        <Edit className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>

      {/* Documents Button */}
      <Button
        size="sm"
        className="bg-purple-500 hover:bg-purple-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
        title={tooltips.documents}
        onClick={() => onDocumentsClick(equipment)}
      >
        <Paperclip className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>

      {/* Upload Button */}
      <Button
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
        title={tooltips.upload}
        onClick={() => onUploadClick(equipment)}
      >
        <FileText className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>

      {/* Copy Button (conditional) */}
      {showCopyButton && onCopyClick && (
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
          title={tooltips.copy}
          onClick={() => onCopyClick(equipment)}
        >
          <Files className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
        </Button>
      )}

      {/* Delete Button */}
      <Button
        size="sm"
        className="bg-red-500 hover:bg-red-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
        title={tooltips.delete}
        onClick={() => onDeleteClick(equipment)}
      >
        <Trash2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>
    </div>
  );
}
