"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, FileText, Trash2 } from "lucide-react"

export function DeleteManualesModal({ open, onOpenChange, manual }) {
    const handleDelete = () => {
        // Aquí iría la lógica para eliminar el manual
        console.log("Eliminando manual:", manual?.id)
        onOpenChange(false)
    }

    if (!manual) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] max-w-[60vw] mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-red-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-slate-800">Eliminar Manual</DialogTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mt-3"></div>
                </DialogHeader>

                <div className="py-6">
                    <div className="flex items-center gap-4 p-6 border border-red-200 rounded-xl bg-red-50 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-red-900 text-lg mb-1">¿Está seguro de eliminar este manual?</div>
                            <div className="text-sm text-red-700">
                                Esta acción no se puede deshacer y eliminará permanentemente el manual del sistema.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-800">Detalles del Manual</span>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-sm font-medium text-slate-600">ID:</span>
                                    <span className="text-sm text-slate-900 sm:col-span-3">#{manual.id}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-sm font-medium text-slate-600">Descripción:</span>
                                    <span className="text-sm text-slate-900 sm:col-span-3 break-words">{manual.descripcion}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <span className="text-sm font-medium text-slate-600">URL:</span>
                                    <span className="text-sm text-blue-600 sm:col-span-3 break-all">{manual.url}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <strong>Advertencia:</strong> Al eliminar este manual, se perderá el acceso al documento y toda la
                                    información asociada. Asegúrese de tener una copia de respaldo si es necesario.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar Manual
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
