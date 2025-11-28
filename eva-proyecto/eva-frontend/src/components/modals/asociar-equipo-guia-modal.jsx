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
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Asociar Equipos a Guía
                    </DialogTitle>
                    <p className="text-purple-100 text-sm">
                      {guia?.name || "Guía Rápida"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar por nombre, código o serie..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 focus:ring-purple-500"
                    disabled={loading || saving}
                  />
                </div>
                {selectedEquipos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 font-semibold px-3 py-1">
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
                      className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : equipos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No se encontraron equipos</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-purple-50 sticky top-0">
                      <TableRow>
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
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                        </TableHead>
                        <TableHead className="font-semibold text-purple-900">Nombre</TableHead>
                        <TableHead className="font-semibold text-purple-900">Código</TableHead>
                        <TableHead className="font-semibold text-purple-900">Marca</TableHead>
                        <TableHead className="font-semibold text-purple-900">Modelo</TableHead>
                        <TableHead className="font-semibold text-purple-900">Servicio</TableHead>
                        <TableHead className="font-semibold text-purple-900">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipos.map((equipo) => (
                        <TableRow
                          key={equipo.id}
                          className={`cursor-pointer transition-colors ${
                            selectedEquipos.includes(equipo.id)
                              ? "bg-purple-50 hover:bg-purple-100"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleEquipo(equipo.id)}
                        >
                          <TableCell className="text-center">
                            <Checkbox
                              checked={selectedEquipos.includes(equipo.id)}
                              onCheckedChange={() => toggleEquipo(equipo.id)}
                              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {equipo.equipo?.name || equipo.name || 'Sin nombre'}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                              {equipo.equipo?.code || equipo.code || 'N/A'}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-gray-700">
                            {equipo.equipo?.brand || equipo.marca || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {equipo.equipo?.model || equipo.modelo || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {equipo.ubicacion?.servicio || equipo.servicios || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${
                              equipo.data?.status?.toLowerCase().includes('activo') 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : equipo.data?.status?.toLowerCase().includes('mantenimiento')
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-red-100 text-red-700 border-red-200'
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
              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAsociar}
                  disabled={saving || selectedEquipos.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
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
