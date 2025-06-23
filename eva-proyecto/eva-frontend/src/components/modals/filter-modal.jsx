import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function FilterModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Filtrar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-2 sm:p-3 md:p-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-slate-700 mb-4">equipos</h3>

            <div className="flex justify-between mb-6">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Filtrar</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">EXPORTAR</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo" className="text-xs sm:text-sm">
                    Código:
                  </Label>
                  <Input
                    id="codigo"
                    placeholder="CÓDIGO"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
                </div>

                <div>
                  <Label htmlFor="modelo" className="text-xs sm:text-sm">
                    Modelo:
                  </Label>
                  <Input
                    id="modelo"
                    placeholder="MODELO"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
                </div>

                <div>
                  <Label htmlFor="nombre" className="text-xs sm:text-sm">
                    Nombre:
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="NOMBRE DEL EQUIPO"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
                </div>

                <div>
                  <Label htmlFor="zona" className="text-xs sm:text-sm">
                    Zona:
                  </Label>
                  <Select>
                    <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zona1">Zona 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo" className="text-xs sm:text-sm">
                    Tipo adquisición:
                  </Label>
                  <Select>
                    <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="------" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tipo1">Tipo 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estado-mant" className="text-xs sm:text-sm">
                    Estado del mantenimiento:
                  </Label>
                  <Select>
                    <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="serie" className="text-xs sm:text-sm">
                    Serie:
                  </Label>
                  <Input
                    id="serie"
                    placeholder="SERIE"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
                </div>

                <div>
                  <Label htmlFor="marca" className="text-xs sm:text-sm">
                    Marca:
                  </Label>
                  <Input
                    id="marca"
                    placeholder="MARCA"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
                </div>

                <div>
                  <Label htmlFor="estado-actual" className="text-xs sm:text-sm">
                    Estado Actual:
                  </Label>
                  <Select>
                    <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="proveedor" className="text-xs sm:text-sm">
                    Proveedor del mantenimiento:
                  </Label>
                  <Input
                    id="proveedor"
                    placeholder="PROVEEDOR DEL MANTENIMIENTO"
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
