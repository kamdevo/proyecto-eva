const API_BASE = "http://localhost/reportes-innovacion/api"

export const fetchEvidencias = async () => {
  try {
    const response = await fetch(`${API_BASE}/evidencias.php`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching evidencias:", error)
    // Datos de ejemplo para desarrollo
    return [
      {
        id: 1,
        titulo: "Reunión de Planificación Estratégica Q1 2024",
        descripcion: "Sesión de planificación para el primer trimestre con todos los departamentos.",
        autor: "María González",
        autorAvatar: "/placeholder.svg?height=40&width=40",
        fecha: "2024-01-15 14:30",
        imagen: "/placeholder.svg?height=300&width=400",
        ubicacion: "Sala de Juntas Principal",
        asistentes: 12,
        comentarios: 5,
        comentariosRecientes: [
          {
            autor: "Carlos R.",
            autorAvatar: "/placeholder.svg?height=32&width=32",
            texto: "Excelente sesión, muy productiva",
            tiempo: "hace 2h",
          },
        ],
      },
    ]
  }
}

export const createEvidencia = async (evidenciaData) => {
  try {
    const formData = new FormData()
    Object.keys(evidenciaData).forEach((key) => {
      formData.append(key, evidenciaData[key])
    })

    const response = await fetch(`${API_BASE}/evidencias.php`, {
      method: "POST",
      body: formData,
    })
    return await response.json();
  } catch (error) {
    console.error("Error creating evidencia:", error)
    throw error
  }
}

export const updateEvidencia = async (id, evidenciaData) => {
  try {
    const response = await fetch(`${API_BASE}/evidencias.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evidenciaData),
    })
    return await response.json();
  } catch (error) {
    console.error("Error updating evidencia:", error)
    throw error
  }
}

export const deleteEvidencia = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/evidencias.php?id=${id}`, {
      method: "DELETE",
    })
    return await response.json();
  } catch (error) {
    console.error("Error deleting evidencia:", error)
    throw error
  }
}
