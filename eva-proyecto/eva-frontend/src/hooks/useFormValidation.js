import { useState, useCallback, useMemo } from "react";

// Esquemas de validación
const validationSchemas = {
  login: {
    username: {
      required: true,
      message: "El nombre de usuario es obligatorio",
    },
    password: {
      required: true,
      message: "La contraseña es requerida",
    },
  },
  register: {
    nombre: {
      required: true,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      message: "El nombre solo puede contener letras y espacios",
    },
    apellido: {
      required: false,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      message: "El apellido solo puede contener letras y espacios",
    },
    telefono: {
      required: false,
      pattern: /^[\d\s-+()]+$/,
      message:
        "El teléfono solo puede contener números, espacios, guiones y paréntesis",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Debe ingresar un email válido",
    },
    username: {
      required: true,
      pattern: /^[a-zA-Z0-9_.-]+$/,
      maxLength: 45,
      message:
        "El nombre de usuario solo puede contener letras, números, guiones y puntos",
    },
    password: {
      required: true,
      message: "La contraseña es requerida",
    },
    password_confirmation: {
      required: true,
      message: "Debe confirmar la contraseña",
    },
    centro_id: {
      required: true,
      message: "Debe seleccionar un centro de costo",
    },
  },
};

const useFormValidation = (formType = "login") => {
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const schema = useMemo(() => validationSchemas[formType] || {}, [formType]);

  // Validar un campo específico
  const validateField = useCallback(
    (name, value, formData = {}) => {
      const fieldSchema = schema[name];
      if (!fieldSchema) return null;

      // Verificar si es requerido
      if (fieldSchema.required && (!value || value.toString().trim() === "")) {
        return fieldSchema.message || `${name} es obligatorio`;
      }

      // Si el campo está vacío y no es requerido, no validar más
      if (!fieldSchema.required && (!value || value.toString().trim() === "")) {
        return null;
      }

      // Validación personalizada (para contraseñas complejas)
      if (fieldSchema.validate && typeof fieldSchema.validate === "function") {
        const customError = fieldSchema.validate(value);
        if (customError) return customError;
      }

      // Validar longitud mínima
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        return (
          fieldSchema.message ||
          `${name} debe tener al menos ${fieldSchema.minLength} caracteres`
        );
      }

      // Validar longitud máxima
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        return (
          fieldSchema.message ||
          `${name} no puede exceder ${fieldSchema.maxLength} caracteres`
        );
      }

      // Validar patrón
      if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
        return fieldSchema.message || `${name} no tiene un formato válido`;
      }

      // Validaciones especiales
      if (name === "password_confirmation" && formData.password !== value) {
        return "Las contraseñas no coinciden";
      }

      return null;
    },
    [schema]
  );

  // Validar todos los campos
  const validateForm = useCallback(
    (formData) => {
      const newErrors = {};
      let isValid = true;

      Object.keys(schema).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName], formData);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return { isValid, errors: newErrors };
    },
    [schema, validateField]
  );

  // Validar un campo cuando pierde el foco
  const validateOnBlur = useCallback(
    (name, value, formData = {}) => {
      setTouchedFields((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, value, formData);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));

      return error;
    },
    [validateField]
  );

  // Validar un campo en tiempo real (mientras escribe)
  const validateOnChange = useCallback(
    (name, value, formData = {}) => {
      // ✅ MEJORA: Si el campo tiene un error, queremos validarlo en tiempo real 
      // para que el mensaje desaparezca en cuanto se corrija, incluso si no ha perdido el foco.
      // Si no ha sido tocado Y no tiene error previo, ignoramos.
      if (!touchedFields[name] && !errors[name]) return null;

      const error = validateField(name, value, formData);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));

      return error;
    },
    [validateField, touchedFields]
  );

  // Limpiar error de un campo
  const clearFieldError = useCallback((name) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Limpiar todos los errores
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouchedFields({});
  }, []);

  // Verificar si un campo tiene error
  const hasError = useCallback(
    (name) => {
      return !!errors[name];
    },
    [errors]
  );

  // Obtener error de un campo
  const getError = useCallback(
    (name) => {
      return errors[name] || null;
    },
    [errors]
  );

  // Verificar si un campo fue tocado
  const isTouched = useCallback(
    (name) => {
      return !!touchedFields[name];
    },
    [touchedFields]
  );

  return {
    errors,
    touchedFields,
    validateField,
    validateForm,
    validateOnBlur,
    validateOnChange,
    clearFieldError,
    clearErrors,
    hasError,
    getError,
    isTouched,
  };
};

export default useFormValidation;
