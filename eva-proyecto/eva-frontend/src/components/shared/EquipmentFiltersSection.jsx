import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import httpService from "@/services/httpService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/**
 * Componente compartido para los filtros de equipos (médicos e industriales)
 * Incluye búsqueda por ID, filtro de fecha, y filtros específicos
 */
export function EquipmentFiltersSection({
  filters,
  updateFilters,
  activeFiltersCount = 0,
  equipmentType = "medical", // "medical" | "industrial"
  className = "",
}) {
  // Estados locales para los inputs
  const [equipmentId, setEquipmentId] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sedes, setSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState("TODOS");

  // Cargar sedes dinámicamente desde la BD
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await httpService.get('/v1/sedes?per_page=100');
        if (response.data.success) {
          const sedesData = response.data.data;
          if (sedesData && Array.isArray(sedesData.data)) setSedes(sedesData.data);
          else if (Array.isArray(sedesData)) setSedes(sedesData);
        }
      } catch (error) {
        console.error('Error fetching sedes:', error);
      }
    };
    fetchSedes();
  }, []);

  // Aplicar filtro de sede cuando cambia la selección
  useEffect(() => {
    updateFilters({ sede_id: selectedSede === "TODOS" ? "" : selectedSede });
  }, [selectedSede]);

  // Sincronizar estados locales con filtros del hook
  useEffect(() => {
    setEquipmentId(filters.consulta_id || "");
    setDateFilter(filters.anio_plan || "");
  }, [filters]);

  // Manejar búsqueda por ID de equipo
  const handleEquipmentIdSearch = () => {
    const trimmedId = equipmentId.trim();

    // Validación mejorada
    if (trimmedId) {
      // Verificar que sea solo números
      if (!/^\d+$/.test(trimmedId)) {
        alert("Por favor ingrese un ID válido (solo números enteros)");
        return;
      }

      // Verificar que sea un número positivo
      const numericId = parseInt(trimmedId, 10);
      if (numericId <= 0) {
        alert("Por favor ingrese un ID válido (número mayor a 0)");
        return;
      }
    }

    console.log(
      `🔍 Frontend: Searching for ${equipmentType} equipment ID:`,
      trimmedId
    );

    if (trimmedId) {
      // Limpiar otros filtros cuando se busca por ID específico
      updateFilters({
        consulta_id: trimmedId,
        search: "", // Limpiar búsqueda general
        page: 1, // Resetear a primera página
      });
      console.log("✅ Frontend: Filter updated with consulta_id:", trimmedId);
    } else {
      updateFilters({ consulta_id: "" });
      console.log("🧹 Frontend: Cleared consulta_id filter");
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (value) => {
    setDateFilter(value);
    updateFilters({ anio_plan: value, page: 1 });
  };

  // Limpiar filtro específico
  const clearEquipmentIdFilter = () => {
    setEquipmentId("");
    updateFilters({ consulta_id: "" });
  };

  const clearDateFilter = () => {
    setDateFilter("");
    updateFilters({ anio_plan: "" });
  };

  return (
    <div
      className={`bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100 p-2 sm:p-3 md:p-4 lg:p-6 ${className}`}
    >
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">
            Panel de Control y Filtros
          </h2>
          <Badge
            variant="outline"
            className="bg-white/80 text-slate-700 border-slate-300 text-xs sm:text-sm w-fit"
          >
            Sistema Activo
          </Badge>
        </div>

        {/* Top Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
              Sede Hospitalaria:
            </span>
            <Select value={selectedSede} onValueChange={setSelectedSede}>
              <SelectTrigger className="w-28 sm:w-32 md:w-40 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas las Sedes</SelectItem>
                {sedes.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id.toString()}>
                    {sede.name || sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
              Consultar Equipo por ID:
            </span>
            <div className="flex gap-1 sm:gap-2 flex-1 min-w-0">
              <Input
                placeholder={`Ingrese ID del equipo ${
                  equipmentType === "medical" ? "médico" : "industrial"
                }`}
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleEquipmentIdSearch()
                }
                className="flex-1 min-w-0 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleEquipmentIdSearch}
                className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 bg-white/80 hover:bg-white"
                title="Buscar por ID"
              >
                <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-teal-600" />
              </Button>
              {equipmentId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearEquipmentIdFilter}
                  className="h-6 sm:h-7 md:h-8 px-1 text-slate-400 hover:text-slate-600"
                  title="Limpiar búsqueda por ID"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Período:
            </span>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-24 sm:w-28 md:w-32 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
              placeholder="Fecha inicio"
            />
            {dateFilter && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearDateFilter}
                className="h-6 sm:h-7 md:h-8 px-1 text-slate-400 hover:text-slate-600"
                title="Limpiar filtro de fecha"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentFiltersSection;
