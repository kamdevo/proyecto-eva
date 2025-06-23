import { useState } from "react";
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

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState("Home");
  const [previousTab, setPreviousTab] = useState("");
  const handleTabChange = (newTab) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
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
            <h2 className="text-xl font-semibold text-gray-800">CORRECTIVOS</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico 1 - Estado actual de los sistemas */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Estado actual de los sistemas
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 200 200"
                      className="transform -rotate-90"
                    >
                      {/* Fondo del círculo */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="20"
                      />
                      {/* Segmento naranja (mayor) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="20"
                        strokeDasharray="377 503"
                        strokeDashoffset="0"
                      />
                      {/* Segmento azul */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray="63 503"
                        strokeDashoffset="-377"
                      />
                      {/* Segmento verde */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray="31 503"
                        strokeDashoffset="-440"
                      />
                      {/* Segmento rojo */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray="32 503"
                        strokeDashoffset="-471"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Activo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Inactivo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Reparado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Otro</span>
                  </div>
                </div>
              </div>

              {/* Gráfico 2 - Estado actual de los correctivos generales */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Estado actual de los correctivos generales
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 200 200"
                      className="transform -rotate-90"
                    >
                      {/* Fondo del círculo */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="20"
                      />
                      {/* Segmento naranja (mayor) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="20"
                        strokeDasharray="440 503"
                        strokeDashoffset="0"
                      />
                      {/* Otros segmentos más pequeños */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray="21 503"
                        strokeDashoffset="-440"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray="21 503"
                        strokeDashoffset="-461"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray="21 503"
                        strokeDashoffset="-482"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>ABIERTO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>CERRADO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>EN EJECUCIÓN</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>ESCALADO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>PAUSADO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Otro</span>
                  </div>
                </div>
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header con título */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 rounded-t-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Charts</h1>
              <p className="text-sm text-slate-200">Información dinámica</p>
            </div>
          </div>
        </div>

        {/* Filtros superiores */}
        <div className="bg-white p-6 border-x border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
                  <Settings className="w-3 h-3 text-blue-600" />
                </div>
                <span>Seleccionar Tipo</span>
              </label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 group-hover:border-gray-400">
                  <SelectValue placeholder="------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tipo1">Tipo 1</SelectItem>
                  <SelectItem value="tipo2">Tipo 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                  <Building2 className="w-3 h-3 text-green-600" />
                </div>
                <span>Seleccionar Sede</span>
              </label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 group-hover:border-gray-400">
                  <SelectValue placeholder="------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sede1">Sede 1</SelectItem>
                  <SelectItem value="sede2">Sede 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full">
                  <Package className="w-3 h-3 text-purple-600" />
                </div>
                <span>Seleccionar Tipo de adquisición</span>
              </label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 group-hover:border-gray-400">
                  <SelectValue placeholder="------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alquiler">ALQUILER</SelectItem>
                  <SelectItem value="cambio">CAMBIO POR GARANTÍA</SelectItem>
                  <SelectItem value="comodato">COMODATO</SelectItem>
                  <SelectItem value="compra">COMPRA</SelectItem>
                  <SelectItem value="demostracion">DEMOSTRACIÓN</SelectItem>
                  <SelectItem value="donacion">DONACIÓN</SelectItem>
                  <SelectItem value="intercambio">INTERCAMBIO</SelectItem>
                  <SelectItem value="prestamo">PRÉSTAMO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="group">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center justify-center w-5 h-5 bg-orange-100 rounded-full">
                  <Activity className="w-3 h-3 text-orange-600" />
                </div>
                <span>Seleccionar Estado actual de los equipos</span>
              </label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200 group-hover:border-gray-400">
                  <SelectValue placeholder="------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="mantenimiento">
                    En mantenimiento
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Panel de Control */}
        <Card className="rounded-t-none">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  PANEL DE CONTROL
                </h2>
                <p className="text-sm text-gray-600">
                  Seleccione la opción que desea consultar
                </p>
              </div>

              {/* Navegación por pestañas */}
              <div className="flex space-x-1 border-b border-gray-200">
                {tabs.map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "ghost"}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg rounded-b-none ${
                      activeTab === tab
                        ? "bg-blue-500 text-white border-b-2 border-blue-500"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {/* Contenido de la pestaña activa */}
              <div className="min-h-[400px]">{renderTabContent()}</div>

              {/* Indicadores de navegación */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">
                      Pestaña activa:
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {activeTab}
                    </Badge>
                  </div>
                  {previousTab && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">
                        Pestaña anterior:
                      </span>
                      <Badge variant="outline" className="text-gray-600">
                        {previousTab}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
