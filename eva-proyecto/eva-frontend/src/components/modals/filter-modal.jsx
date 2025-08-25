import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Download, Filter, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export function FilterModal({
  open,
  onOpenChange,
  onFiltersApply,
  onFiltersClear,
  currentFilters = {},
  equipmentType = "biomedical", // "biomedical" | "industrial"
}) {
  // Estados para filtros
  const [filters, setFilters] = useState({
    // Sección 1: Identificación del Equipo
    filtro_code: "",
    filtro_name: "",
    filtro_serial: "",
    filtro_marca: "",
    filtro_modelo: "",

    // Sección 2: Ubicación Geográfica
    filtro_zona: "",
    servicio_id_auxiliar: "",
    area_id_auxiliar: "",

    // Sección 3: Estado y Operación
    filtro_estadoequipo_id: "",
    filtro_estadom: "",
    proveedor_mantenimiento: "",

    // Sección 4: Clasificación Técnica
    tipo_id: "",
    estado_id: "",
    estado_id_cg: "",

    // Sección 5: Parámetros Temporales
    anio_plan: new Date().getFullYear(),
    consulta_id: "",
  });

  // Estados para opciones de filtros
  const [filterOptions, setFilterOptions] = useState({
    sedes: [],
    servicios: [],
    areas: [],
    estados: [],
    clasificaciones: [],
    riesgos: [],
    propietarios: [],
    tipos_equipos: [],
    proveedores: [],
    estados_mantenimiento: [
      { id: 1, name: "Pendiente" },
      { id: 2, name: "Realizado" },
      { id: 3, name: "Atrasado" },
      { id: 4, name: "No definido" },
      { id: 5, name: "Frecuencia no definida" },
      { id: 6, name: "Programado" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  // Cargar opciones de filtros al abrir el modal
  useEffect(() => {
    if (open) {
      loadFilterOptions();
      // Inicializar con filtros actuales si existen
      if (Object.keys(currentFilters).length > 0) {
        setFilters((prev) => ({ ...prev, ...currentFilters }));
      }
    }
  }, [open, currentFilters]);

  // Función para cargar opciones de filtros
  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/equipos/filter-options");

      if (response.data.success) {
        setFilterOptions((prev) => ({
          ...prev,
          ...response.data.data,
        }));
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
      toast.error("Error al cargar opciones de filtros");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios en filtros
  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value };

      // Lógica de filtros dependientes
      if (field === "filtro_zona") {
        // Limpiar servicio y área cuando cambia la zona
        newFilters.servicio_id_auxiliar = "all";
        newFilters.area_id_auxiliar = "all";
      } else if (field === "servicio_id_auxiliar") {
        // Limpiar área cuando cambia el servicio
        newFilters.area_id_auxiliar = "all";
      }

      return newFilters;
    });
  };

  // Función para aplicar filtros
  const handleApplyFilters = () => {
    // Filtrar campos vacíos y valores "all"
    const activeFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          value !== "all"
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    onFiltersApply(activeFilters);
    toast.success(
      `Filtros aplicados: ${Object.keys(activeFilters).length} criterios`
    );
    onOpenChange(false);
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    const clearedFilters = {
      filtro_code: "",
      filtro_name: "",
      filtro_serial: "",
      filtro_marca: "",
      filtro_modelo: "",
      filtro_zona: "all",
      servicio_id_auxiliar: "all",
      area_id_auxiliar: "all",
      filtro_estadoequipo_id: "all",
      filtro_estadom: "all",
      proveedor_mantenimiento: "all",
      tipo_id: "all",
      estado_id: "all",
      estado_id_cg: "all",
      anio_plan: new Date().getFullYear(),
      consulta_id: "",
    };

    setFilters(clearedFilters);

    // Llamar al callback del componente padre si existe
    if (onFiltersClear) {
      onFiltersClear();
    }

    toast.success("Filtros limpiados");
  };

  // Función para exportar resultados
  const handleExport = async () => {
    try {
      setLoadingExport(true);
      toast.loading("Generando exportación...", { id: "export" });

      // Filtrar campos vacíos y valores "all" para la exportación
      const activeFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (
            value !== "" &&
            value !== null &&
            value !== undefined &&
            value !== "all"
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const response = await axios.post(
        "/api/v1/equipos/export",
        activeFilters,
        {
          responseType: "blob",
        }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `equipos_filtrados_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportación completada", { id: "export" });
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Error al exportar datos", { id: "export" });
    } finally {
      setLoadingExport(false);
    }
  };

  // Filtrar servicios por zona seleccionada
  const filteredServicios = filterOptions.servicios.filter(
    (servicio) =>
      !filters.filtro_zona ||
      filters.filtro_zona === "all" ||
      servicio.sede_id === parseInt(filters.filtro_zona)
  );

  // Filtrar áreas por servicio seleccionado
  const filteredAreas = filterOptions.areas.filter(
    (area) =>
      !filters.servicio_id_auxiliar ||
      filters.servicio_id_auxiliar === "all" ||
      area.servicio_id === parseInt(filters.servicio_id_auxiliar)
  );

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (value) =>
      value !== "" &&
      value !== null &&
      value !== undefined &&
      value !== "all" &&
      value !== new Date().getFullYear()
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl min-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados de Equipos{" "}
              {equipmentType === "industrial" ? "Industriales" : "Biomédicos"}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} activos
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-2 sm:p-3 md:p-4">
          {/* Botones de Acción */}
          <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loadingExport}
              >
                <Download className="h-4 w-4 mr-2" />
                {loadingExport ? "Exportando..." : "Exportar Excel"}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtros activos`
                : "Sin filtros aplicados"}
            </div>
          </div>

          {/* SECCIÓN 1: IDENTIFICACIÓN DEL EQUIPO */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
              📋 Identificación del Equipo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filtro_code" className="text-sm font-medium">
                  Código de Inventario:
                </Label>
                <Input
                  id="filtro_code"
                  value={filters.filtro_code}
                  onChange={(e) =>
                    handleFilterChange("filtro_code", e.target.value)
                  }
                  placeholder="Código único institucional"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filtro_name" className="text-sm font-medium">
                  Nombre del Equipo:
                </Label>
                <Input
                  id="filtro_name"
                  value={filters.filtro_name}
                  onChange={(e) =>
                    handleFilterChange("filtro_name", e.target.value)
                  }
                  placeholder="Denominación del dispositivo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filtro_serial" className="text-sm font-medium">
                  Número de Serie:
                </Label>
                <Input
                  id="filtro_serial"
                  value={filters.filtro_serial}
                  onChange={(e) =>
                    handleFilterChange("filtro_serial", e.target.value)
                  }
                  placeholder="Serie del fabricante"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filtro_marca" className="text-sm font-medium">
                  Marca/Fabricante:
                </Label>
                <Input
                  id="filtro_marca"
                  value={filters.filtro_marca}
                  onChange={(e) =>
                    handleFilterChange("filtro_marca", e.target.value)
                  }
                  placeholder="Empresa manufacturera"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filtro_modelo" className="text-sm font-medium">
                  Modelo:
                </Label>
                <Input
                  id="filtro_modelo"
                  value={filters.filtro_modelo}
                  onChange={(e) =>
                    handleFilterChange("filtro_modelo", e.target.value)
                  }
                  placeholder="Modelo específico"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: UBICACIÓN GEOGRÁFICA */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
              📍 Ubicación Geográfica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filtro_zona" className="text-sm font-medium">
                  Zona/Sede:
                </Label>
                <Select
                  value={filters.filtro_zona}
                  onValueChange={(value) =>
                    handleFilterChange("filtro_zona", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar sede..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las sedes</SelectItem>
                    {filterOptions.sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="servicio_id_auxiliar"
                  className="text-sm font-medium"
                >
                  Servicio Médico:
                </Label>
                <Select
                  value={filters.servicio_id_auxiliar}
                  onValueChange={(value) =>
                    handleFilterChange("servicio_id_auxiliar", value)
                  }
                  disabled={
                    !filters.filtro_zona || filters.filtro_zona === "all"
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar servicio..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    {filteredServicios.map((servicio) => (
                      <SelectItem
                        key={servicio.id}
                        value={servicio.id.toString()}
                      >
                        {servicio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="area_id_auxiliar"
                  className="text-sm font-medium"
                >
                  Área Específica:
                </Label>
                <Select
                  value={filters.area_id_auxiliar}
                  onValueChange={(value) =>
                    handleFilterChange("area_id_auxiliar", value)
                  }
                  disabled={
                    !filters.servicio_id_auxiliar ||
                    filters.servicio_id_auxiliar === "all"
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar área..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las áreas</SelectItem>
                    {filteredAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ESTADO Y OPERACIÓN */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
              ⚙️ Estado y Operación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="filtro_estadoequipo_id"
                  className="text-sm font-medium"
                >
                  Estado del Equipo:
                </Label>
                <Select
                  value={filters.filtro_estadoequipo_id}
                  onValueChange={(value) =>
                    handleFilterChange("filtro_estadoequipo_id", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {filterOptions.estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filtro_estadom" className="text-sm font-medium">
                  Estado de Mantenimiento:
                </Label>
                <Select
                  value={filters.filtro_estadom}
                  onValueChange={(value) =>
                    handleFilterChange("filtro_estadom", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {filterOptions.estados_mantenimiento.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="proveedor_mantenimiento"
                  className="text-sm font-medium"
                >
                  Proveedor de Mantenimiento:
                </Label>
                <Select
                  value={filters.proveedor_mantenimiento}
                  onValueChange={(value) =>
                    handleFilterChange("proveedor_mantenimiento", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proveedores</SelectItem>
                    {filterOptions.proveedores.map((proveedor) => (
                      <SelectItem
                        key={proveedor.id}
                        value={proveedor.id.toString()}
                      >
                        {proveedor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: CLASIFICACIÓN TÉCNICA */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
              🔧 Clasificación Técnica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tipo_id" className="text-sm font-medium">
                  Tipo de Equipo:
                </Label>
                <Select
                  value={filters.tipo_id}
                  onValueChange={(value) =>
                    handleFilterChange("tipo_id", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {filterOptions.tipos_equipos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estado_id" className="text-sm font-medium">
                  Clasificación de Riesgo:
                </Label>
                <Select
                  value={filters.estado_id}
                  onValueChange={(value) =>
                    handleFilterChange("estado_id", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar riesgo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Todas las clasificaciones
                    </SelectItem>
                    {filterOptions.riesgos.map((riesgo) => (
                      <SelectItem key={riesgo.id} value={riesgo.id.toString()}>
                        {riesgo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estado_id_cg" className="text-sm font-medium">
                  Propietario:
                </Label>
                <Select
                  value={filters.estado_id_cg}
                  onValueChange={(value) =>
                    handleFilterChange("estado_id_cg", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar propietario..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los propietarios</SelectItem>
                    {filterOptions.propietarios.map((propietario) => (
                      <SelectItem
                        key={propietario.id}
                        value={propietario.id.toString()}
                      >
                        {propietario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="anio_plan" className="text-sm font-medium">
                  Año del Plan:
                </Label>
                <Select
                  value={filters.anio_plan.toString()}
                  onValueChange={(value) =>
                    handleFilterChange("anio_plan", parseInt(value))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar año..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 10 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Resumen de Filtros Activos */}
          {activeFiltersCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Filtros Activos:
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (
                    value !== "" &&
                    value !== null &&
                    value !== undefined &&
                    value !== "all" &&
                    value !== new Date().getFullYear()
                  ) {
                    return (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key.replace("filtro_", "").replace("_", " ")}: {value}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() =>
                            handleFilterChange(
                              key,
                              key.includes("id") ? "all" : ""
                            )
                          }
                        />
                      </Badge>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {activeFiltersCount > 0
              ? `${activeFiltersCount} filtros configurados`
              : "Configure los filtros deseados"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-green-600 hover:bg-green-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
