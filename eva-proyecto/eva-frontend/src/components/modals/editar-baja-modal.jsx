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
import { Upload, X, Edit } from "lucide-react";

function ModalEditarDocumento({ open, onOpenChange, document }) {
  const [fechaBaja, setFechaBaja] = useState("2019-05-04");
  const [descripcion, setDescripcion] = useState(
    "Concepto técnico de baja, según el acta presentada por Consultorio y Medicina 2020"
  );
  const [archivo, setArchivo] = useState(null);

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
              Documento soporte de disposición final de equipos biomédicos
            </h3>
          </div>

          {/* Fecha de la baja */}
          <div className="space-y-2">
            <Label htmlFor="fecha-baja-edit" className="text-sm font-medium">
              Fecha de la baja
            </Label>
            <Input
              id="fecha-baja-edit"
              type="date"
              value={fechaBaja}
              onChange={(e) => setFechaBaja(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion-edit" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion-edit"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="min-h-[60px] resize-none"
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
                  Drag & drop files here
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  (or click to select file)
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
              id="file-input-edit"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                SELECT FILE
              </Button>
              <Button variant="destructive" size="sm">
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between pt-3 border-t">
          <Button className="bg-blue-600 hover:bg-blue-700">Actualizar</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default ModalEditarDocumento;
