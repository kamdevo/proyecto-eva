import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  PenTool,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Wrench,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import DigitalSignatureModal from "./digital-signature-modal";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";

// Estilos para el PDF (idénticos al formato de impresión de tickets)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    border: '1 solid #000',
    fontSize: 12,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  field: {
    border: '1 solid #ccc',
    padding: 8,
    width: '25%', // 4 columnas por defecto
    minHeight: 40,
  },
  fullWidth: {
    width: '100%', // span 4
  },
  halfWidth: {
    width: '50%', // span 2
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 11,
    marginTop: 3,
    color: '#000',
  },
  signatureField: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureImage: {
    width: 120,
    height: 40,
    marginTop: 5,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

// Componente PDF para la orden de cierre (formato idéntico al ticket de impresión)
const WorkOrderClosurePDF = ({ orderData, signatures, ticketData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header - Idéntico al formato de impresión */}
      <View style={styles.header}>
        <Text style={styles.title}>HOSPITAL UNIVERSITARIO DEL VALLE</Text>
        <Text style={styles.subtitle}>Evaristo García</Text>
        <Text style={styles.title}>ORDEN DE CIERRE - TRABAJO COMPLETADO</Text>
        <Text style={styles.subtitle}>Ticket #{orderData.orderNumber}</Text>
      </View>

      {/* ENCABEZADO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ENCABEZADO</Text>
        <View style={styles.fieldGrid}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Sede *</Text>
            <Text style={styles.fieldValue}>SEDE PRINCIPAL</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Centro de costo *</Text>
            <Text style={styles.fieldValue}>CC-{orderData.orderNumber}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Servicio *</Text>
            <Text style={styles.fieldValue}>{orderData.service}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>O.T. # *</Text>
            <Text style={styles.fieldValue}>OT-{orderData.orderNumber}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Área *</Text>
            <Text style={styles.fieldValue}>{orderData.location}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>O.T *</Text>
            <Text style={styles.fieldValue}>#{orderData.orderNumber}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
        </View>
      </View>

      {/* EQUIPO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EQUIPO</Text>
        <View style={styles.fieldGrid}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Equipo *</Text>
            <Text style={styles.fieldValue}>{orderData.equipmentName}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Modelo *</Text>
            <Text style={styles.fieldValue}>{orderData.equipmentName?.split(' ').slice(-1)[0] || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Serie *</Text>
            <Text style={styles.fieldValue}>SN-{orderData.orderNumber}001</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Marca *</Text>
            <Text style={styles.fieldValue}>{orderData.equipmentName?.split(' ')[0] || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>No. Inventario *</Text>
            <Text style={styles.fieldValue}>{orderData.equipmentCode}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Solicitado por *</Text>
            <Text style={styles.fieldValue}>{signatures.technician?.name || 'N/A'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Correo electrónico *</Text>
            <Text style={styles.fieldValue}>{signatures.technician?.name?.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@huv.gov.co</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>TIPO DE ARREGLO *</Text>
            <Text style={styles.fieldValue}>{orderData.workType?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* PROBLEMA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROBLEMA</Text>
        <View style={styles.fieldGrid}>
          <View style={[styles.field, styles.fullWidth]}>
            <Text style={styles.fieldLabel}>Descripción del problema presentado *</Text>
            <Text style={styles.fieldValue}>Trabajo de {orderData.workType} completado según especificaciones técnicas</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Empresa Asignada *</Text>
            <Text style={styles.fieldValue}>Hospital Universitario del Valle</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Asignación específica *</Text>
            <Text style={styles.fieldValue}>{signatures.technician?.name || 'Técnico Biomédico'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha de asignación *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
        </View>
      </View>

      {/* DIAGNÓSTICO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DIAGNÓSTICO</Text>
        <View style={styles.fieldGrid}>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.fieldLabel}>Diagnóstico *</Text>
            <Text style={styles.fieldValue}>Equipo evaluado y trabajo completado satisfactoriamente</Text>
          </View>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.fieldLabel}>Repuestos necesarios *</Text>
            <Text style={styles.fieldValue}>Según trabajo realizado</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Responsable del diagnóstico *</Text>
            <Text style={styles.fieldValue}>{signatures.technician?.name || 'Técnico Responsable'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Tiempo de ejecución *</Text>
            <Text style={styles.fieldValue}>Completado</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha Inicio *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha de finalización *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
        </View>
      </View>

      {/* TRABAJO REALIZADO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRABAJO REALIZADO</Text>
        <View style={styles.fieldGrid}>
          <View style={[styles.field, styles.fullWidth]}>
            <Text style={styles.fieldLabel}>Tipo y descripción del trabajo realizado *</Text>
            <Text style={styles.fieldValue}>{orderData.workDescription}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Responsable de la reparación *</Text>
            <Text style={styles.fieldValue}>{signatures.technician?.name || 'Técnico Responsable'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Tiempo de ejecución *</Text>
            <Text style={styles.fieldValue}>Completado</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha Inicio *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha de finalización *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
        </View>
      </View>

      {/* AVANCES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AVANCES</Text>
        <View style={styles.fieldGrid}>
          <View style={[styles.field, styles.fullWidth]}>
            <Text style={styles.fieldLabel}>Avances *</Text>
            <Text style={styles.fieldValue}>
              Trabajo completado. {orderData.observations || 'Sin observaciones adicionales.'}
            </Text>
          </View>
        </View>
      </View>

      {/* CIERRE CON FIRMAS DIGITALES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CIERRE</Text>
        <View style={styles.fieldGrid}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha de solicitud de cierre *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha de cierre *</Text>
            <Text style={styles.fieldValue}>{orderData.closureDate}</Text>
          </View>
          <View style={[styles.field, styles.signatureField]}>
            <Text style={styles.fieldLabel}>Firma de quien cierra la orden *</Text>
            {signatures.technician?.signature && (
              <Image style={styles.signatureImage} src={signatures.technician.signature} />
            )}
            <Text style={styles.signatureText}>{signatures.technician?.name}</Text>
            <Text style={styles.signatureText}>{signatures.technician?.title}</Text>
          </View>
        </View>
      </View>

      {/* ESTADO ACTUAL */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ESTADO ACTUAL</Text>
        <View style={styles.fieldGrid}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Estado</Text>
            <Text style={styles.fieldValue}>{orderData.status}</Text>
          </View>
        </View>
      </View>

      {/* Footer - Idéntico al formato de impresión */}
      <Text style={styles.footer}>
        Documento generado el {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}
      </Text>
      <Text style={styles.footer}>
        Hospital Universitario del Valle - Sistema EVA
      </Text>
    </Page>
  </Document>
);

export default function WorkOrderClosureModal({ 
  open, 
  onOpenChange, 
  workOrder = null 
}) {
  // Estados principales
  const [orderData, setOrderData] = useState({
    orderNumber: workOrder?.id || `ORD-${Date.now()}`,
    closureDate: new Date().toISOString().split('T')[0],
    workType: workOrder?.type || 'Mantenimiento Correctivo',
    status: 'Completado',
    equipmentName: workOrder?.equipment?.name || '',
    equipmentCode: workOrder?.equipment?.code || '',
    location: workOrder?.equipment?.location || '',
    service: workOrder?.equipment?.service || '',
    workDescription: '',
    observations: '',
  });

  const [signatures, setSignatures] = useState({
    technician: null,
    supervisor: null,
  });

  const [currentSignatureType, setCurrentSignatureType] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Funciones para manejar firmas
  const handleSignatureRequest = (type) => {
    setCurrentSignatureType(type);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = (signatureInfo) => {
    setSignatures(prev => ({
      ...prev,
      [currentSignatureType]: signatureInfo
    }));
    setShowSignatureModal(false);
    setCurrentSignatureType(null);
    toast.success(`Firma ${currentSignatureType === 'technician' ? 'del técnico' : 'del supervisor'} guardada correctamente`);
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!orderData.workDescription.trim()) {
      toast.error("Debe describir el trabajo realizado");
      return false;
    }
    if (!signatures.technician) {
      toast.error("Se requiere la firma del técnico responsable");
      return false;
    }
    return true;
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Enviar datos al backend para procesamiento (opcional)
      const response = await fetch('http://localhost:8001/api/v1/work-orders/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderData.orderNumber,
          closure_date: orderData.closureDate,
          work_type: orderData.workType,
          status: orderData.status,
          equipment_name: orderData.equipmentName,
          equipment_code: orderData.equipmentCode,
          location: orderData.location,
          service: orderData.service,
          work_description: orderData.workDescription,
          observations: orderData.observations,
          technician_signature: signatures.technician,
          supervisor_signature: signatures.supervisor,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Orden procesada en backend:', result);
      }
    } catch (error) {
      console.warn('⚠️ Error al procesar en backend (continuando con PDF):', error);
    }
    
    // El PDF se genera automáticamente con PDFDownloadLink
    setTimeout(() => {
      setIsGeneratingPDF(false);
      toast.success("Orden de cierre generada correctamente");
    }, 1000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
              Orden de Cierre - Trabajo Completado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Número de Orden</Label>
                    <Input 
                      value={orderData.orderNumber}
                      onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                      placeholder="ORD-001"
                    />
                  </div>
                  <div>
                    <Label>Fecha de Cierre</Label>
                    <Input 
                      type="date"
                      value={orderData.closureDate}
                      onChange={(e) => handleInputChange('closureDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Trabajo</Label>
                    <Select 
                      value={orderData.workType} 
                      onValueChange={(value) => handleInputChange('workType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
                        <SelectItem value="Mantenimiento Correctivo">Mantenimiento Correctivo</SelectItem>
                        <SelectItem value="Calibración">Calibración</SelectItem>
                        <SelectItem value="Reparación">Reparación</SelectItem>
                        <SelectItem value="Instalación">Instalación</SelectItem>
                        <SelectItem value="Verificación">Verificación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select 
                      value={orderData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Completado con Observaciones">Completado con Observaciones</SelectItem>
                        <SelectItem value="Requiere Seguimiento">Requiere Seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Equipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5" />
                  Equipo Intervenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Equipo</Label>
                    <Input 
                      value={orderData.equipmentName}
                      onChange={(e) => handleInputChange('equipmentName', e.target.value)}
                      placeholder="Monitor de Signos Vitales"
                    />
                  </div>
                  <div>
                    <Label>Código del Equipo</Label>
                    <Input 
                      value={orderData.equipmentCode}
                      onChange={(e) => handleInputChange('equipmentCode', e.target.value)}
                      placeholder="EQ-001"
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input 
                      value={orderData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="UCI - Habitación 101"
                    />
                  </div>
                  <div>
                    <Label>Servicio</Label>
                    <Input 
                      value={orderData.service}
                      onChange={(e) => handleInputChange('service', e.target.value)}
                      placeholder="Unidad de Cuidados Intensivos"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trabajo Realizado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5" />
                  Trabajo Realizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Descripción del Trabajo *</Label>
                  <Textarea 
                    value={orderData.workDescription}
                    onChange={(e) => handleInputChange('workDescription', e.target.value)}
                    placeholder="Describa detalladamente el trabajo realizado, procedimientos ejecutados, piezas reemplazadas, calibraciones realizadas, etc."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div>
                  <Label>Observaciones Adicionales</Label>
                  <Textarea 
                    value={orderData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    placeholder="Observaciones adicionales, recomendaciones, próximos mantenimientos, etc."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Firmas Digitales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PenTool className="w-5 h-5" />
                  Firmas y Aprobaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Firma del Técnico */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Técnico Responsable *</Label>
                      {signatures.technician ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Firmado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    
                    {signatures.technician ? (
                      <div className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-center mb-2">
                          <img 
                            src={signatures.technician.signature} 
                            alt="Firma Técnico"
                            className="max-h-16 border border-gray-300 rounded bg-white p-1"
                          />
                        </div>
                        <div className="text-center text-sm text-gray-600">
                          <p className="font-semibold">{signatures.technician.name}</p>
                          <p>{signatures.technician.title}</p>
                          <p>{signatures.technician.date}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSignatureRequest('technician')}
                          className="w-full mt-2"
                        >
                          Cambiar Firma
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleSignatureRequest('technician')}
                        className="w-full"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Firmar como Técnico
                      </Button>
                    )}
                  </div>

                  {/* Firma del Supervisor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Supervisor (Opcional)</Label>
                      {signatures.supervisor ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Firmado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Sin Firmar
                        </Badge>
                      )}
                    </div>
                    
                    {signatures.supervisor ? (
                      <div className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-center mb-2">
                          <img 
                            src={signatures.supervisor.signature} 
                            alt="Firma Supervisor"
                            className="max-h-16 border border-gray-300 rounded bg-white p-1"
                          />
                        </div>
                        <div className="text-center text-sm text-gray-600">
                          <p className="font-semibold">{signatures.supervisor.name}</p>
                          <p>{signatures.supervisor.title}</p>
                          <p>{signatures.supervisor.date}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSignatureRequest('supervisor')}
                          className="w-full mt-2"
                        >
                          Cambiar Firma
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => handleSignatureRequest('supervisor')}
                        className="w-full"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Firmar como Supervisor
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              
              <div className="flex gap-3">
                <PDFDownloadLink
                  document={<WorkOrderClosurePDF orderData={orderData} signatures={signatures} />}
                  fileName={`orden_cierre_${orderData.orderNumber}_${orderData.closureDate}.pdf`}
                >
                  {({ blob, url, loading, error }) => (
                    <Button 
                      onClick={handleGeneratePDF}
                      disabled={loading || isGeneratingPDF || !validateForm()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {loading || isGeneratingPDF ? 'Generando...' : 'Descargar Orden Firmada'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Firma Digital */}
      <DigitalSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignatureSave}
        signerName=""
        documentTitle={`Orden de Cierre ${orderData.orderNumber}`}
      />
    </>
  );
}
