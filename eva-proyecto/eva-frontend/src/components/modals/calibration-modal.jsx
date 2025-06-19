"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const calibrationData = [
  {
    fecha: "2024-06-18",
    codigo: "CAL0001",
    serie: "MEDICA",
    marca: "PHILIPS",
    modelo: "CAL-300",
    estado: "CALIBRACION",
    ubicacion: "LABORATORIO",
    codigo2: "CALIBRACION",
    ubicacion2: "LABORATORIO CLINICO",
    acciones: "🔍",
  },
  // Add more data as needed
]

export function CalibrationModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            ⚖️ Calibraciones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="bg-blue-600 text-white p-2 rounded">
            <span>Listado Calibraciones</span>
          </div>

          <div className="text-sm text-gray-600">Showing 1 to 10 of 100 entries</div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Fecha</th>
                  <th className="border border-gray-300 p-2 text-left">Código</th>
                  <th className="border border-gray-300 p-2 text-left">Serie</th>
                  <th className="border border-gray-300 p-2 text-left">Marca</th>
                  <th className="border border-gray-300 p-2 text-left">Modelo</th>
                  <th className="border border-gray-300 p-2 text-left">Estado</th>
                  <th className="border border-gray-300 p-2 text-left">Ubicación</th>
                  <th className="border border-gray-300 p-2 text-left">Tipo</th>
                  <th className="border border-gray-300 p-2 text-left">Ubicación</th>
                  <th className="border border-gray-300 p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {calibrationData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{item.fecha}</td>
                    <td className="border border-gray-300 p-2">{item.codigo}</td>
                    <td className="border border-gray-300 p-2">{item.serie}</td>
                    <td className="border border-gray-300 p-2">{item.marca}</td>
                    <td className="border border-gray-300 p-2">{item.modelo}</td>
                    <td className="border border-gray-300 p-2">
                      <Badge className="bg-yellow-100 text-yellow-800">{item.estado}</Badge>
                    </td>
                    <td className="border border-gray-300 p-2">{item.ubicacion}</td>
                    <td className="border border-gray-300 p-2">
                      <Badge className="bg-green-100 text-green-800">{item.codigo2}</Badge>
                    </td>
                    <td className="border border-gray-300 p-2">{item.ubicacion2}</td>
                    <td className="border border-gray-300 p-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        {item.acciones}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">
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

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
