// Modelo para servicios
export const crearServicioVacio = () => ({
  id: null,
  nombre: "",
  zona: "",
  piso: "",
  centroCosto: "",
  sede: "",
  equiposAsociados: 0,
  areasAsociadas: 0,
})

// Opciones para los selectores
export const modeloOpcionesZona = [
  { value: "ZONA MOLANO1", label: "ZONA MOLANO1" },
  { value: "ZONA CRISTIAN", label: "ZONA CRISTIAN" },
  { value: "ZONA SALUD1", label: "ZONA SALUD1" },
  { value: "N/R", label: "N/R" },
]

export const modeloOpcionesPiso = [
  { value: "PISO1", label: "PISO 1" },
  { value: "PISO2", label: "PISO 2" },
  { value: "PISO3", label: "PISO 3" },
  { value: "N/R", label: "N/R" },
]

export const modeloOpcionesCentroCosto = [
  { value: "ADMINISTRACION UES URGENCIAS", label: "ADMINISTRACION UES URGENCIAS" },
  { value: "ALMACEN GENERAL", label: "ALMACEN GENERAL" },
  { value: "GINECOBSTETRICIA", label: "GINECOBSTETRICIA" },
  { value: "INVENTARIOS", label: "INVENTARIOS" },
  { value: "HEMODINAMIA", label: "HEMODINAMIA" },
  { value: "SALA CIRUGIA PEDIATRICA ANA FR", label: "SALA CIRUGIA PEDIATRICA ANA FR" },
  { value: "SALA PEDIATRIA GENERAL", label: "SALA PEDIATRIA GENERAL" },
]

export const modeloOpcionesSede = [
  { value: "SEDE PRINCIPAL", label: "SEDE PRINCIPAL" },
  { value: "NORTE", label: "NORTE" },
  { value: "CARTAGO", label: "CARTAGO" },
]

// Función para validar un servicio
export const validarServicio = (servicio) => {
  const errores = []

  if (!servicio.nombre || servicio.nombre.trim() === "") {
    errores.push("El nombre del servicio es requerido")
  }

  if (!servicio.zona) {
    errores.push("La zona es requerida")
  }

  if (!servicio.centroCosto) {
    errores.push("El centro de costo es requerido")
  }

  if (!servicio.sede) {
    errores.push("La sede es requerida")
  }

  return {
    esValido: errores.length === 0,
    errores,
  }
}
