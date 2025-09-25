"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, X, Eye, Download } from "lucide-react";

export default function EvidenceUploadModal({ isOpen, onClose, onSave, ticketType = "" }) {
  const [evidences, setEvidences] = useState([]);
  const [currentEvidence, setCurrentEvidence] = useState({
    type: "",
    description: "",
    file: null,
    fileName: "",
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const evidenceTypes = {
    biomedical: [
      "Reporte de Calibración",
      "Certificado de Mantenimiento",
      "Fotografías del Equipo",
      "Manual Técnico",
      "Protocolo de Seguridad",
      "Registro de Fallas",
      "Orden de Compra Repuestos"
    ],
    industrial: [
      "Reporte de Inspección",
      "Análisis de Vibración",
      "Termografía",
      "Fotografías Pre/Post Trabajo",
      "Certificado de Soldadura",
      "Pruebas de Funcionamiento",
      "Planos Técnicos"
    ],
    infrastructure: [
      "Planos Arquitectónicos",
      "Fotografías del Área",
      "Permisos de Trabajo",
      "Certificado de Materiales",
      "Reporte de Seguridad",
      "Autorización de Acceso",
      "Presupuesto Aprobado"
    ]
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentEvidence(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const addEvidence = () => {
    if (currentEvidence.type && currentEvidence.file) {
      const newEvidence = {
        ...currentEvidence,
        id: Date.now(),
        size: currentEvidence.file.size,
        uploadTime: new Date().toLocaleTimeString()
      };
      
      setEvidences(prev => [...prev, newEvidence]);
      setCurrentEvidence({
        type: "",
        description: "",
        file: null,
        fileName: "",
        uploadDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const removeEvidence = (id) => {
    setEvidences(prev => prev.filter(ev => ev.id !== id));
  };

  const saveEvidences = () => {
    onSave(evidences);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            Cargar Evidencias y Documentos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario para nueva evidencia */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">Nueva Evidencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Evidencia</Label>
                <Select 
                  value={currentEvidence.type} 
                  onValueChange={(value) => setCurrentEvidence(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {evidenceTypes[ticketType]?.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input 
                  type="date" 
                  value={currentEvidence.uploadDate}
                  onChange={(e) => setCurrentEvidence(prev => ({...prev, uploadDate: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label>Descripción</Label>
              <Textarea 
                value={currentEvidence.description}
                onChange={(e) => setCurrentEvidence(prev => ({...prev, description: e.target.value}))}
                placeholder="Describa el contenido de la evidencia"
                rows={2}
              />
            </div>

            <div className="mt-4">
              <Label>Archivo</Label>
              <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                <Input 
                  type="file" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="evidence-file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <FileText className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <p className="text-sm text-green-700">
                  <label htmlFor="evidence-file" className="cursor-pointer hover:underline">
                    Seleccionar archivo
                  </label>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  PDF, Imágenes, Word, Excel - Máximo 10MB
                </p>
                {currentEvidence.fileName && (
                  <p className="text-sm text-green-800 mt-2 font-medium">
                    Archivo seleccionado: {currentEvidence.fileName}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={addEvidence} disabled={!currentEvidence.type || !currentEvidence.file}>
                <Upload className="w-4 h-4 mr-2" />
                Agregar Evidencia
              </Button>
            </div>
          </div>

          {/* Lista de evidencias cargadas */}
          {evidences.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">
                Evidencias Cargadas ({evidences.length})
              </h3>
              <div className="space-y-3">
                {evidences.map((evidence) => (
                  <div key={evidence.id} className="bg-white p-3 rounded border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm">{evidence.type}</span>
                          <span className="text-xs text-gray-500">
                            {evidence.uploadDate} - {evidence.uploadTime}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{evidence.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{evidence.fileName}</span>
                          <span>{formatFileSize(evidence.size)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => removeEvidence(evidence.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={saveEvidences}>
              Guardar Evidencias ({evidences.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}