"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit,
  Link,
  Plus,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import useBajas from "../hooks/useBajas";
import { API_CONFIG } from "../config/api";
import { toast } from "sonner";
import ModalAgregarBaja from "@/components/modals/agregar-baja-modal";
import ModalEditarDocumento from "@/components/modals/editar-baja-modal";
import ModalTablaEquipos from "@/components/modals/tabla-equipos-asociar";
import ModalEquiposAsociados from "@/components/modals/equipos-asociados-modal";

export default function EquiposBajas() {
  const { hasPermission, canCreate, canEdit, canDelete } = useAuth();
  const {
    loading,
    error,
    fetchBajas,
    deleteBaja,
    downloadDocument
  } = useBajas();

  const [bajas, setBajas] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBaja, setSelectedBaja] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isAgregarBajaModalOpen, setIsAgregarBajaModalOpen] = useState(false);
  const [isEditarBajaModalOpen, setIsEditarBajaModalOpen] = useState(false);
  const [isAsociarEquiposModalOpen, setIsAsociarEquiposModalOpen] = useState(false);
  const [isEquiposAsociadosModalOpen, setIsEquiposAsociadosModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Cargar bajas al montar el componente y cuando cambie la página o búsqueda
  useEffect(() => {
    const loadBajas = async () => {
      try {
        const result = await fetchBajas(currentPage, itemsPerPage, searchTerm);
        setBajas(result?.data || []);
        setPagination(result?.pagination || {
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1
        });
      } catch (error) {
        console.warn('Error loading bajas:', error);
        setBajas([]);
        setPagination({
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1
        });
      }
    };

    loadBajas();
  }, [currentPage, searchTerm]);

  // Usar datos directamente del backend (ya filtrados y paginados)
  const currentBajas = bajas;
  const totalPages = pagination.last_page;
  const startIndex = (pagination.current_page - 1) * pagination.per_page;
  const endIndex = Math.min(startIndex + pagination.per_page, pagination.total);

  const handleBajaClick = (baja) => {
    setSelectedBaja(baja);
    setIsDocumentModalOpen(true);
  };

  const handleDownloadDocument = async (baja) => {
    try {
      await downloadDocument(baja.id);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteBaja = async (bajaId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta baja?')) {
      return;
    }

    const toastId = `delete-baja-${bajaId}`;
    try {
      toast.loading('Eliminando baja...', { id: toastId });
      await deleteBaja(bajaId);
      toast.success('Baja eliminada exitosamente', { id: toastId });
      // El hook useBajas.js debería actualizar la lista o el componente padre debería refrescar
      fetchBajas(currentPage, itemsPerPage, searchTerm).then(result => {
        setBajas(result?.data || []);
        setPagination(result?.pagination || pagination);
      });
    } catch (error) {
      toast.error(error.message || 'Error al eliminar la baja', { id: toastId });
    }
  };

  const handleViewAssociatedEquipment = (baja) => {
    setSelectedBaja(baja);
    setIsEquiposAsociadosModalOpen(true);
  };

  const handleViewDocument = (fileName) => {
    if (!fileName) return;

    // Obtener la URL base del backend desde la configuración
    const backendUrl = window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "";

    // Extraer solo el nombre del archivo (quitar cualquier ruta que venga de la base de datos)
    const pureFileName = fileName.split('/').pop();

    // Construir URL absoluta forzando la ruta requerida
    const documentUrl = `${backendUrl}/storage/equipos/bajas/${pureFileName}`;

    // Abrir documento en nueva ventana
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      console.error('No se pudo abrir el documento. Verifique que no esté bloqueando ventanas emergentes.');
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2
        );
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Final disposition
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Administre y supervise todos los registros del sistema
          </p>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Bajas
          </label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por descripción, motivo o ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full sm:w-80"
            />
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Records Count and Loading */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? (
              "Cargando..."
            ) : (
              `Mostrando registros de ${startIndex + 1} a ${endIndex} de un total de ${pagination.total} registros`
            )}
          </p>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-start">
          {canCreate('bajas') && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={() => setIsAgregarBajaModalOpen(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agregar baja</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Fecha Baja
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Archivo
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Cargando bajas...
                    </td>
                  </tr>
                ) : currentBajas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No se encontraron bajas que coincidan con la búsqueda' : 'No hay bajas registradas'}
                    </td>
                  </tr>
                ) : (
                  currentBajas.map((baja, index) => (
                    <tr
                      key={baja.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {baja.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {baja.fecha_baja ? new Date(baja.fecha_baja).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                        <div className="line-clamp-2">{baja.descripcion || baja.motivo || 'Sin descripción'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {baja.archivo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(baja.archivo)}
                            className="text-green-600 hover:bg-green-50"
                            title="Ver documento de baja"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Ver Archivo
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin archivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBajaClick(baja)}
                            className="p-2 hover:bg-blue-50 rounded-full"
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5 text-blue-600" />
                          </Button>

                          {baja.documento && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(baja)}
                              className="p-2 hover:bg-green-50 rounded-full"
                              title="Descargar documento"
                            >
                              <Download className="h-5 w-5 text-green-600" />
                            </Button>
                          )}

                          {canEdit('bajas') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBaja(baja);
                                setIsEditarBajaModalOpen(true);
                              }}
                              className="p-2 hover:bg-yellow-50 rounded-full"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5 text-yellow-600" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBaja(baja);
                              setIsAsociarEquiposModalOpen(true);
                            }}
                            className="p-2 hover:bg-purple-50 rounded-full"
                            title="Asociar equipos"
                          >
                            <Link className="h-5 w-5 text-purple-600" />
                          </Button>

                          {canDelete('bajas') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBaja(baja.id)}
                              className="p-2 hover:bg-red-50 rounded-full"
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando bajas...
            </div>
          ) : currentBajas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron bajas que coincidan con la búsqueda' : 'No hay bajas registradas'}
            </div>
          ) : (
            currentBajas.map((baja) => (
              <div
                key={baja.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="font-medium text-gray-900">ID: {baja.id}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBajaClick(baja)}
                      className="p-2 hover:bg-blue-50 rounded-full"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>

                    {baja.documento && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(baja)}
                        className="p-2 hover:bg-green-50 rounded-full"
                        title="Descargar documento"
                      >
                        <Download className="h-4 w-4 text-green-600" />
                      </Button>
                    )}

                    {canEdit('bajas') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBaja(baja);
                          setIsEditarBajaModalOpen(true);
                        }}
                        className="p-2 hover:bg-yellow-50 rounded-full"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-yellow-600" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBaja(baja);
                        setIsAsociarEquiposModalOpen(true);
                      }}
                      className="p-2 hover:bg-purple-50 rounded-full"
                      title="Asociar equipos"
                    >
                      <Link className="h-4 w-4 text-purple-600" />
                    </Button>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-xs text-gray-500">Fecha:</span>
                  <span className="text-sm text-gray-700 ml-1">
                    {baja.fecha_baja ? new Date(baja.fecha_baja).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {baja.descripcion || baja.motivo || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewAssociatedEquipment(baja)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Equipos ({baja.equipos_count || 0})
                  </Button>

                  {canDelete('bajas') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBaja(baja.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="hidden sm:flex"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="sm:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {renderPagination().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 p-0 ${currentPage === page
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-gray-100"
                    }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="hidden sm:flex"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="sm:hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalles de Baja - {selectedBaja?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedBaja && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedBaja.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Baja
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedBaja.fecha_baja ? new Date(selectedBaja.fecha_baja).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-sm min-h-[100px]">
                  {selectedBaja.descripcion || 'Sin descripción'}
                </div>
              </div>

              {selectedBaja.motivo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedBaja.motivo}
                  </div>
                </div>
              )}

              {selectedBaja.observaciones && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedBaja.observaciones}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDocumentModalOpen(false)}
                >
                  Cerrar
                </Button>
                {selectedBaja.documento && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleDownloadDocument(selectedBaja)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Documento
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <ModalAgregarBaja
        open={isAgregarBajaModalOpen}
        onOpenChange={setIsAgregarBajaModalOpen}
        onSuccess={() => {
          // Recargar datos después de agregar
          const loadBajas = async () => {
            try {
              const result = await fetchBajas(currentPage, itemsPerPage, searchTerm);
              setBajas(result?.data || []);
              setPagination(result?.pagination || pagination);
            } catch (error) {
              console.warn('Error reloading bajas:', error);
            }
          };
          loadBajas();
          setIsAgregarBajaModalOpen(false);
        }}
      />
      <ModalEditarDocumento
        open={isEditarBajaModalOpen}
        onOpenChange={setIsEditarBajaModalOpen}
        baja={selectedBaja}
        onSuccess={() => {
          // Recargar datos después de editar
          const loadBajas = async () => {
            try {
              const result = await fetchBajas(currentPage, itemsPerPage, searchTerm);
              setBajas(result?.data || []);
              setPagination(result?.pagination || pagination);
            } catch (error) {
              console.warn('Error reloading bajas:', error);
            }
          };
          loadBajas();
          setIsEditarBajaModalOpen(false);
        }}
      />
      <ModalTablaEquipos
        open={isAsociarEquiposModalOpen}
        onOpenChange={setIsAsociarEquiposModalOpen}
        baja={selectedBaja}
        onSuccess={() => {
          // Recargar datos después de asociar equipos
          const loadBajas = async () => {
            try {
              const result = await fetchBajas(currentPage, itemsPerPage, searchTerm);
              setBajas(result?.data || []);
              setPagination(result?.pagination || pagination);
            } catch (error) {
              console.warn('Error reloading bajas:', error);
            }
          };
          loadBajas();
          setIsAsociarEquiposModalOpen(false);
        }}
      />
      <ModalEquiposAsociados
        open={isEquiposAsociadosModalOpen}
        onOpenChange={setIsEquiposAsociadosModalOpen}
        baja={selectedBaja}
        onSuccess={() => {
          // Recargar datos después de ver equipos asociados
          const loadBajas = async () => {
            try {
              const result = await fetchBajas(currentPage, itemsPerPage, searchTerm);
              setBajas(result?.data || []);
              setPagination(result?.pagination || pagination);
            } catch (error) {
              console.warn('Error reloading bajas:', error);
            }
          };
          loadBajas();
        }}
      />
    </div>
  );
}
