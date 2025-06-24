"use client"

import { useState, useEffect } from "react"
import Card from "../components/Card"
import Modal from "../components/Modal"
import { fetchUserProfile, updateUserProfile } from "../services/perfilService"

const Perfil = () => {
  const [profile, setProfile] = useState({
    nombre: "",
    email: "",
    biografia: "",
    avatar: "",
    fechaRegistro: "",
    totalReportes: 0,
    totalEvidencias: 0,
    totalArchivos: 0,
    almacenamientoUsado: "0 GB",
  })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile()
      setProfile(data)
    } catch (error) {
      console.error("Error cargando perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (updatedProfile) => {
    try {
      await updateUserProfile(updatedProfile)
      setProfile(updatedProfile)
      setEditModalOpen(false)
    } catch (error) {
      console.error("Error actualizando perfil:", error)
    }
  }

  if (loading) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="perfil">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <button className="btn btn-primary" onClick={() => setEditModalOpen(true)}>
          Editar Perfil
        </button>
      </div>
      <div className="perfil-content">
        <div className="perfil-main">
          <Card className="perfil-card">
            <div className="perfil-info">
              <div className="avatar-section">
                <img
                  src={profile.avatar || "/placeholder.svg?height=120&width=120"}
                  alt="Avatar"
                  className="avatar-large" />
                <div className="status-indicator online"></div>
              </div>

              <div className="user-details">
                <h2>{profile.nombre}</h2>
                <p className="email">{profile.email}</p>
                <p className="biografia">{profile.biografia}</p>
                <div className="user-meta">
                  <span className="join-date">📅 Miembro desde {profile.fechaRegistro}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="perfil-stats">
            <Card className="stat-item">
              <div className="stat-content">
                <span className="stat-icon">📄</span>
                <div className="stat-info">
                  <h3>{profile.totalReportes}</h3>
                  <p>Reportes</p>
                </div>
              </div>
            </Card>

            <Card className="stat-item">
              <div className="stat-content">
                <span className="stat-icon">📸</span>
                <div className="stat-info">
                  <h3>{profile.totalEvidencias}</h3>
                  <p>Evidencias</p>
                </div>
              </div>
            </Card>

            <Card className="stat-item">
              <div className="stat-content">
                <span className="stat-icon">📁</span>
                <div className="stat-info">
                  <h3>{profile.totalArchivos}</h3>
                  <p>Archivos</p>
                </div>
              </div>
            </Card>

            <Card className="stat-item">
              <div className="stat-content">
                <span className="stat-icon">💾</span>
                <div className="stat-info">
                  <h3>{profile.almacenamientoUsado}</h3>
                  <p>Almacenamiento</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="perfil-sidebar">
          <Card>
            <div className="card-header">
              <h3>Actividad Reciente</h3>
            </div>
            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-dot green"></div>
                <div className="timeline-content">
                  <p>Subió reporte.pdf</p>
                  <span>hace 2 horas</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot blue"></div>
                <div className="timeline-content">
                  <p>Creó nueva evidencia</p>
                  <span>hace 5 horas</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot orange"></div>
                <div className="timeline-content">
                  <p>Actualizó perfil</p>
                  <span>hace 1 día</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {editModalOpen && (
        <EditProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setEditModalOpen(false)} />
      )}
    </div>
  );
}

const EditProfileModal = ({ profile, onSave, onClose }) => {
  const [formData, setFormData] = useState(profile)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Modal onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required />
        </div>

        <div className="form-group">
          <label>Biografía</label>
          <textarea
            name="biografia"
            value={formData.biografia}
            onChange={handleChange}
            rows="4" />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar Cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default Perfil
