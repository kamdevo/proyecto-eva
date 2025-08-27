/**
 * ========================================
 * FILTROS AVANZADOS DE TICKETS
 * ========================================
 *
 * Componente para filtros avanzados y búsqueda inteligente
 * Incluye filtros por múltiples criterios y búsqueda en tiempo real
 */

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  User,
  Tag,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function AdvancedTicketFilters({ 
  onFiltersChange, 
  initialFilters = {},
  showActiveFilters = true 
}) {
  const [filters, setFilters] = useState({
    search: '',
    estado: 'todos',
    prioridad: 'todos',
    categoria: 'todos',
    usuario_asignado: 'todos',
    fecha_desde: null,
    fecha_hasta: null,
    vencidos: false,
    ...initialFilters
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Opciones para los filtros
  const estados = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'cerrado', label: 'Cerrado' },
  ];

  const prioridades = [
    { value: 'todos', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  const categorias = [
    { value: 'todos', label: 'Todas las categorías' },
    { value: 'soporte_tecnico', label: 'Soporte Técnico' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'calibracion', label: 'Calibración' },
    { value: 'capacitacion', label: 'Capacitación' },
    { value: 'otro', label: 'Otro' },
  ];

  /**
   * Actualizar filtro específico
   */
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  /**
   * Limpiar todos los filtros
   */
  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      estado: 'todos',
      prioridad: 'todos',
      categoria: 'todos',
      usuario_asignado: 'todos',
      fecha_desde: null,
      fecha_hasta: null,
      vencidos: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  /**
   * Contar filtros activos
   */
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.estado !== 'todos') count++;
    if (filters.prioridad !== 'todos') count++;
    if (filters.categoria !== 'todos') count++;
    if (filters.usuario_asignado !== 'todos') count++;
    if (filters.fecha_desde || filters.fecha_hasta) count++;
    if (filters.vencidos) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  /**
   * Obtener etiquetas de filtros activos
   */
  const getActiveFilterLabels = () => {
    const labels = [];
    
    if (filters.search) {
      labels.push({ key: 'search', label: `Búsqueda: "${filters.search}"` });
    }
    
    if (filters.estado !== 'todos') {
      const estado = estados.find(e => e.value === filters.estado);
      labels.push({ key: 'estado', label: `Estado: ${estado?.label}` });
    }
    
    if (filters.prioridad !== 'todos') {
      const prioridad = prioridades.find(p => p.value === filters.prioridad);
      labels.push({ key: 'prioridad', label: `Prioridad: ${prioridad?.label}` });
    }
    
    if (filters.categoria !== 'todos') {
      const categoria = categorias.find(c => c.value === filters.categoria);
      labels.push({ key: 'categoria', label: `Categoría: ${categoria?.label}` });
    }
    
    if (filters.fecha_desde || filters.fecha_hasta) {
      let dateLabel = 'Fecha: ';
      if (filters.fecha_desde && filters.fecha_hasta) {
        dateLabel += `${filters.fecha_desde} - ${filters.fecha_hasta}`;
      } else if (filters.fecha_desde) {
        dateLabel += `Desde ${filters.fecha_desde}`;
      } else {
        dateLabel += `Hasta ${filters.fecha_hasta}`;
      }
      labels.push({ key: 'fecha', label: dateLabel });
    }
    
    if (filters.vencidos) {
      labels.push({ key: 'vencidos', label: 'Solo vencidos' });
    }
    
    return labels;
  };

  /**
   * Remover filtro específico
   */
  const removeFilter = (key) => {
    switch (key) {
      case 'search':
        updateFilter('search', '');
        break;
      case 'estado':
        updateFilter('estado', 'todos');
        break;
      case 'prioridad':
        updateFilter('prioridad', 'todos');
        break;
      case 'categoria':
        updateFilter('categoria', 'todos');
        break;
      case 'fecha':
        updateFilter('fecha_desde', null);
        updateFilter('fecha_hasta', null);
        break;
      case 'vencidos':
        updateFilter('vencidos', false);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar tickets por título, descripción o número..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        {/* Botón de filtros avanzados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80" align="end">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Filtros Avanzados
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Estado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado</Label>
                  <Select value={filters.estado} onValueChange={(value) => updateFilter('estado', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridad */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prioridad</Label>
                  <Select value={filters.prioridad} onValueChange={(value) => updateFilter('prioridad', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((prioridad) => (
                        <SelectItem key={prioridad.value} value={prioridad.value}>
                          {prioridad.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoría</Label>
                  <Select value={filters.categoria} onValueChange={(value) => updateFilter('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rango de fechas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rango de Fechas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.fecha_desde || ''}
                      onChange={(e) => updateFilter('fecha_desde', e.target.value || null)}
                      placeholder="Desde"
                    />
                    <Input
                      type="date"
                      value={filters.fecha_hasta || ''}
                      onChange={(e) => updateFilter('fecha_hasta', e.target.value || null)}
                      placeholder="Hasta"
                    />
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Opciones</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="vencidos"
                      checked={filters.vencidos}
                      onChange={(e) => updateFilter('vencidos', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="vencidos" className="text-sm">
                      Solo tickets vencidos
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtros activos */}
      {showActiveFilters && activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {getActiveFilterLabels().map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter(filter.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
}
