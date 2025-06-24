// Modelo para áreas
export const crearAreaVacia = () => ({
  id: null,
  nombre: "",
  servicio: "",
  sede: "",
  piso: "",
})

// Opciones para los selectores
export const modeloOpcionesServicio = [
  { value: "ACONDICIONAMIENTO FISICO", label: "ACONDICIONAMIENTO FISICO" },
  { value: "SUBESTACION", label: "SUBESTACION" },
  { value: "RADIOTERAPIA", label: "RADIOTERAPIA" },
  { value: "LABORATORIO", label: "LABORATORIO" },
  { value: "AMBULANCIA CARTAGO", label: "AMBULANCIA CARTAGO" },
  { value: "MORGUE", label: "MORGUE" },
  { value: "HEMODINAMIA", label: "HEMODINAMIA" },
  { value: "COMUNICACIONES", label: "COMUNICACIONES" },
  { value: "COORDINACION ACADEMICA", label: "COORDINACION ACADEMICA" },
]

export const modeloOpcionesPiso = [
  { value: "PISO1", label: "PISO1" },
  { value: "PISO2", label: "PISO2" },
  { value: "PISO3", label: "PISO3" },
  { value: "PISO4", label: "PISO4" },
  { value: "N/R", label: "N/R" },
]

export const modeloOpcionesSede = [
  { value: "SEDE PRINCIPAL", label: "SEDE PRINCIPAL" },
  { value: "NORTE", label: "NORTE" },
  { value: "CARTAGO", label: "CARTAGO" },
]

// Función para validar un área
export const validarArea = (area) => {
  const errores = []

  if (!area.nombre || area.nombre.trim() === "") {
    errores.push("El nombre del área es requerido")
  }

  if (!area.servicio) {
    errores.push("El servicio es requerido")
  }

  if (!area.piso) {
    errores.push("El piso es requerido")
  }

  return {
    esValido: errores.length === 0,
    errores,
  }
}

// Función para filtrar áreas
export const filtrarAreas = (areas, termino) => {
  if (!termino) return areas

  const terminoLower = termino.toLowerCase()
  return areas.filter(
    (area) =>
      area.nombre.toLowerCase().includes(terminoLower) ||
      area.servicio.toLowerCase().includes(terminoLower) ||
      area.sede.toLowerCase().includes(terminoLower) ||
      area.piso.toLowerCase().includes(terminoLower),
  )
}

// Función para paginar datos
export const paginarDatos = (datos, paginaActual, elementosPorPagina) => {
  const inicio = (paginaActual - 1) * elementosPorPagina
  const fin = inicio + elementosPorPagina
  return datos.slice(inicio, fin)
}
