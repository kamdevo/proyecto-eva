import { Eye, Edit, Paperclip, FileText, Trash2, Files, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../hooks/useAuth.jsx";

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
  onDecommissionClick,
  equipmentType = "biomedical", // "biomedical" | "industrial"
  showCopyButton = true,
  showDecommissionButton = true,
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
          decommission: "Dar de Baja",
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
          decommission: "Dar de Baja",
        };
    }
  };

  const tooltips = getTooltips();
  const { canEdit, canDelete } = useAuth();
  
  const moduleName = equipmentType === "industrial" ? "equipos industriales" : "equipos";

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
        disabled={!canEdit(moduleName)}
        className={`bg-blue-500 hover:bg-blue-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 ${
          !canEdit(moduleName) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
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
        <FileText className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>

      {/* Upload Button */}
      <Button
        size="sm"
        disabled={!canEdit(moduleName)}
        className={`bg-orange-500 hover:bg-orange-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 ${
          !canEdit(moduleName) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={tooltips.upload}
        onClick={() => onUploadClick(equipment)}
      >
        <Paperclip className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>

      {/* Copy Button (conditional) */}
      {showCopyButton && onCopyClick && (
        <Button
          size="sm"
          disabled={!canEdit(moduleName)}
          className={`bg-green-500 hover:bg-green-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 ${
            !canEdit(moduleName) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={tooltips.copy}
          onClick={() => onCopyClick(equipment)}
        >
          <Files className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
        </Button>
      )}

      {/* Decommission Button (conditional) */}
      {showDecommissionButton && onDecommissionClick && equipment?.estado !== 'BAJA' && (
        <Button
          size="sm"
          disabled={!canEdit(moduleName)}
          className={`bg-yellow-500 hover:bg-yellow-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 ${
            !canEdit(moduleName) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={tooltips.decommission}
          onClick={() => onDecommissionClick(equipment)}
        >
          <UserX className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
        </Button>
      )}

      {/* Delete Button */}
      <Button
        size="sm"
        disabled={!canDelete(moduleName)}
        className={`bg-red-500 hover:bg-red-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 ${
          !canDelete(moduleName) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={tooltips.delete}
        onClick={() => onDeleteClick(equipment)}
      >
        <Trash2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
      </Button>
    </div>
  );
}
