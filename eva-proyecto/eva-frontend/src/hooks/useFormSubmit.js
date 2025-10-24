import { useCallback } from 'react';

/**
 * Hook personalizado para mejorar la accesibilidad de formularios
 * Permite envío con Enter en cualquier campo del formulario
 */
export const useFormSubmit = (onSubmit) => {
  const handleKeyDown = useCallback((e) => {
    // Solo procesar si es Enter y no es un textarea (donde Enter debe crear nueva línea)
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      onSubmit(e);
    }
  }, [onSubmit]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  return {
    handleKeyDown,
    handleSubmit,
    formProps: {
      onSubmit: handleSubmit,
      onKeyDown: handleKeyDown
    }
  };
};

/**
 * Función utility para agregar comportamiento de Enter a elementos existentes
 * Uso: <Input onKeyDown={addEnterSubmit(handleSubmit)} />
 */
export const addEnterSubmit = (onSubmit) => (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    onSubmit(e);
  }
};
