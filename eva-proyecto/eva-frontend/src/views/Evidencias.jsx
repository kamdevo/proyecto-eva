import { useState, useEffect } from "react"
import Card from "../components/Card"
import Modal from "../components/Modal"
import FilterBar from "../components/FilterBar"
import { fetchEvidencias, createEvidencia, updateEvidencia, deleteEvidencia } from "../services/evidenciasService"

const Evidencias = () => {
  const [evidencias, setEvidencias] = useState([])
  const [filteredEvidencias, setFilteredEvidencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvidencia, setSelectedEvidencia] = useState(null)
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    view: false,
    delete: false,
  })

  useEffect(() => {
    loadEvidencias()
  }, [])

  const loadEvidencias = async () => {
    try {
      const data = await fetchEvidencias()
      setEvidencias(data)
      setFilteredEvidencias(data)
    } catch (error) {
      console.error("Error cargando evidencias:", error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (modalName, evidencia = null) => {
    setSelectedEvidencia(evidencia)
    setModals({ ...modals, [modalName]: true })
  }

  const closeModal = (modalName) => {
    setModals({ ...modals, [modalName]: false })
    setSelectedEvidencia(null)
  }

  const handleFilter = (filters) => {
    let filtered = evidencias

    if (filters.search) {
      filtered = filtered.filter((evidencia) =>
        evidencia.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        evidencia.ubicacion.toLowerCase().includes(filters.search.toLowerCase()))
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((evidencia) => new Date(evidencia.fecha) >= new Date(filters.dateFrom))
    }

    setFilteredEvidencias(filtered)
  }

  if (loading) {
    return <div className="loading">Cargando evidencias...</div>;
  }

  return (
    <div className="evidencias">
      <div className="evidencias-header">
        <div className="header-content">
          <h1>Evidencias de Reuniones</h1>
          <p>Documenta y comparte evidencias de tus reuniones</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal("add")}>
          <span className="btn-icon">📸</span>
          Nueva Evidencia
        </button>
      </div>
      <FilterBar onFilter={handleFilter} />
      <div className="evidencias-feed">
        {filteredEvidencias.map((evidencia) => (
          <Card key={evidencia.id} className="evidencia-card">
            <div className="evidencia-header">
              <div className="author-info">
                <img
                  src={evidencia.autorAvatar || "/placeholder.svg?height=40&width=40"}
                  alt="Avatar"
                  className="author-avatar" />
                <div className="author-details">
                  <h4>{evidencia.autor}</h4>
                  <span className="author-role">Organizador</span>
                </div>
              </div>
              <div className="evidencia-meta">
                <div className="meta-item">
                  <span className="meta-icon">🕒</span>
                  <span>{evidencia.fecha}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span>{evidencia.ubicacion}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span>{evidencia.asistentes} asistentes</span>
                </div>
              </div>
            </div>

            <div className="evidencia-content">
              <h3>{evidencia.titulo}</h3>
              <p>{evidencia.descripcion}</p>

              {evidencia.imagen && (
                <div className="evidencia-image">
                  <img
                    src={evidencia.imagen || "/placeholder.svg"}
                    alt={evidencia.titulo}
                    onClick={() => openModal("view", evidencia)} />
                </div>
              )}
            </div>

            <div className="evidencia-actions">
              <button className="action-btn">
                <span className="action-icon">❤️</span>
                <span>Me gusta</span>
              </button>
              <button className="action-btn" onClick={() => openModal("view", evidencia)}>
                <span className="action-icon">💬</span>
                <span>Comentar ({evidencia.comentarios})</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📤</span>
                <span>Compartir</span>
              </button>
              <div className="action-menu">
                <button className="action-btn" onClick={() => openModal("edit", evidencia)}>
                  ✏️ Editar
                </button>
                <button
                  className="action-btn danger"
                  onClick={() => openModal("delete", evidencia)}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>

            {evidencia.comentariosRecientes && evidencia.comentariosRecientes.length > 0 && (
              <div className="evidencia-comments">
                {evidencia.comentariosRecientes.map((comentario, index) => (
                  <div key={index} className="comment">
                    <img
                      src={comentario.autorAvatar || "/placeholder.svg?height=32&width=32"}
                      alt="Avatar"
                      className="comment-avatar" />
                    <div className="comment-content">
                      <div className="comment-header">
                        <strong>{comentario.autor}</strong>
                        <span className="comment-time">{comentario.tiempo}</span>
                      </div>
                      <p>{comentario.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
      {/* Modales */}
      {modals.add && (
        <AddEvidenciaModal
          onSave={async (data) => {
            await createEvidencia(data)
            loadEvidencias()
            closeModal("add")
          }}
          onClose={() => closeModal("add")} />
      )}
      {modals.edit && selectedEvidencia && (
        <EditEvidenciaModal
          evidencia={selectedEvidencia}
          onSave={async (data) => {
            await updateEvidencia(selectedEvidencia.id, data)
            loadEvidencias()
            closeModal("edit")
          }}
          onClose={() => closeModal("edit")} />
      )}
      {modals.view && selectedEvidencia && (
        <ViewEvidenciaModal evidencia={selectedEvidencia} onClose={() => closeModal("view")} />
      )}
      {modals.delete && selectedEvidencia && (
        <DeleteConfirmModal
          evidencia={selectedEvidencia}
          onConfirm={async () => {
            await deleteEvidencia(selectedEvidencia.id)
            loadEvidencias()
            closeModal("delete")
          }}
          onClose={() => closeModal("delete")} />
      )}
    </div>
  );
}

// Componentes de Modales
const AddEvidenciaModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    asistentes: "",
    imagen: null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal onClose={onClose} title="Nueva Evidencia de Reunión">
      <form onSubmit={handleSubmit} className="evidencia-form">
        <div className="form-group">
          <label>Título de la Reunión</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Reunión de Planificación Q1 2024"
            required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows="4"
            placeholder="Describe los temas tratados en la reunión..." />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Sala de Juntas" />
          </div>

          <div className="form-group">
            <label>Número de Asistentes</label>
            <input
              type="number"
              value={formData.asistentes}
              onChange={(e) => setFormData({ ...formData, asistentes: e.target.value })}
              placeholder="12" />
          </div>
        </div>

        <div className="form-group">
          <label>Foto de la Reunión</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })} />
            <div className="upload-placeholder">
              <span className="upload-icon">📸</span>
              <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Publicar Evidencia
          </button>
        </div>
      </form>
    </Modal>
  );
}

const EditEvidenciaModal = ({ evidencia, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: evidencia.titulo,
    descripcion: evidencia.descripcion,
    ubicacion: evidencia.ubicacion,
    asistentes: evidencia.asistentes,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal onClose={onClose} title="Editar Evidencia">
      <form onSubmit={handleSubmit} className="evidencia-form">
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

        <div className="form-row">
          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Asistentes</label>
            <input
              type="number"
              value={formData.asistentes}
              onChange={(e) => setFormData({ ...formData, asistentes: e.target.value })} />
          </div>
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

const ViewEvidenciaModal = ({ evidencia, onClose }) => (
  <Modal onClose={onClose} title="Ver Evidencia" size="large">
    <div className="evidencia-view">
      <div className="evidencia-header">
        <h2>{evidencia.titulo}</h2>
        <div className="evidencia-meta">
          <span>📅 {evidencia.fecha}</span>
          <span>📍 {evidencia.ubicacion}</span>
          <span>👥 {evidencia.asistentes} asistentes</span>
        </div>
      </div>

      <div className="evidencia-content">
        <p>{evidencia.descripcion}</p>

        {evidencia.imagen && (
          <div className="evidencia-image-full">
            <img src={evidencia.imagen || "/placeholder.svg"} alt={evidencia.titulo} />
          </div>
        )}
      </div>

      <div className="evidencia-comments-section">
        <h3>Comentarios</h3>
        <div className="comments-list">
          {evidencia.comentarios &&
            evidencia.comentarios.map((comentario, index) => (
              <div key={index} className="comment-full">
                <img
                  src={comentario.autorAvatar || "/placeholder.svg?height=40&width=40"}
                  alt="Avatar"
                  className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>{comentario.autor}</strong>
                    <span className="comment-time">{comentario.tiempo}</span>
                  </div>
                  <p>{comentario.texto}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="add-comment">
          <textarea placeholder="Escribe un comentario..." rows="3"></textarea>
          <button className="btn btn-primary">Comentar</button>
        </div>
      </div>
    </div>
  </Modal>
)

const DeleteConfirmModal = ({ evidencia, onConfirm, onClose }) => (
  <Modal onClose={onClose} title="Confirmar Eliminación" size="small">
    <div className="delete-confirm">
      <div className="warning-icon">⚠️</div>
      <h3>¿Estás seguro?</h3>
      <p>Esta acción eliminará permanentemente la evidencia:</p>
      <div className="evidencia-info">
        <strong>{evidencia.titulo}</strong>
        <br />
        <small>Creada el {evidencia.fecha}</small>
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

export default Evidencias
