import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, ExternalLink, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import httpService from "@/services/httpService";

export function CapacitacionesModal({ open, onOpenChange, equipmentId, equipmentName }) {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && equipmentId) {
      fetchCapacitaciones();
    }
  }, [open, equipmentId]);

  const fetchCapacitaciones = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(`/v1/equipos/${equipmentId}/documents`);
      if (response.data.success) {
        // Filtrar solo documentos de tipo "Capacitación"
        const docs = response.data.data || [];
        const capacitacionesDocs = docs.filter(doc => 
          doc.tipo_documento && doc.tipo_documento.toLowerCase().includes('capacitaci')
        );
        setCapacitaciones(capacitacionesDocs);
      }
    } catch (error) {
      console.error('Error fetching capacitaciones:', error);
      toast.error("Error al cargar capacitaciones");
    } finally {
      setLoading(false);
    }
  };
  const handleViewDocument = (fileName) => {
    if (!fileName) {
      toast.error("No hay archivo disponible");
      return;
    }
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/equipos/archivos/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-slate-50 border-b border-slate-200 p-6 rounded-t-lg -mt-6 -mx-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <div className="bg-slate-600 p-3 rounded-lg mr-4 shadow-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">Capacitaciones del Equipo</DialogTitle>
              <p className="text-sm text-slate-600 mt-1">{equipmentName}</p>
            </div>
          </motion.div>
        </DialogHeader>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Documentos de Capacitación ({capacitaciones.length})
          </h3>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-3"></div>
                <p className="text-slate-600">Cargando capacitaciones...</p>
              </motion.div>
            ) : capacitaciones.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200"
              >
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No hay capacitaciones registradas para este equipo</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {capacitaciones.map((capacitacion, index) => (
                  <motion.div
                    key={capacitacion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-slate-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              Documento de Capacitación
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(capacitacion.fecha_subida)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {capacitacion.otro && (
                          <p className="text-sm text-slate-600 mb-3 pl-11">
                            {capacitacion.otro}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pl-11">
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-300">
                            {capacitacion.tipo_documento}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleViewDocument(capacitacion.archivo)}
                        className="bg-slate-600 hover:bg-slate-700 text-white transition-colors duration-200 shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Documento
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
