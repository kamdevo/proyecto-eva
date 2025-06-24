"use client"

import { useState, useEffect } from "react"
import Card from "../components/Card"
import Modal from "../components/Modal"
import FilterBar from "../components/FilterBar"
import {
  fetchReportes,
  createReporte,
  updateReporte,
  deleteReporte,
  addComment,
  addRating,
} from "../services/reportesService"

const Reportes = () => {
  const [reportes, setReportes] = useState([])
  const [filteredReportes, setFilteredReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    view: false,
    comment: false,
    rating: false,
    delete: false,
  })

  useEffect(() => {
    loadReportes()
  }, [])

  const loadReportes = async () => {
    try {
      const data = await fetchReportes()
      setReportes(data)
      setFilteredReportes(data)
    } catch (error) {
      console.error("Error cargando reportes:", error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (modalName, reporte = null) => {
    setSelectedReporte(reporte)
    setModals({ ...modals, [modalName]: true })
  }

  const closeModal = (modalName) => {
    setModals({ ...modals, [modalName]: false })
    setSelectedReporte(null)
  }

  const handleFilter = (filters) => {
    let filtered = reportes

    if (filters.search) {
      filtered = filtered.filter((reporte) =>
        reporte.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        reporte.autor.toLowerCase().includes(filters.search.toLowerCase()))
    }

    if (filters.status && filters.status !== "todos") {
      filtered = filtered.filter((reporte) => reporte.estado === filters.status)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((reporte) => new Date(reporte.fecha) >= new Date(filters.dateFrom))
    }

    setFilteredReportes(filtered)
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "aprobado":
        return "✅"
      case "pendiente":
        return "⏳"
      case "revision":
        return "👁️"
      default:
        return "📄"
    }
  }

  const getStatusClass = (estado) => {
    switch (estado) {
      case "aprobado":
        return "status-approved"
      case "pendiente":
        return "status-pending"
      case "revision":
        return "status-review"
      default:
        return "status-default"
    }
  }

  if (loading) {
    return <div className="loading">Cargando reportes...</div>;
  }

  return (
    <div className="reportes">
      <div className="reportes-header">
        <div className="header-content">
          <h1>Gestión de Reportes</h1>
          <p>Administra y evalúa todos los reportes del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal("add")}>
          <span className="btn-icon">➕</span>
          Nuevo Reporte
        </button>
      </div>
      <FilterBar onFilter={handleFilter} />
      <div className="reportes-grid">
        {filteredReportes.map((reporte) => (
          <Card key={reporte.id} className="reporte-card">
            <div className="reporte-header">
              <div className="file-icon">
                {reporte.tipo === "pdf"
                  ? "📄"
                  : reporte.tipo === "excel"
                    ? "📊"
                    : reporte.tipo === "word"
                      ? "📝"
                      : "📁"}
              </div>
              <div className="reporte-info">
                <h3>{reporte.titulo}</h3>
                <p className="reporte-description">{reporte.descripcion}</p>
              </div>
            </div>

            <div className="reporte-meta">
              <div className="meta-row">
                <span className="meta-label">Autor:</span>
                <span className="meta-value">{reporte.autor}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Fecha:</span>
                <span className="meta-value">{reporte.fecha}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Estado:</span>
                <span className={`status-badge ${getStatusClass(reporte.estado)}`}>
                  {getStatusIcon(reporte.estado)} {reporte.estado}
                </span>
              </div>
            </div>

            <div className="reporte-stats">
              <div className="stat">
                <span className="stat-icon">⭐</span>
                <span>{reporte.rating}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">👁️</span>
                <span>{reporte.vistas}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">💬</span>
                <span>{reporte.comentarios}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">💾</span>
                <span>{reporte.tamaño}</span>
              </div>
            </div>

            <div className="reporte-actions">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => openModal("view", reporte)}>
                👁️ Ver
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => openModal("edit", reporte)}>
                ✏️ Editar
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => openModal("comment", reporte)}>
                💬 Comentar
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => openModal("rating", reporte)}>
                ⭐ Calificar
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => openModal("delete", reporte)}>
                🗑️ Eliminar
              </button>
            </div>
          </Card>
        ))}
      </div>
      {/* Modales */}
      {modals.add && (
        <AddReporteModal
          onSave={async (data) => {
            await createReporte(data)
            loadReportes()
            closeModal("add")
          }}
          onClose={() => closeModal("add")} />
      )}
      {modals.edit && selectedReporte && (
        <EditReporteModal
          reporte={selectedReporte}
          onSave={async (data) => {
            await updateReporte(selectedReporte.id, data)
            loadReportes()
            closeModal("edit")
          }}
          onClose={() => closeModal("edit")} />
      )}
      {modals.view && selectedReporte && (
        <ViewReporteModal reporte={selectedReporte} onClose={() => closeModal("view")} />
      )}
      {modals.comment && selectedReporte && (
        <CommentModal
          reporte={selectedReporte}
          onSave={async (comment) => {
            await addComment(selectedReporte.id, comment)
            loadReportes()
            closeModal("comment")
          }}
          onClose={() => closeModal("comment")} />
      )}
      {modals.rating && selectedReporte && (
        <RatingModal
          reporte={selectedReporte}
          onSave={async (rating) => {
            await addRating(selectedReporte.id, rating)
            loadReportes()
            closeModal("rating")
          }}
          onClose={() => closeModal("rating")} />
      )}
      {modals.delete && selectedReporte && (
        <DeleteConfirmModal
          reporte={selectedReporte}
          onConfirm={async () => {
            await deleteReporte(selectedReporte.id)
            loadReportes()
            closeModal("delete")
          }}
          onClose={() => closeModal("delete")} />
      )}
    </div>
  );
}

// Componentes de Modales
const AddReporteModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    archivo: null,
    tipo: "pdf",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal onClose={onClose} title="Nuevo Reporte">
      <form onSubmit={handleSubmit} className="reporte-form">
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows="4" />
        </div>

        <div className="form-group">
          <label>Archivo</label>
          <input
            type="file"
            onChange={(e) => setFormData({ ...formData, archivo: e.target.files[0] })}
            required />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Crear Reporte
          </button>
        </div>
      </form>
    </Modal>
  );
}

const EditReporteModal = ({ reporte, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: reporte.titulo,
    descripcion: reporte.descripcion,
    estado: reporte.estado,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal onClose={onClose} title="Editar Reporte">
      <form onSubmit={handleSubmit} className="reporte-form">
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows="4" />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
            <option value="pendiente">Pendiente</option>
            <option value="revision">En Revisión</option>
            <option value="aprobado">Aprobado</option>
          </select>
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

const ViewReporteModal = ({ reporte, onClose }) => (
  <Modal onClose={onClose} title="Ver Reporte" size="large">
    <div className="reporte-view">
      <div className="reporte-details">
        <h2>{reporte.titulo}</h2>
        <p className="description">{reporte.descripcion}</p>

        <div className="details-grid">
          <div className="detail-item">
            <strong>Autor:</strong> {reporte.autor}
          </div>
          <div className="detail-item">
            <strong>Fecha:</strong> {reporte.fecha}
          </div>
          <div className="detail-item">
            <strong>Estado:</strong> {reporte.estado}
          </div>
          <div className="detail-item">
            <strong>Tamaño:</strong> {reporte.tamaño}
          </div>
          <div className="detail-item">
            <strong>Rating:</strong> {reporte.rating} ⭐
          </div>
          <div className="detail-item">
            <strong>Vistas:</strong> {reporte.vistas}
          </div>
        </div>
      </div>
    </div>
  </Modal>
)

const CommentModal = ({ reporte, onSave, onClose }) => {
  const [comment, setComment] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(comment)
  }

  return (
    <Modal onClose={onClose} title="Agregar Comentario">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Comentario sobre: {reporte.titulo}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="6"
            placeholder="Escribe tu comentario aquí..."
            required />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Enviar Comentario
          </button>
        </div>
      </form>
    </Modal>
  );
}

const RatingModal = ({ reporte, onSave, onClose }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ rating, comment })
  }

  return (
    <Modal onClose={onClose} title="Calificar Reporte">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Calificación para: {reporte.titulo}</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? "active" : ""}`}
                onClick={() => setRating(star)}>
                ⭐
              </button>
            ))}
          </div>
          <p>Calificación: {rating} de 5 estrellas</p>
        </div>

        <div className="form-group">
          <label>Comentario (opcional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            placeholder="Comparte tu opinión sobre este reporte..." />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Enviar Calificación
          </button>
        </div>
      </form>
    </Modal>
  );
}

const DeleteConfirmModal = ({ reporte, onConfirm, onClose }) => (
  <Modal onClose={onClose} title="Confirmar Eliminación" size="small">
    <div className="delete-confirm">
      <div className="warning-icon">⚠️</div>
      <h3>¿Estás seguro?</h3>
      <p>Esta acción eliminará permanentemente el reporte:</p>
      <div className="reporte-info">
        <strong>{reporte.titulo}</strong>
        <br />
        <small>
          Creado por {reporte.autor} el {reporte.fecha}
        </small>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Eliminar Definitivamente
        </button>
      </div>
    </div>
  </Modal>
)

export default Reportes
