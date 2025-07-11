import api from "../config/apiClient";

/**
 * Servicio para gestión de equipos médicos
 * Integra completamente con el backend EVA para equipos biomédicos
 */
class MedicalDevicesService {
  /**
   * Obtiene todos los equipos médicos con información completa
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Respuesta de la API
   */
  async getAllMedicalDevices(params = {}) {
    try {
      const {
        page = 1,
        per_page = 15,
        search = "",
        servicio_id = "",
        area_id = "",
        sede_id = "",
        estado_id = "",
        clasificacion_id = "",
        riesgo_id = "",
        propietario_id = "",
        sort_by = "name",
        sort_order = "asc",
      } = params;

      const queryParams = new URLSearchParams({
        page,
        per_page,
        ...(search && { search }),
        ...(servicio_id && { servicio_id }),
        ...(area_id && { area_id }),
        ...(sede_id && { sede_id }),
        ...(estado_id && { estado_id }),
        ...(clasificacion_id && { clasificacion_id }),
        ...(riesgo_id && { riesgo_id }),
        ...(propietario_id && { propietario_id }),
        sort_by,
        sort_order,
      });

      const response = await api.get(
        `/v1/equipos/medical-devices-complete?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medical devices:", error);
      throw error;
    }
  }

  /**
   * Obtiene un equipo médico específico por ID
   * @param {number} id - ID del equipo
   * @returns {Promise} Datos del equipo
   */
  async getMedicalDeviceById(id) {
    try {
      const response = await api.get(`/v1/equipos/${id}/complete-info`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical device:", error);
      throw error;
    }
  }

  /**
   * Crea un nuevo equipo médico
   * @param {Object} deviceData - Datos del equipo
   * @returns {Promise} Respuesta de la API
   */
  async createMedicalDevice(deviceData) {
    try {
      const response = await api.post("/v1/equipos", deviceData);
      return response.data;
    } catch (error) {
      console.error("Error creating medical device:", error);
      throw error;
    }
  }

  /**
   * Actualiza un equipo médico existente
   * @param {number} id - ID del equipo
   * @param {Object} deviceData - Datos actualizados
   * @returns {Promise} Respuesta de la API
   */
  async updateMedicalDevice(id, deviceData) {
    try {
      const response = await api.put(`/v1/equipos/${id}`, deviceData);
      return response.data;
    } catch (error) {
      console.error("Error updating medical device:", error);
      throw error;
    }
  }

  /**
   * Elimina un equipo médico
   * @param {number} id - ID del equipo
   * @returns {Promise} Respuesta de la API
   */
  async deleteMedicalDevice(id) {
    try {
      const response = await api.delete(`/v1/equipos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting medical device:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de mantenimientos de un equipo
   * @param {number} id - ID del equipo
   * @returns {Promise} Historial de mantenimientos
   */
  async getMaintenanceHistory(id) {
    try {
      const response = await api.get(`/v1/equipos/${id}/mantenimientos`);
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de calibraciones de un equipo
   * @param {number} id - ID del equipo
   * @returns {Promise} Historial de calibraciones
   */
  async getCalibrationHistory(id) {
    try {
      const response = await api.get(`/v1/equipos/${id}/calibraciones`);
      return response.data;
    } catch (error) {
      console.error("Error fetching calibration history:", error);
      throw error;
    }
  }

  /**
   * Obtiene los documentos asociados a un equipo
   * @param {number} id - ID del equipo
   * @returns {Promise} Lista de documentos
   */
  async getDeviceDocuments(id) {
    try {
      const response = await api.get(`/v1/equipos/${id}/documentos`);
      return response.data;
    } catch (error) {
      console.error("Error fetching device documents:", error);
      throw error;
    }
  }

  /**
   * Sube un documento para un equipo
   * @param {number} id - ID del equipo
   * @param {FormData} formData - Datos del archivo
   * @returns {Promise} Respuesta de la API
   */
  async uploadDocument(id, formData) {
    try {
      const response = await api.post(
        `/v1/equipos/${id}/documentos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales de equipos médicos
   * @returns {Promise} Estadísticas
   */
  async getGeneralStats() {
    try {
      const response = await api.get(
        "/v1/equipos/estadisticas/medical-devices"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching general stats:", error);
      throw error;
    }
  }

  /**
   * Obtiene equipos críticos (próximos mantenimientos, calibraciones vencidas, etc.)
   * @returns {Promise} Lista de equipos críticos
   */
  async getCriticalDevices() {
    try {
      const response = await api.get("/v1/equipos/estadisticas/criticos");
      return response.data;
    } catch (error) {
      console.error("Error fetching critical devices:", error);
      throw error;
    }
  }

  /**
   * Busca equipos por término
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise} Resultados de la búsqueda
   */
  async searchDevices(searchTerm) {
    try {
      const response = await api.get(
        `/v1/equipos/buscar/${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching devices:", error);
      throw error;
    }
  }

  /**
   * Realiza búsqueda avanzada con múltiples filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise} Resultados filtrados
   */
  async advancedSearch(filters) {
    try {
      const response = await api.post("/v1/equipos/busqueda-avanzada", filters);
      return response.data;
    } catch (error) {
      console.error("Error in advanced search:", error);
      throw error;
    }
  }

  /**
   * Cambia el estado de un equipo
   * @param {number} id - ID del equipo
   * @param {number} newStatusId - Nuevo estado
   * @returns {Promise} Respuesta de la API
   */
  async toggleStatus(id, newStatusId) {
    try {
      const response = await api.post(`/v1/equipos/${id}/toggle-status`, {
        estado_id: newStatusId,
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling status:", error);
      throw error;
    }
  }

  /**
   * Asigna un equipo a un área específica
   * @param {number} id - ID del equipo
   * @param {number} areaId - ID del área
   * @returns {Promise} Respuesta de la API
   */
  async assignToArea(id, areaId) {
    try {
      const response = await api.post(`/v1/equipos/${id}/asignar-area`, {
        area_id: areaId,
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning to area:", error);
      throw error;
    }
  }

  /**
   * Asigna un equipo a un servicio específico
   * @param {number} id - ID del equipo
   * @param {number} servicioId - ID del servicio
   * @returns {Promise} Respuesta de la API
   */
  async assignToService(id, servicioId) {
    try {
      const response = await api.post(`/v1/equipos/${id}/asignar-servicio`, {
        servicio_id: servicioId,
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning to service:", error);
      throw error;
    }
  }

  /**
   * Genera el código QR de un equipo
   * @param {number} id - ID del equipo
   * @returns {Promise} Código QR
   */
  async generateQR(id) {
    try {
      const response = await api.get(`/v1/equipos/${id}/qr`);
      return response.data;
    } catch (error) {
      console.error("Error generating QR:", error);
      throw error;
    }
  }

  /**
   * Importa equipos masivamente desde un archivo
   * @param {FormData} formData - Archivo de importación
   * @returns {Promise} Respuesta de la API
   */
  async importDevices(formData) {
    try {
      const response = await api.post("/v1/equipos/importar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error importing devices:", error);
      throw error;
    }
  }

  /**
   * Actualiza múltiples equipos de forma masiva
   * @param {Array} deviceIds - IDs de equipos
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise} Respuesta de la API
   */
  async bulkUpdate(deviceIds, updateData) {
    try {
      const response = await api.post("/v1/equipos/actualizar-masivo", {
        device_ids: deviceIds,
        update_data: updateData,
      });
      return response.data;
    } catch (error) {
      console.error("Error in bulk update:", error);
      throw error;
    }
  }

  /**
   * Elimina múltiples equipos de forma masiva
   * @param {Array} deviceIds - IDs de equipos a eliminar
   * @returns {Promise} Respuesta de la API
   */
  async bulkDelete(deviceIds) {
    try {
      const response = await api.post("/v1/equipos/eliminar-masivo", {
        device_ids: deviceIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error in bulk delete:", error);
      throw error;
    }
  }

  /**
   * Obtiene opciones para filtros (servicios, áreas, estados, etc.)
   * @returns {Promise} Opciones de filtros
   */
  async getFilterOptions() {
    try {
      const response = await api.get("/v1/equipos/filter-options");
      return response.data;
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  }

  /**
   * Programa un mantenimiento preventivo
   * @param {number} deviceId - ID del equipo
   * @param {Object} maintenanceData - Datos del mantenimiento
   * @returns {Promise} Respuesta de la API
   */
  async schedulePreventiveMaintenance(deviceId, maintenanceData) {
    try {
      const response = await api.post("/v1/mantenimiento/preventivo", {
        equipo_id: deviceId,
        ...maintenanceData,
      });
      return response.data;
    } catch (error) {
      console.error("Error scheduling preventive maintenance:", error);
      throw error;
    }
  }

  /**
   * Programa una calibración
   * @param {number} deviceId - ID del equipo
   * @param {Object} calibrationData - Datos de la calibración
   * @returns {Promise} Respuesta de la API
   */
  async scheduleCalibration(deviceId, calibrationData) {
    try {
      const response = await api.post("/v1/calibracion", {
        equipo_id: deviceId,
        ...calibrationData,
      });
      return response.data;
    } catch (error) {
      console.error("Error scheduling calibration:", error);
      throw error;
    }
  }

  /**
   * Registra un mantenimiento correctivo
   * @param {number} deviceId - ID del equipo
   * @param {Object} correctiveData - Datos del correctivo
   * @returns {Promise} Respuesta de la API
   */
  async registerCorrectiveMaintenance(deviceId, correctiveData) {
    try {
      const response = await api.post("/v1/mantenimiento/correctivo", {
        equipo_id: deviceId,
        ...correctiveData,
      });
      return response.data;
    } catch (error) {
      console.error("Error registering corrective maintenance:", error);
      throw error;
    }
  }

  /**
   * Exporta equipos en diferentes formatos
   * @param {string} format - Formato de exportación (excel, pdf, csv)
   * @param {Object} filters - Filtros aplicados
   * @returns {Promise} Respuesta de la API
   */
  async exportDevices(format = "excel", filters = {}) {
    try {
      const response = await api.post(
        "/v1/equipos/exportar",
        {
          format,
          filters,
        },
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting devices:", error);
      throw error;
    }
  }
}

// Instancia única del servicio
const medicalDevicesService = new MedicalDevicesService();

export default medicalDevicesService;
