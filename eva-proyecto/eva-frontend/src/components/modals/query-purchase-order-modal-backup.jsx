import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter, Loader2 } from "lucide-react";
import { useOrdenesCompra } from "../../hooks/useOrdenesCompra";
import { useTiposCompra } from "../../hooks/useTiposCompra";

export function QueryPurchaseOrderModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Hooks para datos reales
  const { searchOrdenesAvanzada } = useOrdenesCompra();
  const { tipos, loading: tiposLoading } = useTiposCompra();

  // Estado del formulario de búsqueda
  const [searchForm, setSearchForm] = useState({
    codigo: "",
    fecha: "",
    proveedor: "",
    tipo_compra: "ALL",
    estado: "ALL",
    monto_min: "",
    monto_max: "",
  });

  const handleInputChange = (field, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecopInputChange = (field, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      // Construir parámetros de búsqueda
      const searchParams = {};
      if (searchForm.codigo) searchParams.codigo = searchForm.codigo;
      if (searchForm.fecha) searchParams.fecha = searchForm.fecha;
      if (searchForm.proveedor) searchParams.proveedor = searchForm.proveedor;
      if (searchForm.tipo_compra)
        searchParams.tipo_compra = searchForm.tipo_compra;
      if (searchForm.estado) searchParams.estado = searchForm.estado;
      if (searchForm.monto_min) searchParams.monto_min = searchForm.monto_min;
      if (searchForm.monto_max) searchParams.monto_max = searchForm.monto_max;

      const results = await searchOrdenesAvanzada(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching orders:", error);
      alert("Error al buscar órdenes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSecopSearch = async () => {
    try {
      setLoading(true);

      // Prepare SECOP search filters
      const filters = Object.fromEntries(
        Object.entries(secopSearchForm).filter(([_, value]) => value.trim() !== '')
      );

      await searchProcesses(filters);
      setSecopResults(processes || []);
      console.log('🔍 [SECOP] Search completed:', processes?.length || 0, 'results');
    } catch (error) {
      console.error("Error searching SECOP:", error);
      alert("Error al buscar en SECOP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchForm({
      codigo: "",
      fecha: "",
      proveedor: "",
      tipo_compra: "ALL",
      estado: "ALL",
      monto_min: "",
      monto_max: "",
    });
    setSearchResults([]);
  };

  // Limpiar formulario al cerrar modal
  useEffect(() => {
    if (!open) {
      handleClear();
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">
              Consulta
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
        </DialogHeader>

        {/* Tabs for switching between Purchase Orders and SECOP */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              !showSecopTab
                ? 'border-b-2 border-teal-500 text-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setShowSecopTab(false)}
          >
            Órdenes de Compra
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              showSecopTab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setShowSecopTab(true)}
          >
            <Building className="w-4 h-4 inline mr-1" />
            Consulta SECOP
          </button>
        </div>

        <div className="space-y-4 py-4">
          {!showSecopTab ? (
            <>
              <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-4">
                Buscar orden de compra
              </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="codigoBuscar"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Código
              </Label>
              <Input
                id="codigoBuscar"
                placeholder="INGRESE EL NÚMERO"
                value={searchForm.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fechaBuscar"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Fecha
              </Label>
              <Input
                id="fechaBuscar"
                type="date"
                value={searchForm.fecha}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="proveedorBuscar"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Proveedor
              </Label>
              <Input
                id="proveedorBuscar"
                placeholder="Nombre del proveedor"
                value={searchForm.proveedor}
                onChange={(e) => handleInputChange("proveedor", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="tipoCompraBuscar"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Tipo de compra
            </Label>
            <Select
              value={searchForm.tipo_compra}
              onValueChange={(value) => handleInputChange("tipo_compra", value)}
              disabled={tiposLoading}
            >
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="-----" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Tipos</SelectItem>
                {tiposLoading ? (
                  <SelectItem value="LOADING" disabled>
                    Cargando tipos...
                  </SelectItem>
                ) : (
                  tipos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="estadoBuscar"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Estado de la orden
            </Label>
            <Select
              value={searchForm.estado}
              onValueChange={(value) => handleInputChange("estado", value)}
            >
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Estados</SelectItem>
                <SelectItem value="1">Activo</SelectItem>
                <SelectItem value="0">Inactivo</SelectItem>
                <SelectItem value="2">Pendiente</SelectItem>
                <SelectItem value="3">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="fechaDesde"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Fecha desde
              </Label>
              <Input
                id="fechaDesde"
                type="date"
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fechaHasta"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Fecha hasta
              </Label>
              <Input
                id="fechaHasta"
                type="date"
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="montoMinimo"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Rango de monto
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                id="montoMinimo"
                placeholder="Monto mínimo"
                type="number"
                value={searchForm.monto_min}
                onChange={(e) => handleInputChange("monto_min", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
              <Input
                id="montoMaximo"
                placeholder="Monto máximo"
                type="number"
                value={searchForm.monto_max}
                onChange={(e) => handleInputChange("monto_max", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>
          </div>
            </>
          ) : (
            <>
              {/* SECOP Search Form */}
              <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Consulta SECOP - Procesos de Contratación Pública
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Búsqueda General
                  </Label>
                  <Input
                    placeholder="Buscar por entidad, objeto o número..."
                    value={secopSearchForm.search}
                    onChange={(e) => handleSecopInputChange("search", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Entidad
                  </Label>
                  <Input
                    placeholder="Nombre de la entidad"
                    value={secopSearchForm.entidad}
                    onChange={(e) => handleSecopInputChange("entidad", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Objeto del Contrato
                  </Label>
                  <Input
                    placeholder="Descripción del objeto"
                    value={secopSearchForm.objeto}
                    onChange={(e) => handleSecopInputChange("objeto", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Valor Mínimo
                  </Label>
                  <Input
                    type="number"
                    placeholder="Valor mínimo en COP"
                    value={secopSearchForm.valor_minimo}
                    onChange={(e) => handleSecopInputChange("valor_minimo", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Fecha Inicio
                  </Label>
                  <Input
                    type="date"
                    value={secopSearchForm.fecha_inicio}
                    onChange={(e) => handleSecopInputChange("fecha_inicio", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Fecha Fin
                  </Label>
                  <Input
                    type="date"
                    value={secopSearchForm.fecha_fin}
                    onChange={(e) => handleSecopInputChange("fecha_fin", e.target.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* SECOP Search Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSecopSearchForm({
                      entidad: "",
                      objeto: "",
                      search: "",
                      fecha_inicio: "",
                      fecha_fin: "",
                      valor_minimo: "",
                    });
                    setSecopResults([]);
                  }}
                  className="px-4 h-9 text-sm"
                  disabled={loading}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleSecopSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Consultar SECOP
                    </>
                  )}
                </Button>
              </div>

              {/* SECOP Results */}
              {processes && processes.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-slate-800 mb-3">
                    Resultados SECOP ({processes.length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {processes.map((proceso, index) => (
                      <div key={proceso.uid || index} className="p-3 border rounded text-xs bg-blue-50">
                        <div className="font-medium text-blue-800">
                          {proceso.entidad || 'Entidad no especificada'}
                        </div>
                        <div className="text-slate-700 mt-1">
                          <strong>Objeto:</strong> {proceso.objeto || 'N/A'}
                        </div>
                        <div className="text-slate-600 mt-1 flex justify-between items-center">
                          <span>
                            <strong>Valor:</strong> {proceso.valor ?
                              new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                minimumFractionDigits: 0
                              }).format(proceso.valor) : 'N/A'}
                          </span>
                          <span>
                            <strong>Fecha:</strong> {proceso.fecha_firma ?
                              new Date(proceso.fecha_firma).toLocaleDateString('es-CO') : 'N/A'}
                          </span>
                        </div>
                        {proceso.url_secop && (
                          <div className="mt-2">
                            <a
                              href={proceso.url_secop}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                            >
                              Ver en SECOP <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Resultados de búsqueda de órdenes de compra */}
        {!showSecopTab && searchResults.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-slate-800 mb-3">
              Resultados de búsqueda ({searchResults.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {searchResults.map((orden) => (
                <div key={orden.id} className="p-2 border rounded text-xs">
                  <div className="font-medium">Orden: {orden.orden}</div>
                  <div className="text-slate-600">
                    Fecha: {orden.fecha} | Tipo: {orden.tipo_compra}
                  </div>
                  {orden.proveedor && (
                    <div className="text-slate-600">
                      Proveedor: {orden.proveedor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons - only show for Purchase Orders tab since SECOP has its own buttons */}
        {!showSecopTab && (
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm"
              disabled={loading}
            >
              Cerrar
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full sm:w-auto px-4 h-9 text-sm"
                disabled={loading}
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
              <Button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-9 text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Close button for SECOP tab */}
        {showSecopTab && (
          <div className="flex justify-center pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 h-9 text-sm"
              disabled={loading}
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>

      {/* SECOP Consultation Modal */}
      <SecopConsultationModal
        open={secopModalOpen}
        onOpenChange={setSecopModalOpen}
        onSelectProcess={(process) => {
          console.log('🔗 [SECOP] Process selected from consultation modal:', process);
          // You can add additional logic here if needed
        }}
      />
    </Dialog>
  );
}
