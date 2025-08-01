import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Hook personalizado para gestión de imágenes de equipos
 * Maneja la carga dinámica de imágenes desde el backend
 */
export const useEquipmentImages = () => {
  const [imageCache, setImageCache] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());

  /**
   * Obtener imagen de un equipo específico
   */
  const getEquipmentImage = useCallback(
    async (equipmentId) => {
      // Si ya está en cache, retornar inmediatamente
      if (imageCache.has(equipmentId)) {
        return imageCache.get(equipmentId);
      }

      // Si ya se está cargando, no hacer otra petición
      if (loadingImages.has(equipmentId)) {
        return null;
      }

      try {
        setLoadingImages((prev) => new Set(prev).add(equipmentId));

        const response = await axios.get(
          `/api/v1/equipos/${equipmentId}/files`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.data.success && response.data.data.imagen) {
          const imageData = response.data.data.imagen;
          const imageUrl = `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/storage/${imageData.path}`;

          // Guardar en cache
          setImageCache((prev) => new Map(prev).set(equipmentId, imageUrl));

          return imageUrl;
        } else {
          // No hay imagen, guardar null en cache para evitar futuras peticiones
          setImageCache((prev) => new Map(prev).set(equipmentId, null));
          return null;
        }
      } catch (error) {
        console.error(
          `Error loading image for equipment ${equipmentId}:`,
          error
        );
        // Guardar null en cache para evitar futuras peticiones
        setImageCache((prev) => new Map(prev).set(equipmentId, null));
        return null;
      } finally {
        setLoadingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(equipmentId);
          return newSet;
        });
      }
    },
    [imageCache, loadingImages]
  );

  /**
   * Precargar imágenes para una lista de equipos
   */
  const preloadImages = useCallback(
    async (equipmentIds) => {
      const promises = equipmentIds.map((id) => getEquipmentImage(id));
      await Promise.allSettled(promises);
    },
    [getEquipmentImage]
  );

  /**
   * Limpiar cache de imágenes
   */
  const clearImageCache = useCallback(() => {
    setImageCache(new Map());
    setLoadingImages(new Set());
  }, []);

  /**
   * Obtener imagen desde cache (síncrono)
   */
  const getCachedImage = useCallback(
    (equipmentId) => {
      return imageCache.get(equipmentId);
    },
    [imageCache]
  );

  /**
   * Verificar si una imagen está cargando
   */
  const isImageLoading = useCallback(
    (equipmentId) => {
      return loadingImages.has(equipmentId);
    },
    [loadingImages]
  );

  return {
    getEquipmentImage,
    preloadImages,
    clearImageCache,
    getCachedImage,
    isImageLoading,
    imageCache: imageCache,
    loadingImages: loadingImages,
  };
};

export default useEquipmentImages;
