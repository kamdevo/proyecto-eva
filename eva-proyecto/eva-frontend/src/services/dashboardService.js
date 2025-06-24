const API_BASE = "http://localhost/reportes-innovacion/api"

export const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard.php`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    // Datos de ejemplo para desarrollo
    return {
      totalReportes: 1247,
      reportesAprobados: 892,
      evidencias: 234,
      archivos: 567,
      usuariosActivos: 156,
    }
  }
}
