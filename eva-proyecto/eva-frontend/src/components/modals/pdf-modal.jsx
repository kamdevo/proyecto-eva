"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function PdfModal({ isOpen, onClose, documentTitle, documentDate }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] p-0 m-4 flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                {documentTitle}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {documentDate}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 border-gray-300 hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 border-gray-300 sm:hidden"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-4 sm:p-6 min-h-0">
          <div className="h-full overflow-auto bg-white border border-gray-200 rounded-lg">
            <div className="flex justify-center p-4">
              <Image
                src="/images/medical-form.png"
                alt="Documento PDF"
                width={800}
                height={1000}
                className="max-w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
