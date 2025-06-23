"use client"

import { useState } from "react"
import { CalendarIcon, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const [closeDateStart, setCloseDateStart] = useState("23/06/2024")
  const [closeDateEnd, setCloseDateEnd] = useState("19/06/2026")
  const [creationDateStart, setCreationDateStart] = useState("23/06/2024")
  const [creationDateEnd, setCreationDateEnd] = useState("19/06/2026")

  const equipmentData = [
    { estado: "Activo", numero: 412 },
    { estado: "Inactivo", numero: 234 },
    { estado: "Mantenimiento", numero: 156 },
    { estado: "Esperando repuesto", numero: 89 },
    { estado: "Baja", numero: 45 },
  ]

  const correctiveData = [
    { modulo: "CARDIOLOGÍA-UREA", registros: 15, cantidad: 8 },
    { modulo: "LABORATORIO CLÍNICO", registros: 12, cantidad: 6 },
    { modulo: "RADIOLOGÍA", registros: 8, cantidad: 4 },
    { modulo: "ANESTESIA", registros: 6, cantidad: 3 },
    { modulo: "AUTOCLAVES", registros: 4, cantidad: 2 },
    { modulo: "AUTOCLAVES (SALA ESTERILIZACIÓN)", registros: 3, cantidad: 1 },
    { modulo: "AUTOCLAVES DE MÁQUINA", registros: 2, cantidad: 1 },
  ]

  const preventiveYearData = [
    { año: "2023", cantidadProgramadas: 1250, cantidadEjecutadas: 1180, porcentajeEjecucion: 94.4 },
    { año: "2024", cantidadProgramadas: 1340, cantidadEjecutadas: 1205, porcentajeEjecucion: 89.9 },
  ]

  const globalResultsByYear = [
    { año: "2023", cantidadPreventivaProgramadas: 1250, cantidadPreventivaEjecutadas: 1180, porcentajeEjecucion: 94.4 },
    { año: "2024", cantidadPreventivaProgramadas: 1340, cantidadPreventivaEjecutadas: 1205, porcentajeEjecucion: 89.9 },
  ]

  const globalResultsByYearAndMonth = [
    {
      año: "2024",
      mes: "Enero",
      cantidadPreventivaProgramadas: 125,
      cantidadPreventivaEjecutadas: 118,
      porcentajeEjecucion: 94.4,
    },
    {
      año: "2024",
      mes: "Febrero",
      cantidadPreventivaProgramadas: 110,
      cantidadPreventivaEjecutadas: 102,
      porcentajeEjecucion: 92.7,
    },
    {
      año: "2024",
      mes: "Marzo",
      cantidadPreventivaProgramadas: 135,
      cantidadPreventivaEjecutadas: 128,
      porcentajeEjecucion: 94.8,
    },
    {
      año: "2024",
      mes: "Abril",
      cantidadPreventivaProgramadas: 120,
      cantidadPreventivaEjecutadas: 115,
      porcentajeEjecucion: 95.8,
    },
    {
      año: "2024",
      mes: "Mayo",
      cantidadPreventivaProgramadas: 130,
      cantidadPreventivaEjecutadas: 125,
      porcentajeEjecucion: 96.2,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tablero de indicadores y control</h1>
          <p className="text-lg text-gray-600">Monitoreo y gestión de equipos médicos</p>
        </div>

        {/* Metrics Cards - Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100 border-l-4 border-l-cyan-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-700 mb-1">Total de equipos Registrados</p>
                  <p className="text-3xl font-bold text-cyan-900">9740</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Incluidos en el plan de Mantenimiento preventivo
                  </p>
                  <p className="text-3xl font-bold text-green-900">1241</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 mb-1">Total de equipos en comodato</p>
                  <p className="text-3xl font-bold text-orange-900">4211</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">Total no incluidos en el plan</p>
                  <p className="text-3xl font-bold text-red-900">3584</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row Metrics - Modern */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">TIEMPO PROMEDIO DE CIERRE</p>
                  <p className="text-2xl font-bold text-amber-900">687.2014.2756</p>
                  <p className="text-sm text-amber-600">(h)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">MANTENIMIENTOS CORRECTIVOS</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <span className="text-2xl font-bold text-emerald-900">4 óptimo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-700 mb-1">TIEMPO TIEMPO DE CIERRE</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <span className="text-2xl font-bold text-rose-900">CRÍTICO 2013</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Modern Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Equipment Status */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Reportar consolidados</CardTitle>
                <p className="text-sm text-gray-500">Seguimiento a correctivos</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm font-medium text-gray-700 mb-3">ESTADO</div>
                <div className="text-sm font-medium text-gray-700 mb-3">NÚMERO DE ORDENES</div>
                {equipmentData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{item.estado}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                      {item.numero}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Selección de año</CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="2024">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Selección de fondo</CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="fondo1">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fondo1">Fondo 1</SelectItem>
                    <SelectItem value="fondo2">Fondo 2</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Equipment by Module */}
          <div className="lg:col-span-5">
            <Card className="shadow-sm border-0 h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Cantidad por equipos</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Buscar
                  </Button>
                </div>
                <div className="flex gap-3 mt-4">
                  <Select defaultValue="modulo">
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modulo">Módulo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="10">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Registros por página</SelectItem>
                      <SelectItem value="25">25 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-900">Nombre</TableHead>
                        <TableHead className="font-semibold text-gray-900">Registros</TableHead>
                        <TableHead className="font-semibold text-gray-900">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {correctiveData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">{item.modulo}</TableCell>
                          <TableCell className="text-gray-600">{item.registros}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold">
                              {item.cantidad}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">Mostrando registros del 1 al 7 de un total de 7 registros</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm">
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Filters and Classification */}
          <div className="lg:col-span-4 space-y-6">
            {/* Date Filter - Cierre */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Filtrar por fecha de Cierre</CardTitle>
                <p className="text-sm text-gray-500">
                  Permite visualizar los datos (ej. el total de equipos registrados, el seguimiento a correctivos)
                  únicamente para aquellos elementos cuyas contingencias o procesos de mantenimiento fueron cerrados
                  dentro del rango de 'Fecha inicial' y 'Fecha final' especificado (ej. '23/06/2024' y '19/06/2026').
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha inicial</label>
                    <div className="relative">
                      <Input
                        value={closeDateStart}
                        onChange={(e) => setCloseDateStart(e.target.value)}
                        className="pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha final</label>
                    <div className="relative">
                      <Input value={closeDateEnd} onChange={(e) => setCloseDateEnd(e.target.value)} className="pr-10" />
                      <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Aplicar Filtro</Button>
              </CardContent>
            </Card>

            {/* Date Filter - Creación */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Filtrar por fecha de Creación</CardTitle>
                <p className="text-sm text-gray-500">
                  Permite visualizar los datos únicamente para aquellos elementos cuyas contingencias o procesos de
                  mantenimiento fueron creados dentro del rango de 'Fecha inicial' y 'Fecha final' especificado (ej.
                  '23/06/2024' y '19/06/2026').
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha inicial</label>
                    <div className="relative">
                      <Input
                        value={creationDateStart}
                        onChange={(e) => setCreationDateStart(e.target.value)}
                        className="pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha final</label>
                    <div className="relative">
                      <Input
                        value={creationDateEnd}
                        onChange={(e) => setCreationDateEnd(e.target.value)}
                        className="pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Aplicar Filtro</Button>
              </CardContent>
            </Card>

            {/* Risk Classification */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Clasificación biomédica</CardTitle>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <Select defaultValue="riesgo">
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riesgo">Riesgo</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { nivel: "ALTO", cantidad: 234, color: "bg-red-500" },
                  { nivel: "MEDIO ALTO", cantidad: 456, color: "bg-orange-500" },
                  { nivel: "MEDIO", cantidad: 678, color: "bg-yellow-500" },
                  { nivel: "BAJO", cantidad: 890, color: "bg-green-500" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                      <span className="font-medium text-gray-700">{item.nivel}</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                      {item.cantidad}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - All Tables */}
        <div className="space-y-8">
          {/* Seguimiento a preventivos */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Seguimiento a preventivos</CardTitle>
              <p className="text-sm text-gray-500">Selección de año</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">Año</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cantidad preventivos programados</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cantidad preventivos ejecutados</TableHead>
                      <TableHead className="font-semibold text-gray-900">Porcentaje de ejecución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preventiveYearData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.año}</TableCell>
                        <TableCell>{item.cantidadProgramadas}</TableCell>
                        <TableCell>{item.cantidadEjecutadas}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.porcentajeEjecucion} className="w-20" />
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {item.porcentajeEjecucion}%
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Resultados globales por año */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Resultados globales por año</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">Año</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cantidad preventiva programadas</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cantidad preventiva ejecutadas</TableHead>
                      <TableHead className="font-semibold text-gray-900">Porcentaje de ejecución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalResultsByYear.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.año}</TableCell>
                        <TableCell>{item.cantidadPreventivaProgramadas}</TableCell>
                        <TableCell>{item.cantidadPreventivaEjecutadas}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {item.porcentajeEjecucion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Resultados globales por año y mes */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Resultados globales por año y mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">Año</TableHead>
                      <TableHead className="font-semibold text-gray-900">Mes</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cantidad preventiva programadas</TableHead>
                      <TableHead className="font-semibold text-gray-900">Cantidad preventiva ejecutadas</TableHead>
                      <TableHead className="font-semibold text-gray-900">Porcentaje de ejecución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalResultsByYearAndMonth.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.año}</TableCell>
                        <TableCell>{item.mes}</TableCell>
                        <TableCell>{item.cantidadPreventivaProgramadas}</TableCell>
                        <TableCell>{item.cantidadPreventivaEjecutadas}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {item.porcentajeEjecucion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
