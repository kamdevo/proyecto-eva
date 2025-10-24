import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export function AddManualesModal({ open, onOpenChange, onSuccess }) {
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!descripcion.trim() || !url.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('http://192.168.2.146:8001/api/v1/manuales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: descripcion.trim(),
          url: url.trim()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Manual creado exitosamente');
        setDescripcion("");
        setUrl("");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || 'Error al crear manual');
      }
    } catch (error) {
      console.error('Error creating manual:', error);
      toast.error('Error al crear manual');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[60vw] mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Agregar
              </DialogTitle>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-medium text-slate-800">Manual</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="descripcion"
                  className="text-sm font-medium text-slate-700"
                >
                  Descripción<span className="text-destructive">*</span>
                </Label>
              </div>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="INGRESE DESCRIPCIÓN (A QUE EQUIPO(S) CORRESPONDE)"
                className="h-12 text-sm bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="url"
                  className="text-sm font-medium text-slate-700"
                >
                  Url<span className="text-destructive">*</span>
                </Label>
              </div>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="INGRESE URL VÁLIDA"
                className="h-12 text-sm bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Crear Manual'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
