import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Componente reutilizable para paginación de equipos
 * Funciona tanto para equipos biomédicos como industriales
 */
export function EquipmentPagination({
  currentPage,
  totalPages,
  totalItems,
  showingFrom,
  showingTo,
  perPage,
  loading,
  onPageChange,
  onPageSizeChange,
  equipmentType = "biomedical", // "biomedical" | "industrial"
}) {
  const getLabels = () => {
    switch (equipmentType) {
      case "industrial":
        return {
          showing: "equipos industriales por página",
          results: "equipos industriales",
        };
      case "general":
        return {
          showing: "equipos por página",
          results: "equipos",
        };
      case "biomedical":
      default:
        return {
          showing: "equipos médicos por página",
          results: "equipos médicos",
        };
    }
  };

  const labels = getLabels();

  return (
    <>
      {/* Results Info */}
      <div className="p-4 text-sm text-slate-600 border-t bg-slate-50">
        <div className="flex items-center justify-between">
          <span>
            {loading ? (
              `Cargando ${labels.results}...`
            ) : totalItems === 0 ? (
              `No se encontraron ${labels.results}`
            ) : (
              `Mostrando ${labels.results}: ${showingFrom} a ${showingTo} de ${totalItems} registros`
            )}
            {totalPages > 1 && (
              <span className="text-slate-500 ml-2">
                (Página {currentPage} de {totalPages})
              </span>
            )}
          </span>
          <span className="text-xs text-slate-500">
            Última actualización: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">Mostrar</span>
          <Select value={perPage?.toString() || "10"} onValueChange={onPageSizeChange}>
            <SelectTrigger className="w-16 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-700">{labels.showing}</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || loading}
            >
              ««
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              Anterior
            </Button>

            {/* Page Numbers */}
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

              // Adjust start if we're near the end
              if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    className={`h-8 px-3 text-sm ${
                      i === currentPage
                        ? "bg-teal-600 hover:bg-teal-700"
                        : ""
                    }`}
                    onClick={() => onPageChange(i)}
                    disabled={loading}
                  >
                    {i}
                  </Button>
                );
              }

              return pages;
            })()}

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              Siguiente
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || loading}
            >
              »»
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
