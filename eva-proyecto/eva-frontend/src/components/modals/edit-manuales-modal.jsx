"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FileText, Edit } from "lucide-react";

export function EditManualesModal({ open, onOpenChange, manual }) {
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (manual) {
      setDescripcion(manual.descripcion || "");
      setUrl(manual.url || "");
    }
  }, [manual]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el manual
    console.log({ id: manual?.id, descripcion, url });
    onOpenChange(false);
  };

  if (!manual) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[60vw] mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-green-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Editar
              </DialogTitle>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-medium text-slate-800">Manual</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-700 font-medium">
                ID: #{manual.id}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-600 text-white rounded text-xs flex items-center justify-center font-medium">
                  D
                </div>
                <Label
                  htmlFor="descripcion"
                  className="text-sm font-medium text-slate-700"
                >
                  Descripción
                </Label>
              </div>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="INGRESE DESCRIPCIÓN (A QUE EQUIPO(S) CORRESPONDE)"
                className="h-12 text-sm bg-slate-50 border-slate-300 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-600 text-white rounded text-xs flex items-center justify-center font-medium">
                  U
                </div>
                <Label
                  htmlFor="url"
                  className="text-sm font-medium text-slate-700"
                >
                  Url
                </Label>
              </div>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="INGRESE URL VÁLIDA"
                className="h-12 text-sm bg-slate-50 border-slate-300 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50"
              >
                Close
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-sm font-medium"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
