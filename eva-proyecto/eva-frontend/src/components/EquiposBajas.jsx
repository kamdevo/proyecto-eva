"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Link,
} from "lucide-react";
import AddModal from "./modals/add-modal";
import EditModal from "./modals/edit-modal";
import AssociateModal from "./modals/associate-modal";

export default function Component() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);

  const dispositionData = [
    {
      id: "20240-002-004",
      description:
        "Comunicación informativa con fines asistenciales, técnica administrativa sobre equipos médicos",
    },
    {
      id: "20240-002-005",
      description: "SALA DE EQUIPOS LABORATORIO CLINICO 4B-P-Anexo",
    },
    {
      id: "20240-002-006",
      description: "SALA DE IMAGENES DE ANESTESIA 3A-P-Anexo",
    },
    {
      id: "20240-002-007",
      description:
        "Bajas por Avería en Equipos Médicos y Radiológicos Nº4 (Año 2024)",
    },
    {
      id: "20240-002-013",
      description: "Informes del régimen urbano especializado año 2024",
    },
    {
      id: "20240-002-014",
      description: "Primer listado con hojas físicas sin mantenimiento",
    },
    {
      id: "20240-002-027",
      description: "Segundo listado con hojas físicas sin mantenimiento",
    },
    {
      id: "20240-002-014",
      description:
        "CIRCULADORES CARDIACOS DE CARDIOPLEJIA DE 3B CONCENTRADORES DE OXIGENO DE CONCENTRADORES DE SALA CONCENTRADORES DE OXIGENO DE CONCENTRADORES DE SALA CONCENTRADORES DE OXIGENO DE CONCENTRADORES DE SALA",
    },
    {
      id: "20240-002-014",
      description:
        "Listado de equipos Contratos Servicios de continuidad de suministros médicos de la emergencia Médica",
    },
    {
      id: "20240-002-015",
      description: "FINALIZACION CONTRATO EQUIPOS BIOMEDICOS",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Final disposition
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              SOLICITUDES - SOLICITUDES REGISTROS
            </p>
          </div>
          <div></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <Card>
          <CardContent className="p-4 lg:p-6">
            {/* Description */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Administrando registros Útil o al uso sin con fallas del los
                registros
              </p>
              <p className="text-sm text-gray-600">
                Pendiente: <span className="font-medium">10</span> - Registros
                por asignar
              </p>
            </div>

            {/* Add Button and Table */}
            <div className="mb-4 flex justify-start">
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 flex items-center space-x-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Agregar</span>
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">
                      Código
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[300px]">
                      Descripción
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[100px]">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispositionData.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-blue-600 text-sm">
                        {item.id}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="max-w-md lg:max-w-lg">
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          Operativo
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                            onClick={() => setIsAssociateModalOpen(true)}
                          >
                            <Link className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bottom Section */}
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">
                Administrando registros Útil o al uso sin con fallas del los
                registros
              </p>
              <p className="text-sm text-gray-600">
                Pendiente: <span className="font-medium">10</span> - Registros
                por asignar
              </p>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Mostrar</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span>registros por página</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="text-sm">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Anterior</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-teal-500 text-white hover:bg-teal-600"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <span className="text-sm text-gray-500">...</span>
                  <Button variant="outline" size="sm">
                    867
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm">
                    <span className="hidden sm:inline mr-1">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
                  <span>Versión 1.0</span>
                  <span className="text-center">
                    Copyright © 2024 EVA aplicativo de tecnología. Todos los
                    derechos reservados.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <AssociateModal
        isOpen={isAssociateModalOpen}
        onClose={() => setIsAssociateModalOpen(false)}
      />
    </div>
  );
}
