const API_BASE = "http://localhost/reportes-innovacion/api"

export const fetchReportes = async () => {
  try {
    const response = await fetch(`${API_BASE}/reportes.php`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching reportes:", error)
    // Datos de ejemplo para desarrollo
    return [
      {
        id: 1,
        titulo: "Análisis Q4 2024.xlsx",
        descripcion: "Reporte completo del rendimiento del sistema",
        autor: "María González",
        fecha: "2024-01-15",
        estado: "aprobado",
        rating: 4.8,
        comentarios: 12,
        vistas: 245,
        tamaño: "2.4 MB",
        tipo: "excel",
      },
      {
        id: 2,
        titulo: "Funcionalidades.docx",
        descripcion: "Documentación técnica de nuevas características",
        autor: "Carlos Rodríguez",
        fecha: "2024-01-12",
        estado: "pendiente",
        rating: 4.2,
        comentarios: 8,
        vistas: 156,
        tamaño: "1.8 MB",
        tipo: "word",
      },
    ]
  }
}

export const createReporte = async (reporteData) => {
  try {
    const formData = new FormData()
    Object.keys(reporteData).forEach((key) => {
      formData.append(key, reporteData[key])
    })

    const response = await fetch(`${API_BASE}/reportes.php`, {
      method: "POST",
      body: formData,
    })
    return await response.json();
  } catch (error) {
    console.error("Error creating reporte:", error)
    throw error
  }
}

export const updateReporte = async (id, reporteData) => {
  try {
    const response = await fetch(`${API_BASE}/reportes.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reporteData),
    })
    return await response.json();
  } catch (error) {
    console.error("Error updating reporte:", error)
    throw error
  }
}

export const deleteReporte = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/reportes.php?id=${id}`, {
      method: "DELETE",
    })
    return await response.json();
  } catch (error) {
    console.error("Error deleting reporte:", error)
    throw error
  }
}

export const addComment = async (reporteId, comment) => {
  try {
    const response = await fetch(`${API_BASE}/comentarios.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reporte_id: reporteId,
        comentario: comment,
      }),
    })
    return await response.json();
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export const addRating = async (reporteId, ratingData) => {
  try {
    const response = await fetch(`${API_BASE}/calificaciones.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reporte_id: reporteId,
        ...ratingData,
      }),
    })
    return await response.json();
  } catch (error) {
    console.error("Error adding rating:", error)
    throw error
  }
}
