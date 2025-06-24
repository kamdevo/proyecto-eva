"use client"

import { useState, useEffect } from "react"
import Card from "../components/Card"
import Modal from "../components/Modal"
import FilterBar from "../components/FilterBar"
import { fetchArchivos, uploadArchivo, updateArchivo, deleteArchivo } from "../services/archivosService"

const Archivos = () => {
  const [archivos, setArchivos] = useState([])
  const [filteredArchivos, setFilteredArchivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArchivo, setSelectedArchivo] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // 'grid' o 'list'
  const [modals, setModals] = useState({
    upload: false,
    edit: false,
    view: false,
    delete: false,
  })

  useEffect(() => {
    loadArchivos()
  }, [])

  const loadArchivos = async () => {
    try {
      const data = await fetchArchivos()
      setArchivos(data)
      setFilteredArchivos(data)
    } catch (error) {
      console.error("Error cargando archivos:", error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (modalName, archivo = null) => {
    setSelectedArchivo(archivo)
    setModals({ ...modals, [modalName]: true })
  }

  const closeModal = (modalName) => {
    setModals({ ...modals, [modalName]: false })
    setSelectedArchivo(null)
  }

  const handleFilter = (filters) => {
    let filtered = archivos

    if (filters.search) {
      filtered = filtered.filter((archivo) =>
        archivo.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        archivo.autor.toLowerCase().includes(filters.search.toLowerCase()))
    }

    if (filters.type && filters.type !== "todos") {
      filtered = filtered.filter((archivo) => archivo.tipo === filters.type)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((archivo) => new Date(archivo.fecha) >= new Date(filters.dateFrom))
    }

    setFilteredArchivos(filtered)
  }

  const getFileIcon = (tipo) => {
    switch (tipo) {
      case "pdf":
        return "📄"
      case "excel":
        return "📊"
      case "word":
        return "📝"
      case "powerpoint":
        return "📋"
      case "image":
        return "🖼️"
      case "video":
        return "🎥"
      case "audio":
        return "🎵"
      case "zip":
        return "📦"
      default:
        return "📁"
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  if (loading) {
    return <div className="loading">Cargando archivos...</div>;
  }

  return (
    <div className="archivos">
      <div className="archivos-header">
        <div className="header-content">
          <h1>Gestión de Archivos</h1>
          <p>Organiza y administra todos tus archivos</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}>
              ⊞ Grid
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}>
              ☰ Lista
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => openModal("upload")}>
            <span className="btn-icon">📤</span>
            Subir Archivo
          </button>
        </div>
      </div>
      <FilterBar
        onFilter={handleFilter}
        showTypeFilter={true}
        typeOptions={[
          { value: "todos", label: "Todos los tipos" },
          { value: "pdf", label: "PDF" },
          { value: "excel", label: "Excel" },
          { value: "word", label: "Word" },
          { value: "image", label: "Imágenes" },
          { value: "video", label: "Videos" },
          { value: "audio", label: "Audio" },
        ]} />
      <div className={`archivos-container ${viewMode}`}>
        {viewMode === "grid" ? (
          <div className="archivos-grid">
            {filteredArchivos.map((archivo) => (
              <Card key={archivo.id} className="archivo-card">
                <div className="archivo-preview">
                  <div className="file-icon-large">{getFileIcon(archivo.tipo)}</div>
                  {archivo.tipo === "image" && archivo.thumbnail && (
                    <img
                      src={archivo.thumbnail || "/placeholder.svg"}
                      alt={archivo.nombre}
                      className="file-thumbnail" />
                  )}
                </div>

                <div className="archivo-info">
                  <h3 className="archivo-nombre" title={archivo.nombre}>
                    {archivo.nombre}
                  </h3>
                  <p className="archivo-size">{formatFileSize(archivo.tamaño)}</p>
                  <p className="archivo-date">{archivo.fecha}</p>
                </div>

                <div className="archivo-actions">
                  <button
                    className="action-btn"
                    onClick={() => openModal("view", archivo)}
                    title="Ver detalles">
                    👁️
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => window.open(archivo.url, "_blank")}
                    title="Descargar">
                    📥
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => openModal("edit", archivo)}
                    title="Editar">
                    ✏️
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => openModal("delete", archivo)}
                    title="Eliminar">
                    🗑️
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="archivos-list">
            <div className="list-header">
              <div className="col-name">Nombre</div>
              <div className="col-author">Autor</div>
              <div className="col-size">Tamaño</div>
              <div className="col-date">Fecha</div>
              <div className="col-actions">Acciones</div>
            </div>

            {filteredArchivos.map((archivo) => (
              <div key={archivo.id} className="archivo-row">
                <div className="col-name">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(archivo.tipo)}</span>
                    <span className="file-name">{archivo.nombre}</span>
                  </div>
                </div>
                <div className="col-author">{archivo.autor}</div>
                <div className="col-size">{formatFileSize(archivo.tamaño)}</div>
                <div className="col-date">{archivo.fecha}</div>
                <div className="col-actions">
                  <button className="action-btn-sm" onClick={() => openModal("view", archivo)}>
                    👁️
                  </button>
                  <button
                    className="action-btn-sm"
                    onClick={() => window.open(archivo.url, "_blank")}>
                    📥
                  </button>
                  <button className="action-btn-sm" onClick={() => openModal("edit", archivo)}>
                    ✏️
                  </button>
                  <button
                    className="action-btn-sm danger"
                    onClick={() => openModal("delete", archivo)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modales */}
      {modals.upload && (
        <UploadArchivoModal
          onSave={async (data) => {
            await uploadArchivo(data)
            loadArchivos()
            closeModal("upload")
          }}
          onClose={() => closeModal("upload")} />
      )}
      {modals.edit && selectedArchivo && (
        <EditArchivoModal
          archivo={selectedArchivo}
          onSave={async (data) => {
            await updateArchivo(selectedArchivo.id, data)
            loadArchivos()
            closeModal("edit")
          }}
          onClose={() => closeModal("edit")} />
      )}
      {modals.view && selectedArchivo && (
        <ViewArchivoModal archivo={selectedArchivo} onClose={() => closeModal("view")} />
      )}
      {modals.delete && selectedArchivo && (
        <DeleteConfirmModal
          archivo={selectedArchivo}
          onConfirm={async () => {
            await deleteArchivo(selectedArchivo.id)
            loadArchivos()
            closeModal("delete")
          }}
          onClose={() => closeModal("delete")} />
      )}
    </div>
  );
}

// Componentes de Modales
const UploadArchivoModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    archivo: null,
    categoria: "general",
  })
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.archivo) {
      alert("Por favor selecciona un archivo")
      return
    }
    onSave(formData)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setFormData({
        ...formData,
        archivo: file,
        nombre: formData.nombre || file.name,
      })
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        archivo: file,
        nombre: formData.nombre || file.name,
      })
    }
  }

  return (
    <Modal onClose={onClose} title="Subir Archivo">
      <form onSubmit={handleSubmit} className="archivo-form">
        <div className="form-group">
          <label>Nombre del Archivo</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre descriptivo del archivo"
            required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows="3"
            placeholder="Descripción opcional del archivo" />
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
            <option value="general">General</option>
            <option value="documentos">Documentos</option>
            <option value="imagenes">Imágenes</option>
            <option value="videos">Videos</option>
            <option value="audio">Audio</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div className="form-group">
          <label>Archivo</label>
          <div
            className={`file-upload-area ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <input
              type="file"
              onChange={handleFileSelect}
              className="file-input"
              id="file-upload" />
            <label htmlFor="file-upload" className="file-upload-label">
              <div className="upload-icon">📤</div>
              <div className="upload-text">
                {formData.archivo ? (
                  <p>
                    <strong>{formData.archivo.name}</strong>
                  </p>
                ) : (
                  <>
                    <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
                    <p className="upload-hint">Máximo 50MB</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Subir Archivo
          </button>
        </div>
      </form>
    </Modal>
  );
}

const EditArchivoModal = ({ archivo, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: archivo.nombre,
    descripcion: archivo.descripcion || "",
    categoria: archivo.categoria || "general",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal onClose={onClose} title="Editar Archivo">
      <form onSubmit={handleSubmit} className="archivo-form">
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows="3" />
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
            <option value="general">General</option>
            <option value="documentos">Documentos</option>
            <option value="imagenes">Imágenes</option>
            <option value="videos">Videos</option>
            <option value="audio">Audio</option>
            <option value="otros">Otros</option>
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

const ViewArchivoModal = ({ archivo, onClose }) => (
  <Modal onClose={onClose} title="Detalles del Archivo" size="large">
    <div className="archivo-details">
      <div className="archivo-preview-large">
        <div className="file-icon-xl">
          {archivo.tipo === "image" && archivo.thumbnail ? (
            <img src={archivo.thumbnail || "/placeholder.svg"} alt={archivo.nombre} />
          ) : (
            <span className="file-type-icon">
              {archivo.tipo === "pdf"
                ? "📄"
                : archivo.tipo === "excel"
                  ? "📊"
                  : archivo.tipo === "word"
                    ? "📝"
                    : archivo.tipo === "image"
                      ? "🖼️"
                      : archivo.tipo === "video"
                        ? "🎥"
                        : archivo.tipo === "audio"
                          ? "🎵"
                          : "📁"}
            </span>
          )}
        </div>
      </div>

      <div className="archivo-info-detailed">
        <h2>{archivo.nombre}</h2>

        <div className="info-grid">
          <div className="info-item">
            <strong>Tipo:</strong> {archivo.tipo.toUpperCase()}
          </div>
          <div className="info-item">
            <strong>Tamaño:</strong> {archivo.tamaño}
          </div>
          <div className="info-item">
            <strong>Autor:</strong> {archivo.autor}
          </div>
          <div className="info-item">
            <strong>Fecha:</strong> {archivo.fecha}
          </div>
          <div className="info-item">
            <strong>Categoría:</strong> {archivo.categoria}
          </div>
          <div className="info-item">
            <strong>Descargas:</strong> {archivo.descargas || 0}
          </div>
        </div>

        {archivo.descripcion && (
          <div className="archivo-description">
            <strong>Descripción:</strong>
            <p>{archivo.descripcion}</p>
          </div>
        )}

        <div className="archivo-actions-detailed">
          <button
            className="btn btn-primary"
            onClick={() => window.open(archivo.url, "_blank")}>
            📥 Descargar
          </button>
          <button className="btn btn-outline">📤 Compartir</button>
          <button className="btn btn-outline">📋 Copiar Enlace</button>
        </div>
      </div>
    </div>
  </Modal>
)

const DeleteConfirmModal = ({ archivo, onConfirm, onClose }) => (
  <Modal onClose={onClose} title="Confirmar Eliminación" size="small">
    <div className="delete-confirm">
      <div className="warning-icon">⚠️</div>
      <h3>¿Estás seguro?</h3>
      <p>Esta acción eliminará permanentemente el archivo:</p>
      <div className="archivo-info">
        <strong>{archivo.nombre}</strong>
        <br />
        <small>
          Subido por {archivo.autor} el {archivo.fecha}
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

export default Archivos
