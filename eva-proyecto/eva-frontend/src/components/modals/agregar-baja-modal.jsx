"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useBajas from "../../hooks/useBajas";

function ModalAgregarBaja({ open, onOpenChange, onSuccess }) {
  const { createBaja, loading, error } = useBajas();
  const [fechaBaja, setFechaBaja] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivo(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setArchivo(files[0]);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    // Validaciones básicas
    if (!fechaBaja) {
      const errorMsg = 'La fecha de baja es requerida';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!descripcion.trim()) {
      const errorMsg = 'La descripción es requerida';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const promise = async () => {
      const bajaData = {
        fecha_baja: fechaBaja,
        descripcion: descripcion.trim(),
        documento: archivo
      };

      await createBaja(bajaData);

      // Limpiar formulario
      setFechaBaja("");
      setDescripcion("");
      setArchivo(null);
      setSubmitError(null);

      // Notificar éxito al padre
      if (onSuccess) {
        onSuccess();
      }
    };

    toast.promise(promise(), {
      loading: 'Creando baja...',
      success: 'Baja creada exitosamente',
      error: (err) => err.message || 'Error al crear la baja'
    });
  };

  const handleClose = () => {
    if (!loading) {
      // Limpiar formulario al cerrar
      setFechaBaja("");
      setDescripcion("");
      setArchivo(null);
      setSubmitError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Agregar Baja
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Título de sección */}

          {/* Fecha de la baja */}
          <div className="space-y-2">
            <Label htmlFor="fecha-baja" className="text-sm font-medium">
              Fecha de la baja *
            </Label>
            <Input
              id="fecha-baja"
              type="date"
              value={fechaBaja}
              onChange={(e) => setFechaBaja(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción *
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ingrese la descripción de la baja"
              className="min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Archivos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Archivos</Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent
                className="p-6 text-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-1 text-sm">
                  Arrastra y suelta archivos aquí
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  (o haz clic para seleccionar archivo)
                </p>
                {archivo && (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <span>{archivo.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchivo(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-input")?.click()}
                type="button"
              >
                SELECCIONAR ARCHIVO
              </Button>
              {archivo && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setArchivo(null)}
                  type="button"
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {(submitError || error) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{submitError || error}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between pt-3 border-t">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Baja'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default ModalAgregarBaja;
