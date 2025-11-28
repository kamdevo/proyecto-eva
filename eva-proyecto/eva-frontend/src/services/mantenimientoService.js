// Servicio para manejar las llamadas a APIs de mantenimiento preventivo

// Configuración base - Usar variables de entorno
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/api`;
const API_V1_URL = `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/api/v1`;

const mantenimientoService = {
  // Obtener cronograma de mantenimientos (datos mixtos para página principal)
  async getPlanes(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.anio) params.append('anio', filters.anio);
    if (filters.equipo_id) params.append('equipo_id', filters.equipo_id);
    if (filters.responsable) params.append('responsable', filters.responsable);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    
    // Usar endpoint de cronograma para datos mixtos (planificación + ejecución)
    const response = await fetch(`${API_V1_URL}/cronograma-mantenimientos?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  },

  // Crear nuevo plan de mantenimiento
  async createPlan(planData) {
    const response = await fetch(`${API_V1_URL}/planes-mantenimientos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(planData),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Actualizar plan de mantenimiento
  async updatePlan(id, planData) {
    const response = await fetch(`${API_V1_URL}/planes-mantenimientos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(planData),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Eliminar plan de mantenimiento
  async deletePlan(id) {
    const response = await fetch(`${API_V1_URL}/planes-mantenimientos/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Obtener proveedores de mantenimiento
  async getProveedores(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    
    const response = await fetch(`${API_V1_URL}/proveedores-mantenimiento?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Obtener equipos
  async getEquipos(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.servicio_id) params.append('servicio_id', filters.servicio_id);
    if (filters.estado_id) params.append('estado_id', filters.estado_id);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    
    const response = await fetch(`${API_V1_URL}/equipos/medical-devices-complete?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Subir archivo Excel
  async uploadExcel(formData) {
    const response = await fetch(`${API_V1_URL}/planes-mantenimientos/upload-excel`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Exportar datos consolidados
  async exportConsolidado(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.anio) params.append('anio', filters.anio);
    if (filters.formato) params.append('formato', filters.formato);
    
    const response = await fetch(`${API_V1_URL}/planes-mantenimientos/export?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Para archivos Excel, retornar el blob
    if (filters.formato === 'excel') {
      return await response.blob();
    }
    
    return await response.json();
  },

  // Descargar plantilla de importación
  async downloadTemplate() {
    const response = await fetch(`${API_V1_URL}/planes-mantenimientos/download-template`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.blob();
  }
};

export default mantenimientoService;
