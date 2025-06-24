// Modelo para propietarios
export const crearPropietarioVacio = () => ({
  id: null,
  nombre: "",
  descripcion: "",
  telefono: "",
  email: "",
  direccion: "",
  sitioWeb: "",
  tipoEmpresa: "",
  logo: null,
  fechaRegistro: new Date().toISOString().split("T")[0],
  equiposAsociados: 0,
})

// Opciones para los selectores
export const modeloOpcionesTipoEmpresa = [
  { value: "Multinacional", label: "Multinacional" },
  { value: "Nacional", label: "Nacional" },
  { value: "Internacional", label: "Internacional" },
  { value: "Startup", label: "Startup" },
  { value: "Europea", label: "Europea" },
  { value: "Asiática", label: "Asiática" },
]

// Función para validar un propietario
export const validarPropietario = (propietario) => {
  const errores = []

  if (!propietario.nombre || propietario.nombre.trim() === "") {
    errores.push("El nombre del propietario es requerido")
  }

  if (!propietario.tipoEmpresa) {
    errores.push("El tipo de empresa es requerido")
  }

  if (propietario.email && !isValidEmail(propietario.email)) {
    errores.push("El formato del email no es válido")
  }

  if (propietario.sitioWeb && !isValidUrl(propietario.sitioWeb)) {
    errores.push("El formato del sitio web no es válido")
  }

  return {
    esValido: errores.length === 0,
    errores,
  }
}

// Función para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para validar URL
const isValidUrl = (url) => {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

// Función para filtrar propietarios
export const filtrarPropietarios = (propietarios, termino) => {
  if (!termino) return propietarios

  const terminoLower = termino.toLowerCase()
  return propietarios.filter(
    (propietario) =>
      propietario.nombre.toLowerCase().includes(terminoLower) ||
      propietario.descripcion.toLowerCase().includes(terminoLower) ||
      propietario.tipoEmpresa.toLowerCase().includes(terminoLower) ||
      propietario.email.toLowerCase().includes(terminoLower),
  )
}

// Función para paginar datos
export const paginarDatos = (datos, paginaActual, elementosPorPagina) => {
  const inicio = (paginaActual - 1) * elementosPorPagina
  const fin = inicio + elementosPorPagina
  return datos.slice(inicio, fin)
}
