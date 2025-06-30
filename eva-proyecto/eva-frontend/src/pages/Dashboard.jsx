import React, { useState, useEffect } from 'react';
import { 
  FaDesktop, FaTools, FaClipboardList, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaChartLine, FaUsers
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipos: 0,
    equiposActivos: 0,
    mantenimientosPendientes: 0,
    ordenesPendientes: 0,
    alertas: 0
  });

  useEffect(() => {
    // Simular carga de estadísticas
    // En producción, esto vendría de la API
    setStats({
      totalEquipos: 1250,
      equiposActivos: 1180,
      mantenimientosPendientes: 45,
      ordenesPendientes: 23,
      alertas: 8
    });
  }, []);

  const StatCard = ({ icon, title, value, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {trend && (
          <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );

  const recentActivities = [
    {
      id: 1,
      type: 'mantenimiento',
      description: 'Mantenimiento preventivo completado - Equipo #EQ001',
      time: '2 horas ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'alerta',
      description: 'Calibración vencida - Equipo #EQ045',
      time: '4 horas ago',
      status: 'warning'
    },
    {
      id: 3,
      type: 'orden',
      description: 'Nueva orden de trabajo creada - OT#2024001',
      time: '6 horas ago',
      status: 'pending'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido, {user?.nombre}</p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<FaDesktop />}
          title="Total Equipos"
          value={stats.totalEquipos.toLocaleString()}
          color="blue"
          trend={5.2}
        />
        <StatCard
          icon={<FaCheckCircle />}
          title="Equipos Activos"
          value={stats.equiposActivos.toLocaleString()}
          color="green"
          trend={2.1}
        />
        <StatCard
          icon={<FaTools />}
          title="Mantenimientos Pendientes"
          value={stats.mantenimientosPendientes}
          color="orange"
          trend={-8.3}
        />
        <StatCard
          icon={<FaClipboardList />}
          title="Órdenes Pendientes"
          value={stats.ordenesPendientes}
          color="purple"
          trend={12.5}
        />
        <StatCard
          icon={<FaExclamationTriangle />}
          title="Alertas Activas"
          value={stats.alertas}
          color="red"
          trend={-15.2}
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className={`activity-item ${activity.status}`}>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status === 'completed' && <FaCheckCircle />}
                  {activity.status === 'warning' && <FaExclamationTriangle />}
                  {activity.status === 'pending' && <FaClock />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Accesos Rápidos</h2>
          <div className="quick-actions">
            <button className="quick-action-btn">
              <FaDesktop />
              <span>Nuevo Equipo</span>
            </button>
            <button className="quick-action-btn">
              <FaTools />
              <span>Programar Mantenimiento</span>
            </button>
            <button className="quick-action-btn">
              <FaClipboardList />
              <span>Nueva Orden</span>
            </button>
            <button className="quick-action-btn">
              <FaChartLine />
              <span>Reportes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
