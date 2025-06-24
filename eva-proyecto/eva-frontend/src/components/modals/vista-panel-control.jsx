"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"

// Actualizar las importaciones para usar los nuevos nombres de archivos
import UIFiltrosSuperiores from "./ui-filtros-superiores"
import UIGraficosCorrectivos from "./ui-graficos-correctivos"

export default function ControlPanel() {
  const [activeTab, setActiveTab] = useState("Home")
  const [previousTab, setPreviousTab] = useState("")

  // Estado para los filtros
  const [filtros, setFiltros] = useState({})

  const handleTabChange = (newTab) => {
    setPreviousTab(activeTab)
    setActiveTab(newTab)
  }

  const tabs = ["Home", "Correctivos", "Preventivos", "Equipos"]

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">Contenido de la página principal</p>
          </div>
        )

      case "Correctivos":
        return <UIGraficosCorrectivos />

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
        )

      case "Equipos":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">EQUIPOS</h2>
            <p className="text-gray-600">Información general de los equipos</p>
          </div>
        )

      default:
        return null
    }
  }

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
        <UIFiltrosSuperiores
          onTipoChange={(value) => setFiltros((prev) => ({ ...prev, tipo: value }))}
          onSedeChange={(value) => setFiltros((prev) => ({ ...prev, sede: value }))}
          onAdquisicionChange={(value) => setFiltros((prev) => ({ ...prev, tipoAdquisicion: value }))}
          onEstadoChange={(value) => setFiltros((prev) => ({ ...prev, estadoActual: value }))}
        />

        {/* Panel de Control */}
        <Card className="rounded-t-none">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">PANEL DE CONTROL</h2>
                <p className="text-sm text-gray-600">Seleccione la opción que desea consultar</p>
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
                    <span className="font-medium text-gray-700">Pestaña activa:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {activeTab}
                    </Badge>
                  </div>
                  {previousTab && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">Pestaña anterior:</span>
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
  )
}
