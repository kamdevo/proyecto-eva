import React, { useState, useEffect } from "react";
import { useEquipmentImages } from "@/hooks/useEquipmentImages";
import { ImageIcon, Loader2 } from "lucide-react";
import notFoundImg from "../../assets/Img/imagenes/not-found.jpg";

/**
 * Componente para mostrar imágenes de equipos con carga dinámica
 */
export const EquipmentImage = ({
  equipmentId,
  equipmentData = null, // Nuevo prop para recibir datos del equipo directamente
  equipmentName = "Equipo médico",
  className = "",
  showLoader = true,
  fallbackImage = notFoundImg,
  ...props
}) => {
  const { getEquipmentImage, getCachedImage, isImageLoading } = useEquipmentImages();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si se proporciona equipmentData directamente, usar esa información
    if (equipmentData && equipmentData.image) {
      setImageUrl(equipmentData.image);
      setLoading(false);
      setImageError(false);
      return;
    }

    // Si se proporciona equipmentData pero no tiene imagen, no cargar
    if (equipmentData && !equipmentData.hasImage) {
      setImageUrl(null);
      setLoading(false);
      setImageError(false);
      return;
    }

    // Fallback al método original si no hay equipmentData
    if (!equipmentId) return;

    // Verificar si ya está en cache
    const cachedImage = getCachedImage(equipmentId);
    if (cachedImage !== undefined) {
      setImageUrl(cachedImage);
      setLoading(false);
      return;
    }

    // Si está cargando, mostrar loader
    if (isImageLoading(equipmentId)) {
      setLoading(true);
      return;
    }

    // Cargar imagen
    const loadImage = async () => {
      setLoading(true);
      setImageError(false);

      try {
        const url = await getEquipmentImage(equipmentId);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading equipment image:', error);
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [equipmentId, equipmentData, getEquipmentImage, getCachedImage, isImageLoading]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(null);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  // Mostrar loader mientras carga
  if (loading && showLoader) {
    return (
      <div className={`bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center border border-teal-200 ${className}`} {...props}>
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  // Mostrar imagen si existe y no hay error
  if (imageUrl && !imageError) {
    return (
      <div className={`bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center border border-teal-200 overflow-hidden ${className}`} {...props}>
        <img
          src={imageUrl}
          alt={equipmentName}
          className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }

  // Mostrar imagen por defecto o placeholder
  return (
    <div className={`bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center border border-teal-200 overflow-hidden ${className}`} {...props}>
      {fallbackImage ? (
        <img
          src={fallbackImage}
          alt={equipmentName}
          className="w-full h-full object-cover hover:scale-105 transition-all duration-300 opacity-80"
          onError={() => setImageError(true)}
        />
      ) : (
        <ImageIcon className="h-8 w-8 text-teal-600 opacity-50" />
      )}
    </div>
  );
};

export default EquipmentImage;
