"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, X, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EquipmentSearchModal({ 
  isOpen, 
  onClose, 
  onSelectEquipment,
  ticketType = "biomedico" 
}) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  
  // Filtros
  const [sedeFilter, setSedeFilter] = useState("all");
  const [servicioFilter, setServicioFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Listas para los filtros
  const [sedes, setSedes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [areas, setAreas] = useState([]);

  // Cargar listas para filtros
  useEffect(() => {
    if (isOpen) {
      fetchFilterData();
      fetchEquipments();
    }
  }, [isOpen, sedeFilter, servicioFilter, areaFilter, searchTerm]);

  const fetchFilterData = async () => {
    try {
      // Cargar sedes
      const sedesRes = await fetch('http://localhost:8001/api/v1/sedes');
      if (sedesRes.ok) {
        const sedesData = await sedesRes.json();
        setSedes(sedesData.data || []);
      }

      // Cargar servicios
      const serviciosRes = await fetch('http://localhost:8001/api/v1/servicios');
      if (serviciosRes.ok) {
        const serviciosData = await serviciosRes.json();
        setServicios(serviciosData.data || []);
      }

      // Cargar áreas
      const areasRes = await fetch('http://localhost:8001/api/v1/areas');
      if (areasRes.ok) {
        const areasData = await areasRes.json();
        setAreas(areasData.data || []);
      }
    } catch (error) {
      console.error('Error cargando filtros:', error);
    }
  };

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      
      // Usar el endpoint correcto según el tipo de ticket
      let url = '';
      if (ticketType === 'biomedico') {
        url = 'http://localhost:8001/api/v1/equipos/medical-devices-complete?per_page=200';
      } else if (ticketType === 'industrial') {
        url = 'http://localhost:8001/api/v1/equipos/industrial-devices-complete?per_page=200';
      } else {
        // Para infraestructura, usar endpoint general
        url = 'http://localhost:8001/api/v1/equipos?per_page=200';
      }
      
      // Agregar búsqueda si existe
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener equipos');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // La estructura es: result.data.data (array de equipos)
        let equiposData = result.data?.data || [];
        
        // Transformar la estructura anidada a formato plano para la tabla
        equiposData = equiposData.map(item => ({
          id: item.id,
          name: item.equipo?.name || '',
          code: item.equipo?.code || '',
          marca: item.equipo?.brand || '',
          modelo: item.equipo?.model || '',
          serial: item.equipo?.series || '',
          servicios: item.ubicacion?.servicio || '',
          area: item.ubicacion?.area || '',
          sede: item.ubicacion?.sede || ''
        }));
        
        // Aplicar filtros en el frontend
        if (sedeFilter !== 'all') {
          equiposData = equiposData.filter(eq => {
            const sedeNombre = eq.sede;
            const sedeObj = sedes.find(s => s.id.toString() === sedeFilter);
            return sedeObj && sedeNombre === sedeObj.name;
          });
        }
        
        if (servicioFilter !== 'all') {
          equiposData = equiposData.filter(eq => {
            const servicioNombre = eq.servicios;
            const servicioObj = servicios.find(s => s.id.toString() === servicioFilter);
            return servicioObj && servicioNombre === servicioObj.name;
          });
        }
        
        if (areaFilter !== 'all') {
          equiposData = equiposData.filter(eq => {
            const areaNombre = eq.area;
            const areaObj = areas.find(a => a.id.toString() === areaFilter);
            return areaObj && areaNombre === areaObj.name;
          });
        }
        
        setEquipos(equiposData);
      } else {
        console.error('Error en respuesta:', result.message);
        setEquipos([]);
      }
    } catch (error) {
      console.error('Error fetching equipments:', error);
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEquipment = (equipo) => {
    setSelectedEquipment(equipo);
  };

  const handleConfirmSelection = () => {
    if (selectedEquipment) {
      onSelectEquipment(selectedEquipment);
      // Mostrar notificación de éxito
      alert(`✅ Equipo cargado correctamente:\n\n${selectedEquipment.name}\nCódigo: ${selectedEquipment.code}\nSerie: ${selectedEquipment.serial || 'N/A'}`);
      onClose();
      setSelectedEquipment(null);
    }
  };

  const handleClearFilters = () => {
    setSedeFilter("all");
    setServicioFilter("all");
    setAreaFilter("all");
    setSearchTerm("");
  };

  if (!isOpen) return null;

  const getHeaderColor = () => {
    switch(ticketType) {
      case 'biomedico': return 'bg-blue-600';
      case 'industrial': return 'bg-orange-600';
      case 'infraestructura': return 'bg-green-600';
      default: return 'bg-blue-600';
    }
  };

  const getTypeLabel = () => {
    switch(ticketType) {
      case 'biomedico': return 'Equipos Biomédicos';
      case 'industrial': return 'Equipos Industriales';
      case 'infraestructura': return 'Equipos de Infraestructura';
      default: return 'Equipos';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-6xl h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className={`${getHeaderColor()} text-white p-6`}>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Search className="w-6 h-6 mr-2" />
            Buscar Equipos en la Base de Datos
          </DialogTitle>
          <DialogDescription className="text-white/90 text-sm mt-2">
            {getTypeLabel()} - Seleccione un equipo para cargar automáticamente su información
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filtros */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Sede</Label>
                <Select value={sedeFilter} onValueChange={setSedeFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todas las sedes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las sedes</SelectItem>
                    {sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Servicio</Label>
                <Select value={servicioFilter} onValueChange={setServicioFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio.id} value={servicio.id.toString()}>
                        {servicio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Área</Label>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todas las áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las áreas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Buscar</Label>
                <div className="relative">
                  <Input
                    placeholder="Nombre, código, serie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 text-sm pr-8"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          </div>

          {/* Tabla de Equipos */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Cargando equipos...</div>
              </div>
            ) : equipos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No se encontraron equipos</h3>
                <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sel.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipos.map((equipo) => (
                      <tr
                        key={equipo.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedEquipment?.id === equipo.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleSelectEquipment(equipo)}
                      >
                        <td className="px-4 py-3 text-center">
                          <div className={`w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center ${
                            selectedEquipment?.id === equipo.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedEquipment?.id === equipo.id && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{equipo.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{equipo.marca || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{equipo.modelo || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{equipo.serial || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{equipo.code || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{equipo.servicios || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{equipo.area || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Información del equipo seleccionado */}
          {selectedEquipment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Equipo Seleccionado:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Nombre:</span>
                  <span className="ml-2 text-blue-900">{selectedEquipment.name}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Código:</span>
                  <span className="ml-2 text-blue-900">{selectedEquipment.code || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Marca:</span>
                  <span className="ml-2 text-blue-900">{selectedEquipment.marca || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Modelo:</span>
                  <span className="ml-2 text-blue-900">{selectedEquipment.modelo || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedEquipment}
            className={`px-6 ${getHeaderColor()} text-white hover:opacity-90`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Seleccionar Equipo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
