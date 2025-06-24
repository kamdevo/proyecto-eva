const API_BASE = "http://localhost/reportes-innovacion/api"

export const fetchArchivos = async () => {
  try {
    const response = await fetch(`${API_BASE}/archivos.php`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching archivos:", error)
    // Datos de ejemplo para desarrollo
    return [
      {
        id: 1,
        nombre: "Manual_Usuario.pdf",
        descripcion: "Manual completo del usuario",
        autor: "Ana Martínez",
        fecha: "2024-01-15",
        tipo: "pdf",
        tamaño: 2048576, // bytes
        categoria: "documentos",
        url: "/files/manual_usuario.pdf",
        thumbnail: null,
        descargas: 45,
      },
      {
        id: 2,
        nombre: "Presentacion_Proyecto.pptx",
        descripcion: "Presentación del nuevo proyecto",
        autor: "Luis Pérez",
        fecha: "2024-01-14",
        tipo: "powerpoint",
        tamaño: 5242880,
        categoria: "presentaciones",
        url: "/files/presentacion.pptx",
        thumbnail: null,
        descargas: 23,
      },
    ]
  }
}

export const uploadArchivo = async (archivoData) => {
  try {
    const formData = new FormData()
    Object.keys(archivoData).forEach((key) => {
      formData.append(key, archivoData[key])
    })

    const response = await fetch(`${API_BASE}/archivos.php`, {
      method: "POST",
      body: formData,
    })
    return await response.json();
  } catch (error) {
    console.error("Error uploading archivo:", error)
    throw error
  }
}

export const updateArchivo = async (id, archivoData) => {
  try {
    const response = await fetch(`${API_BASE}/archivos.php?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(archivoData),
    })
    return await response.json();
  } catch (error) {
    console.error("Error updating archivo:", error)
    throw error
  }
}

export const deleteArchivo = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/archivos.php?id=${id}`, {
      method: "DELETE",
    })
    return await response.json();
  } catch (error) {
    console.error("Error deleting archivo:", error)
    throw error
  }
}
