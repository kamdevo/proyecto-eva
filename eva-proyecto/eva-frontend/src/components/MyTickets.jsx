"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TicketsImg from "@/assets/Img/imagenes/mis-tickets-img.jpg";
import Pagination from "@/components/common/Pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Plus,
  FileText,
  Users,
  Wrench,
  Eye,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Search,
  Building,
  Cog,
  Truck,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import TicketDetailsModal from "@/components/modals/ticket-details-complete";
import TicketEditModal from "@/components/modals/ticket-edit-full";
import HospitalTicketModal from "@/components/modals/hospital-ticket-modal";
import { TicketsTableSkeleton } from "@/components/skeletons/TicketsTableSkeleton";
import authService from "@/services/authService";
import httpService from "@/services/httpService";


export default function MyTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [filterField, setFilterField] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHospitalTicketModalOpen, setIsHospitalTicketModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState("");

  // Estados para datos reales
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // Función para obtener usuario actual del localStorage usando authService
  const getCurrentUser = () => {
    try {
      // Usar authService primero
      const user = authService.getStoredUser();
      if (user) {
        console.log('👤 Usuario encontrado via authService:', user);
        // Intentar diferentes propiedades donde puede estar el ID
        const userId = user.id || user.user_id || user.usuario_id;
        if (userId) {
          console.log('✅ ID de usuario obtenido:', userId);
          return userId;
        }
      }

      // Fallback al método anterior como respaldo
      const userData = localStorage.getItem('eva_user');
      if (userData) {
        const userParsed = JSON.parse(userData);
        console.log('👤 Usuario encontrado via localStorage:', userParsed);
        const userId = userParsed.id || userParsed.user_id || userParsed.usuario_id;
        if (userId) {
          console.log('✅ ID de usuario obtenido (fallback):', userId);
          return userId;
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
    }
    console.log('❌ No se encontró usuario válido en localStorage');
    return null;
  };

  // Función para recargar detalles de un ticket específico
  const refreshTicketDetails = async (ticketId) => {
    try {
      console.log('🔄 Recargando detalles del ticket:', ticketId);
      const response = await httpService.get(`/v1/gestion-tickets/${ticketId}`);
      
      if (response.data.success) {
        const updatedTicket = response.data.data;
        console.log('📊 Datos del ticket recibidos:', {
          id: updatedTicket.id,
          total_avances: updatedTicket.total_avances,
          avances_count: updatedTicket.avances?.length || 0,
          avances: updatedTicket.avances
        });
        // Actualizar el ticket seleccionado
        setSelectedTicket(updatedTicket);
        // También actualizar en la lista de tickets
        setTickets(prevTickets => 
          prevTickets.map(t => t.id === ticketId ? updatedTicket : t)
        );
        console.log('✅ Ticket actualizado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error recargando ticket:', error);
    }
  };

  // Función para obtener tickets reales del API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario actual dinámicamente
      const currentUserId = getCurrentUser();
      
      // Si no hay usuario actual, mostrar estado vacío
      if (!currentUserId) {
        console.log('❌ No hay usuario actual - mostrando estado sin sesión');
        setTickets([]);
        setTotalPages(1);
        setTotalItems(0);
        setLoading(false);
        return;
      }

      console.log('✅ Usuario actual encontrado:', currentUserId);

      // Preparar parámetros para el endpoint
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        reportante_id: currentUserId // Filtrar por usuario que reportó el ticket
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedOrigin && selectedOrigin !== 'all') {
        // Mapear los valores del frontend a lo que espera el backend
        const origenMap = {
          'biomedico': 'Equipos biomédicos',
          'industrial': 'Equipos industriales', 
          'infraestructura': 'Infraestructura'
        };
        params.origen = origenMap[selectedOrigin] || selectedOrigin;
      }

      console.log('🔍 Obteniendo tickets con parámetros:', params);

      // Usar httpService que maneja autenticación automáticamente
      const response = await httpService.get('/v1/gestion-tickets', { params });
      
      if (response.data.success) {
        const ticketsData = response.data.data.data || [];
        console.log('✅ Tickets obtenidos:', ticketsData.length);
        
        setTickets(ticketsData);
        setTotalPages(response.data.data.total_pages || 1);
        setTotalItems(response.data.data.total || 0);
      } else {
        console.error('❌ Error en respuesta:', response.data.message);
        setTickets([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('❌ Error obteniendo tickets:', error);
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Detalles del error:', errorMsg);
      
      setTickets([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar datos cuando cambien los filtros
  useEffect(() => {
    fetchTickets();
  }, [currentPage, itemsPerPage, searchTerm, selectedOrigin]);

  const filteredTickets = tickets; // Ya vienen filtrados del backend

  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedOrigin("all");
    setFilterField("all");
    setCurrentPage(1);
  };

  // Función para ordenar columnas
  const handleSort = (field) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar dirección
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Si es un campo nuevo, ordenar ascendente
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Ordenar tickets localmente
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar valores nulos
    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";
    
    // Comparar
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status, color) => {
    const colorClasses = {
      red: "bg-red-100 text-red-800 border-red-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge className={`${colorClasses[color] || colorClasses.gray} border text-xs`}>
        {status}
      </Badge>
    );
  };

  // Los datos ya vienen paginados del backend
  const currentTickets = sortedTickets;

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleUpdateTicket = (updatedTicket) => {
    // TODO: Implementar actualización real en el backend
    setIsEditModalOpen(false);
    fetchTickets(); // Recargar datos
  };

  const handleDeleteTicket = (ticketId, ticketDescription) => {
    const confirmMessage = `¿Está seguro de que desea eliminar el ticket #${ticketId}?\n\n"${ticketDescription.substring(0, 100)}..."\n\n⚠️ Esta acción no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      // TODO: Implementar eliminación real en el backend
      alert(`✅ Ticket #${ticketId} eliminado correctamente`);
      fetchTickets(); // Recargar datos
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <div className="flex flex-col gap-3">
          <div className="flex w-full justify-center">
            <img
              src={TicketsImg}
              className="img-fluid rounded-top max-w-full h-auto"
              alt="Mis tickets - eva"
              style={{maxWidth: '300px', width: '100%'}}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Equipos Biomédicos Modal */}
            <Button
              onClick={() => { setTicketType('biomedico'); setIsHospitalTicketModalOpen(true); }}
              className="bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 py-3 sm:py-4 lg:py-6 px-3 sm:px-6 lg:px-8 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg w-full xl:w-auto"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-4 flex-shrink-0">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">Equipos Biomédicos</div>
                <div className="text-xs sm:text-sm text-blue-600 truncate">Médicos y Licenciados</div>
              </div>
            </Button>

            {/* Equipos Industriales Modal */}
            <Button
              onClick={() => { setTicketType('industrial'); setIsHospitalTicketModalOpen(true); }}
              className="bg-white border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 py-3 sm:py-4 lg:py-6 px-3 sm:px-6 lg:px-8 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg w-full xl:w-auto"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center mr-2 sm:mr-4 flex-shrink-0">
                <Cog className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">Equipos Industriales</div>
                <div className="text-xs sm:text-sm text-orange-600 truncate">Producción y Manufactura</div>
              </div>
            </Button>

            {/* Infraestructura y Movilidad Modal */}
            <Button
              onClick={() => { setTicketType('infraestructura'); setIsHospitalTicketModalOpen(true); }}
              className="bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 py-3 sm:py-4 lg:py-6 px-3 sm:px-6 lg:px-8 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg w-full xl:w-auto"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-4 flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">Infraestructura</div>
                <div className="text-xs sm:text-sm text-green-600 truncate">Servicios y Movilidad</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-1 sm:p-2 lg:p-4">
        <Card>
          <CardHeader className="p-2 sm:p-3">
            <div>
              <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl">Mis Tickets</CardTitle>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Vea y gestione sus tickets personales
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-2 sm:p-3">
            {/* Filters */}
            <div className="mb-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm font-medium">Filtrar por</Label>
                  <Select value={filterField} onValueChange={setFilterField}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los campos</SelectItem>
                      <SelectItem value="id">ID del Ticket</SelectItem>
                      <SelectItem value="description">Descripción</SelectItem>
                      <SelectItem value="creadoPor">Creado por</SelectItem>
                      <SelectItem value="asignadoA">Asignado a</SelectItem>
                      <SelectItem value="area">Área</SelectItem>
                      <SelectItem value="equipo">Equipo</SelectItem>
                      <SelectItem value="status">Estado</SelectItem>
                      <SelectItem value="prioridad">Prioridad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="search-input" className="text-sm font-medium">
                    Buscar
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="search-input"
                      placeholder={`Buscar ${filterField === 'all' ? 'en todos los campos' : 'por ' + filterField}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="default"
                      onClick={handleClearFilters}
                      className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                      title="Limpiar todos los filtros"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Origen</Label>
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los orígenes</SelectItem>
                      <SelectItem value="biomedico">HUV Biomédico</SelectItem>
                      <SelectItem value="industrial">HUV Industrial</SelectItem>
                      <SelectItem value="infraestructura">Infraestructura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {loading ? (
                  "Cargando mis tickets..."
                ) : (
                  `Mostrando ${totalItems} tickets personales`
                )}
              </div>
            </div>

            {/* Items per page selector */}
            <div className="mb-4 flex items-center gap-2">
              <Label htmlFor="items-per-page" className="text-sm">
                Mostrar
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">registros por página</span>
            </div>

            {/* Loading State con Skeleton */}
            {loading && (
              <TicketsTableSkeleton rows={itemsPerPage} />
            )}

            {/* Empty State - Sin usuario autenticado */}
            {!loading && !getCurrentUser() && (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <Users className="w-12 h-12 mb-4 text-red-300" />
                <h3 className="text-lg font-medium mb-2">Sesión no válida</h3>
                <p className="text-sm">Por favor, inicia sesión para ver tus tickets.</p>
              </div>
            )}

            {/* Empty State - Usuario sin tickets */}
            {!loading && getCurrentUser() && tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No tienes tickets creados</h3>
                <p className="text-sm mb-4">Aún no has creado ningún ticket. Puedes crear uno nuevo usando los botones de arriba.</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTicketType("biomedico");
                      setIsHospitalTicketModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ticket Biomédico
                  </Button>
                  <Button
                    onClick={() => {
                      setTicketType("industrial");
                      setIsHospitalTicketModalOpen(true);
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ticket Industrial
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile/Tablet Cards */}
            {!loading && tickets.length > 0 && (
              <div className="block lg:hidden space-y-3 mb-4">
                {currentTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">#{ticket.id}</h3>
                          {getStatusBadge(ticket.estado, ticket.estado_color)}
                        </div>
                        <p className="text-sm text-blue-600 font-medium">{ticket.origen}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTicketClick(ticket)}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-gray-800 font-medium">{ticket.descripcion}</p>
                      <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                        <div><span className="font-medium">Reportante:</span> {ticket.reportante_nombre}</div>
                        <div><span className="font-medium">Área:</span> {ticket.area_nombre || 'N/A'}</div>
                        <div><span className="font-medium">Servicio:</span> {ticket.servicio_nombre || 'N/A'}</div>
                        <div><span className="font-medium">Sede:</span> {ticket.sede_nombre || 'N/A'}</div>
                        <div><span className="font-medium">Equipo:</span> {ticket.equipo_final}</div>
                        <div><span className="font-medium">Código:</span> {ticket.codigo_final}</div>
                        <div><span className="font-medium">Marca:</span> {ticket.marca_final}</div>
                        <div><span className="font-medium">Modelo:</span> {ticket.modelo_final}</div>
                        <div><span className="font-medium">Serie:</span> {ticket.serie_final}</div>
                        {ticket.equipo_id && (
                          <div><span className="font-medium text-blue-600">🔗 ID Equipo:</span> {ticket.equipo_id}</div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="font-medium mr-1">Fecha:</span>
                          {new Date(ticket.fecha_inicio).toLocaleDateString('es-CO')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge className={`text-xs ${
                        ticket.prioridad_color === 'red' ? 'bg-red-500 text-white' :
                        ticket.prioridad_color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        ticket.prioridad_color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.prioridad_color === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.prioridad_texto || 'Sin definir'}
                      </Badge>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="flex flex-col items-center min-h-[4rem] justify-start">
                          <Button
                            onClick={() => handleTicketClick(ticket)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded w-full h-7"
                            size="sm"
                            title="Ver detalles del ticket"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <span className="text-gray-700 font-medium text-center leading-none mt-1" style={{fontSize: '9px'}}>VER</span>
                        </div>
                        
                        {/* <div className="flex flex-col items-center min-h-[4rem] justify-start">
                          <Button
                            onClick={() => handleDeleteTicket(ticket.id, ticket.description)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded w-full h-7"
                            size="sm"
                            title="Eliminar ticket"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <span className="text-gray-700 font-medium text-center leading-none mt-1" style={{fontSize: '9px'}}>DEL</span>
                        </div> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}

            {/* Desktop Table */}
            {!loading && tickets.length > 0 && (
              <div className="hidden lg:block border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center gap-1">
                          Ticket
                          {sortField === 'id' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="w-64 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('descripcion')}
                      >
                        <div className="flex items-center gap-1">
                          Descripción
                          {sortField === 'descripcion' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="w-40 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignación</th>
                      <th 
                        className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('estado_id')}
                      >
                        <div className="flex items-center gap-1">
                          Estado
                          {sortField === 'estado_id' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('prioridad')}
                      >
                        <div className="flex items-center gap-1">
                          Prioridad
                          {sortField === 'prioridad' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="w-24 px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-2 py-3 align-top">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-900 truncate">#{ticket.id}</div>
                            <div className="text-xs text-blue-600 font-medium truncate">{ticket.origen}</div>
                            <div className="text-xs text-gray-500">{new Date(ticket.fecha_inicio).toLocaleDateString('es-CO')}</div>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-900 font-medium leading-tight">{ticket.descripcion}</div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="truncate"><span className="font-medium">Área:</span> {ticket.area_nombre || 'N/A'}</div>
                              <div className="truncate"><span className="font-medium">Servicio:</span> {ticket.servicio_nombre || 'N/A'}</div>
                              <div className="truncate"><span className="font-medium">Equipo:</span> {ticket.equipo_final}</div>
                              <div className="truncate"><span className="font-medium">Código:</span> {ticket.codigo_final}</div>
                              <div className="truncate"><span className="font-medium">Marca:</span> {ticket.marca_final} | <span className="font-medium">Modelo:</span> {ticket.modelo_final}</div>
                              <div className="truncate"><span className="font-medium">Serie:</span> {ticket.serie_final}</div>
                              <div className="flex flex-wrap gap-1 text-xs">
                                {ticket.equipo_id && (
                                  <span className="text-blue-600 font-medium bg-blue-100 px-1 rounded">🔗ID:{ticket.equipo_id}</span>
                                )}
                                {ticket.personalAsociado?.length > 0 && (
                                  <span className="text-purple-600 font-medium">✓P:{ticket.personalAsociado.length}</span>
                                )}
                                {ticket.participantes?.length > 0 && (
                                  <span className="text-indigo-600 font-medium">✓Pt:{ticket.participantes.length}</span>
                                )}
                                {ticket.cierreData?.firma && (
                                  <span className="text-red-600 font-medium">✓F</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600">
                              <div className="font-medium text-gray-700 mb-1">Reportante:</div>
                              <div className="text-gray-900 truncate">{ticket.reportante_nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <div className="space-y-1">
                            <div className="flex justify-start">
                              {getStatusBadge(ticket.estado, ticket.estado_color)}
                            </div>
                            {ticket.asignado_nombre && (
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div className="font-medium text-gray-700">Asignado a:</div>
                                <div className="text-blue-600 truncate">{ticket.asignado_nombre}</div>
                                {ticket.reportante_nombre && (
                                  <div className="text-gray-500 text-[10px] truncate">Por: {ticket.reportante_nombre}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <div className="flex justify-start">
                            <Badge className={`text-xs whitespace-nowrap ${
                              ticket.prioridad_color === 'red' ? 'bg-red-500 text-white' :
                              ticket.prioridad_color === 'orange' ? 'bg-orange-100 text-orange-800' :
                              ticket.prioridad_color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.prioridad_color === 'green' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.prioridad_texto || 'Sin definir'}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-2 py-4 bg-orange-25">
                          <div className="flex items-center justify-center gap-1 w-full max-w-[180px]">
                            <div className="flex flex-col items-center min-h-[4rem] justify-start">
                              <Button
                                onClick={() => handleTicketClick(ticket)}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded w-full h-7"
                                size="sm"
                                title="Ver detalles del ticket"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <span className="text-[10px] text-gray-700 font-medium text-center leading-tight mt-2">VER</span>
                            </div>
                            {/* <div className="flex flex-col items-center min-h-[4rem] justify-start">
                              <Button
                                onClick={() => handleEditTicket(ticket)}
                                className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded w-full h-7"
                                size="sm"
                                title="Editar ticket"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <span className="text-[10px] text-gray-700 font-medium text-center leading-tight mt-2">EDIT</span>
                            </div> */}
                            
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        isOpen={isTicketDetailsModalOpen}
        onClose={() => setIsTicketDetailsModalOpen(false)}
        ticket={selectedTicket}
        onRefresh={() => selectedTicket && refreshTicketDetails(selectedTicket.id)}
      />



      {/* Ticket Edit Modal */}
      <TicketEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ticket={selectedTicket}
        onSave={handleUpdateTicket}
      />

      {/* Hospital Ticket Modal */}
      <HospitalTicketModal
        isOpen={isHospitalTicketModalOpen}
        onClose={() => setIsHospitalTicketModalOpen(false)}
        ticketType={ticketType}
      />
    </div>
  );
}