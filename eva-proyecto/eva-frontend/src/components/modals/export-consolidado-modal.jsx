"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  X,
  FileText,
  CheckSquare,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ExportConsolidadoModal({ open, onOpenChange, equipos = [] }) {
  const [selectedEquipos, setSelectedEquipos] = useState([]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeOptions, setIncludeOptions] = useState({
    detallesEquipo: true,
    cronograma: true,
    cumplimiento: true,
    responsables: true,
    estadisticas: false,
  });

  const handleSelectAll = () => {
    if (selectedEquipos.length === equipos.length) {
      setSelectedEquipos([]);
    } else {
      setSelectedEquipos(equipos.map((equipo) => equipo.id));
    }
  };

  const handleSelectEquipo = (equipoId) => {
    setSelectedEquipos((prev) =>
      prev.includes(equipoId)
        ? prev.filter((id) => id !== equipoId)
        : [...prev, equipoId]
    );
  };

  const handleExport = () => {
    console.log("Exportando equipos:", selectedEquipos);
    console.log("Formato:", exportFormat);
    console.log("Opciones:", includeOptions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-8X1 min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-green-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Exportar Consolidado
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          <div className="space-y-6">
            {/* Opciones de exportación */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-800">
                Opciones de Exportación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        Exportar todos los equipos
                      </div>
                      <div className="text-sm text-slate-600">
                        Generar reporte con todos los equipos
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSelectAll}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {selectedEquipos.length === equipos.length
                        ? "Deseleccionar"
                        : "Seleccionar"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        Selección personalizada
                      </div>
                      <div className="text-sm text-slate-600">
                        Elegir equipos específicos
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {selectedEquipos.length} seleccionados
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de equipos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-slate-800">
                  Seleccionar Equipos
                </h4>
                <div className="text-sm text-slate-600">
                  {selectedEquipos.length} de {equipos.length} equipos
                  seleccionados
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg">
                {equipos.map((equipo) => (
                  <div
                    key={equipo.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b last:border-b-0"
                  >
                    <Checkbox
                      id={`equipo-${equipo.id}`}
                      checked={selectedEquipos.includes(equipo.id)}
                      onCheckedChange={() => handleSelectEquipo(equipo.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 text-sm">
                          #{equipo.id}
                        </span>
                        <Badge
                          className={
                            equipo.cumplimientoGlobal === "Si cumple"
                              ? "bg-green-100 text-green-800 text-xs"
                              : "bg-red-100 text-red-800 text-xs"
                          }
                        >
                          {equipo.cumplimientoGlobal}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {equipo.equipo}
                      </div>
                      <div className="text-xs text-slate-600">
                        {equipo.marca} - {equipo.modelo} | {equipo.responsable}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-slate-600">
                        Ejecutados: {equipo.cantidadEjecutados}
                      </div>
                      <div className="text-slate-600">
                        Programados: {equipo.cantidadProgramados}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formato de exportación */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-slate-800">
                Formato de Exportación
              </Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      PDF - Documento Portable
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      Excel - Hoja de Cálculo
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      CSV - Valores Separados por Comas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Incluir en el reporte */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-slate-800">
                Incluir en el Reporte
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="detalles-equipo"
                      checked={includeOptions.detallesEquipo}
                      onCheckedChange={(checked) =>
                        setIncludeOptions((prev) => ({
                          ...prev,
                          detallesEquipo: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="detalles-equipo"
                      className="text-sm text-slate-700"
                    >
                      Detalles del equipo (código, serie, marca, modelo)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cronograma"
                      checked={includeOptions.cronograma}
                      onCheckedChange={(checked) =>
                        setIncludeOptions((prev) => ({
                          ...prev,
                          cronograma: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="cronograma"
                      className="text-sm text-slate-700"
                    >
                      Cronograma de mantenimiento programado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cumplimiento"
                      checked={includeOptions.cumplimiento}
                      onCheckedChange={(checked) =>
                        setIncludeOptions((prev) => ({
                          ...prev,
                          cumplimiento: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="cumplimiento"
                      className="text-sm text-slate-700"
                    >
                      Estado de cumplimiento global
                    </Label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="responsables"
                      checked={includeOptions.responsables}
                      onCheckedChange={(checked) =>
                        setIncludeOptions((prev) => ({
                          ...prev,
                          responsables: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="responsables"
                      className="text-sm text-slate-700"
                    >
                      Responsables de mantenimiento
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="estadisticas"
                      checked={includeOptions.estadisticas}
                      onCheckedChange={(checked) =>
                        setIncludeOptions((prev) => ({
                          ...prev,
                          estadisticas: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="estadisticas"
                      className="text-sm text-slate-700"
                    >
                      Estadísticas y resumen ejecutivo
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  El archivo se generará con los equipos seleccionados y se
                  descargará automáticamente en el formato elegido.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedEquipos.length === 0}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-sm font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar {selectedEquipos.length} Equipos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
