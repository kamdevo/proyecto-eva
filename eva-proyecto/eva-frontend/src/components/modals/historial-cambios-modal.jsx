import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText } from "lucide-react";

export function HistorialCambiosModal({ open, onOpenChange, planId }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && planId) {
      loadHistorial();
    }
  }, [open, planId]);

  const loadHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001";
      const response = await fetch(
        `${API_BASE_URL}/api/v1/planes-mantenimientos/${planId}/historial`
      );
      const data = await response.json();
      
      if (data.success) {
        setHistorial(data.data || []);
      } else {
        setError(data.message || 'Error al cargar historial');
      }
    } catch (err) {
      console.error('Error loading historial:', err);
      setError('Error de conexión al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Historial de Cambios
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading && (
            <div className="text-center py-12 text-slate-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Cargando historial...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          
          {!loading && !error && historial.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No hay cambios registrados</p>
              <p className="text-sm mt-2">Este plan no ha sido modificado desde su creación</p>
            </div>
          )}
          
          {!loading && !error && historial.length > 0 && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{historial.length}</strong> {historial.length === 1 ? 'cambio registrado' : 'cambios registrados'}
                </p>
              </div>
              
              {historial.map((cambio, index) => (
                <div 
                  key={cambio.id} 
                  className="relative border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white pl-5 pr-4 py-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Contador de cambio */}
                  <div className="absolute -left-3 top-4 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                    {historial.length - index}
                  </div>
                  
                  {/* Header del cambio */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 font-medium">
                        {cambio.usuario_nombre || 'Usuario Desconocido'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatFecha(cambio.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Descripción del cambio */}
                  <div className="text-sm text-slate-800 font-medium bg-white px-3 py-2 rounded border border-slate-200">
                    {cambio.cambio}
                  </div>
                  
                  {/* Separador visual entre cambios (excepto el último) */}
                  {index < historial.length - 1 && (
                    <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer con información adicional */}
        {!loading && !error && historial.length > 0 && (
          <div className="border-t pt-3 mt-3 text-xs text-slate-500 text-center">
            Mostrando todos los cambios registrados para este plan
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default HistorialCambiosModal;
