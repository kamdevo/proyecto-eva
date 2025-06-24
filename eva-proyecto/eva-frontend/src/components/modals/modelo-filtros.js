// Opciones para el filtro de tipo
export const modeloOpcionesTipo = [
  { value: "tipo1", label: "Tipo 1" },
  { value: "tipo2", label: "Tipo 2" },
]

// Opciones para el filtro de sede
export const modeloOpcionesSede = [
  { value: "sede1", label: "Sede 1" },
  { value: "sede2", label: "Sede 2" },
]

// Opciones para el filtro de adquisición
export const modeloOpcionesAdquisicion = [
  { value: "alquiler", label: "ALQUILER" },
  { value: "cambio", label: "CAMBIO POR GARANTÍA" },
  { value: "comodato", label: "COMODATO" },
  { value: "compra", label: "COMPRA" },
  { value: "demostracion", label: "DEMOSTRACIÓN" },
  { value: "donacion", label: "DONACIÓN" },
  { value: "intercambio", label: "INTERCAMBIO" },
  { value: "prestamo", label: "PRÉSTAMO" },
]

// Opciones para el filtro de estado
export const modeloOpcionesEstado = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "mantenimiento", label: "En mantenimiento" },
]

// Función para crear un filtro vacío
export const crearFiltroVacio = () => ({
  tipo: null,
  sede: null,
  tipoAdquisicion: null,
  estadoActual: null,
})
