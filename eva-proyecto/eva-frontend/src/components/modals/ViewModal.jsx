"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ViewModal({ isOpen, onClose, guideData }) {
  const [associationText, setAssociationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="bg-gray-500 px-6 py-4 text-center">
          <DialogTitle className="text-lg font-medium text-white">
            Relacionar guías rápidas con equipos
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="association-field"
                className="text-sm font-medium text-gray-700"
              >
                Equipos a asociar
              </Label>
              <textarea
                id="association-field"
                value={associationText}
                onChange={(e) => setAssociationText(e.target.value)}
                placeholder="Ingrese los equipos que desea asociar con esta guía..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {guideData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  Información de la guía:
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Nombre:</strong> {guideData.name}
                  </p>
                  <p>
                    <strong>Estado:</strong> {guideData.status}
                  </p>
                  <p>
                    <strong>Equipos actuales:</strong> {guideData.equipos}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-start px-6 py-4 bg-gray-50 border-t">
          <Button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
