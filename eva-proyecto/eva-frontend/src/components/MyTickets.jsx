"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TicketsImg from "@/assets/Img/imagenes/mis-tickets-img.jpg";

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
  FolderOpen,
} from "lucide-react";

export default function MyTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const tickets = [
    {
      id: "14820",
      origin: "Origen 2024",
      description:
        "Ticket de prueba de equipos licenciados, se utiliza para verificar el funcionamiento del sistema para...",
      date: "2024-05-08",
      time: "14:30:07",
      status: "Cerrado",
    },
    {
      id: "14819",
      origin: "Origen 2024",
      description:
        "Ticket de prueba de equipos licenciados, se utiliza para verificar el funcionamiento del sistema para...",
      date: "2024-05-08",
      time: "14:30:07",
      status: "Cerrado",
    },
    {
      id: "14818",
      origin: "Origen 2024",
      description:
        "Ticket de prueba de equipos licenciados, se utiliza para verificar el funcionamiento del sistema para...",
      date: "2024-05-08",
      time: "14:30:07",
      status: "Cerrado",
    },
    {
      id: "14817",
      origin: "Origen 2024",
      description:
        "Ticket de prueba de equipos licenciados, se utiliza para verificar el funcionamiento del sistema para...",
      date: "2024-05-08",
      time: "14:30:07",
      status: "Cerrado",
    },
    {
      id: "14816",
      origin: "Origen 2024",
      description:
        "Ticket de prueba de equipos licenciados, se utiliza para verificar el funcionamiento del sistema para...",
      date: "2024-05-08",
      time: "14:30:07",
      status: "Cerrado",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Cerrado":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Cerrado
          </Badge>
        );
      case "Abierto":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Abierto
          </Badge>
        );
      case "En Proceso":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            En Proceso
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = tickets.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-col lg:items-center lg:justify-between gap-4">
          <div className="flex w-full justify-center">
            <img
              src={TicketsImg}
              class="img-fluid rounded-top"
              alt="Mis tickets - eva"
              width={350}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Equipos Licenciados Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700 py-6 px-6  hover:cursor-pointer hover:text-white"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Equipos licenciados
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Nuevo Orden de Trabajo Equipos Licenciados
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licensed-number">Número</Label>
                      <Input
                        id="licensed-number"
                        placeholder="Automático"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="licensed-priority">Prioridad</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licensed-description">Descripción</Label>
                    <Textarea
                      id="licensed-description"
                      placeholder="Describa el trabajo a realizar"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licensed-equipment">Equipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipo-1">
                            Equipo Licenciado 1
                          </SelectItem>
                          <SelectItem value="equipo-2">
                            Equipo Licenciado 2
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="licensed-location">Ubicación</Label>
                      <Input
                        id="licensed-location"
                        placeholder="Ubicación del equipo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licensed-date">Fecha</Label>
                      <Input id="licensed-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="licensed-time">Hora</Label>
                      <Input id="licensed-time" type="time" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licensed-technician">
                      Técnico responsable
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tecnico-1">
                          Técnico Especialista 1
                        </SelectItem>
                        <SelectItem value="tecnico-2">
                          Técnico Especialista 2
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="licensed-observations">Observaciones</Label>
                    <Textarea
                      id="licensed-observations"
                      placeholder="Observaciones adicionales"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="licensed-files">Archivos adjuntos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        id="licensed-files"
                        type="file"
                        multiple
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Drag & drop files here, or{" "}
                          <label
                            htmlFor="licensed-files"
                            className="text-blue-600 cursor-pointer hover:underline"
                          >
                            click to select files
                          </label>
                        </p>
                        <p className="text-xs text-gray-500">
                          Máximo 10MB por archivo
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Crear Orden</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Equipos Industriales Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700 py-6 px-6  hover:cursor-pointer hover:text-white"
                >
                  <Cog className="w-4 h-4 mr-2" />
                  Equipos industriales
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Nuevo Orden de Trabajo Equipos Industriales
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industrial-number">Número</Label>
                      <Input
                        id="industrial-number"
                        placeholder="Automático"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="industrial-type">Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventivo">Preventivo</SelectItem>
                          <SelectItem value="correctivo">Correctivo</SelectItem>
                          <SelectItem value="predictivo">Predictivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="industrial-description">Descripción</Label>
                    <Textarea
                      id="industrial-description"
                      placeholder="Describa el trabajo a realizar"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="industrial-equipment">Equipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo industrial" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compresor-1">
                          Compresor Industrial 1
                        </SelectItem>
                        <SelectItem value="bomba-1">
                          Bomba Centrífuga 1
                        </SelectItem>
                        <SelectItem value="motor-1">
                          Motor Eléctrico 1
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industrial-area">Área</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="produccion">Producción</SelectItem>
                          <SelectItem value="mantenimiento">
                            Mantenimiento
                          </SelectItem>
                          <SelectItem value="calidad">
                            Control de Calidad
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industrial-priority">Prioridad</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critica">Crítica</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industrial-start-date">
                        Fecha inicio
                      </Label>
                      <Input id="industrial-start-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="industrial-end-date">Fecha fin</Label>
                      <Input id="industrial-end-date" type="date" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="industrial-supervisor">Supervisor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supervisor-1">
                          Supervisor Industrial 1
                        </SelectItem>
                        <SelectItem value="supervisor-2">
                          Supervisor Industrial 2
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="industrial-resources">
                      Recursos necesarios
                    </Label>
                    <Textarea
                      id="industrial-resources"
                      placeholder="Especifique herramientas, repuestos y materiales"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="industrial-observations">
                      Observaciones
                    </Label>
                    <Textarea
                      id="industrial-observations"
                      placeholder="Observaciones adicionales"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="industrial-files">
                      Documentos adjuntos
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        id="industrial-files"
                        type="file"
                        multiple
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Drag & drop files here, or{" "}
                          <label
                            htmlFor="industrial-files"
                            className="text-blue-600 cursor-pointer hover:underline"
                          >
                            click to select files
                          </label>
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, XLS, IMG - Máximo 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Crear Orden</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Infraestructura y Movilidad Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer hover:text-white py-6 px-6"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Infraestructura y movilidad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="infra-number">Número</Label>
                      <Input
                        id="infra-number"
                        placeholder="Automático"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="infra-category">Categoría</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infraestructura">
                            Infraestructura
                          </SelectItem>
                          <SelectItem value="movilidad">Movilidad</SelectItem>
                          <SelectItem value="transporte">Transporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="infra-description">Descripción</Label>
                    <Textarea
                      id="infra-description"
                      placeholder="Describa el trabajo a realizar"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="infra-asset">Activo/Elemento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar activo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="edificio-a">Edificio A</SelectItem>
                        <SelectItem value="vehiculo-1">Vehículo 1</SelectItem>
                        <SelectItem value="sistema-hvac">
                          Sistema HVAC
                        </SelectItem>
                        <SelectItem value="ascensor-1">Ascensor 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="infra-location">Ubicación</Label>
                      <Input
                        id="infra-location"
                        placeholder="Especifique la ubicación"
                      />
                    </div>
                    <div>
                      <Label htmlFor="infra-priority">Prioridad</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgente">Urgente</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="infra-date">Fecha programada</Label>
                      <Input id="infra-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="infra-duration">Duración estimada</Label>
                      <Input id="infra-duration" placeholder="4 horas" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="infra-responsible">Responsable</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coord-infra">
                          Coordinador Infraestructura
                        </SelectItem>
                        <SelectItem value="coord-mov">
                          Coordinador Movilidad
                        </SelectItem>
                        <SelectItem value="tecnico-civil">
                          Técnico Civil
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="infra-requirements">
                      Requerimientos especiales
                    </Label>
                    <Textarea
                      id="infra-requirements"
                      placeholder="Especifique permisos, herramientas especiales, coordinaciones"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="infra-impact">Impacto operacional</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de impacto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alto">Alto</SelectItem>
                          <SelectItem value="medio">Medio</SelectItem>
                          <SelectItem value="bajo">Bajo</SelectItem>
                          <SelectItem value="nulo">Nulo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="infra-budget">Presupuesto</Label>
                      <Input id="infra-budget" placeholder="$0.00" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="infra-observations">Observaciones</Label>
                    <Textarea
                      id="infra-observations"
                      placeholder="Observaciones adicionales"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="infra-files">Archivos adjuntos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        id="infra-files"
                        type="file"
                        multiple
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Drag & drop files here, or{" "}
                          <label
                            htmlFor="infra-files"
                            className="text-blue-600 cursor-pointer hover:underline"
                          >
                            click to select files
                          </label>
                        </p>
                        <p className="text-xs text-gray-500">
                          Planos, imágenes, documentos - Máximo 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Crear Orden</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Other Action Buttons */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Gestión de Tickets</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Administre y supervise todos los tickets del sistema
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="origin-filter"
                    className="text-sm font-medium"
                  >
                    Origen
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={selectedOrigin}
                      onValueChange={setSelectedOrigin}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar origen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los orígenes</SelectItem>
                        <SelectItem value="origen-2024">Origen 2024</SelectItem>
                        <SelectItem value="origen-2023">Origen 2023</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Mostrando registros de 1 a{" "}
                {Math.min(itemsPerPage, tickets.length)} de un total de{" "}
                {tickets.length} registros
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

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Origen</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold">
                      Fecha de Creación
                    </TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.origin}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={ticket.description}>
                          {ticket.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{ticket.date}</div>
                          <div className="text-gray-500">{ticket.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-gray-600">
                Mostrando registros de 1 a{" "}
                {Math.min(itemsPerPage, tickets.length)} de un total de{" "}
                {tickets.length} registros
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
