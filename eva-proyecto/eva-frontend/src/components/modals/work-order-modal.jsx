"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";

export default function WorkOrderModal({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Orden de Trabajo - {ticket.id}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white p-8 border border-gray-300">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">
                Hospital Universitario del Valle Evaristo García
              </h2>
              <p className="text-sm text-gray-600">NIT: 890.399.010-6</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold border-2 border-black px-4 py-2">
                ORDEN DE TRABAJO
              </h3>
              <p className="text-sm mt-2">No. {ticket.id}</p>
            </div>
          </div>

          {/* Patient/Equipment Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex">
                <span className="font-semibold w-32">EQUIPO:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.equipment}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">MARCA:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.brand}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">MODELO:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.model}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">SERIE:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.serial}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-semibold w-32">UBICACIÓN:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.location}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">FECHA:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.date}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">TÉCNICO:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.technician}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">PRIORIDAD:</span>
                <span className="border-b border-gray-400 flex-1 px-2">
                  {ticket.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">DESCRIPCIÓN DEL PROBLEMA:</h4>
            <div className="border border-gray-400 p-3 min-h-[80px]">
              {ticket.issue}
            </div>
          </div>

          {/* Work Description */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">TRABAJO REALIZADO:</h4>
            <div className="border border-gray-400 p-3 min-h-[120px]">
              {/* Empty for filling */}
            </div>
          </div>

          {/* Materials */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">MATERIALES UTILIZADOS:</h4>
            <div className="border border-gray-400 p-3 min-h-[80px]">
              {/* Empty for filling */}
            </div>
          </div>

          {/* Observations */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">OBSERVACIONES:</h4>
            <div className="border border-gray-400 p-3 min-h-[100px]">
              {/* Empty for filling */}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-16">
                <p className="font-semibold">TÉCNICO RESPONSABLE</p>
                <p className="text-sm">{ticket.technician}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-16">
                <p className="font-semibold">RECIBIDO POR</p>
                <p className="text-sm">Nombre y Firma</p>
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
