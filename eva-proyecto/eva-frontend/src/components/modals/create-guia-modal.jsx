"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function CreateGuiaModal({
  open,
  onOpenChange,
  onCreate,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName("");
      setFile(null);
      setDragActive(false);
      setSubmitting(false);
    }
  }, [open]);

  const validateAndSetFile = (nextFile) => {
    if (!nextFile) return false;

    const isPdf =
      nextFile.type === "application/pdf" ||
      nextFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Solo se permiten archivos PDF");
      return false;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      toast.error("El archivo no puede superar 10MB");
      return false;
    }

    setFile(nextFile);
    return true;
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    }

    if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("El nombre de la guía es obligatorio");
      return;
    }

    if (!file) {
      toast.error("Debe seleccionar un archivo PDF");
      return;
    }

    if (!onCreate) {
      toast.error("No se pudo inicializar el creador de guías");
      return;
    }

    try {
      setSubmitting(true);
      const result = await onCreate({
        name: name.trim(),
        file,
        estado: 1,
      });

      if (result?.success) {
        toast.success("Guía rápida creada exitosamente");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        toast.error(result?.error || "No fue posible crear la guía rápida");
      }
    } catch (error) {
      toast.error(error?.message || "Error inesperado al crear la guía rápida");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Crear Guía Rápida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="guia-name" className="text-sm font-medium text-gray-700">
              Nombre de la guía
            </Label>
            <Input
              id="guia-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Guía de uso monitor de signos vitales"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Archivo PDF</Label>
            <div
              className={[
                "rounded-lg border-2 border-dashed p-6 transition-colors",
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
                submitting ? "pointer-events-none opacity-70" : "",
              ].join(" ")}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={submitting}
              />

              {!file ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="mb-3 h-9 w-9 text-blue-600" />
                  <p className="text-sm font-medium text-gray-800">
                    Arrastre y suelte el PDF aqui
                  </p>
                  <p className="mt-1 text-xs text-gray-500">o</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                  >
                    Seleccionar archivo
                  </Button>
                  <p className="mt-3 text-xs text-gray-500">PDF, maximo 10MB</p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-md border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 flex-shrink-0 text-green-700" />
                    <span className="truncate text-sm font-medium text-green-900">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                    onClick={() => setFile(null)}
                    disabled={submitting}
                    title="Quitar archivo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear guía"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
