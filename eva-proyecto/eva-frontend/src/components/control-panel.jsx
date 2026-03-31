import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Settings, Building2, Package, Activity } from "lucide-react";
import { RoundedPieChart } from "./ui/rounded-pie-chart";
import httpService from "@/services/httpService";

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState("Home");
  const [previousTab, setPreviousTab] = useState("");
  const [ticketStats, setTicketStats] = useState({
    abiertos: 0,
    asignados: 0,
    diagnosticados: 0,
    cerrados: 0,
    esperandoCierre: 0,
    biomedico: 0,
    industrial: 0,
    infraestructura: 0,
    total: 0,
    loading: true
  });

  const handleTabChange = (newTab) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  useEffect(() => {
    if (activeTab === "Correctivos" && ticketStats.loading) {
      loadTicketStats();
    }
  }, [activeTab]);

  const loadTicketStats = async () => {
    try {
      setTicketStats(prev => ({ ...prev, loading: true }));
      const currentYear = new Date().getFullYear();
      const base = { anio: currentYear, per_page: 1 };

      const [abiertosRes, asignadosRes, diagnosticadosRes, cerradosRes, esperandoRes,
             biomedRes, industRes, infraRes, totalRes] = await Promise.all([
        httpService.get('/v1/gestion-tickets', { params: { ...base, estado: 1 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, estado: 2 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, estado: 3 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, estado: 4 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, estado: 5 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, tipo_equipo: 1 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, tipo_equipo: 2 } }),
        httpService.get('/v1/gestion-tickets', { params: { ...base, tipo_equipo: 3 } }),
        httpService.get('/v1/gestion-tickets', { params: base }),
      ]);

      const g = (r) => r.data.data?.total || r.data.total || 0;

      setTicketStats({
        abiertos: g(abiertosRes),
        asignados: g(asignadosRes),
        diagnosticados: g(diagnosticadosRes),
        cerrados: g(cerradosRes),
        esperandoCierre: g(esperandoRes),
        biomedico: g(biomedRes),
        industrial: g(industRes),
        infraestructura: g(infraRes),
        total: g(totalRes),
        loading: false
      });
    } catch (e) {
      console.error(e);
      setTicketStats(prev => ({ ...prev, loading: false }));
    }
  };

  const ticketEstadoData = [
    { name: "Abierto",          value: ticketStats.abiertos,       fill: "#3b82f6" },
    { name: "Asignado",         value: ticketStats.asignados,      fill: "#10b981" },
    { name: "Diagnosticado",    value: ticketStats.diagnosticados, fill: "#f59e0b" },
    { name: "Cerrado",          value: ticketStats.cerrados,       fill: "#6d28d9" },
    { name: "Esperando cierre", value: ticketStats.esperandoCierre,fill: "#ef4444" },
  ].filter(item => item.value > 0);

  const ticketEstadoConfig = {
    Abierto:          { label: "Abierto",          color: "#3b82f6" },
    Asignado:         { label: "Asignado",         color: "#10b981" },
    Diagnosticado:    { label: "Diagnosticado",    color: "#f59e0b" },
    Cerrado:          { label: "Cerrado",           color: "#6d28d9" },
    "Esperando cierre": { label: "Esperando cierre", color: "#ef4444" },
  };

  const ticketTipoData = [
    { name: "Biomédico",      value: ticketStats.biomedico,      fill: "#0ea5e9" },
    { name: "Industrial",     value: ticketStats.industrial,     fill: "#f97316" },
    { name: "Infraestructura",value: ticketStats.infraestructura,fill: "#22c55e" },
  ].filter(item => item.value > 0);

  const ticketTipoConfig = {
    "Biomédico":       { label: "Biomédico",       color: "#0ea5e9" },
    Industrial:        { label: "Industrial",        color: "#f97316" },
    Infraestructura:   { label: "Infraestructura",   color: "#22c55e" },
  };

  const tabs = ["Home", "Correctivos", "Preventivos", "Equipos"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">Contenido de la página principal</p>
          </div>
        );

      case "Correctivos":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">ESTADÍSTICAS DE CORRECTIVOS</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Gráfico 1 — Por Estado */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-600 text-center mb-2 uppercase tracking-widest">Por Estado</h3>
                {ticketStats.loading ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-slate-400">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <RoundedPieChart
                    chartData={ticketEstadoData}
                    chartConfig={ticketEstadoConfig}
                    title=""
                    description={`Total: ${ticketStats.total} tickets`}
                  />
                )}
              </div>

              {/* Gráfico 2 — Por Tipo de Equipo */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-600 text-center mb-2 uppercase tracking-widest">Por Tipo de Equipo</h3>
                {ticketStats.loading ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-slate-400">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <RoundedPieChart
                    chartData={ticketTipoData}
                    chartConfig={ticketTipoConfig}
                    title=""
                    description={`Biomédico · Industrial · Infraestructura`}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case "Preventivos":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">PREVENTIVOS</h2>

            <div className="w-48">
              <Select defaultValue="2024">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-gray-600">
              <p>Contenido de preventivos para el año seleccionado</p>
            </div>
          </div>
        );

      case "Equipos":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">EQUIPOS</h2>
            <p className="text-gray-600">Información general de los equipos</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2b3437] font-sans">
      <main className="pt-12 px-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2b3437] mb-2 uppercase">PANEL DE CONTROL</h1>
            <p className="text-[#586064] text-lg">Seleccione la opción que desea consultar</p>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="relative group">
            <label className="block text-xs font-semibold text-[#586064] uppercase tracking-wider mb-2 ml-1">
              Tipo
            </label>
            <Select>
              <SelectTrigger className="w-full h-auto bg-[#ffffff] border border-[#abb3b7]/20 px-4 py-3.5 rounded-2xl flex justify-between items-center hover:bg-[#f1f4f6] transition-all text-[#2b3437] font-medium shadow-none focus:ring-0">
                <SelectValue placeholder="Seleccionar Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tipo1">Tipo 1</SelectItem>
                <SelectItem value="tipo2">Tipo 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative group">
            <label className="block text-xs font-semibold text-[#586064] uppercase tracking-wider mb-2 ml-1">
              Sede
            </label>
            <Select>
              <SelectTrigger className="w-full h-auto bg-[#ffffff] border border-[#abb3b7]/20 px-4 py-3.5 rounded-2xl flex justify-between items-center hover:bg-[#f1f4f6] transition-all text-[#2b3437] font-medium shadow-none focus:ring-0">
                <SelectValue placeholder="Seleccionar Sede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sede1">Sede 1</SelectItem>
                <SelectItem value="sede2">Sede 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative group">
            <label className="block text-xs font-semibold text-[#586064] uppercase tracking-wider mb-2 ml-1">
              Adquisición
            </label>
            <Select>
              <SelectTrigger className="w-full h-auto bg-[#ffffff] border border-[#abb3b7]/20 px-4 py-3.5 rounded-2xl flex justify-between items-center hover:bg-[#f1f4f6] transition-all text-[#2b3437] font-medium shadow-none focus:ring-0">
                <SelectValue placeholder="Tipo de adquisición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alquiler">ALQUILER</SelectItem>
                <SelectItem value="cambio">CAMBIO POR GAR. </SelectItem>
                <SelectItem value="comodato">COMODATO</SelectItem>
                <SelectItem value="compra">COMPRA</SelectItem>
                <SelectItem value="demostracion">DEMOSTR.</SelectItem>
                <SelectItem value="donacion">DONACIÓN</SelectItem>
                <SelectItem value="intercambio">INTERCAMBIO</SelectItem>
                <SelectItem value="prestamo">PRÉSTAMO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative group">
            <label className="block text-xs font-semibold text-[#586064] uppercase tracking-wider mb-2 ml-1">
              Estado
            </label>
            <Select>
              <SelectTrigger className="w-full h-auto bg-[#ffffff] border border-[#abb3b7]/20 px-4 py-3.5 rounded-2xl flex justify-between items-center hover:bg-[#f1f4f6] transition-all text-[#2b3437] font-medium shadow-none focus:ring-0">
                <SelectValue placeholder="Estado actual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-[#ffffff] rounded-3xl p-8 shadow-sm border border-[#abb3b7]/10 min-h-[400px] flex flex-col">
          {/* Tabs for Focus */}
          <div className="flex items-center gap-2 mb-8 bg-[#f1f4f6] p-1.5 rounded-full w-fit max-w-full overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#1353d8] text-[#f8f7ff] shadow-[0_4px_6px_-1px_rgba(19,83,216,0.2)]"
                    : "text-[#586064] hover:bg-[#eaeff1]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-grow flex flex-col items-start justify-start py-4 w-full">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
