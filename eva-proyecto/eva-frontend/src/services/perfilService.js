const API_BASE = "http://localhost/reportes-innovacion/api"

export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE}/perfil.php`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching user profile:", error)
    // Datos de ejemplo para desarrollo
    return {
      nombre: "John Doe",
      email: "john.doe@example.com",
      biografia: "Desarrollador Full Stack especializado en React y PHP",
      avatar: "/placeholder.svg?height=120&width=120",
      fechaRegistro: "15 Enero 2023",
      totalReportes: 45,
      totalEvidencias: 23,
      totalArchivos: 89,
      almacenamientoUsado: "2.4 GB",
    }
  }
}

export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE}/perfil.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}
