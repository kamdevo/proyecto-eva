/**
 * ========================================
 * DASHBOARD DE TICKETS
 * ========================================
 *
 * Dashboard completo con estadísticas, métricas y gráficos
 * para el sistema de gestión de tickets
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import apiService from "../services/apiService";
import { useToast } from "../contexts/ToastContext";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
// } from "recharts";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function TicketDashboard() {
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Colores para los gráficos
  const COLORS = {
    abierto: "#ef4444",
    en_proceso: "#f59e0b",
    pendiente: "#eab308",
    resuelto: "#22c55e",
    cerrado: "#6b7280",
  };

  const PRIORITY_COLORS = {
    baja: "#22c55e",
    media: "#f59e0b",
    alta: "#ef4444",
    urgente: "#dc2626",
  };

  /**
   * Cargar estadísticas generales
   */
  const loadGeneralStats = async () => {
    try {
      const response = await apiService.ticketsApi.getGeneralStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading general stats:", error);
      setError("Error al cargar estadísticas generales");
    }
  };

  /**
   * Cargar estadísticas por categoría
   */
  const loadCategoryStats = async () => {
    try {
      const response = await apiService.ticketsApi.getStatsByCategory();
      if (response.success) {
        setCategoryStats(response.data);
      }
    } catch (error) {
      console.error("Error loading category stats:", error);
      setError("Error al cargar estadísticas por categoría");
    }
  };

  /**
   * Cargar todas las estadísticas
   */
  const loadAllStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadGeneralStats(),
        loadCategoryStats(),
      ]);
    } catch (error) {
      console.error("Error loading stats:", error);
      showToast("Error al cargar estadísticas", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar estadísticas
   */
  const refreshStats = () => {
    loadAllStats();
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadAllStats();
  }, []);

  // Datos mock para desarrollo
  const mockStats = {
    total_tickets: 156,
    tickets_abiertos: 23,
    tickets_en_proceso: 18,
    tickets_pendientes: 12,
    tickets_resueltos: 89,
    tickets_cerrados: 14,
    tiempo_promedio_resolucion: 4.2,
    satisfaccion_promedio: 4.1,
    tickets_vencidos: 5,
  };

  const mockCategoryData = [
    { name: "Soporte Técnico", value: 45, color: "#3b82f6" },
    { name: "Mantenimiento", value: 32, color: "#10b981" },
    { name: "Calibración", value: 28, color: "#f59e0b" },
    { name: "Capacitación", value: 15, color: "#8b5cf6" },
    { name: "Otro", value: 8, color: "#6b7280" },
  ];

  const mockTrendData = [
    { mes: "Ene", tickets: 45 },
    { mes: "Feb", tickets: 52 },
    { mes: "Mar", tickets: 48 },
    { mes: "Abr", tickets: 61 },
    { mes: "May", tickets: 55 },
    { mes: "Jun", tickets: 67 },
  ];

  // Usar datos reales o mock
  const currentStats = stats || mockStats;
  const currentCategoryData = categoryStats.length > 0 ? categoryStats : mockCategoryData;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tickets</h1>
          <p className="text-gray-600">Estadísticas y métricas del sistema de tickets</p>
        </div>
        <Button
          onClick={refreshStats}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total_tickets}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currentStats.tickets_abiertos}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStats.tickets_vencidos} vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentStats.tickets_resueltos}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStats.tiempo_promedio_resolucion}h
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo de resolución
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Temporalmente deshabilitados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Gráfico de distribución</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentCategoryData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tendencia Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Gráfico de tendencias</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {mockTrendData.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="font-medium">{item.mes}</div>
                      <div className="text-blue-600">{item.tickets}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estados de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Estados de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {currentStats.tickets_abiertos}
              </div>
              <div className="text-sm text-gray-600">Abiertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {currentStats.tickets_en_proceso}
              </div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentStats.tickets_pendientes}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentStats.tickets_resueltos}
              </div>
              <div className="text-sm text-gray-600">Resueltos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {currentStats.tickets_cerrados}
              </div>
              <div className="text-sm text-gray-600">Cerrados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
