import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, AlertCircle, FileSpreadsheet } from "lucide-react"

export function ObservacionesModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">OBSERVACIONES</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div
            className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          {/* Información del archivo Excel */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Así debe ser la información del archivo de excel ingresada
                </span>
              </div>
            </div>

            {/* Tabla de ejemplo */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-slate-300 text-sm">
                <thead>
                  <tr className="bg-slate-500 text-white">
                    <th className="border border-slate-400 p-2 text-left">Id equipo</th>
                    <th className="border border-slate-400 p-2 text-left">Meses</th>
                    <th className="border border-slate-400 p-2 text-left">Meses</th>
                    <th className="border border-slate-400 p-2 text-left">Meses</th>
                    <th className="border border-slate-400 p-2 text-left">Responsable</th>
                    <th className="border border-slate-400 p-2 text-left">Frecuencia de mantenimiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-slate-300 p-2">200</td>
                    <td className="border border-slate-300 p-2">1</td>
                    <td className="border border-slate-300 p-2">7</td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2">SYSMED</td>
                    <td className="border border-slate-300 p-2">ANUAL</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-300 p-2">340</td>
                    <td className="border border-slate-300 p-2">2</td>
                    <td className="border border-slate-300 p-2">8</td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2">SYSMED</td>
                    <td className="border border-slate-300 p-2">SEMESTRAL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Observaciones principales */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">OBSERVACIONES</h3>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-medium">
                Para ingresar un registro en el plan de mantenimiento debe ingresar en el formulario un archivo de excel
                plano con una sola hoja y teniendo en cuenta las siguientes instrucciones:
              </p>

              <ul className="space-y-3 list-disc list-inside pl-4">
                <li>
                  <strong>La opción reemplazar información subida previamente</strong> reemplaza un registro del plan
                  según el año seleccionado; es equivalente a actualizar el registro con la diferencia de que si durante
                  el proceso anterior algunos registros, aquellos que no estaban presentes se agregaran al plan.
                </li>

                <li>
                  <strong>Los campos meses</strong> deben ser valores numéricos y deben ser agregados de forma lógica es
                  decir en orden ascendente correspondiente al año.
                </li>

                <li>
                  <strong>El id del equipos</strong> es aquel que identifica inequívocamente al equipo en la base de
                  datos, es decir es el que está asignado en el aplicativo.
                </li>

                <li>
                  <strong>El responsable</strong> es el responsable del mantenimiento, verifique que no sea ingresado el
                  mismo responsable con variación en su nombre o de lo contrario se identificarán como responsables
                  diferentes.
                </li>

                <li>
                  <strong>En la base de datos</strong> aparecen de muestra en la primera fila los nombres a utilizar,
                  estos son informativos, ya que cuando se vaya a subir el archivo estos datos se actualizarán{" "}
                  <span className="text-blue-600 font-medium">sin los títulos</span>.
                </li>
              </ul>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-amber-800">
                    <strong>Importante:</strong> Asegúrese de que el archivo Excel tenga el formato exacto mostrado en
                    la tabla de ejemplo para evitar errores en la importación.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
