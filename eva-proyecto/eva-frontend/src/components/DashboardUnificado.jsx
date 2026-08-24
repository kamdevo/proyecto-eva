import React, { useState, useEffect } from "react";
import {
  Download, FileSpreadsheet, FileText, Calendar, Activity,
  BarChart3, Wrench, Package, Settings2, Building2, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { RoundedPieChart } from "./ui/rounded-pie-chart";
import httpService from "@/services/httpService";
import { toast } from "sonner";

// ─── Skeleton helper ────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`bg-slate-200 rounded animate-pulse ${className}`} />;
}

// ─── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, color, icon: Icon, loading }) {
  const colors = {
    cyan:   { border: "border-l-cyan-500",   text: "text-cyan-700",   val: "text-cyan-900",   bg: "bg-cyan-500" },
    green:  { border: "border-l-green-500",  text: "text-green-700",  val: "text-green-900",  bg: "bg-green-500" },
    orange: { border: "border-l-orange-500", text: "text-orange-700", val: "text-orange-900", bg: "bg-orange-500" },
    red:    { border: "border-l-red-500",    text: "text-red-700",    val: "text-red-900",    bg: "bg-red-500" },
  };
  const c = colors[color];
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${c.border} p-5`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-xs font-medium ${c.text} mb-2 leading-tight`}>{label}</p>
          {loading
            ? <Skeleton className="h-8 w-24" />
            : <p className={`text-3xl font-bold ${c.val}`}>{value.toLocaleString()}</p>
          }
        </div>
        <div className={`w-11 h-11 ${c.bg} rounded-lg flex items-center justify-center ml-4`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ title, icon: Icon, iconColor, children, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {loading
        ? <div className="space-y-2"><Skeleton className="h-4" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-2" /></div>
        : children
      }
    </div>
  );
}

// ─── Export card ─────────────────────────────────────────────────────────────
function ExportCard({ title, description, icon: Icon, iconBg, iconColor, btnColor, onExport, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center text-center gap-3">
      <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <Button
        onClick={onExport}
        disabled={loading}
        className={`w-full ${btnColor} text-white`}
        size="sm"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar Excel
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardUnificado() {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState("resumen");

  // ── State from DashboardReportesFuncional ──────────────────────────────────
  const [loading, setLoading] = useState({
    kpis: true, preventivos: true, correctivos: true, tickets: true,
  });
  const [data, setData] = useState({
    kpis:        { totalEquipos: 0, enPlan: 0, comodato: 0, sinPlan: 0 },
    preventivos: { programados: 0, ejecutados: 0, porcentaje: 0 },
    correctivos: { total: 0, abiertos: 0, cerrados: 0 },
    tickets:     { total: 0, abiertos: 0, asignados: 0, cerrados: 0 },
  });
  const [exportLoading, setExportLoading] = useState({
    correctivos: false, tickets: false, preventivos: false, calibraciones: false,
  });

  // ── State from ControlPanel ────────────────────────────────────────────────
  const [ticketStats, setTicketStats] = useState({
    abiertos: 0, asignados: 0, diagnosticados: 0, cerrados: 0, esperandoCierre: 0,
    biomedico: 0, industrial: 0, infraestructura: 0, total: 0, loading: true,
  });

  // Órdenes por día y en proceso, por tipo (biomédico / industrial / infraestructura)
  const [ordenesPorTipo, setOrdenesPorTipo] = useState(null);
  // Estadísticas de calibraciones (total y por tipo)
  const [calibStats, setCalibStats] = useState(null);

  // ── Filtro por SEDE ─────────────────────────────────────────────────────────
  const [sedes, setSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState("all"); // "all" = Todas las sedes
  // Parámetro que se añade a todas las llamadas cuando hay una sede seleccionada
  const sedeParams = (selectedSede && selectedSede !== "all") ? { sede_id: selectedSede } : {};

  // ── Cargar catálogo de sedes (una vez) ─────────────────────────────────────
  useEffect(() => {
    httpService.get("/v1/sedes")
      .then((res) => {
        const d = res.data?.data?.data || res.data?.data || res.data || [];
        setSedes(Array.isArray(d) ? d : []);
      })
      .catch(() => { /* sin sedes, el filtro solo mostrará 'Todas' */ });
  }, []);

  // ── Cargar/recargar datos del resumen al montar y al cambiar de sede ───────
  useEffect(() => {
    loadKPIs();
    loadPreventivos();
    loadCorrectivos();
    loadTickets();
    loadOrdenesPorTipo();
    loadCalibraciones();
    // Las gráficas de correctivos (tab Correctivos) deben recalcularse con la nueva sede
    setTicketStats(prev => ({ ...prev, loading: true }));
    if (activeTab === "correctivos") loadTicketStats();
  }, [selectedSede]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load pie-chart data when Correctivos tab opens ─────────────────────────
  useEffect(() => {
    if (activeTab === "correctivos" && ticketStats.loading) {
      loadTicketStats();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadKPIs = async () => {
    try {
      setLoading(prev => ({ ...prev, kpis: true }));
      const [eqRes, planRes, sinRes] = await Promise.all([
        httpService.get("/v1/equipos/medical-devices-complete", { params: { per_page: 1, ...sedeParams } }),
        httpService.get("/v1/equipos/medical-devices-complete", { params: { per_page: 1, incluido_en_plan_anio: currentYear, ...sedeParams } }),
        httpService.get("/v1/equipos/medical-devices-complete", { params: { per_page: 1, no_incluido_en_plan_anio: currentYear, ...sedeParams } }),
      ]);
      let comodato = 0;
      try {
        const comRes = await httpService.get("/v1/equipos/medical-devices-complete", { params: { per_page: 1, tadquisicion_id: 4, ...sedeParams } });
        comodato = comRes.data.data?.total || comRes.data.total || 0;
      } catch { /* optional */ }
      setData(prev => ({
        ...prev,
        kpis: {
          totalEquipos: eqRes.data.data?.total  || eqRes.data.total  || 0,
          enPlan:       planRes.data.data?.total || planRes.data.total || 0,
          comodato,
          sinPlan:      sinRes.data.data?.total  || sinRes.data.total  || 0,
        },
      }));
    } catch (err) {
      console.error("Error cargando KPIs:", err);
      toast.error("Error al cargar estadísticas de equipos");
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  };

  const loadPreventivos = async () => {
    try {
      setLoading(prev => ({ ...prev, preventivos: true }));
      const [planesRes, ejRes] = await Promise.all([
        httpService.get("/v1/planes-mantenimientos",   { params: { anio: currentYear, per_page: 1, ...sedeParams } }),
        httpService.get("/v1/mantenimientos-ejecutados", { params: { anio: currentYear, per_page: 1, ...sedeParams } }),
      ]);
      const programados = planesRes.data.data?.total || planesRes.data.total || 0;
      const ejecutados  = ejRes.data.data?.total     || ejRes.data.total     || 0;
      const porcentaje  = programados > 0 ? (ejecutados / programados) * 100 : 0;
      setData(prev => ({ ...prev, preventivos: { programados, ejecutados, porcentaje } }));
    } catch (err) {
      console.error("Error cargando preventivos:", err);
      toast.error("Error al cargar datos de preventivos");
    } finally {
      setLoading(prev => ({ ...prev, preventivos: false }));
    }
  };

  const loadCorrectivos = async () => {
    try {
      setLoading(prev => ({ ...prev, correctivos: true }));
      const [totRes, abRes, ceRes] = await Promise.all([
        httpService.get("/v1/correctivos-generales", { params: { anio: currentYear, per_page: 1, ...sedeParams } }),
        httpService.get("/v1/correctivos-generales", { params: { anio: currentYear, per_page: 1, estado: 1, ...sedeParams } }),
        httpService.get("/v1/correctivos-generales", { params: { anio: currentYear, per_page: 1, estado: 4, ...sedeParams } }),
      ]);
      setData(prev => ({
        ...prev,
        correctivos: {
          total:    totRes.data.data?.total || totRes.data.total || 0,
          abiertos: abRes.data.data?.total  || abRes.data.total  || 0,
          cerrados: ceRes.data.data?.total  || ceRes.data.total  || 0,
        },
      }));
    } catch (err) {
      console.error("Error cargando correctivos:", err);
      toast.error("Error al cargar datos de correctivos");
    } finally {
      setLoading(prev => ({ ...prev, correctivos: false }));
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(prev => ({ ...prev, tickets: true }));
      const [totRes, abRes, asRes, ceRes] = await Promise.all([
        httpService.get("/v1/gestion-tickets", { params: { anio: currentYear, per_page: 1, ...sedeParams } }),
        httpService.get("/v1/gestion-tickets", { params: { anio: currentYear, per_page: 1, estado: 1, ...sedeParams } }),
        httpService.get("/v1/gestion-tickets", { params: { anio: currentYear, per_page: 1, estado: 2, ...sedeParams } }),
        httpService.get("/v1/gestion-tickets", { params: { anio: currentYear, per_page: 1, estado: 4, ...sedeParams } }),
      ]);
      setData(prev => ({
        ...prev,
        tickets: {
          total:    totRes.data.data?.total || totRes.data.total || 0,
          abiertos: abRes.data.data?.total  || abRes.data.total  || 0,
          asignados: asRes.data.data?.total || asRes.data.total  || 0,
          cerrados: ceRes.data.data?.total  || ceRes.data.total  || 0,
        },
      }));
    } catch (err) {
      console.error("Error cargando tickets:", err);
      toast.error("Error al cargar datos de tickets");
    } finally {
      setLoading(prev => ({ ...prev, tickets: false }));
    }
  };

  const loadTicketStats = async () => {
    try {
      setTicketStats(prev => ({ ...prev, loading: true }));
      const base = { anio: currentYear, per_page: 1, ...sedeParams };
      const [
        abRes, asRes, dxRes, ceRes, espRes,
        bioRes, indRes, infRes, totRes,
      ] = await Promise.all([
        httpService.get("/v1/gestion-tickets", { params: { ...base, estado: 1 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, estado: 2 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, estado: 3 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, estado: 4 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, estado: 5 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, tipo_equipo: 1 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, tipo_equipo: 2 } }),
        httpService.get("/v1/gestion-tickets", { params: { ...base, tipo_equipo: 3 } }),
        httpService.get("/v1/gestion-tickets", { params: base }),
      ]);
      const g = (r) => r.data.data?.total || r.data.total || 0;
      setTicketStats({
        abiertos:       g(abRes),
        asignados:      g(asRes),
        diagnosticados: g(dxRes),
        cerrados:       g(ceRes),
        esperandoCierre:g(espRes),
        biomedico:      g(bioRes),
        industrial:     g(indRes),
        infraestructura:g(infRes),
        total:          g(totRes),
        loading: false,
      });
    } catch (e) {
      console.error(e);
      setTicketStats(prev => ({ ...prev, loading: false }));
    }
  };

  // ── Órdenes por día y en proceso, por tipo ─────────────────────────────────
  const loadOrdenesPorTipo = async () => {
    try {
      const res = await httpService.get("/v1/ordenes/estadisticas-por-tipo", {
        params: { ...sedeParams },
      });
      if (res.data?.success) setOrdenesPorTipo(res.data.data);
    } catch (err) {
      console.error("Error cargando órdenes por tipo:", err);
    }
  };

  // ── Calibraciones (total y por tipo) ───────────────────────────────────────
  const loadCalibraciones = async () => {
    try {
      const res = await httpService.get("/v1/calibraciones/estadisticas", {
        params: { ...sedeParams },
      });
      if (res.data?.success) setCalibStats(res.data.data);
    } catch (err) {
      console.error("Error cargando calibraciones:", err);
    }
  };

  // ── Export handlers ────────────────────────────────────────────────────────
  const makeExporter = (key, endpoint, filename) => async () => {
    try {
      setExportLoading(prev => ({ ...prev, [key]: true }));
      toast.loading(`Exportando ${key}...`, { id: `export-${key}` });
      // Propagar el filtro de sede (y el año en preventivos) al export
      const exportParams = {
        ...(key === "preventivos" ? { anio: currentYear } : {}),
        ...sedeParams,
      };
      const response = await httpService.get(endpoint, {
        responseType: "blob",
        headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        ...(Object.keys(exportParams).length > 0 ? { params: exportParams } : {}),
      });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Exportado exitosamente", { id: `export-${key}` });
    } catch (err) {
      console.error(`Error exportando ${key}:`, err);
      toast.error(`Error al exportar ${key}`, { id: `export-${key}` });
    } finally {
      setExportLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleExportCorrectivos  = makeExporter("correctivos",   "/v1/correctivos-generales/export-excel", "Correctivos_Generales");
  const handleExportTickets       = makeExporter("tickets",       "/v1/gestion-tickets/export-excel",       "Tickets_Consolidado");
  const handleExportPreventivos   = makeExporter("preventivos",   "/v1/planes-mantenimientos/export-excel",  `Preventivos_${currentYear}`);
  const handleExportCalibraciones = makeExporter("calibraciones", "/v1/export/calibraciones",               "Calibraciones");

  // ── Chart data ─────────────────────────────────────────────────────────────
  const ticketEstadoData = [
    { name: "Abierto",          value: ticketStats.abiertos,        fill: "#3b82f6" },
    { name: "Asignado",         value: ticketStats.asignados,       fill: "#10b981" },
    { name: "Diagnosticado",    value: ticketStats.diagnosticados,  fill: "#f59e0b" },
    { name: "Cerrado",          value: ticketStats.cerrados,        fill: "#6d28d9" },
    { name: "Esperando cierre", value: ticketStats.esperandoCierre, fill: "#ef4444" },
  ].filter(i => i.value > 0);

  const ticketEstadoConfig = {
    Abierto:            { label: "Abierto",          color: "#3b82f6" },
    Asignado:           { label: "Asignado",         color: "#10b981" },
    Diagnosticado:      { label: "Diagnosticado",    color: "#f59e0b" },
    Cerrado:            { label: "Cerrado",           color: "#6d28d9" },
    "Esperando cierre": { label: "Esperando cierre", color: "#ef4444" },
  };

  const ticketTipoData = [
    { name: "Biomédico",      value: ticketStats.biomedico,       fill: "#0ea5e9" },
    { name: "Industrial",     value: ticketStats.industrial,      fill: "#f97316" },
    { name: "Infraestructura",value: ticketStats.infraestructura, fill: "#22c55e" },
  ].filter(i => i.value > 0);

  const ticketTipoConfig = {
    "Biomédico":      { label: "Biomédico",       color: "#0ea5e9" },
    Industrial:       { label: "Industrial",       color: "#f97316" },
    Infraestructura:  { label: "Infraestructura",  color: "#22c55e" },
  };

  // ── Tabs config ────────────────────────────────────────────────────────────
  const tabs = [
    { key: "resumen",       label: "Resumen",       icon: BarChart3 },
    { key: "correctivos",   label: "Correctivos",   icon: Wrench },
    { key: "preventivos",   label: "Preventivos",   icon: Calendar },
    { key: "calibraciones", label: "Calibraciones", icon: Gauge },
    { key: "equipos",       label: "Equipos",       icon: Package },
  ];

  // ── Row badge helper ───────────────────────────────────────────────────────
  const StatRow = ({ label, value, variant = "secondary" }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <Badge variant={variant} className={
        variant === "destructive" ? "bg-red-100 text-red-700 border-0" :
        variant === "green"       ? "bg-green-100 text-green-700 border-0" :
        variant === "yellow"      ? "bg-yellow-100 text-yellow-700 border-0" :
        "bg-slate-100 text-slate-700 border-0"
      }>
        {value}
      </Badge>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F4F6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Indicadores y control · Año {currentYear}
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-xs text-slate-500 border-slate-300 bg-white px-3 py-1.5">
            Datos en tiempo real
          </Badge>
        </div>

        {/* ── Filtro por Sede (aplica a todas las estadísticas) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Sede</p>
              <p className="text-xs text-slate-500">Filtra las estadísticas por sede del hospital</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={selectedSede} onValueChange={setSelectedSede}>
              <SelectTrigger className="w-full sm:w-56 h-10 text-sm">
                <SelectValue placeholder="Todas las sedes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {sedes.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name || s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSede !== "all" && (
              <Badge className="bg-blue-100 text-blue-700 border-0 whitespace-nowrap">
                Filtro activo
              </Badge>
            )}
          </div>
        </div>

        {/* ── Tab switcher ────────────────────────────────────── */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 w-fit overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-none"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════
            TAB: RESUMEN
            ════════════════════════════════════════════════════════ */}
        {activeTab === "resumen" && (
          <div className="space-y-6">

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Total de Equipos Registrados" value={data.kpis.totalEquipos} color="cyan"   icon={Activity}      loading={loading.kpis} />
              <KpiCard label="Incluidos en Plan Preventivo"  value={data.kpis.enPlan}       color="green"  icon={Calendar}      loading={loading.kpis} />
              <KpiCard label="Total de Equipos en Comodato"  value={data.kpis.comodato}     color="orange" icon={FileText}      loading={loading.kpis} />
              <KpiCard label="No Incluidos en el Plan"       value={data.kpis.sinPlan}      color="red"    icon={FileSpreadsheet} loading={loading.kpis} />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Preventivos */}
              <StatCard title="Mantenimientos Preventivos" icon={Calendar} iconColor="text-blue-600" loading={loading.preventivos}>
                <div className="space-y-3">
                  <StatRow label="Programados" value={data.preventivos.programados} />
                  <StatRow label="Ejecutados"  value={data.preventivos.ejecutados} variant="green" />
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Cumplimiento</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {data.preventivos.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={data.preventivos.porcentaje} className="h-1.5" />
                  </div>
                </div>
              </StatCard>

              {/* Correctivos */}
              <StatCard title="Correctivos Generales" icon={Wrench} iconColor="text-orange-600" loading={loading.correctivos}>
                <div className="space-y-3">
                  <StatRow label="Total"    value={data.correctivos.total} />
                  <StatRow label="Abiertos" value={data.correctivos.abiertos} variant="destructive" />
                  <StatRow label="Cerrados" value={data.correctivos.cerrados} variant="green" />
                </div>
              </StatCard>

              {/* Tickets */}
              <StatCard title="Tickets del Sistema" icon={FileText} iconColor="text-purple-600" loading={loading.tickets}>
                <div className="space-y-3">
                  <StatRow label="Total"     value={data.tickets.total} />
                  <StatRow label="Abiertos"  value={data.tickets.abiertos}  variant="destructive" />
                  <StatRow label="Asignados" value={data.tickets.asignados} variant="yellow" />
                  <StatRow label="Cerrados"  value={data.tickets.cerrados}  variant="green" />
                </div>
              </StatCard>
            </div>

            {/* Órdenes por día y en proceso, por tipo de intervención */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">Órdenes por día · por tipo de intervención</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Promedio de órdenes creadas por día activo y órdenes actualmente en proceso (no cerradas).
              </p>
              {!ordenesPorTipo ? (
                <div className="space-y-3">
                  <Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" />
                </div>
              ) : (
                <div className="space-y-3.5">
                  {[
                    { key: "biomedico",      label: "Biomédico",      bar: "bg-blue-500",   text: "text-blue-700",   chip: "bg-blue-50 text-blue-700" },
                    { key: "industrial",     label: "Industrial",     bar: "bg-orange-500", text: "text-orange-700", chip: "bg-orange-50 text-orange-700" },
                    { key: "infraestructura",label: "Infraestructura",bar: "bg-green-500",  text: "text-green-700",  chip: "bg-green-50 text-green-700" },
                  ].map(({ key, label, bar, text, chip }) => {
                    const t = ordenesPorTipo[key] || {};
                    const max = Math.max(
                      1,
                      ordenesPorTipo.biomedico?.promedio_dia || 0,
                      ordenesPorTipo.industrial?.promedio_dia || 0,
                      ordenesPorTipo.infraestructura?.promedio_dia || 0
                    );
                    const pct = Math.round(((t.promedio_dia || 0) / max) * 100);
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${bar} flex-shrink-0`} />
                        <span className="text-sm text-slate-700 w-24 sm:w-28 flex-shrink-0 truncate">{label}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[40px]">
                          <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-sm font-bold tabular-nums w-20 text-right ${text}`}>
                          {(t.promedio_dia || 0).toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-400">/día</span>
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${chip}`}>
                          {t.en_proceso || 0} en proceso
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Combinado (todos los tipos)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {(ordenesPorTipo.combinado?.promedio_dia || 0).toFixed(2)}
                        <span className="text-xs font-normal text-slate-400"> órdenes/día</span>
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                        {ordenesPorTipo.combinado?.en_proceso || 0} en proceso
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Exports */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900">Exportaciones Consolidadas</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">Descarga reportes completos en formato Excel</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ExportCard
                  title="Correctivos Generales"
                  description="Todos los correctivos del sistema"
                  icon={FileSpreadsheet}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-600"
                  btnColor="bg-orange-600 hover:bg-orange-700"
                  onExport={handleExportCorrectivos}
                  loading={exportLoading.correctivos}
                />
                <ExportCard
                  title="Tickets"
                  description="Todos los tickets del sistema"
                  icon={FileText}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                  btnColor="bg-purple-600 hover:bg-purple-700"
                  onExport={handleExportTickets}
                  loading={exportLoading.tickets}
                />
                <ExportCard
                  title="Preventivos"
                  description="Plan de mantenimientos del año"
                  icon={Calendar}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  btnColor="bg-blue-600 hover:bg-blue-700"
                  onExport={handleExportPreventivos}
                  loading={exportLoading.preventivos}
                />
                <ExportCard
                  title="Calibraciones"
                  description="Todas las calibraciones"
                  icon={Activity}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                  btnColor="bg-green-600 hover:bg-green-700"
                  onExport={handleExportCalibraciones}
                  loading={exportLoading.calibraciones}
                />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: CORRECTIVOS (gráficas de tickets)
            ════════════════════════════════════════════════════════ */}
        {activeTab === "correctivos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Estadísticas de Tickets — Correctivos</h2>
              <p className="text-xs text-slate-500 mb-6">Datos reales del año {currentYear} obtenidos en tiempo real</p>

              {ticketStats.loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[0, 1].map((i) => (
                    <div key={i} className="border border-slate-100 rounded-2xl p-4">
                      <Skeleton className="h-3 w-28 mx-auto mb-5" />
                      <div className="flex items-center justify-center h-48">
                        <Skeleton className="h-44 w-44 rounded-full" />
                      </div>
                      <div className="flex justify-center flex-wrap gap-3 mt-5">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Por Estado */}
                  <div className="border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider mb-3">
                      Por Estado
                    </p>
                    {ticketEstadoData.length > 0 ? (
                      <RoundedPieChart
                        chartData={ticketEstadoData}
                        chartConfig={ticketEstadoConfig}
                        title=""
                        description={`Total: ${ticketStats.total} tickets`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
                        Sin datos disponibles
                      </div>
                    )}
                  </div>

                  {/* Por Tipo de Equipo */}
                  <div className="border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider mb-3">
                      Por Tipo de Equipo
                    </p>
                    {ticketTipoData.length > 0 ? (
                      <RoundedPieChart
                        chartData={ticketTipoData}
                        chartConfig={ticketTipoConfig}
                        title=""
                        description="Biomédico · Industrial · Infraestructura"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
                        Sin datos disponibles
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Resumen numérico tickets — skeleton mientras carga */}
            {ticketStats.loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 border-l-4 border-l-slate-200 p-4">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))}
              </div>
            )}

            {/* Resumen numérico tickets */}
            {!ticketStats.loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "Abiertos",         value: ticketStats.abiertos,        color: "border-l-blue-500   text-blue-700   bg-blue-50"   },
                  { label: "Asignados",         value: ticketStats.asignados,       color: "border-l-green-500  text-green-700  bg-green-50"  },
                  { label: "Diagnosticados",    value: ticketStats.diagnosticados,  color: "border-l-yellow-500 text-yellow-700 bg-yellow-50" },
                  { label: "Cerrados",          value: ticketStats.cerrados,        color: "border-l-purple-500 text-purple-700 bg-purple-50" },
                  { label: "Esp. cierre",       value: ticketStats.esperandoCierre, color: "border-l-red-500    text-red-700    bg-red-50"    },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${color.split(" ")[0]} p-4`}>
                    <p className={`text-xs font-medium ${color.split(" ")[1]} mb-1`}>{label}</p>
                    <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: PREVENTIVOS
            ════════════════════════════════════════════════════════ */}
        {activeTab === "preventivos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Mantenimientos Preventivos</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Seguimiento del plan de mantenimiento preventivo</p>
                </div>
                <div className="w-40">
                  <Select defaultValue={String(currentYear)}>
                    <SelectTrigger className="h-9 text-sm border-slate-200">
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading.preventivos ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Big progress */}
                  <div className="p-5 bg-[#F1F4F6] rounded-2xl">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Cumplimiento del plan</p>
                        <p className="text-4xl font-bold text-blue-600">
                          {data.preventivos.porcentaje.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {data.preventivos.ejecutados.toLocaleString()} de {data.preventivos.programados.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">mantenimientos ejecutados</p>
                      </div>
                    </div>
                    <Progress value={data.preventivos.porcentaje} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Programados</p>
                      <p className="text-3xl font-bold text-slate-900">{data.preventivos.programados.toLocaleString()}</p>
                    </div>
                    <div className="border border-green-200 rounded-2xl p-4 text-center bg-green-50">
                      <p className="text-xs text-green-600 mb-1">Ejecutados</p>
                      <p className="text-3xl font-bold text-green-700">{data.preventivos.ejecutados.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleExportPreventivos}
                      disabled={exportLoading.preventivos}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {exportLoading.preventivos ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Exportar Excel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: CALIBRACIONES
            ════════════════════════════════════════════════════════ */}
        {activeTab === "calibraciones" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-semibold text-slate-900">Calibraciones registradas</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Cantidad de calibraciones en el sistema{selectedSede !== "all" ? " para la sede seleccionada" : ""}.
            </p>

            {!calibStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard label="Total de Calibraciones"      value={calibStats.total}              color="cyan"   icon={Gauge}    loading={false} />
                  <KpiCard label="Calibraciones Biomédicas"    value={calibStats.biomedico}          color="green"  icon={Activity} loading={false} />
                  <KpiCard label="Calibraciones Industriales"  value={calibStats.industrial}         color="orange" icon={Settings2} loading={false} />
                  <KpiCard label="Equipos Calibrados"          value={calibStats.equipos_calibrados} color="red"    icon={Package}  loading={false} />
                </div>

                {/* Distribución biomédico vs industrial */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Biomédico ({(calibStats.biomedico || 0).toLocaleString()})</span>
                    <span>Industrial ({(calibStats.industrial || 0).toLocaleString()})</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                    {(() => {
                      const t = (calibStats.biomedico || 0) + (calibStats.industrial || 0) || 1;
                      const b = Math.round(((calibStats.biomedico || 0) / t) * 100);
                      return (
                        <>
                          <div className="h-full bg-green-500" style={{ width: `${b}%` }} />
                          <div className="h-full bg-orange-500" style={{ width: `${100 - b}%` }} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: EQUIPOS
            ════════════════════════════════════════════════════════ */}
        {activeTab === "equipos" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">Información de Equipos</h2>
            </div>
            {loading.kpis ? (
              <div className="space-y-3">
                <Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total registrados",      value: data.kpis.totalEquipos, color: "border-cyan-200   bg-cyan-50   text-cyan-900"  },
                    { label: "En plan preventivo",     value: data.kpis.enPlan,       color: "border-green-200  bg-green-50  text-green-900" },
                    { label: "En comodato",            value: data.kpis.comodato,     color: "border-orange-200 bg-orange-50 text-orange-900"},
                    { label: "Sin plan preventivo",    value: data.kpis.sinPlan,      color: "border-red-200    bg-red-50    text-red-900"   },
                  ].map(({ label, value, color }) => {
                    const [border, bg, text] = color.split(" ");
                    return (
                      <div key={label} className={`border ${border} ${bg} rounded-2xl p-4 text-center`}>
                        <p className={`text-xs ${text} opacity-70 mb-1`}>{label}</p>
                        <p className={`text-3xl font-bold ${text}`}>{value.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <p className="text-xs text-slate-400 text-center">
                    Datos actualizados en tiempo real · {currentYear}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
