/**
 * Dashboard de Monitoreo en Tiempo Real - Sistema EVA
 * 
 * Características:
 * - Métricas en tiempo real
 * - Gráficos de tendencias
 * - Alertas visuales
 * - Logs en vivo
 * - Performance monitoring
 * - Health checks
 */

import React, { useState, useEffect, useRef } from 'react';
import logger, { LOG_LEVELS, LOG_CATEGORIES } from '../../utils/logger.js';
import errorHandler from '../../utils/errorHandler.js';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const intervalRef = useRef();

  useEffect(() => {
    // Inicializar dashboard
    updateMetrics();
    updateLogs();
    updateAlerts();

    // Configurar actualización en tiempo real
    if (isLive) {
      intervalRef.current = setInterval(() => {
        updateMetrics();
        updateLogs();
        updateAlerts();
      }, 2000); // Actualizar cada 2 segundos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, selectedCategory, selectedLevel]);

  const updateMetrics = () => {
    try {
      const performanceMetrics = logger.getPerformanceMetrics();
      const errorMetrics = errorHandler.getAdvancedErrorMetrics();
      
      setMetrics({
        ...performanceMetrics,
        errors: errorMetrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  const updateLogs = () => {
    try {
      let filteredLogs = logger.logs.slice(0, 100); // Últimos 100 logs

      if (selectedCategory !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.category === selectedCategory);
      }

      if (selectedLevel !== 'ALL') {
        const levelValue = LOG_LEVELS[selectedLevel];
        filteredLogs = filteredLogs.filter(log => log.level >= levelValue);
      }

      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error updating logs:', error);
    }
  };

  const updateAlerts = () => {
    try {
      // Obtener alertas activas (simulado)
      const activeAlerts = [
        // Aquí se obtendrían las alertas reales del sistema
      ];
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error updating alerts:', error);
    }
  };

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case LOG_LEVELS.DEBUG: return 'text-gray-500';
      case LOG_LEVELS.INFO: return 'text-blue-500';
      case LOG_LEVELS.WARN: return 'text-yellow-500';
      case LOG_LEVELS.ERROR: return 'text-red-500';
      case LOG_LEVELS.FATAL: return 'text-red-700 font-bold';
      default: return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const exportLogs = () => {
    try {
      const logsData = JSON.stringify(logs, null, 2);
      const blob = new Blob([logsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `eva-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const clearLogs = () => {
    if (window.confirm('¿Está seguro de que desea limpiar todos los logs?')) {
      logger.logs = [];
      setLogs([]);
    }
  };

  return (
    <div className="monitoring-dashboard p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Monitoreo - Sistema EVA
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
          <span className="text-sm text-gray-500">
            Última actualización: {metrics.timestamp ? formatTimestamp(metrics.timestamp) : 'N/A'}
          </span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Logs Totales</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalLogs || 0}</p>
          <p className="text-sm text-gray-500">Última hora: {metrics.recentLogs || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tasa de Errores</h3>
          <p className={`text-3xl font-bold ${getStatusColor(metrics.errorRate || 0, { warning: 5, critical: 10 })}`}>
            {(metrics.errorRate || 0).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Últimos 100 logs</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tiempo de Respuesta</h3>
          <p className={`text-3xl font-bold ${getStatusColor(metrics.averageResponseTime || 0, { warning: 2000, critical: 5000 })}`}>
            {(metrics.averageResponseTime || 0).toFixed(0)}ms
          </p>
          <p className="text-sm text-gray-500">Promedio API</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Memoria</h3>
          <p className="text-3xl font-bold text-purple-600">
            {metrics.memoryUsage ? 
              `${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 
              'N/A'
            }
          </p>
          <p className="text-sm text-gray-500">Heap utilizado</p>
        </div>
      </div>

      {/* Gráficos de errores */}
      {metrics.errors && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Errores por Categoría</h3>
            <div className="space-y-2">
              {Object.entries(metrics.errors.byCategory || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Errores</h3>
            <div className="space-y-2">
              {(metrics.errors.topErrors || []).slice(0, 5).map((error, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{error.type}</span>
                  <span className="font-semibold text-red-600">{error.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controles de filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="ALL">Todas</option>
                {Object.values(LOG_CATEGORIES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="ALL">Todos</option>
                {Object.keys(LOG_LEVELS).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Exportar Logs
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Limpiar Logs
            </button>
          </div>
        </div>
      </div>

      {/* Logs en tiempo real */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">
            Logs en Tiempo Real ({logs.length})
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay logs para mostrar con los filtros seleccionados
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <div key={log.id || index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.levelName}
                        </span>
                        <span className="text-xs text-gray-500">{log.category}</span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {log.correlationId && (
                          <span className="text-xs text-blue-500">
                            {log.correlationId.slice(-8)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mb-1">{log.message}</p>
                      {log.data && Object.keys(log.data).length > 0 && (
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer hover:text-gray-800">
                            Ver detalles
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
