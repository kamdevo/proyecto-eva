import { useState, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import EquipmentImage from "./equipment-image";
import "../../styles/equipment-animations.css";

/**
 * Componente de imagen de equipo con efecto hover mejorado
 * Muestra una vista ampliada con transición fluida al hacer hover
 */
export const EquipmentImageHover = memo(function EquipmentImageHover({ 
  equipmentId, 
  equipmentData, 
  equipmentName, 
  className = "", 
  fallbackImage,
  showLoader = true 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 800); // Esperar 800ms antes de mostrar
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  return (
    <>
      {/* Imagen original con hover */}
      <div
        className={`equipment-image-container relative rounded-lg overflow-hidden cursor-pointer ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <EquipmentImage
          equipmentId={equipmentId}
          equipmentData={equipmentData}
          equipmentName={equipmentName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          fallbackImage={fallbackImage}
          showLoader={showLoader}
        />
      </div>

      {/* Modal ampliado simple */}
      {isHovered && createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-none bg-black/40">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <EquipmentImage
                equipmentId={equipmentId}
                equipmentData={equipmentData}
                equipmentName={equipmentName}
                className="w-80 h-80 object-cover"
                fallbackImage={fallbackImage}
                showLoader={showLoader}
              />
              <div className="p-3 bg-gray-50">
                <div className="text-sm font-medium text-gray-900">{equipmentName}</div>
                <div className="text-xs text-gray-600">ID: {equipmentId}</div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
})
