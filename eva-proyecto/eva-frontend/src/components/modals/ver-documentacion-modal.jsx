"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Eye,
  FileText,
  Download,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";

const documentacionEjemplo = {
  manuales: [
    {
      id: 1,
      nombre: "Manual de Usuario - ACELERADOR LINEAL",
      tipo: "Manual de Usuario",
      fecha: "2024-01-15",
      tamaño: "2.5 MB",
      url: "#",
    },
    {
      id: 2,
      nombre: "Manual de Mantenimiento Preventivo",
      tipo: "Manual Técnico",
      fecha: "2024-01-10",
      tamaño: "1.8 MB",
      url: "#",
    },
  ],
  reportes: [
    {
      id: 1,
      nombre: "Reporte de Mantenimiento - Junio 2024",
      fecha: "2024-06-30",
      responsable: "J. Restrepo",
      estado: "Completado",
      observaciones: "Mantenimiento preventivo realizado sin incidencias",
    },
    {
      id: 2,
      nombre: "Reporte de Calibración - Mayo 2024",
      fecha: "2024-05-15",
      responsable: "SYSMED",
      estado: "Completado",
      observaciones: "Calibración dentro de parámetros normales",
    },
  ],
  historial: [
    {
      id: 1,
      fecha: "2024-06-30",
      accion: "Mantenimiento Preventivo",
      responsable: "J. Restrepo",
      resultado: "Exitoso",
      observaciones: "Todas las verificaciones completadas satisfactoriamente",
    },
    {
      id: 2,
      fecha: "2024-06-15",
      accion: "Observación Agregada",
      responsable: "Ingenieros Biomédicos",
      resultado: "Pendiente",
      observaciones:
        "Requiere calibración de precisión en el sistema de enfoque",
    },
    {
      id: 3,
      fecha: "2024-05-15",
      accion: "Calibración",
      responsable: "SYSMED",
      resultado: "Exitoso",
      observaciones: "Calibración completada dentro de parámetros",
    },
  ],
};

export function VerDocumentacionModal({ open, onOpenChange, equipo }) {
  const handleDownload = (documento) => {
    console.log("Descargando documento:", documento.nombre);
    // Aquí iría la lógica para descargar el documento
  };

  const handleViewDocument = (documento) => {
    console.log("Visualizando documento:", documento.nombre);
    // Aquí iría la lógica para abrir el documento
  };

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "completado":
      case "exitoso":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "en proceso":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!equipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] min-w-6xl max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-orange-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Documentación Completa
              </DialogTitle>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          {/* Información del equipo */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium text-slate-600">Equipo:</span>
                <div className="text-slate-900 font-medium">
                  {equipo.equipo}
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-600">ID:</span>
                <div className="text-slate-900">#{equipo.id}</div>
              </div>
              <div>
                <span className="font-medium text-slate-600">Código:</span>
                <div className="text-slate-900">{equipo.codigo}</div>
              </div>
              <div>
                <span className="font-medium text-slate-600">Serie:</span>
                <div className="text-slate-900">{equipo.serie}</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="manuales" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manuales">Manuales y Documentos</TabsTrigger>
              <TabsTrigger value="reportes">
                Reportes de Mantenimiento
              </TabsTrigger>
              <TabsTrigger value="historial">
                Historial de Actividades
              </TabsTrigger>
            </TabsList>

            {/* Tab: Manuales */}
            <TabsContent value="manuales" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800">
                  Manuales y Documentación Técnica
                </h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {documentacionEjemplo.manuales.length} documentos
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentacionEjemplo.manuales.map((manual) => (
                  <div
                    key={manual.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-red-600" />
                          <Badge variant="outline" className="text-xs">
                            {manual.tipo}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-slate-900 mb-1">
                          {manual.nombre}
                        </h4>
                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(manual.fecha).toLocaleDateString("es-ES")}
                          </div>
                          <div>Tamaño: {manual.tamaño}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(manual)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-8 h-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(manual)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50 w-8 h-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Reportes */}
            <TabsContent value="reportes" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800">
                  Reportes de Mantenimiento
                </h3>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {documentacionEjemplo.reportes.length} reportes
                </Badge>
              </div>

              <div className="space-y-3">
                {documentacionEjemplo.reportes.map((reporte) => (
                  <div
                    key={reporte.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">
                            {reporte.nombre}
                          </h4>
                          <Badge className={getEstadoColor(reporte.estado)}>
                            {reporte.estado}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(reporte.fecha).toLocaleDateString(
                              "es-ES"
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {reporte.responsable}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mt-2">
                          {reporte.observaciones}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-8 h-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800 hover:bg-green-50 w-8 h-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Historial */}
            <TabsContent value="historial" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-800">
                  Historial de Actividades
                </h3>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700"
                >
                  {documentacionEjemplo.historial.length} actividades
                </Badge>
              </div>

              <div className="space-y-3">
                {documentacionEjemplo.historial.map((actividad, index) => (
                  <div key={actividad.id} className="relative">
                    {index !== documentacionEjemplo.historial.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200"></div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-slate-900">
                                {actividad.accion}
                              </h4>
                              <Badge
                                className={getEstadoColor(actividad.resultado)}
                              >
                                {actividad.resultado}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(actividad.fecha).toLocaleDateString(
                                  "es-ES"
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {actividad.responsable}
                              </div>
                            </div>
                            <p className="text-sm text-slate-700">
                              {actividad.observaciones}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
