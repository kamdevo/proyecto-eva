"use client";
import { useState } from "react";
import { Edit, Trash2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { EditModal } from "@/components/modals/EditModal";
import { ViewModal } from "@/components/modals/ViewModal";
import { DeleteModal } from "@/components/modals/DeleteModal";

export default function GuidesPage() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guidesData = [
    {
      id: 1,
      name: "BOMBA DE INFUSIÓN BAXTER COLLEAGUE 3 CANALES",
      equipos: "e803",
      status: "Activo",
      icon: "🔧",
    },
    {
      id: 2,
      name: "BOMBA DE NUTRICIÓN KANGAROO",
      equipos: "e01",
      status: "Activo",
      icon: "🔧",
    },
    {
      id: 3,
      name: "BOMBA de infusión Baxter monocanal",
      equipos: "e02",
      status: "Activo",
      icon: "🔧",
    },
    {
      id: 4,
      name: "CAMA STRYKER SV-2/SV",
      equipos: "e88",
      status: "Activo",
      icon: "🔧",
    },
  ];

  const indicatorData = [
    {
      id: 1,
      name: "ALETHIA",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 2,
      name: "ANALIZADOR DE COMPOSICION CORPORAL",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 3,
      name: "ANALIZADOR DE GASES",
      cantidadCubierta: 9,
      cantidadTotal: 9,
      porcentaje: 100.0,
    },
    {
      id: 4,
      name: "ANALIZADOR DE HEMATOLOGIA",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 5,
      name: "ANALIZADOR DE INMUNOLOGIA PARA TAMIZAJE NEONATAL",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 6,
      name: "ANGIOGRAFO BIPLANAR",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 7,
      name: "ASPIRADOR DE SECRECIONES",
      cantidadCubierta: 2,
      cantidadTotal: 2,
      porcentaje: 100.0,
    },
    {
      id: 8,
      name: "BOMBA DE INFUSION",
      cantidadCubierta: 2325,
      cantidadTotal: 2325,
      porcentaje: 100.0,
    },
    {
      id: 9,
      name: "BOMBA DE IRRIGACION",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 10,
      name: "BOMBA DE NUTRICION",
      cantidadCubierta: 310,
      cantidadTotal: 310,
      porcentaje: 100.0,
    },
    {
      id: 11,
      name: "CABEZAL DE CAMARA 4K",
      cantidadCubierta: 3,
      cantidadTotal: 3,
      porcentaje: 100.0,
    },
    {
      id: 12,
      name: "CABINA PLETISMOGRAFICA",
      cantidadCubierta: 1,
      cantidadTotal: 1,
      porcentaje: 100.0,
    },
    {
      id: 13,
      name: "Calentador de sangre y fluidos",
      cantidadCubierta: 16,
      cantidadTotal: 16,
      porcentaje: 100.0,
    },
  ];

  const riesgosIncluidos = ["IB", "II"];
  const estadosExcluidos = [
    "Equipo dado de baja",
    "En comodato",
    "Finalización demostración",
    "Otro",
    "Pendiente por dar de baja",
    "Pendiente por entregar",
  ];

  const handleEdit = (guide) => {
    setSelectedGuide(guide);
    setEditModalOpen(true);
  };

  const handleView = (guide) => {
    setSelectedGuide(guide);
    setViewModalOpen(true);
  };

  const handleDelete = (guide) => {
    setSelectedGuide(guide);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedGuide) {
      console.log("Eliminando guía:", selectedGuide.name);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-600 text-white px-4 md:px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-bold">Guides</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <Tabs defaultValue="guias-rapidas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 mb-6">
            <TabsTrigger
              value="guias-rapidas"
              className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              Guías rápidas
            </TabsTrigger>
            <TabsTrigger
              value="indicador-grupo"
              className="text-xs md:text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Indicador por grupo
            </TabsTrigger>
            <TabsTrigger
              value="detalle-grupo"
              className="text-xs md:text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Detalle por grupo
            </TabsTrigger>
            <TabsTrigger
              value="inclusiones"
              className="text-xs md:text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Inclusiones/Exclusiones
            </TabsTrigger>
          </TabsList>

          {/* Guías rápidas Tab */}
          <TabsContent value="guias-rapidas" className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-3">
                COBERTURA DE GUÍAS RÁPIDAS EQUIPOS BIOMÉDICOS 92.52 % Cumplen
                criterios: 4u0 Cumplen criterios con guía: 3u0
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  ✓ Cumplen criterios
                </Badge>
                <Badge className="bg-green-500 text-white px-3 py-1">
                  ✓ Cumplen criterios con guía
                </Badge>
                <Badge className="bg-green-500 text-white px-3 py-1">
                  ✓ Guías Disponibles sin guía rápida
                </Badge>
                <Badge className="bg-green-500 text-white px-3 py-1">
                  ✓ Guías Disponibles por grupo
                </Badge>
              </div>

              <p className="text-sm text-gray-600">
                Mostrando registros de 1 a 5 de un total de 5u0 registros
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mostrar</span>
                <Select defaultValue="5">
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  registros por página
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Anterior</span>
                <div className="flex gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-8 h-8 p-0 bg-blue-500 text-white text-xs"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    4
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    5
                  </Button>
                  <span className="text-sm text-gray-600">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    50
                  </Button>
                </div>
                <span className="text-sm text-gray-600">Siguiente</span>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-center font-semibold text-gray-700 w-12">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Nombre de la guía
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-24">
                      #Equipos
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-24">
                      Estado
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-32">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guidesData.map((guide, index) => (
                    <TableRow
                      key={guide.id}
                      className="hover:bg-gray-50 border-b"
                    >
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500">{guide.icon}</span>
                          <span className="font-medium text-gray-800">
                            {guide.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {guide.equipos}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-green-600 font-bold">✓</span>
                          <span className="text-sm font-medium text-gray-700">
                            {guide.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 h-7 w-7"
                            onClick={() => handleEdit(guide)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 h-7 w-7"
                            onClick={() => handleView(guide)}
                            title="Asociar equipos"
                          >
                            <Link className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white p-1 h-7 w-7"
                            onClick={() => handleDelete(guide)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-sm text-gray-600">
                Mostrando registros de 1 a 5 de un total de 5u0 registros.
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mostrar</span>
                <Select defaultValue="5">
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  registros por página
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Anterior</span>
                <div className="flex gap-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-8 h-8 p-0 bg-blue-500 text-white text-xs"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    4
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    5
                  </Button>
                  <span className="text-sm text-gray-600">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                  >
                    50
                  </Button>
                </div>
                <span className="text-sm text-gray-600">Siguiente</span>
              </div>
            </div>
          </TabsContent>

          {/* Indicador por grupo Tab */}
          <TabsContent value="indicador-grupo" className="space-y-6">
            <div>
              <Input placeholder="Nombre" className="max-w-xs" />
            </div>

            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                      Nombre
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-32">
                      Cantidad cubierta
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-32">
                      Cantidad total
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-24">
                      %
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indicatorData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 border-b"
                    >
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📊</span>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.cantidadCubierta}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.cantidadTotal}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.porcentaje.toFixed(4)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Detalle por grupo Tab */}
          <TabsContent value="detalle-grupo" className="space-y-6">
            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold text-gray-700">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Marca
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Modelo
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">
                      Cantidad Total
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">
                      Cantidad con guía
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500 py-8"
                    >
                      No hay datos disponibles para mostrar
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Inclusiones/Exclusiones Tab */}
          <TabsContent value="inclusiones" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-6">
                Filtros
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Riesgos Incluidos */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4">
                  RIESGOS INCLUIDOS
                </h4>
                <div className="space-y-2">
                  {riesgosIncluidos.map((riesgo, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-blue-500 font-medium">
                        {riesgo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estados Excluidos */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4">
                  ESTADOS EXCLUIDOS
                </h4>
                <div className="space-y-2">
                  {estadosExcluidos.map((estado, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-gray-600">{estado}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="mt-8 py-4 text-center text-sm text-gray-500 border-t bg-gray-50">
        <p>
          Versión 6 | Copyright © 2024 EVA gestiona la tecnología. Todos los
          derechos reservados.
        </p>
      </div>

      {/* Modales */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        guideData={
          selectedGuide
            ? { name: selectedGuide.name, status: selectedGuide.status }
            : undefined
        }
      />

      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        guideData={
          selectedGuide
            ? {
                name: selectedGuide.name,
                status: selectedGuide.status,
                equipos: selectedGuide.equipos,
              }
            : undefined
        }
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        guideData={selectedGuide ? { name: selectedGuide.name } : undefined}
      />
    </div>
  );
}
