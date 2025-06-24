// Datos de ejemplo para sistemas
export const modeloDatosSistemasEjemplo = [
  { estado: "activo", cantidad: 45, porcentaje: 45, color: "#3b82f6" },
  { estado: "inactivo", cantidad: 30, porcentaje: 30, color: "#f97316" },
  { estado: "reparado", cantidad: 15, porcentaje: 15, color: "#10b981" },
  { estado: "otro", cantidad: 10, porcentaje: 10, color: "#ef4444" },
]

// Datos de ejemplo para correctivos
export const modeloDatosCorrectivosEjemplo = [
  { estado: "abierto", cantidad: 25, porcentaje: 25, color: "#3b82f6" },
  { estado: "cerrado", cantidad: 50, porcentaje: 50, color: "#f97316" },
  { estado: "ejecucion", cantidad: 10, porcentaje: 10, color: "#10b981" },
  { estado: "escalado", cantidad: 8, porcentaje: 8, color: "#ef4444" },
  { estado: "pausado", cantidad: 5, porcentaje: 5, color: "#8b5cf6" },
  { estado: "otro", cantidad: 2, porcentaje: 2, color: "#6b7280" },
]

// Función para calcular estadísticas
export const calcularEstadisticas = (sistemas, correctivos) => ({
  sistemas: sistemas || modeloDatosSistemasEjemplo,
  correctivos: correctivos || modeloDatosCorrectivosEjemplo,
  totalSistemas: (sistemas || modeloDatosSistemasEjemplo).reduce((total, item) => total + item.cantidad, 0),
  totalCorrectivos: (correctivos || modeloDatosCorrectivosEjemplo).reduce((total, item) => total + item.cantidad, 0),
})
