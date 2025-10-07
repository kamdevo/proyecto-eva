"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SearchableSelect from "@/components/ui/searchable-select";
import { Building, Upload, PenTool, Search } from "lucide-react";
import DigitalSignatureModal from "./digital-signature-modal";
import EvidenceUploadModal from "./evidence-upload-modal";
import EquipmentSearchModal from "./equipment-search-modal";
import axios from "axios";

export default function HospitalTicketModal({ isOpen, onClose, ticketType = "biomedico" }) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isEquipmentSearchModalOpen, setIsEquipmentSearchModalOpen] = useState(false);
  const [currentSigner, setCurrentSigner] = useState("");
  
  // Estados para datos de los searchable selects
  const [sedes, setSedes] = useState([]);
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const [formData, setFormData] = useState({
    // Campos obligatorios exactos - ahora usando IDs para los searchables
    sede: "", centroCosto: "", servicio: "", numeroOT: "", ot: "", fecha: "", area: "",
    equipo: "", modelo: "", serie: "", marca: "", numeroInventario: "", solicitadoPor: "", correoElectronico: "",
    empresaAsignada: "", asignacionEspecifica: "", fechaAsignacion: "",
    tipoArreglo: "", descripcionProblema: "",
    diagnostico: "", responsableDiagnostico: "", repuestosNecesarios: "", tiempoEjecucion: "",
    fechaInicio: "", fechaFinalizacion: "",
    tipoTrabajoRealizado: "", responsableReparacion: "", repuestosInstalados: "", tiempoEjecucionTrabajo: "",
    fechaInicioTrabajo: "", fechaFinalizacionTrabajo: "",
    avances: "",
    firmaCierre: null, fechaSolicitudCierre: "", fechaCierre: "",
    evidencias: []
  });

  // Funciones para cargar datos de APIs
  const fetchSedes = async () => {
    setLoadingSedes(true);
    try {
      const response = await axios.get('http://localhost:8001/api/v1/sedes');
      if (response.data?.success && response.data?.data) {
        setSedes(response.data.data.map(sede => ({
          id: sede.id,
          nombre: sede.name || sede.nombre
        })));
      }
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      // Fallback con datos por defecto
      setSedes([
        { id: 1, nombre: "SEDE PRINCIPAL" },
        { id: 2, nombre: "SEDE NORTE" }
      ]);
    } finally {
      setLoadingSedes(false);
    }
  };

  const fetchCentrosCosto = async () => {
    setLoadingCentros(true);
    try {
      // Usar el mismo endpoint que LoginForm
      const response = await axios.get('http://localhost:8001/api/v1/centros');
      if (response.data?.success && response.data?.data) {
        // Formatear igual que LoginForm
        setCentrosCosto(response.data.data.map(centro => ({
          id: centro.id.toString(),
          nombre: centro.code 
            ? `${centro.code} - ${centro.name}`
            : centro.name,
          codigo: centro.code || ''
        })));
      }
    } catch (error) {
      console.error('Error al cargar centros de costo:', error);
      // Fallback con datos igual que LoginForm
      setCentrosCosto([
        { id: "1", nombre: "Centro de Costo 1 - Administración" },
        { id: "2", nombre: "Centro de Costo 2 - Quirófanos" },
        { id: "3", nombre: "Centro de Costo 3 - UCI" },
        { id: "4", nombre: "Centro de Costo 4 - Emergencias" },
        { id: "5", nombre: "Centro de Costo 5 - Laboratorio" },
        { id: "6", nombre: "Centro de Costo 6 - Imagenología" },
        { id: "7", nombre: "Centro de Costo 7 - Farmacia" },
        { id: "8", nombre: "Centro de Costo 8 - Nutrición" },
        { id: "9", nombre: "Centro de Costo 9 - Fisioterapia" },
        { id: "10", nombre: "Centro de Costo 10 - Trabajo Social" }
      ]);
    } finally {
      setLoadingCentros(false);
    }
  };

  const fetchServicios = async () => {
    setLoadingServicios(true);
    try {
      const response = await axios.get('http://localhost:8001/api/v1/servicios');
      if (response.data?.success && response.data?.data) {
        setServicios(response.data.data.map(servicio => ({
          id: servicio.id,
          nombre: servicio.name || servicio.nombre
        })));
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      // Fallback con datos por defecto
      setServicios([
        { id: 1, nombre: "ACONDICIONAMIENTO FISICO" },
        { id: 2, nombre: "RADIOTERAPIA" },
        { id: 3, nombre: "MEDICINA INTERNA" },
        { id: 4, nombre: "PEDIATRIA" },
        { id: 5, nombre: "GINECOBSTETRICIA" },
        { id: 6, nombre: "RADIOLOGIA" },
        { id: 7, nombre: "CIRUGIA" },
        { id: 8, nombre: "URGENCIAS" },
        { id: 9, nombre: "UCI ADULTOS" },
        { id: 10, nombre: "LABORATORIO CLINICO" }
      ]);
    } finally {
      setLoadingServicios(false);
    }
  };

  const fetchAreas = async () => {
    setLoadingAreas(true);
    try {
      const response = await axios.get('http://localhost:8001/api/v1/areas');
      if (response.data?.success && response.data?.data) {
        setAreas(response.data.data.map(area => ({
          id: area.id,
          nombre: area.name || area.nombre
        })));
      }
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      // Fallback con datos por defecto
      setAreas([
        { id: 1, nombre: "CONSULTA EXTERNA" },
        { id: 2, nombre: "HOSPITALIZACION" },
        { id: 3, nombre: "URGENCIAS" },
        { id: 4, nombre: "UCI" },
        { id: 5, nombre: "QUIROFANOS" },
        { id: 6, nombre: "DIAGNOSTICO" },
        { id: 7, nombre: "LABORATORIO" },
        { id: 8, nombre: "FARMACIA" },
        { id: 9, nombre: "ADMINISTRACION" },
        { id: 10, nombre: "MANTENIMIENTO" }
      ]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const response = await axios.get('http://localhost:8001/api/v1/empresas');
      if (response.data?.success && response.data?.data) {
        setEmpresas(response.data.data.map(empresa => ({
          id: empresa.id.toString(),
          nombre: empresa.name || empresa.nombre
        })));
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      // Fallback con datos por defecto
      setEmpresas([
        { id: "1", nombre: "Hospital Universitario del Valle" },
        { id: "2", nombre: "TecnoMed S.A." },
        { id: "3", nombre: "Biomedical Solutions" },
        { id: "4", nombre: "Servicios Técnicos Hospitalarios" },
        { id: "5", nombre: "MedEquip Colombia" },
        { id: "6", nombre: "Ingeniería Biomédica HUV" },
        { id: "7", nombre: "Soporte Técnico Especializado" },
        { id: "8", nombre: "Mantenimiento Hospitalario S.A.S." }
      ]);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  // useEffect para cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchSedes();
      fetchCentrosCosto();
      fetchServicios();
      fetchAreas();
      fetchEmpresas();
    }
  }, [isOpen]);

  // Funciones helper para obtener nombres de los IDs
  const getSedeNombre = (id) => {
    const sede = sedes.find(s => s.id.toString() === id);
    return sede ? sede.nombre : id;
  };

  const getCentroCostoNombre = (id) => {
    const centro = centrosCosto.find(c => c.id.toString() === id);
    return centro ? centro.nombre : id;
  };

  const getServicioNombre = (id) => {
    const servicio = servicios.find(s => s.id.toString() === id);
    return servicio ? servicio.nombre : id;
  };

  const getAreaNombre = (id) => {
    const area = areas.find(a => a.id.toString() === id);
    return area ? area.nombre : id;
  };

  const getEmpresaNombre = (id) => {
    const empresa = empresas.find(e => e.id.toString() === id);
    return empresa ? empresa.nombre : id;
  };

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSignature = (signerType) => { setCurrentSigner(signerType); setIsSignatureModalOpen(true); };
  const saveSignature = (signatureData) => setFormData(prev => ({ ...prev, [`firma${currentSigner}`]: signatureData }));
  const saveEvidences = (evidences) => setFormData(prev => ({ ...prev, evidencias: evidences }));
  
  // Función para manejar la selección de equipo desde el modal de búsqueda
  const handleSelectEquipment = (equipo) => {
    setFormData(prev => ({
      ...prev,
      equipo: equipo.name || '',
      modelo: equipo.modelo || '',
      serie: equipo.serial || '',
      marca: equipo.marca || '',
      numeroInventario: equipo.code || '',
      // Actualizar servicio y área si viene con el equipo
      servicio: equipo.servicio_id ? equipo.servicio_id.toString() : prev.servicio,
      area: equipo.area_id ? equipo.area_id.toString() : prev.area
    }));
  };

  const handleSubmit = () => {
    // Detectar campos completados
    const filledFields = [];
    if (formData.sede) filledFields.push('Sede');
    if (formData.centroCosto) filledFields.push('Centro de Costo');
    if (formData.servicio) filledFields.push('Servicio');
    if (formData.equipo) filledFields.push('Equipo');
    if (formData.descripcionProblema) filledFields.push('Descripción del Problema');
    if (formData.diagnostico) filledFields.push('Diagnóstico');
    if (formData.tipoTrabajoRealizado) filledFields.push('Trabajo Realizado');
    if (formData.avances) filledFields.push('Avances');
    if (formData.firmaCierre) filledFields.push('Firma de Cierre');

    if (filledFields.length === 0) {
      alert('❌ Creación cancelada - No se completó ningún campo');
      return;
    }

    const requiredFields = [
      'sede', 'centroCosto', 'servicio', 'numeroOT', 'ot', 'fecha', 'area',
      'equipo', 'modelo', 'serie', 'marca', 'numeroInventario', 'solicitadoPor', 'correoElectronico',
      'empresaAsignada', 'asignacionEspecifica', 'fechaAsignacion', 'tipoArreglo', 'descripcionProblema',
      'diagnostico', 'responsableDiagnostico', 'repuestosNecesarios', 'tiempoEjecucion', 'fechaInicio', 'fechaFinalizacion',
      'tipoTrabajoRealizado', 'responsableReparacion', 'repuestosInstalados', 'tiempoEjecucionTrabajo', 'fechaInicioTrabajo', 'fechaFinalizacionTrabajo',
      'avances', 'fechaSolicitudCierre', 'fechaCierre'
    ];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const confirmed = window.confirm(`Hay ${missingFields.length} campos vacíos. ¿Desea llenarlos automáticamente con "No aplica"?`);
      if (confirmed) {
        const updatedData = { ...formData };
        missingFields.forEach(field => {
          updatedData[field] = 'No aplica';
        });
        setFormData(updatedData);
        return;
      } else {
        alert(`Complete los campos obligatorios: ${missingFields.join(', ')}`);
        return;
      }
    }

    const ticketData = {
      tipo: ticketType.toUpperCase(), numero: `${ticketType.substring(0,3).toUpperCase()}-${Date.now()}`,
      fecha: new Date().toLocaleDateString('es-CO'), hora: new Date().toLocaleTimeString('es-CO'),
      ...formData, estado: 'CREADO', fechaCreacion: new Date().toISOString()
    };

    // Preparar información legible para mostrar
    const sedeTexto = formData.sede ? getSedeNombre(formData.sede) : 'No especificado';
    const servicioTexto = formData.servicio ? getServicioNombre(formData.servicio) : 'No especificado';
    const areaTexto = formData.area ? getAreaNombre(formData.area) : 'No especificado';
    const empresaTexto = formData.empresaAsignada ? getEmpresaNombre(formData.empresaAsignada) : 'No especificado';
    
    if (window.confirm(`¿Desea crear la Orden de Trabajo ${ticketData.numero}?\n\nTipo: ${ticketType.toUpperCase()}\nSede: ${sedeTexto}\nServicio: ${servicioTexto}\nÁrea: ${areaTexto}\nEquipo: ${formData.equipo || 'No especificado'}\nEmpresa: ${empresaTexto}\n\nCampos completados: ${filledFields.join(', ')}`)) {
      console.log('🏥 ORDEN DE TRABAJO HUV:', ticketData);
      alert(`✅ Orden de Trabajo ${ticketData.numero} creada exitosamente\n\nCampos incluidos: ${filledFields.join(', ')}`);
      onClose();
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[90vh] overflow-y-auto p-6" style={{width: '95vw', maxWidth: '1400px'}}>
        <DialogHeader className="bg-white border-b border-gray-200 p-4 -m-4 mb-4">
          <DialogTitle className="sr-only">Orden de Trabajo Hospital Universitario del Valle</DialogTitle>
          <DialogDescription className="sr-only">Formulario para crear una nueva orden de trabajo en el Hospital Universitario del Valle</DialogDescription>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-8 h-8 ${getHeaderColor()} rounded-full flex items-center justify-center mr-2`}>
                <Building className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-semibold text-gray-900">Hospital Universitario del Valle</h1>
                <h2 className="text-xs text-gray-600">Evaristo García</h2>
              </div>
            </div>
            <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-xs font-medium text-gray-700">ORDEN DE TRABAJO</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-2">
          {/* Información General */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Sede</Label>
                <SearchableSelect
                  placeholder="Seleccionar sede..."
                  options={sedes}
                  value={formData.sede}
                  onValueChange={(value) => handleInputChange('sede', value)}
                  loading={loadingSedes}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Centro de costo</Label>
                <SearchableSelect
                  placeholder="Seleccionar centro de costo..."
                  options={centrosCosto}
                  value={formData.centroCosto}
                  onValueChange={(value) => handleInputChange('centroCosto', value)}
                  loading={loadingCentros}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Servicio</Label>
                <SearchableSelect
                  placeholder="Seleccionar servicio..."
                  options={servicios}
                  value={formData.servicio}
                  onValueChange={(value) => handleInputChange('servicio', value)}
                  loading={loadingServicios}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">O.T. #</Label>
                <Input value={formData.numeroOT} onChange={(e) => handleInputChange('numeroOT', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Área</Label>
                <SearchableSelect
                  placeholder="Seleccionar área..."
                  options={areas}
                  value={formData.area}
                  onValueChange={(value) => handleInputChange('area', value)}
                  loading={loadingAreas}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">O.T / Fecha</Label>
                <Input 
                  value={`${formData.ot}${formData.fecha ? ' - ' + formData.fecha : ''}`} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes(' - ')) {
                      const [ot, fecha] = value.split(' - ');
                      handleInputChange('ot', ot);
                      handleInputChange('fecha', fecha);
                    } else {
                      handleInputChange('ot', value);
                    }
                  }}
                  onFocus={(e) => {
                    if (!formData.fecha) {
                      e.target.type = 'date';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.type = 'text';
                  }}
                  className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" 
                  placeholder="O.T - YYYY-MM-DD"
                />
              </div>
            </div>
          </div>

          {/* Información del Equipo */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Información del Equipo
              </h3>
              <Button
                type="button"
                onClick={() => setIsEquipmentSearchModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 h-8"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar equipos en la base de datos
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Equipo</Label>
                <Input value={formData.equipo} onChange={(e) => handleInputChange('equipo', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Modelo</Label>
                <Input value={formData.modelo} onChange={(e) => handleInputChange('modelo', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Serie</Label>
                <Input value={formData.serie} onChange={(e) => handleInputChange('serie', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Marca</Label>
                <Input value={formData.marca} onChange={(e) => handleInputChange('marca', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">No. Inventario</Label>
                <Input value={formData.numeroInventario} onChange={(e) => handleInputChange('numeroInventario', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Solicitado por</Label>
                <Input value={formData.solicitadoPor} onChange={(e) => handleInputChange('solicitadoPor', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Correo electrónico</Label>
                <Input type="email" value={formData.correoElectronico} onChange={(e) => handleInputChange('correoElectronico', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Arreglo</Label>
                <Select value={formData.tipoArreglo} onValueChange={(value) => handleInputChange('tipoArreglo', value)}>
                  <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIOMEDICO">BIOMÉDICO</SelectItem>
                    <SelectItem value="LOCATIVO">LOCATIVO</SelectItem>
                    <SelectItem value="SISTEMAS">SISTEMAS</SelectItem>
                    <SelectItem value="ELECTRICO">ELÉCTRICO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Descripción del Problema */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              Descripción del Problema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Descripción del problema presentado</Label>
                <Textarea value={formData.descripcionProblema} onChange={(e) => handleInputChange('descripcionProblema', e.target.value)} rows={4} className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full resize-none" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Empresa Asignada</Label>
                <SearchableSelect
                  placeholder="Seleccionar empresa..."
                  options={empresas}
                  value={formData.empresaAsignada}
                  onValueChange={(value) => handleInputChange('empresaAsignada', value)}
                  loading={loadingEmpresas}
                  className="h-9 text-sm mb-4"
                />
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Asignación específica</Label>
                <Input value={formData.asignacionEspecifica} onChange={(e) => handleInputChange('asignacionEspecifica', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Fecha de asignación</Label>
                <Input type="datetime-local" value={formData.fechaAsignacion} onChange={(e) => handleInputChange('fechaAsignacion', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Diagnóstico
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Diagnóstico</Label>
                  <Textarea value={formData.diagnostico} onChange={(e) => handleInputChange('diagnostico', e.target.value)} rows={4} className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full resize-none" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Repuestos necesarios</Label>
                  <Textarea value={formData.repuestosNecesarios} onChange={(e) => handleInputChange('repuestosNecesarios', e.target.value)} rows={4} className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Responsable del diagnóstico</Label>
                    <Input value={formData.responsableDiagnostico} onChange={(e) => handleInputChange('responsableDiagnostico', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tiempo de ejecución</Label>
                    <Input value={formData.tiempoEjecucion} onChange={(e) => handleInputChange('tiempoEjecucion', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Fecha Inicio</Label>
                    <Input type="date" value={formData.fechaInicio} onChange={(e) => handleInputChange('fechaInicio', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Fecha de finalización</Label>
                    <Input type="date" value={formData.fechaFinalizacion} onChange={(e) => handleInputChange('fechaFinalizacion', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trabajo Realizado */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Trabajo Realizado
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo y descripción del trabajo realizado</Label>
                  <Textarea value={formData.tipoTrabajoRealizado} onChange={(e) => handleInputChange('tipoTrabajoRealizado', e.target.value)} rows={4} className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full resize-none" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Repuestos instalados</Label>
                  <Textarea value={formData.repuestosInstalados} onChange={(e) => handleInputChange('repuestosInstalados', e.target.value)} rows={4} className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Responsable de la reparación</Label>
                    <Input value={formData.responsableReparacion} onChange={(e) => handleInputChange('responsableReparacion', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Tiempo de ejecución</Label>
                    <Input value={formData.tiempoEjecucionTrabajo} onChange={(e) => handleInputChange('tiempoEjecucionTrabajo', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Fecha Inicio</Label>
                    <Input type="date" value={formData.fechaInicioTrabajo} onChange={(e) => handleInputChange('fechaInicioTrabajo', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Fecha de finalización</Label>
                    <Input type="date" value={formData.fechaFinalizacionTrabajo} onChange={(e) => handleInputChange('fechaFinalizacionTrabajo', e.target.value)} className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Avances */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
              Avances
            </h3>
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1 block">Avances del trabajo</Label>
              <Textarea value={formData.avances} onChange={(e) => handleInputChange('avances', e.target.value)} rows={3} className="text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>

          {/* Cierre */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Cierre de Orden
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">Fecha de solicitud de cierre</Label>
                <Input type="datetime-local" value={formData.fechaSolicitudCierre} onChange={(e) => handleInputChange('fechaSolicitudCierre', e.target.value)} className="h-7 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">Fecha de cierre</Label>
                <Input type="datetime-local" value={formData.fechaCierre} onChange={(e) => handleInputChange('fechaCierre', e.target.value)} className="h-7 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Firma de quien cierra la orden</Label>
                <Button type="button" onClick={() => handleSignature('Cierre')} variant="outline" className="w-full h-10 text-sm border-gray-300 hover:border-blue-500">
                  <PenTool className="w-4 h-4 mr-2" />
                  {formData.firmaCierre ? '✓ Firmado' : 'Agregar Firma'}
                </Button>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Evidencias</Label>
                <Button type="button" onClick={() => setIsEvidenceModalOpen(true)} variant="outline" className="w-full h-10 text-sm border-gray-300 hover:border-blue-500">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documentos ({formData.evidencias.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="h-8 px-4 text-xs">Cancelar</Button>
            <Button onClick={handleSubmit} className={`${getHeaderColor()} hover:opacity-90 h-8 px-4 text-xs`}>Crear Orden</Button>
          </div>
        </div>

        <DigitalSignatureModal isOpen={isSignatureModalOpen} onClose={() => setIsSignatureModalOpen(false)} onSave={saveSignature} signerName={currentSigner} />
        <EvidenceUploadModal isOpen={isEvidenceModalOpen} onClose={() => setIsEvidenceModalOpen(false)} onSave={saveEvidences} ticketType={ticketType} />
        <EquipmentSearchModal 
          isOpen={isEquipmentSearchModalOpen} 
          onClose={() => setIsEquipmentSearchModalOpen(false)} 
          onSelectEquipment={handleSelectEquipment}
          ticketType={ticketType}
        />
      </DialogContent>
    </Dialog>
  );
}