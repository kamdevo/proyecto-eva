import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Componente compartido para mostrar información de resultados de equipos
 */
export function EquipmentResultsInfo({
  loading = false,
  devices = [],
  pagination = {},
  filters = {},
  activeFiltersCount = 0,
  equipmentType = "medical", // "medical" | "industrial"
  onClearAllFilters,
  className = "",
}) {
  const getEquipmentTypeLabel = () => {
    return equipmentType === "medical" ? "médicos" : "industriales";
  };

  return (
    <div
      className={`p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>
          {loading
            ? `Cargando equipos ${getEquipmentTypeLabel()}...`
            : filters.consulta_id
            ? devices.length > 0
              ? `✅ Equipo encontrado con ID: ${filters.consulta_id}`
              : `❌ No se encontró equipo con ID: ${filters.consulta_id}`
            : `Mostrando ${devices.length} de ${
                pagination.total || 0
              } equipos ${getEquipmentTypeLabel()}`}
          {activeFiltersCount > 0 && !filters.consulta_id && (
            <span className="ml-2 text-teal-600 font-medium">
              ({activeFiltersCount} filtro
              {activeFiltersCount !== 1 ? "s" : ""} activo
              {activeFiltersCount !== 1 ? "s" : ""})
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && onClearAllFilters && (
            <Button
              onClick={onClearAllFilters}
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar filtros
            </Button>
          )}
          <Badge
            variant="secondary"
            className="bg-teal-100 text-teal-800 text-xs w-fit"
          >
            Base de Datos Actualizada
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default EquipmentResultsInfo;
