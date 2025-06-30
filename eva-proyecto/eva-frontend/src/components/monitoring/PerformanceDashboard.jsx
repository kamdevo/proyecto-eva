/**
 * Dashboard de Performance en Tiempo Real - Sistema EVA
 * 
 * Características:
 * - Core Web Vitals en tiempo real
 * - Métricas de conexión y red
 * - Monitoreo de errores
 * - Gráficos de performance
 * - Alertas visuales
 * - Exportación de reportes
 */

import React, { useState, useEffect, useRef } from 'react';
import realUserMonitoring, { METRIC_TYPES, ALERT_THRESHOLDS } from '../../services/realUserMonitoring.js';
import connectionPool from '../../services/connectionPool.js';
import websocketManager from '../../services/websocketManager.js';
import resourceOptimizer from '../../utils/resourceOptimizer.js';
import logger, { LOG_CATEGORIES } from '../../utils/logger.js';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [vitals, setVitals] = useState({});
  const [connectionStats, setConnectionStats] = useState({});
  const [websocketStats, setWebsocketStats] = useState({});
  const [resourceStats, setResourceStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const intervalRef = useRef();

  useEffect(() => {
    // Inicializar dashboard
    updateAllMetrics();

    // Configurar actualización en tiempo real
    if (isLive) {
      intervalRef.current = setInterval(() => {
        updateAllMetrics();
      }, 2000); // Actualizar cada 2 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, timeRange]);

  const updateAllMetrics = async () => {
    try {
      // RUM metrics
      const rumMetrics = realUserMonitoring.getCurrentMetrics();
      setMetrics(rumMetrics);

      // Core Web Vitals
      const coreVitals = await getCoreWebVitals();
      setVitals(coreVitals);

      // Connection pool stats
      const connStats = connectionPool.getMetrics();
      setConnectionStats(connStats);

      // WebSocket stats
      const wsStats = websocketManager.getMetrics();
      setWebsocketStats(wsStats);

      // Resource optimizer stats
      const resStats = resourceOptimizer.getPerformanceMetrics();
      setResourceStats(resStats);

      // Verificar alertas
      checkForAlerts(rumMetrics, coreVitals, connStats);

    } catch (error) {
      logger.error(LOG_CATEGORIES.PERFORMANCE, 'Failed to update dashboard metrics', {
        error: error.message
      });
    }
  };

  const getCoreWebVitals = async () => {
    try {
      return await resourceOptimizer.getCoreWebVitals();
    } catch (error) {
      return {};
    }
  };

  const checkForAlerts = (rumMetrics, coreVitals, connStats) => {
    const newAlerts = [];

    // Verificar Core Web Vitals
    if (coreVitals.lcp > ALERT_THRESHOLDS.LCP) {
      newAlerts.push({
        id: Date.now() + '_lcp',
        type: 'warning',
        title: 'LCP Alto',
        message: `Largest Contentful Paint: ${coreVitals.lcp.toFixed(0)}ms (umbral: ${ALERT_THRESHOLDS.LCP}ms)`,
        timestamp: Date.now()
      });
    }

    if (coreVitals.fid > ALERT_THRESHOLDS.FID) {
      newAlerts.push({
        id: Date.now() + '_fid',
        type: 'warning',
        title: 'FID Alto',
        message: `First Input Delay: ${coreVitals.fid.toFixed(0)}ms (umbral: ${ALERT_THRESHOLDS.FID}ms)`,
        timestamp: Date.now()
      });
    }

    if (coreVitals.cls > ALERT_THRESHOLDS.CLS) {
      newAlerts.push({
        id: Date.now() + '_cls',
        type: 'error',
        title: 'CLS Alto',
        message: `Cumulative Layout Shift: ${coreVitals.cls.toFixed(3)} (umbral: ${ALERT_THRESHOLDS.CLS})`,
        timestamp: Date.now()
      });
    }

    // Verificar conexiones
    if (connStats.healthyEndpoints < connStats.totalEndpoints) {
      newAlerts.push({
        id: Date.now() + '_conn',
        type: 'error',
        title: 'Endpoints No Disponibles',
        message: `${connStats.totalEndpoints - connStats.healthyEndpoints} endpoints no disponibles`,
        timestamp: Date.now()
      });
    }

    // Actualizar alertas (mantener solo las últimas 10)
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
  };

  const getVitalStatus = (vital, value) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[vital];
    if (!threshold || value === undefined) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      sessionId: metrics.sessionId,
      coreWebVitals: vitals,
      connectionStats,
      websocketStats,
      resourceStats,
      alerts: alerts.slice(0, 5) // Últimas 5 alertas
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="performance-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Performance - Sistema EVA
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isLive ? 'En vivo' : 'Pausado'}
              </span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded text-sm ${
                isLive 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isLive ? 'Pausar' : 'Reanudar'}
            </button>
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Exportar Reporte
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Monitoreo en tiempo real de performance, Core Web Vitals y conectividad
        </p>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Alertas Activas</h2>
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Core Web Vitals</h3>
          
          {/* LCP */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">LCP (Largest Contentful Paint)</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getVitalStatus('lcp', vitals.lcp))}`}>
                {getVitalStatus('lcp', vitals.lcp)}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {vitals.lcp ? `${vitals.lcp.toFixed(0)}ms` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Umbral: ≤2.5s</div>
          </div>

          {/* FID */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">FID (First Input Delay)</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getVitalStatus('fid', vitals.fid))}`}>
                {getVitalStatus('fid', vitals.fid)}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {vitals.fid ? `${vitals.fid.toFixed(0)}ms` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Umbral: ≤100ms</div>
          </div>

          {/* CLS */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">CLS (Cumulative Layout Shift)</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getVitalStatus('cls', vitals.cls))}`}>
                {getVitalStatus('cls', vitals.cls)}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {vitals.cls ? vitals.cls.toFixed(3) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Umbral: ≤0.1</div>
          </div>
        </div>

        {/* Connection Pool Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Pool de Conexiones</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Endpoints Saludables</span>
                <span className="font-semibold">{connectionStats.healthyEndpoints || 0}/{connectionStats.totalEndpoints || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conexiones Activas</span>
                <span className="font-semibold">{connectionStats.activeConnections || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiempo de Respuesta</span>
                <span className="font-semibold">{connectionStats.averageResponseTime || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Éxito</span>
                <span className="font-semibold">{connectionStats.successRate || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Utilización del Pool</span>
                <span className="font-semibold">{connectionStats.poolUtilization?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* WebSocket Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">WebSocket</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  websocketStats.isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {websocketStats.isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Latencia Promedio</span>
                <span className="font-semibold">{websocketStats.averageLatency || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mensajes Enviados</span>
                <span className="font-semibold">{websocketStats.messagesSent || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mensajes Recibidos</span>
                <span className="font-semibold">{websocketStats.messagesReceived || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reconexiones</span>
                <span className="font-semibold">{websocketStats.reconnections || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Optimizer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Optimización de Recursos</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recursos Cargados</span>
                <span className="font-semibold">{resourceStats.loadedResources || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recursos Precargados</span>
                <span className="font-semibold">{resourceStats.preloadedResources || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lazy Loading</span>
                <span className="font-semibold">{resourceStats.lazyLoadedResources || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Cache Hit</span>
                <span className="font-semibold">{resourceStats.cacheHitRate || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tamaño de Bundle</span>
                <span className="font-semibold">{resourceStats.bundleSizeKB || 'N/A'} KB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Información de Sesión</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Session ID</span>
                <span className="font-mono text-xs">{metrics.sessionId?.slice(-12) || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Duración</span>
                <span className="font-semibold">
                  {metrics.duration ? `${Math.floor(metrics.duration / 1000)}s` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Métricas en Buffer</span>
                <span className="font-semibold">{metrics.bufferedMetrics || 0}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Último Flush</span>
                <span className="font-semibold">
                  {metrics.lastFlush ? new Date(metrics.lastFlush).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  metrics.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {metrics.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Dashboard de Performance - Sistema EVA | Actualización cada 2 segundos</p>
        <p>Monitoreo empresarial con 99.99% de disponibilidad objetivo</p>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
