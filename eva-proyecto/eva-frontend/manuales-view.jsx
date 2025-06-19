"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Eye, FileText, ExternalLink, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddManualesModal } from "@/components/modals/add-manuales-modal"
import { EditManualesModal } from "@/components/modals/edit-manuales-modal"
import { DeleteManualesModal } from "@/components/modals/delete-manuales-modal"

const manualesData = [
  {
    id: 1,
    descripcion: "MICROSCOPIO QUIRÚRGICO TIVATO 7001",
    url: "https://drive.google.com/drive/folders/1g03Se0Y37OYP8iF5QRHDMx",
  },
  {
    id: 2,
    descripcion: "EQUIPO DE BRAQUITERAPIA VARIAN BRAVOS",
    url: "https://drive.google.com/drive/folders/1h04Tf1Z48PZQ9jG6RSIENy",
  },
  {
    id: 3,
    descripcion: "ACELERADOR LINEAL VARIAN TRUE BEAM",
    url: "https://drive.google.com/drive/folders/1i05Ug2A59QAR0kH7STJFOz",
  },
  {
    id: 4,
    descripcion: "MANUAL DE PROCEDIMIENTO DE VERIFICACIÓN DEL ALQON",
    url: "https://drive.google.com/drive/folders/1j06Vh3B60RBS1lI8TUKGPa",
  },
  {
    id: 5,
    descripcion: "MONITOR DE NERVIO INTRAOPERATORIO MEDTRONIC",
    url: "https://drive.google.com/drive/folders/1k07Wi4C71SCT2mJ9UVLHQb",
  },
  {
    id: 6,
    descripcion: "ELECTROBISTURÍ CONMED F700",
    url: "https://drive.google.com/drive/folders/1l08Xj5D82TDU3nK0VWMIRc",
  },
  {
    id: 7,
    descripcion: "DESFIBRILADOR ENERGETH DC70",
    url: "https://drive.google.com/drive/folders/1m09Yk6E93UEV4oL1WXNJSd",
  },
  {
    id: 8,
    descripcion: "VIDEOLARINGOSCOPIO HUGEMED",
    url: "https://drive.google.com/drive/folders/1n10Zl7F04VFW5pM2XYOKTe",
  },
  {
    id: 9,
    descripcion: "RAYOS X PORTÁTIL FOR GO PLUS",
    url: "https://drive.google.com/drive/folders/1o11Am8G15WGX6qN3YZPLUf",
  },
  {
    id: 10,
    descripcion: "VENTILADOR SLE 6000",
    url: "https://drive.google.com/drive/folders/1p12Bn9H26XHY7rO4ZAQMVg",
  },
]

export function ManualesView() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedManual, setSelectedManual] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")

  const handleEdit = (manual) => {
    setSelectedManual(manual)
    setEditModalOpen(true)
  }

  const handleDelete = (manual) => {
    setSelectedManual(manual)
    setDeleteModalOpen(true)
  }

  const handleViewUrl = (url) => {
    window.open(url, "_blank")
  }

  const filteredManuales = manualesData.filter((manual) =>
    manual.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white z-40 hidden lg:block">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">EVA APLICATIVO</span>
          </div>

          <nav className="space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">GESTIÓN PRINCIPAL</div>
            <NavItem icon={<FileText className="w-4 h-4" />} label="INICIO" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="EQUIPOS" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="PLANES" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="ÓRDENES" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="REPUESTOS" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="CAPACITACIONES" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="DASHBOARD" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="CONFIGURACIÓN" />
            <NavItem icon={<FileText className="w-4 h-4" />} label="ADMINISTRADOR" />
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-slate-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-slate-700">
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold">Manuales</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-300" />
                <Input
                  placeholder="Search..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-300 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden sm:inline">👤 Administrador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Add Button */}
          <div className="mb-6">
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>

          {/* Table Controls */}
          <div
            className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-600">entries</span>
            </div>

            {/* Mobile Search */}
            <div className="sm:hidden">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar manuales..."
                  className="flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-500 text-white">
                      <th className="text-left p-4 font-semibold">#</th>
                      <th className="text-left p-4 font-semibold">Descripción</th>
                      <th className="text-left p-4 font-semibold">Url</th>
                      <th className="text-left p-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManuales.map((manual, index) => (
                      <tr key={manual.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{index + 1}</td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{manual.descripcion}</div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUrl(manual.url)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUrl(manual.url)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-8 h-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(manual)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 w-8 h-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(manual)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 w-8 h-8 p-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredManuales.map((manual, index) => (
              <Card key={manual.id} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm leading-tight mb-2">{manual.descripcion}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUrl(manual.url)}
                        className="text-blue-600 hover:text-blue-800 text-xs p-1 h-auto">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver URL
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUrl(manual.url)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-8 h-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(manual)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50 w-8 h-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(manual)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 w-8 h-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div
            className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-slate-600">Showing 1 to 10 of {filteredManuales.length} entries</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <AddManualesModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <EditManualesModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        manual={selectedManual} />
      <DeleteManualesModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        manual={selectedManual} />
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon, label, active = false }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
