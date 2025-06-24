"use client";

import { useState } from "react";
import { Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EquiposBajas() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const itemsPerPage = 10;

  const documents = [
    {
      id: "2019-09-004",
      description:
        "EQUIPOS MÉDICOS INFORMES QUE TIENE ASIGNADOS, ÚLTIMA ACTUALIZACIÓN",
      date: "2019-09-04",
      user: "Eva Luz Yiceth Calao Mena",
      time: "09:30",
    },
    {
      id: "2019-09-103",
      description: "BAJAS DE EQUIPOS LABORATORIO CLÍNICO 08-07-2019",
      date: "2019-09-103",
      user: "Eva Luz Yiceth Calao Mena",
      time: "10:15",
    },
    {
      id: "2019-09-104",
      description: "BAJAS DE EQUIPOS IMÁGENES DIAGNÓSTICAS 30-7-2019",
      date: "2019-09-104",
      user: "Eva Luz Yiceth Calao Mena",
      time: "11:20",
    },
    {
      id: "2019-09-105",
      description:
        "Bajas de Anestesia Philips Pulmones y MICROScopy 304 (Histo-pat)",
      date: "2019-09-105",
      user: "Eva Luz Yiceth Calao Mena",
      time: "14:30",
    },
    {
      id: "2019-09-13",
      description: "Inventario del segundo viviendo dependiendo del perfil",
      date: "2019-09-13",
      user: "Eva Luz Yiceth Calao Mena",
      time: "16:45",
    },
    {
      id: "2019-09-24",
      description: "Informe instalado con Equipo Nuevo sin mantenimiento",
      date: "2019-09-24",
      user: "Eva Luz Yiceth Calao Mena",
      time: "08:20",
    },
    {
      id: "2019-09-27",
      description: "Seguimiento técnico con Equipo Nuevo sin mantenimiento",
      date: "2019-09-27",
      user: "Eva Luz Yiceth Calao Mena",
      time: "13:10",
    },
    {
      id: "2020-05-23",
      description:
        "ESPECIFICACIONES GENERALES DE CARACTERÍSTICAS DE EQUIPOS MÉDICOS EN COLOMBIA DE CONFORMIDAD CON LA SALA ESPECIALIZADA DE DISPOSITIVOS MÉDICOS Y OTRAS TECNOLOGÍAS EN SALUD DE LA COMISIÓN REVISORA DEL INSTITUTO NACIONAL DE VIGILANCIA DE MEDICAMENTOS Y ALIMENTOS - INVIMA",
      date: "2020-05-23",
      user: "Eva Luz Yiceth Calao Mena",
      time: "09:55",
    },
    {
      id: "2020-05-24",
      description:
        "Informe de equipos eliminados, Memorias de inventario de procedimiento de equipos médicos de la empresa Hospira",
      date: "2020-05-24",
      user: "Eva Luz Yiceth Calao Mena",
      time: "15:30",
    },
    {
      id: "2020-07-15",
      description: "FINALIZACIÓN CRONOGRAMA EQUIPOS BIOMEDICOS",
      date: "2020-07-15",
      user: "Eva Luz Yiceth Calao Mena",
      time: "12:40",
    },
  ];

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = documents.slice(startIndex, endIndex);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setIsDocumentModalOpen(true);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2
        );
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Final disposition
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Administre y supervise todos los registros del sistema
          </p>
        </div>

        {/* Origin Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origen
          </label>
          <div className="flex items-center gap-2">
            <Select defaultValue="todos">
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Seleccionar origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los orígenes</SelectItem>
                <SelectItem value="equipos">Equipos médicos</SelectItem>
                <SelectItem value="laboratorio">Laboratorio</SelectItem>
                <SelectItem value="imagenes">Imágenes diagnósticas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Records Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Mostrando registros de {startIndex + 1} a{" "}
            {Math.min(endIndex, documents.length)} de un total de{" "}
            {documents.length} registros
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Archivo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Usuario
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentDocuments.map((document, index) => (
                  <tr
                    key={document.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {document.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                      <div className="line-clamp-2">{document.description}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentClick(document)}
                        className="p-2 hover:bg-blue-50 rounded-full"
                      >
                        <div className="relative">
                          <FileText className="h-6 w-6 text-blue-600" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {document.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{document.user}</div>
                          <div className="text-xs text-gray-500">
                            {document.time}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {currentDocuments.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium text-gray-900">{document.id}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDocumentClick(document)}
                  className="p-2 hover:bg-blue-50 rounded-full"
                >
                  <div className="relative">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </Button>
              </div>
              <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                {document.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {document.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <span>{document.user}</span>
                <span>•</span>
                <span>{document.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="hidden sm:flex"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="sm:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {renderPagination().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 p-0 ${
                    currentPage === page
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="hidden sm:flex"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="sm:hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documento - {selectedDocument?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedDocument.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {selectedDocument.date}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-sm min-h-[100px]">
                  {selectedDocument.description}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {selectedDocument.user}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDocumentModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Documento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
