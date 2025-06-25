/**
 * Resource Optimizer - Sistema EVA
 * 
 * Características:
 * - Resource hints (preload, prefetch, preconnect)
 * - Lazy loading inteligente
 * - Code splitting dinámico
 * - Bundle optimization
 * - Critical resource prioritization
 * - Performance monitoring
 */

import logger, { LOG_CATEGORIES } from './logger.js';

// Tipos de resource hints
export const HINT_TYPES = {
  PRELOAD: 'preload',
  PREFETCH: 'prefetch',
  PRECONNECT: 'preconnect',
  DNS_PREFETCH: 'dns-prefetch',
  MODULE_PRELOAD: 'modulepreload'
};

// Prioridades de recursos
export const RESOURCE_PRIORITIES = {
  CRITICAL: 'high',
  IMPORTANT: 'medium',
  NORMAL: 'low',
  LAZY: 'auto'
};

class ResourceOptimizer {
  constructor() {
    this.loadedResources = new Set();
    this.preloadedResources = new Set();
    this.criticalResources = new Set();
    this.lazyResources = new Map();
    this.intersectionObserver = null;
    this.performanceObserver = null;
    
    // Métricas
    this.metrics = {
      totalResources: 0,
      preloadedResources: 0,
      lazyLoadedResources: 0,
      criticalResourcesLoaded: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
      bundleSize: 0
    };

    this.initializeOptimizer();
  }

  /**
   * Inicializar optimizador
   */
  initializeOptimizer() {
    // Configurar observers
    this.setupIntersectionObserver();
    this.setupPerformanceObserver();
    
    // Precargar recursos críticos
    this.preloadCriticalResources();
    
    // Configurar preconnect para dominios externos
    this.setupPreconnections();
    
    // Optimizar imágenes
    this.optimizeImages();
    
    // Configurar code splitting
    this.setupCodeSplitting();

    logger.info(LOG_CATEGORIES.PERFORMANCE, 'Resource optimizer initialized');
  }

  /**
   * Precargar recursos críticos
   */
  preloadCriticalResources() {
    const criticalResources = [
      // CSS crítico
      { href: '/static/css/critical.css', as: 'style', type: 'text/css' },
      
      // JavaScript crítico
      { href: '/static/js/critical.js', as: 'script', type: 'text/javascript' },
      
      // Fuentes críticas
      { href: '/static/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      
      // API endpoints críticos
      { href: '/api/user/profile', as: 'fetch', type: 'application/json' },
      { href: '/api/dashboard/summary', as: 'fetch', type: 'application/json' },
      
      // Imágenes críticas
      { href: '/static/images/logo.webp', as: 'image', type: 'image/webp' },
      { href: '/static/images/hero.webp', as: 'image', type: 'image/webp' }
    ];

    criticalResources.forEach(resource => {
      this.addResourceHint(HINT_TYPES.PRELOAD, resource);
      this.criticalResources.add(resource.href);
    });

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Critical resources preloaded', {
      count: criticalResources.length
    });
  }

  /**
   * Configurar preconnections
   */
  setupPreconnections() {
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://api.eva-sistema.com'
    ];

    externalDomains.forEach(domain => {
      this.addResourceHint(HINT_TYPES.PRECONNECT, { href: domain });
      this.addResourceHint(HINT_TYPES.DNS_PREFETCH, { href: domain });
    });

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'External domains preconnected', {
      count: externalDomains.length
    });
  }

  /**
   * Agregar resource hint
   */
  addResourceHint(type, options) {
    const link = document.createElement('link');
    link.rel = type;
    link.href = options.href;
    
    if (options.as) link.as = options.as;
    if (options.type) link.type = options.type;
    if (options.crossorigin) link.crossOrigin = options.crossorigin;
    if (options.media) link.media = options.media;
    
    // Configurar prioridad
    if (this.criticalResources.has(options.href)) {
      link.fetchPriority = RESOURCE_PRIORITIES.CRITICAL;
    }

    document.head.appendChild(link);
    
    // Monitorear carga
    link.onload = () => {
      this.handleResourceLoad(options.href, type);
    };
    
    link.onerror = () => {
      this.handleResourceError(options.href, type);
    };

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Resource hint added', {
      type,
      href: options.href,
      as: options.as
    });
  }

  /**
   * Prefetch de recursos para navegación futura
   */
  prefetchForRoute(route) {
    const routeResources = this.getResourcesForRoute(route);
    
    routeResources.forEach(resource => {
      if (!this.preloadedResources.has(resource.href)) {
        this.addResourceHint(HINT_TYPES.PREFETCH, resource);
        this.preloadedResources.add(resource.href);
      }
    });

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Resources prefetched for route', {
      route,
      count: routeResources.length
    });
  }

  /**
   * Obtener recursos para una ruta específica
   */
  getResourcesForRoute(route) {
    const routeMap = {
      '/dashboard': [
        { href: '/static/js/dashboard.chunk.js', as: 'script' },
        { href: '/static/css/dashboard.css', as: 'style' },
        { href: '/api/dashboard/widgets', as: 'fetch' }
      ],
      '/equipos': [
        { href: '/static/js/equipos.chunk.js', as: 'script' },
        { href: '/static/css/equipos.css', as: 'style' },
        { href: '/api/equipos', as: 'fetch' }
      ],
      '/mantenimiento': [
        { href: '/static/js/mantenimiento.chunk.js', as: 'script' },
        { href: '/static/css/mantenimiento.css', as: 'style' },
        { href: '/api/mantenimiento', as: 'fetch' }
      ],
      '/calibracion': [
        { href: '/static/js/calibracion.chunk.js', as: 'script' },
        { href: '/static/css/calibracion.css', as: 'style' },
        { href: '/api/calibracion', as: 'fetch' }
      ]
    };

    return routeMap[route] || [];
  }

  /**
   * Configurar Intersection Observer para lazy loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      logger.warn(LOG_CATEGORIES.PERFORMANCE, 'IntersectionObserver not supported');
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadLazyResource(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Cargar 50px antes de que sea visible
        threshold: 0.1
      }
    );

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Intersection Observer configured');
  }

  /**
   * Configurar Performance Observer
   */
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      logger.warn(LOG_CATEGORIES.PERFORMANCE, 'PerformanceObserver not supported');
      return;
    }

    this.performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.processPerformanceEntry(entry);
      });
    });

    // Observar diferentes tipos de métricas
    try {
      this.performanceObserver.observe({ entryTypes: ['resource', 'navigation', 'measure'] });
    } catch (error) {
      logger.error(LOG_CATEGORIES.PERFORMANCE, 'Failed to setup PerformanceObserver', {
        error: error.message
      });
    }
  }

  /**
   * Procesar entrada de performance
   */
  processPerformanceEntry(entry) {
    if (entry.entryType === 'resource') {
      this.updateResourceMetrics(entry);
    } else if (entry.entryType === 'navigation') {
      this.updateNavigationMetrics(entry);
    }
  }

  /**
   * Actualizar métricas de recursos
   */
  updateResourceMetrics(entry) {
    this.metrics.totalResources++;
    
    const loadTime = entry.responseEnd - entry.startTime;
    const currentAvg = this.metrics.averageLoadTime;
    const totalResources = this.metrics.totalResources;
    
    this.metrics.averageLoadTime = 
      ((currentAvg * (totalResources - 1)) + loadTime) / totalResources;

    // Detectar recursos desde cache
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
      this.metrics.cacheHitRate = 
        ((this.metrics.cacheHitRate * (totalResources - 1)) + 100) / totalResources;
    } else {
      this.metrics.cacheHitRate = 
        (this.metrics.cacheHitRate * (totalResources - 1)) / totalResources;
    }

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Resource metrics updated', {
      name: entry.name,
      loadTime: loadTime.toFixed(2),
      fromCache: entry.transferSize === 0
    });
  }

  /**
   * Optimizar imágenes
   */
  optimizeImages() {
    // Configurar lazy loading para imágenes
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
      this.observeLazyResource(img);
    });

    // Configurar responsive images
    this.setupResponsiveImages();

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Images optimized', {
      lazyImages: images.length
    });
  }

  /**
   * Configurar imágenes responsive
   */
  setupResponsiveImages() {
    const images = document.querySelectorAll('img:not([data-src])');
    
    images.forEach(img => {
      if (!img.srcset && img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      
      if (!img.sizes && img.dataset.sizes) {
        img.sizes = img.dataset.sizes;
      }
      
      // Configurar loading lazy para imágenes no críticas
      if (!this.criticalResources.has(img.src)) {
        img.loading = 'lazy';
      }
    });
  }

  /**
   * Observar recurso lazy
   */
  observeLazyResource(element) {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
      this.lazyResources.set(element, {
        type: element.tagName.toLowerCase(),
        src: element.dataset.src || element.dataset.href,
        observed: true
      });
    }
  }

  /**
   * Cargar recurso lazy
   */
  loadLazyResource(element) {
    const resourceInfo = this.lazyResources.get(element);
    if (!resourceInfo) return;

    const startTime = performance.now();

    if (element.tagName === 'IMG') {
      element.src = element.dataset.src;
      element.onload = () => {
        this.handleLazyResourceLoad(element, startTime);
      };
    } else if (element.tagName === 'IFRAME') {
      element.src = element.dataset.src;
      element.onload = () => {
        this.handleLazyResourceLoad(element, startTime);
      };
    }

    // Dejar de observar
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }

    this.lazyResources.delete(element);
  }

  /**
   * Manejar carga de recurso lazy
   */
  handleLazyResourceLoad(element, startTime) {
    const loadTime = performance.now() - startTime;
    this.metrics.lazyLoadedResources++;

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Lazy resource loaded', {
      type: element.tagName,
      src: element.src,
      loadTime: loadTime.toFixed(2)
    });
  }

  /**
   * Configurar code splitting
   */
  setupCodeSplitting() {
    // Configurar dynamic imports para rutas
    this.setupRouteBasedSplitting();
    
    // Configurar component-based splitting
    this.setupComponentBasedSplitting();

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Code splitting configured');
  }

  /**
   * Code splitting basado en rutas
   */
  setupRouteBasedSplitting() {
    // Esta función se integraría con el router de React
    const routeComponents = {
      '/dashboard': () => import('../pages/Dashboard'),
      '/equipos': () => import('../pages/Equipos'),
      '/mantenimiento': () => import('../pages/Mantenimiento'),
      '/calibracion': () => import('../pages/Calibracion'),
      '/contingencias': () => import('../pages/Contingencias'),
      '/usuarios': () => import('../pages/Usuarios'),
      '/reportes': () => import('../pages/Reportes')
    };

    // Prefetch de componentes para rutas probables
    this.prefetchLikelyRoutes();
  }

  /**
   * Prefetch de rutas probables
   */
  prefetchLikelyRoutes() {
    // Basado en analytics o patrones de navegación
    const likelyRoutes = ['/dashboard', '/equipos'];
    
    likelyRoutes.forEach(route => {
      setTimeout(() => {
        this.prefetchForRoute(route);
      }, 2000); // Prefetch después de 2 segundos
    });
  }

  /**
   * Code splitting basado en componentes
   */
  setupComponentBasedSplitting() {
    // Configurar lazy loading para componentes pesados
    const heavyComponents = [
      'DataTable',
      'Chart',
      'Calendar',
      'FileUploader',
      'RichTextEditor'
    ];

    heavyComponents.forEach(component => {
      this.setupComponentLazyLoading(component);
    });
  }

  /**
   * Configurar lazy loading para componente
   */
  setupComponentLazyLoading(componentName) {
    // Esta función se integraría con React.lazy
    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Component lazy loading configured', {
      component: componentName
    });
  }

  /**
   * Manejar carga de recurso
   */
  handleResourceLoad(href, type) {
    this.loadedResources.add(href);
    
    if (this.criticalResources.has(href)) {
      this.metrics.criticalResourcesLoaded++;
    }
    
    if (type === HINT_TYPES.PRELOAD) {
      this.metrics.preloadedResources++;
    }

    logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Resource loaded successfully', {
      href,
      type,
      isCritical: this.criticalResources.has(href)
    });
  }

  /**
   * Manejar error de recurso
   */
  handleResourceError(href, type) {
    logger.error(LOG_CATEGORIES.PERFORMANCE, 'Resource failed to load', {
      href,
      type
    });
  }

  /**
   * Optimizar bundle size
   */
  optimizeBundleSize() {
    // Analizar bundle size
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });
      
      this.metrics.bundleSize = totalSize;
      
      logger.info(LOG_CATEGORIES.PERFORMANCE, 'Bundle size analyzed', {
        totalSize: (totalSize / 1024).toFixed(2) + ' KB'
      });
    }
  }

  /**
   * Precargar recursos para interacción del usuario
   */
  preloadOnUserInteraction(element, resources) {
    const preloadResources = () => {
      resources.forEach(resource => {
        this.addResourceHint(HINT_TYPES.PRELOAD, resource);
      });
    };

    // Precargar en hover (desktop) o touchstart (mobile)
    element.addEventListener('mouseenter', preloadResources, { once: true });
    element.addEventListener('touchstart', preloadResources, { once: true });
    element.addEventListener('focus', preloadResources, { once: true });
  }

  /**
   * Obtener métricas de performance
   */
  getPerformanceMetrics() {
    // Actualizar bundle size
    this.optimizeBundleSize();
    
    return {
      ...this.metrics,
      loadedResources: this.loadedResources.size,
      criticalResourcesTotal: this.criticalResources.size,
      lazyResourcesPending: this.lazyResources.size,
      cacheHitRate: this.metrics.cacheHitRate.toFixed(2) + '%',
      bundleSizeKB: (this.metrics.bundleSize / 1024).toFixed(2)
    };
  }

  /**
   * Obtener Core Web Vitals
   */
  getCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};
      
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
        
        if (Object.keys(vitals).length === 3) {
          resolve(vitals);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          vitals.fid = entry.processingStart - entry.startTime;
        });
        
        if (Object.keys(vitals).length === 3) {
          resolve(vitals);
        }
      }).observe({ entryTypes: ['first-input'] });
      
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.cls = clsValue;
        
        if (Object.keys(vitals).length === 3) {
          resolve(vitals);
        }
      }).observe({ entryTypes: ['layout-shift'] });
      
      // Timeout para resolver si no se obtienen todas las métricas
      setTimeout(() => {
        resolve(vitals);
      }, 5000);
    });
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Instancia singleton
const resourceOptimizer = new ResourceOptimizer();

export default resourceOptimizer;
export { HINT_TYPES, RESOURCE_PRIORITIES };
