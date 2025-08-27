"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import WorkOrderModal from "./modals/work-order-modal";
import {
  Search,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Building,
} from "lucide-react";

export default function GestionTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const ticketsData = [
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

  const filteredTickets = ticketsData.filter(
    (ticket) =>
      ticket.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.technician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestión de Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Administre y supervise todos los tickets del sistema
          </p>
        </div>

        {/* Origin Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Origen</span>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-md px-3 sm:px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:min-w-[200px]">
                <option>Todos los orígenes</option>
                <option>HUV MANTENIMIENTO BIOMEDICO</option>
                <option>HUV MANTENIMIENTO INDUSTRIAL</option>
                <option>PROVEEDORES EXTERNOS</option>
              </select>
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Records Count */}
        <div className="text-xs sm:text-sm text-gray-600">
          Mostrando registros de {startIndex + 1} a{" "}
          {Math.min(endIndex, filteredTickets.length)} de un total de{" "}
          {filteredTickets.length} registros
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>

            <div className="flex items-center space-x-1">
              {/* Mobile: Show only current page and total */}
              <div className="block sm:hidden">
                <span className="text-xs text-gray-600">
                  {currentPage} / {totalPages}
                </span>
              </div>

              {/* Desktop: Show page numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
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
