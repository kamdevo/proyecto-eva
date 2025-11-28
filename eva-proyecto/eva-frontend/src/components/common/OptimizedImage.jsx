import React, { useState, useEffect, useRef } from 'react';

/**
 * 🖼️ OptimizedImage - Componente de imagen con lazy loading y optimizaciones
 * 
 * Features:
 * - Lazy loading automático
 * - Placeholder mientras carga
 * - Manejo de errores
 * - Intersection Observer API
 * - Transiciones suaves
 * 
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS
 * @param {string} placeholder - URL del placeholder (opcional)
 * @param {Function} onLoad - Callback cuando carga
 * @param {Function} onError - Callback en error
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif"%3ECargando...%3C/text%3E%3C/svg%3E',
  fallbackImage = null,
  onLoad = () => {},
  onError = () => {},
  loading = 'lazy',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!imageRef.current || loading === 'eager') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
        threshold: 0.01,
      }
    );

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [loading]);

  // Cargar imagen cuando sea visible
  useEffect(() => {
    if (!isVisible || !src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
      setImageError(false);
      onLoad();
    };

    img.onerror = () => {
      setImageError(true);
      if (fallbackImage) {
        setImageSrc(fallbackImage);
      }
      onError();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, src, fallbackImage, onLoad, onError]);

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        loading={loading}
      />
      
      {/* Loading spinner */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d293d]"></div>
        </div>
      )}

      {/* Error fallback */}
      {imageError && !fallbackImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Error al cargar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OptimizedImage);
