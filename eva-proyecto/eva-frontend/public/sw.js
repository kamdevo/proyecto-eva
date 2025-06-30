/**
 * Service Worker Empresarial - Sistema EVA
 * 
 * Características:
 * - Cache offline inteligente
 * - Background sync para requests fallidos
 * - Preloading de recursos críticos
 * - Compresión y optimización automática
 * - Push notifications
 * - Resource hints y prefetching
 */

const CACHE_VERSION = 'eva-v1.2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Recursos críticos para cache inmediato
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos para preload
const PRELOAD_RESOURCES = [
  '/api/user/profile',
  '/api/dashboard/summary',
  '/api/equipos?limit=10',
  '/api/mantenimiento/pending'
];

// Configuración de cache por tipo
const CACHE_STRATEGIES = {
  // Cache first para recursos estáticos
  static: {
    strategy: 'cache-first',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    maxEntries: 100
  },
  
  // Network first para API
  api: {
    strategy: 'network-first',
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxEntries: 200,
    networkTimeout: 3000
  },
  
  // Cache first para imágenes
  images: {
    strategy: 'cache-first',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    maxEntries: 500
  },
  
  // Stale while revalidate para contenido dinámico
  dynamic: {
    strategy: 'stale-while-revalidate',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    maxEntries: 300
  }
};

// Queue para background sync
let backgroundSyncQueue = [];

/**
 * Evento de instalación
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Preload recursos importantes
      preloadCriticalResources(),
      
      // Skip waiting para activar inmediatamente
      self.skipWaiting()
    ])
  );
});

/**
 * Evento de activación
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      cleanupOldCaches(),
      
      // Tomar control de todas las páginas
      self.clients.claim(),
      
      // Configurar background sync
      setupBackgroundSync()
    ])
  );
});

/**
 * Interceptar requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo interceptar requests del mismo origen o API
  if (!url.origin.includes('localhost') && !url.pathname.startsWith('/api')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Background sync
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-requests') {
    event.waitUntil(processBackgroundSync());
  }
});

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Nueva notificación del Sistema EVA',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    vibrate: [200, 100, 200],
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.message || options.body;
      options.title = payload.title || 'Sistema EVA';
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.error('[SW] Error parsing push payload:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Sistema EVA', options)
  );
});

/**
 * Click en notificación
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Manejar request con estrategia apropiada
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determinar estrategia según tipo de recurso
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request);
    } else if (isImageRequest(request)) {
      return await handleImageRequest(request);
    } else if (isStaticResource(request)) {
      return await handleStaticRequest(request);
    } else {
      return await handleDynamicRequest(request);
    }
  } catch (error) {
    console.error('[SW] Request handling failed:', error);
    return await handleOfflineRequest(request);
  }
}

/**
 * Manejar requests de API
 */
async function handleApiRequest(request) {
  const config = CACHE_STRATEGIES.api;
  const cache = await caches.open(API_CACHE);
  
  if (config.strategy === 'network-first') {
    try {
      // Intentar network con timeout
      const networkResponse = await Promise.race([
        fetch(request.clone()),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), config.networkTimeout)
        )
      ]);
      
      // Cache respuesta exitosa
      if (networkResponse.ok) {
        cache.put(request.clone(), networkResponse.clone());
      }
      
      return networkResponse;
      
    } catch (error) {
      console.log('[SW] Network failed, trying cache:', error.message);
      
      // Fallback a cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Si no hay cache, agregar a background sync
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
        await addToBackgroundSync(request);
      }
      
      throw error;
    }
  }
  
  return fetch(request);
}

/**
 * Manejar requests de imágenes
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Cache first para imágenes
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Optimizar imagen antes de cachear
      const optimizedResponse = await optimizeImage(networkResponse.clone());
      cache.put(request, optimizedResponse.clone());
      return optimizedResponse;
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback a imagen placeholder
    return await cache.match('/icons/placeholder.png') || 
           new Response('', { status: 404 });
  }
}

/**
 * Manejar recursos estáticos
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Cache first para recursos estáticos
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

/**
 * Manejar contenido dinámico
 */
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const config = CACHE_STRATEGIES.dynamic;
  
  if (config.strategy === 'stale-while-revalidate') {
    // Devolver cache inmediatamente si existe
    const cachedResponse = await cache.match(request);
    
    // Actualizar cache en background
    const networkPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request.clone(), response.clone());
      }
      return response;
    }).catch(error => {
      console.log('[SW] Background update failed:', error.message);
    });
    
    return cachedResponse || await networkPromise;
  }
  
  return fetch(request);
}

/**
 * Manejar requests offline
 */
async function handleOfflineRequest(request) {
  const url = new URL(request.url);
  
  // Para navegación, devolver página offline
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/offline.html') || 
           await cache.match('/index.html') ||
           new Response('Offline', { status: 503 });
  }
  
  // Para API, devolver respuesta offline
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No hay conexión a internet',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Offline', { status: 503 });
}

/**
 * Preload recursos críticos
 */
async function preloadCriticalResources() {
  const cache = await caches.open(API_CACHE);
  
  for (const resource of PRELOAD_RESOURCES) {
    try {
      const response = await fetch(resource);
      if (response.ok) {
        await cache.put(resource, response);
        console.log('[SW] Preloaded:', resource);
      }
    } catch (error) {
      console.log('[SW] Preload failed:', resource, error.message);
    }
  }
}

/**
 * Limpiar caches antiguos
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => {
      console.log('[SW] Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    });
  
  await Promise.all(deletePromises);
}

/**
 * Configurar background sync
 */
async function setupBackgroundSync() {
  // Registrar background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      await self.registration.sync.register('background-sync-requests');
      console.log('[SW] Background sync registered');
    } catch (error) {
      console.error('[SW] Background sync registration failed:', error);
    }
  }
}

/**
 * Agregar request a background sync
 */
async function addToBackgroundSync(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  backgroundSyncQueue.push(requestData);
  
  // Persistir queue
  await saveBackgroundSyncQueue();
  
  console.log('[SW] Added to background sync queue:', request.url);
}

/**
 * Procesar background sync
 */
async function processBackgroundSync() {
  console.log('[SW] Processing background sync queue');
  
  // Cargar queue persistida
  await loadBackgroundSyncQueue();
  
  const successfulRequests = [];
  
  for (const requestData of backgroundSyncQueue) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      
      if (response.ok) {
        successfulRequests.push(requestData);
        console.log('[SW] Background sync success:', requestData.url);
      } else {
        console.log('[SW] Background sync failed:', requestData.url, response.status);
      }
      
    } catch (error) {
      console.log('[SW] Background sync error:', requestData.url, error.message);
    }
  }
  
  // Remover requests exitosos
  backgroundSyncQueue = backgroundSyncQueue.filter(
    request => !successfulRequests.includes(request)
  );
  
  // Persistir queue actualizada
  await saveBackgroundSyncQueue();
  
  console.log('[SW] Background sync completed:', successfulRequests.length, 'successful');
}

/**
 * Guardar queue de background sync
 */
async function saveBackgroundSyncQueue() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(backgroundSyncQueue));
    await cache.put('background-sync-queue', response);
  } catch (error) {
    console.error('[SW] Failed to save background sync queue:', error);
  }
}

/**
 * Cargar queue de background sync
 */
async function loadBackgroundSyncQueue() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('background-sync-queue');
    
    if (response) {
      const data = await response.json();
      backgroundSyncQueue = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error('[SW] Failed to load background sync queue:', error);
    backgroundSyncQueue = [];
  }
}

/**
 * Optimizar imagen
 */
async function optimizeImage(response) {
  // En un entorno real, aquí se implementaría compresión de imágenes
  // Por ahora, simplemente devolvemos la respuesta original
  return response;
}

/**
 * Verificar si es request de imagen
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

/**
 * Verificar si es recurso estático
 */
function isStaticResource(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.includes('/static/') ||
         url.pathname === '/' ||
         url.pathname === '/index.html';
}

console.log('[SW] Service Worker loaded successfully');
