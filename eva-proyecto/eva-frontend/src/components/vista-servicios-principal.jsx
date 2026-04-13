"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit, Trash2, Plus, Search, Settings, Eye,
  ArrowUpDown, ArrowUp, ArrowDown, Loader2, Building2,
} from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import Pagination from "@/components/common/Pagination";

// Modales
import UIModalAgregarServicio  from "@/components/modals/ui-modal-agregar-servicio";
import UIModalEditarServicio   from "@/components/modals/ui-modal-editar-servicio";
import UIModalEliminarServicio from "@/components/modals/ui-modal-eliminar-servicio";
import UIModalAgregarArea      from "@/components/modals/ui-modal-agregar-area";
import UIModalVerServicio      from "@/components/modals/ui-modal-ver-servicio";

export default function VistaServiciosPrincipal() {

  // ── Modales ──────────────────────────────────────────────
  const [isAddModalOpen,    setIsAddModalOpen]    = useState(false);
  const [isEditModalOpen,   setIsEditModalOpen]   = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAreaModalOpen,   setIsAreaModalOpen]   = useState(false);
  const [isViewModalOpen,   setIsViewModalOpen]   = useState(false);
  const [selectedService,   setSelectedService]   = useState(null);

  // ── Datos ─────────────────────────────────────────────────
  const [servicios,    setServicios]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [inputSearch,  setInputSearch]  = useState("");
  const [searchTerm,   setSearchTerm]   = useState("");

  // ── Paginación ────────────────────────────────────────────
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Ordenamiento ──────────────────────────────────────────
  const [sortField,     setSortField]     = useState("s.name");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDirection === "asc"
      ? <ArrowUp   className="w-3.5 h-3.5 text-blue-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
  };

  // ── Fetch ─────────────────────────────────────────────────
  const fetchServicios = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page:            currentPage,
        per_page:        itemsPerPage,
        order_by:        sortField,
        order_direction: sortDirection,
      };
      if (searchTerm) params.search = searchTerm;

      console.log('🌐 [SERVICIOS] Fetching data...', { currentPage, itemsPerPage, searchTerm });
      const response = await httpService.get("/v1/servicios", { params });
      const res      = response.data;

      // Estructuras posibles: res.data.data (paginator) o res.data (array)
      let rawItems = [];
      let metaInfo = { last_page: 1, total: 0 };

      if (res?.data && res.data.data) {
        rawItems = res.data.data;
        metaInfo = res.data;
      } else if (Array.isArray(res?.data)) {
        rawItems = res.data;
        metaInfo = res.pagination || {};
      }

      console.log('📦 [SERVICIOS] RAW Items count:', rawItems.length);
      console.log('🔍 [SERVICIOS] Primer item (KEYS):', rawItems.length > 0 ? Object.keys(rawItems[0]) : 'vacío');
      console.log('🔍 [SERVICIOS] Primer item (VALUE):', rawItems.length > 0 ? rawItems[0] : 'vacío');

      setServicios(rawItems);
      setTotalPages(metaInfo.last_page || 1);
      setTotalItems(metaInfo.total     || rawItems.length);
    } catch (err) {
      console.error('❌ [SERVICIOS] Error en fetch:', err);
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => { fetchServicios(); }, [fetchServicios]);

  // ── Búsqueda manual ───────────────────────────────────────
  const triggerSearch = () => {
    setSearchTerm(inputSearch);
    setCurrentPage(1);
  };

  // ── Acciones ──────────────────────────────────────────────
  const handleView   = (s) => { setSelectedService(s); setIsViewModalOpen(true);   };
  const handleEdit   = (s) => { setSelectedService(s); setIsEditModalOpen(true);   };
  const handleDelete = (s) => { setSelectedService(s); setIsDeleteModalOpen(true); };

  const handleModalClose = (refresh = false) => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedService(null);
    if (refresh) fetchServicios();
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">

      {/* ── PAGE HEADER (White Editorial Style) ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-blue-600">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
              Gestión de Servicios
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg text-sm">
              Administración centralizada de servicios hospitalarios del sistema EVA.
            </p>
          </div>
        </div>

        {/* Summary Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-5 w-full md:w-64 transition-all hover:shadow-md">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Servicios</p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Barra de Controles y Búsqueda */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, zona, sede..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
              className="w-full pl-11 pr-10 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm shadow-inner outline-none"
            />
            <button
              onClick={triggerSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Items por página */}
          <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <span className="hidden sm:inline">Mostrar</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-20 h-12 bg-slate-50 border-none rounded-2xl shadow-inner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-blue-100 transition-all font-bold w-full lg:w-auto shrink-0"
          >
            <Plus className="w-5 h-5 font-bold" />
            Nuevo Servicio
          </Button>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-white/50">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort("s.name")} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Servicio {getSortIcon("s.name")}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort("s.code")} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Código {getSortIcon("s.code")}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort("zona_nombre")} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Zona {getSortIcon("zona_nombre")}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort("sede_nombre")} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Sede {getSortIcon("sede_nombre")}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    Piso / Centro
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">
                    <button onClick={() => handleSort("total_equipos")} className="flex items-center justify-center gap-1.5 hover:text-blue-600 transition-colors w-full">
                      Equipos {getSortIcon("total_equipos")}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">
                    <button onClick={() => handleSort("total_usuarios")} className="flex items-center justify-center gap-1.5 hover:text-blue-600 transition-colors w-full">
                      Usuarios {getSortIcon("total_usuarios")}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">
                    Estado
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right w-40">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <span className="text-slate-400 font-medium">Sincronizando información...</span>
                      </div>
                    </td>
                  </tr>
                ) : servicios.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Building2 className="h-16 w-16 text-slate-100" />
                        <span className="text-slate-400 font-medium italic">No se encontraron servicios</span>
                        {searchTerm && (
                          <span className="text-xs text-slate-300">Intenta con otro término de búsqueda</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  servicios.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-all duration-200 group">

                      {/* Servicio */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100/50 group-hover:scale-110 transition-transform">
                            <Settings className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 uppercase tracking-wide text-sm">{s.name}</span>
                            {s.description && (
                              <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{s.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Código */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {s.code ?? "—"}
                        </span>
                      </td>

                      {/* Zona */}
                      <td className="px-6 py-4">
                        {(s.zona_nombre || s.zona) ? (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">
                            {s.zona_nombre || s.zona}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Sede */}
                      <td className="px-6 py-4">
                        {(s.sede_nombre || s.sede) ? (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg">
                            {s.sede_nombre || s.sede}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Piso / Centro */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600">
                          {(s.piso_nombre || s.piso) ? <div><span className="font-semibold">Piso:</span> {s.piso_nombre || s.piso}</div> : null}
                          {(s.centro_nombre || s.centro) ? <div><span className="font-semibold">Centro:</span> {s.centro_nombre || s.centro}</div> : null}
                          {!(s.piso_nombre || s.piso) && !(s.centro_nombre || s.centro) && <span className="text-slate-300">—</span>}
                        </div>
                      </td>

                      {/* Equipos */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                          {s.total_equipos ?? s.cant_equipos ?? 0}
                        </span>
                      </td>

                      {/* Usuarios */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                          {s.total_usuarios ?? s.cant_usuarios ?? 0}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        {(s.is_active == 1 || s.is_active === true || s.activo == 1 || s.status == 1) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-bold">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => handleView(s)}
                            className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              showInfo={true}
            />
          </div>
        </div>
      </div>

      {/* ── Modales ──────────────────────────────────────────── */}
      <UIModalAgregarServicio
        isOpen={isAddModalOpen}
        onClose={(refresh) => handleModalClose(refresh)}
      />
      <UIModalEditarServicio
        isOpen={isEditModalOpen}
        onClose={(refresh) => handleModalClose(refresh)}
        servicio={selectedService}
      />
      <UIModalEliminarServicio
        isOpen={isDeleteModalOpen}
        onClose={(refresh) => handleModalClose(refresh)}
        servicio={selectedService}
      />
      <UIModalAgregarArea
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
      />
      <UIModalVerServicio
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        servicio={selectedService}
      />
    </div>
  );
}