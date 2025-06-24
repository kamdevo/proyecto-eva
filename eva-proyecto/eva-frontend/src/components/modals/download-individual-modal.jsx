"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, X, Search, FileSpreadsheet, FileText } from "lucide-react";

const availableContingencies = [
  {
    id: "001",
    descripcion: "Ecógrafo en contingencia para Imágenes Diagnósticas",
    fecha: "2024-06-11",
    estado: "Cerrado",
  },
  {
    id: "002",
    descripcion: "Contingencia ecógrafo Doplex",
    fecha: "2024-04-19",
    estado: "Cerrado",
  },
  {
    id: "003",
    descripcion: "Ecógrafo para cirugía en Emergencias",
    fecha: "2024-04-18",
    estado: "Cerrado",
  },
];

export function DownloadIndividualModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl min-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">
              Buscar y Descargar
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4">
          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-medium text-slate-800">
              Buscar Contingencias
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="buscarTexto"
                  className="text-xs sm:text-sm font-medium text-slate-700"
                >
                  Buscar por descripción
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="buscarTexto"
                    placeholder="Ingrese palabras clave"
                    className="h-8 sm:h-9 text-xs sm:text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white h-8 sm:h-9 px-3"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="buscarFecha"
                  className="text-xs sm:text-sm font-medium text-slate-700"
                >
                  Buscar por fecha
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="buscarFecha"
                    type="date"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                  <Input
                    type="date"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">
                  Estado
                </Label>
                <Select>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                    <SelectItem value="proceso">En Proceso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">
                  Origen
                </Label>
                <Select>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="biomedico">Equipo Biomédico</SelectItem>
                    <SelectItem value="infraestructura">
                      Infraestructura
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">
                  Usuario
                </Label>
                <Select>
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="karen">Karen Sofia</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-medium text-slate-800">
                Resultados de Búsqueda
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Checkbox className="mr-2 h-3 w-3" />
                  Seleccionar todas
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg">
              {availableContingencies.map((contingency) => (
                <div
                  key={contingency.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b last:border-b-0"
                >
                  <Checkbox id={contingency.id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-xs sm:text-sm">
                        #{contingency.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {contingency.fecha}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          contingency.estado === "Cerrado"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {contingency.estado}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {contingency.descripcion}
                    </div>
                  </div>
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-medium text-slate-800">
              Opciones de Descarga
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-xs sm:text-sm">
                      Descargar PDF Individual
                    </div>
                    <div className="text-xs text-slate-600">
                      Contingencias seleccionadas en PDF
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <FileSpreadsheet className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-xs sm:text-sm">
                      Descargar Excel
                    </div>
                    <div className="text-xs text-slate-600">
                      Todas las contingencias en Excel
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm"
          >
            Cancelar
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-4 h-9 text-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-9 text-sm">
              <Download className="w-4 h-4 mr-2" />
              Descargar Seleccionadas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
