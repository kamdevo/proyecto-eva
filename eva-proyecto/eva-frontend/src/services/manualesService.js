import httpService from "@/services/httpService";

/**
 * Resolución de un manual por id.
 *
 * POR QUÉ EXISTE ESTE SERVICIO:
 * Los modales de equipo resolvían el manual asociado pidiendo el LISTADO
 * `/v1/manuales` (sin parámetros) y buscando el id con `.find()`. Pero ese
 * endpoint pagina de a 10 sobre ~180 manuales, ordenados por descripción.
 * Resultado: el manual guardado no se encontraba en ~94% de los casos y la
 * ficha mostraba "Sin manual asociado" aunque `equipos.manual_id` sí estuviera
 * guardado correctamente. La intermitencia que se percibía eran los pocos
 * manuales que caían por casualidad en la primera página.
 */

/** Normaliza las distintas formas de respuesta del backend a un array. */
function extraerArray(payload) {
  if (Array.isArray(payload?.data?.data)) return payload.data.data; // { data: { data: [...] } }
  if (Array.isArray(payload?.data)) return payload.data; // { data: [...] }
  if (Array.isArray(payload)) return payload; // [...]
  return [];
}

/**
 * Devuelve el manual con ese id, o null si no existe.
 *
 * Estrategia: primero el endpoint por id (barato y exacto). Si no está
 * disponible —por ejemplo si el backend aún no se ha desplegado— cae al
 * listado pidiendo una página grande, para no depender del orden de despliegue.
 */
export async function obtenerManualPorId(manualId) {
  if (manualId === null || manualId === undefined || manualId === "") return null;

  const id = String(manualId).trim();
  if (!id || id === "0") return null;

  // 1) Camino directo: /v1/manuales/{id}
  try {
    const res = await httpService.get(`/v1/manuales/${encodeURIComponent(id)}`);
    const manual = res?.data?.data ?? res?.data;
    if (manual && manual.id !== undefined) return manual;
  } catch (error) {
    // 404 = no existe; cualquier otro error se reintenta por el listado.
    if (error?.response?.status === 404) return null;
  }

  // 2) Respaldo: listado con página grande (sirve si el endpoint por id no está desplegado)
  try {
    const res = await httpService.get("/v1/manuales", { params: { per_page: 1000 } });
    const manuales = extraerArray(res?.data);
    return manuales.find((m) => String(m?.id) === id) || null;
  } catch (error) {
    console.error("No se pudo resolver el manual", id, error);
    return null;
  }
}

/**
 * Igual que obtenerManualPorId, pero si no se puede resolver devuelve un objeto
 * mínimo en lugar de null. Así la ficha nunca dice "Sin manual asociado" cuando
 * el equipo sí tiene un manual guardado: muestra al menos el id.
 */
export async function resolverManualParaFicha(manualId) {
  const manual = await obtenerManualPorId(manualId);
  if (manual) return manual;

  const id = String(manualId ?? "").trim();
  if (!id || id === "0") return null;

  return { id, descripcion: `Manual #${id} (no disponible)`, noResuelto: true };
}

export default obtenerManualPorId;
