"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Send, File, PenTool, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import DigitalSignatureModal from "./digital-signature-modal";
import authService from "@/services/authService";

export default function EnviarCierreModal({ isOpen, onClose, ticketId, ticketCode }) {
  const [formData, setFormData] = useState({
    retro_cierre: "",
    reparacion: "",
    fecha_asignacion_cierre: "",
    hora_asignacion_cierre: "",
    tecnico_cierre_text: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para modales de firma
  const [showFirmaTecnicoModal, setShowFirmaTecnicoModal] = useState(false);
  const [showFirmaRecibidoModal, setShowFirmaRecibidoModal] = useState(false);
  const [firmaTecnicoData, setFirmaTecnicoData] = useState(null);
  const [firmaRecibidoData, setFirmaRecibidoData] = useState(null);
  const [firmaTecnicoInfo, setFirmaTecnicoInfo] = useState(null); // {name, date}
  const [firmaRecibidoInfo, setFirmaRecibidoInfo] = useState(null); // {name, date}

  // Autocompletar datos al abrir el modal
  useEffect(() => {
    if (isOpen && ticketId) {
      const user = authService.getStoredUser();
      const userName = user ? (user.username || user.nombre || user.name || '') : '';
      
      // Generar código de cierre basado en el ID del ticket
      const generatedCode = ticketCode || `CIERRE-${new Date().getFullYear()}-${String(ticketId).padStart(4, '0')}`;
      
      setFormData({
        retro_cierre: generatedCode, // ✅ Siempre usar el código generado
        reparacion: "",
        fecha_asignacion_cierre: "",
        hora_asignacion_cierre: "",
        tecnico_cierre_text: userName
      });
    }
  }, [isOpen, ticketId, ticketCode]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Funciones para guardar firmas desde el modal
  const handleSaveFirmaTecnico = (signatureData) => {
    setFirmaTecnicoData(signatureData.signature);
    setFirmaTecnicoInfo({
      name: signatureData.name,
      date: signatureData.date
    });
    setShowFirmaTecnicoModal(false);
  };

  const handleSaveFirmaRecibido = (signatureData) => {
    setFirmaRecibidoData(signatureData.signature);
    setFirmaRecibidoInfo({
      name: signatureData.name,
      date: signatureData.date
    });
    setShowFirmaRecibidoModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reparacion.trim()) {
      toast.error("La descripción del trabajo realizado es obligatoria");
      return;
    }

    // Confirmación antes de enviar a cierre
    if (!window.confirm('¿Está seguro de enviar este ticket a cierre? Esta acción cambiará el estado del ticket.')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('retro_cierre', formData.retro_cierre);
      formDataToSend.append('reparacion', formData.reparacion);
      
      if (formData.fecha_asignacion_cierre) {
        formDataToSend.append('fecha_asignacion_cierre', formData.fecha_asignacion_cierre);
      }
      
      if (formData.hora_asignacion_cierre) {
        formDataToSend.append('hora_asignacion_cierre', formData.hora_asignacion_cierre);
      }
      
      if (formData.tecnico_cierre_text) {
        formDataToSend.append('tecnico_cierre_text', formData.tecnico_cierre_text);
      }
      
      // El archivo ahora se sube desde el modal de detalles del ticket

      // Agregar firmas digitales (base64) y nombres
      if (firmaTecnicoData) {
        formDataToSend.append('firma_tecnico', firmaTecnicoData);
        if (firmaTecnicoInfo) {
          formDataToSend.append('firma_tecnico_nombre', firmaTecnicoInfo.name);
          formDataToSend.append('firma_tecnico_fecha', firmaTecnicoInfo.date);
        }
      }
      
      if (firmaRecibidoData) {
        formDataToSend.append('firma_recibido', firmaRecibidoData);
        if (firmaRecibidoInfo) {
          formDataToSend.append('firma_recibido_nombre', firmaRecibidoInfo.name);
          formDataToSend.append('firma_recibido_fecha', firmaRecibidoInfo.date);
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/tickets/${ticketId}/enviar-cierre`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al enviar el ticket a cierre');
      }

      toast.success("Ticket enviado a cierre exitosamente");
      
      // Resetear formulario
      setFormData({
        retro_cierre: "",
        reparacion: "",
        fecha_asignacion_cierre: "",
        hora_asignacion_cierre: "",
        tecnico_cierre_text: ""
      });
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al enviar el ticket a cierre");
    } finally {
      setIsSubmitting(false);
    }     
  };    

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl w-auto h-auto max-h-[90vh] overflow-x-hidden noverflow-y-auto">
        <DialogHeader className="bg-red-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Enviar Ticket a Cierre</DialogTitle>
              <p className="text-sm text-red-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Código del Retro */}
          <div className="space-y-2">
            <Label htmlFor="retro_cierre" className="text-sm font-semibold text-gray-700">
              Código del Retro de Cierre
            </Label>
            <Input
              id="retro_cierre"
              name="retro_cierre"
              type="text"
              placeholder="Ej: CIERRE-2024-001"
              value={formData.retro_cierre}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Autocompletado con código OT del ticket (puede modificarlo si es necesario)
            </p>
          </div>

          {/* Trabajo Realizado / Reparación */}
          <div className="space-y-2">
            <Label htmlFor="reparacion" className="text-sm font-semibold text-gray-700">
              Descripción del Trabajo Realizado *
            </Label>
            <Textarea
              id="reparacion"
              name="reparacion"
              placeholder="Describa detalladamente el trabajo realizado y la solución aplicada..."
              value={formData.reparacion}
              onChange={handleInputChange}
              className="w-full min-h-[150px]"
              required
            />
            <p className="text-xs text-gray-500">
              {formData.reparacion.length} caracteres
            </p>
          </div>

          {/* Fecha y Hora del Procedimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_asignacion_cierre" className="text-sm font-semibold text-gray-700">
                Fecha del Procedimiento Correctivo
              </Label>
              <Input
                id="fecha_asignacion_cierre"
                name="fecha_asignacion_cierre"
                type="date"
                value={formData.fecha_asignacion_cierre}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Opcional - Se usa fecha actual si no se especifica
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_asignacion_cierre" className="text-sm font-semibold text-gray-700">
                Hora del Procedimiento Correctivo
              </Label>
              <Input
                id="hora_asignacion_cierre"
                name="hora_asignacion_cierre"
                type="time"
                value={formData.hora_asignacion_cierre}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Opcional - Se usa hora actual si no se especifica
              </p>
            </div>
          </div>

          {/* Técnico de Cierre */}
          <div className="space-y-2">
            <Label htmlFor="tecnico_cierre_text" className="text-sm font-semibold text-gray-700">
              Técnico Responsable del Procedimiento
            </Label>
            <Input
              id="tecnico_cierre_text"
              name="tecnico_cierre_text"
              type="text"
              placeholder="Nombre del técnico que realizó el procedimiento"
              value={formData.tecnico_cierre_text}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Opcional - Se usa el usuario actual si no se especifica
            </p>
          </div>

          {/* Nota: El archivo ahora se anexa desde el modal de detalles del ticket */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Después de enviar a cierre, podrá anexar el documento de trabajo realizado desde el modal de detalles del ticket.
            </p>
          </div>

          {/* ===== SECCIÓN DE FIRMAS DIGITALES ===== */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Firmas Digitales</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Las firmas digitales se guardan junto con el ticket. Después podrá anexar documentos adicionales desde el modal de detalles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FIRMA TÉCNICO */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-h-[200px] flex flex-col">
                <h4 className="text-md font-semibold text-blue-900 mb-3">1. Firma del Técnico</h4>
                
                {firmaTecnicoData ? (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="border-2 border-green-300 rounded-lg p-3 bg-white flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <img src={firmaTecnicoData} alt="Firma Técnico" className="max-h-20 max-w-full object-contain mb-2" />
                        {firmaTecnicoInfo && (
                          <div className="text-center mt-2 pt-2 border-t border-gray-200 w-full">
                            <p className="text-sm font-semibold text-gray-800">{firmaTecnicoInfo.name}</p>
                            <p className="text-xs text-gray-500">{new Date(firmaTecnicoInfo.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setFirmaTecnicoData(null);
                          setFirmaTecnicoInfo(null);
                        }}
                        className="flex-1"
                      >
                        🗑️ Eliminar
                      </Button>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => setShowFirmaTecnicoModal(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <PenTool className="w-4 h-4 mr-1" />
                        Cambiar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <Button 
                      type="button"
                      onClick={() => setShowFirmaTecnicoModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Firmar como Técnico
                    </Button>
                  </div>
                )}
              </div>

              {/* FIRMA RECIBIDO */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 min-h-[200px] flex flex-col">
                <h4 className="text-md font-semibold text-green-900 mb-3">2. Firma de Recibido</h4>
                
                {firmaRecibidoData ? (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="border-2 border-green-300 rounded-lg p-3 bg-white flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <img src={firmaRecibidoData} alt="Firma Recibido" className="max-h-20 max-w-full object-contain mb-2" />
                        {firmaRecibidoInfo && (
                          <div className="text-center mt-2 pt-2 border-t border-gray-200 w-full">
                            <p className="text-sm font-semibold text-gray-800">{firmaRecibidoInfo.name}</p>
                            <p className="text-xs text-gray-500">{new Date(firmaRecibidoInfo.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setFirmaRecibidoData(null);
                          setFirmaRecibidoInfo(null);
                        }}
                        className="flex-1"
                      >
                        🗑️ Eliminar
                      </Button>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => setShowFirmaRecibidoModal(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <PenTool className="w-4 h-4 mr-1" />
                        Cambiar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <Button 
                      type="button"
                      onClick={() => setShowFirmaRecibidoModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Firmar como Recibido
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">
                  Importante
                </p>
                <p className="text-sm text-red-800">
                  Al enviar el ticket a cierre, el estado cambiará a <strong>"Cerrado"</strong> y se registrará la fecha de finalización. 
                  Asegúrese de que toda la información del trabajo realizado esté completa antes de proceder.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar a Cierre"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Modales de Firma Digital */}
    <DigitalSignatureModal
      isOpen={showFirmaTecnicoModal}
      onClose={() => setShowFirmaTecnicoModal(false)}
      onSave={handleSaveFirmaTecnico}
      signerName="Técnico"
    />

    <DigitalSignatureModal
      isOpen={showFirmaRecibidoModal}
      onClose={() => setShowFirmaRecibidoModal(false)}
      onSave={handleSaveFirmaRecibido}
      signerName="Recibido"
    />
    </>
  );
}
