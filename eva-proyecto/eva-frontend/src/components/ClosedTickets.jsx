"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/common/Pagination";
import TicketDetailsModal from "@/components/modals/ticket-details-complete";
import {
  Search,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building,
  X,
  Wrench,
  User,
  Users,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Eye,
} from "lucide-react";
import { TicketsTableSkeleton } from "@/components/skeletons/TicketsTableSkeleton";
import httpService from "@/services/httpService";
import { useSedes } from "@/hooks/useRoles";

export default function ClosedTickets() {
  // Hook para obtener sedes de la BD
  const { sedes, loading: sedesLoading } = useSedes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [filterField, setFilterField] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Estados para datos reales
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filtros adicionales (sin estado ya que solo mostramos cerrados)
  const [sedeFilter, setSedeFilter] = useState("all");
  const [reportanteFilter, setReportanteFilter] = useState("all");
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

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

  const getPriorityBadge = (priority, color) => {
    const colorClasses = {
      red: "bg-red-500 text-white border-red-600",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge className={`${colorClasses[color] || colorClasses.gray} border text-xs`}>
        {priority}
      </Badge>
    );
  };

  // Función para recargar detalles de un ticket específico
  const refreshTicketDetails = async (ticketId) => {
    try {
      const response = await httpService.get(`/v1/gestion-tickets/${ticketId}`);
      
      if (response.data.success) {
        const updatedTicket = response.data.data;
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => 
          prevTickets.map(t => t.id === ticketId ? updatedTicket : t)
        );
      }
    } catch (error) {
      console.error('❌ Error recargando ticket:', error);
    }
  };

  // Función para obtener tickets cerrados del API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Preparar parámetros para el endpoint
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortField,
        sort_order: sortOrder,
        estado: '4' // SIEMPRE filtrar por estado Cerrado (ID: 4)
      };

      if (searchTerm) {
        if (filterField === 'id' && /^\d+$/.test(searchTerm)) {
          params.id = searchTerm;
        } else {
          params.search = searchTerm;
          if (filterField !== 'all') {
            params.search_field = filterField;
          }
        }
      }

      if (selectedOrigin && selectedOrigin !== 'all') {
        // Filtrar por tipo de equipo (no por origen)
        params.tipo_equipo = selectedOrigin;
      }

      if (sedeFilter && sedeFilter !== 'all') {
        params.sede_id = sedeFilter; // Filtrar por sede del equipo (equipos.servicio.sede_id)
      }

      if (reportanteFilter && reportanteFilter !== 'all' && reportanteFilter.trim() !== '') {
        params.reportante_nombre = reportanteFilter;
      }

      const response = await httpService.get('/v1/gestion-tickets', { params });
      
      if (response.data.success) {
        const ticketsData = response.data.data.data || [];
        setTickets(ticketsData);
        setTotalPages(response.data.data.total_pages || 1);
        setTotalItems(response.data.data.total || 0);
      } else {
        setTickets([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('❌ Error obteniendo tickets cerrados:', error);
      setTickets([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tickets al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchTickets();
  }, [currentPage, itemsPerPage, searchTerm, selectedOrigin, sedeFilter, reportanteFilter, sortField, sortOrder, filterField]);

  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedOrigin("all");
    setSedeFilter("all");
    setReportanteFilter("all");
    setFilterField("all");
    setCurrentPage(1);
  };

  // Función para ordenar columnas
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const currentTickets = tickets;

  const openDocumentModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setSelectedTicket(null);
  };

  // Mobile Card Component
  const TicketCard = ({ ticket }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900">#{ticket.id}</h3>
              {getStatusBadge(ticket.estado, ticket.estado_color)}
            </div>
            <p className="text-xs sm:text-sm text-blue-600 font-medium">{ticket.origen}</p>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="flex flex-col items-center min-h-[4rem] justify-start">
              <Button
                onClick={() => openDocumentModal(ticket)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded w-full h-7"
                size="sm"
                title="Ver detalles del ticket"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <span className="text-gray-700 font-medium text-center leading-none mt-1" style={{fontSize: '9px'}}>VER</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start gap-2">
            <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-700">Descripción:</p>
              <p className="text-gray-600 line-clamp-2">{ticket.descripcion_problema || 'Sin descripción'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Fecha</p>
                <p className="font-medium text-gray-700">{ticket.fecha_creacion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Sede</p>
                <p className="font-medium text-gray-700">{ticket.sede || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Reportante</p>
              <p className="font-medium text-gray-700">{ticket.reportante_nombre || 'N/A'}</p>
            </div>
          </div>

          {ticket.responsable_nombre && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Responsable</p>
                <p className="font-medium text-gray-700">{ticket.responsable_nombre}</p>
              </div>
            </div>
          )}

          {ticket.prioridad && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Prioridad:</span>
              {getPriorityBadge(ticket.prioridad, ticket.prioridad_color)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tickets Cerrados
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Visualización de tickets finalizados
          </p>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="space-y-4">
          {/* Search and Filter Field */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="filterField" className="text-sm font-medium text-gray-700">
                Buscar en
              </Label>
              <select
                id="filterField"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">Todos los campos</option>
                <option value="id">ID</option>
                <option value="descripcion">Descripción</option>
                <option value="equipo">Equipo</option>
                <option value="reportante">Reportante</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Término de búsqueda
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="md:col-span-3">
              <Label htmlFor="origin" className="text-sm font-medium text-gray-700">
                Tipo de Equipo
              </Label>
              <select
                id="origin"
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="1">Biomédico</option>
                <option value="2">Industrial</option>
                <option value="3">Infraestructura</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sede" className="text-sm font-medium text-gray-700">
                Sede
              </Label>
              <select
                id="sede"
                value={sedeFilter}
                onChange={(e) => setSedeFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={sedesLoading}
              >
                <option value="all">Todas las Sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="reportante" className="text-sm font-medium text-gray-700">
                Reportante
              </Label>
              <Input
                id="reportante"
                type="text"
                placeholder="Filtrar por reportante..."
                value={reportanteFilter === 'all' ? '' : reportanteFilter}
                onChange={(e) => setReportanteFilter(e.target.value || 'all')}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table/Cards */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <TicketsTableSkeleton />
        ) : currentTickets.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron tickets cerrados
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table - Exact copy from GestionTickets */}
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
                              <div className="truncate"><span className="font-medium">Última Localización:</span> {ticket.localizacion_actual || 'N/A'}</div>
                              <div className="truncate"><span className="font-medium">Responsable Mant.:</span> {ticket.responsable_mantenimiento || 'N/A'}</div>
                              <div className="truncate"><span className="font-medium">Estado Equipo:</span> {ticket.estado_equipo_nombre || 'N/A'}</div>
                              <div className="flex flex-wrap gap-1 text-xs">
                                {ticket.equipo_id && (
                                  <span className="text-blue-600 font-medium bg-blue-100 px-1 rounded">🔗ID:{ticket.equipo_id}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 align-top">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              <div className="font-medium text-gray-700">Reportante:</div>
                              <div className="text-gray-900 truncate">{ticket.reportante_nombre}</div>
                            </div>
                            {ticket.asignado_nombre && (
                              <div className="text-xs text-gray-600 mt-2">
                                <div className="font-medium text-gray-700">Asignado:</div>
                                <div className="text-blue-600 truncate">{ticket.asignado_nombre}</div>
                              </div>
                            )}
                            {ticket.usuario_asigno_nombre && (
                              <div className="text-xs text-gray-600 mt-2">
                                <div className="font-medium text-gray-700">Asignado por:</div>
                                <div className="text-gray-900 truncate">{ticket.usuario_asigno_nombre}</div>
                              </div>
                            )}
                            {ticket.empresa_nombre && (
                              <div className="text-xs text-gray-600 mt-2">
                                <div className="font-medium text-gray-700">Asignado a:</div>
                                <div className="text-purple-600 truncate">{ticket.empresa_nombre}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 align-top">
                          {getStatusBadge(ticket.estado, ticket.estado_color)}
                        </td>
                        <td className="px-2 py-3 align-top">
                          {getPriorityBadge(ticket.prioridad_texto, ticket.prioridad_color)}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-center">
                            <Button
                              onClick={() => openDocumentModal(ticket)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                              size="sm"
                              title="Ver detalles del ticket"
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {currentTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={totalItems}
              />
            </div>
          </>
        )}
      </div>

      {/* Ticket Details Modal */}
      {isDocumentModalOpen && selectedTicket && (
        <TicketDetailsModal
          isOpen={isDocumentModalOpen}
          onClose={closeDocumentModal}
          ticket={selectedTicket}
          readOnly={true}
          onRefresh={() => refreshTicketDetails(selectedTicket.id)}
        />
      )}
    </div>
  );
}
