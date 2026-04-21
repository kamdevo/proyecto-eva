"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../hooks/useAuth";
import useBajas from "../hooks/useBajas";
import { API_CONFIG } from "../config/api";
import { toast } from "sonner";
import ModalAgregarBaja from "@/components/modals/agregar-baja-modal";
import ModalEditarDocumento from "@/components/modals/editar-baja-modal";
import ModalTablaEquipos from "@/components/modals/tabla-equipos-asociar";
import ModalEquiposAsociados from "@/components/modals/equipos-asociados-modal";
import Pagination from "@/components/common/Pagination";

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

    // Usar la configuración centralizada de la API
    const backendUrl = API_CONFIG.BASE_URL || "";

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

  return (
    <div className="min-h-screen bg-[#F1F4F6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bajas de equipos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Administre y supervise todos los registros del sistema
            </p>
          </div>
          {canCreate('bajas') && (
            <button
              onClick={() => setIsAgregarBajaModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agregar baja</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          )}
        </div>

        {/* Search & Records Bar */}
        <section className="bg-white rounded-xl p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Buscar bajas
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por descripción, motivo o ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            <div className="text-sm text-slate-500">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Skeleton className="h-4 w-56" />
                </span>
              ) : (
                <>Mostrando <span className="font-semibold text-slate-700">{startIndex + 1}</span>–<span className="font-semibold text-slate-700">{endIndex}</span> de <span className="font-semibold text-slate-700">{pagination.total}</span> registros</>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </section>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-20">
                    ID
                  </th>
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-40">
                    Fecha baja
                  </th>
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Descripción
                  </th>
                  <th className="py-5 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest w-40">
                    Archivo
                  </th>
                  <th className="py-5 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest w-56">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-24 rounded-lg mx-auto" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {Array.from({ length: 4 }).map((_, j) => (
                            <Skeleton key={j} className="h-9 w-9 rounded-full" />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : currentBajas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-600">
                          {searchTerm ? 'No se encontraron bajas que coincidan con la búsqueda' : 'No hay bajas registradas'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentBajas.map((baja) => (
                    <tr key={baja.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        #{baja.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {baja.fecha_baja ? new Date(baja.fecha_baja).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 max-w-md">
                        <div className="line-clamp-2">{baja.descripcion || baja.motivo || 'Sin descripción'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {baja.archivo ? (
                          <button
                            onClick={() => handleViewDocument(baja.archivo)}
                            className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            title="Ver documento de baja"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Ver archivo
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Sin archivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleBajaClick(baja)}
                            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {baja.documento && (
                            <button
                              onClick={() => handleDownloadDocument(baja)}
                              className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Descargar documento"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}

                          {canEdit('bajas') && (
                            <button
                              onClick={() => {
                                setSelectedBaja(baja);
                                setIsEditarBajaModalOpen(true);
                              }}
                              className="p-2 rounded-full text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedBaja(baja);
                              setIsAsociarEquiposModalOpen(true);
                            }}
                            className="p-2 rounded-full text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Asociar equipos"
                          >
                            <Link className="h-4 w-4" />
                          </button>

                          {canDelete('bajas') && (
                            <button
                              onClick={() => handleDeleteBaja(baja.id)}
                              className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`mskel-${i}`} className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : currentBajas.length === 0 ? (
            <div className="bg-white rounded-xl py-12 text-center text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              {searchTerm ? 'No se encontraron bajas que coincidan con la búsqueda' : 'No hay bajas registradas'}
            </div>
          ) : (
            currentBajas.map((baja) => (
              <div
                key={baja.id}
                className="bg-white rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-semibold text-slate-900">#{baja.id}</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleBajaClick(baja)}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {baja.documento && (
                      <button
                        onClick={() => handleDownloadDocument(baja)}
                        className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Descargar documento"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    {canEdit('bajas') && (
                      <button
                        onClick={() => {
                          setSelectedBaja(baja);
                          setIsEditarBajaModalOpen(true);
                        }}
                        className="p-2 rounded-full text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedBaja(baja);
                        setIsAsociarEquiposModalOpen(true);
                      }}
                      className="p-2 rounded-full text-violet-600 hover:bg-violet-50 transition-colors"
                      title="Asociar equipos"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha:</span>
                  <span className="text-sm text-slate-700 ml-2">
                    {baja.fecha_baja ? new Date(baja.fecha_baja).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <p className="text-sm text-slate-700 mb-3 line-clamp-3">
                  {baja.descripcion || baja.motivo || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleViewAssociatedEquipment(baja)}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Equipos ({baja.equipos_count || 0})
                  </button>

                  {canDelete('bajas') && (
                    <button
                      onClick={() => handleDeleteBaja(baja.id)}
                      className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}
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
