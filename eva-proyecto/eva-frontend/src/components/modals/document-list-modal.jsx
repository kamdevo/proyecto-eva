import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Download,
  Trash2,
  Upload,
  Share2,
  Copy,
  Filter,
  Search,
  FileText,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import httpService from "@/services/httpService";
import { ShareDocumentModal } from "./share-document-modal";

export function DocumentListModal({
  open,
  onOpenChange,
  equipment,
  onUploadClick,
}) {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [groupBy, setGroupBy] = useState("type");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Cargar documentos al abrir el modal
  useEffect(() => {
    if (open && equipment?.id) {
      loadDocuments();
      loadDocumentTypes();
    }
  }, [open, equipment?.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await httpService.get(
        `/v1/equipos/${equipment.id}/documents`
      );

      if (response.data.success) {
        setDocuments(response.data.data);
      } else {
        toast.error("No se pudieron cargar los documentos");
      }
    } catch (error) {
      console.error("Error cargando documentos:", error);
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await httpService.get("/v1/document-types");
      if (response.data.success) {
        setDocumentTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando tipos de documentos:", error);
    }
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.tipo_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.archivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.otro && doc.otro.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterType === "all" || doc.archivo_id.toString() === filterType;

    return matchesSearch && matchesFilter;
  });

  // Agrupar documentos
  const groupedDocuments = () => {
    if (groupBy === "type") {
      return filteredDocuments.reduce((groups, doc) => {
        const key = doc.tipo_documento;
        if (!groups[key]) groups[key] = [];
        groups[key].push(doc);
        return groups;
      }, {});
    } else if (groupBy === "date") {
      return filteredDocuments.reduce((groups, doc) => {
        const date = new Date(doc.fecha_subida);
        const key = date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
        });
        if (!groups[key]) groups[key] = [];
        groups[key].push(doc);
        return groups;
      }, {});
    }
    return { "Todos los documentos": filteredDocuments };
  };

  // Paginación
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Manejar acciones de documentos
  const handleViewDocument = (doc) => {
    // Crear un iframe temporal oculto para cargar el PDF y luego imprimir
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = doc.url_acceso;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        // Intentar imprimir el contenido del iframe
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (error) {
        // Si falla la impresión del iframe, abrir en nueva pestaña e imprimir
        const printWindow = window.open(doc.url_acceso, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        } else {
          toast.error(
            "No se pudo abrir el documento para imprimir. Verifique que no esté bloqueando ventanas emergentes."
          );
        }
      }

      // Limpiar el iframe después de un momento
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    };

    iframe.onerror = () => {
      // Si hay error cargando el iframe, intentar con ventana nueva
      const printWindow = window.open(doc.url_acceso, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        toast.error("No se pudo abrir el documento para imprimir.");
      }

      // Limpiar el iframe
      document.body.removeChild(iframe);
    };
  };

  const handleDownloadDocument = (doc) => {
    const link = document.createElement("a");
    link.href = doc.url_acceso;
    link.download = doc.archivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDocument = async (doc) => {
    if (!confirm("¿Está seguro de que desea eliminar este documento?")) {
      return;
    }

    try {
      const response = await httpService.delete(
        `/v1/equipos/${equipment.id}/documents/${doc.id}`
      );

      if (response.data.success) {
        toast.success("Documento eliminado exitosamente");
        // Recargar documentos
        loadDocuments();
      } else {
        toast.error(response.data.message || "Error al eliminar documento");
      }
    } catch (error) {
      console.error("Error eliminando documento:", error);
      toast.error("Error al eliminar documento");
    }
  };

  const handleShareDocument = (doc) => {
    setSelectedDocument(doc);
    setShareModalOpen(true);
  };

  const toggleGroup = (groupName) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const getDocumentIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️";
      default:
        return "📁";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[85vw] max-w-5xl max-h-[85vh] overflow-y-auto p-4"
          style={{
            width: "85vw",
            maxWidth: "1200px",
            height: "85vh",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestión de Documentos - {equipment?.name || "Equipo"}
              <Badge variant="secondary" className="ml-2">
                {filteredDocuments.length} documentos
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-2">
            {/* Controles de búsqueda y filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Agrupar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type">Por tipo</SelectItem>
                  <SelectItem value="date">Por fecha</SelectItem>
                  <SelectItem value="none">Sin agrupar</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Mostrar</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm whitespace-nowrap">por página</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2 p-4 border-b">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={onUploadClick}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
              <Button
                variant="outline"
                onClick={loadDocuments}
                disabled={loading}
              >
                🔄 Actualizar
              </Button>
              <Button variant="outline">📊 Generar Reporte</Button>
              <Button variant="outline">📋 Exportar Lista</Button>
            </div>

            {/* Lista/Tabla de documentos */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando documentos...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay documentos disponibles</p>
                <p className="text-sm">
                  Suba el primer documento para comenzar
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {groupBy !== "none" ? (
                  // Vista agrupada
                  Object.entries(groupedDocuments()).map(
                    ([groupName, groupDocs]) => (
                      <div key={groupName} className="border-b last:border-b-0">
                        <div
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                          onClick={() => toggleGroup(groupName)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedGroups.has(groupName) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <h3 className="font-medium">{groupName}</h3>
                            <Badge variant="secondary">
                              {groupDocs.length}
                            </Badge>
                          </div>
                        </div>

                        {expandedGroups.has(groupName) && (
                          <div className="divide-y">
                            {groupDocs
                              .slice(startIndex, endIndex)
                              .map((doc, index) => (
                                <DocumentRow
                                  key={`${groupName}-${index}`}
                                  doc={doc}
                                  onView={handleViewDocument}
                                  onDownload={handleDownloadDocument}
                                  onDelete={handleDeleteDocument}
                                  onShare={handleShareDocument}
                                  getDocumentIcon={getDocumentIcon}
                                  formatDate={formatDate}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  )
                ) : (
                  // Vista de tabla normal
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Archivo
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Observaciones
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredDocuments
                          .slice(startIndex, endIndex)
                          .map((doc, index) => (
                            <DocumentRow
                              key={index}
                              doc={doc}
                              onView={handleViewDocument}
                              onDownload={handleDownloadDocument}
                              onDelete={handleDeleteDocument}
                              onShare={handleShareDocument}
                              getDocumentIcon={getDocumentIcon}
                              formatDate={formatDate}
                              tableView={true}
                            />
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)}{" "}
                  de {totalItems} documentos
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : ""
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="text-sm">...</span>
                      <span className="text-sm">{totalPages}</span>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              <Clock className="inline h-4 w-4 mr-1" />
              Última actualización: {formatDate(new Date().toISOString())}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de compartir documento mejorado */}
      <ShareDocumentModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        document={selectedDocument}
        sourceEquipment={equipment}
      />
    </>
  );
}

// Componente para renderizar cada fila de documento
function DocumentRow({
  doc,
  onView,
  onDownload,
  onDelete,
  onShare,
  getDocumentIcon,
  formatDate,
  tableView = false,
}) {
  if (tableView) {
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDocumentIcon(doc.archivo)}</span>
            <div>
              <p className="font-medium text-sm">{doc.archivo}</p>
              <p className="text-xs text-gray-500">ID: {doc.id}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant="outline" className="text-xs">
            {doc.tipo_documento}
          </Badge>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {formatDate(doc.fecha_subida)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
          <div className="truncate" title={doc.otro}>
            {doc.otro || "-"}
          </div>
        </td>
        <td className="px-4 py-3">
          <DocumentActions
            doc={doc}
            onView={onView}
            onDownload={onDownload}
            onDelete={onDelete}
            onShare={onShare}
          />
        </td>
      </tr>
    );
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{getDocumentIcon(doc.archivo)}</span>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{doc.archivo}</h4>
            <p className="text-xs text-gray-500">
              {doc.tipo_documento} • {formatDate(doc.fecha_subida)}
            </p>
            {doc.otro && (
              <p className="text-xs text-gray-600 mt-1">{doc.otro}</p>
            )}
          </div>
        </div>
        <DocumentActions
          doc={doc}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
          onShare={onShare}
        />
      </div>
    </div>
  );
}

// Componente para las acciones de cada documento
function DocumentActions({ doc, onView, onDownload, onDelete, onShare }) {
  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 h-8 w-8 p-0"
        title="Ver documento"
        onClick={() => onView(doc)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        className="bg-green-500 hover:bg-green-600 h-8 w-8 p-0"
        title="Descargar"
        onClick={() => onDownload(doc)}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        className="bg-purple-500 hover:bg-purple-600 h-8 w-8 p-0"
        title="Compartir"
        onClick={() => onShare(doc)}
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        className="bg-red-500 hover:bg-red-600 h-8 w-8 p-0"
        title="Eliminar"
        onClick={() => onDelete(doc)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
