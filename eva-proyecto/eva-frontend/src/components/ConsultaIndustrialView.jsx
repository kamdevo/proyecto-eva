import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  Calendar,
  Building,
  Package,
  Settings,
  FileText,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";

const ConsultaIndustrialView = () => {
  // Estados para formulario de adquisiciones
  const [adquisicionFilters, setAdquisicionFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    proveedor: "",
    estado: "",
    tipoEquipo: "",
    presupuestoMin: "",
    presupuestoMax: "",
  });

  // Estados para formulario de instalaciones
  const [instalacionFilters, setInstalacionFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    area: "",
    estado: "",
    tecnico: "",
    sede: "",
    tipoInstalacion: "",
  });

  // Estados para resultados
  const [adquisicionResults, setAdquisicionResults] = useState([]);
  const [instalacionResults, setInstalacionResults] = useState([]);
  const [activeTab, setActiveTab] = useState("adquisiciones");

  // Datos de ejemplo para adquisiciones
  const sampleAdquisiciones = [
    {
      id: "ADQ-001",
      fechaSolicitud: "2024-01-15",
      proveedor: "TechMed Solutions",
      equipo: "Monitor de Signos Vitales",
      cantidad: 3,
      presupuesto: 45000,
      estado: "Aprobado",
      fechaEntrega: "2024-02-15",
    },
    {
      id: "ADQ-002",
      fechaSolicitud: "2024-01-20",
      proveedor: "MedEquip Corp",
      equipo: "Ventilador Mecánico",
      cantidad: 2,
      presupuesto: 120000,
      estado: "En Proceso",
      fechaEntrega: "2024-03-01",
    },
    {
      id: "ADQ-003",
      fechaSolicitud: "2024-02-01",
      proveedor: "BioTech Industries",
      equipo: "Desfibrilador",
      cantidad: 1,
      presupuesto: 25000,
      estado: "Pendiente",
      fechaEntrega: "2024-02-28",
    },
  ];

  // Datos de ejemplo para instalaciones
  const sampleInstalaciones = [
    {
      id: "INS-001",
      fechaInstalacion: "2024-01-18",
      equipo: "Monitor de Signos Vitales",
      area: "UCI",
      sede: "Hospital Principal",
      tecnico: "Carlos Martínez",
      estado: "Completada",
      tipoInstalacion: "Nueva Instalación",
    },
    {
      id: "INS-002",
      fechaInstalacion: "2024-01-25",
      equipo: "Bomba de Infusión",
      area: "Pediatría",
      sede: "Clínica Norte",
      tecnico: "Ana García",
      estado: "En Progreso",
      tipoInstalacion: "Reemplazo",
    },
    {
      id: "INS-003",
      fechaInstalacion: "2024-02-05",
      equipo: "Ventilador Mecánico",
      area: "Emergencias",
      sede: "Hospital Principal",
      tecnico: "Luis Rodríguez",
      estado: "Programada",
      tipoInstalacion: "Traslado",
    },
  ];

  const handleAdquisicionSearch = () => {
    // Simular búsqueda de adquisiciones
    setAdquisicionResults(sampleAdquisiciones);
    console.log("Buscando adquisiciones con filtros:", adquisicionFilters);
  };

  const handleInstalacionSearch = () => {
    // Simular búsqueda de instalaciones
    setInstalacionResults(sampleInstalaciones);
    console.log("Buscando instalaciones con filtros:", instalacionFilters);
  };

  const getEstadoBadge = (estado) => {
    const colorMap = {
      Aprobado: "bg-green-100 text-green-800",
      "En Proceso": "bg-yellow-100 text-yellow-800",
      Pendiente: "bg-orange-100 text-orange-800",
      Completada: "bg-green-100 text-green-800",
      "En Progreso": "bg-[#1d293d]/10 text-[#1d293d]",
      Programada: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge
        className={`${
          colorMap[estado] || "bg-gray-100 text-gray-800"
        } font-medium`}
      >
        {estado}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Consultas Industriales
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de consultas de adquisiciones e instalaciones de equipos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">
                Sistema de Consultas
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("adquisiciones")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "adquisiciones"
                  ? "bg-white text-[#1d293d] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="h-4 w-4 inline-block mr-2" />
              Consultar Adquisiciones
            </button>
            <button
              onClick={() => setActiveTab("instalaciones")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "instalaciones"
                  ? "bg-white text-[#1d293d] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Settings className="h-4 w-4 inline-block mr-2" />
              Consultar Instalaciones
            </button>
          </div>
        </div>

        {/* Formulario de Consulta de Adquisiciones */}
        {activeTab === "adquisiciones" && (
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-[#1d293d]/5 to-[#1d293d]/10 border-b">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Package className="h-6 w-6 mr-2 text-[#1d293d]" />
                Consulta de Adquisiciones de Equipos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="fecha-inicio-adq"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fecha-inicio-adq"
                    type="date"
                    value={adquisicionFilters.fechaInicio}
                    onChange={(e) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        fechaInicio: e.target.value,
                      })
                    }
                    className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fecha-fin-adq"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Fecha Fin
                  </Label>
                  <Input
                    id="fecha-fin-adq"
                    type="date"
                    value={adquisicionFilters.fechaFin}
                    onChange={(e) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        fechaFin: e.target.value,
                      })
                    }
                    className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="proveedor-adq"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Building className="h-4 w-4 inline-block mr-1" />
                    Proveedor
                  </Label>
                  <Select
                    value={adquisicionFilters.proveedor}
                    onValueChange={(value) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        proveedor: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]">
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techmed">TechMed Solutions</SelectItem>
                      <SelectItem value="medequip">MedEquip Corp</SelectItem>
                      <SelectItem value="biotech">
                        BioTech Industries
                      </SelectItem>
                      <SelectItem value="healthcare">
                        Healthcare Systems
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="estado-adq"
                    className="text-sm font-medium text-gray-700"
                  >
                    <FileText className="h-4 w-4 inline-block mr-1" />
                    Estado
                  </Label>
                  <Select
                    value={adquisicionFilters.estado}
                    onValueChange={(value) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        estado: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="proceso">En Proceso</SelectItem>
                      <SelectItem value="aprobado">Aprobado</SelectItem>
                      <SelectItem value="rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tipo-equipo-adq"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Settings className="h-4 w-4 inline-block mr-1" />
                    Tipo de Equipo
                  </Label>
                  <Select
                    value={adquisicionFilters.tipoEquipo}
                    onValueChange={(value) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        tipoEquipo: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biomedico">Biomédico</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="imagenologia">Imagenología</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="presupuesto-min"
                    className="text-sm font-medium text-gray-700"
                  >
                    <DollarSign className="h-4 w-4 inline-block mr-1" />
                    Presupuesto Mín.
                  </Label>
                  <Input
                    id="presupuesto-min"
                    type="number"
                    placeholder="0"
                    value={adquisicionFilters.presupuestoMin}
                    onChange={(e) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        presupuestoMin: e.target.value,
                      })
                    }
                    className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="presupuesto-max"
                    className="text-sm font-medium text-gray-700"
                  >
                    <DollarSign className="h-4 w-4 inline-block mr-1" />
                    Presupuesto Máx.
                  </Label>
                  <Input
                    id="presupuesto-max"
                    type="number"
                    placeholder="999999"
                    value={adquisicionFilters.presupuestoMax}
                    onChange={(e) =>
                      setAdquisicionFilters({
                        ...adquisicionFilters,
                        presupuestoMax: e.target.value,
                      })
                    }
                    className="rounded-md border-gray-300 focus:ring-[#1d293d] focus:border-[#1d293d]"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAdquisicionSearch}
                    className="w-full bg-[#1d293d] hover:bg-[#2a3b52] text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Adquisiciones
                  </Button>
                </div>
              </div>

              {/* Resultados de Adquisiciones */}
              {adquisicionResults.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Resultados de Adquisiciones ({adquisicionResults.length})
                    </h3>
                    <Button variant="outline" className="text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-900">
                            ID
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Fecha Solicitud
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Proveedor
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Equipo
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Cantidad
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Presupuesto
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Estado
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Fecha Entrega
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adquisicionResults.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {item.id}
                            </TableCell>
                            <TableCell>{item.fechaSolicitud}</TableCell>
                            <TableCell>{item.proveedor}</TableCell>
                            <TableCell>{item.equipo}</TableCell>
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>
                              ${item.presupuesto.toLocaleString()}
                            </TableCell>
                            <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                            <TableCell>{item.fechaEntrega}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Formulario de Consulta de Instalaciones */}
        {activeTab === "instalaciones" && (
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Settings className="h-6 w-6 mr-2 text-green-600" />
                Consulta de Instalaciones de Equipos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="fecha-inicio-ins"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fecha-inicio-ins"
                    type="date"
                    value={instalacionFilters.fechaInicio}
                    onChange={(e) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        fechaInicio: e.target.value,
                      })
                    }
                    className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fecha-fin-ins"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Fecha Fin
                  </Label>
                  <Input
                    id="fecha-fin-ins"
                    type="date"
                    value={instalacionFilters.fechaFin}
                    onChange={(e) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        fechaFin: e.target.value,
                      })
                    }
                    className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="area-ins"
                    className="text-sm font-medium text-gray-700"
                  >
                    <MapPin className="h-4 w-4 inline-block mr-1" />
                    Área
                  </Label>
                  <Select
                    value={instalacionFilters.area}
                    onValueChange={(value) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        area: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uci">UCI</SelectItem>
                      <SelectItem value="pediatria">Pediatría</SelectItem>
                      <SelectItem value="emergencias">Emergencias</SelectItem>
                      <SelectItem value="quirofanos">Quirófanos</SelectItem>
                      <SelectItem value="laboratorio">Laboratorio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sede-ins"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Building className="h-4 w-4 inline-block mr-1" />
                    Sede
                  </Label>
                  <Select
                    value={instalacionFilters.sede}
                    onValueChange={(value) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        sede: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">
                        Hospital Principal
                      </SelectItem>
                      <SelectItem value="norte">Clínica Norte</SelectItem>
                      <SelectItem value="sur">Clínica Sur</SelectItem>
                      <SelectItem value="oeste">Centro Oeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tecnico-ins"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Settings className="h-4 w-4 inline-block mr-1" />
                    Técnico
                  </Label>
                  <Select
                    value={instalacionFilters.tecnico}
                    onValueChange={(value) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        tecnico: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Martínez</SelectItem>
                      <SelectItem value="ana">Ana García</SelectItem>
                      <SelectItem value="luis">Luis Rodríguez</SelectItem>
                      <SelectItem value="maria">María López</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tipo-instalacion"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Settings className="h-4 w-4 inline-block mr-1" />
                    Tipo Instalación
                  </Label>
                  <Select
                    value={instalacionFilters.tipoInstalacion}
                    onValueChange={(value) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        tipoInstalacion: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nueva">Nueva Instalación</SelectItem>
                      <SelectItem value="reemplazo">Reemplazo</SelectItem>
                      <SelectItem value="traslado">Traslado</SelectItem>
                      <SelectItem value="mantenimiento">
                        Mantenimiento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="estado-ins"
                    className="text-sm font-medium text-gray-700"
                  >
                    <Clock className="h-4 w-4 inline-block mr-1" />
                    Estado
                  </Label>
                  <Select
                    value={instalacionFilters.estado}
                    onValueChange={(value) =>
                      setInstalacionFilters({
                        ...instalacionFilters,
                        estado: value,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="progreso">En Progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleInstalacionSearch}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Instalaciones
                  </Button>
                </div>
              </div>

              {/* Resultados de Instalaciones */}
              {instalacionResults.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Resultados de Instalaciones ({instalacionResults.length})
                    </h3>
                    <Button variant="outline" className="text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-900">
                            ID
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Fecha Instalación
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Equipo
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Área
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Sede
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Técnico
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Estado
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            Tipo
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {instalacionResults.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {item.id}
                            </TableCell>
                            <TableCell>{item.fechaInstalacion}</TableCell>
                            <TableCell>{item.equipo}</TableCell>
                            <TableCell>{item.area}</TableCell>
                            <TableCell>{item.sede}</TableCell>
                            <TableCell>{item.tecnico}</TableCell>
                            <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                            <TableCell>{item.tipoInstalacion}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultaIndustrialView;
