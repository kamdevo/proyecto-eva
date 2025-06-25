/**
 * Sistema de Cache Inteligente - Sistema EVA
 * 
 * Características:
 * - Cache multi-nivel (memoria, localStorage, sessionStorage)
 * - Invalidación automática e inteligente
 * - Compresión de datos
 * - Métricas de performance
 * - Estrategias de expiración
 * - Cache warming
 * - Sincronización entre pestañas
 */

import logger, { LOG_CATEGORIES } from './logger.js';

// Estrategias de cache
export const CACHE_STRATEGIES = {
  LRU: 'LRU',                    // Least Recently Used
  LFU: 'LFU',                    // Least Frequently Used
  FIFO: 'FIFO',                  // First In, First Out
  TTL: 'TTL',                    // Time To Live
  ADAPTIVE: 'ADAPTIVE'           // Adaptativo basado en patrones
};

// Niveles de cache
export const CACHE_LEVELS = {
  MEMORY: 'MEMORY',              // Cache en memoria (más rápido)
  SESSION: 'SESSION',            // sessionStorage
  LOCAL: 'LOCAL',                // localStorage
  INDEXED_DB: 'INDEXED_DB'       // IndexedDB para datos grandes
};

// Configuración por defecto
const DEFAULT_CONFIG = {
  strategy: CACHE_STRATEGIES.ADAPTIVE,
  levels: [CACHE_LEVELS.MEMORY, CACHE_LEVELS.SESSION],
  maxMemorySize: 50 * 1024 * 1024,    // 50MB
  maxLocalSize: 100 * 1024 * 1024,    // 100MB
  defaultTTL: 5 * 60 * 1000,          // 5 minutos
  compressionThreshold: 1024,          // 1KB
  enableMetrics: true,
  enableSyncAcrossTabs: true,
  warmupKeys: []                       // Keys para pre-cargar
};

class SmartCache {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Stores por nivel
    this.memoryStore = new Map();
    this.accessTimes = new Map();
    this.accessCounts = new Map();
    this.compressionMap = new Map();
    
    // Métricas
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      compressionSavings: 0,
      totalSize: 0,
      averageAccessTime: 0
    };
    
    // Patrones de acceso para cache adaptativo
    this.accessPatterns = new Map();
    this.popularKeys = new Set();
    
    this.initializeCache();
  }

  /**
   * Inicializar cache
   */
  initializeCache() {
    // Configurar limpieza periódica
    this.setupPeriodicCleanup();
    
    // Configurar sincronización entre pestañas
    if (this.config.enableSyncAcrossTabs) {
      this.setupTabSync();
    }
    
    // Pre-cargar keys importantes
    this.warmupCache();
    
    // Configurar listeners de memoria
    this.setupMemoryMonitoring();
    
    logger.info(LOG_CATEGORIES.SYSTEM, 'Smart cache initialized', {
      strategy: this.config.strategy,
      levels: this.config.levels,
      maxMemorySize: this.config.maxMemorySize
    });
  }

  /**
   * Obtener valor del cache
   */
  async get(key, options = {}) {
    const startTime = performance.now();
    
    try {
      // Buscar en niveles de cache en orden de prioridad
      for (const level of this.config.levels) {
        const result = await this.getFromLevel(key, level);
        
        if (result !== null) {
          // Actualizar estadísticas de acceso
          this.updateAccessStats(key);
          
          // Promover a niveles superiores si es necesario
          await this.promoteToHigherLevels(key, result, level);
          
          this.metrics.hits++;
          this.updateAccessTime(performance.now() - startTime);
          
          logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Cache hit', {
            key,
            level,
            accessTime: performance.now() - startTime
          });
          
          return this.deserializeValue(result);
        }
      }
      
      // Cache miss
      this.metrics.misses++;
      this.updateAccessTime(performance.now() - startTime);
      
      logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Cache miss', {
        key,
        accessTime: performance.now() - startTime
      });
      
      return null;
      
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Cache get error', {
        key,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Establecer valor en cache
   */
  async set(key, value, options = {}) {
    const startTime = performance.now();
    
    try {
      const ttl = options.ttl || this.config.defaultTTL;
      const levels = options.levels || this.config.levels;
      const compress = options.compress !== false;
      
      const serializedValue = this.serializeValue(value, ttl, compress);
      
      // Guardar en niveles especificados
      for (const level of levels) {
        await this.setInLevel(key, serializedValue, level, ttl);
      }
      
      // Actualizar estadísticas
      this.updateAccessStats(key);
      this.metrics.sets++;
      
      // Verificar límites de memoria
      await this.enforceMemoryLimits();
      
      logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Cache set', {
        key,
        levels,
        ttl,
        size: this.getValueSize(serializedValue),
        accessTime: performance.now() - startTime
      });
      
      return true;
      
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Cache set error', {
        key,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Eliminar del cache
   */
  async delete(key) {
    try {
      let deleted = false;
      
      // Eliminar de todos los niveles
      for (const level of Object.values(CACHE_LEVELS)) {
        if (await this.deleteFromLevel(key, level)) {
          deleted = true;
        }
      }
      
      // Limpiar estadísticas
      this.accessTimes.delete(key);
      this.accessCounts.delete(key);
      this.accessPatterns.delete(key);
      this.popularKeys.delete(key);
      this.compressionMap.delete(key);
      
      if (deleted) {
        this.metrics.deletes++;
        logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Cache delete', { key });
      }
      
      return deleted;
      
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Cache delete error', {
        key,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Limpiar cache
   */
  async clear(level = null) {
    try {
      const levelsToClean = level ? [level] : Object.values(CACHE_LEVELS);
      
      for (const cacheLevel of levelsToClean) {
        await this.clearLevel(cacheLevel);
      }
      
      // Resetear estadísticas si se limpia todo
      if (!level) {
        this.accessTimes.clear();
        this.accessCounts.clear();
        this.accessPatterns.clear();
        this.popularKeys.clear();
        this.compressionMap.clear();
        this.resetMetrics();
      }
      
      logger.info(LOG_CATEGORIES.SYSTEM, 'Cache cleared', { level });
      return true;
      
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Cache clear error', {
        level,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Obtener de nivel específico
   */
  async getFromLevel(key, level) {
    switch (level) {
      case CACHE_LEVELS.MEMORY:
        return this.memoryStore.get(key) || null;
        
      case CACHE_LEVELS.SESSION:
        try {
          const item = sessionStorage.getItem(`cache_${key}`);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
        
      case CACHE_LEVELS.LOCAL:
        try {
          const item = localStorage.getItem(`cache_${key}`);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
        
      case CACHE_LEVELS.INDEXED_DB:
        return await this.getFromIndexedDB(key);
        
      default:
        return null;
    }
  }

  /**
   * Establecer en nivel específico
   */
  async setInLevel(key, value, level, ttl) {
    const expiresAt = Date.now() + ttl;
    const cacheItem = {
      value,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 0
    };
    
    switch (level) {
      case CACHE_LEVELS.MEMORY:
        this.memoryStore.set(key, cacheItem);
        break;
        
      case CACHE_LEVELS.SESSION:
        try {
          sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        } catch (error) {
          // Storage lleno, limpiar items expirados
          await this.cleanupExpiredItems(CACHE_LEVELS.SESSION);
          sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        }
        break;
        
      case CACHE_LEVELS.LOCAL:
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        } catch (error) {
          // Storage lleno, limpiar items expirados
          await this.cleanupExpiredItems(CACHE_LEVELS.LOCAL);
          localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        }
        break;
        
      case CACHE_LEVELS.INDEXED_DB:
        await this.setInIndexedDB(key, cacheItem);
        break;
    }
  }

  /**
   * Serializar valor con compresión opcional
   */
  serializeValue(value, ttl, compress) {
    let serialized = JSON.stringify(value);
    
    if (compress && serialized.length > this.config.compressionThreshold) {
      try {
        // Simulación de compresión (en producción usar una librería real)
        const compressed = this.compressString(serialized);
        if (compressed.length < serialized.length) {
          this.metrics.compressionSavings += serialized.length - compressed.length;
          this.compressionMap.set(value, true);
          return compressed;
        }
      } catch (error) {
        logger.warn(LOG_CATEGORIES.PERFORMANCE, 'Compression failed', {
          error: error.message
        });
      }
    }
    
    return serialized;
  }

  /**
   * Deserializar valor
   */
  deserializeValue(cacheItem) {
    if (!cacheItem || !cacheItem.value) return null;
    
    // Verificar expiración
    if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
      return null;
    }
    
    try {
      let value = cacheItem.value;
      
      // Descomprimir si es necesario
      if (this.compressionMap.has(value)) {
        value = this.decompressString(value);
      }
      
      return JSON.parse(value);
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Deserialization error', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Actualizar estadísticas de acceso
   */
  updateAccessStats(key) {
    // Actualizar tiempo de último acceso
    this.accessTimes.set(key, Date.now());
    
    // Actualizar contador de accesos
    const currentCount = this.accessCounts.get(key) || 0;
    this.accessCounts.set(key, currentCount + 1);
    
    // Actualizar patrones de acceso
    this.updateAccessPatterns(key);
    
    // Marcar como popular si supera umbral
    if (currentCount > 10) {
      this.popularKeys.add(key);
    }
  }

  /**
   * Actualizar patrones de acceso
   */
  updateAccessPatterns(key) {
    const now = Date.now();
    const pattern = this.accessPatterns.get(key) || {
      accesses: [],
      frequency: 0,
      lastAccess: 0
    };
    
    pattern.accesses.push(now);
    pattern.lastAccess = now;
    pattern.frequency = pattern.accesses.length;
    
    // Mantener solo accesos de la última hora
    pattern.accesses = pattern.accesses.filter(
      time => now - time < 60 * 60 * 1000
    );
    
    this.accessPatterns.set(key, pattern);
  }

  /**
   * Promover a niveles superiores
   */
  async promoteToHigherLevels(key, value, currentLevel) {
    const levelPriority = {
      [CACHE_LEVELS.INDEXED_DB]: 0,
      [CACHE_LEVELS.LOCAL]: 1,
      [CACHE_LEVELS.SESSION]: 2,
      [CACHE_LEVELS.MEMORY]: 3
    };
    
    const currentPriority = levelPriority[currentLevel];
    
    // Solo promover si es un key popular
    if (this.popularKeys.has(key)) {
      for (const level of this.config.levels) {
        if (levelPriority[level] > currentPriority) {
          await this.setInLevel(key, value.value, level, 
            value.expiresAt - Date.now());
        }
      }
    }
  }

  /**
   * Aplicar límites de memoria
   */
  async enforceMemoryLimits() {
    const memorySize = this.getMemorySize();
    
    if (memorySize > this.config.maxMemorySize) {
      await this.evictItems(CACHE_LEVELS.MEMORY);
    }
  }

  /**
   * Evictar items según estrategia
   */
  async evictItems(level) {
    const itemsToEvict = this.selectItemsForEviction(level);
    
    for (const key of itemsToEvict) {
      await this.deleteFromLevel(key, level);
      this.metrics.evictions++;
    }
    
    logger.info(LOG_CATEGORIES.PERFORMANCE, 'Cache eviction', {
      level,
      evictedCount: itemsToEvict.length,
      strategy: this.config.strategy
    });
  }

  /**
   * Seleccionar items para evicción
   */
  selectItemsForEviction(level) {
    const keys = Array.from(this.memoryStore.keys());
    const evictCount = Math.ceil(keys.length * 0.1); // Evictar 10%
    
    switch (this.config.strategy) {
      case CACHE_STRATEGIES.LRU:
        return this.selectLRU(keys, evictCount);
        
      case CACHE_STRATEGIES.LFU:
        return this.selectLFU(keys, evictCount);
        
      case CACHE_STRATEGIES.FIFO:
        return this.selectFIFO(keys, evictCount);
        
      case CACHE_STRATEGIES.ADAPTIVE:
        return this.selectAdaptive(keys, evictCount);
        
      default:
        return keys.slice(0, evictCount);
    }
  }

  /**
   * Selección LRU (Least Recently Used)
   */
  selectLRU(keys, count) {
    return keys
      .sort((a, b) => (this.accessTimes.get(a) || 0) - (this.accessTimes.get(b) || 0))
      .slice(0, count);
  }

  /**
   * Selección LFU (Least Frequently Used)
   */
  selectLFU(keys, count) {
    return keys
      .sort((a, b) => (this.accessCounts.get(a) || 0) - (this.accessCounts.get(b) || 0))
      .slice(0, count);
  }

  /**
   * Selección FIFO (First In, First Out)
   */
  selectFIFO(keys, count) {
    return keys
      .sort((a, b) => {
        const itemA = this.memoryStore.get(a);
        const itemB = this.memoryStore.get(b);
        return (itemA?.createdAt || 0) - (itemB?.createdAt || 0);
      })
      .slice(0, count);
  }

  /**
   * Selección adaptativa
   */
  selectAdaptive(keys, count) {
    // Combinar LRU y LFU con peso hacia items menos populares
    return keys
      .filter(key => !this.popularKeys.has(key))
      .sort((a, b) => {
        const scoreA = this.calculateAdaptiveScore(a);
        const scoreB = this.calculateAdaptiveScore(b);
        return scoreA - scoreB;
      })
      .slice(0, count);
  }

  /**
   * Calcular score adaptativo
   */
  calculateAdaptiveScore(key) {
    const accessTime = this.accessTimes.get(key) || 0;
    const accessCount = this.accessCounts.get(key) || 0;
    const pattern = this.accessPatterns.get(key);
    
    let score = 0;
    
    // Penalizar por antigüedad
    score += (Date.now() - accessTime) / 1000;
    
    // Bonificar por frecuencia
    score -= accessCount * 10;
    
    // Bonificar por patrón de acceso regular
    if (pattern && pattern.accesses.length > 5) {
      const intervals = [];
      for (let i = 1; i < pattern.accesses.length; i++) {
        intervals.push(pattern.accesses[i] - pattern.accesses[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => 
        sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      // Menor varianza = patrón más regular = menor score (menos probable evicción)
      score += variance / 1000;
    }
    
    return score;
  }

  // Métodos auxiliares
  getMemorySize() {
    let size = 0;
    for (const [key, value] of this.memoryStore.entries()) {
      size += this.getValueSize(value) + key.length * 2; // UTF-16
    }
    return size;
  }

  getValueSize(value) {
    return JSON.stringify(value).length * 2; // UTF-16
  }

  updateAccessTime(time) {
    const currentAvg = this.metrics.averageAccessTime;
    const totalAccesses = this.metrics.hits + this.metrics.misses;
    this.metrics.averageAccessTime = 
      ((currentAvg * (totalAccesses - 1)) + time) / totalAccesses;
  }

  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      compressionSavings: 0,
      totalSize: 0,
      averageAccessTime: 0
    };
  }

  // Métodos de compresión simulados (usar librería real en producción)
  compressString(str) {
    // Simulación simple de compresión
    return btoa(str);
  }

  decompressString(compressed) {
    return atob(compressed);
  }

  // Configurar limpieza periódica
  setupPeriodicCleanup() {
    setInterval(() => {
      this.cleanupExpiredItems();
    }, 60000); // Cada minuto
  }

  // Limpiar items expirados
  async cleanupExpiredItems(level = null) {
    const levels = level ? [level] : this.config.levels;
    
    for (const cacheLevel of levels) {
      // Implementar limpieza específica por nivel
      if (cacheLevel === CACHE_LEVELS.MEMORY) {
        for (const [key, item] of this.memoryStore.entries()) {
          if (item.expiresAt && Date.now() > item.expiresAt) {
            this.memoryStore.delete(key);
          }
        }
      }
      // Implementar para otros niveles...
    }
  }

  // Configurar sincronización entre pestañas
  setupTabSync() {
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('cache_')) {
        const key = event.key.replace('cache_', '');
        if (event.newValue === null) {
          // Item eliminado en otra pestaña
          this.memoryStore.delete(key);
        }
      }
    });
  }

  // Pre-cargar cache
  async warmupCache() {
    for (const key of this.config.warmupKeys) {
      // Implementar lógica de warmup específica
      logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Cache warmup', { key });
    }
  }

  // Monitoreo de memoria
  setupMemoryMonitoring() {
    if (performance.memory) {
      setInterval(() => {
        const memInfo = performance.memory;
        if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
          logger.warn(LOG_CATEGORIES.PERFORMANCE, 'High memory usage detected', {
            used: memInfo.usedJSHeapSize,
            limit: memInfo.jsHeapSizeLimit
          });
          this.evictItems(CACHE_LEVELS.MEMORY);
        }
      }, 30000); // Cada 30 segundos
    }
  }

  // Métodos para IndexedDB (implementación básica)
  async getFromIndexedDB(key) {
    // Implementar acceso a IndexedDB
    return null;
  }

  async setInIndexedDB(key, value) {
    // Implementar escritura a IndexedDB
  }

  async deleteFromLevel(key, level) {
    switch (level) {
      case CACHE_LEVELS.MEMORY:
        return this.memoryStore.delete(key);
      case CACHE_LEVELS.SESSION:
        sessionStorage.removeItem(`cache_${key}`);
        return true;
      case CACHE_LEVELS.LOCAL:
        localStorage.removeItem(`cache_${key}`);
        return true;
      default:
        return false;
    }
  }

  async clearLevel(level) {
    switch (level) {
      case CACHE_LEVELS.MEMORY:
        this.memoryStore.clear();
        break;
      case CACHE_LEVELS.SESSION:
        Object.keys(sessionStorage)
          .filter(key => key.startsWith('cache_'))
          .forEach(key => sessionStorage.removeItem(key));
        break;
      case CACHE_LEVELS.LOCAL:
        Object.keys(localStorage)
          .filter(key => key.startsWith('cache_'))
          .forEach(key => localStorage.removeItem(key));
        break;
    }
  }

  /**
   * Obtener métricas del cache
   */
  getMetrics() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    return {
      ...this.metrics,
      hitRate: hitRate.toFixed(2),
      memorySize: this.getMemorySize(),
      itemCount: this.memoryStore.size,
      popularKeysCount: this.popularKeys.size,
      strategy: this.config.strategy,
      levels: this.config.levels
    };
  }
}

// Instancia singleton
const smartCache = new SmartCache();

export default smartCache;
export { CACHE_STRATEGIES, CACHE_LEVELS, SmartCache };
