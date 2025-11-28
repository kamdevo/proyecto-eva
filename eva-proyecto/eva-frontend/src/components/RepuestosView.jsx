import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/common/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Minus,
  Edit,
  Trash2,
  Package,
  Clock,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  FileSpreadsheet,
  Eye,
  Download,
  CheckCircle,
  Bell,
  AlertTriangle,
  Copy,
  Phone,
  History,
  XCircle,
  X,
  Save,
  Calendar,
  RotateCcw,
  Settings
} from "lucide-react";

// Función para obtener repuestos desde el API
const fetchRepuestosFromAPI = async (page = 1, perPage = 10, search = '', grupo = 'all') => {
  try {
    // Usar ruta relativa para aprovechar el proxy de Vite
    const url = `/api/v1/repuestos?page=${page}&per_page=${perPage}&search=${search}&grupo=${grupo}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      return { data: [], total: 0, current_page: 1, total_pages: 1 };
    }
    
    const result = await response.json();
    console.log('Result:', result);
    
    if (result.success) {
      return result.data;
    }
    return { data: [], total: 0, current_page: 1, total_pages: 1 };
  } catch (error) {
    console.error('Error fetching repuestos:', error);
    console.error('Error details:', error.message, error.stack);
    return { data: [], total: 0, current_page: 1, total_pages: 1 };
  }
};

// Datos iniciales (se reemplazarán con datos del API)
const initialRepuestos = [
  {
    id: 1,
    codigo: "MT1-001",
    nombre: "Filtro HEPA para Ventilador",
    precio: 125.50,
    grupo: "MT1",
    stock: 15,
    stockMinimo: 5,
    unidad: "Unidad",
    proveedor: "MedTech Solutions",
    fechaCreacion: "2024-01-15",
    estado: "Activo",
    ubicacion: "Almacén A-1",
    descripcion: "Filtro HEPA de alta eficiencia para sistemas de ventilación mecánica"
  },
  {
    id: 2,
    codigo: "DM1-002",
    nombre: "Sensor de Presión",
    precio: 89.75,
    grupo: "DM1",
    stock: 8,
    stockMinimo: 3,
    unidad: "Unidad",
    proveedor: "BioMed Components",
    fechaCreacion: "2024-01-10",
    estado: "Activo",
    ubicacion: "Almacén B-2",
    descripcion: "Sensor de presión arterial para monitores de signos vitales"
  },
  {
    id: 3,
    codigo: "ET1-003",
    nombre: "Batería de Respaldo UPS",
    precio: 245.00,
    grupo: "ET1",
    stock: 5,
    stockMinimo: 2,
    unidad: "Unidad",
    proveedor: "PowerTech Medical",
    fechaCreacion: "2024-01-05",
    estado: "Activo",
    ubicacion: "Almacén C-1",
    descripcion: "Batería de respaldo para sistemas UPS de equipos críticos"
  }
];

const equipos = [
  { id: 1, codigo: "VEN-001", nombre: "Ventilador Mecánico Dräger", servicio: "UCI", ubicacion: "UCI-Cama 1" },
  { id: 2, codigo: "MON-002", nombre: "Monitor Philips MP70", servicio: "Urgencias", ubicacion: "Urgencias-Box 3" },
  { id: 3, codigo: "UPS-003", nombre: "UPS APC 3000VA", servicio: "Quirófanos", ubicacion: "Quirófano 2" }
];

const servicios = [
  { id: 1, nombre: "UCI", responsable: "Dr. García" },
  { id: 2, nombre: "Urgencias", responsable: "Dr. Martínez" },
  { id: 3, nombre: "Quirófanos", responsable: "Dr. López" }
];

const usuarios = [
  { id: 1, nombre: "Juan Pérez", rol: "Técnico Biomédico", email: "juan.perez@huv.gov.co" },
  { id: 2, nombre: "Ana García", rol: "Ingeniera Biomédica", email: "ana.garcia@huv.gov.co" },
  { id: 3, nombre: "Carlos Rodríguez", rol: "Administrador", email: "carlos.rodriguez@huv.gov.co" }
];

const proveedores = [
  { id: 1, nombre: "MedTech Solutions", contacto: "María López", telefono: "300-123-4567", email: "ventas@medtech.com" },
  { id: 2, nombre: "BioMed Components", contacto: "Pedro Sánchez", telefono: "301-234-5678", email: "info@biomedcomp.com" },
  { id: 3, nombre: "PowerTech Medical", contacto: "Laura Gómez", telefono: "302-345-6789", email: "comercial@powertech.com" }
];

const compras = [
  {
    id: 1,
    numeroOrden: "OC-2024-001",
    fecha: "2024-01-20",
    proveedor: "MedTech Solutions",
    estado: "Entregado",
    total: 1255.00,
    comprador: "Ana García",
    items: [
      { repuestoId: 1, cantidad: 10, precioUnitario: 125.50 }
    ]
  },
  {
    id: 2,
    numeroOrden: "OC-2024-002",
    fecha: "2024-01-22",
    proveedor: "BioMed Components",
    estado: "Pendiente",
    total: 717.50,
    comprador: "Carlos Rodríguez",
    items: [
      { repuestoId: 2, cantidad: 8, precioUnitario: 89.75 }
    ]
  }
];

const movimientos = [
  {
    id: 1,
    repuestoId: 1,
    tipo: "Entrada",
    cantidad: 10,
    fecha: "2024-01-20",
    usuario: "Ana García",
    razon: "Compra - OC-2024-001",
    stockAnterior: 5,
    stockNuevo: 15
  },
  {
    id: 2,
    repuestoId: 1,
    tipo: "Salida",
    cantidad: 2,
    fecha: "2024-01-25",
    usuario: "Juan Pérez",
    razon: "Instalación en VEN-001",
    stockAnterior: 15,
    stockNuevo: 13
  }
];

const equipoRepuestos = [
  {
    id: 1,
    equipoId: 1,
    repuestoId: 1,
    fechaInstalacion: "2024-01-25",
    tecnico: "Juan Pérez",
    observaciones: "Mantenimiento preventivo programado",
    estado: "Instalado"
  }
];

// Datos calculados para reportes
const getRepuestosInstalados = () => {
  return equipoRepuestos.map(er => {
    const equipo = equipos.find(e => e.id === er.equipoId);
    const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
    return {
      equipo: equipo?.nombre || 'N/A',
      codigo: equipo?.codigo || 'N/A',
      repuesto: repuesto?.nombre || 'N/A',
      codigoRepuesto: repuesto?.codigo || 'N/A',
      fecha: er.fechaInstalacion,
      tecnico: er.tecnico,
      servicio: equipo?.servicio || 'N/A',
      observaciones: er.observaciones
    };
  });
};

const getRepuestosPendientes = () => {
  return compras.filter(c => c.estado === 'Pendiente').flatMap(compra => 
    compra.items.map(item => {
      const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
      return {
        codigo: repuesto?.codigo || 'N/A',
        nombre: repuesto?.nombre || 'N/A',
        cantidad: item.cantidad,
        proveedor: compra.proveedor,
        fechaOrden: compra.fecha,
        numeroOrden: compra.numeroOrden,
        comprador: compra.comprador
      };
    })
  );
};

const getResumenPorRepuestos = () => {
  return initialRepuestos.map(repuesto => {
    const movimientosRepuesto = movimientos.filter(m => m.repuestoId === repuesto.id);
    const entradas = movimientosRepuesto.filter(m => m.tipo === 'Entrada').reduce((sum, m) => sum + m.cantidad, 0);
    const salidas = movimientosRepuesto.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0);
    return {
      codigo: repuesto.codigo,
      nombre: repuesto.nombre,
      stockActual: repuesto.stock,
      entradas,
      salidas,
      valorInventario: repuesto.stock * repuesto.precio,
      estado: repuesto.stock <= repuesto.stockMinimo ? 'Stock Bajo' : 'Normal'
    };
  });
};

const getInversionPorEquipo = () => {
  return equipos.map(equipo => {
    const repuestosEquipo = equipoRepuestos.filter(er => er.equipoId === equipo.id);
    const inversion = repuestosEquipo.reduce((total, er) => {
      const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
      return total + (repuesto?.precio || 0);
    }, 0);
    return {
      codigo: equipo.codigo,
      nombre: equipo.nombre,
      servicio: equipo.servicio,
      cantidadRepuestos: repuestosEquipo.length,
      inversionTotal: inversion
    };
  });
};

const getInversionPorServicio = () => {
  return servicios.map(servicio => {
    const equiposServicio = equipos.filter(e => e.servicio === servicio.nombre);
    const inversion = equiposServicio.reduce((total, equipo) => {
      const repuestosEquipo = equipoRepuestos.filter(er => er.equipoId === equipo.id);
      return total + repuestosEquipo.reduce((subtotal, er) => {
        const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
        return subtotal + (repuesto?.precio || 0);
      }, 0);
    }, 0);
    return {
      servicio: servicio.nombre,
      responsable: servicio.responsable,
      cantidadEquipos: equiposServicio.length,
      inversionTotal: inversion
    };
  });
};

function RepuestosView() {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [grupoFilter, setGrupoFilter] = useState('all');
  const [activeTab, setActiveTab] = useState("lista");

  // Cargar repuestos desde el API
  useEffect(() => {
    const loadRepuestos = async () => {
      setLoading(true);
      const data = await fetchRepuestosFromAPI(currentPage, 10, searchTerm, grupoFilter);
      setRepuestos(data.data || []);
      setTotalPages(data.total_pages || 1);
      setTotalItems(data.total || 0);
      setLoading(false);
    };
    loadRepuestos();
  }, [currentPage, searchTerm, grupoFilter]);
  const [selectedRepuesto, setSelectedRepuesto] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  
  // Estados para modales
  const [showInstalados, setShowInstalados] = useState(false);
  const [showPendientes, setShowPendientes] = useState(false);
  const [showResumenRepuestos, setShowResumenRepuestos] = useState(false);
  const [showResumenGeneral, setShowResumenGeneral] = useState(false);
  const [showInversionEquipo, setShowInversionEquipo] = useState(false);
  const [showInversionServicio, setShowInversionServicio] = useState(false);
  const [showCompras, setShowCompras] = useState(false);
  const [showMovimientos, setShowMovimientos] = useState(false);
  const [showProveedores, setShowProveedores] = useState(false);
  const [showDetalleRepuesto, setShowDetalleRepuesto] = useState(false);
  const [repuestoDetalle, setRepuestoDetalle] = useState(null);
  
  // Estados para sub-modales
  const [showSubModalEquipos, setShowSubModalEquipos] = useState(false);
  const [showSubModalMovimientos, setShowSubModalMovimientos] = useState(false);
  const [showSubModalCompraDetalle, setShowSubModalCompraDetalle] = useState(false);
  const [showSubModalNuevaCompra, setShowSubModalNuevaCompra] = useState(false);
  const [showSubModalEditarProveedor, setShowSubModalEditarProveedor] = useState(false);
  const [showSubModalNuevoProveedor, setShowSubModalNuevoProveedor] = useState(false);
  const [showSubModalAsignarEquipo, setShowSubModalAsignarEquipo] = useState(false);
  const [showSubModalHistorialEquipo, setShowSubModalHistorialEquipo] = useState(false);
  
  // Estados para datos seleccionados
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  
  // Estados para formularios de sub-modales
  const [formCompra, setFormCompra] = useState({
    numeroOrden: '',
    proveedor: '',
    comprador: '',
    items: [],
    observaciones: ''
  });
  
  const [formProveedor, setFormProveedor] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: ''
  });
  
  const [formAsignacion, setFormAsignacion] = useState({
    equipoId: '',
    repuestoId: '',
    cantidad: 1,
    observaciones: '',
    tecnico: ''
  });
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    precio: "",
    grupo: "MT1",
    proveedor: "",
    estado: "Activo",
    stockMinimo: "",
    unidad: "Unidad",
    ubicacion: "",
    descripcion: ""
  });
  
  const [stockData, setStockData] = useState({
    id: "",
    stockActual: 0,
    cantidad: "",
    razon: "",
    operacion: "sumar"
  });
  
  // Estados para filtros avanzados
  const [filtros, setFiltros] = useState({
    busqueda: "",
    grupo: "todos",
    proveedor: "todos",
    estado: "todos",
    stockBajo: false,
    fechaDesde: "",
    fechaHasta: ""
  });
  
  // Estados para paginación
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    porPagina: 10,
    total: 0
  });
  
  // Usuario actual (simulado)
  const [usuarioActual] = useState({
    id: 1,
    nombre: "Ana García",
    rol: "Administrador",
    permisos: ["ver", "editar", "eliminar", "exportar"]
  });

  // Funciones de manejo
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch(tab) {
      case "instalados":
        setShowInstalados(true);
        break;
      case "pendientes":
        setShowPendientes(true);
        break;
      case "resumen-repuestos":
        setShowResumenRepuestos(true);
        break;
      case "resumen-general":
        setShowResumenGeneral(true);
        break;
      case "inversion-equipo":
        setShowInversionEquipo(true);
        break;
      case "inversion-servicio":
        setShowInversionServicio(true);
        break;
    }
  };
  
  // Funciones para navegación entre modales
  const abrirDetalleCompra = (compra) => {
    setCompraSeleccionada(compra);
    setShowSubModalCompraDetalle(true);
  };
  
  const abrirHistorialEquipo = (equipo) => {
    setEquipoSeleccionado(equipo);
    setShowSubModalHistorialEquipo(true);
  };
  
  const abrirEditarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setFormProveedor({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion || '',
      ciudad: proveedor.ciudad || ''
    });
    setShowSubModalEditarProveedor(true);
  };
  
  const crearNuevaCompra = () => {
    setFormCompra({
      numeroOrden: `OC-${new Date().getFullYear()}-${String(compras.length + 1).padStart(3, '0')}`,
      proveedor: '',
      comprador: usuarioActual.nombre,
      items: [],
      observaciones: ''
    });
    setShowSubModalNuevaCompra(true);
  };
  
  const asignarRepuestoAEquipo = (repuesto) => {
    setFormAsignacion({
      equipoId: '',
      repuestoId: repuesto.id,
      cantidad: 1,
      observaciones: '',
      tecnico: usuarioActual.nombre
    });
    setShowSubModalAsignarEquipo(true);
  };

  const handleEditRepuesto = (repuesto) => {
    if (!usuarioActual.permisos.includes("editar")) {
      agregarNotificacion('error', 'No tienes permisos para editar repuestos');
      return;
    }
    setSelectedRepuesto(repuesto);
    setFormData({
      nombre: repuesto.nombre,
      codigo: repuesto.codigo,
      precio: repuesto.precio.toString(),
      grupo: repuesto.grupo,
      proveedor: repuesto.proveedor || "",
      estado: repuesto.estado || "Activo",
      stockMinimo: repuesto.stockMinimo?.toString() || "",
      unidad: repuesto.unidad || "Unidad",
      ubicacion: repuesto.ubicacion || "",
      descripcion: repuesto.descripcion || ""
    });
    setIsEditMode(true);
    agregarNotificacion('info', `Editando repuesto: ${repuesto.nombre}`);
  };

  const handleSaveRepuesto = () => {
    // Validaciones
    if (!formData.nombre || !formData.codigo || !formData.precio) {
      agregarNotificacion('error', 'Complete los campos obligatorios: nombre, código y precio');
      return;
    }
    
    if (parseFloat(formData.precio) <= 0) {
      agregarNotificacion('error', 'El precio debe ser mayor a 0');
      return;
    }
    
    // Verificar código único
    const codigoExiste = repuestos.some(r => 
      r.codigo === formData.codigo && (!isEditMode || r.id !== selectedRepuesto?.id)
    );
    
    if (codigoExiste) {
      agregarNotificacion('error', `El código ${formData.codigo} ya existe`);
      return;
    }

    if (isEditMode && selectedRepuesto) {
      setRepuestos(repuestos.map(r => 
        r.id === selectedRepuesto.id 
          ? { 
              ...r, 
              ...formData, 
              precio: parseFloat(formData.precio),
              stockMinimo: parseInt(formData.stockMinimo) || 0
            }
          : r
      ));
      agregarNotificacion('success', `Repuesto ${formData.nombre} actualizado exitosamente`);
    } else {
      const newId = Math.max(...repuestos.map(r => r.id)) + 1;
      const nuevoRepuesto = {
        id: newId,
        ...formData,
        precio: parseFloat(formData.precio),
        stockMinimo: parseInt(formData.stockMinimo) || 0,
        stock: 0,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setRepuestos([...repuestos, nuevoRepuesto]);
      agregarNotificacion('success', `Repuesto ${formData.nombre} creado exitosamente`, {
        texto: 'Agregar Stock',
        funcion: () => handleStockFormOpen(nuevoRepuesto)
      });
    }
    resetForm();
  };
  
  // Función de filtrado avanzado
  const repuestosFiltrados = repuestos.filter(repuesto => {
    const cumpleBusqueda = !filtros.busqueda || 
      repuesto.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      repuesto.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleGrupo = filtros.grupo === "todos" || repuesto.grupo === filtros.grupo;
    const cumpleProveedor = filtros.proveedor === "todos" || repuesto.proveedor === filtros.proveedor;
    const cumpleEstado = filtros.estado === "todos" || repuesto.estado === filtros.estado;
    const cumpleStockBajo = !filtros.stockBajo || repuesto.stock <= repuesto.stockMinimo;
    
    return cumpleBusqueda && cumpleGrupo && cumpleProveedor && cumpleEstado && cumpleStockBajo;
  });
  
  // Paginación
  const totalPaginas = Math.ceil(repuestosFiltrados.length / paginacion.porPagina);
  const indiceInicio = (paginacion.pagina - 1) * paginacion.porPagina;
  const repuestosPaginados = repuestosFiltrados.slice(indiceInicio, indiceInicio + paginacion.porPagina);
  
  // FUNCIÓN DE EXPORTACIÓN COMPLETA
  const exportarDatos = (formato) => {
    if (!usuarioActual.permisos.includes("exportar")) {
      agregarNotificacion('error', 'No tienes permisos para exportar datos');
      return;
    }
    
    const datos = repuestosFiltrados.map(r => ({
      'Código': r.codigo,
      'Nombre': r.nombre,
      'Grupo': r.grupo,
      'Stock': r.stock,
      'Stock Mínimo': r.stockMinimo,
      'Precio': r.precio,
      'Valor Inventario': (r.stock * r.precio).toFixed(2),
      'Proveedor': r.proveedor,
      'Estado': r.estado,
      'Ubicación': r.ubicacion,
      'Fecha Creación': r.fechaCreacion
    }));
    
    if (formato === 'Excel' || formato === 'CSV') {
      const csv = [
        Object.keys(datos[0]),
        ...datos.map(d => Object.values(d))
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repuestos_${formato.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      agregarNotificacion('success', `${repuestosFiltrados.length} registros exportados en ${formato}`);
    } else if (formato === 'PDF') {
      // Simular exportación PDF
      agregarNotificacion('info', 'Generando PDF...', {
        texto: 'Descargar',
        funcion: () => agregarNotificacion('success', 'PDF generado exitosamente')
      });
    }
  };
  
  // FUNCIONES COMPLETAS DE SUB-MODALES Y NOTIFICACIONES
  const [notificaciones, setNotificaciones] = useState([]);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  
  const agregarNotificacion = (tipo, mensaje, accion = null) => {
    const nuevaNotificacion = {
      id: Date.now(),
      tipo, // 'success', 'warning', 'error', 'info'
      mensaje,
      accion,
      timestamp: new Date().toLocaleString(),
      leida: false
    };
    setNotificaciones(prev => [nuevaNotificacion, ...prev.slice(0, 9)]); // Máximo 10 notificaciones
    
    // Auto-ocultar después de 5 segundos para success e info
    if (tipo === 'success' || tipo === 'info') {
      setTimeout(() => {
        setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotificacion.id));
      }, 5000);
    }
  };

  const guardarCompra = () => {
    if (!formCompra.proveedor || !formCompra.items.length) {
      agregarNotificacion('error', 'Complete todos los campos obligatorios');
      return;
    }
    
    const nuevaCompra = {
      id: compras.length + 1,
      ...formCompra,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      total: formCompra.items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0)
    };
    
    // Simular guardado en base de datos
    compras.push(nuevaCompra);
    
    agregarNotificacion('success', `Orden ${nuevaCompra.numeroOrden} creada exitosamente`, {
      texto: 'Ver Orden',
      funcion: () => {
        setShowCompras(true);
        setShowSubModalNuevaCompra(false);
      }
    });
    
    // Limpiar formulario
    setFormCompra({
      numeroOrden: '',
      proveedor: '',
      comprador: '',
      items: [],
      observaciones: ''
    });
    setShowSubModalNuevaCompra(false);
  };
  
  const guardarProveedor = () => {
    if (!formProveedor.nombre || !formProveedor.contacto) {
      agregarNotificacion('error', 'Nombre y contacto son obligatorios');
      return;
    }
    
    if (proveedorSeleccionado) {
      // Actualizar proveedor existente
      const index = proveedores.findIndex(p => p.id === proveedorSeleccionado.id);
      if (index !== -1) {
        proveedores[index] = { ...proveedorSeleccionado, ...formProveedor };
        agregarNotificacion('success', `Proveedor ${formProveedor.nombre} actualizado`);
      }
    } else {
      // Crear nuevo proveedor
      const nuevoProveedor = {
        id: proveedores.length + 1,
        ...formProveedor
      };
      proveedores.push(nuevoProveedor);
      agregarNotificacion('success', `Proveedor ${formProveedor.nombre} creado exitosamente`, {
        texto: 'Nueva Compra',
        funcion: () => {
          setFormCompra({...formCompra, proveedor: formProveedor.nombre});
          crearNuevaCompra();
        }
      });
    }
    
    setShowSubModalEditarProveedor(false);
    setShowSubModalNuevoProveedor(false);
    setProveedorSeleccionado(null);
  };
  
  const guardarAsignacion = () => {
    if (!formAsignacion.equipoId || !formAsignacion.repuestoId) {
      agregarNotificacion('error', 'Seleccione equipo y repuesto');
      return;
    }
    
    const equipo = equipos.find(e => e.id === parseInt(formAsignacion.equipoId));
    const repuesto = repuestos.find(r => r.id === formAsignacion.repuestoId);
    
    if (repuesto.stock < formAsignacion.cantidad) {
      agregarNotificacion('warning', `Stock insuficiente. Disponible: ${repuesto.stock}`);
      return;
    }
    
    const nuevaAsignacion = {
      id: equipoRepuestos.length + 1,
      equipoId: parseInt(formAsignacion.equipoId),
      repuestoId: formAsignacion.repuestoId,
      fechaInstalacion: new Date().toISOString().split('T')[0],
      tecnico: formAsignacion.tecnico,
      observaciones: formAsignacion.observaciones,
      estado: 'Instalado'
    };
    
    // Actualizar stock del repuesto
    const repuestoIndex = repuestos.findIndex(r => r.id === formAsignacion.repuestoId);
    if (repuestoIndex !== -1) {
      setRepuestos(prev => prev.map(r => 
        r.id === formAsignacion.repuestoId 
          ? { ...r, stock: r.stock - formAsignacion.cantidad }
          : r
      ));
    }
    
    // Agregar movimiento de stock
    const nuevoMovimiento = {
      id: movimientos.length + 1,
      repuestoId: formAsignacion.repuestoId,
      tipo: 'Salida',
      cantidad: formAsignacion.cantidad,
      fecha: new Date().toISOString().split('T')[0],
      usuario: formAsignacion.tecnico,
      razon: `Instalación en ${equipo?.nombre}`,
      stockAnterior: repuesto.stock,
      stockNuevo: repuesto.stock - formAsignacion.cantidad
    };
    movimientos.push(nuevoMovimiento);
    
    equipoRepuestos.push(nuevaAsignacion);
    
    agregarNotificacion('success', `${repuesto.nombre} instalado en ${equipo?.nombre}`, {
      texto: 'Ver Instalaciones',
      funcion: () => {
        setShowInstalados(true);
        setShowSubModalAsignarEquipo(false);
      }
    });
    
    setShowSubModalAsignarEquipo(false);
    setFormAsignacion({
      equipoId: '',
      repuestoId: '',
      cantidad: 1,
      observaciones: '',
      tecnico: ''
    });
  };

  // FUNCIONES AVANZADAS DE GESTIÓN
  const procesarRecepcionCompleta = (compra, itemsRecibidos) => {
    let recepcionCompleta = true;
    let itemsParciales = 0;
    
    itemsRecibidos.forEach((item, index) => {
      const itemOriginal = compra.items[index];
      if (item.cantidadRecibida < itemOriginal.cantidad) {
        recepcionCompleta = false;
        itemsParciales++;
      }
      
      // Actualizar stock del repuesto
      const repuestoIndex = repuestos.findIndex(r => r.id === itemOriginal.repuestoId);
      if (repuestoIndex !== -1) {
        setRepuestos(prev => prev.map(r => 
          r.id === itemOriginal.repuestoId 
            ? { ...r, stock: r.stock + item.cantidadRecibida }
            : r
        ));
        
        // Agregar movimiento de entrada
        const nuevoMovimiento = {
          id: movimientos.length + 1,
          repuestoId: itemOriginal.repuestoId,
          tipo: 'Entrada',
          cantidad: item.cantidadRecibida,
          fecha: new Date().toISOString().split('T')[0],
          usuario: usuarioActual.nombre,
          razon: `Recepción ${compra.numeroOrden}`,
          stockAnterior: repuestos[repuestoIndex].stock,
          stockNuevo: repuestos[repuestoIndex].stock + item.cantidadRecibida
        };
        movimientos.push(nuevoMovimiento);
      }
    });
    
    // Actualizar estado de la compra
    const compraIndex = compras.findIndex(c => c.id === compra.id);
    if (compraIndex !== -1) {
      compras[compraIndex] = {
        ...compra,
        estado: recepcionCompleta ? 'Entregado' : 'Parcial',
        fechaEntregaReal: new Date().toISOString().split('T')[0]
      };
    }
    
    if (recepcionCompleta) {
      agregarNotificacion('success', `Recepción completa de ${compra.numeroOrden}`);
    } else {
      agregarNotificacion('warning', `Recepción parcial: ${itemsParciales} items incompletos`, {
        texto: 'Gestionar Pendientes',
        funcion: () => setShowPendientes(true)
      });
    }
  };
  
  const programarMantenimientoAutomatico = (equipo, repuesto) => {
    const proximaFecha = new Date();
    proximaFecha.setMonth(proximaFecha.getMonth() + 3); // 3 meses después
    
    const mantenimiento = {
      id: Date.now(),
      equipoId: equipo.id,
      repuestoId: repuesto.id,
      fechaProgramada: proximaFecha.toISOString().split('T')[0],
      tipo: 'Preventivo',
      estado: 'Programado',
      tecnicoAsignado: usuarioActual.nombre
    };
    
    agregarNotificacion('info', `Mantenimiento programado para ${equipo.nombre} el ${proximaFecha.toLocaleDateString()}`, {
      texto: 'Ver Calendario',
      funcion: () => alert('Abriendo calendario de mantenimientos...')
    });
  };
  
  const verificarStockCritico = () => {
    const repuestosCriticos = repuestos.filter(r => r.stock <= r.stockMinimo);
    
    if (repuestosCriticos.length > 0) {
      agregarNotificacion('warning', `${repuestosCriticos.length} repuestos con stock crítico`, {
        texto: 'Generar Órdenes',
        funcion: () => {
          repuestosCriticos.forEach(repuesto => {
            const proveedor = proveedores.find(p => p.nombre === repuesto.proveedor);
            if (proveedor) {
              const nuevaOrden = {
                id: compras.length + 1,
                numeroOrden: `OC-${new Date().getFullYear()}-${String(compras.length + 1).padStart(3, '0')}`,
                proveedor: proveedor.nombre,
                comprador: usuarioActual.nombre,
                fecha: new Date().toISOString().split('T')[0],
                estado: 'Pendiente',
                items: [{
                  repuestoId: repuesto.id,
                  cantidad: repuesto.stockMinimo * 2,
                  precioUnitario: repuesto.precio
                }],
                total: repuesto.precio * repuesto.stockMinimo * 2,
                observaciones: 'Orden automática por stock crítico'
              };
              compras.push(nuevaOrden);
            }
          });
          agregarNotificacion('success', `${repuestosCriticos.length} órdenes automáticas generadas`);
        }
      });
    }
  };
  
  // FUNCIONALIDADES AVANZADAS FINALES
  const [busquedaAvanzada, setBusquedaAvanzada] = useState(false);
  const [filtrosRapidos, setFiltrosRapidos] = useState({
    stockCritico: false,
    sinStock: false,
    nuevos: false,
    masUsados: false
  });
  
  // Verificar stock crítico al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      verificarStockCritico();
    }, 2000);
    return () => clearTimeout(timer);
  }, [repuestos]);
  
  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            resetForm();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector('input[placeholder="Nombre o código..."]')?.focus();
            break;
          case 's':
            e.preventDefault();
            setShowStockForm(true);
            break;
          case 'e':
            e.preventDefault();
            exportarDatos('Excel');
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Aplicar filtros rápidos
  const aplicarFiltrosRapidos = (repuestosFiltrados) => {
    let resultado = repuestosFiltrados;
    
    if (filtrosRapidos.stockCritico) {
      resultado = resultado.filter(r => r.stock <= r.stockMinimo);
    }
    if (filtrosRapidos.sinStock) {
      resultado = resultado.filter(r => r.stock === 0);
    }
    if (filtrosRapidos.nuevos) {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      resultado = resultado.filter(r => new Date(r.fechaCreacion) >= hace30Dias);
    }
    if (filtrosRapidos.masUsados) {
      const repuestosConMovimientos = resultado.map(r => ({
        ...r,
        totalMovimientos: movimientos.filter(m => m.repuestoId === r.id).reduce((sum, m) => sum + m.cantidad, 0)
      }));
      resultado = repuestosConMovimientos
        .sort((a, b) => b.totalMovimientos - a.totalMovimientos)
        .slice(0, Math.ceil(resultado.length * 0.2));
    }
    
    return resultado;
  };
  
  // Búsqueda inteligente
  const busquedaInteligente = (termino, repuestos) => {
    if (!termino) return repuestos;
    
    const palabras = termino.toLowerCase().split(' ');
    return repuestos.filter(repuesto => {
      const textoCompleto = `${repuesto.nombre} ${repuesto.codigo} ${repuesto.descripcion} ${repuesto.proveedor} ${repuesto.grupo}`.toLowerCase();
      return palabras.every(palabra => textoCompleto.includes(palabra));
    });
  };
  
  // Generar sugerencias de compra
  const generarSugerenciasCompra = () => {
    const sugerencias = repuestos
      .filter(r => r.stock <= r.stockMinimo)
      .map(r => {
        const movimientosRecientes = movimientos
          .filter(m => m.repuestoId === r.id && m.tipo === 'Salida')
          .slice(-5);
        const promedioUso = movimientosRecientes.length > 0 
          ? movimientosRecientes.reduce((sum, m) => sum + m.cantidad, 0) / movimientosRecientes.length 
          : r.stockMinimo;
        
        return {
          ...r,
          cantidadSugerida: Math.max(Math.ceil(promedioUso * 2), r.stockMinimo * 2),
          prioridad: r.stock === 0 ? 'Alta' : 'Media'
        };
      })
      .sort((a, b) => {
        if (a.prioridad === 'Alta' && b.prioridad !== 'Alta') return -1;
        if (b.prioridad === 'Alta' && a.prioridad !== 'Alta') return 1;
        return 0;
      });
    
    if (sugerencias.length > 0) {
      const mensaje = sugerencias.slice(0, 5).map(s => 
        `${s.codigo}: ${s.cantidadSugerida} unidades (${s.prioridad})`
      ).join('\n');
      
      agregarNotificacion('info', `Sugerencias de compra (${sugerencias.length})`, {
        texto: 'Ver Todas',
        funcion: () => alert(`Sugerencias de compra:\n\n${mensaje}`)
      });
    }
  };

  const resetForm = () => {
    setFormData({ 
      nombre: "", 
      codigo: "", 
      precio: "", 
      grupo: "MT1",
      proveedor: "",
      estado: "Activo",
      stockMinimo: "",
      unidad: "Unidad",
      ubicacion: "",
      descripcion: ""
    });
    setSelectedRepuesto(null);
    setIsEditMode(false);
  };

  const handleStockOperation = () => {
    const repuesto = repuestos.find(r => r.id === parseInt(stockData.id));
    if (!repuesto) {
      agregarNotificacion('error', 'Repuesto no encontrado');
      return;
    }

    if (!stockData.cantidad || !stockData.razon) {
      agregarNotificacion('error', 'Complete cantidad y razón del movimiento');
      return;
    }

    const cantidad = parseInt(stockData.cantidad);
    const newStock = stockData.operacion === "sumar" 
      ? repuesto.stock + cantidad 
      : repuesto.stock - cantidad;

    if (newStock < 0) {
      agregarNotificacion('error', 'No se puede reducir el stock por debajo de 0');
      return;
    }

    // Actualizar stock
    setRepuestos(repuestos.map(r => 
      r.id === parseInt(stockData.id) 
        ? { ...r, stock: newStock }
        : r
    ));
    
    // Registrar movimiento
    const nuevoMovimiento = {
      id: movimientos.length + 1,
      repuestoId: parseInt(stockData.id),
      tipo: stockData.operacion === 'sumar' ? 'Entrada' : 'Salida',
      cantidad: cantidad,
      fecha: new Date().toISOString().split('T')[0],
      usuario: usuarioActual.nombre,
      razon: stockData.razon,
      stockAnterior: repuesto.stock,
      stockNuevo: newStock
    };
    movimientos.push(nuevoMovimiento);
    
    agregarNotificacion('success', `Stock ${stockData.operacion === 'sumar' ? 'aumentado' : 'reducido'}: ${repuesto.nombre}`, {
      texto: 'Ver Movimientos',
      funcion: () => setShowMovimientos(true)
    });
    
    // Verificar si queda en stock crítico
    if (newStock <= repuesto.stockMinimo) {
      agregarNotificacion('warning', `${repuesto.nombre} ahora tiene stock crítico (${newStock})`, {
        texto: 'Crear Orden',
        funcion: () => {
          setFormCompra({...formCompra, proveedor: repuesto.proveedor});
          crearNuevaCompra();
        }
      });
    }
    
    setStockData({ id: "", stockActual: 0, cantidad: "", razon: "", operacion: "sumar" });
    setShowStockForm(false);
  };

  const handleStockFormOpen = (repuesto) => {
    setStockData({
      id: repuesto.id.toString(),
      stockActual: repuesto.stock,
      cantidad: "",
      razon: "",
      operacion: "sumar"
    });
    setShowStockForm(true);
  };

  // MODAL REPUESTOS INSTALADOS FUNCIONAL
  const ModalInstalados = () => {
    const [filtros, setFiltros] = useState({ equipo: 'todos', fechaDesde: '', fechaHasta: '' });
    
    const instalacionesConDatos = equipoRepuestos.map(er => {
      const equipo = equipos.find(e => e.id === er.equipoId);
      const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
      return { ...er, equipo, repuesto };
    }).filter(inst => {
      return (filtros.equipo === 'todos' || inst.equipoId.toString() === filtros.equipo) &&
             (!filtros.fechaDesde || inst.fechaInstalacion >= filtros.fechaDesde) &&
             (!filtros.fechaHasta || inst.fechaInstalacion <= filtros.fechaHasta);
    });

    const exportarInstalados = () => {
      const csv = [
        ['Fecha', 'Equipo', 'Repuesto', 'Técnico', 'Observaciones'],
        ...instalacionesConDatos.map(i => [i.fechaInstalacion, i.equipo?.nombre, i.repuesto?.nombre, i.tecnico, i.observaciones])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'repuestos_instalados.csv';
      a.click();
    };

    return (
      <Dialog open={showInstalados} onOpenChange={setShowInstalados}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Repuestos Instalados - Gestión Completa
            </DialogTitle>
            <DialogDescription>
              Historial completo de instalaciones con funciones de seguimiento
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Equipo</Label>
              <Select value={filtros.equipo} onValueChange={(value) => setFiltros({...filtros, equipo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {equipos.map(eq => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>{eq.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Desde</Label>
              <Input type="date" value={filtros.fechaDesde} onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})} />
            </div>
            <div>
              <Label>Hasta</Label>
              <Input type="date" value={filtros.fechaHasta} onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})} />
            </div>
          </div>

          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Repuesto</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instalacionesConDatos.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>{inst.fechaInstalacion}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inst.equipo?.nombre}</div>
                        <div className="text-sm text-gray-600">{inst.equipo?.servicio}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inst.repuesto?.nombre}</div>
                        <div className="text-sm text-gray-600 font-mono">{inst.repuesto?.codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell>{inst.tecnico}</TableCell>
                    <TableCell>
                      <Badge variant="default">{inst.estado}</Badge>
                    </TableCell>
                    <TableCell>{inst.observaciones}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={exportarInstalados}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // MODAL REPUESTOS PENDIENTES FUNCIONAL COMPLETO
  const ModalPendientes = () => {
    const [showRecepcion, setShowRecepcion] = useState(false);
    const [compraRecepcion, setCompraRecepcion] = useState(null);
    const [itemsRecepcion, setItemsRecepcion] = useState({});
    
    const comprasPendientes = compras.filter(c => c.estado === 'Pendiente');
    
    const abrirRecepcion = (compra) => {
      setCompraRecepcion(compra);
      const items = {};
      compra.items.forEach((item, index) => {
        items[index] = {
          cantidadRecibida: item.cantidad,
          estado: 'completo',
          observaciones: '',
          lote: '',
          fechaVencimiento: ''
        };
      });
      setItemsRecepcion(items);
      setShowRecepcion(true);
    };
    
    const procesarRecepcionCompleta = () => {
      if (!compraRecepcion) return;
      
      let recepcionCompleta = true;
      let itemsParciales = 0;
      
      // Procesar cada item
      Object.entries(itemsRecepcion).forEach(([index, datos]) => {
        const itemOriginal = compraRecepcion.items[index];
        const repuesto = repuestos.find(r => r.id === itemOriginal.repuestoId);
        
        if (datos.cantidadRecibida < itemOriginal.cantidad) {
          recepcionCompleta = false;
          itemsParciales++;
        }
        
        // Actualizar stock
        if (repuesto && datos.cantidadRecibida > 0) {
          const repuestoIndex = repuestos.findIndex(r => r.id === itemOriginal.repuestoId);
          if (repuestoIndex !== -1) {
            setRepuestos(prev => prev.map(r => 
              r.id === itemOriginal.repuestoId 
                ? { ...r, stock: r.stock + datos.cantidadRecibida }
                : r
            ));
            
            // Crear movimiento
            const nuevoMovimiento = {
              id: movimientos.length + 1,
              repuestoId: itemOriginal.repuestoId,
              tipo: 'Entrada',
              cantidad: datos.cantidadRecibida,
              fecha: new Date().toISOString().split('T')[0],
              usuario: usuarioActual.nombre,
              razon: `Recepción ${compraRecepcion.numeroOrden}`,
              stockAnterior: repuesto.stock,
              stockNuevo: repuesto.stock + datos.cantidadRecibida
            };
            movimientos.push(nuevoMovimiento);
          }
        }
      });
      
      // Actualizar compra
      const compraIndex = compras.findIndex(c => c.id === compraRecepcion.id);
      if (compraIndex !== -1) {
        compras[compraIndex] = {
          ...compraRecepcion,
          estado: recepcionCompleta ? 'Entregado' : 'Parcial',
          fechaEntregaReal: new Date().toISOString().split('T')[0],
          itemsRecibidos: Object.entries(itemsRecepcion).map(([index, datos]) => ({
            ...compraRecepcion.items[index],
            ...datos
          }))
        };
      }
      
      if (recepcionCompleta) {
        agregarNotificacion('success', `Recepción completa de ${compraRecepcion.numeroOrden}`);
      } else {
        agregarNotificacion('warning', `Recepción parcial: ${itemsParciales} items incompletos`);
      }
      
      setShowRecepcion(false);
      setCompraRecepcion(null);
    };
    
    const enviarRecordatorio = (compra) => {
      const diasVencimiento = Math.ceil((new Date(compra.fechaEntrega) - new Date()) / (1000 * 60 * 60 * 24));
      const mensaje = `Recordatorio enviado a ${compra.proveedor}\n\nOrden: ${compra.numeroOrden}\nFecha estimada: ${compra.fechaEntrega}\nDías restantes: ${diasVencimiento > 0 ? diasVencimiento : 'VENCIDA'}`;
      
      agregarNotificacion('info', `Recordatorio enviado a ${compra.proveedor}`, {
        texto: 'Ver Detalles',
        funcion: () => alert(mensaje)
      });
    };

    return (
      <Dialog open={showPendientes} onOpenChange={setShowPendientes}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Repuestos Pendientes - Control de Entregas
            </DialogTitle>
            <DialogDescription>
              Órdenes de compra pendientes de entrega con funciones de recepción
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{comprasPendientes.length}</div>
                <p className="text-sm text-gray-600">Órdenes Pendientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#1d293d]">
                  ${comprasPendientes.reduce((sum, c) => sum + c.total, 0).toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">Valor Pendiente</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {comprasPendientes.filter(c => new Date(c.fechaEntrega || '2024-12-31') < new Date()).length}
                </div>
                <p className="text-sm text-gray-600">Entregas Vencidas</p>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {comprasPendientes.map(compra => {
                const vencida = new Date(compra.fechaEntrega || '2024-12-31') < new Date();
                return (
                  <Card key={compra.id} className={vencida ? 'border-red-200 bg-red-50' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{compra.numeroOrden}</h4>
                            {vencida && <Badge variant="destructive">Vencida</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Proveedor:</strong> {compra.proveedor}</p>
                              <p><strong>Fecha Orden:</strong> {compra.fecha}</p>
                            </div>
                            <div>
                              <p><strong>Total:</strong> ${compra.total.toFixed(2)}</p>
                              <p><strong>Comprador:</strong> {compra.comprador}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm"><strong>Items:</strong></p>
                            <ul className="text-sm text-gray-600">
                              {compra.items.map((item, idx) => {
                                const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
                                return (
                                  <li key={idx}>• {repuesto?.nombre} - Cantidad: {item.cantidad}</li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={() => abrirRecepcion(compra)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Recibir
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => enviarRecordatorio(compra)}>
                            <Bell className="w-4 h-4 mr-2" />
                            Recordar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const detalles = compra.items.map(item => {
                              const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
                              return `${repuesto?.nombre}: ${item.cantidad} x $${item.precioUnitario}`;
                            }).join('\n');
                            alert(`${compra.numeroOrden}\n\n${detalles}\n\nTotal: $${compra.total.toFixed(2)}`);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => {
              const csv = [
                ['Orden', 'Proveedor', 'Total', 'Estado', 'Fecha Entrega'],
                ...comprasPendientes.map(c => [c.numeroOrden, c.proveedor, c.total, c.estado, c.fechaEntrega])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'repuestos_pendientes.csv';
              a.click();
              
              agregarNotificacion('success', 'Reporte de pendientes exportado');
            }}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Pendientes
            </Button>
          </DialogFooter>
          
          {/* Sub-Modal: Procesar Recepción */}
          <Dialog open={showRecepcion} onOpenChange={setShowRecepcion}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Procesar Recepción - {compraRecepcion?.numeroOrden}</DialogTitle>
              </DialogHeader>
              
              {compraRecepcion && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                    <div>
                      <Label>Proveedor</Label>
                      <p className="font-medium">{compraRecepcion.proveedor}</p>
                    </div>
                    <div>
                      <Label>Fecha Orden</Label>
                      <p>{compraRecepcion.fecha}</p>
                    </div>
                    <div>
                      <Label>Total Orden</Label>
                      <p className="font-semibold">${compraRecepcion.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-lg font-semibold">Items a Recibir</Label>
                    <div className="mt-2 space-y-3">
                      {compraRecepcion.items.map((item, index) => {
                        const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
                        const datosRecepcion = itemsRecepcion[index] || {};
                        
                        return (
                          <div key={index} className="p-4 border rounded">
                            <div className="grid grid-cols-6 gap-3">
                              <div className="col-span-2">
                                <Label className="text-sm">Repuesto</Label>
                                <p className="font-medium">{repuesto?.nombre}</p>
                                <p className="text-sm text-gray-600">{repuesto?.codigo}</p>
                              </div>
                              <div>
                                <Label className="text-sm">Pedido</Label>
                                <p className="font-semibold">{item.cantidad}</p>
                              </div>
                              <div>
                                <Label className="text-sm">Recibido</Label>
                                <Input 
                                  type="number"
                                  min="0"
                                  max={item.cantidad}
                                  value={datosRecepcion.cantidadRecibida || item.cantidad}
                                  onChange={(e) => setItemsRecepcion({
                                    ...itemsRecepcion,
                                    [index]: {
                                      ...datosRecepcion,
                                      cantidadRecibida: parseInt(e.target.value) || 0
                                    }
                                  })}
                                  className="w-20"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Estado</Label>
                                <Select 
                                  value={datosRecepcion.estado || 'completo'}
                                  onValueChange={(value) => setItemsRecepcion({
                                    ...itemsRecepcion,
                                    [index]: {
                                      ...datosRecepcion,
                                      estado: value
                                    }
                                  })}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="completo">Completo</SelectItem>
                                    <SelectItem value="parcial">Parcial</SelectItem>
                                    <SelectItem value="dañado">Dañado</SelectItem>
                                    <SelectItem value="faltante">Faltante</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Lote</Label>
                                <Input 
                                  value={datosRecepcion.lote || ''}
                                  onChange={(e) => setItemsRecepcion({
                                    ...itemsRecepcion,
                                    [index]: {
                                      ...datosRecepcion,
                                      lote: e.target.value
                                    }
                                  })}
                                  placeholder="Lote"
                                  className="w-24"
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <Label className="text-sm">Observaciones</Label>
                              <Input 
                                value={datosRecepcion.observaciones || ''}
                                onChange={(e) => setItemsRecepcion({
                                  ...itemsRecepcion,
                                  [index]: {
                                    ...datosRecepcion,
                                    observaciones: e.target.value
                                  }
                                })}
                                placeholder="Observaciones sobre el item recibido..."
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRecepcion(false)}>
                  Cancelar
                </Button>
                <Button onClick={procesarRecepcionCompleta}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Recepción
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    );
  };

  // MODAL RESUMEN POR REPUESTOS FUNCIONAL
  const ModalResumenRepuestos = () => {
    const [filtroCategoria, setFiltroCategoria] = useState('todos');
    const [ordenamiento, setOrdenamiento] = useState('valor');
    
    const resumenData = initialRepuestos.map(repuesto => {
      const movimientosRepuesto = movimientos.filter(m => m.repuestoId === repuesto.id);
      const entradas = movimientosRepuesto.filter(m => m.tipo === 'Entrada').reduce((sum, m) => sum + m.cantidad, 0);
      const salidas = movimientosRepuesto.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0);
      const valorInventario = repuesto.stock * repuesto.precio;
      const rotacion = salidas > 0 ? (entradas + salidas) / 2 / repuesto.stock : 0;
      
      return {
        ...repuesto,
        entradas,
        salidas,
        valorInventario,
        rotacion: rotacion.toFixed(2),
        estado: repuesto.stock <= repuesto.stockMinimo ? 'Stock Bajo' : 'Normal',
        eficiencia: rotacion > 2 ? 'Alta' : rotacion > 1 ? 'Media' : 'Baja'
      };
    });

    const filtrarYOrdenar = () => {
      let datos = resumenData;
      
      if (filtroCategoria !== 'todos') {
        datos = datos.filter(r => r.grupo === filtroCategoria);
      }
      
      return datos.sort((a, b) => {
        switch (ordenamiento) {
          case 'valor': return b.valorInventario - a.valorInventario;
          case 'rotacion': return b.rotacion - a.rotacion;
          case 'stock': return b.stock - a.stock;
          case 'nombre': return a.nombre.localeCompare(b.nombre);
          default: return 0;
        }
      });
    };

    const generarReporte = () => {
      const datos = filtrarYOrdenar();
      const csv = [
        ['Código', 'Nombre', 'Stock', 'Valor Inventario', 'Entradas', 'Salidas', 'Rotación', 'Estado'],
        ...datos.map(d => [d.codigo, d.nombre, d.stock, d.valorInventario.toFixed(2), d.entradas, d.salidas, d.rotacion, d.estado])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumen_repuestos_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    };

    const calcularMetricas = () => {
      const datos = filtrarYOrdenar();
      return {
        valorTotal: datos.reduce((sum, d) => sum + d.valorInventario, 0),
        stockBajo: datos.filter(d => d.estado === 'Stock Bajo').length,
        rotacionPromedio: datos.reduce((sum, d) => sum + parseFloat(d.rotacion), 0) / datos.length,
        itemsActivos: datos.filter(d => d.estado === 'Normal').length
      };
    };

    const metricas = calcularMetricas();

    return (
      <Dialog open={showResumenRepuestos} onOpenChange={setShowResumenRepuestos}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumen por Repuestos - Análisis Detallado
            </DialogTitle>
          </DialogHeader>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  ${metricas.valorTotal.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Valor Total Inventario</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{metricas.stockBajo}</div>
                <p className="text-sm text-gray-600">Items Stock Bajo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#1d293d]">{metricas.rotacionPromedio.toFixed(2)}</div>
                <p className="text-sm text-gray-600">Rotación Promedio</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{metricas.itemsActivos}</div>
                <p className="text-sm text-gray-600">Items Activos</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-end">
            <div>
              <Label>Categoría</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="MT1">MT1</SelectItem>
                  <SelectItem value="DM1">DM1</SelectItem>
                  <SelectItem value="ET1">ET1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ordenar por</Label>
              <Select value={ordenamiento} onValueChange={setOrdenamiento}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valor">Valor</SelectItem>
                  <SelectItem value="rotacion">Rotación</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="nombre">Nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generarReporte}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabla */}
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Repuesto</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Valor Inventario</TableHead>
                  <TableHead>Entradas</TableHead>
                  <TableHead>Salidas</TableHead>
                  <TableHead>Rotación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Eficiencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarYOrdenar().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.codigo}</TableCell>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={item.stock <= item.stockMinimo ? 'destructive' : 'default'}>
                        {item.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${item.valorInventario.toFixed(2)}</TableCell>
                    <TableCell className="text-green-600">{item.entradas}</TableCell>
                    <TableCell className="text-red-600">{item.salidas}</TableCell>
                    <TableCell>{item.rotacion}</TableCell>
                    <TableCell>
                      <Badge variant={item.estado === 'Stock Bajo' ? 'destructive' : 'default'}>
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.eficiencia === 'Alta' ? 'default' :
                        item.eficiencia === 'Media' ? 'secondary' : 'outline'
                      }>
                        {item.eficiencia}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={generarReporte}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Completo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // MODAL INVERSIÓN POR EQUIPO FUNCIONAL
  const ModalInversionEquipo = () => {
    const [filtroServicio, setFiltroServicio] = useState('todos');
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [showDetalle, setShowDetalle] = useState(false);

    const inversionData = equipos.map(equipo => {
      const repuestosEquipo = equipoRepuestos.filter(er => er.equipoId === equipo.id);
      const inversionTotal = repuestosEquipo.reduce((sum, er) => {
        const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
        return sum + (repuesto?.precio || 0);
      }, 0);
      
      const ultimaIntervencion = repuestosEquipo.length > 0 
        ? Math.max(...repuestosEquipo.map(er => new Date(er.fechaInstalacion).getTime()))
        : null;
      
      return {
        ...equipo,
        cantidadRepuestos: repuestosEquipo.length,
        inversionTotal,
        ultimaIntervencion: ultimaIntervencion ? new Date(ultimaIntervencion).toISOString().split('T')[0] : 'N/A',
        repuestosInstalados: repuestosEquipo,
        costoPromedioPorRepuesto: repuestosEquipo.length > 0 ? inversionTotal / repuestosEquipo.length : 0
      };
    });

    const filtrarEquipos = () => {
      return inversionData.filter(equipo => 
        filtroServicio === 'todos' || equipo.servicio === filtroServicio
      ).sort((a, b) => b.inversionTotal - a.inversionTotal);
    };

    const verDetalleEquipo = (equipo) => {
      setSelectedEquipo(equipo);
      setShowDetalle(true);
    };

    const calcularMetricasServicio = () => {
      const equiposFiltrados = filtrarEquipos();
      return {
        inversionTotal: equiposFiltrados.reduce((sum, e) => sum + e.inversionTotal, 0),
        equiposConRepuestos: equiposFiltrados.filter(e => e.cantidadRepuestos > 0).length,
        promedioInversion: equiposFiltrados.length > 0 
          ? equiposFiltrados.reduce((sum, e) => sum + e.inversionTotal, 0) / equiposFiltrados.length 
          : 0
      };
    };

    const metricas = calcularMetricasServicio();

    return (
      <Dialog open={showInversionEquipo} onOpenChange={setShowInversionEquipo}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Inversión por Equipo - Análisis Financiero
            </DialogTitle>
          </DialogHeader>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  ${metricas.inversionTotal.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Inversión Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#1d293d]">{metricas.equiposConRepuestos}</div>
                <p className="text-sm text-gray-600">Equipos con Repuestos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  ${metricas.promedioInversion.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">Promedio por Equipo</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-end">
            <div>
              <Label>Servicio</Label>
              <Select value={filtroServicio} onValueChange={setFiltroServicio}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="UCI">UCI</SelectItem>
                  <SelectItem value="Urgencias">Urgencias</SelectItem>
                  <SelectItem value="Quirófanos">Quirófanos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla */}
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Repuestos</TableHead>
                  <TableHead>Inversión Total</TableHead>
                  <TableHead>Costo Promedio</TableHead>
                  <TableHead>Última Intervención</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrarEquipos().map((equipo) => (
                  <TableRow key={equipo.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{equipo.nombre}</div>
                        <div className="text-sm text-gray-600 font-mono">{equipo.codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell>{equipo.servicio}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{equipo.cantidadRepuestos}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${equipo.inversionTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>${equipo.costoPromedioPorRepuesto.toFixed(2)}</TableCell>
                    <TableCell>{equipo.ultimaIntervencion}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => verDetalleEquipo(equipo)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => abrirHistorialEquipo(equipo)}>
                        <History className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        programarMantenimientoAutomatico(equipo, { nombre: 'Mantenimiento General' });
                      }}>
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Modal Detalle Equipo */}
          <Dialog open={showDetalle} onOpenChange={setShowDetalle}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Detalle de Inversión - {selectedEquipo?.nombre}</DialogTitle>
              </DialogHeader>
              {selectedEquipo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-lg font-semibold">Información del Equipo</div>
                        <div className="space-y-2 mt-2">
                          <p><strong>Código:</strong> {selectedEquipo.codigo}</p>
                          <p><strong>Servicio:</strong> {selectedEquipo.servicio}</p>
                          <p><strong>Ubicación:</strong> {selectedEquipo.ubicacion}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-lg font-semibold">Resumen Financiero</div>
                        <div className="space-y-2 mt-2">
                          <p><strong>Inversión Total:</strong> ${selectedEquipo.inversionTotal.toFixed(2)}</p>
                          <p><strong>Repuestos Instalados:</strong> {selectedEquipo.cantidadRepuestos}</p>
                          <p><strong>Costo Promedio:</strong> ${selectedEquipo.costoPromedioPorRepuesto.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Repuestos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Repuesto</TableHead>
                            <TableHead>Costo</TableHead>
                            <TableHead>Técnico</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEquipo.repuestosInstalados.map((inst, index) => {
                            const repuesto = initialRepuestos.find(r => r.id === inst.repuestoId);
                            return (
                              <TableRow key={index}>
                                <TableCell>{inst.fechaInstalacion}</TableCell>
                                <TableCell>{repuesto?.nombre}</TableCell>
                                <TableCell>${repuesto?.precio.toFixed(2)}</TableCell>
                                <TableCell>{inst.tecnico}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <DialogFooter>
            <Button onClick={() => {
              const datos = filtrarEquipos();
              const csv = [
                ['Código', 'Equipo', 'Servicio', 'Repuestos', 'Inversión Total'],
                ...datos.map(d => [d.codigo, d.nombre, d.servicio, d.cantidadRepuestos, d.inversionTotal.toFixed(2)])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'inversion_por_equipo.csv';
              a.click();
            }}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // MODAL INVERSIÓN POR SERVICIO FUNCIONAL
  const ModalInversionServicio = () => {
    const serviciosUnicos = [...new Set(equipos.map(e => e.servicio))];
    const inversionData = serviciosUnicos.map(servicio => {
      const equiposServicio = equipos.filter(e => e.servicio === servicio);
      const inversion = equiposServicio.reduce((total, equipo) => {
        const repuestosEquipo = equipoRepuestos.filter(er => er.equipoId === equipo.id);
        return total + repuestosEquipo.reduce((sum, er) => {
          const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
          return sum + (repuesto?.precio || 0);
        }, 0);
      }, 0);
      
      return {
        servicio,
        cantidadEquipos: equiposServicio.length,
        inversionTotal: inversion,
        responsable: servicios.find(s => s.nombre === servicio)?.responsable || 'N/A'
      };
    });

    return (
      <Dialog open={showInversionServicio} onOpenChange={setShowInversionServicio}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Inversión por Servicio Hospitalario
            </DialogTitle>
            <DialogDescription>
              Inversión total en repuestos agrupada por servicio
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Equipos</TableHead>
                <TableHead>Inversión Total</TableHead>
                <TableHead>Promedio por Equipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inversionData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.servicio}</TableCell>
                  <TableCell>{item.responsable}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.cantidadEquipos}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${item.inversionTotal.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${item.cantidadEquipos > 0 ? (item.inversionTotal / item.cantidadEquipos).toFixed(2) : '0.00'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button onClick={() => {
              const csv = [
                ['Servicio', 'Responsable', 'Equipos', 'Inversión Total'],
                ...inversionData.map(d => [d.servicio, d.responsable, d.cantidadEquipos, d.inversionTotal.toFixed(2)])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'inversion_por_servicio.csv';
              a.click();
            }}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const ModalCompras = () => (
    <Dialog open={showCompras} onOpenChange={setShowCompras}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Historial Completo de Compras
          </DialogTitle>
          <DialogDescription>Gestión integral de órdenes de compra</DialogDescription>
        </DialogHeader>
        
        {/* Métricas de Compras */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                ${compras.reduce((sum, c) => sum + c.total, 0).toFixed(0)}
              </div>
              <p className="text-sm text-gray-600">Total Compras</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{compras.length}</div>
              <p className="text-sm text-gray-600">Órdenes Totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {compras.filter(c => c.estado === 'Pendiente').length}
              </div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {compras.filter(c => c.estado === 'Entregado').length}
              </div>
              <p className="text-sm text-gray-600">Entregadas</p>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número Orden</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compras.map((compra) => (
                <TableRow key={compra.id}>
                  <TableCell className="font-mono">{compra.numeroOrden}</TableCell>
                  <TableCell>{compra.fecha}</TableCell>
                  <TableCell>{compra.proveedor}</TableCell>
                  <TableCell>{compra.comprador}</TableCell>
                  <TableCell>
                    <Badge variant={
                      compra.estado === 'Entregado' ? 'default' : 'secondary'
                    }>
                      {compra.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">${compra.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{compra.items.length} items</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const detalles = compra.items.map(item => {
                            const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
                            return `${repuesto?.nombre}: ${item.cantidad} x $${item.precioUnitario}`;
                          }).join('\n');
                          alert(`Detalles de ${compra.numeroOrden}:\n\n${detalles}\n\nTotal: $${compra.total.toFixed(2)}`);
                        }}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const nuevaCompra = {
                            ...compra,
                            id: compras.length + 1,
                            numeroOrden: `OC-${new Date().getFullYear()}-${String(compras.length + 1).padStart(3, '0')}`,
                            fecha: new Date().toISOString().split('T')[0],
                            estado: 'Pendiente'
                          };
                          alert(`Orden duplicada: ${nuevaCompra.numeroOrden}`);
                        }}
                        title="Duplicar orden"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const reporte = `Orden: ${compra.numeroOrden}\nFecha: ${compra.fecha}\nProveedor: ${compra.proveedor}\nTotal: $${compra.total.toFixed(2)}`;
                          navigator.clipboard.writeText(reporte);
                          alert('Información copiada al portapapeles');
                        }}
                        title="Copiar info"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => {
            const csv = [
              ['Orden', 'Fecha', 'Proveedor', 'Comprador', 'Estado', 'Total'],
              ...compras.map(c => [c.numeroOrden, c.fecha, c.proveedor, c.comprador, c.estado, c.total.toFixed(2)])
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'historial_compras.csv';
            a.click();
          }}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={() => {
            const nuevaOrden = `OC-${new Date().getFullYear()}-${String(compras.length + 1).padStart(3, '0')}`;
            alert(`Creando nueva orden: ${nuevaOrden}`);
          }} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ModalMovimientos = () => (
    <Dialog open={showMovimientos} onOpenChange={setShowMovimientos}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Control de Movimientos de Stock
          </DialogTitle>
          <DialogDescription>Auditoría completa de entradas, salidas y ajustes</DialogDescription>
        </DialogHeader>
        
        {/* Métricas de Movimientos */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {movimientos.filter(m => m.tipo === 'Entrada').length}
              </div>
              <p className="text-sm text-gray-600">Entradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {movimientos.filter(m => m.tipo === 'Salida').length}
              </div>
              <p className="text-sm text-gray-600">Salidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{movimientos.length}</div>
              <p className="text-sm text-gray-600">Total Movimientos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {movimientos.reduce((sum, m) => sum + m.cantidad, 0)}
              </div>
              <p className="text-sm text-gray-600">Unidades Movidas</p>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Repuesto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Stock Anterior</TableHead>
                <TableHead>Stock Nuevo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((mov) => {
                const repuesto = initialRepuestos.find(r => r.id === mov.repuestoId);
                return (
                  <TableRow key={mov.id}>
                    <TableCell>{mov.fecha}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{repuesto?.nombre || 'N/A'}</div>
                        <div className="text-sm text-gray-600 font-mono">{repuesto?.codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        mov.tipo === 'Entrada' ? 'default' : 'destructive'
                      }>
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      <span className={mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}>
                        {mov.tipo === 'Entrada' ? '+' : '-'}{mov.cantidad}
                      </span>
                    </TableCell>
                    <TableCell>{mov.stockAnterior}</TableCell>
                    <TableCell className="font-semibold">{mov.stockNuevo}</TableCell>
                    <TableCell>{mov.usuario}</TableCell>
                    <TableCell>{mov.razon}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          const detalle = `Movimiento #${mov.id}\nFecha: ${mov.fecha}\nTipo: ${mov.tipo}\nRepuesto: ${repuesto?.nombre}\nCantidad: ${mov.cantidad}\nStock: ${mov.stockAnterior} → ${mov.stockNuevo}\nUsuario: ${mov.usuario}\nRazón: ${mov.razon}`;
                          navigator.clipboard.writeText(detalle);
                          agregarNotificacion('success', 'Detalle copiado al portapapeles');
                        }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        {mov.usuario !== 'Sistema' && (
                          <Button variant="ghost" size="sm" onClick={() => {
                            if (confirm(`¿Deshacer movimiento #${mov.id}?\nEsto creará un movimiento inverso.`)) {
                              const movimientoInverso = {
                                id: movimientos.length + 1,
                                repuestoId: mov.repuestoId,
                                tipo: mov.tipo === 'Entrada' ? 'Salida' : 'Entrada',
                                cantidad: mov.cantidad,
                                fecha: new Date().toISOString().split('T')[0],
                                usuario: usuarioActual.nombre,
                                razon: `Reversión de movimiento #${mov.id}`,
                                stockAnterior: mov.stockNuevo,
                                stockNuevo: mov.stockAnterior
                              };
                              
                              movimientos.push(movimientoInverso);
                              
                              // Actualizar stock del repuesto
                              setRepuestos(prev => prev.map(r => 
                                r.id === mov.repuestoId 
                                  ? { ...r, stock: mov.stockAnterior }
                                  : r
                              ));
                              
                              agregarNotificacion('success', `Movimiento #${mov.id} deshecho`);
                            }
                          }}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => {
            const csv = [
              ['Fecha', 'Repuesto', 'Código', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Usuario', 'Razón'],
              ...movimientos.map(m => {
                const repuesto = initialRepuestos.find(r => r.id === m.repuestoId);
                return [m.fecha, repuesto?.nombre || 'N/A', repuesto?.codigo || 'N/A', m.tipo, m.cantidad, m.stockAnterior, m.stockNuevo, m.usuario, m.razon];
              })
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'movimientos_stock.csv';
            a.click();
          }}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Movimientos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ModalProveedores = () => (
    <Dialog open={showProveedores} onOpenChange={setShowProveedores}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Directorio de Proveedores
          </DialogTitle>
          <DialogDescription>Gestión integral de proveedores y relaciones comerciales</DialogDescription>
        </DialogHeader>
        
        {/* Métricas de Proveedores */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{proveedores.length}</div>
              <p className="text-sm text-gray-600">Total Proveedores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {proveedores.filter(p => compras.some(c => c.proveedor === p.nombre)).length}
              </div>
              <p className="text-sm text-gray-600">Con Compras</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                ${compras.reduce((sum, c) => sum + c.total, 0).toFixed(0)}
              </div>
              <p className="text-sm text-gray-600">Volumen Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(compras.reduce((sum, c) => sum + c.total, 0) / proveedores.length)}
              </div>
              <p className="text-sm text-gray-600">Promedio por Proveedor</p>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Órdenes</TableHead>
                <TableHead>Volumen</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((proveedor) => {
                const comprasProveedor = compras.filter(c => c.proveedor === proveedor.nombre);
                const volumenTotal = comprasProveedor.reduce((sum, c) => sum + c.total, 0);
                return (
                  <TableRow key={proveedor.id}>
                    <TableCell className="font-semibold">{proveedor.nombre}</TableCell>
                    <TableCell>{proveedor.contacto}</TableCell>
                    <TableCell>{proveedor.telefono}</TableCell>
                    <TableCell className="text-sm">{proveedor.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {comprasProveedor.length} órdenes
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${volumenTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const info = `${proveedor.nombre}\nContacto: ${proveedor.contacto}\nTeléfono: ${proveedor.telefono}\nEmail: ${proveedor.email}\nÓrdenes: ${comprasProveedor.length}\nVolumen: $${volumenTotal.toFixed(2)}`;
                            alert(info);
                          }}
                          title="Ver información"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const nuevaOrden = `OC-${new Date().getFullYear()}-${String(compras.length + 1).padStart(3, '0')}`;
                            alert(`Creando orden ${nuevaOrden} para ${proveedor.nombre}`);
                          }}
                          title="Nueva compra"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const contacto = `Contactando a ${proveedor.nombre}\nTeléfono: ${proveedor.telefono}\nEmail: ${proveedor.email}`;
                            navigator.clipboard.writeText(contacto);
                            alert('Información de contacto copiada');
                          }}
                          title="Contactar"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const historial = comprasProveedor.map(c => `${c.numeroOrden}: $${c.total.toFixed(2)} (${c.estado})`).join('\n');
                            alert(`Historial de ${proveedor.nombre}:\n\n${historial}`);
                          }}
                          title="Ver historial"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => {
            const csv = [
              ['Proveedor', 'Contacto', 'Teléfono', 'Email', 'Órdenes', 'Volumen Total'],
              ...proveedores.map(p => {
                const comprasP = compras.filter(c => c.proveedor === p.nombre);
                const volumen = comprasP.reduce((sum, c) => sum + c.total, 0);
                return [p.nombre, p.contacto, p.telefono, p.email, comprasP.length, volumen.toFixed(2)];
              })
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'directorio_proveedores.csv';
            a.click();
          }}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Directorio
          </Button>
          <Button 
            onClick={() => {
              const nuevoId = proveedores.length + 1;
              alert(`Creando nuevo proveedor con ID: ${nuevoId}`);
            }} 
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ModalDetalleRepuesto = () => {
    if (!repuestoDetalle) return null;
    const movimientosRepuesto = movimientos.filter(m => m.repuestoId === repuestoDetalle.id);
    return (
      <Dialog open={showDetalleRepuesto} onOpenChange={setShowDetalleRepuesto}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle del Repuesto</DialogTitle>
            <DialogDescription>{repuestoDetalle.codigo} - {repuestoDetalle.nombre}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div><strong>Código:</strong> {repuestoDetalle.codigo}</div>
                  <div><strong>Nombre:</strong> {repuestoDetalle.nombre}</div>
                  <div><strong>Precio:</strong> ${repuestoDetalle.precio}</div>
                  <div><strong>Grupo:</strong> {repuestoDetalle.grupo}</div>
                  <div><strong>Stock:</strong> {repuestoDetalle.stock}</div>
                  <div><strong>Stock Mínimo:</strong> {repuestoDetalle.stockMinimo}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div><strong>Unidad:</strong> {repuestoDetalle.unidad}</div>
                  <div><strong>Proveedor:</strong> {repuestoDetalle.proveedor}</div>
                  <div><strong>Ubicación:</strong> {repuestoDetalle.ubicacion}</div>
                  <div><strong>Estado:</strong> {repuestoDetalle.estado}</div>
                  <div><strong>Fecha Creación:</strong> {repuestoDetalle.fechaCreacion}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Descripción:</h4>
            <p className="text-sm text-gray-600">{repuestoDetalle.descripcion}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Historial de Movimientos:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Razón</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosRepuesto.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{mov.fecha}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        mov.tipo === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {mov.tipo}
                      </span>
                    </TableCell>
                    <TableCell>{mov.cantidad}</TableCell>
                    <TableCell>{mov.usuario}</TableCell>
                    <TableCell>{mov.razon}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Estado de carga
  if (loading && repuestos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-8 bg-white rounded animate-pulse"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-[#1d293d] to-[#2a3b52] rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8" />
                Gestión de Repuestos
              </h1>
              <p className="text-white/80 mt-2">Sistema de inventario y control de repuestos</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{totalItems}</div>
              <p className="text-white/80 text-sm">Total Repuestos</p>
            </div>
          </div>
        </div>

        {/* Sistema de Notificaciones */}
        {notificaciones.length > 0 && (
          <div className="mb-4 space-y-2">
            {notificaciones.slice(0, 3).map(notif => (
              <div key={notif.id} className={`flex items-center justify-between p-3 rounded border ${
                notif.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notif.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                notif.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-[#1d293d]/5 border-[#1d293d]/30 text-[#1d293d]'
              }`}>
                <div className="flex items-center gap-2">
                  {notif.tipo === 'success' && <CheckCircle className="w-4 h-4" />}
                  {notif.tipo === 'warning' && <AlertTriangle className="w-4 h-4" />}
                  {notif.tipo === 'error' && <XCircle className="w-4 h-4" />}
                  {notif.tipo === 'info' && <Bell className="w-4 h-4" />}
                  <span className="text-sm">{notif.mensaje}</span>
                  <span className="text-xs opacity-70">{notif.timestamp}</span>
                </div>
                <div className="flex gap-2">
                  {notif.accion && (
                    <Button size="sm" variant="ghost" onClick={notif.accion.funcion}>
                      {notif.accion.texto}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => 
                    setNotificaciones(prev => prev.filter(n => n.id !== notif.id))
                  }>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {notificaciones.length > 3 && (
              <Button variant="outline" size="sm" onClick={() => setShowNotificaciones(true)}>
                Ver todas ({notificaciones.length})
              </Button>
            )}
          </div>
        )}

        {/* Accesos Rápidos */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowSubModalEquipos(true)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button size="sm" onClick={() => setShowNotificaciones(true)} variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones ({notificaciones.length})
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Usuario: <strong>{usuarioActual.nombre}</strong> | Rol: <strong>{typeof usuarioActual.rol === 'object' ? usuarioActual.rol.nombre : usuarioActual.rol}</strong>
          </div>
        </div>

        {/* Barra de Navegación con Botones de Consulta */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          <Button 
            onClick={() => handleTabClick("instalados")}
            variant={activeTab === "instalados" ? "default" : "outline"}
            className="flex items-center gap-2 h-auto py-3"
          >
            <Package className="w-4 h-4" />
            <span className="text-xs">Repuestos instalados</span>
          </Button>
          <Button 
            onClick={() => handleTabClick("pendientes")}
            variant={activeTab === "pendientes" ? "default" : "outline"}
            className="flex items-center gap-2 h-auto py-3"
          >
            <Clock className="w-4 h-4" />
            <span className="text-xs">Repuestos pendientes</span>
          </Button>
          <Button 
            onClick={() => handleTabClick("resumen-repuestos")}
            variant={activeTab === "resumen-repuestos" ? "default" : "outline"}
            className="flex items-center gap-2 h-auto py-3"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Resumen por repuestos</span>
          </Button>
          <Button 
            onClick={() => setShowResumenGeneral(true)}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Resumen general</span>
          </Button>
          <Button 
            onClick={() => handleTabClick("inversion-equipo")}
            variant={activeTab === "inversion-equipo" ? "default" : "outline"}
            className="flex items-center gap-2 h-auto py-3"
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Inversión por equipo</span>
          </Button>
          <Button 
            onClick={() => handleTabClick("inversion-servicio")}
            variant={activeTab === "inversion-servicio" ? "default" : "outline"}
            className="flex items-center gap-2 h-auto py-3"
          >
            <Building2 className="w-4 h-4" />
            <span className="text-xs">Inversión por servicio</span>
          </Button>
        </div>



        {/* Filtros Avanzados */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-[#1d293d] font-medium">Búsqueda</Label>
                <Input 
                  placeholder="Nombre, código o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-[#1d293d]/30 focus:border-[#1d293d]"
                />
              </div>
              <div>
                <Label className="text-[#1d293d] font-medium">Grupo</Label>
                <Select value={grupoFilter} onValueChange={(value) => setGrupoFilter(value)}>
                  <SelectTrigger className="border-[#1d293d]/30">
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    <SelectItem value="MT1">MT1 - Mantenimiento</SelectItem>
                    <SelectItem value="DM1">DM1 - Diagnóstico</SelectItem>
                    <SelectItem value="ET1">ET1 - Electrónica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Proveedor</Label>
                <Select value={filtros.proveedor} onValueChange={(value) => setFiltros({...filtros, proveedor: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {[...new Set(repuestos.map(r => r.proveedor))].map(prov => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="stockBajo"
                  checked={filtros.stockBajo}
                  onChange={(e) => setFiltros({...filtros, stockBajo: e.target.checked})}
                />
                <Label htmlFor="stockBajo">Solo stock bajo</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => setFiltros({
                  busqueda: "", grupo: "todos", proveedor: "todos", 
                  estado: "todos", stockBajo: false, fechaDesde: "", fechaHasta: ""
                })}
                variant="outline"
                size="sm"
              >
                Limpiar Filtros
              </Button>
              {usuarioActual.permisos.includes("exportar") && (
                <>
                  <Button onClick={() => exportarDatos("Excel")} variant="outline" size="sm">
                    Exportar Excel
                  </Button>
                  <Button onClick={() => exportarDatos("PDF")} variant="outline" size="sm">
                    Exportar PDF
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones Adicionales de Gestión */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowCompras(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Historial Compras
          </Button>
          <Button 
            onClick={() => setShowMovimientos(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Movimientos Stock
          </Button>
          <Button 
            onClick={() => setShowProveedores(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Proveedores
          </Button>
          <Button 
            onClick={() => {
              const nuevaOrden = `OC-${new Date().getFullYear()}-${String(compras.length + 1).padStart(3, '0')}`;
              setFormCompra({
                numeroOrden: nuevaOrden,
                proveedor: '',
                comprador: usuarioActual.nombre,
                items: [],
                observaciones: ''
              });
              setShowSubModalNuevaCompra(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Compra
          </Button>
          <Button 
            onClick={() => {
              verificarStockCritico();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Verificar Stock
          </Button>
          <Button 
            onClick={() => {
              const sugerencias = repuestos
                .filter(r => r.stock <= r.stockMinimo)
                .map(r => `${r.codigo}: Stock ${r.stock}/${r.stockMinimo}`)
                .join('\n');
              if (sugerencias) {
                alert(`Sugerencias de compra:\n\n${sugerencias}`);
              } else {
                agregarNotificacion('success', 'No hay repuestos que requieran compra');
              }
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Sugerencias
          </Button>
          <Button 
            onClick={() => {
              const reporte = {
                fecha: new Date().toLocaleString(),
                totalRepuestos: repuestos.length,
                valorInventario: repuestos.reduce((sum, r) => sum + (r.stock * r.precio), 0),
                stockCritico: repuestos.filter(r => r.stock <= r.stockMinimo).length,
                movimientosHoy: movimientos.filter(m => m.fecha === new Date().toISOString().split('T')[0]).length
              };
              
              const csv = [
                ['Métrica', 'Valor'],
                ['Fecha Reporte', reporte.fecha],
                ['Total Repuestos', reporte.totalRepuestos],
                ['Valor Inventario', `$${reporte.valorInventario.toFixed(2)}`],
                ['Stock Crítico', reporte.stockCritico],
                ['Movimientos Hoy', reporte.movimientosHoy]
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `reporte_ejecutivo_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              
              agregarNotificacion('success', 'Reporte ejecutivo generado');
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Reporte Ejecutivo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabla Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Repuestos</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowStockForm(!showStockForm)}
                    variant="outline"
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Gestionar Stock
                  </Button>
                  <Button 
                    onClick={() => {
                      const stockBajo = repuestos.filter(r => r.stock <= r.stockMinimo);
                      if (stockBajo.length > 0) {
                        const mensaje = stockBajo.map(r => `${r.codigo}: ${r.stock}/${r.stockMinimo}`).join('\n');
                        alert(`Repuestos con stock bajo (${stockBajo.length}):\n\n${mensaje}`);
                      } else {
                        agregarNotificacion('success', 'Todos los repuestos tienen stock normal');
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Stock Bajo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Área de Gestión de Stock */}
                {showStockForm && (
                  <Card className="mb-4 bg-[#1d293d]/5">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>ID Repuesto</Label>
                          <Select value={stockData.id} onValueChange={(value) => {
                            const repuesto = repuestos.find(r => r.id === parseInt(value));
                            setStockData({...stockData, id: value, stockActual: repuesto?.stock || 0});
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar repuesto" />
                            </SelectTrigger>
                            <SelectContent>
                              {repuestos.map(r => (
                                <SelectItem key={r.id} value={r.id.toString()}>
                                  {r.codigo} - {r.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Stock Actual: {stockData.stockActual}</Label>
                          <div className="flex gap-2 mt-1">
                            <Select value={stockData.operacion} onValueChange={(value) => setStockData({...stockData, operacion: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sumar">Sumar</SelectItem>
                                <SelectItem value="restar">Restar</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input 
                              type="number" 
                              placeholder="Cantidad"
                              value={stockData.cantidad}
                              onChange={(e) => setStockData({...stockData, cantidad: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label>Razón del movimiento</Label>
                          <Textarea 
                            placeholder="Describe el motivo del movimiento"
                            value={stockData.razon}
                            onChange={(e) => setStockData({...stockData, razon: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <Button onClick={handleStockOperation} size="sm">
                            {stockData.operacion === "sumar" ? <Plus className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
                            {stockData.operacion === "sumar" ? "Sumar Stock" : "Restar Stock"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowStockForm(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1d293d]/5">
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="font-semibold">Repuesto</TableHead>
                      <TableHead className="font-semibold">Equipo</TableHead>
                      <TableHead className="font-semibold">Cantidad</TableHead>
                      <TableHead className="font-semibold">Precio Unit.</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Servicio</TableHead>
                      <TableHead className="font-semibold">Instalado Por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="space-y-2 px-4">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="h-16 bg-gray-50 rounded animate-pulse"></div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : repuestos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No se encontraron repuestos instalados
                        </TableCell>
                      </TableRow>
                    ) : (
                      repuestos.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#1d293d]/5">
                        <TableCell className="font-mono text-sm">{item.fecha || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-[#1d293d]">{item.repuesto_nombre}</div>
                            <div className="text-xs text-gray-500">Código: {item.repuesto_codigo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.equipo_nombre}</div>
                            <div className="text-xs text-gray-500">
                              {item.equipo_codigo} | {item.equipo_marca} {item.equipo_modelo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-[#1d293d]/10 text-[#1d293d] rounded text-sm font-semibold">
                            {item.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-green-700">${item.precio_unitario?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="font-bold text-green-800">${item.precio_total?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-sm">{item.servicio}</TableCell>
                        <TableCell className="text-sm text-gray-600">{item.instalado_por}</TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Paginación Global */}
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={(page) => setCurrentPage(page)}
                    showInfo={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Edición/Creación */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{isEditMode ? "Editar Repuesto" : "Agregar Repuesto"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Nombre del repuesto</Label>
                  <Input 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre del repuesto"
                  />
                </div>
                <div>
                  <Label>Código identificador</Label>
                  <Input 
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    placeholder="Código único"
                  />
                </div>
                <div>
                  <Label>Precio con IVA incluido</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Grupo de clasificación</Label>
                  <Select value={formData.grupo} onValueChange={(value) => setFormData({...formData, grupo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MT1">MT1</SelectItem>
                      <SelectItem value="DM1">DM1</SelectItem>
                      <SelectItem value="ET1">ET1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Proveedor</Label>
                  <Select value={formData.proveedor} onValueChange={(value) => setFormData({...formData, proveedor: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map(prov => (
                        <SelectItem key={prov.id} value={prov.nombre}>{prov.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stock mínimo</Label>
                  <Input 
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({...formData, stockMinimo: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Unidad</Label>
                  <Select value={formData.unidad} onValueChange={(value) => setFormData({...formData, unidad: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unidad">Unidad</SelectItem>
                      <SelectItem value="Metro">Metro</SelectItem>
                      <SelectItem value="Litro">Litro</SelectItem>
                      <SelectItem value="Kilogramo">Kilogramo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ubicación</Label>
                  <Input 
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    placeholder="Ej: Almacén A-1"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea 
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción detallada del repuesto"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveRepuesto} 
                    className="flex-1"
                    disabled={!formData.nombre || !formData.codigo || !formData.precio}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? "Actualizar" : "Agregar"}
                  </Button>
                  {isEditMode && (
                    <Button variant="outline" onClick={resetForm}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormData({ 
                        nombre: "", 
                        codigo: "", 
                        precio: "", 
                        grupo: "MT1",
                        proveedor: "",
                        estado: "Activo",
                        stockMinimo: "",
                        unidad: "Unidad",
                        ubicacion: "",
                        descripcion: ""
                      });
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ModalInstalados />
      <ModalPendientes />
      <ModalResumenRepuestos />
      <ModalInversionEquipo />
      <ModalInversionServicio />
      <ModalCompras />
      <ModalMovimientos />
      <ModalProveedores />
      <ModalDetalleRepuesto />
      
      {/* SUB-MODALES FUNCIONALES COMPLETOS */}
      
      {/* Sub-Modal: Nueva Compra */}
      <Dialog open={showSubModalNuevaCompra} onOpenChange={setShowSubModalNuevaCompra}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nueva Orden de Compra
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número de Orden</Label>
                <Input 
                  value={formCompra.numeroOrden}
                  onChange={(e) => setFormCompra({...formCompra, numeroOrden: e.target.value})}
                  placeholder="OC-2024-XXX"
                />
              </div>
              <div>
                <Label>Proveedor *</Label>
                <Select value={formCompra.proveedor} onValueChange={(value) => setFormCompra({...formCompra, proveedor: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map(prov => (
                      <SelectItem key={prov.id} value={prov.nombre}>{prov.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Comprador</Label>
              <Input 
                value={formCompra.comprador}
                onChange={(e) => setFormCompra({...formCompra, comprador: e.target.value})}
                placeholder="Nombre del comprador"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Items de la Compra *</Label>
                <Button size="sm" onClick={() => {
                  const nuevoItem = { repuestoId: '', cantidad: 1, precio: 0 };
                  setFormCompra({...formCompra, items: [...formCompra.items, nuevoItem]});
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {formCompra.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded">
                    <div>
                      <Label className="text-xs">Repuesto</Label>
                      <Select 
                        value={item.repuestoId.toString()} 
                        onValueChange={(value) => {
                          const repuesto = repuestos.find(r => r.id === parseInt(value));
                          const nuevosItems = [...formCompra.items];
                          nuevosItems[index] = {...item, repuestoId: parseInt(value), precio: repuesto?.precio || 0};
                          setFormCompra({...formCompra, items: nuevosItems});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {repuestos.map(rep => (
                            <SelectItem key={rep.id} value={rep.id.toString()}>
                              {rep.codigo} - {rep.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Cantidad</Label>
                      <Input 
                        type="number" 
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => {
                          const nuevosItems = [...formCompra.items];
                          nuevosItems[index] = {...item, cantidad: parseInt(e.target.value) || 1};
                          setFormCompra({...formCompra, items: nuevosItems});
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio Unit.</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={item.precio}
                        onChange={(e) => {
                          const nuevosItems = [...formCompra.items];
                          nuevosItems[index] = {...item, precio: parseFloat(e.target.value) || 0};
                          setFormCompra({...formCompra, items: nuevosItems});
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const nuevosItems = formCompra.items.filter((_, i) => i !== index);
                          setFormCompra({...formCompra, items: nuevosItems});
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {formCompra.items.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      Total: ${formCompra.items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label>Observaciones</Label>
              <Textarea 
                value={formCompra.observaciones}
                onChange={(e) => setFormCompra({...formCompra, observaciones: e.target.value})}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModalNuevaCompra(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarCompra} disabled={!formCompra.proveedor || formCompra.items.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              Crear Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sub-Modal: Editar Proveedor */}
      <Dialog open={showSubModalEditarProveedor} onOpenChange={setShowSubModalEditarProveedor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {proveedorSeleccionado ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input 
                  value={formProveedor.nombre}
                  onChange={(e) => setFormProveedor({...formProveedor, nombre: e.target.value})}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <Label>Contacto *</Label>
                <Input 
                  value={formProveedor.contacto}
                  onChange={(e) => setFormProveedor({...formProveedor, contacto: e.target.value})}
                  placeholder="Nombre del contacto"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teléfono</Label>
                <Input 
                  value={formProveedor.telefono}
                  onChange={(e) => setFormProveedor({...formProveedor, telefono: e.target.value})}
                  placeholder="Teléfono de contacto"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={formProveedor.email}
                  onChange={(e) => setFormProveedor({...formProveedor, email: e.target.value})}
                  placeholder="email@proveedor.com"
                />
              </div>
            </div>
            
            <div>
              <Label>Dirección</Label>
              <Input 
                value={formProveedor.direccion}
                onChange={(e) => setFormProveedor({...formProveedor, direccion: e.target.value})}
                placeholder="Dirección completa"
              />
            </div>
            
            <div>
              <Label>Ciudad</Label>
              <Input 
                value={formProveedor.ciudad}
                onChange={(e) => setFormProveedor({...formProveedor, ciudad: e.target.value})}
                placeholder="Ciudad"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModalEditarProveedor(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarProveedor} disabled={!formProveedor.nombre || !formProveedor.contacto}>
              <Save className="w-4 h-4 mr-2" />
              {proveedorSeleccionado ? 'Actualizar' : 'Crear'} Proveedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sub-Modal: Detalle de Compra */}
      <Dialog open={showSubModalCompraDetalle} onOpenChange={setShowSubModalCompraDetalle}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Detalle de Compra - {compraSeleccionada?.numeroOrden}
            </DialogTitle>
          </DialogHeader>
          
          {compraSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Número:</strong> {compraSeleccionada.numeroOrden}</div>
                    <div><strong>Fecha:</strong> {compraSeleccionada.fecha}</div>
                    <div><strong>Proveedor:</strong> {compraSeleccionada.proveedor}</div>
                    <div><strong>Comprador:</strong> {compraSeleccionada.comprador}</div>
                    <div><strong>Estado:</strong> 
                      <Badge className="ml-2" variant={
                        compraSeleccionada.estado === 'Entregado' ? 'default' : 'secondary'
                      }>
                        {compraSeleccionada.estado}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Subtotal:</strong> ${(compraSeleccionada.total / 1.19).toFixed(2)}</div>
                    <div><strong>IVA (19%):</strong> ${(compraSeleccionada.total * 0.19 / 1.19).toFixed(2)}</div>
                    <div><strong>Total:</strong> <span className="text-lg font-semibold">${compraSeleccionada.total.toFixed(2)}</span></div>
                    <div><strong>Items:</strong> {compraSeleccionada.items.length}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Items de la Compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Repuesto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compraSeleccionada.items.map((item, index) => {
                        const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{repuesto?.codigo}</TableCell>
                            <TableCell>{repuesto?.nombre}</TableCell>
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>${item.precioUnitario.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">
                              ${(item.cantidad * item.precioUnitario).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModalCompraDetalle(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              if (compraSeleccionada) {
                const detalles = [
                  ['Orden', 'Repuesto', 'Código', 'Cantidad', 'Precio', 'Subtotal'],
                  ...compraSeleccionada.items.map(item => {
                    const repuesto = initialRepuestos.find(r => r.id === item.repuestoId);
                    return [
                      compraSeleccionada.numeroOrden,
                      repuesto?.nombre || 'N/A',
                      repuesto?.codigo || 'N/A',
                      item.cantidad,
                      item.precioUnitario.toFixed(2),
                      (item.cantidad * item.precioUnitario).toFixed(2)
                    ];
                  })
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([detalles], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `detalle_${compraSeleccionada.numeroOrden}.csv`;
                a.click();
                
                agregarNotificacion('success', `Detalle de ${compraSeleccionada.numeroOrden} exportado`);
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Detalle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sub-Modal: Historial de Equipo */}
      <Dialog open={showSubModalHistorialEquipo} onOpenChange={setShowSubModalHistorialEquipo}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial del Equipo - {equipoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          {equipoSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-lg font-semibold">Información</div>
                    <div className="space-y-1 mt-2 text-sm">
                      <div><strong>Código:</strong> {equipoSeleccionado.codigo}</div>
                      <div><strong>Servicio:</strong> {equipoSeleccionado.servicio}</div>
                      <div><strong>Ubicación:</strong> {equipoSeleccionado.ubicacion}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-lg font-semibold">Repuestos</div>
                    <div className="space-y-1 mt-2 text-sm">
                      <div><strong>Instalados:</strong> {equipoRepuestos.filter(er => er.equipoId === equipoSeleccionado.id).length}</div>
                      <div><strong>Última instalación:</strong> 
                        {(() => {
                          const ultimaInstalacion = equipoRepuestos
                            .filter(er => er.equipoId === equipoSeleccionado.id)
                            .sort((a, b) => new Date(b.fechaInstalacion) - new Date(a.fechaInstalacion))[0];
                          return ultimaInstalacion ? ultimaInstalacion.fechaInstalacion : 'N/A';
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-lg font-semibold">Inversión</div>
                    <div className="space-y-1 mt-2 text-sm">
                      <div><strong>Total:</strong> $
                        {equipoRepuestos
                          .filter(er => er.equipoId === equipoSeleccionado.id)
                          .reduce((sum, er) => {
                            const repuesto = initialRepuestos.find(r => r.id === er.repuestoId);
                            return sum + (repuesto?.precio || 0);
                          }, 0).toFixed(2)
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Instalaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Repuesto</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipoRepuestos
                        .filter(er => er.equipoId === equipoSeleccionado.id)
                        .sort((a, b) => new Date(b.fechaInstalacion) - new Date(a.fechaInstalacion))
                        .map((instalacion, index) => {
                          const repuesto = initialRepuestos.find(r => r.id === instalacion.repuestoId);
                          return (
                            <TableRow key={index}>
                              <TableCell>{instalacion.fechaInstalacion}</TableCell>
                              <TableCell>{repuesto?.nombre}</TableCell>
                              <TableCell className="font-mono">{repuesto?.codigo}</TableCell>
                              <TableCell>{instalacion.tecnico}</TableCell>
                              <TableCell className="font-semibold">${repuesto?.precio.toFixed(2)}</TableCell>
                              <TableCell>{instalacion.observaciones}</TableCell>
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModalHistorialEquipo(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              if (equipoSeleccionado) {
                const historial = equipoRepuestos
                  .filter(er => er.equipoId === equipoSeleccionado.id)
                  .map(instalacion => {
                    const repuesto = initialRepuestos.find(r => r.id === instalacion.repuestoId);
                    return [
                      instalacion.fechaInstalacion,
                      repuesto?.nombre || 'N/A',
                      repuesto?.codigo || 'N/A',
                      instalacion.tecnico,
                      repuesto?.precio.toFixed(2) || '0.00',
                      instalacion.observaciones
                    ];
                  });
                
                const csv = [
                  ['Fecha', 'Repuesto', 'Código', 'Técnico', 'Costo', 'Observaciones'],
                  ...historial
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `historial_${equipoSeleccionado.codigo}.csv`;
                a.click();
                
                agregarNotificacion('success', `Historial de ${equipoSeleccionado.codigo} exportado`);
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Historial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sub-Modal: Asignar Repuesto a Equipo */}
      <Dialog open={showSubModalAsignarEquipo} onOpenChange={setShowSubModalAsignarEquipo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Asignar Repuesto a Equipo
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Equipo *</Label>
                <Select value={formAsignacion.equipoId} onValueChange={(value) => setFormAsignacion({...formAsignacion, equipoId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map(eq => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.codigo} - {eq.nombre} ({eq.servicio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Repuesto</Label>
                <Select 
                  value={formAsignacion.repuestoId.toString()} 
                  onValueChange={(value) => setFormAsignacion({...formAsignacion, repuestoId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar repuesto" />
                  </SelectTrigger>
                  <SelectContent>
                    {repuestos.filter(r => r.stock > 0).map(rep => (
                      <SelectItem key={rep.id} value={rep.id.toString()}>
                        {rep.codigo} - {rep.nombre} (Stock: {rep.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantidad *</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={formAsignacion.cantidad}
                  onChange={(e) => setFormAsignacion({...formAsignacion, cantidad: parseInt(e.target.value) || 1})}
                  placeholder="1"
                />
              </div>
              <div>
                <Label>Técnico Responsable</Label>
                <Input 
                  value={formAsignacion.tecnico}
                  onChange={(e) => setFormAsignacion({...formAsignacion, tecnico: e.target.value})}
                  placeholder="Nombre del técnico"
                />
              </div>
            </div>
            
            <div>
              <Label>Observaciones</Label>
              <Textarea 
                value={formAsignacion.observaciones}
                onChange={(e) => setFormAsignacion({...formAsignacion, observaciones: e.target.value})}
                placeholder="Motivo de la instalación, procedimiento realizado..."
                rows={3}
              />
            </div>
            
            {formAsignacion.repuestoId && (
              <div className="p-3 bg-[#1d293d]/5 rounded">
                <div className="text-sm">
                  <strong>Repuesto seleccionado:</strong>
                  {(() => {
                    const rep = repuestos.find(r => r.id === formAsignacion.repuestoId);
                    return rep ? ` ${rep.nombre} - Stock disponible: ${rep.stock}` : '';
                  })()}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModalAsignarEquipo(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={guardarAsignacion} 
              disabled={!formAsignacion.equipoId || !formAsignacion.repuestoId}
            >
              <Package className="w-4 h-4 mr-2" />
              Asignar Repuesto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sub-Modal: Configuración del Sistema */}
      <Dialog open={showSubModalEquipos} onOpenChange={setShowSubModalEquipos}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración del Sistema
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Días de alerta para vencimiento</Label>
                    <Input type="number" defaultValue="30" min="1" max="365" />
                  </div>
                  <div>
                    <Label>Porcentaje de stock crítico</Label>
                    <Input type="number" defaultValue="20" min="1" max="100" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="alertasEmail" defaultChecked />
                  <Label htmlFor="alertasEmail">Enviar alertas por email</Label>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map(usuario => (
                      <TableRow key={usuario.id}>
                        <TableCell>{usuario.nombre}</TableCell>
                        <TableCell>{typeof usuario.rol === 'object' ? usuario.rol.nombre : usuario.rol}</TableCell>
                        <TableCell>
                          <Badge variant="default">Activo</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModalEquipos(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              agregarNotificacion('success', 'Configuración guardada exitosamente');
              setShowSubModalEquipos(false);
            }}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Notificaciones Completo */}
      <Dialog open={showNotificaciones} onOpenChange={setShowNotificaciones}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Centro de Notificaciones ({notificaciones.length})
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notificaciones.map(notif => (
                <div key={notif.id} className={`p-3 rounded border ${
                  notif.tipo === 'success' ? 'bg-green-50 border-green-200' :
                  notif.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  notif.tipo === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-[#1d293d]/5 border-[#1d293d]/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {notif.tipo === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                      {notif.tipo === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />}
                      {notif.tipo === 'error' && <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                      {notif.tipo === 'info' && <Bell className="w-4 h-4 text-[#1d293d] mt-0.5" />}
                      <div>
                        <div className="text-sm font-medium">{notif.mensaje}</div>
                        <div className="text-xs text-gray-500 mt-1">{notif.timestamp}</div>
                        {notif.accion && (
                          <Button size="sm" className="mt-2" onClick={notif.accion.funcion}>
                            {notif.accion.texto}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNotificaciones(prev => prev.filter(n => n.id !== notif.id))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificaciones([])}>
              Limpiar Todas
            </Button>
            <Button onClick={() => setShowNotificaciones(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Resumen General FUNCIONAL */}
      <Dialog open={showResumenGeneral} onOpenChange={setShowResumenGeneral}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumen General del Sistema
            </DialogTitle>
            <DialogDescription>Dashboard ejecutivo con métricas clave y análisis</DialogDescription>
          </DialogHeader>
          
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#1d293d]">{repuestos.length}</div>
                <div className="text-sm text-gray-600">Total Repuestos</div>
                <div className="text-xs text-blue-600 mt-1">Activos en sistema</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{repuestos.filter(r => r.stock <= r.stockMinimo).length}</div>
                <div className="text-sm text-gray-600">Stock Bajo</div>
                <div className="text-xs text-orange-600 mt-1">Requieren compra</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  ${repuestos.reduce((sum, r) => sum + (r.stock * r.precio), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Valor Inventario</div>
                <div className="text-xs text-green-600 mt-1">Total en stock</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{compras.filter(c => c.estado === 'Pendiente').length}</div>
                <div className="text-sm text-gray-600">Compras Pendientes</div>
                <div className="text-xs text-purple-600 mt-1">En proceso</div>
              </CardContent>
            </Card>
          </div>

          {/* Análisis por Grupo */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {['MT1', 'DM1', 'ET1'].map(grupo => {
                  const repuestosGrupo = repuestos.filter(r => r.grupo === grupo);
                  const valorGrupo = repuestosGrupo.reduce((sum, r) => sum + (r.stock * r.precio), 0);
                  return (
                    <div key={grupo} className="text-center p-4 border rounded">
                      <div className="text-lg font-semibold">{grupo}</div>
                      <div className="text-sm text-gray-600">{repuestosGrupo.length} items</div>
                      <div className="text-sm font-medium">${valorGrupo.toFixed(0)}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Repuestos */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Repuestos por Valor</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Repuesto</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio Unit.</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repuestos
                    .sort((a, b) => (b.stock * b.precio) - (a.stock * a.precio))
                    .slice(0, 5)
                    .map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell className="font-mono">{rep.codigo}</TableCell>
                      <TableCell>{rep.nombre}</TableCell>
                      <TableCell>
                        <Badge variant={rep.stock <= rep.stockMinimo ? 'destructive' : 'default'}>
                          {rep.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>${(rep.precio || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${((rep.stock || 0) * (rep.precio || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Alertas del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {repuestos.filter(r => r.stock <= r.stockMinimo).length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-red-800">
                        {repuestos.filter(r => r.stock <= r.stockMinimo).length} repuestos con stock crítico
                      </span>
                    </div>
                    <Button size="sm" onClick={() => {
                      setFiltros({...filtros, stockBajo: true});
                      setShowResumenGeneral(false);
                    }}>
                      Ver Detalles
                    </Button>
                  </div>
                )}
                {compras.filter(c => c.estado === 'Pendiente').length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800">
                        {compras.filter(c => c.estado === 'Pendiente').length} órdenes pendientes de entrega
                      </span>
                    </div>
                    <Button size="sm" onClick={() => {
                      setShowPendientes(true);
                      setShowResumenGeneral(false);
                    }}>
                      Gestionar
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">
                      Sistema operativo - {repuestos.filter(r => r.stock > r.stockMinimo).length} repuestos con stock normal
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResumenGeneral(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              const resumenData = {
                fecha: new Date().toISOString().split('T')[0],
                totalRepuestos: repuestos.length,
                stockBajo: repuestos.filter(r => r.stock <= r.stockMinimo).length,
                valorInventario: repuestos.reduce((sum, r) => sum + (r.stock * r.precio), 0),
                comprasPendientes: compras.filter(c => c.estado === 'Pendiente').length
              };
              
              const csv = [
                ['Métrica', 'Valor'],
                ['Fecha Reporte', resumenData.fecha],
                ['Total Repuestos', resumenData.totalRepuestos],
                ['Stock Bajo', resumenData.stockBajo],
                ['Valor Inventario', `$${resumenData.valorInventario.toFixed(2)}`],
                ['Compras Pendientes', resumenData.comprasPendientes]
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `resumen_general_${resumenData.fecha}.csv`;
              a.click();
            }}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Resumen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RepuestosView;
