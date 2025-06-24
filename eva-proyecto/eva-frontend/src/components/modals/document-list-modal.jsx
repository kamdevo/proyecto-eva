import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Download, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const documentData = [
  {
    fecha: "2024-06-18",
    descripcion: "Primera revisión del equipo Taller de mantenimiento",
    archivo: "documento1.pdf",
    acciones: ["view", "download", "delete"],
  },
  {
    fecha: "2024-06-17",
    descripcion: "Segunda revisión del equipo taller de mantenimiento",
    archivo: "documento2.pdf",
    acciones: ["view", "download", "delete"],
  },
  {
    fecha: "2024-06-16",
    descripcion:
      "Se hace el reporte técnico de mantenimiento preventivo y se documenta la propuesta",
    archivo: "reporte_tecnico.pdf",
    acciones: ["view", "download", "delete"],
  },
  {
    fecha: "2024-06-15",
    descripcion:
      "DOCUMENTO DE GUÍA, EQUIPO LÁMPARA CIRUGÍA BIOMÉDICA DE QUIRÓFANO 1",
    archivo: "guia_quirofano.pdf",
    acciones: ["view", "download", "delete"],
  },
  {
    fecha: "2024-06-14",
    descripcion:
      "SE ENTREGA EQUIPO QUE ESTABA INACTIVO, UBICADO EN ÁREA DE MANTENIMIENTO PARA SU APROPIACIÓN",
    archivo: "entrega_equipo.pdf",
    acciones: ["view", "download", "delete"],
  },
];

export function DocumentListModal({
  open,
  onOpenChange,
  equipment,
  onUploadClick,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Listado de documentos de disposición final de tecnología biomédica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-2 sm:p-3 md:p-4">
          {/* Search and Filter Section */}
          <div className="flex gap-2 sm:gap-3 md:gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Buscar documentos..."
                className="h-7 sm:h-8 md:h-10 text-xs sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Show</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-20 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">entries</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={onUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Acción 2
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Acción 3
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Acción 4
            </Button>
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Fecha
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Descripción
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Archivo
                  </th>
                  <th className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documentData.map((doc, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-xs sm:text-sm text-gray-900">
                      {doc.fecha}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-xs sm:text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={doc.descripcion}>
                        {doc.descripcion}
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 text-sm">
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-300"
                      >
                        📄 {doc.archivo}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0"
                          title="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0"
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing 1 to 5 of 50 entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                4
              </Button>
              <Button variant="outline" size="sm">
                5
              </Button>
              <span className="text-sm">...</span>
              <span className="text-sm">10</span>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
