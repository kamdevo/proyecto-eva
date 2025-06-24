"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, X } from "lucide-react";

export default function WorkOrderModal({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5" />
              Orden de Trabajo - {ticket.id}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-8">
          <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 border-b pb-4 gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold">
                  Hospital Universitario del Valle Evaristo García
                </h2>
                <p className="text-sm text-gray-600">NIT: 890.399.010-6</p>
              </div>
              <div className="text-center sm:text-right">
                <h3 className="text-base sm:text-lg font-bold border-2 border-black px-3 sm:px-4 py-2 inline-block">
                  ORDEN DE TRABAJO
                </h3>
                <p className="text-sm mt-2">No. {ticket.id}</p>
              </div>
            </div>

            {/* Equipment Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    EQUIPO:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.equipment}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    MARCA:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.brand}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    MODELO:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.model}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    SERIE:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.serial}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    UBICACIÓN:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.location}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    FECHA:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.date}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    TÉCNICO:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.technician}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold w-full sm:w-32 mb-1 sm:mb-0">
                    PRIORIDAD:
                  </span>
                  <span className="border-b border-gray-400 flex-1 px-2 py-1 text-sm sm:text-base">
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">
                DESCRIPCIÓN DEL PROBLEMA:
              </h4>
              <div className="border border-gray-400 p-3 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base">
                {ticket.issue}
              </div>
            </div>

            {/* Work Description */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">
                TRABAJO REALIZADO:
              </h4>
              <div className="border border-gray-400 p-3 min-h-[80px] sm:min-h-[120px]">
                {/* Empty for filling */}
              </div>
            </div>

            {/* Materials */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">
                MATERIALES UTILIZADOS:
              </h4>
              <div className="border border-gray-400 p-3 min-h-[60px] sm:min-h-[80px]">
                {/* Empty for filling */}
              </div>
            </div>

            {/* Observations */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">
                OBSERVACIONES:
              </h4>
              <div className="border border-gray-400 p-3 min-h-[80px] sm:min-h-[100px]">
                {/* Empty for filling */}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-12 sm:mt-16">
                  <p className="font-semibold text-sm sm:text-base">
                    TÉCNICO RESPONSABLE
                  </p>
                  <p className="text-xs sm:text-sm">{ticket.technician}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-12 sm:mt-16">
                  <p className="font-semibold text-sm sm:text-base">
                    RECIBIDO POR
                  </p>
                  <p className="text-xs sm:text-sm">Nombre y Firma</p>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="flex justify-center sm:justify-end mt-6 pt-4 border-t">
              <Button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
