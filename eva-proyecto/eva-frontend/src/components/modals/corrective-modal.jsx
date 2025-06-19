import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const correctiveData = [
  {
    fecha: "2024-06-18",
    codigo: "COR0001",
    serie: "MEDICA",
    marca: "SIEMENS",
    modelo: "COR-400",
    estado: "CORRECTIVO",
    ubicacion: "URGENCIAS",
    codigo2: "CORRECTIVO",
    ubicacion2: "SALA DE URGENCIAS",
    acciones: "🔍",
  },
  // Add more data as needed
]

export function CorrectiveModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            🔧 Correctivos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="bg-blue-600 text-white p-2 rounded">
            <span>Listado Correctivos</span>
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
                {correctiveData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{item.fecha}</td>
                    <td className="border border-gray-300 p-2">{item.codigo}</td>
                    <td className="border border-gray-300 p-2">{item.serie}</td>
                    <td className="border border-gray-300 p-2">{item.marca}</td>
                    <td className="border border-gray-300 p-2">{item.modelo}</td>
                    <td className="border border-gray-300 p-2">
                      <Badge className="bg-red-100 text-red-800">{item.estado}</Badge>
                    </td>
                    <td className="border border-gray-300 p-2">{item.ubicacion}</td>
                    <td className="border border-gray-300 p-2">
                      <Badge className="bg-orange-100 text-orange-800">{item.codigo2}</Badge>
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
