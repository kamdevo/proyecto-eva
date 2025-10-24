"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../ui/toast";
import authService from "../../services/authService";
import httpService from "../../services/httpService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Building,
  Calendar,
  MapPin,
  Wrench,
  ClipboardList,
  Search,
  X,
  FileText,
  Camera,
  PenTool,
  Upload,
  User,
} from "lucide-react";
import DigitalSignatureModal from "./digital-signature-modal";
import EvidenceUploadModal from "./evidence-upload-modal";
import EquipmentSearchModal from "./equipment-search-modal";
import SearchableSelect from "../ui/searchable-select";

export default function HospitalTicketModal({
  isOpen,
  onClose,
  ticketType = "biomedico",
}) {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isEquipmentSearchModalOpen, setIsEquipmentSearchModalOpen] =
    useState(false);
  const [currentSigner, setCurrentSigner] = useState("");
  
  // Estados nuevos para control de UI
  const [reportadoPorMi, setReportadoPorMi] = useState(true); // true = yo, false = otro
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null); // Equipo de la BD
  const [modoIngresoEquipo, setModoIngresoEquipo] = useState("inicial"); // "inicial", "manual", "seleccionado"

  // Estados para datos de los searchable selects
  const [sedes, setSedes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const [formData, setFormData] = useState({
    // Campos obligatorios exactos - ahora usando IDs para los searchables
    sede: "",
    servicio: "",
    numeroOT: "", // Este campo NO será editable (es incremental automático)
    fecha: "", // Autocompletado con fecha actual
    area: "",
    equipo: "",
    modelo: "",
    serie: "",
    marca: "",
    numeroInventario: "",
    solicitadoPor: "", // Autocompletado con usuario actual o nombre manual
    correoElectronico: "", // Autocompletado con email del usuario actual
    tipoArreglo: "",
    descripcionProblema: "",
    reportanteNombre: "", // Nombre del reportante si es "otro"
    evidencias: [],
  });

  // Funciones para cargar datos de APIs
  const fetchSedes = async () => {
    setLoadingSedes(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8001/api"}/v1/sedes`
      );
      if (response.data?.success && response.data?.data) {
        setSedes(
          response.data.data.map((sede) => ({
            id: sede.id,
            nombre: sede.name || sede.nombre,
          }))
        );
      }
    } catch (error) {
      console.error("Error al cargar sedes:", error);
      // Fallback con datos por defecto
      setSedes([
        { id: 1, nombre: "SEDE PRINCIPAL" },
        { id: 2, nombre: "SEDE NORTE" },
      ]);
    } finally {
      setLoadingSedes(false);
    }
  };

  const fetchCentrosCosto = async () => {
    setLoadingCentros(true);
    try {
      // Usar el mismo endpoint que LoginForm
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8001/api"}/v1/centros`
      );
      if (response.data?.success && response.data?.data) {
        // Formatear igual que LoginForm
        setCentrosCosto(
          response.data.data.map((centro) => ({
            id: centro.id.toString(),
            nombre: centro.code
              ? `${centro.code} - ${centro.name}`
              : centro.name,
            codigo: centro.code || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error al cargar centros de costo:", error);
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
        { id: "10", nombre: "Centro de Costo 10 - Trabajo Social" },
      ]);
    } finally {
      setLoadingCentros(false);
    }
  };

  const fetchServicios = async () => {
    setLoadingServicios(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8001/api"}/v1/servicios`
      );
      if (response.data?.success && response.data?.data) {
        setServicios(
          response.data.data.map((servicio) => ({
            id: servicio.id,
            nombre: servicio.name || servicio.nombre,
          }))
        );
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error);
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
        { id: 10, nombre: "LABORATORIO CLINICO" },
      ]);
    } finally {
      setLoadingServicios(false);
    }
  };

  const fetchAreas = async () => {
    setLoadingAreas(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8001/api"}/v1/areas`
      );
      if (response.data?.success && response.data?.data) {
        setAreas(
          response.data.data.map((area) => ({
            id: area.id,
            nombre: area.name || area.nombre,
          }))
        );
      }
    } catch (error) {
      console.error("Error al cargar áreas:", error);
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
        { id: 10, nombre: "MANTENIMIENTO" },
      ]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:8001/api"}/v1/empresas`
      );
      if (response.data?.success && response.data?.data) {
        setEmpresas(
          response.data.data.map((empresa) => ({
            id: empresa.id.toString(),
            nombre: empresa.name || empresa.nombre,
          }))
        );
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      // Fallback con datos por defecto
      setEmpresas([
        { id: "1", nombre: "Hospital Universitario del Valle" },
        { id: "2", nombre: "TecnoMed S.A." },
        { id: "3", nombre: "Biomedical Solutions" },
        { id: "4", nombre: "Servicios Técnicos Hospitalarios" },
        { id: "5", nombre: "MedEquip Colombia" },
        { id: "6", nombre: "Ingeniería Biomédica HUV" },
        { id: "7", nombre: "Soporte Técnico Especializado" },
        { id: "8", nombre: "Mantenimiento Hospitalario S.A.S." },
      ]);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  // useEffect para cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchSedes();
      fetchServicios();
      fetchAreas();
      
      // Autocompletar fecha actual
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, fecha: today }));
      
      // Autocompletar datos del usuario actual
      const user = authService.getStoredUser();
      if (user) {
        const userName = user.username || user.nombre || user.name || '';
        const userEmail = user.email || user.correo || '';
        setFormData(prev => ({
          ...prev,
          solicitadoPor: userName,
          correoElectronico: userEmail
        }));
      }
    }
  }, [isOpen]);

  // useEffect separado para manejar cambio de reportante
  useEffect(() => {
    if (!isOpen) return; // Solo ejecutar si el modal está abierto
    
    const user = authService.getStoredUser();
    if (reportadoPorMi && user) {
      // Si cambia a "reportado por mí", autocompletar con datos del usuario
      const userName = user.username || user.nombre || user.name || '';
      const userEmail = user.email || user.correo || '';
      setFormData(prev => ({
        ...prev,
        solicitadoPor: userName,
        correoElectronico: userEmail,
        reportanteNombre: '' // Limpiar el campo de reportante
      }));
    } else if (!reportadoPorMi) {
      // Si cambia a "reportado por otro", limpiar campos para ingreso manual
      setFormData(prev => ({
        ...prev,
        solicitadoPor: '',
        correoElectronico: ''
      }));
    }
  }, [reportadoPorMi]);

  // Funciones helper para obtener nombres de los IDs
  const getSedeNombre = (id) => {
    const sede = sedes.find((s) => s.id.toString() === id);
    return sede ? sede.nombre : id;
  };


  const getServicioNombre = (id) => {
    const servicio = servicios.find((s) => s.id.toString() === id);
    return servicio ? servicio.nombre : id;
  };

  const getAreaNombre = (id) => {
    const area = areas.find((a) => a.id.toString() === id);
    return area ? area.nombre : id;
  };

  const getEmpresaNombre = (id) => {
    const empresa = empresas.find((e) => e.id.toString() === id);
    return empresa ? empresa.nombre : id;
  };

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSignature = (signerType) => {
    setCurrentSigner(signerType);
    setIsSignatureModalOpen(true);
  };
  const saveSignature = (signatureData) =>
    setFormData((prev) => ({
      ...prev,
      [`firma${currentSigner}`]: signatureData,
    }));
  const saveEvidences = (evidences) =>
    setFormData((prev) => ({ ...prev, evidencias: evidences }));

  // Función para manejar la selección de equipo desde el modal de búsqueda
  const handleSelectEquipment = (equipo) => {
    setEquipoSeleccionado(equipo);
    setModoIngresoEquipo("seleccionado");
    setFormData((prev) => ({
      ...prev,
      equipo: equipo.name || "",
      modelo: equipo.modelo || "",
      serie: equipo.serial || "",
      marca: equipo.marca || "",
      numeroInventario: equipo.code || "",
      // Actualizar servicio y área si viene con el equipo
      servicio: equipo.servicio_id
        ? equipo.servicio_id.toString()
        : prev.servicio,
      area: equipo.area_id ? equipo.area_id.toString() : prev.area,
    }));
  };

  const handleSubmit = async () => {
    // Detectar campos completados
    const filledFields = [];
    if (formData.sede) filledFields.push("Sede");
    if (formData.servicio) filledFields.push("Servicio");
    if (formData.equipo) filledFields.push("Equipo");
    if (formData.descripcionProblema)
      filledFields.push("Descripción del Problema");
    if (formData.diagnostico) filledFields.push("Diagnóstico");
    if (formData.tipoTrabajoRealizado) filledFields.push("Trabajo Realizado");
    if (formData.avances) filledFields.push("Avances");
    if (formData.firmaCierre) filledFields.push("Firma de Cierre");

    if (filledFields.length === 0) {
      showErrorToast("Creación cancelada - No se completó ningún campo");
      return;
    }

    // Obtener usuario actual
    const getCurrentUser = () => {
      try {
        // Usar authService primero
        const user = authService.getStoredUser();
        if (user) {
          return user;
        }

        // Fallback al localStorage con clave correcta
        const userData = localStorage.getItem("eva_user");
        if (userData) {
          const userParsed = JSON.parse(userData);
          return userParsed;
        }
      } catch (error) {
        console.error("❌ Error obteniendo usuario actual:", error);
      }
      return null;
    };

    const currentUser = getCurrentUser();
    if (!currentUser) {
      showErrorToast(
        "No se puede identificar el usuario actual. Por favor, inicia sesión nuevamente."
      );
      return;
    }

    // Preparar información legible para mostrar
    const sedeTexto = formData.sede
      ? getSedeNombre(formData.sede)
      : "No especificado";
    const servicioTexto = formData.servicio
      ? getServicioNombre(formData.servicio)
      : "No especificado";
    const areaTexto = formData.area
      ? getAreaNombre(formData.area)
      : "No especificado";
    const empresaTexto = formData.empresaAsignada
      ? getEmpresaNombre(formData.empresaAsignada)
      : "No especificado";

    const confirmMessage = `¿Desea crear la Orden de Trabajo?\n\nTipo: ${ticketType.toUpperCase()}\nSede: ${sedeTexto}\nServicio: ${servicioTexto}\nÁrea: ${areaTexto}\nEquipo: ${formData.equipo || "No especificado"}\nEmpresa: ${empresaTexto}\n\nCampos completados: ${filledFields.join(", ")}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Preparar datos para el backend
      const ticketData = {
        // Campos obligatorios para la tabla ordenes
        descripcion:
          formData.descripcionProblema || "Ticket creado desde el sistema",
        // No enviar fecha_inicio, el backend la manejará automáticamente

        // Mapear tipo de ticket a subproceso_id
        subproceso_id:
          ticketType === "biomedico" ? 1 : ticketType === "industrial" ? 2 : 3,

        // Información del equipo
        nombre_equipo: formData.equipo || "No especificado",
        codigo_equipo: formData.numeroInventario || null,
        serie_equipo: formData.serie || null,
        marca_equipo: formData.marca || null,
        modelo_equipo: formData.modelo || null,

        // Información del reportante (usuario actual) - Solo ID, los demás campos no existen en tabla ordenes
        reportante_id: currentUser?.id || currentUser?.user_id || 1,

        // Ubicación
        servicio_id: formData.servicio || null,
        area_id: formData.area || null,

        // Estado inicial
        estado_id: 1, // Abierto
        prioridad: 2, // Media por defecto

        // Información adicional
        empresa_id: formData.empresaAsignada || null,
        observaciones: formData.avances || null, // Se mapea a 'reparacion' en backend

        // ✅ CAMPOS OBLIGATORIOS ADICIONALES (Valores por defecto)
        tecnico_id: 1,
        electrico: 0,
        mecanico: 0,
        locativo: 0,
        cierre_active: 0,
        usuario_final_id: currentUser?.id || currentUser?.user_id || 1,
        trabajo_id: 1,
        listado_industrial_id: 1,
      };

      console.log("📤 Enviando ticket al backend:", ticketData);

      // Llamar al endpoint para crear el ticket usando httpService
      const response = await httpService.post("/v1/crear-ticket", ticketData);

      // httpService ya devuelve response.data directamente
      const result = response;

      if (result.success) {
        const ticketId = result.data.ticket_id || result.data.id;

        console.log("✅ Ticket creado exitosamente:", result);

        // ✅ GUARDAR FIRMA DIGITAL SI EXISTE
        if (formData.firmaCierre) {
          try {
            console.log("🖊️ Guardando firma digital para el ticket...");

            const firmaData = {
              firma_data: formData.firmaCierre,
              tipo_firma: "cierre",
              firmante_id: currentUser?.id || currentUser?.user_id || 1,
              firmante_nombre:
                currentUser?.username ||
                currentUser?.nombre ||
                "Usuario Sistema",
            };

            const firmaResponse = await httpService.post(
              `/v1/tickets/${ticketId}/firma`,
              firmaData
            );

            if (firmaResponse.success) {
              console.log("✅ Firma digital guardada exitosamente");
            } else {
              console.warn("⚠️ Error guardando firma:", firmaResponse.message);
            }
          } catch (firmaError) {
            console.error("❌ Error guardando firma digital:", firmaError);
          }
        }

        // ✅ Mostrar mensaje de éxito con toast
        console.log("✅ Ticket creado exitosamente");
        showSuccessToast(
          `¡Orden de Trabajo #${ticketId} creada exitosamente! Tipo: ${ticketType.toUpperCase()}`
        );

        // TODO: Implementar envío de correo en segundo plano o como opción manual

        onClose();
      } else {
        console.error("❌ Error creando ticket:", result);
        showErrorToast(
          `Error creando la orden de trabajo: ${result.message || "Error desconocido"}`
        );
      }
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error);
      showErrorToast(
        `Error de conexión al crear la orden de trabajo: ${error.message}`
      );
    }
  };

  if (!isOpen) return null;

  const getHeaderColor = () => {
    switch (ticketType) {
      case "biomedico":
        return "bg-blue-600";
      case "industrial":
        return "bg-orange-600";
      case "infraestructura":
        return "bg-green-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-7xl h-[90vh] overflow-y-auto p-6"
        style={{ width: "95vw", maxWidth: "1400px" }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4 mb-6">
          <DialogTitle className="sr-only">
            Orden de Trabajo Hospital Universitario del Valle
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para crear una nueva orden de trabajo en el Hospital
            Universitario del Valle
          </DialogDescription>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-8 h-8 ${getHeaderColor()} rounded-full flex items-center justify-center mr-2`}
              >
                <Building className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-semibold text-gray-900">
                  Hospital Universitario del Valle
                </h1>
                <h2 className="text-xs text-gray-600">Evaristo García</h2>
              </div>
            </div>
            <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-xs font-medium text-gray-700">
                ORDEN DE TRABAJO
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-2">
          {/* Sección Reportante */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              ¿Quién reporta el ticket?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Button
                type="button"
                variant={reportadoPorMi ? "default" : "outline"}
                onClick={() => setReportadoPorMi(true)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <User className="w-6 h-6 mb-1" />
                <span className="font-semibold">Reportado por mí</span>
                <span className="text-xs opacity-75">Yo soy quien reporta</span>
              </Button>
              <Button
                type="button"
                variant={!reportadoPorMi ? "default" : "outline"}
                onClick={() => setReportadoPorMi(false)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <User className="w-6 h-6 mb-1" />
                <span className="font-semibold">Reportado por otro</span>
                <span className="text-xs opacity-75">Otra persona reporta</span>
              </Button>
            </div>
            
            {!reportadoPorMi && (
              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nombre del reportante
                </Label>
                <Input
                  value={formData.reportanteNombre}
                  onChange={(e) => handleInputChange("reportanteNombre", e.target.value)}
                  placeholder="Ingrese el nombre de quien reporta"
                  className="h-9 text-sm"
                />
              </div>
            )}
          </div>

          {/* Información General */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  O.T. # (Autoincremental)
                </Label>
                <Input
                  value="Autogenerado"
                  disabled
                  className="h-9 text-sm bg-gray-100 border-gray-300 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Se asignará automáticamente</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha de Registro
                </Label>
                <Input
                  type="date"
                  value={formData.fecha}
                  disabled
                  className="h-9 text-sm bg-gray-100 border-gray-300 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Fecha actual</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Usuario
                </Label>
                <Input
                  value={formData.solicitadoPor}
                  disabled={reportadoPorMi}
                  onChange={(e) => handleInputChange("solicitadoPor", e.target.value)}
                  className={`h-9 text-sm ${reportadoPorMi ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">{reportadoPorMi ? 'Usuario actual' : 'Editable'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Correo Electrónico
                </Label>
                <Input
                  type="email"
                  value={formData.correoElectronico}
                  disabled={reportadoPorMi}
                  onChange={(e) => handleInputChange("correoElectronico", e.target.value)}
                  className={`h-9 text-sm ${reportadoPorMi ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">{reportadoPorMi ? 'Email actual' : 'Editable'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sede *
                </Label>
                <SearchableSelect
                  placeholder="Seleccionar sede..."
                  options={sedes}
                  value={formData.sede}
                  onValueChange={(value) => handleInputChange("sede", value)}
                  loading={loadingSedes}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Servicio *
                </Label>
                <SearchableSelect
                  placeholder="Seleccionar servicio..."
                  options={servicios}
                  value={formData.servicio}
                  onValueChange={(value) => handleInputChange("servicio", value)}
                  loading={loadingServicios}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Área
                </Label>
                <SearchableSelect
                  placeholder="Seleccionar área..."
                  options={areas}
                  value={formData.area}
                  onValueChange={(value) => handleInputChange("area", value)}
                  loading={loadingAreas}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Información del Equipo */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Información del Equipo
            </h3>
            
            {/* Botones iniciales */}
            {modoIngresoEquipo === "inicial" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={() => setIsEquipmentSearchModalOpen(true)}
                  className="h-16 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-5 h-5 mb-1" />
                  <span className="text-sm">Buscar en Base de Datos</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setModoIngresoEquipo("manual")}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-sm">Ingresar Manualmente</span>
                </Button>
              </div>
            )}
            
            {/* Card de equipo seleccionado */}
            {modoIngresoEquipo === "seleccionado" && equipoSeleccionado && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-md font-semibold text-blue-900">Equipo Seleccionado</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setModoIngresoEquipo("inicial");
                      setEquipoSeleccionado(null);
                      setFormData(prev => ({
                        ...prev,
                        equipo: "",
                        modelo: "",
                        serie: "",
                        marca: "",
                        numeroInventario: ""
                      }));
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cambiar Equipo
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Nombre</p>
                    <p className="text-sm font-medium text-gray-900">{equipoSeleccionado.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Código</p>
                    <p className="text-sm font-medium text-gray-900">{equipoSeleccionado.code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Marca</p>
                    <p className="text-sm font-medium text-gray-900">{equipoSeleccionado.marca || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Modelo</p>
                    <p className="text-sm font-medium text-gray-900">{equipoSeleccionado.modelo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Serie</p>
                    <p className="text-sm font-medium text-gray-900">{equipoSeleccionado.serial || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Campos manuales */}
            {modoIngresoEquipo === "manual" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setModoIngresoEquipo("inicial")}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Equipo *
                    </Label>
                    <Input
                      value={formData.equipo}
                      onChange={(e) => handleInputChange("equipo", e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Nombre del equipo"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Modelo
                    </Label>
                    <Input
                      value={formData.modelo}
                      onChange={(e) => handleInputChange("modelo", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Serie
                    </Label>
                    <Input
                      value={formData.serie}
                      onChange={(e) => handleInputChange("serie", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Marca
                    </Label>
                    <Input
                      value={formData.marca}
                      onChange={(e) => handleInputChange("marca", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      No. Inventario
                    </Label>
                    <Input
                      value={formData.numeroInventario}
                      onChange={(e) => handleInputChange("numeroInventario", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tipo de Arreglo
                    </Label>
                    <Select
                      value={formData.tipoArreglo}
                      onValueChange={(value) => handleInputChange("tipoArreglo", value)}
                    >
                      <SelectTrigger className="h-9 text-sm">
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
            )}
          </div>

          {/* Descripción del Problema */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              Descripción del Problema *
            </h3>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Descripción detallada del problema presentado
              </Label>
              <Textarea
                value={formData.descripcionProblema}
                onChange={(e) =>
                  handleInputChange("descripcionProblema", e.target.value)
                }
                rows={6}
                placeholder="Describa el problema del equipo de manera detallada..."
                className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.descripcionProblema.length} caracteres
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-8 px-4 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className={`${getHeaderColor()} hover:opacity-90 h-8 px-4 text-xs`}
            >
              Crear Orden
            </Button>
          </div>
        </div>

        <DigitalSignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSave={saveSignature}
          signerName={currentSigner}
        />
        <EvidenceUploadModal
          isOpen={isEvidenceModalOpen}
          onClose={() => setIsEvidenceModalOpen(false)}
          onSave={saveEvidences}
          ticketType={ticketType}
        />
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
