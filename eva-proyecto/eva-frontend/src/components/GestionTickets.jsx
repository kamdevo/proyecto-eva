"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import WorkOrderModal from "./modals/work-order-modal";
import useTickets from "../hooks/useTickets";
import {
  Search,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Building,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function GestionTickets() {
  // Hook personalizado para gestión de tickets
  const {
    tickets,
    loading,
    error,
    filters,
    pagination,
    search,
    filterByStatus,
    filterByPriority,
    refresh,
    changePage
  } = useTickets();

  // Estados para UI
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Funciones de manejo simplificadas
  const handleSearch = (term) => search(term);
  const handleStatusFilter = (status) => filterByStatus(status);
  const handlePriorityFilter = (priority) => filterByPriority(priority);
  const handlePageChange = (page) => changePage(page);
  const refreshTickets = () => refresh();

  // Datos mock para fallback (se mantendrán temporalmente)
  const ticketsDataFallback = [
    {
      id: "2024-001",
      equipment: "DESFIBRILADOR CON MARCAPASOS",
      brand: "ZOLL",
      model: "R SERIES",
      serial: "1234567890",
      location: "URGENCIAS",
      issue: "EQUIPO PRESENTA FALLA EN PANTALLA",
      priority: "ALTA",
      status: "PENDIENTE",
      date: "2024-01-15",
      technician: "Juan Sebastian",
      company: "HUV MANTENIMIENTO BIOMEDICO",
      estimatedTime: "2 HORAS",
      actualState: "EN REVISION",
      equipment2: "DESFIBRILADOR",
    },
    {
      id: "2024-002",
      equipment: "VENTILADOR DE TRANSPORTE VITALES",
      brand: "DRAGER",
      model: "OXYLOG 3000 PLUS",
      serial: "0987654321",
      location: "UCI",
      issue: "RESPONSABILIDAD DEL MANTENIMIENTO",
      priority: "MEDIA",
      status: "EN PROCESO",
      date: "2024-01-14",
      technician: "Aura María",
      company: "HUV MANTENIMIENTO BIOMEDICO",
      estimatedTime: "4 HORAS",
      actualState: "DIAGNOSTICO BIOMEDICO",
      equipment2: "VENTILADOR",
    },
    {
      id: "2024-003",
      equipment: "MONITOR DE SIGNOS VITALES",
      brand: "PHILIPS",
      model: "INTELLIVUE MP70",
      serial: "5555666677",
      location: "CIRUGIA",
      issue: "RESPONSABILIDAD DEL MANTENIMIENTO",
      priority: "BAJA",
      status: "COMPLETADO",
      date: "2024-01-13",
      technician: "Angelica Maria",
      company: "HUV MANTENIMIENTO BIOMEDICO",
      estimatedTime: "1 HORA",
      actualState: "DIAGNOSTICO BIOMEDICO",
      equipment2: "MONITOR",
    },
    {
      id: "2024-004",
      equipment: "BOMBA DE INFUSION",
      brand: "BAXTER",
      model: "COLLEAGUE 3 CXE",
      serial: "9999888877",
      location: "PEDIATRIA",
      issue: "RESPONSABILIDAD DEL MANTENIMIENTO",
      priority: "ALTA",
      status: "PENDIENTE",
      date: "2024-01-12",
      technician: "Natalia Pedrerosa",
      company: "HUV MANTENIMIENTO BIOMEDICO",
      estimatedTime: "3 HORAS",
      actualState: "DIAGNOSTICO BIOMEDICO",
      equipment2: "BOMBA",
    },
    {
      id: "2024-005",
      equipment: "ELECTROCARDIÓGRAFO",
      brand: "SCHILLER",
      model: "AT-10 PLUS",
      serial: "1111222233",
      location: "CONSULTA EXTERNA",
      issue: "RESPONSABILIDAD DEL MANTENIMIENTO",
      priority: "MEDIA",
      status: "EN PROCESO",
      date: "2024-01-11",
      technician: "Dayana Raigosa",
      company: "HUV MANTENIMIENTO BIOMEDICO",
      estimatedTime: "2 HORAS",
      actualState: "DIAGNOSTICO BIOMEDICO",
      equipment2: "ELECTROCARDIOGRAFO",
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completado":
        return "bg-green-100 text-green-800 border-green-200";
      case "en proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendiente":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baja":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Usar tickets reales o fallback
  const currentTickets = tickets.length > 0 ? tickets : ticketsDataFallback;

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
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{ticket.id}</h3>
            <p className="text-sm text-gray-600">{ticket.equipment}</p>
          </div>
          <Button
            onClick={() => openDocumentModal(ticket)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            size="sm"
            title="Ver documento de trabajo"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium mr-2">Ubicación:</span>
            {ticket.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium mr-2">Técnico:</span>
            {ticket.technician}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium mr-2">Fecha:</span>
            {ticket.date}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Equipo:</span> {ticket.brand} -{" "}
          {ticket.model}
          <br />
          <span className="font-medium">S/N:</span> {ticket.serial}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            className={`${getPriorityColor(ticket.priority)} border text-xs`}
          >
            {ticket.priority}
          </Badge>
          <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
            {ticket.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de carga
  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Gestión de Tickets
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Administre y supervise todos los tickets del sistema
            </p>
          </div>
          <Button
            onClick={refreshTickets}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Error al cargar datos</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <Button
              onClick={refreshTickets}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por título, descripción o número..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              <div className="relative">
                <select
                  value={filters.estado}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 sm:px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:min-w-[150px]"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="abierto">Abierto</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Prioridad</span>
              <div className="relative">
                <select
                  value={filters.prioridad}
                  onChange={(e) => handlePriorityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 sm:px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:min-w-[150px]"
                >
                  <option value="todos">Todas las prioridades</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Records Count */}
        <div className="text-xs sm:text-sm text-gray-600">
          {pagination.totalItems > 0 ? (
            <>
              Mostrando {tickets.length} de {pagination.totalItems} tickets
              {filters.search && ` (filtrados por: "${filters.search}")`}
            </>
          ) : (
            'No se encontraron tickets'
          )}
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {currentTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>

      {/* Desktop/Tablet View - Table */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 xl:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.id}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {ticket.equipment}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.brand} - {ticket.model}
                      </div>
                      <div className="text-xs text-gray-400">
                        S/N: {ticket.serial}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {ticket.location}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {ticket.technician}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={`${getPriorityColor(
                          ticket.priority
                        )} border`}
                      >
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={`${getStatusColor(ticket.status)} border`}
                      >
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {ticket.date}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => openDocumentModal(ticket)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        size="sm"
                        title="Ver documento de trabajo"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            <span>
              Mostrando {startIndex + 1} a{" "}
              {Math.min(endIndex, filteredTickets.length)} de{" "}
              {filteredTickets.length} registros
            </span>
          </div>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(pagination.currentPage - 1, 1))}
              disabled={pagination.currentPage === 1 || loading}
              className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>

            <div className="flex items-center space-x-1">
              {/* Mobile: Show only current page and total */}
              <div className="block sm:hidden">
                <span className="text-xs text-gray-600">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
              </div>

              {/* Desktop: Show page numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let page;
                  if (pagination.totalPages <= 5) {
                    page = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    page = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    page = pagination.totalPages - 4 + i;
                  } else {
                    page = pagination.currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`text-xs px-2 ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(pagination.currentPage + 1, pagination.totalPages))}
              disabled={pagination.currentPage === pagination.totalPages || loading}
              className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline mr-1">Siguiente</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Work Order Modal */}
      <WorkOrderModal
        isOpen={isDocumentModalOpen}
        onClose={closeDocumentModal}
        ticket={selectedTicket}
      />
    </div>
  );
}
