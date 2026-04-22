import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  X,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

export function QuickGuideSearchModal({
  open,
  onOpenChange,
  onSelectGuide,
  currentGuideId = null,
}) {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar guías rápidas
  const loadGuias = async () => {
    try {
      setLoading(true);
      
      const response = await httpService.get("/v1/guias-rapidas");
      
      if (response.data?.success) {
        let guias = response.data.data || [];
        
        // Filtrar por término de búsqueda si existe
        if (searchTerm.trim()) {
          guias = guias.filter(guia => 
            guia.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setGuias(guias);
      } else {
        toast.error("Error al cargar guías rápidas");
        setGuias([]);
      }
    } catch (error) {
      console.error("Error loading guias rapidas:", error);
      toast.error("Error al cargar guías rápidas");
      setGuias([]);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    if (open) {
      loadGuias();
      setSelectedGuide(null);
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        loadGuias();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handlers
  const handleSelectGuide = (guia) => {
    setSelectedGuide(guia);
  };

  const handleConfirmSelection = () => {
    if (selectedGuide && onSelectGuide) {
      onSelectGuide(selectedGuide);
      toast.success(`Guía rápida seleccionada: ${selectedGuide.name}`);
      onOpenChange(false);
    }
  };

  const handlePreviewGuide = async (guia) => {
    try {
      if (!guia.file) {
        toast.error("Archivo de guía no disponible");
        return;
      }

      // Construir URL del archivo
      const fileUrl = `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/storage/guias/${guia.file}`;
      
      // Abrir en nueva ventana
      const newWindow = window.open(
        "",
        `guia_${guia.id}`,
        "width=900,height=700,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        toast.error("No se pudo abrir la ventana. Verifique el bloqueador de ventanas emergentes.");
        return;
      }

      newWindow.document.write(`
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Guía Rápida - ${guia.name}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              flex-direction: column;
              height: 100vh;
            }
            .header {
              background: rgba(255, 255, 255, 0.95);
              padding: 15px 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
              border-bottom: 3px solid #667eea;
            }
            .header h1 {
              margin: 0;
              color: #333;
              font-size: 18px;
              font-weight: 600;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .content {
              flex: 1;
              padding: 0;
              overflow: hidden;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              background: white;
            }
            .loading {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: white;
              font-size: 16px;
            }
            .error {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: white;
              text-align: center;
              padding: 20px;
            }
            .controls {
              background: rgba(255, 255, 255, 0.9);
              padding: 10px 20px;
              text-align: center;
              border-top: 1px solid #ddd;
            }
            .btn {
              background: #667eea;
              color: white;
              border: none;
              padding: 8px 16px;
              margin: 0 5px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 13px;
              transition: background-color 0.3s;
            }
            .btn:hover {
              background: #5a67d8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Guía Rápida</h1>
            <p>Nombre: ${guia.name}</p>
          </div>
          
          <div class="content">
            <div class="loading" id="loading">
              📄 Cargando guía rápida...
            </div>
            <iframe id="pdfFrame" src="${fileUrl}" style="display: none;" onload="showPDF()" onerror="showError()"></iframe>
            <div class="error" id="error" style="display: none;">
              <h3>❌ Error al cargar el documento</h3>
              <p>No se pudo cargar la guía rápida.</p>
              <p style="font-size: 12px; opacity: 0.8;">Verifique que el archivo existe y es accesible.</p>
            </div>
          </div>
          
          <div class="controls">
            <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
            <button class="btn" onclick="window.close()">❌ Cerrar</button>
          </div>

          <script>
            function showPDF() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('pdfFrame').style.display = 'block';
              document.getElementById('error').style.display = 'none';
            }
            
            function showError() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('pdfFrame').style.display = 'none';
              document.getElementById('error').style.display = 'flex';
            }
          </script>
        </body>
        </html>
      `);

      newWindow.document.close();
      
    } catch (error) {
      console.error("Error previewing guide:", error);
      toast.error("Error al abrir la guía rápida");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleClose = () => {
    setSelectedGuide(null);
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-6xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            <Zap className="inline-block w-5 h-5 mr-2 text-purple-600" />
            Buscar Guías Rápidas
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center">
            Seleccione una guía rápida para asociar al equipo
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col space-y-4">
          {/* Filtros de Búsqueda */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Buscar Guía Rápida
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre de la guía..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Guía Seleccionada */}
          {selectedGuide && (
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Guía Rápida Seleccionada
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      <span className="font-medium">ID:</span> {selectedGuide.id}
                    </p>
                    <p className="text-sm text-purple-700">
                      <span className="font-medium">Nombre:</span>{" "}
                      {selectedGuide.name}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewGuide(selectedGuide)}
                    className="text-purple-600 border-purple-300 hover:bg-purple-100"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Guía
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Guías */}
          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="overflow-y-auto h-full">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <span className="ml-2 text-gray-600">Cargando guías rápidas...</span>
                  </div>
                ) : guias.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                    {guias.map((guia) => (
                      <Card
                        key={guia.id}
                        onClick={() => handleSelectGuide(guia)}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedGuide?.id === guia.id
                            ? "border-2 border-purple-300 bg-purple-50 shadow-md"
                            : "hover:border-purple-200 hover:shadow-sm"
                        } ${
                          currentGuideId === guia.id
                            ? "border-2 border-green-300 bg-green-50"
                            : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${
                                    selectedGuide?.id === guia.id
                                      ? "border-purple-500 bg-purple-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedGuide?.id === guia.id && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  ID: {guia.id}
                                </Badge>
                                {currentGuideId === guia.id && (
                                  <Badge className="ml-2 bg-green-100 text-green-800">
                                    Actual
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-start mb-3">
                                <Zap className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                    {guia.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Archivo: {guia.file || "Sin archivo"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {guia.file && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewGuide(guia);
                                }}
                                className="text-purple-600 hover:bg-purple-100 ml-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      {searchTerm ? "No se encontraron guías rápidas" : "No hay guías rápidas disponibles"}
                    </p>
                    {searchTerm && (
                      <p className="text-gray-400 text-sm mt-2">
                        Intente con otros términos de búsqueda
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer con Botones */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            {guias.length} guía{guias.length !== 1 ? "s" : ""} encontrada{guias.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-4"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedGuide}
              className="px-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Seleccionar Guía
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
