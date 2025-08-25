import { Filter, Plus, FileSpreadsheet, Merge, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Componente reutilizable para botones de acciones principales
 * Funciona tanto para equipos biomédicos como industriales
 */
export function MainActionButtons({
  onFilterClick,
  onAddClick,
  onCleanNamesClick,
  onMergeClick,
  onClearFiltersClick,
  activeFiltersCount = 0,
  equipmentType = "biomedical", // "biomedical" | "industrial"
  showClearFilters = false,
}) {
  const getLabels = () => {
    switch (equipmentType) {
      case "industrial":
        return {
          filter: "Filtrar",
          add: "Registrar",
          clean: "Depurar",
          merge: "Fusionar",
        };
      case "biomedical":
      default:
        return {
          filter: "Filtrar",
          add: "Registrar",
          clean: "Depurar",
          merge: "Fusionar",
        };
    }
  };

  const labels = getLabels();

  return (
    <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
      <CardContent className="p-0.5 sm:p-1">
        <div className="flex gap-0.5">
          <Button
            onClick={onFilterClick}
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0 relative ${
              activeFiltersCount > 0 ? "bg-teal-600 hover:bg-teal-700" : ""
            }`}
          >
            <Filter className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
            <span className="truncate">{labels.filter}</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] bg-orange-500 text-white border-0 flex items-center justify-center"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters Button - only show when filters are active */}
          {showClearFilters && activeFiltersCount > 0 && (
            <Button
              onClick={onClearFiltersClick}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
            >
              <X className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
              <span className="truncate">Limpiar</span>
            </Button>
          )}

          <Button
            onClick={onAddClick}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
          >
            <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
            <span className="truncate">{labels.add}</span>
          </Button>

          <Button
            onClick={onCleanNamesClick}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
          >
            <FileSpreadsheet className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
            <span className="truncate">{labels.clean}</span>
          </Button>

          <Button
            onClick={onMergeClick}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
          >
            <Merge className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
            <span className="truncate">{labels.merge}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
