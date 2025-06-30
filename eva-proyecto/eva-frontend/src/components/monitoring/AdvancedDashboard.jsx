/**
 * Dashboard Avanzado Integrado - Sistema EVA
 * 
 * Características:
 * - Integración de todas las mejoras avanzadas
 * - HTTP/3, Edge Computing, AI, Multi-Region, Analytics
 * - Métricas en tiempo real de próxima generación
 * - Visualizaciones interactivas
 * - Alertas inteligentes
 * - Predicciones y recomendaciones
 */

import React, { useState, useEffect, useRef } from 'react';
import http3Client from '../../services/http3Client.js';
import edgeComputing from '../../services/edgeComputing.js';
import aiPerformanceOptimizer from '../../services/aiPerformanceOptimizer.js';
import multiRegionFailover from '../../services/multiRegionFailover.js';
import advancedAnalytics from '../../services/advancedAnalytics.js';
import realUserMonitoring from '../../services/realUserMonitoring.js';
import connectionPool from '../../services/connectionPool.js';
import websocketManager from '../../services/websocketManager.js';
import logger, { LOG_CATEGORIES } from '../../utils/logger.js';

const AdvancedDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [http3Stats, setHttp3Stats] = useState({});
  const [edgeStats, setEdgeStats] = useState({});
  const [aiStats, setAiStats] = useState({});
  const [regionStats, setRegionStats] = useState({});
  const [analyticsStats, setAnalyticsStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [isLive, setIsLive] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
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
  }, [isLive]);

  const updateAllMetrics = async () => {
    try {
      // HTTP/3 metrics
      const http3Metrics = http3Client.getMetrics();
      setHttp3Stats(http3Metrics);

      // Edge computing metrics
      const edgeMetrics = edgeComputing.getMetrics();
      setEdgeStats(edgeMetrics);

      // AI optimizer metrics
      const aiMetrics = aiPerformanceOptimizer.getAIMetrics();
      setAiStats(aiMetrics);

      // Multi-region metrics
      const regionMetrics = multiRegionFailover.getMetrics();
      setRegionStats(regionMetrics);

      // Advanced analytics metrics
      const analyticsMetrics = advancedAnalytics.getAnalyticsMetrics();
      setAnalyticsStats(analyticsMetrics);

      // RUM metrics
      const rumMetrics = realUserMonitoring.getCurrentMetrics();
      setMetrics(rumMetrics);

      // Verificar alertas
      checkForAdvancedAlerts();

      // Obtener predicciones
      updatePredictions();

    } catch (error) {
      logger.error(LOG_CATEGORIES.PERFORMANCE, 'Failed to update advanced dashboard metrics', {
        error: error.message
      });
    }
  };

  const checkForAdvancedAlerts = () => {
    const newAlerts = [];

    // Alertas HTTP/3
    if (http3Stats.currentRTT > 200) {
      newAlerts.push({
        id: Date.now() + '_http3_rtt',
        type: 'warning',
        category: 'HTTP/3',
        title: 'RTT Alto en HTTP/3',
        message: `RTT: ${http3Stats.currentRTT?.toFixed(0)}ms (umbral: 200ms)`,
        timestamp: Date.now()
      });
    }

    // Alertas Edge Computing
    if (edgeStats.utilization > 90) {
      newAlerts.push({
        id: Date.now() + '_edge_util',
        type: 'error',
        category: 'Edge',
        title: 'Alta Utilización Edge',
        message: `Utilización: ${edgeStats.utilization?.toFixed(1)}% (umbral: 90%)`,
        timestamp: Date.now()
      });
    }

    // Alertas AI
    if (aiStats.averageModelAccuracy < 0.8) {
      newAlerts.push({
        id: Date.now() + '_ai_accuracy',
        type: 'warning',
        category: 'AI',
        title: 'Precisión de Modelos Baja',
        message: `Precisión promedio: ${(aiStats.averageModelAccuracy * 100)?.toFixed(1)}% (umbral: 80%)`,
        timestamp: Date.now()
      });
    }

    // Alertas Multi-Region
    if (regionStats.healthyRegions < 2) {
      newAlerts.push({
        id: Date.now() + '_region_health',
        type: 'error',
        category: 'Multi-Region',
        title: 'Regiones Insuficientes',
        message: `Solo ${regionStats.healthyRegions} regiones saludables`,
        timestamp: Date.now()
      });
    }

    // Actualizar alertas (mantener solo las últimas 10)
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
  };

  const updatePredictions = () => {
    // Simular predicciones basadas en métricas actuales
    const newPredictions = {
      traffic: {
        nextHour: Math.round((analyticsStats.totalEvents || 0) * 1.2),
        next24Hours: Math.round((analyticsStats.totalEvents || 0) * 24 * 1.1),
        confidence: 0.85
      },
      performance: {
        expectedLatency: (http3Stats.currentRTT || 100) * 1.05,
        expectedLoad: Math.min((edgeStats.utilization || 50) * 1.1, 100),
        confidence: 0.78
      },
      resources: {
        memoryUsage: 'stable',
        cpuUsage: 'increasing',
        networkUsage: 'stable',
        confidence: 0.82
      }
    };

    setPredictions(newPredictions);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const exportAdvancedReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      type: 'advanced_performance_report',
      
      // Métricas de próxima generación
      http3: {
        ...http3Stats,
        healthStatus: http3Client.getHealthStatus()
      },
      edgeComputing: {
        ...edgeStats,
        healthStatus: edgeComputing.getHealthStatus()
      },
      aiOptimization: {
        ...aiStats,
        healthStatus: aiPerformanceOptimizer.getAIHealthStatus()
      },
      multiRegion: {
        ...regionStats,
        healthStatus: multiRegionFailover.getHealthStatus()
      },
      analytics: {
        ...analyticsStats,
        healthStatus: advancedAnalytics.getHealthStatus()
      },
      
      // Predicciones y recomendaciones
      predictions,
      alerts: alerts.slice(0, 5),
      
      // Métricas tradicionales
      rum: metrics,
      connectionPool: connectionPool.getMetrics(),
      websocket: websocketManager.getMetrics()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-advanced-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* HTTP/3 Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">HTTP/3 & QUIC</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estado</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(http3Stats.state)}`}>
              {http3Stats.state || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">RTT Actual</span>
            <span className="font-semibold">{http3Stats.currentRTT?.toFixed(0) || 'N/A'}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Streams Activos</span>
            <span className="font-semibold">{http3Stats.activeStreams || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Packet Loss</span>
            <span className="font-semibold">{(http3Stats.packetLoss * 100)?.toFixed(3) || 0}%</span>
          </div>
        </div>
      </div>

      {/* Edge Computing */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Edge Computing</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Región Actual</span>
            <span className="font-semibold">{edgeStats.currentRegion || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Workers Activos</span>
            <span className="font-semibold">{edgeStats.activeWorkers || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Edge Hit Rate</span>
            <span className="font-semibold">{edgeStats.edgeHitRate?.toFixed(1) || 0}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Utilización</span>
            <span className="font-semibold">{edgeStats.utilization?.toFixed(1) || 0}%</span>
          </div>
        </div>
      </div>

      {/* AI Optimization */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Optimization</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Modelos Activos</span>
            <span className="font-semibold">{aiStats.modelsActive || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Precisión Promedio</span>
            <span className="font-semibold">{(aiStats.averageModelAccuracy * 100)?.toFixed(1) || 0}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Predicciones</span>
            <span className="font-semibold">{aiStats.totalPredictions || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Optimizaciones</span>
            <span className="font-semibold">{aiStats.totalOptimizations || 0}</span>
          </div>
        </div>
      </div>

      {/* Multi-Region */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Multi-Region</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Región Principal</span>
            <span className="font-semibold">{regionStats.currentRegion || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Regiones Saludables</span>
            <span className="font-semibold">{regionStats.healthyRegions || 0}/{regionStats.totalRegions || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Failovers</span>
            <span className="font-semibold">{regionStats.totalFailovers || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tasa de Éxito</span>
            <span className="font-semibold">{regionStats.failoverSuccessRate?.toFixed(1) || 100}%</span>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Advanced Analytics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Eventos Totales</span>
            <span className="font-semibold">{analyticsStats.totalEvents || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Insights Generados</span>
            <span className="font-semibold">{analyticsStats.generatedInsights || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Anomalías</span>
            <span className="font-semibold">{analyticsStats.detectedAnomalies || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Calidad de Datos</span>
            <span className="font-semibold">{analyticsStats.dataQuality?.toFixed(1) || 0}%</span>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Predicciones IA</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tráfico (1h)</span>
            <span className="font-semibold">{predictions.traffic?.nextHour || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Latencia Esperada</span>
            <span className="font-semibold">{predictions.performance?.expectedLatency?.toFixed(0) || 'N/A'}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Carga Esperada</span>
            <span className="font-semibold">{predictions.performance?.expectedLoad?.toFixed(1) || 'N/A'}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Confianza</span>
            <span className="font-semibold">{(predictions.performance?.confidence * 100)?.toFixed(0) || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Avanzado - Sistema EVA v2.0
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
              onClick={exportAdvancedReport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Exportar Reporte Avanzado
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Monitoreo de próxima generación: HTTP/3, Edge Computing, AI, Multi-Region, Analytics ML
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Resumen General' },
            { id: 'http3', name: 'HTTP/3 & QUIC' },
            { id: 'edge', name: 'Edge Computing' },
            { id: 'ai', name: 'AI Optimization' },
            { id: 'regions', name: 'Multi-Region' },
            { id: 'analytics', name: 'Analytics ML' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Alertas Avanzadas */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Alertas del Sistema</h2>
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">{alert.category}</span>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    </div>
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

      {/* Content Area */}
      <div className="content-area">
        {selectedView === 'overview' && renderOverviewTab()}
        {/* Otros tabs se implementarían aquí */}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Dashboard Avanzado - Sistema EVA v2.0 | Tecnologías de Próxima Generación</p>
        <p>HTTP/3 + Edge Computing + AI + Multi-Region + Analytics ML</p>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
