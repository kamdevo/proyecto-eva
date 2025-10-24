import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  X,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import Pagination from "@/components/common/Pagination";

export function ManualSearchModal({
  open,
  onOpenChange,
  onSelectManual,
  currentManualId = null,
}) {
  const [manuales, setManuales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedManual, setSelectedManual] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Cargar manuales
  const loadManuales = async (page = 1, search = "") => {
    try {
      setLoading(true);
      
      const params = {
        page,
        per_page: itemsPerPage,
        ...(search.trim() && { search: search.trim() })
      };

      const response = await httpService.get("/v1/manuales", { params });
      
      if (response.data?.success) {
        const data = response.data.data;
        setManuales(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error("Error al cargar manuales");
        setManuales([]);
      }
    } catch (error) {
      console.error("Error loading manuales:", error);
      toast.error("Error al cargar manuales");
      setManuales([]);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    if (open) {
      loadManuales(1, searchTerm);
      setSelectedManual(null);
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        loadManuales(1, searchTerm);
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadManuales(page, searchTerm);
  };

  const handleSelectManual = (manual) => {
    setSelectedManual(manual);
  };

  const handleConfirmSelection = () => {
    if (selectedManual && onSelectManual) {
      onSelectManual(selectedManual);
      toast.success(`Manual seleccionado: ${selectedManual.descripcion}`);
      onOpenChange(false);
    }
  };

  const handlePreviewManual = (manual) => {
    if (manual.url) {
      window.open(manual.url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("URL del manual no disponible");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleClose = () => {
    setSelectedManual(null);
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Buscar Manuales de Equipos
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center">
            Seleccione un manual para asociar al equipo
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filtros de Búsqueda */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Buscar Manual
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por descripción del manual..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Manual Seleccionado */}
          {selectedManual && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">
                      Manual Seleccionado
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      <span className="font-medium">ID:</span> {selectedManual.id}
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Descripción:</span>{" "}
                      {selectedManual.descripcion}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewManual(selectedManual)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de Manuales */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="overflow-auto h-full">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando manuales...</span>
                  </div>
                ) : manuales.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="w-4 h-4"></div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          URL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {manuales.map((manual) => (
                        <tr
                          key={manual.id}
                          onClick={() => handleSelectManual(manual)}
                          className={`cursor-pointer transition-colors ${
                            selectedManual?.id === manual.id
                              ? "bg-blue-50 border-blue-200"
                              : "hover:bg-gray-50"
                          } ${
                            currentManualId === manual.id
                              ? "bg-green-50 border-green-200"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedManual?.id === manual.id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedManual?.id === manual.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                            {manual.id}
                            {currentManualId === manual.id && (
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                Actual
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                              <span className="line-clamp-2">{manual.descripcion}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {manual.url ? (
                              <span className="text-blue-600 underline truncate block max-w-xs">
                                {manual.url}
                              </span>
                            ) : (
                              <span className="text-gray-400">Sin URL</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            {manual.url && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewManual(manual);
                                }}
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      {searchTerm ? "No se encontraron manuales" : "No hay manuales disponibles"}
                    </p>
                    {searchTerm && (
                      <p className="text-gray-400 text-sm mt-2">
                        Intente con otros términos de búsqueda
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                showInfo={true}
              />
            </div>
          )}
        </div>

        {/* Footer con Botones */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            {totalItems} manual{totalItems !== 1 ? "es" : ""} encontrado{totalItems !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-4"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedManual}
              className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Seleccionar Manual
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
