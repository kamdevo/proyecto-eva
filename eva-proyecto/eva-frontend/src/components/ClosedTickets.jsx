"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PdfModal } from "@/components/modals/pdf-modal";

const documents = [
  {
    id: 1,
    codigo: "LAB001",
    reporte:
      "LABORATORIO CLINICO - Hemograma completo, glucosa, creatinina, urea, ácido úrico, colesterol total, triglicéridos, HDL, LDL",
    cierre: "26-01-2024 08:30:15",
    tiempoCierre: "26-07-2024",
    estado: "VIGENTE",
    fuente: "Sistema externo: www.lab.com.co",
    observaciones: "Paciente en ayunas",
    responsable: "Dr. García López",
  },
  {
    id: 2,
    codigo: "RAD002",
    reporte:
      "RADIOLOGIA - Radiografía de tórax PA y lateral, evaluación de campos pulmonares y silueta cardiovascular",
    cierre: "25-01-2024 14:20:30",
    tiempoCierre: "25-07-2024",
    estado: "VIGENTE",
    fuente: "Sistema externo: www.radiologia.com.co",
    observaciones: "Control post-operatorio",
    responsable: "Dr. Martínez Ruiz",
  },
  {
    id: 3,
    codigo: "CONS003",
    reporte:
      "CONSULTA ESPECIALIZADA - Cardiología, evaluación de función ventricular, electrocardiograma, ecocardiograma",
    cierre: "24-01-2024 10:15:45",
    tiempoCierre: "24-12-2024",
    estado: "VIGENTE",
    fuente: "Sistema externo: www.cardio.com.co",
    observaciones: "Seguimiento rutinario",
    responsable: "Dr. López Herrera",
  },
  {
    id: 4,
    codigo: "PROC004",
    reporte:
      "PROCEDIMIENTO QUIRURGICO - Cirugía laparoscópica, colecistectomía, preparación pre-operatoria completa",
    cierre: "23-01-2024 16:45:20",
    tiempoCierre: "23-03-2024",
    estado: "PENDIENTE",
    fuente: "Sistema externo: www.cirugia.com.co",
    observaciones: "Programado para febrero",
    responsable: "Dr. Rodríguez Silva",
  },
  {
    id: 5,
    codigo: "FARM005",
    reporte:
      "FARMACIA - Dispensación de medicamentos, antihipertensivos, hipoglucemiantes, anticoagulantes orales",
    cierre: "22-01-2024 09:30:10",
    tiempoCierre: "22-04-2024",
    estado: "VIGENTE",
    fuente: "Sistema externo: www.farmacia.com.co",
    observaciones: "Medicación crónica",
    responsable: "Dr. Fernández Castro",
  },
];

const searchOptions = [
  { value: "todos", label: "Todos los documentos" },
  { value: "laboratorio", label: "Laboratorio Clínico" },
  { value: "radiologia", label: "Radiología" },
  { value: "consulta", label: "Consulta Especializada" },
  { value: "procedimiento", label: "Procedimiento Quirúrgico" },
  { value: "farmacia", label: "Farmacia" },
  { value: "vigente", label: "Estado: Vigente" },
  { value: "pendiente", label: "Estado: Pendiente" },
];

export default function ClosedTickets() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("todos");

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleSearch = () => {
    // Aquí puedes implementar la lógica de filtrado
    console.log("Buscando:", searchValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Closedoc
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gestión de documentos médicos
          </p>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Buscar
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Documentos registrados del 1 al 31 de enero del 2024 registrados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <Select value={searchValue} onValueChange={setSearchValue}>
                <SelectTrigger className="bg-gray-50 border-gray-300 w-full">
                  <SelectValue placeholder="Seleccione una opción" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-slate-600 text-white px-4 sm:px-6 py-3">
            <h4 className="font-semibold text-sm sm:text-base">Documentos</h4>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    CÓDIGO
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    REPORTE
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    CIERRE
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    TIEMPO DE CIERRE
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    ESTADO
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {doc.codigo}
                      </div>
                      <div className="text-xs text-gray-500">ID: {doc.id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="text-gray-900 max-w-md">
                        <div className="font-medium mb-1">{doc.reporte}</div>
                        <div className="text-xs text-gray-500 mb-1">
                          <strong>Fuente externa:</strong> {doc.fuente}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          <strong>Observaciones:</strong> {doc.observaciones}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Responsable:</strong> {doc.responsable}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {doc.cierre}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {doc.tiempoCierre}
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          doc.estado === "VIGENTE"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {doc.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
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

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className={`p-4 border-b border-gray-200 last:border-b-0 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {doc.codigo}
                    </div>
                    <div className="text-xs text-gray-500">ID: {doc.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doc.estado === "VIGENTE"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {doc.estado}
                    </span>
                    <button
                      onClick={() => handleDocumentClick(doc)}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Ver documento"
                    >
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {doc.reporte}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <strong>Fuente externa:</strong> {doc.fuente}
                    </div>
                    <div>
                      <strong>Observaciones:</strong> {doc.observaciones}
                    </div>
                    <div>
                      <strong>Responsable:</strong> {doc.responsable}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-medium text-gray-700">Cierre</div>
                    <div className="text-gray-900">{doc.cierre}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      Tiempo de Cierre
                    </div>
                    <div className="text-gray-900">{doc.tiempoCierre}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-xs sm:text-sm text-gray-600">
          <p>
            Documentos registrados del 1 al 31 de enero del 2024 registrados.
          </p>
          <p className="mt-2">
            <strong>Registros:</strong> 5 |
            <strong className="ml-2">Vigentes:</strong> 4 |
            <strong className="ml-2">Pendientes:</strong> 1
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs">
              Copyright © Grupo EVA Soluciones en Tecnología. Todos los derechos
              reservados.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 border-gray-300"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 border-gray-300"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {selectedDocument && (
        <PdfModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          documentTitle={`${selectedDocument.codigo} - ${selectedDocument.reporte}`}
          documentDate={selectedDocument.cierre}
        />
      )}
    </div>
  );
}
