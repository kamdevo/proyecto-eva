import React, { useState, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import httpService from "@/services/httpService";
import { toast } from "sonner";

function DashboardReportesFuncional() {
  const [loading, setLoading] = useState({
    kpis: true,
    preventivos: true,
    correctivos: true,
    tickets: true
  });

  const [data, setData] = useState({
    kpis: {
      totalEquipos: 0,
      enPlan: 0,
      comodato: 0,
      sinPlan: 0
    },
    preventivos: {
      programados: 0,
      ejecutados: 0,
      porcentaje: 0
    },
    correctivos: {
      total: 0,
      abiertos: 0,
      cerrados: 0
    },
    tickets: {
      total: 0,
      abiertos: 0,
      asignados: 0,
      cerrados: 0
    }
  });

  const [exportLoading, setExportLoading] = useState({
    correctivos: false,
    tickets: false,
    preventivos: false,
    calibraciones: false
  });

  // Cargar datos reales al montar el componente
  useEffect(() => {
    loadKPIs();
    loadPreventivos();
    loadCorrectivos();
    loadTickets();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(prev => ({ ...prev, kpis: true }));

      const currentYear = new Date().getFullYear();

      // 1. Total de equipos biomédicos
      const equiposResponse = await httpService.get('/v1/equipos/medical-devices-complete', {
        params: { per_page: 1 }
      });
      const totalEquipos = equiposResponse.data.data?.total || 0;

      // 2. Incluidos en el plan (registros en planes_mantenimientos por año)
      const enPlanResponse = await httpService.get('/v1/equipos/medical-devices-complete', {
        params: { per_page: 1, incluido_en_plan_anio: currentYear }
      });
      const enPlan = enPlanResponse.data.data?.total || 0;

      // 3. Total equipos en comodato (tadquisicion_id = 4)
      let comodato = 0;
      try {
        const comodatoResponse = await httpService.get('/v1/equipos/medical-devices-complete', {
          params: { per_page: 1, tadquisicion_id: 4 }
        });
        comodato = comodatoResponse.data.data?.total || 0;
      } catch (err) {
        console.warn('Error obteniendo comodatos:', err);
      }

      // 4. Total no incluidos en el plan
      const sinPlanResponse = await httpService.get('/v1/equipos/medical-devices-complete', {
        params: { per_page: 1, no_incluido_en_plan_anio: currentYear }
      });
      const sinPlan = sinPlanResponse.data.data?.total || 0;

      setData(prev => ({
        ...prev,
        kpis: { totalEquipos, enPlan, comodato, sinPlan }
      }));
    } catch (error) {
      console.error('Error cargando KPIs:', error);
      toast.error('Error al cargar estadísticas de equipos');
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  };

  const loadPreventivos = async () => {
    try {
      setLoading(prev => ({ ...prev, preventivos: true }));

      const currentYear = new Date().getFullYear();

      // Obtener planes programados
      const planesResponse = await httpService.get('/v1/planes-mantenimientos', {
        params: { anio: currentYear, per_page: 1 }
      });

      const programados = planesResponse.data.data?.total || 0;

      // Obtener mantenimientos ejecutados
      const ejecutadosResponse = await httpService.get('/v1/mantenimientos-ejecutados', {
        params: { anio: currentYear, per_page: 1 }
      });

      const ejecutados = ejecutadosResponse.data.data?.total || 0;

      // Calcular porcentaje
      const porcentaje = programados > 0 ? (ejecutados / programados) * 100 : 0;

      setData(prev => ({
        ...prev,
        preventivos: { programados, ejecutados, porcentaje }
      }));
    } catch (error) {
      console.error('Error cargando preventivos:', error);
      toast.error('Error al cargar datos de preventivos');
    } finally {
      setLoading(prev => ({ ...prev, preventivos: false }));
    }
  };

  const loadCorrectivos = async () => {
    try {
      setLoading(prev => ({ ...prev, correctivos: true }));

      // Obtener total
      const currentYear = new Date().getFullYear();
      const totalResponse = await httpService.get('/v1/correctivos-generales', {
        params: { anio: currentYear, per_page: 1 }
      });
      const total = totalResponse.data.data?.total || 0;

      // Obtener abiertos (estado_id = 1)
      const abiertosResponse = await httpService.get('/v1/correctivos-generales', {
        params: { anio: currentYear, per_page: 1, estado: 1 }
      });
      const abiertos = abiertosResponse.data.data?.total || 0;

      // Obtener cerrados (estado_id = 4)
      const cerradosResponse = await httpService.get('/v1/correctivos-generales', {
        params: { anio: currentYear, per_page: 1, estado: 4 }
      });
      const cerrados = cerradosResponse.data.data?.total || 0;

      setData(prev => ({
        ...prev,
        correctivos: { total, abiertos, cerrados }
      }));
    } catch (error) {
      console.error('Error cargando correctivos:', error);
      toast.error('Error al cargar datos de correctivos');
    } finally {
      setLoading(prev => ({ ...prev, correctivos: false }));
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(prev => ({ ...prev, tickets: true }));

      const currentYear = new Date().getFullYear();
      // Obtener total
      const totalResponse = await httpService.get('/v1/gestion-tickets', {
        params: { anio: currentYear, per_page: 1 }
      });
      const total = totalResponse.data.data?.total || 0;

      // Obtener abiertos (estado_id = 1)
      const abiertosResponse = await httpService.get('/v1/gestion-tickets', {
        params: { anio: currentYear, per_page: 1, estado: 1 }
      });
      const abiertos = abiertosResponse.data.data?.total || 0;

      // Obtener asignados (estado_id = 2)
      const asignadosResponse = await httpService.get('/v1/gestion-tickets', {
        params: { anio: currentYear, per_page: 1, estado: 2 }
      });
      const asignados = asignadosResponse.data.data?.total || 0;

      // Obtener cerrados (estado_id = 4)
      const cerradosResponse = await httpService.get('/v1/gestion-tickets', {
        params: { anio: currentYear, per_page: 1, estado: 4 }
      });
      const cerrados = cerradosResponse.data.data?.total || 0;

      setData(prev => ({
        ...prev,
        tickets: { total, abiertos, asignados, cerrados }
      }));
    } catch (error) {
      console.error('Error cargando tickets:', error);
      toast.error('Error al cargar datos de tickets');
    } finally {
      setLoading(prev => ({ ...prev, tickets: false }));
    }
  };

  const handleExportCorrectivos = async () => {
    try {
      setExportLoading(prev => ({ ...prev, correctivos: true }));
      toast.loading('Exportando correctivos generales...', { id: 'export-correctivos' });

      const response = await httpService.get('/v1/correctivos-generales/export-excel', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Correctivos_Generales_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Correctivos exportados exitosamente', { id: 'export-correctivos' });
    } catch (error) {
      console.error('Error exportando correctivos:', error);
      toast.error('Error al exportar correctivos', { id: 'export-correctivos' });
    } finally {
      setExportLoading(prev => ({ ...prev, correctivos: false }));
    }
  };

  const handleExportTickets = async () => {
    try {
      setExportLoading(prev => ({ ...prev, tickets: true }));
      toast.loading('Exportando todos los tickets...', { id: 'export-tickets' });

      const response = await httpService.get('/v1/gestion-tickets/export-excel', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Tickets_Consolidado_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Tickets exportados exitosamente', { id: 'export-tickets' });
    } catch (error) {
      console.error('Error exportando tickets:', error);
      toast.error('Error al exportar tickets', { id: 'export-tickets' });
    } finally {
      setExportLoading(prev => ({ ...prev, tickets: false }));
    }
  };

  const handleExportPreventivos = async () => {
    try {
      setExportLoading(prev => ({ ...prev, preventivos: true }));
      toast.loading('Exportando preventivos...', { id: 'export-preventivos' });

      const currentYear = new Date().getFullYear();
      const response = await httpService.get('/v1/planes-mantenimientos/export-excel', {
        params: { anio: currentYear },
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Preventivos_${currentYear}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Preventivos exportados exitosamente', { id: 'export-preventivos' });
    } catch (error) {
      console.error('Error exportando preventivos:', error);
      toast.error('Error al exportar preventivos', { id: 'export-preventivos' });
    } finally {
      setExportLoading(prev => ({ ...prev, preventivos: false }));
    }
  };

  const handleExportCalibraciones = async () => {
    try {
      setExportLoading(prev => ({ ...prev, calibraciones: true }));
      toast.loading('Exportando calibraciones...', { id: 'export-calibraciones' });

      const response = await httpService.get('/v1/export/calibraciones', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Calibraciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Calibraciones exportadas exitosamente', { id: 'export-calibraciones' });
    } catch (error) {
      console.error('Error exportando calibraciones:', error);
      toast.error('Error al exportar calibraciones', { id: 'export-calibraciones' });
    } finally {
      setExportLoading(prev => ({ ...prev, calibraciones: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Tablero de Indicadores y Control
            </h1>
            <p className="text-slate-600">Dashboard con datos en tiempo real del sistema</p>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-700 mb-1">Total de Equipos Registrados</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-cyan-900">
                      {loading.kpis ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        data.kpis.totalEquipos.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 mb-1">Incluidos en Plan Preventivo</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-green-900">
                      {loading.kpis ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        data.kpis.enPlan.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700 mb-1">Total de Equipos en Comodato</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-orange-900">
                      {loading.kpis ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        data.kpis.comodato.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 mb-1">No Incluidos en el Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-red-900">
                      {loading.kpis ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        data.kpis.sinPlan.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preventivos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Mantenimientos Preventivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.preventivos ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Programados</span>
                    <Badge variant="secondary" className="text-sm">
                      {data.preventivos.programados}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Ejecutados</span>
                    <Badge variant="default" className="text-sm bg-green-600">
                      {data.preventivos.ejecutados}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Cumplimiento</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {data.preventivos.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={data.preventivos.porcentaje} className="h-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Correctivos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Correctivos Generales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.correctivos ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total</span>
                    <Badge variant="secondary" className="text-sm">
                      {data.correctivos.total}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Abiertos</span>
                    <Badge variant="destructive" className="text-sm">
                      {data.correctivos.abiertos}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Cerrados</span>
                    <Badge variant="default" className="text-sm bg-green-600">
                      {data.correctivos.cerrados}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Tickets del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.tickets ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total</span>
                    <Badge variant="secondary" className="text-sm">
                      {data.tickets.total}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Abiertos</span>
                    <Badge variant="destructive" className="text-sm">
                      {data.tickets.abiertos}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Asignados</span>
                    <Badge variant="default" className="text-sm bg-yellow-600">
                      {data.tickets.asignados}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Cerrados</span>
                    <Badge variant="default" className="text-sm bg-green-600">
                      {data.tickets.cerrados}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exportaciones Consolidadas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Download className="w-6 h-6 text-blue-600" />
              Exportaciones Consolidadas
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Descarga reportes completos en formato Excel
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Correctivos Generales */}
              <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileSpreadsheet className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Correctivos Generales</h3>
                      <p className="text-xs text-slate-600">Todos los correctivos del sistema</p>
                    </div>
                    <Button
                      onClick={handleExportCorrectivos}
                      disabled={exportLoading.correctivos}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      {exportLoading.correctivos ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tickets */}
              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Tickets</h3>
                      <p className="text-xs text-slate-600">Todos los tickets del sistema</p>
                    </div>
                    <Button
                      onClick={handleExportTickets}
                      disabled={exportLoading.tickets}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      {exportLoading.tickets ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preventivos */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Preventivos</h3>
                      <p className="text-xs text-slate-600">Plan de mantenimientos</p>
                    </div>
                    <Button
                      onClick={handleExportPreventivos}
                      disabled={exportLoading.preventivos}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      {exportLoading.preventivos ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Calibraciones */}
              <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Calibraciones</h3>
                      <p className="text-xs text-slate-600">Todas las calibraciones</p>
                    </div>
                    <Button
                      onClick={handleExportCalibraciones}
                      disabled={exportLoading.calibraciones}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {exportLoading.calibraciones ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardReportesFuncional;
