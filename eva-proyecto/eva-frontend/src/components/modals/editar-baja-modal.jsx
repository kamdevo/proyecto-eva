"use client";

import { useState, useEffect } from "react";
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
import { Upload, X, Edit, AlertCircle } from "lucide-react";
import useBajas from "../../hooks/useBajas";

function ModalEditarDocumento({ open, onOpenChange, baja, onSuccess }) {
  const { updateBaja, loading, error } = useBajas();
  const [fechaBaja, setFechaBaja] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Cargar datos de la baja cuando se abre el modal
  useEffect(() => {
    if (open && baja) {
      setFechaBaja(baja.fecha_baja || "");
      setDescripcion(baja.descripcion || "");
      setArchivo(null); // No cargar archivo existente
      setSubmitError(null);
    }
  }, [open, baja]);

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

    if (!baja?.id) {
      setSubmitError('No se puede actualizar: ID de baja no encontrado');
      return;
    }

    // Validaciones básicas
    if (!fechaBaja) {
      setSubmitError('La fecha de baja es requerida');
      return;
    }

    if (!descripcion.trim()) {
      setSubmitError('La descripción es requerida');
      return;
    }

    try {
      const bajaData = {
        fecha_baja: fechaBaja,
        descripcion: descripcion.trim(),
        documento: archivo
      };

      await updateBaja(baja.id, bajaData);

      setSubmitError(null);

      // Notificar éxito
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setSubmitError(err.message || 'Error al actualizar la baja');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubmitError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Editar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Título del documento */}
          <div>
            <h3 className="text-lg font-medium text-blue-600 border-b border-blue-200 pb-1">
              Editar Baja ID: {baja?.id}
            </h3>
          </div>

          {/* Fecha de la baja */}
          <div className="space-y-2">
            <Label htmlFor="fecha-baja-edit" className="text-sm font-medium">
              Fecha de la baja *
            </Label>
            <Input
              id="fecha-baja-edit"
              type="date"
              value={fechaBaja}
              onChange={(e) => setFechaBaja(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion-edit" className="text-sm font-medium">
              Descripción *
            </Label>
            <Textarea
              id="descripcion-edit"
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
                onClick={() =>
                  document.getElementById("file-input-edit")?.click()
                }
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-1 text-sm">
                  Arrastra y suelta archivos aquí
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  (o haz clic para seleccionar archivo)
                </p>
                {baja?.documento && !archivo && (
                  <p className="text-xs text-blue-600 mb-2">
                    Archivo actual: {baja.documento}
                  </p>
                )}
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
              id="file-input-edit"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-input-edit")?.click()}
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
            {archivo && (
              <p className="text-xs text-green-600 mt-1">
                Nuevo archivo seleccionado: {archivo.name}
              </p>
            )}
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
            {loading ? 'Actualizando...' : 'Actualizar Baja'}
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
export default ModalEditarDocumento;
