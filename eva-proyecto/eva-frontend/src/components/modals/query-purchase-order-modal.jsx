import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"

export function QueryPurchaseOrderModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">Consulta</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-4">Buscar orden de compra</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="codigoBuscar"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Código
              </Label>
              <Input
                id="codigoBuscar"
                placeholder="INGRESE EL NÚMERO"
                className="h-8 sm:h-9 text-xs sm:text-sm" />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fechaBuscar"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Fecha
              </Label>
              <Input id="fechaBuscar" type="date" className="h-8 sm:h-9 text-xs sm:text-sm" />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="proveedorBuscar"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Proveedor
              </Label>
              <Select>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="----------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Proveedores</SelectItem>
                  <SelectItem value="varian">Varian Medical Systems</SelectItem>
                  <SelectItem value="medtronic">Medtronic Colombia</SelectItem>
                  <SelectItem value="siemens">Siemens Healthcare</SelectItem>
                  <SelectItem value="philips">Philips Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="tipoCompraBuscar"
              className="text-xs sm:text-sm font-medium text-slate-700">
              Tipo de compra
            </Label>
            <Select>
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="-----" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Tipos</SelectItem>
                <SelectItem value="equipos">Equipos Médicos</SelectItem>
                <SelectItem value="suministros">Suministros Médicos</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="estadoBuscar"
              className="text-xs sm:text-sm font-medium text-slate-700">
              Estado de la orden
            </Label>
            <Select>
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="fechaDesde"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Fecha desde
              </Label>
              <Input id="fechaDesde" type="date" className="h-8 sm:h-9 text-xs sm:text-sm" />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fechaHasta"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Fecha hasta
              </Label>
              <Input id="fechaHasta" type="date" className="h-8 sm:h-9 text-xs sm:text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="montoMinimo"
              className="text-xs sm:text-sm font-medium text-slate-700">
              Rango de monto
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                id="montoMinimo"
                placeholder="Monto mínimo"
                className="h-8 sm:h-9 text-xs sm:text-sm" />
              <Input
                id="montoMaximo"
                placeholder="Monto máximo"
                className="h-8 sm:h-9 text-xs sm:text-sm" />
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm">
            Close
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto px-4 h-9 text-sm">
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
            <Button
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-9 text-sm">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
