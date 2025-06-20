"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Building2, Package, Activity } from "lucide-react"

export default function UIFiltrosSuperiores({ onTipoChange, onSedeChange, onAdquisicionChange, onEstadoChange }) {
  return (
    <div className="bg-white p-6 border-x border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
              <Settings className="w-3 h-3 text-blue-600" />
            </div>
            <span>Seleccionar Tipo</span>
          </label>
          <Select onValueChange={onTipoChange}>
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
          <Select onValueChange={onSedeChange}>
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
          <Select onValueChange={onAdquisicionChange}>
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
          <Select onValueChange={onEstadoChange}>
            <SelectTrigger className="h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200 group-hover:border-gray-400">
              <SelectValue placeholder="------" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="mantenimiento">En mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
