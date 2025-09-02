"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronLeft, ChevronRight, AlertCircle, Eye, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import useBajas from "../../hooks/useBajas";

function ModalEquiposAsociados({ open, onOpenChange, baja, onSuccess }) {
  const { 
    getAssociatedEquipment, 
    removeEquipmentAssociation, 
    loading, 
    error 
  } = useBajas();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [equiposAsociados, setEquiposAsociados] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 10;

  const handleViewDocument = (fileName) => {
    if (!fileName) return;
    
    // Construct the URL for the document in Laravel storage
    const documentUrl = `/storage/bajas/${fileName}`;
    
    // Open document in new window with print functionality
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      console.error('No se pudo abrir el documento. Verifique que no esté bloqueando ventanas emergentes.');
    }
  };

  // Cargar equipos asociados cuando se abre el modal
  useEffect(() => {
    const loadAssociatedEquipment = async () => {
      if (open && baja?.id) {
        try {
          setSubmitError(null);
          const equipos = await getAssociatedEquipment(baja.id);
          setEquiposAsociados(equipos || []);
        } catch (err) {
          setSubmitError(err.message || 'Error al cargar equipos asociados');
          setEquiposAsociados([]);
        }
      }
    };

    loadAssociatedEquipment();
  }, [open, baja?.id]);

  // Filtrar equipos según término de búsqueda
  const filteredEquipos = equiposAsociados.filter((equipo) =>
    equipo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.serie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEquipos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEquipos.slice(startIndex, endIndex);

  const handleRemoveAssociation = async (equipoId) => {
    if (!window.confirm('¿Está seguro de que desea remover este equipo de la baja?')) {
      return;
    }

    setSubmitError(null);
    
    if (!baja?.id) {
      setSubmitError('No se puede remover: ID de baja no encontrado');
      return;
    }

    try {
      await removeEquipmentAssociation(baja.id, equipoId);
      
      // Actualizar lista local
      setEquiposAsociados(prev => prev.filter(equipo => equipo.id !== equipoId));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setSubmitError(err.message || 'Error al remover asociación');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubmitError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-full">
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Equipos Asociados a Baja ID: {baja?.id}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Información y búsqueda */}
          <div className="mb-4 space-y-3">
            <div className="text-sm text-gray-600">
              Equipos actualmente asociados a esta baja.
              <span className="ml-2 font-medium text-blue-600">
                Total: {equiposAsociados.length} equipo(s)
              </span>
            </div>
            <Input
              placeholder="Buscar por nombre, marca, modelo o serie..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm"
            />
          </div>

          {/* Tabla */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Nombre</TableHead>
                  <TableHead className="font-medium">Marca</TableHead>
                  <TableHead className="font-medium">Modelo</TableHead>
                  <TableHead className="font-medium">Serie</TableHead>
                  <TableHead className="font-medium">Estado</TableHead>
                  <TableHead className="font-medium text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                      Cargando equipos asociados...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No se encontraron equipos que coincidan con la búsqueda' : 'No hay equipos asociados a esta baja'}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((equipo) => (
                    <TableRow key={equipo.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-sm">
                        {equipo.nombre || 'Sin nombre'}
                      </TableCell>
                      <TableCell className="text-sm">{equipo.marca || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{equipo.modelo || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{equipo.serie || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            equipo.estado === 'ACTIVO' 
                              ? 'bg-green-100 text-green-800' 
                              : equipo.estado === 'BAJA'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          } hover:bg-current`}
                        >
                          {equipo.estado || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssociation(equipo.id)}
                            className="p-2 hover:bg-red-50 rounded-full"
                            title="Remover de la baja"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  {loading ? (
                    "Cargando..."
                  ) : (
                    `Mostrando ${startIndex + 1} a ${Math.min(endIndex, filteredEquipos.length)} de ${filteredEquipos.length} equipos`
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {(submitError || error) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{submitError || error}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalEquiposAsociados;
