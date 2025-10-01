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
} from "lucide-react";
import TicketDetailsModal from "@/components/modals/ticket-details-complete";
import TicketEditModal from "@/components/modals/ticket-edit-full";
import HospitalTicketModal from "@/components/modals/hospital-ticket-modal";


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

  // Usuario actual simulado - en producción vendría de autenticación
  const currentUserId = 1; // Cambiar según el usuario logueado

  // Función para obtener tickets reales del API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8001/api/v1/mis-tickets?page=${currentPage}&per_page=${itemsPerPage}&search=${searchTerm}&origen=${selectedOrigin}&usuario_id=${currentUserId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener tickets');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTickets(result.data.data || []);
        setTotalPages(result.data.total_pages || 1);
        setTotalItems(result.data.total || 0);
      } else {
        console.error('Error en respuesta:', result.message);
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar datos cuando cambien los filtros
  useEffect(() => {
    fetchTickets();
  }, [currentPage, itemsPerPage, searchTerm, selectedOrigin]);

  const filteredTickets = tickets; // Ya vienen filtrados del backend

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
  const currentTickets = filteredTickets;

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
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedOrigin("all");
                        setFilterField("all");
                      }}
                      title="Borrar filtros"
                    >
                      <X className="w-4 h-4" />
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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Cargando mis tickets...</div>
              </div>
            )}

            {/* Empty State */}
            {!loading && tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No tienes tickets</h3>
                <p className="text-sm">Aún no has creado ningún ticket. Usa los botones de arriba para crear uno nuevo.</p>
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
                      <div className="grid grid-cols-3 gap-1 mt-2">
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
                        <div className="flex flex-col items-center min-h-[4rem] justify-start">
                          <Button
                            onClick={() => handleEditTicket(ticket)}
                            className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded w-full h-7"
                            size="sm"
                            title="Editar ticket"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <span className="text-gray-700 font-medium text-center leading-none mt-1" style={{fontSize: '9px'}}>EDIT</span>
                        </div>
                        <div className="flex flex-col items-center min-h-[4rem] justify-start">
                          <Button
                            onClick={() => handleDeleteTicket(ticket.id, ticket.description)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded w-full h-7"
                            size="sm"
                            title="Eliminar ticket"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <span className="text-gray-700 font-medium text-center leading-none mt-1" style={{fontSize: '9px'}}>DEL</span>
                        </div>
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
                      <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                      <th className="w-64 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="w-40 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignación</th>
                      <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
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
                          <div className="flex justify-start">
                            {getStatusBadge(ticket.estado, ticket.estado_color)}
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
                          <div className="grid grid-cols-3 gap-1 w-full max-w-[180px]">
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
                            <div className="flex flex-col items-center min-h-[4rem] justify-start">
                              <Button
                                onClick={() => handleEditTicket(ticket)}
                                className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded w-full h-7"
                                size="sm"
                                title="Editar ticket"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <span className="text-[10px] text-gray-700 font-medium text-center leading-tight mt-2">EDIT</span>
                            </div>
                            <div className="flex flex-col items-center min-h-[4rem] justify-start">
                              <Button
                                onClick={() => handleDeleteTicket(ticket.id, ticket.description)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded w-full h-7"
                                size="sm"
                                title="Eliminar ticket"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <span className="text-[10px] text-gray-700 font-medium text-center leading-tight mt-2">DEL</span>
                            </div>
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