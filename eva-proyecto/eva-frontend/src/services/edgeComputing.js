/**
 * Edge Computing Integration - Sistema EVA
 * 
 * Características:
 * - Edge workers para procesamiento distribuido
 * - CDN edge locations con geo-routing
 * - Edge caching con invalidación inteligente
 * - Compute at edge para reducir latencia
 * - Edge analytics y real-time processing
 * - Auto-scaling basado en ubicación geográfica
 */

import logger, { LOG_CATEGORIES } from '../utils/logger.js';
import smartCache from '../utils/smartCache.js';

// Regiones edge disponibles
export const EDGE_REGIONS = {
  US_EAST: {
    id: 'us-east-1',
    name: 'US East (Virginia)',
    location: { lat: 38.9072, lng: -77.0369 },
    endpoints: ['https://us-east.eva-edge.com'],
    capabilities: ['compute', 'storage', 'analytics']
  },
  US_WEST: {
    id: 'us-west-1',
    name: 'US West (California)',
    location: { lat: 37.7749, lng: -122.4194 },
    endpoints: ['https://us-west.eva-edge.com'],
    capabilities: ['compute', 'storage', 'analytics']
  },
  EU_CENTRAL: {
    id: 'eu-central-1',
    name: 'EU Central (Frankfurt)',
    location: { lat: 50.1109, lng: 8.6821 },
    endpoints: ['https://eu-central.eva-edge.com'],
    capabilities: ['compute', 'storage', 'analytics', 'gdpr']
  },
  ASIA_PACIFIC: {
    id: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    location: { lat: 1.3521, lng: 103.8198 },
    endpoints: ['https://ap-southeast.eva-edge.com'],
    capabilities: ['compute', 'storage', 'analytics']
  },
  LATAM: {
    id: 'sa-east-1',
    name: 'South America (São Paulo)',
    location: { lat: -23.5505, lng: -46.6333 },
    endpoints: ['https://sa-east.eva-edge.com'],
    capabilities: ['compute', 'storage']
  }
};

// Tipos de edge workers
export const WORKER_TYPES = {
  COMPUTE: 'compute',
  ANALYTICS: 'analytics',
  CACHE: 'cache',
  SECURITY: 'security',
  TRANSFORM: 'transform'
};

class EdgeComputing {
  constructor(config = {}) {
    this.config = {
      // Configuración de edge
      enableEdgeComputing: true,
      enableGeoRouting: true,
      enableEdgeCache: true,
      enableEdgeAnalytics: true,

      // Configuración de workers
      maxWorkers: 10,
      workerTimeout: 30000,
      enableAutoScaling: true,

      // Configuración de cache
      edgeCacheTTL: 300000, // 5 minutos
      enableIntelligentInvalidation: true,

      // Configuración de routing
      routingStrategy: 'latency', // latency, geographic, load
      fallbackRegion: 'us-east-1',

      ...config
    };

    // Estado del edge computing
    this.currentRegion = null;
    this.availableRegions = new Map();
    this.activeWorkers = new Map();
    this.edgeCache = new Map();
    this.userLocation = null;

    // Métricas
    this.metrics = {
      totalRequests: 0,
      edgeHits: 0,
      edgeMisses: 0,
      averageLatency: 0,
      workersExecuted: 0,
      cacheInvalidations: 0,
      regionSwitches: 0,
      dataTransferred: 0
    };

    this.initializeEdgeComputing();
  }

  /**
   * Inicializar edge computing
   */
  async initializeEdgeComputing() {
    if (!this.config.enableEdgeComputing) {
      logger.info(LOG_CATEGORIES.NETWORK, 'Edge computing disabled');
      return;
    }

    logger.info(LOG_CATEGORIES.NETWORK, 'Initializing edge computing', {
      geoRouting: this.config.enableGeoRouting,
      edgeCache: this.config.enableEdgeCache,
      autoScaling: this.config.enableAutoScaling
    });

    // Detectar ubicación del usuario
    await this.detectUserLocation();

    // Inicializar regiones edge
    await this.initializeEdgeRegions();

    // Seleccionar región óptima
    await this.selectOptimalRegion();

    // Configurar edge cache
    if (this.config.enableEdgeCache) {
      this.setupEdgeCache();
    }

    // Configurar edge analytics
    if (this.config.enableEdgeAnalytics) {
      this.setupEdgeAnalytics();
    }

    // Configurar auto-scaling
    if (this.config.enableAutoScaling) {
      this.setupAutoScaling();
    }
  }

  /**
   * Detectar ubicación del usuario
   */
  async detectUserLocation() {
    try {
      // Intentar geolocalización del navegador
      if ('geolocation' in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });

        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps'
        };

        logger.debug(LOG_CATEGORIES.NETWORK, 'User location detected via GPS', {
          location: this.userLocation
        });

        return;
      }
    } catch (error) {
      logger.debug(LOG_CATEGORIES.NETWORK, 'GPS location failed, using IP geolocation');
    }

    try {
      // Fallback a geolocalización por IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      this.userLocation = {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        country: data.country_name,
        source: 'ip'
      };

      logger.debug(LOG_CATEGORIES.NETWORK, 'User location detected via IP', {
        location: this.userLocation
      });

    } catch (error) {
      logger.warn(LOG_CATEGORIES.NETWORK, 'Failed to detect user location', {
        error: error.message
      });

      // Usar ubicación por defecto
      this.userLocation = {
        lat: 40.7128,
        lng: -74.0060,
        city: 'New York',
        country: 'United States',
        source: 'default'
      };
    }
  }

  /**
   * Inicializar regiones edge
   */
  async initializeEdgeRegions() {
    const regionPromises = Object.values(EDGE_REGIONS).map(async (region) => {
      try {
        const health = await this.checkRegionHealth(region);
        this.availableRegions.set(region.id, {
          ...region,
          health,
          latency: health.latency,
          available: health.status === 'healthy'
        });

        logger.debug(LOG_CATEGORIES.NETWORK, 'Edge region initialized', {
          regionId: region.id,
          health: health.status,
          latency: health.latency
        });

      } catch (error) {
        logger.warn(LOG_CATEGORIES.NETWORK, 'Failed to initialize edge region', {
          regionId: region.id,
          error: error.message
        });
      }
    });

    await Promise.allSettled(regionPromises);

    logger.info(LOG_CATEGORIES.NETWORK, 'Edge regions initialized', {
      totalRegions: Object.keys(EDGE_REGIONS).length,
      availableRegions: this.availableRegions.size
    });
  }

  /**
   * Verificar salud de región
   */
  async checkRegionHealth(region) {
    const startTime = performance.now();

    try {
      const response = await fetch(`${region.endpoints[0]}/health`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      const latency = performance.now() - startTime;

      return {
        status: response.ok ? 'healthy' : 'degraded',
        latency,
        timestamp: Date.now()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Infinity,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  /**
   * Seleccionar región óptima (Optimizado con cache y algoritmo mejorado)
   */
  async selectOptimalRegion() {
    if (!this.userLocation || this.availableRegions.size === 0) {
      this.currentRegion = this.config.fallbackRegion;
      return;
    }

    // Optimización: Cache de selección de región
    const cacheKey = this.generateRegionCacheKey();
    if (this.regionSelectionCache && this.regionSelectionCache.key === cacheKey) {
      const cacheAge = Date.now() - this.regionSelectionCache.timestamp;
      if (cacheAge < 30000) { // Cache válido por 30 segundos
        this.currentRegion = this.regionSelectionCache.region;
        return;
      }
    }

    let optimalRegion = null;
    let bestScore = Infinity;

    // Optimización: Pre-filtrar regiones disponibles
    const availableRegions = Array.from(this.availableRegions.entries())
      .filter(([_, region]) => region.available);

    if (availableRegions.length === 0) {
      this.currentRegion = this.config.fallbackRegion;
      return;
    }

    // Optimización: Paralelizar cálculo de scores para regiones
    const scorePromises = availableRegions.map(async ([regionId, region]) => {
      const score = await this.calculateRegionScoreAdvanced(region);
      return { regionId, score };
    });

    const scores = await Promise.all(scorePromises);

    // Encontrar la mejor región
    for (const { regionId, score } of scores) {
      if (score < bestScore) {
        bestScore = score;
        optimalRegion = regionId;
      }
    }

    // Optimización: Guardar en cache
    this.regionSelectionCache = {
      key: cacheKey,
      region: optimalRegion,
      timestamp: Date.now(),
      score: bestScore
    };

    if (optimalRegion && optimalRegion !== this.currentRegion) {
      const previousRegion = this.currentRegion;
      this.currentRegion = optimalRegion;
      this.metrics.regionSwitches++;

      logger.info(LOG_CATEGORIES.NETWORK, 'Optimal edge region selected', {
        previousRegion,
        currentRegion: this.currentRegion,
        score: bestScore.toFixed(3),
        strategy: this.config.routingStrategy,
        cached: false
      });
    }
  }

  /**
   * Generar clave de cache para selección de región (Optimización)
   */
  generateRegionCacheKey() {
    const userLocationKey = this.userLocation ?
      `${this.userLocation.lat.toFixed(2)},${this.userLocation.lng.toFixed(2)}` :
      'unknown';

    const availableRegionsKey = Array.from(this.availableRegions.entries())
      .filter(([_, region]) => region.available)
      .map(([id, region]) => `${id}:${region.latency.toFixed(0)}`)
      .sort()
      .join('|');

    return `${userLocationKey}_${availableRegionsKey}_${this.config.routingStrategy}`;
  }

  /**
   * Calcular score de región avanzado (Optimizado)
   */
  async calculateRegionScoreAdvanced(region) {
    // Optimización: Memoización de cálculos costosos
    const memoKey = `score_${region.id}_${Math.floor(Date.now() / 60000)}`; // Cache por minuto
    if (this.scoreCache && this.scoreCache[memoKey]) {
      return this.scoreCache[memoKey];
    }

    const weights = this.getStrategyWeights();

    // Factor de distancia geográfica (optimizado)
    const distance = this.userLocation ?
      this.calculateDistanceOptimized(this.userLocation, region.location) : 0;
    const normalizedDistance = Math.min(distance / 20000, 1);

    // Factor de latencia con historial
    const latencyScore = this.calculateLatencyScore(region);

    // Factor de carga con predicción
    const loadScore = this.calculateLoadScore(region);

    // Factor de disponibilidad histórica
    const availabilityScore = this.calculateAvailabilityScore(region);

    // Combinar factores con pesos dinámicos
    const score = (normalizedDistance * weights.distance) +
      (latencyScore * weights.latency) +
      (loadScore * weights.load) +
      (availabilityScore * weights.availability);

    // Optimización: Guardar en cache
    if (!this.scoreCache) this.scoreCache = {};
    this.scoreCache[memoKey] = score;

    // Limpiar cache antiguo periódicamente
    if (Math.random() < 0.1) { // 10% de probabilidad
      this.cleanupScoreCache();
    }

    return score;
  }

  /**
   * Obtener pesos de estrategia (Optimización)
   */
  getStrategyWeights() {
    const baseWeights = {
      distance: 0.3,
      latency: 0.4,
      load: 0.2,
      availability: 0.1
    };

    // Ajustar pesos según estrategia
    switch (this.config.routingStrategy) {
      case 'latency':
        return { ...baseWeights, latency: 0.6, distance: 0.2 };
      case 'geographic':
        return { ...baseWeights, distance: 0.6, latency: 0.2 };
      case 'load':
        return { ...baseWeights, load: 0.5, latency: 0.3 };
      default:
        return baseWeights;
    }
  }

  /**
   * Calcular distancia optimizada (Optimización con lookup table)
   */
  calculateDistanceOptimized(point1, point2) {
    // Optimización: Cache de distancias calculadas
    const cacheKey = `${point1.lat.toFixed(2)},${point1.lng.toFixed(2)}_${point2.lat.toFixed(2)},${point2.lng.toFixed(2)}`;

    if (!this.distanceCache) {
      this.distanceCache = new Map();
    }

    if (this.distanceCache.has(cacheKey)) {
      return this.distanceCache.get(cacheKey);
    }

    const distance = this.calculateDistance(point1, point2);

    // Mantener cache limitado
    if (this.distanceCache.size > 100) {
      const firstKey = this.distanceCache.keys().next().value;
      this.distanceCache.delete(firstKey);
    }

    this.distanceCache.set(cacheKey, distance);
    return distance;
  }

  /**
   * Calcular distancia entre dos puntos
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convertir grados a radianes
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Ejecutar edge worker
   */
  async executeEdgeWorker(workerType, payload, options = {}) {
    const {
      timeout = this.config.workerTimeout,
      region = this.currentRegion,
      priority = 'normal'
    } = options;

    const workerId = this.generateWorkerId();
    const startTime = performance.now();

    try {
      const worker = {
        id: workerId,
        type: workerType,
        region,
        startTime,
        priority,
        payload
      };

      this.activeWorkers.set(workerId, worker);

      // Ejecutar worker en edge
      const result = await this.runWorkerAtEdge(worker, timeout);

      const executionTime = performance.now() - startTime;
      this.metrics.workersExecuted++;

      logger.debug(LOG_CATEGORIES.NETWORK, 'Edge worker executed successfully', {
        workerId,
        type: workerType,
        region,
        executionTime
      });

      return result;

    } catch (error) {
      logger.error(LOG_CATEGORIES.NETWORK, 'Edge worker execution failed', {
        workerId,
        type: workerType,
        error: error.message
      });
      throw error;

    } finally {
      this.activeWorkers.delete(workerId);
    }
  }

  /**
   * Ejecutar worker en edge
   */
  async runWorkerAtEdge(worker, timeout) {
    const region = this.availableRegions.get(worker.region);
    if (!region) {
      throw new Error(`Edge region ${worker.region} not available`);
    }

    // Simular ejecución en edge
    switch (worker.type) {
      case WORKER_TYPES.COMPUTE:
        return await this.executeComputeWorker(worker, region);

      case WORKER_TYPES.ANALYTICS:
        return await this.executeAnalyticsWorker(worker, region);

      case WORKER_TYPES.CACHE:
        return await this.executeCacheWorker(worker, region);

      case WORKER_TYPES.SECURITY:
        return await this.executeSecurityWorker(worker, region);

      case WORKER_TYPES.TRANSFORM:
        return await this.executeTransformWorker(worker, region);

      default:
        throw new Error(`Unknown worker type: ${worker.type}`);
    }
  }

  /**
   * Ejecutar compute worker
   */
  async executeComputeWorker(worker, region) {
    // Simular procesamiento computacional en edge
    const { operation, data } = worker.payload;

    // Simular latencia de edge computing
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      workerId: worker.id,
      result: `Computed ${operation} on ${data?.length || 0} items`,
      region: region.id,
      executedAt: Date.now(),
      computeTime: 50
    };
  }

  /**
   * Ejecutar analytics worker
   */
  async executeAnalyticsWorker(worker, region) {
    // Simular analytics en edge
    const { events, metrics } = worker.payload;

    await new Promise(resolve => setTimeout(resolve, 30));

    return {
      workerId: worker.id,
      processedEvents: events?.length || 0,
      aggregatedMetrics: metrics || {},
      region: region.id,
      processedAt: Date.now()
    };
  }

  /**
   * Configurar edge cache
   */
  setupEdgeCache() {
    // Configurar invalidación inteligente
    if (this.config.enableIntelligentInvalidation) {
      this.setupIntelligentInvalidation();
    }

    logger.debug(LOG_CATEGORIES.NETWORK, 'Edge cache configured', {
      ttl: this.config.edgeCacheTTL,
      intelligentInvalidation: this.config.enableIntelligentInvalidation
    });
  }

  /**
   * Configurar invalidación inteligente
   */
  setupIntelligentInvalidation() {
    // Monitorear patrones de acceso para invalidación predictiva
    setInterval(() => {
      this.analyzeAccessPatterns();
    }, 60000); // Cada minuto
  }

  /**
   * Analizar patrones de acceso
   */
  analyzeAccessPatterns() {
    // Simular análisis de patrones para invalidación inteligente
    const now = Date.now();
    const expiredEntries = [];

    for (const [key, entry] of this.edgeCache.entries()) {
      if (now - entry.lastAccessed > this.config.edgeCacheTTL) {
        expiredEntries.push(key);
      }
    }

    // Invalidar entradas expiradas
    expiredEntries.forEach(key => {
      this.edgeCache.delete(key);
      this.metrics.cacheInvalidations++;
    });

    if (expiredEntries.length > 0) {
      logger.debug(LOG_CATEGORIES.NETWORK, 'Edge cache entries invalidated', {
        count: expiredEntries.length
      });
    }
  }

  /**
   * Configurar edge analytics
   */
  setupEdgeAnalytics() {
    // Configurar recolección de métricas en edge
    setInterval(() => {
      this.collectEdgeMetrics();
    }, 30000); // Cada 30 segundos
  }

  /**
   * Recopilar métricas de edge
   */
  async collectEdgeMetrics() {
    const metrics = {
      timestamp: Date.now(),
      region: this.currentRegion,
      activeWorkers: this.activeWorkers.size,
      cacheSize: this.edgeCache.size,
      userLocation: this.userLocation,
      performance: {
        averageLatency: this.metrics.averageLatency,
        edgeHitRate: this.getEdgeHitRate(),
        workersPerMinute: this.getWorkersPerMinute()
      }
    };

    // Enviar métricas a edge analytics
    await this.sendEdgeMetrics(metrics);
  }

  /**
   * Configurar auto-scaling
   */
  setupAutoScaling() {
    setInterval(() => {
      this.evaluateAutoScaling();
    }, 60000); // Cada minuto
  }

  /**
   * Evaluar auto-scaling
   */
  evaluateAutoScaling() {
    const currentLoad = this.activeWorkers.size;
    const maxWorkers = this.config.maxWorkers;
    const utilizationRate = currentLoad / maxWorkers;

    if (utilizationRate > 0.8) {
      // Alta utilización - escalar hacia arriba
      this.scaleUp();
    } else if (utilizationRate < 0.3) {
      // Baja utilización - escalar hacia abajo
      this.scaleDown();
    }
  }

  /**
   * Escalar hacia arriba
   */
  scaleUp() {
    this.config.maxWorkers = Math.min(this.config.maxWorkers * 1.5, 50);

    logger.info(LOG_CATEGORIES.NETWORK, 'Edge workers scaled up', {
      newMaxWorkers: this.config.maxWorkers
    });
  }

  /**
   * Escalar hacia abajo
   */
  scaleDown() {
    this.config.maxWorkers = Math.max(this.config.maxWorkers * 0.8, 5);

    logger.info(LOG_CATEGORIES.NETWORK, 'Edge workers scaled down', {
      newMaxWorkers: this.config.maxWorkers
    });
  }

  // Métodos auxiliares
  generateWorkerId() {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getEdgeHitRate() {
    const total = this.metrics.edgeHits + this.metrics.edgeMisses;
    return total > 0 ? (this.metrics.edgeHits / total) * 100 : 0;
  }

  getWorkersPerMinute() {
    // Simplificado - en implementación real sería más sofisticado
    return this.metrics.workersExecuted;
  }

  async sendEdgeMetrics(metrics) {
    // Simular envío de métricas
    logger.debug(LOG_CATEGORIES.NETWORK, 'Edge metrics collected', metrics);
  }

  /**
   * Obtener métricas
   */
  getMetrics() {
    return {
      ...this.metrics,
      currentRegion: this.currentRegion,
      availableRegions: this.availableRegions.size,
      activeWorkers: this.activeWorkers.size,
      edgeCacheSize: this.edgeCache.size,
      edgeHitRate: this.getEdgeHitRate(),
      userLocation: this.userLocation
    };
  }

  /**
   * Calcular score de latencia con historial (Optimización)
   */
  calculateLatencyScore(region) {
    if (!this.latencyHistory) {
      this.latencyHistory = new Map();
    }

    const regionHistory = this.latencyHistory.get(region.id) || [];
    regionHistory.push(region.latency);

    // Mantener solo últimas 20 mediciones
    if (regionHistory.length > 20) {
      regionHistory.shift();
    }

    this.latencyHistory.set(region.id, regionHistory);

    // Calcular latencia promedio ponderada (más peso a mediciones recientes)
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < regionHistory.length; i++) {
      const weight = Math.pow(0.9, regionHistory.length - 1 - i); // Decay exponencial
      weightedSum += regionHistory[i] * weight;
      totalWeight += weight;
    }

    const avgLatency = totalWeight > 0 ? weightedSum / totalWeight : region.latency;
    return Math.min(avgLatency / 1000, 1); // Normalizar a 0-1
  }

  /**
   * Calcular score de carga con predicción (Optimización)
   */
  calculateLoadScore(region) {
    const currentLoad = region.load || 0;

    // Predicción simple basada en tendencia
    if (!this.loadHistory) {
      this.loadHistory = new Map();
    }

    const regionLoadHistory = this.loadHistory.get(region.id) || [];
    regionLoadHistory.push(currentLoad);

    if (regionLoadHistory.length > 10) {
      regionLoadHistory.shift();
    }

    this.loadHistory.set(region.id, regionLoadHistory);

    // Calcular tendencia
    let predictedLoad = currentLoad;
    if (regionLoadHistory.length >= 3) {
      const recent = regionLoadHistory.slice(-3);
      const trend = (recent[2] - recent[0]) / 2; // Tendencia simple
      predictedLoad = Math.max(0, Math.min(100, currentLoad + trend));
    }

    return predictedLoad / 100; // Normalizar a 0-1
  }

  /**
   * Calcular score de disponibilidad (Optimización)
   */
  calculateAvailabilityScore(region) {
    if (!this.availabilityHistory) {
      this.availabilityHistory = new Map();
    }

    const regionAvailability = this.availabilityHistory.get(region.id) || [];
    const isHealthy = region.available ? 1 : 0;

    regionAvailability.push(isHealthy);

    if (regionAvailability.length > 100) {
      regionAvailability.shift();
    }

    this.availabilityHistory.set(region.id, regionAvailability);

    // Calcular disponibilidad promedio
    const availability = regionAvailability.length > 0 ?
      regionAvailability.reduce((sum, val) => sum + val, 0) / regionAvailability.length :
      1;

    return 1 - availability; // Invertir para que menor score sea mejor
  }

  /**
   * Limpiar cache de scores (Optimización de memoria)
   */
  cleanupScoreCache() {
    if (!this.scoreCache) return;

    const currentMinute = Math.floor(Date.now() / 60000);
    const cutoffMinute = currentMinute - 5; // Mantener últimos 5 minutos

    Object.keys(this.scoreCache).forEach(key => {
      const keyParts = key.split('_');
      const keyMinute = parseInt(keyParts[keyParts.length - 1]);
      if (keyMinute < cutoffMinute) {
        delete this.scoreCache[key];
      }
    });
  }

  /**
   * Obtener estado de salud (Optimizado)
   */
  getHealthStatus() {
    const region = this.availableRegions.get(this.currentRegion);
    const utilization = (this.activeWorkers.size / this.config.maxWorkers) * 100;

    // Optimización: Cache del estado de salud
    const now = Date.now();
    if (this.healthStatusCache && (now - this.healthStatusCache.timestamp) < 5000) {
      return this.healthStatusCache.status;
    }

    const status = {
      status: region?.available ? 'healthy' : 'degraded',
      currentRegion: this.currentRegion,
      regionLatency: region?.latency || 0,
      activeWorkers: this.activeWorkers.size,
      maxWorkers: this.config.maxWorkers,
      utilization: utilization.toFixed(1),
      edgeHitRate: this.getEdgeHitRate().toFixed(1),
      availableRegions: Array.from(this.availableRegions.values())
        .filter(r => r.available).length,
      totalRegions: this.availableRegions.size,
      features: {
        geoRouting: this.config.enableGeoRouting,
        edgeCache: this.config.enableEdgeCache,
        autoScaling: this.config.enableAutoScaling,
        analytics: this.config.enableEdgeAnalytics
      },
      performance: {
        cacheHitRate: this.getEdgeHitRate(),
        averageLatency: this.calculateAverageLatency(),
        regionSwitches: this.metrics.regionSwitches
      }
    };

    // Determinar estado general
    if (utilization > 90) status.status = 'degraded';
    if (!region?.available || this.getHealthyRegions().length < 2) status.status = 'unhealthy';

    // Cache del estado
    this.healthStatusCache = {
      status,
      timestamp: now
    };

    return status;
  }

  /**
   * Calcular latencia promedio (Optimización)
   */
  calculateAverageLatency() {
    const healthyRegions = this.getHealthyRegions();
    if (healthyRegions.length === 0) return 0;

    const totalLatency = healthyRegions.reduce((sum, region) => sum + region.latency, 0);
    return (totalLatency / healthyRegions.length).toFixed(1);
  }
}

// Instancia singleton
const edgeComputing = new EdgeComputing();

export default edgeComputing;
export { EdgeComputing, EDGE_REGIONS, WORKER_TYPES };
