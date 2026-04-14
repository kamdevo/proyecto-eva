/**
 * Cache para datos de configuración (sedes, servicios, áreas, propietarios, etc.)
 * Persiste en memoria entre navegaciones de página.
 * TTL de 3 minutos — se invalida al crear/editar/eliminar registros.
 */
import httpService from "@/services/httpService";

const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos
const pendingRequests = new Map();

function isValid(entry) {
  return entry && Date.now() - entry.timestamp < CACHE_TTL;
}

function buildKey(endpoint, params) {
  return `${endpoint}|${JSON.stringify(params || {})}`;
}

/**
 * Invalidar toda la caché de un endpoint (tras crear/editar/eliminar)
 */
export function invalidateConfigCache(endpoint) {
  for (const key of cache.keys()) {
    if (key.startsWith(endpoint + "|")) {
      cache.delete(key);
    }
  }
  for (const key of pendingRequests.keys()) {
    if (key.startsWith(endpoint + "|")) {
      pendingRequests.delete(key);
    }
  }
}

/**
 * Fetch con deduplicación y caché.
 * Retorna datos cacheados si existen y son válidos.
 */
export async function cachedGet(endpoint, params) {
  const key = buildKey(endpoint, params);

  const cached = cache.get(key);
  if (isValid(cached)) return cached.data;

  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const promise = httpService.get(endpoint, { params })
    .then((response) => {
      const result = response.data;
      cache.set(key, { data: result, timestamp: Date.now() });
      pendingRequests.delete(key);
      return result;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, promise);
  return promise;
}
