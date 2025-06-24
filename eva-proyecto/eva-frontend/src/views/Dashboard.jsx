import { useState, useEffect } from "react"
import Card from "../components/Card"
import { fetchDashboardStats } from "../services/dashboardService"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReportes: 0,
    reportesAprobados: 0,
    evidencias: 0,
    archivos: 0,
    usuariosActivos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Error cargando dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema</p>
      </div>
      <div className="stats-grid">
        <Card className="stat-card blue">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Total Reportes</h3>
              <p className="stat-number">{stats.totalReportes}</p>
              <span className="stat-change positive">+12%</span>
            </div>
            <div className="stat-icon">📄</div>
          </div>
        </Card>

        <Card className="stat-card green">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Aprobados</h3>
              <p className="stat-number">{stats.reportesAprobados}</p>
              <span className="stat-change positive">+8%</span>
            </div>
            <div className="stat-icon">✅</div>
          </div>
        </Card>

        <Card className="stat-card orange">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Evidencias</h3>
              <p className="stat-number">{stats.evidencias}</p>
              <span className="stat-change positive">+15%</span>
            </div>
            <div className="stat-icon">📸</div>
          </div>
        </Card>

        <Card className="stat-card purple">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Archivos</h3>
              <p className="stat-number">{stats.archivos}</p>
              <span className="stat-change positive">+5%</span>
            </div>
            <div className="stat-icon">📁</div>
          </div>
        </Card>
      </div>
      <div className="dashboard-content">
        <div className="recent-activity">
          <Card>
            <div className="card-header">
              <h3>Actividad Reciente</h3>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📄</div>
                <div className="activity-info">
                  <p>
                    <strong>Nuevo reporte:</strong> Análisis Q4 2024.xlsx
                  </p>
                  <span className="activity-time">hace 2 horas</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-info">
                  <p>
                    <strong>Reporte aprobado:</strong> Seguridad-Sistema.pdf
                  </p>
                  <span className="activity-time">hace 4 horas</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📸</div>
                <div className="activity-info">
                  <p>
                    <strong>Nueva evidencia:</strong> Reunión Planificación
                  </p>
                  <span className="activity-time">hace 6 horas</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="quick-actions">
          <Card>
            <div className="card-header">
              <h3>Acciones Rápidas</h3>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                <span className="action-icon">📄</span>
                <span>Nuevo Reporte</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📸</span>
                <span>Nueva Evidencia</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📁</span>
                <span>Subir Archivo</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>Ver Reportes</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard
