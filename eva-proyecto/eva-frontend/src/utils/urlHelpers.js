/**
 * Helpers para construcción de URLs de la aplicación
 * Centraliza la lógica de URLs para evitar hardcoding
 */

import { API_CONFIG } from '@/config/api.js';

/**
 * Obtiene la URL base para archivos de storage (sin /api)
 * @returns {string} URL base (ej: http://localhost:5173 en dev, https://eva2.huv.gov.co en prod)
 */
export const getStorageBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};

/**
 * Construye URL completa para archivo de storage
 * @param {string} path - Ruta relativa (ej: "equipments/foto.jpg" o "storage/equipments/foto.jpg")
 * @returns {string} URL completa
 * 
 * @example
 * getStorageUrl('equipments/foto.jpg') // http://localhost:5173/storage/equipments/foto.jpg
 * getStorageUrl('storage/equipments/foto.jpg') // http://localhost:5173/storage/equipments/foto.jpg
 */
export const getStorageUrl = (path) => {
  if (!path) return null;
  
  const baseUrl = getStorageBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const finalPath = cleanPath.startsWith('/storage') ? cleanPath : `/storage${cleanPath}`;
  
  return `${baseUrl}${finalPath}`;
};

/**
 * Construye URL para imagen de equipo
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
export const getEquipmentImageUrl = (filename) => {
  if (!filename) return null;
  return getStorageUrl(`equipments/${filename}`);
};

/**
 * Construye URL para archivo de mantenimiento
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
export const getMantenimientoFileUrl = (filename) => {
  if (!filename) return null;
  return getStorageUrl(`mantenimientos/${filename}`);
};

/**
 * Construye URL para archivo de calibración
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
export const getCalibracionFileUrl = (filename) => {
  if (!filename) return null;
  return getStorageUrl(`calibraciones/${filename}`);
};

/**
 * Construye URL para archivo de correctivo general
 * @param {string} filename - Nombre del archivo (con o sin path completo)
 * @returns {string} URL completa
 */
export const getCorrectivoFileUrl = (filename) => {
  if (!filename) return null;
  // Extraer solo el nombre si viene con path
  const filenameOnly = filename.includes('/') ? filename.split('/').pop() : filename;
  return getStorageUrl(`correctivos_generales/${filenameOnly}`);
};

/**
 * Construye URL para archivo de repuesto
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
export const getRepuestoFileUrl = (filename) => {
  if (!filename) return null;
  const filenameOnly = filename.includes('/') ? filename.split('/').pop() : filename;
  return getStorageUrl(`equipos/repuestos/${filenameOnly}`);
};

/**
 * Construye URL para guía rápida
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
export const getGuiaFileUrl = (filename) => {
  if (!filename) return null;
  return getStorageUrl(`guias/${filename}`);
};

/**
 * Construye URL para manual
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
export const getManualFileUrl = (filename) => {
  if (!filename) return null;
  return getStorageUrl(`manuales/${filename}`);
};

/**
 * Obtiene URL base de la API (con /api)
 * @returns {string} URL de API
 */
export const getApiBaseUrl = () => {
  return API_CONFIG.API_URL;
};
