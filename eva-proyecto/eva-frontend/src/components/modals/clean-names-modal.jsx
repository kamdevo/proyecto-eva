import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  RefreshCw,
  Eye,
  Database,
  TrendingUp,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export function CleanNamesModal({ open, onOpenChange }) {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]);
  const [newName, setNewName] = useState("");
  const [description, setDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [applying, setApplying] = useState(false);

  // Estados de filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [minCount, setMinCount] = useState(1);
  const [sortBy, setSortBy] = useState("count");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState(null);

  // Estados de UI
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadNameAnalysis();
    } else {
      // Reset cuando se cierra
      resetModal();
    }
  }, [open, currentPage, perPage, search, minCount, sortBy, sortDirection]);

  const resetModal = () => {
    setSelectedNames([]);
    setNewName("");
    setDescription("");
    setShowPreview(false);
    setPreviewData(null);
    setCurrentPage(1);
    setSearch("");
    setMinCount(1);
  };

  const loadNameAnalysis = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        per_page: perPage,
        search: search,
        min_count: minCount,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };

      console.log("🔍 Cargando análisis de nombres:", params);

      // Construir URL con parámetros
      const url = new URL(
        `${import.meta.env.VITE_API_URL || "http://192.168.56.1:8001/api"}/v1/equipos/debugging/name-analysis`
      );
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success) {
        setData(responseData.data.data || []);
        setStats(responseData.data.stats || {});
        setPagination(responseData.data.pagination || {});

        console.log("✅ Datos cargados:", {
          items: responseData.data.data?.length || 0,
          stats: responseData.data.stats,
          pagination: responseData.data.pagination,
        });
      } else {
        throw new Error(responseData.message || "Error al cargar datos");
      }
    } catch (error) {
      console.error("❌ Error cargando análisis:", error);

      // Fallback con datos de ejemplo si falla la API
      const fallbackData = [
        {
          name: "Monitor de Signos Vitales",
          count: 15,
          normalized_name: "Monitor De Signos Vitales",
          potential_duplicates: [],
          suggested_name: "Monitor de Signos Vitales",
          analysis: {
            has_special_chars: false,
            has_extra_spaces: false,
            is_mixed_case: false,
            length: 24,
            word_count: 4,
          },
        },
        {
          name: "MONITOR SIGNOS VITALES",
          count: 8,
          normalized_name: "Monitor Signos Vitales",
          potential_duplicates: [
            { name: "Monitor de Signos Vitales", count: 15 },
          ],
          suggested_name: "Monitor de Signos Vitales",
          analysis: {
            has_special_chars: false,
            has_extra_spaces: false,
            is_mixed_case: true,
            length: 21,
            word_count: 3,
          },
        },
        {
          name: "monitor signos vitales",
          count: 3,
          normalized_name: "Monitor Signos Vitales",
          potential_duplicates: [
            { name: "Monitor de Signos Vitales", count: 15 },
          ],
          suggested_name: "Monitor de Signos Vitales",
          analysis: {
            has_special_chars: false,
            has_extra_spaces: false,
            is_mixed_case: true,
            length: 21,
            word_count: 3,
          },
        },
      ];

      setData(fallbackData);
      setStats({
        total_equipment: 150,
        unique_names: 45,
        duplicate_names: 12,
        potential_issues: 8,
        cleanup_potential: 26.67,
        last_updated: new Date().toISOString(),
        error: "Usando datos de ejemplo - API no disponible",
      });
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 3,
        from: 1,
        to: 3,
      });

      toast.error("Error al cargar datos reales. Mostrando datos de ejemplo.", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de nombres
  const handleNameSelection = (name, checked) => {
    if (checked) {
      setSelectedNames([...selectedNames, name]);
    } else {
      setSelectedNames(selectedNames.filter((n) => n !== name));
    }
  };

  // Generar vista previa de cambios
  const generatePreview = async () => {
    if (selectedNames.length === 0) {
      toast.error("Seleccione al menos un nombre para cambiar");
      return;
    }

    if (!newName.trim()) {
      toast.error("Ingrese el nuevo nombre estándar");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://192.168.56.1:8001/api"}/v1/equipos/debugging/preview-changes`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selected_names: selectedNames,
            new_name: newName.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success) {
        setPreviewData(responseData.data);
        setShowPreview(true);
        toast.success("Vista previa generada exitosamente");
      } else {
        throw new Error(responseData.message || "Error generando vista previa");
      }
    } catch (error) {
      console.error("❌ Error generando vista previa:", error);

      // Fallback con vista previa simulada
      const mockPreview = {
        preview: selectedNames.map((oldName) => ({
          old_name: oldName,
          new_name: newName.trim(),
          affected_count: Math.floor(Math.random() * 10) + 1,
          equipment: [],
        })),
        summary: {
          total_names_to_change: selectedNames.length,
          total_equipment_affected: selectedNames.length * 5,
          new_standard_name: newName.trim(),
        },
      };

      setPreviewData(mockPreview);
      setShowPreview(true);

      toast.warning("Vista previa simulada - API no disponible", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar cambios
  const applyChanges = async () => {
    if (!previewData) {
      toast.error("Genere una vista previa primero");
      return;
    }

    try {
      setApplying(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://192.168.56.1:8001/api"}/v1/equipos/debugging/apply-cleaning`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selected_names: selectedNames,
            new_name: newName.trim(),
            description: description.trim(),
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        // Manejo específico de errores HTTP
        const errorMessage =
          responseData.message || `Error HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      if (responseData.success) {
        toast.success(`✅ Cambios aplicados exitosamente`, {
          description: `${responseData.data.updated_count} equipos actualizados`,
        });

        // Reset y recargar datos
        resetModal();
        loadNameAnalysis();
        setShowPreview(false);
      } else {
        throw new Error(responseData.message || "Error aplicando cambios");
      }
    } catch (error) {
      console.error("❌ Error aplicando cambios:", error);

      // Logging detallado para debugging
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        selectedNames,
        newName,
        description,
      });

      toast.error("Error al aplicar cambios", {
        description:
          error.message || "Error desconocido al procesar la solicitud",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <Database className="h-6 w-6" />
            Depuración y Limpieza de Nombres de Equipos
            {stats?.error && (
              <Badge variant="destructive" className="text-xs">
                Modo Demo
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Panel de estadísticas y controles */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Estadísticas */}
              <div className="flex items-center gap-6">
                {stats && (
                  <>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {stats.total_equipment} equipos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">
                        {stats.duplicate_names} nombres duplicados
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {stats.cleanup_potential}% potencial de limpieza
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="text-blue-600"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Estadísticas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-blue-600"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Instrucciones
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadNameAnalysis}
                  disabled={loading}
                  className="text-green-600"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Panel de instrucciones expandible */}
            {showInstructions && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  📋 Instrucciones de Uso
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    1. <strong>Revisar nombres:</strong> Identifique nombres
                    similares que representen el mismo equipo
                  </p>
                  <p>
                    2. <strong>Seleccionar variantes:</strong> Marque los
                    nombres que desea cambiar (deje sin marcar el nombre
                    estándar)
                  </p>
                  <p>
                    3. <strong>Definir nombre nuevo:</strong> Escriba el nombre
                    estándar que se aplicará
                  </p>
                  <p>
                    4. <strong>Vista previa:</strong> Revise los cambios antes
                    de aplicar
                  </p>
                  <p>
                    5. <strong>Aplicar cambios:</strong> Confirme para
                    actualizar todos los equipos seleccionados
                  </p>
                </div>
              </div>
            )}

            {/* Panel de estadísticas expandible */}
            {showStats && stats && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  📊 Estadísticas del Sistema
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">
                      Total Equipos:
                    </span>
                    <div className="text-lg font-bold text-green-800">
                      {stats.total_equipment}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">
                      Nombres Únicos:
                    </span>
                    <div className="text-lg font-bold text-green-800">
                      {stats.unique_names}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">
                      Nombres Duplicados:
                    </span>
                    <div className="text-lg font-bold text-green-800">
                      {stats.duplicate_names}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">
                      Problemas Potenciales:
                    </span>
                    <div className="text-lg font-bold text-green-800">
                      {stats.potential_issues}
                    </div>
                  </div>
                </div>
                {stats.error && (
                  <div className="mt-2 text-xs text-orange-600">
                    ⚠️ {stats.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtros y búsqueda */}
          <div className="px-6 py-3 bg-white border-b">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar nombres..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Mín. cantidad:</span>
                <Select
                  value={minCount.toString()}
                  onValueChange={(value) => setMinCount(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Mostrar:</span>
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => setPerPage(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">por página</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Ordenar:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Por cantidad</SelectItem>
                    <SelectItem value="name">Alfabético</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla de datos */}
          <div className="flex-1 overflow-visible">
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-600">
                      No se encontraron datos
                    </p>
                    <p className="text-sm text-gray-500">
                      Ajuste los filtros o verifique la conexión
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-x">
                  {/* Header de tabla */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm sticky top-0">
                    <div className="col-span-1 text-center">Sel.</div>
                    <div className="col-span-4">Nombre del Equipo</div>
                    <div className="col-span-1 text-center">Cant.</div>
                    <div className="col-span-3">Análisis</div>
                    <div className="col-span-3">Sugerencia</div>
                  </div>

                  {/* Filas de datos */}
                  {data.map((item, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors ${
                        selectedNames.includes(item.name)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      {/* Checkbox de selección */}
                      <div className="col-span-1 flex justify-center">
                        <Checkbox
                          checked={selectedNames.includes(item.name)}
                          onCheckedChange={(checked) =>
                            handleNameSelection(item.name, checked)
                          }
                        />
                      </div>

                      {/* Nombre del equipo */}
                      <div className="col-span-4">
                        <div className="font-medium">{item.name}</div>
                        {item.normalized_name !== item.name && (
                          <div className="text-xs text-gray-500 mt-1">
                            Normalizado: {item.normalized_name}
                          </div>
                        )}
                      </div>

                      {/* Cantidad */}
                      <div className="col-span-1 text-center">
                        <Badge
                          variant={item.count > 5 ? "default" : "secondary"}
                        >
                          {item.count}
                        </Badge>
                      </div>

                      {/* Análisis */}
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1">
                          {item.analysis?.has_special_chars && (
                            <Badge variant="destructive" className="text-xs">
                              Caracteres especiales
                            </Badge>
                          )}
                          {item.analysis?.has_extra_spaces && (
                            <Badge variant="destructive" className="text-xs">
                              Espacios extra
                            </Badge>
                          )}
                          {item.analysis?.is_mixed_case && (
                            <Badge variant="outline" className="text-xs">
                              Mayús/minús
                            </Badge>
                          )}
                          {item.potential_duplicates?.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {item.potential_duplicates.length} similares
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Sugerencia */}
                      <div className="col-span-3">
                        <div className="text-sm text-green-700 font-medium">
                          {item.suggested_name}
                        </div>
                        {item.potential_duplicates?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Similar a: {item.potential_duplicates[0]?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Información de paginación */}
          {pagination && (
            <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
              Mostrando {pagination.from || 0} al {pagination.to || 0} de{" "}
              {pagination.total || 0} registros
            </div>
          )}

          {/* Controles de paginación */}
          {pagination && pagination.last_page > 1 && (
            <div className="px-6 py-3 bg-white border-t">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>

                {Array.from(
                  { length: Math.min(5, pagination.last_page) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page ? "bg-blue-600 text-white" : ""
                        }
                      >
                        {page}
                      </Button>
                    );
                  }
                )}

                {pagination.last_page > 5 && (
                  <>
                    <span className="text-sm">...</span>
                    <span className="text-sm">{pagination.last_page}</span>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.last_page, currentPage + 1)
                    )
                  }
                  disabled={currentPage >= pagination.last_page}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Panel de acciones */}
        <div className="border-t bg-gray-50">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium">
                  Nombre Nuevo Estándar:
                </Label>
                <Input
                  placeholder="Ingrese el nombre estándar que se aplicará"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Descripción Adicional (Opcional):
                </Label>
                <Textarea
                  placeholder="Descripción adicional para los equipos"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            {/* Información de selección */}
            {selectedNames.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>{selectedNames.length} nombres seleccionados:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedNames.map((name, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <div className="flex gap-2">
              <Button
                onClick={generatePreview}
                disabled={
                  selectedNames.length === 0 || !newName.trim() || loading
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>

              {showPreview && (
                <Button
                  onClick={applyChanges}
                  disabled={applying}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {applying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aplicar Cambios
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>

        {/* Vista previa como sección inline */}
        {showPreview && previewData && (
          <div className="border-t bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Vista Previa de Cambios
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-4 text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumen de Cambios
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-700">
                    <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                      <div className="text-3xl font-bold text-green-800 mb-1">
                        {previewData.summary?.total_names_to_change || 0}
                      </div>
                      <div className="text-sm font-medium">
                        Nombres diferentes
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                      <div className="text-3xl font-bold text-green-800 mb-1">
                        {previewData.summary?.total_equipment_affected || 0}
                      </div>
                      <div className="text-sm font-medium">
                        Equipos afectados
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                      <div className="text-lg font-bold text-green-800 mb-1 truncate">
                        "{previewData.summary?.new_standard_name}"
                      </div>
                      <div className="text-sm font-medium">
                        Nuevo nombre estándar
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Cambios Detallados
                    </h4>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {previewData.preview?.map((change, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-red-600 font-medium line-through">
                                  {change.old_name}
                                </span>
                                <span className="text-gray-400 text-xl">→</span>
                                <span className="text-green-600 font-medium">
                                  {change.new_name}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Este cambio afectará a {change.affected_count}{" "}
                                equipo{change.affected_count !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="ml-4 px-3 py-1"
                            >
                              {change.affected_count} equipos
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Esta acción modificará permanentemente los nombres de los
                    equipos en la base de datos
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2"
                    >
                      Cancelar Vista Previa
                    </Button>
                    <Button
                      onClick={applyChanges}
                      disabled={applying}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                    >
                      {applying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirmar y Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
