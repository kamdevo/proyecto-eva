import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

const equipmentNames = [
  { name: "ACELERADOR LINEAL", quantity: 11 },
  { name: "ACTIVIMETRO", quantity: 1 },
  { name: "AGITADOR", quantity: 1 },
  { name: "AGITADOR CON CALENTAMIENTO", quantity: 1 },
  { name: "ANALIZADOR DE MAZZINI", quantity: 4 },
]

export function CleanNamesModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Depuración nombre de equipos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="flex gap-4 text-sm">
            <Button variant="outline" className="text-blue-600">
              Información detallada
            </Button>
            <Button variant="outline" className="text-blue-600">
              Instrucciones
            </Button>
          </div>

          <div className="text-sm text-gray-600">Mostrando registros de 1 al 5 de un total de 5 de 5 registros</div>

          <div className="flex items-center gap-2 text-sm">
            <span>Mostrar</span>
            <Select defaultValue="5">
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <span>registros por página</span>
          </div>

          <div className="bg-white border rounded-lg">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b font-medium">
              <div>Nombre</div>
              <div>Cantidad</div>
              <div></div>
            </div>

            {equipmentNames.map((equipment, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-4 border-b hover:bg-gray-50">
                <div>{equipment.name}</div>
                <div>{equipment.quantity}</div>
                <div>
                  <Checkbox />
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600">Mostrando registros de 1 al 5 de un total de 5 de 5 registros</div>

          <div className="flex items-center gap-2 text-sm">
            <span>Mostrar</span>
            <Select defaultValue="5">
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <span>registros por página</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm">
              Anterior
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
              4
            </Button>
            <Button variant="outline" size="sm">
              5
            </Button>
            <span className="text-sm">110</span>
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre Nuevo:</Label>
              <Input placeholder="Ingrese nuevo nombre" className="mt-1" />
            </div>
            <div>
              <Label>Descripción adicional:</Label>
              <Textarea placeholder="Descripción adicional" className="mt-1" />
            </div>
          </div>
        </div>

        <div className="flex justify-between p-4 border-t">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">ENVIAR</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
