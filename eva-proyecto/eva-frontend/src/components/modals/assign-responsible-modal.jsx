"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, UserPlus, Save, Search } from "lucide-react";
import { toast } from "sonner";
import SearchableSelect from "@/components/ui/searchable-select";
import httpService from "@/services/httpService";

export default function AssignResponsibleModal({ isOpen, onClose, ticketId }) {
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmpresas();
    }
  }, [isOpen]);

  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      const response = await httpService.get('/v1/empresas');
      const result = response.data;
      
      console.log('📦 Respuesta del servidor:', result);
      
      if (!result.success && !result.data) {
        throw new Error(result.message || 'Error al cargar empresas');
      }
      
      // Transformar datos para el SearchableSelect
      const empresasData = result.data || result;
      console.log('📋 Datos de empresas:', empresasData);
      
      // Filtrar solo empresas activas (estado puede ser boolean, string o number)
      const empresasOptions = empresasData
        .filter(empresa => {
          const estado = empresa.estado;
          return estado === true || estado === 'true' || estado === 1 || estado === '1';
        })
        .map(empresa => {
          console.log('🔍 Procesando empresa:', empresa);
          
          // Limpiar área de caracteres especiales y espacios
          let areaLimpia = empresa.area || 'Sin área';
          areaLimpia = areaLimpia.trim().replace(/[\t\r\n]/g, '');
          
          // Formatear área para mostrar
          let areaFormateada = areaLimpia;
          if (areaLimpia === 'mantenimiento_biomedico') {
            areaFormateada = 'Mantenimiento Biomédico';
          } else if (areaLimpia === 'mantenimiento_ind') {
            areaFormateada = 'Mantenimiento Industrial';
          } else if (areaLimpia === 'both') {
            areaFormateada = 'Biomédico e Industrial';
          } else if (areaLimpia === '') {
            areaFormateada = 'Sin área especificada';
          }
          
          return {
            id: empresa.id,
            nombre: empresa.name || 'Sin nombre',
            area: areaFormateada,
            areaOriginal: areaLimpia,
            estado: empresa.estado
          };
        });

      console.log('✅ Empresas procesadas:', empresasOptions);
      setEmpresas(empresasOptions);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al cargar la lista de empresas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmpresa) {
      toast.error("Debe seleccionar una empresa responsable");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await httpService.post(`/v1/tickets/${ticketId}/asignar-responsable`, {
        empresa_id: selectedEmpresa
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Error al asignar responsable');
      }

      toast.success("Empresa asignada exitosamente");
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al asignar el responsable");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader className="bg-purple-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <UserPlus className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Asignar Responsable</DialogTitle>
              <p className="text-sm text-purple-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="empresa" className="text-sm font-semibold text-gray-700 flex items-center">
              <Search className="w-4 h-4 mr-2 text-purple-600" />
              Seleccionar Empresa Responsable *
            </Label>
            
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <SearchableSelect
                options={empresas}
                value={selectedEmpresa ? selectedEmpresa.toString() : ""}
                onChange={(val) => setSelectedEmpresa(parseInt(val))}
                placeholder="Buscar empresa por nombre..."
                emptyMessage="No se encontraron empresas activas"
                className="w-full"
              />
            )}
            
            <p className="text-xs text-gray-500">
              Busque y seleccione la empresa que será responsable de este ticket
            </p>
          </div>

          {/* Empresa seleccionada */}
          {selectedEmpresa && (() => {
            const empresa = empresas.find(e => e.id === selectedEmpresa);
            console.log('🎯 Empresa seleccionada:', empresa);
            return (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">Empresa Seleccionada:</p>
                <div className="text-sm text-purple-800">
                  <p><strong>Nombre:</strong> {empresa?.nombre || 'No disponible'}</p>
                  <p><strong>Área:</strong> {empresa?.area || 'No disponible'}</p>
                </div>
              </div>
            );
          })()}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La empresa asignada será la responsable de este ticket.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting || !selectedEmpresa}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Asignando..." : "Asignar Responsable"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
