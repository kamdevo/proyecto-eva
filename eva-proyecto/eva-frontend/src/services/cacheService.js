/**
 * ========================================
 * SERVICIO DE CACHÉ OPTIMIZADO
 * ========================================
 *
 * Sistema de caché inteligente para optimizar consultas de tickets
 * Incluye TTL, invalidación automática y compresión
 */

class CacheService {
  constructor(options = {}) {
    this.cache = new Map();
    this.timers = new Map();
    this.accessTimes = new Map();
    
    // Configuración por defecto
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxSize: 100, // Máximo 100 entradas
      cleanupInterval: 60 * 1000, // Limpiar cada minuto
      compressionThreshold: 1024, // Comprimir si es mayor a 1KB
      enableCompression: true,
      enableMetrics: true,
      ...options,
    };

    // Métricas
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      compressions: 0,
    };

    // Iniciar limpieza automática
    this.startCleanupTimer();
  }

  /**
   * Generar clave de caché
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Comprimir datos si es necesario
   */
  compress(data) {
    if (!this.config.enableCompression) return data;
    
    const serialized = JSON.stringify(data);
    if (serialized.length > this.config.compressionThreshold) {
      try {
        // Simulación de compresión (en producción usar una librería real)
        const compressed = {
          __compressed: true,
          data: btoa(serialized), // Base64 como ejemplo
          originalSize: serialized.length,
        };
        
        if (this.config.enableMetrics) {
          this.metrics.compressions++;
        }
        
        return compressed;
      } catch (error) {
        console.warn('Error comprimiendo datos:', error);
        return data;
      }
    }
    
    return data;
  }

  /**
   * Descomprimir datos si es necesario
   */
  decompress(data) {
    if (!data || typeof data !== 'object' || !data.__compressed) {
      return data;
    }
    
    try {
      const decompressed = JSON.parse(atob(data.data));
      return decompressed;
    } catch (error) {
      console.warn('Error descomprimiendo datos:', error);
      return null;
    }
  }

  /**
   * Obtener valor del caché
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.config.enableMetrics) {
        this.metrics.misses++;
      }
      return null;
    }

    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      if (this.config.enableMetrics) {
        this.metrics.misses++;
      }
      return null;
    }

    // Actualizar tiempo de acceso
    this.accessTimes.set(key, Date.now());
    
    if (this.config.enableMetrics) {
      this.metrics.hits++;
    }

    // Descomprimir si es necesario
    return this.decompress(entry.data);
  }

  /**
   * Establecer valor en el caché
   */
  set(key, value, ttl = this.config.defaultTTL) {
    // Verificar límite de tamaño
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    // Comprimir datos
    const compressedData = this.compress(value);
    
    const entry = {
      data: compressedData,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      ttl,
      size: this.calculateSize(compressedData),
    };

    // Limpiar timer anterior si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Establecer nuevo timer de expiración
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.cache.set(key, entry);
    this.timers.set(key, timer);
    this.accessTimes.set(key, Date.now());

    if (this.config.enableMetrics) {
      this.metrics.sets++;
    }

    return true;
  }

  /**
   * Eliminar entrada del caché
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    this.accessTimes.delete(key);

    if (deleted && this.config.enableMetrics) {
      this.metrics.deletes++;
    }

    return deleted;
  }

  /**
   * Verificar si existe una clave
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    // Limpiar todos los timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    this.accessTimes.clear();
    
    // Resetear métricas
    if (this.config.enableMetrics) {
      this.metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        evictions: 0,
        compressions: 0,
      };
    }
  }

  /**
   * Invalidar entradas por patrón
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Evicción LRU (Least Recently Used)
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
      if (this.config.enableMetrics) {
        this.metrics.evictions++;
      }
    }
  }

  /**
   * Calcular tamaño aproximado de los datos
   */
  calculateSize(data) {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }

  /**
   * Iniciar timer de limpieza automática
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;
    
    let totalSize = 0;
    let compressedEntries = 0;
    
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
      if (entry.data && entry.data.__compressed) {
        compressedEntries++;
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalSize,
      hitRate: Math.round(hitRate * 100) / 100,
      metrics: { ...this.metrics },
      compressedEntries,
      compressionRate: this.cache.size > 0 ? 
        Math.round((compressedEntries / this.cache.size) * 100) : 0,
    };
  }

  /**
   * Obtener o establecer con función de carga
   */
  async getOrSet(key, loadFunction, ttl = this.config.defaultTTL) {
    // Intentar obtener del caché
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Cargar datos
    try {
      const data = await loadFunction();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Error cargando datos para caché:', error);
      throw error;
    }
  }

  /**
   * Configurar TTL específico para un tipo de datos
   */
  setTTLForType(type, ttl) {
    this.config[`${type}TTL`] = ttl;
  }

  /**
   * Obtener TTL para un tipo específico
   */
  getTTLForType(type) {
    return this.config[`${type}TTL`] || this.config.defaultTTL;
  }
}

// Instancia global del servicio de caché
const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 200,
  enableCompression: true,
  enableMetrics: true,
});

// Configurar TTL específicos para diferentes tipos de datos
cacheService.setTTLForType('tickets', 3 * 60 * 1000); // 3 minutos
cacheService.setTTLForType('stats', 10 * 60 * 1000); // 10 minutos
cacheService.setTTLForType('config', 30 * 60 * 1000); // 30 minutos

export default cacheService;
