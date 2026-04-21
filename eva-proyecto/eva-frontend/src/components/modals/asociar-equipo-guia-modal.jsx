import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Link2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Pagination from "@/components/common/Pagination";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";
import { invalidateEquipmentCache } from "@/services/equipmentPrefetchCache";

const AsociarEquipoGuiaModal = ({ isOpen, onClose, guia, onSuccess }) => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEquipos, setSelectedEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      fetchEquipos();
      setSelectedEquipos([]);
    }
  }, [isOpen, currentPage, searchTerm]);

  const fetchEquipos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: itemsPerPage,
        tipo_id: 1, // Solo biomédicos
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(
        `${API_CONFIG.API_URL}/v1/equipos/medical-devices-complete?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Respuesta del endpoint:', data);

      if (data.success) {
        const equiposArray = data.data?.data || data.data || [];
        console.log('✅ Equipos recibidos:', equiposArray.length, equiposArray);
        setEquipos(equiposArray);
        setTotalPages(data.data?.last_page || 1);
        setTotalItems(data.data?.total || 0);
      } else {
        throw new Error(data.message || "Error al obtener equipos");
      }
    } catch (error) {
      console.error("❌ Error fetching equipos:", error);
      toast.error("Error al cargar los equipos");
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const toggleEquipo = (equipoId) => {
    setSelectedEquipos((prev) =>
      prev.includes(equipoId)
        ? prev.filter((id) => id !== equipoId)
        : [...prev, equipoId]
    );
  };

  const handleAsociar = async () => {
    if (selectedEquipos.length === 0) {
      toast.error("Selecciona al menos un equipo");
      return;
    }

    if (!guia?.id) {
      toast.error("ID de guía no válido");
      return;
    }

    setSaving(true);
    try {
      console.log('🔗 Asociando equipos:', selectedEquipos, 'a guía:', guia.id);
      
      const response = await fetch(
        `${API_CONFIG.API_URL}/v1/guiarapida/${guia.id}/asociar-equipos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            equipo_ids: selectedEquipos
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta de asociación:', data);

      if (data.success) {
        // Invalidar caché de cada equipo recién asociado para que el modal
        // "Editar equipo" muestre la guía asociada sin necesidad de recargar.
        selectedEquipos.forEach((equipoId) => invalidateEquipmentCache(equipoId));

        toast.success(data.message || `${selectedEquipos.length} equipo(s) asociado(s) exitosamente`);
        onSuccess?.();
        handleClose();
      } else {
        throw new Error(data.message || "Error al asociar equipos");
      }
    } catch (error) {
      console.error("❌ Error asociando equipos:", error);
      toast.error(error.message || "Error al asociar los equipos");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setSelectedEquipos([]);
      setSearchTerm("");
      setCurrentPage(1);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white tracking-tight">
                      Asociar Equipos a Guía
                    </DialogTitle>
                    <p className="text-blue-100 text-sm">
                      {guia?.name || "Guía Rápida"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar por nombre, código o serie..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 rounded-full bg-white border-slate-200 focus-visible:ring-blue-500"
                    disabled={loading || saving}
                  />
                </div>
                {selectedEquipos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <Badge className="bg-blue-50 text-blue-700 border-0 font-semibold px-3 py-1 rounded-full">
                      ✓ {selectedEquipos.length} seleccionado{selectedEquipos.length !== 1 ? 's' : ''}
                    </Badge>
                  </motion.div>
                )}
              </div>

              {/* Body - Tabla de Equipos */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : equipos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No se encontraron equipos</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-blue-50 sticky top-0">
                      <TableRow className="hover:bg-blue-50">
                        <TableHead className="w-12 text-center">
                          <Checkbox
                            checked={selectedEquipos.length === equipos.length && equipos.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEquipos(equipos.map(e => e.id));
                              } else {
                                setSelectedEquipos([]);
                              }
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </TableHead>
                        <TableHead className="text-xs font-bold text-blue-900 uppercase tracking-wider">Nombre</TableHead>
                        <TableHead className="text-xs font-bold text-blue-900 uppercase tracking-wider">Código</TableHead>
                        <TableHead className="text-xs font-bold text-blue-900 uppercase tracking-wider">Marca</TableHead>
                        <TableHead className="text-xs font-bold text-blue-900 uppercase tracking-wider">Modelo</TableHead>
                        <TableHead className="text-xs font-bold text-blue-900 uppercase tracking-wider">Servicio</TableHead>
                        <TableHead className="text-xs font-bold text-blue-900 uppercase tracking-wider">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipos.map((equipo) => (
                        <TableRow
                          key={equipo.id}
                          className={`cursor-pointer transition-colors border-b border-slate-100 ${
                            selectedEquipos.includes(equipo.id)
                              ? "bg-blue-50/70 hover:bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => toggleEquipo(equipo.id)}
                        >
                          <TableCell className="text-center">
                            <Checkbox
                              checked={selectedEquipos.includes(equipo.id)}
                              onCheckedChange={() => toggleEquipo(equipo.id)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {equipo.equipo?.name || equipo.name || 'Sin nombre'}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-50 text-blue-700 border-0 text-xs rounded-full">
                              {equipo.equipo?.code || equipo.code || 'N/A'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-slate-600">
                            {equipo.equipo?.brand || equipo.marca || 'N/A'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {equipo.equipo?.model || equipo.modelo || 'N/A'}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {equipo.ubicacion?.servicio || equipo.servicios || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs rounded-full border-0 ${
                              equipo.data?.status?.toLowerCase().includes('activo')
                                ? 'bg-emerald-50 text-emerald-700'
                                : equipo.data?.status?.toLowerCase().includes('mantenimiento')
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {equipo.data?.status || equipo.estadoequipo || 'N/A'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagination */}
              {!loading && equipos.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  loading={loading}
                />
              )}

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 rounded-full hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAsociar}
                  disabled={saving || selectedEquipos.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
                >
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Asociando...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Asociar {selectedEquipos.length > 0 && `(${selectedEquipos.length})`}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AsociarEquipoGuiaModal;
