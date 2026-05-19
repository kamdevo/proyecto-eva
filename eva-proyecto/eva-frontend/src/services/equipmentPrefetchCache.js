import httpService from "@/services/httpService";

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const pendingRequests = new Map();

function isValid(entry) {
  return entry && Date.now() - entry.timestamp < CACHE_TTL;
}

export function invalidateEquipmentCache(equipmentId) {
  cache.delete(`options`);
  if (equipmentId) {
    cache.delete(`equip-${equipmentId}`);
    cache.delete(`history-${equipmentId}`);
    cache.delete(`especificaciones-${equipmentId}`);
    cache.delete(`user-history-${equipmentId}`);
    cache.delete(`tickets-${equipmentId}`);
    cache.delete(`cambios-hdv-${equipmentId}`);
  }
}

/** Invalida el historial y el cache de complete-info para que correctivos/preventivos recién creados aparezcan inmediatamente. */
export function invalidateHistoryCache(equipmentId) {
  if (equipmentId) {
    cache.delete(`history-${equipmentId}`);
    cache.delete(`equip-${equipmentId}`);
    cache.delete(`user-history-${equipmentId}`);
  }
}

async function fetchWithDedup(key, fetcher) {
  const cached = cache.get(key);
  if (isValid(cached)) return cached.data;

  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const promise = fetcher().then((data) => {
    cache.set(key, { data, timestamp: Date.now() });
    pendingRequests.delete(key);
    return data;
  }).catch((err) => {
    pendingRequests.delete(key);
    throw err;
  });

  pendingRequests.set(key, promise);
  return promise;
}

export async function prefetchDropdownOptions() {
  return fetchWithDedup("options", async () => {
    const resp = await httpService.get("/v1/equipos/filter-options");
    if (resp.data?.success) {
      return {
        sedes: resp.data.data.sedes || [],
        servicios: resp.data.data.servicios || [],
        areas: resp.data.data.areas || [],
        centros: resp.data.data.centros || [],
        propietarios: resp.data.data.propietarios || [],
        fuentes: resp.data.data.fuentes || [],
        tecnologias: resp.data.data.tecnologias || [],
        frecuencias: resp.data.data.frecuencias || [],
        clasificacionesBiomedicas: resp.data.data.clasificaciones || [],
        clasificacionesRiesgo: resp.data.data.riesgos || [],
        tiposAdquisicion: resp.data.data.tipos_adquisicion || [],
        estadosEquipo: resp.data.data.estados || [],
        funcionalidades: resp.data.data.funcionalidades || [],
        periodosGarantias: resp.data.data.periodos_garantias || [],
        tipos: resp.data.data.tipos_equipos || resp.data.data.tipos || [],
        disponibilidades: resp.data.data.disponibilidades || [],
        invimas: resp.data.data.invimas || resp.data.data.registros_invima || [],
        ordenesCompra: resp.data.data.ordenes_compra || [],
        bajas: resp.data.data.bajas || [],
        guias: resp.data.data.guias || [],
        manuales: resp.data.data.manuales || [],
        necesidades: resp.data.data.necesidades || [],
      };
    }
    return null;
  });
}

/**
 * Prefetch equipment data (general info + all related data).
 * Now uses complete-info endpoint which returns everything in one call.
 */
export async function prefetchEquipmentData(equipmentId) {
  return fetchWithDedup(`equip-${equipmentId}`, async () => {
    const resp = await httpService.get(`/v1/equipos/${equipmentId}/complete-info`);
    if (resp.data?.success) return resp.data.data;
    return null;
  });
}

/**
 * Prefetch equipment history (calibraciones, preventivos, correctivos, repuestos, observaciones).
 * Now included in complete-info, but keeping separate cache key for compatibility.
 */
export async function prefetchEquipmentHistory(equipmentId) {
  return fetchWithDedup(`history-${equipmentId}`, async () => {
    // Try complete-info first (includes all history)
    const completeResp = await prefetchEquipmentData(equipmentId);
    if (completeResp) {
      return {
        correctivos: completeResp.correctivos_generales || completeResp.contingencias || [],
        preventivos: completeResp.mantenimientos_preventivos || [],
        calibraciones: completeResp.calibraciones || [],
        repuestos: completeResp.repuestos || [],
        observaciones: completeResp.observaciones || []
      };
    }

    // Fallback to old equipment-history endpoint
    try {
      const resp = await httpService.get(`/v1/equipos/${equipmentId}/equipment-history`);
      if (resp.data?.success) return resp.data.data;
    } catch { /* fall through */ }

    // Fallback to old historial endpoint
    try {
      const resp = await httpService.get(`/v1/equipos/${equipmentId}/historial`);
      if (resp.data?.success) return resp.data.data;
    } catch { /* fall through */ }

    // Individual fallback
    const historyData = { correctivos: [], preventivos: [], calibraciones: [], repuestos: [], observaciones: [] };
    const requests = [
      httpService.get(`/v1/correctivos-generales?equipo_id=${equipmentId}&per_page=10000`).then(r => {
        historyData.correctivos = r.data?.data?.correctivos || r.data?.data?.data || r.data?.data || [];
      }).catch(() => {}),
      httpService.get(`/v1/mantenimientos?equipo_id=${equipmentId}&tipo=preventivo`).then(r => {
        historyData.preventivos = r.data?.data || [];
      }).catch(() => {}),
      httpService.get(`/v1/calibraciones?equipo_id=${equipmentId}&per_page=10000`).then(r => {
        historyData.calibraciones = r.data?.data?.data || r.data?.data || [];
      }).catch(() => {}),
      httpService.get(`/v1/repuestos?equipo_id=${equipmentId}`).then(r => {
        historyData.repuestos = r.data?.data || [];
      }).catch(() => {}),
      httpService.get(`/v1/observaciones?equipo_id=${equipmentId}`).then(r => {
        historyData.observaciones = r.data?.data || [];
      }).catch(() => {}),
    ];
    await Promise.all(requests);
    return historyData;
  });
}

/**
 * Prefetch equipment specifications.
 * Now included in complete-info, but keeping separate cache key for compatibility.
 */
export async function prefetchEspecificaciones(equipmentId) {
  return fetchWithDedup(`especificaciones-${equipmentId}`, async () => {
    // Try complete-info first
    const completeResp = await prefetchEquipmentData(equipmentId);
    if (completeResp?.especificaciones) {
      return completeResp.especificaciones;
    }

    // Fallback to dedicated endpoint
    const resp = await httpService.get(`/v1/equipo-especificaciones/${equipmentId}`);
    const data = resp?.data?.data || resp?.data || [];
    return Array.isArray(data) ? data : [];
  });
}

/**
 * Prefetch all data for an equipment on hover.
 * Fires all requests in parallel silently.
 */
export function prefetchEquipment(equipmentId) {
  if (!equipmentId) return;
  // Fire and forget — all run in parallel
  prefetchDropdownOptions().catch(() => {});
  prefetchEquipmentData(equipmentId).catch(() => {});
  prefetchEquipmentHistory(equipmentId).catch(() => {});
  prefetchEspecificaciones(equipmentId).catch(() => {});
  prefetchUserHistory(equipmentId).catch(() => {});
  prefetchEquipmentTickets(equipmentId).catch(() => {});
  prefetchCambiosHdv(equipmentId).catch(() => {});
}

export async function prefetchUserHistory(equipmentId) {
  return fetchWithDedup(`user-history-${equipmentId}`, async () => {
    // Try complete-info first
    const completeResp = await prefetchEquipmentData(equipmentId);
    if (completeResp?.user_history) {
      return completeResp.user_history;
    }

    // Fallback to dedicated endpoint
    const resp = await httpService.get(`/v1/equipos/${equipmentId}/user-history`);
    if (resp.data?.success) return resp.data.data || [];
    return [];
  });
}

export async function prefetchEquipmentTickets(equipmentId) {
  return fetchWithDedup(`tickets-${equipmentId}`, async () => {
    // Try complete-info first
    const completeResp = await prefetchEquipmentData(equipmentId);
    if (completeResp?.tickets) {
      return completeResp.tickets;
    }

    // Fallback to dedicated endpoint
    const resp = await httpService.get('/v1/gestion-tickets', {
      params: { equipo_id: equipmentId, per_page: 10, page: 1 }
    });
    if (resp.data?.success && resp.data?.data?.data) {
      return Array.isArray(resp.data.data.data) ? resp.data.data.data : [];
    }
    return [];
  });
}

export async function prefetchCambiosHdv(equipmentId) {
  return fetchWithDedup(`cambios-hdv-${equipmentId}`, async () => {
    // Try complete-info first
    const completeResp = await prefetchEquipmentData(equipmentId);
    if (completeResp?.cambios_hdv) {
      return completeResp.cambios_hdv;
    }

    // Fallback to dedicated endpoint
    const resp = await httpService.get(`/v1/equipos/${equipmentId}/cambios-hdv`);
    if (resp.data?.success) return resp.data.data || [];
    return [];
  });
}
