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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, ChevronLeft, ChevronRight, List, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import useBajas from "../../hooks/useBajas";
import { useEquipment } from "../../hooks/useEquipment";

function ModalTablaEquipos({ open, onOpenChange, baja, onSuccess }) {
  const { associateEquipment, loading: bajasLoading, error: bajasError } = useBajas();
  const { 
    devices: equipos, 
    loading: equiposLoading, 
    refresh: fetchEquipos 
  } = useEquipment("biomedical");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipos, setSelectedEquipos] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 10;

  // Cargar equipos cuando se abre el modal
  useEffect(() => {
    if (open) {
      fetchEquipos();
      setSelectedEquipos([]);
      setSubmitError(null);
    }
  }, [open]);

  // Filtrar equipos según término de búsqueda
  const filteredEquipos = equipos.filter((equipo) =>
    equipo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.serie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEquipos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEquipos.slice(startIndex, endIndex);

  const handleSelectEquipo = (equipoId, checked) => {
    if (checked) {
      setSelectedEquipos(prev => [...prev, equipoId]);
    } else {
      setSelectedEquipos(prev => prev.filter(id => id !== equipoId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEquipos(currentItems.map(equipo => equipo.id));
    } else {
      setSelectedEquipos([]);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    
    if (!baja?.id) {
      setSubmitError('No se puede asociar: ID de baja no encontrado');
      return;
    }
    
    if (selectedEquipos.length === 0) {
      setSubmitError('Debe seleccionar al menos un equipo');
      return;
    }

    try {
      await associateEquipment(baja.id, selectedEquipos);
      
      setSelectedEquipos([]);
      setSubmitError(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setSubmitError(err.message || 'Error al asociar equipos');
    }
  };

  const handleClose = () => {
    if (!bajasLoading) {
      setSelectedEquipos([]);
      setSubmitError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-full">
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Asociar Equipos a Baja ID: {baja?.id}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Información y búsqueda */}
          <div className="mb-4 space-y-3">
            <div className="text-sm text-gray-600">
              Seleccione los equipos que desea asociar a esta baja.
              {selectedEquipos.length > 0 && (
                <span className="ml-2 font-medium text-blue-600">
                  {selectedEquipos.length} equipo(s) seleccionado(s)
                </span>
              )}
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
                  <TableHead className="font-medium w-12">
                    <Checkbox
                      checked={currentItems.length > 0 && currentItems.every(equipo => selectedEquipos.includes(equipo.id))}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-medium">Nombre</TableHead>
                  <TableHead className="font-medium">Marca</TableHead>
                  <TableHead className="font-medium">Modelo</TableHead>
                  <TableHead className="font-medium">Serie</TableHead>
                  <TableHead className="font-medium">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equiposLoading ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                      Cargando equipos...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No se encontraron equipos que coincidan con la búsqueda' : 'No hay equipos disponibles'}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((equipo) => (
                    <TableRow key={equipo.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedEquipos.includes(equipo.id)}
                          onCheckedChange={(checked) => handleSelectEquipo(equipo.id, checked)}
                        />
                      </TableCell>
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
                              : 'bg-gray-100 text-gray-800'
                          } hover:bg-current`}
                        >
                          {equipo.estado || 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {equiposLoading ? (
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
          </div>
        </div>

        {/* Error display */}
        {(submitError || bajasError) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{submitError || bajasError}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={bajasLoading || selectedEquipos.length === 0}
          >
            {bajasLoading ? 'Asociando...' : `Asociar ${selectedEquipos.length} Equipo(s)`}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={bajasLoading}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalTablaEquipos;
