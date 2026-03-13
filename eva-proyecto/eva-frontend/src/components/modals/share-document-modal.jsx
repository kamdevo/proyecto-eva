import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EquipmentPagination } from "@/components/equipment/EquipmentPagination";
import {
  Share2,
  Search,
  FileText,
  Building,
  MapPin,
  Wrench,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

export function ShareDocumentModal({
  open,
  onOpenChange,
  document: selectedDocument,
  sourceEquipment,
}) {
  // Estados del modal
  const [loading, setLoading] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sharing, setSharing] = useState(false);
  const [selectedEquipments, setSelectedEquipments] = useState(new Set());

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Cargar equipos al abrir el modal
  useEffect(() => {
    if (open) {
      loadEquipments();
      setSelectedEquipments(new Set());
    } else {
      // Resetear estado cuando se cierra el modal
      setEquipments([]);
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
      setSearchTerm("");
    }
  }, [open, currentPage, pageSize, searchTerm]);

  const loadEquipments = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        per_page: pageSize,
      };

      // Agregar filtros de búsqueda si existen
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await httpService.get('/v1/equipos/medical-devices-complete', { params });

      if (response.data.success) {
        // Los equipos están en response.data.data.data
        const equipmentData = Array.isArray(response.data.data?.data) ? response.data.data.data : [];

        // La paginación está en response.data.data
        const paginationData = response.data.data || {};
        const pagination = {
          current_page: paginationData.current_page || 1,
          last_page: paginationData.last_page || 1,
          total: paginationData.total || 0,
          per_page: paginationData.per_page || 10,
          from: paginationData.from || 0,
          to: paginationData.to || 0
        };

        // Usar equipmentData encontrado
        setEquipments(equipmentData);
        setTotalPages(pagination.last_page || 1);
        setTotalItems(pagination.total || 0);
      } else {
        toast.error("Error al cargar equipos");
        setEquipments([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error cargando equipos:", error);
      toast.error("Error al cargar equipos");
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadEquipments();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleEquipmentToggle = (equipmentId) => {
    const newSelected = new Set(selectedEquipments);
    if (newSelected.has(equipmentId)) {
      newSelected.delete(equipmentId);
    } else {
      newSelected.add(equipmentId);
    }
    setSelectedEquipments(newSelected);
  };

  const handleSelectAll = () => {
    if (!Array.isArray(equipments)) return;

    if (selectedEquipments.size === equipments.length) {
      setSelectedEquipments(new Set());
    } else {
      setSelectedEquipments(new Set(equipments.map(eq => eq.id)));
    }
  };

  const handleShareDocument = async () => {
    if (selectedEquipments.size === 0) {
      toast.error("Seleccione al menos un equipo para compartir el documento");
      return;
    }

    try {
      setSharing(true);
      const promises = Array.from(selectedEquipments).map(equipmentId =>
        httpService.post(
          `/v1/equipos/${sourceEquipment.id}/documents/${selectedDocument.id}/share`,
          { target_equipment_id: equipmentId }
        )
      );

      const results = await Promise.allSettled(promises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Documento compartido exitosamente con ${successful} equipo(s)`);
      }

      if (failed > 0) {
        toast.error(`Error al compartir con ${failed} equipo(s)`);
      }

      if (successful > 0) {
        onOpenChange(false);
        setSelectedEquipments(new Set());
      }
    } catch (error) {
      console.error("Error compartiendo documento:", error);
      toast.error("Error al compartir documento");
    } finally {
      setSharing(false);
    }
  };

  const safeRenderText = (value, fallback = "Sin información") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.nombre) return value.nombre;
    return String(value);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[1400px] max-h-[95vh] overflow-auto"
        style={{ width: "98vw", maxWidth: "1400px", maxHeight: "95vh", overflow: "auto" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-blue-700">
            <Share2 className="h-5 w-5" />
            Compartir Documento con Equipos
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[80vh]">
          {/* Información del documento */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">
                  {selectedDocument?.archivo || "Documento"}
                </h3>
                <p className="text-sm text-blue-700">
                  Equipo origen: {sourceEquipment?.name || "Sin nombre"}
                  {sourceEquipment?.code && ` (${sourceEquipment.code})`}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros de búsqueda */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Buscador General (Nombre, Serie o ID):
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, serie, código de equipo o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Equipos
                </Button>
                <Button variant="outline" onClick={handleClearSearch} title="Limpiar búsqueda">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla de equipos */}
          <div className="flex-1 overflow-hidden">
            <div className="bg-white rounded-lg border">
              {/* Header con selección */}
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={Array.isArray(equipments) && equipments.length > 0 && selectedEquipments.size === equipments.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium">
                    Seleccionar todos ({selectedEquipments.size} seleccionados)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {totalItems} equipos disponibles
                  </Badge>
                  {totalPages > 1 && (
                    <Badge variant="outline">
                      Página {currentPage} de {totalPages}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-auto max-h-[500px]">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando equipos...</span>
                  </div>
                ) : !Array.isArray(equipments) || equipments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No se encontraron equipos</p>
                    <p className="text-sm">Intente con otros criterios de búsqueda</p>
                    <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded">
                      <p><strong>Debug Info:</strong></p>
                      <p>equipments type: {typeof equipments}</p>
                      <p>equipments isArray: {String(Array.isArray(equipments))}</p>
                      <p>equipments length: {equipments?.length || 'N/A'}</p>
                      <p>loading: {String(loading)}</p>
                      <p>totalItems: {totalItems}</p>
                      <p>totalPages: {totalPages}</p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Seleccionar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Serie
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Marca
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Modelo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sede
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Servicio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Área
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Soporte Adquisición
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(equipments) && equipments.map((equipment) => (
                        <tr
                          key={equipment.id}
                          className={`hover:bg-gray-50 transition-colors ${selectedEquipments.has(equipment.id) ? 'bg-blue-50' : ''
                            }`}
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedEquipments.has(equipment.id)}
                              onCheckedChange={() => handleEquipmentToggle(equipment.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {safeRenderText(equipment.equipo?.name)}
                            </div>
                            <div className="text-sm text-gray-500">ID: {equipment.id}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <Badge variant="outline" className="text-xs">
                              {safeRenderText(equipment.equipo?.code)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {safeRenderText(equipment.equipo?.series)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {safeRenderText(equipment.equipo?.brand)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {safeRenderText(equipment.equipo?.model)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-gray-400" />
                              {safeRenderText(equipment.ubicacion?.sede)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Wrench className="h-3 w-3 text-gray-400" />
                              {safeRenderText(equipment.ubicacion?.servicio)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {safeRenderText(equipment.ubicacion?.area)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {safeRenderText(equipment.propietario?.nombre)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4">
              <EquipmentPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                perPage={pageSize}
                loading={loading}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
                onPageSizeChange={(newSize) => {
                  setPageSize(parseInt(newSize));
                  setCurrentPage(1);
                }}
                showingFrom={totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                showingTo={Math.min(currentPage * pageSize, totalItems)}
                equipmentType="general"
              />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedEquipments.size} equipo(s) seleccionado(s)
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleShareDocument}
                disabled={selectedEquipments.size === 0 || sharing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sharing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Compartiendo...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir ({selectedEquipments.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
