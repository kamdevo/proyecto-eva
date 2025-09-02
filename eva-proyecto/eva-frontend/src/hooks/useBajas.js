import { useState } from 'react';
import apiClient from '../config/apiClient';

const useBajas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all bajas with pagination
  const fetchBajas = async (page = 1, perPage = 10, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(search && { search })
      });

      const response = await apiClient.get(`/v1/bajas?${params}`);
      
      if (response.data.success) {
        return {
          data: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.message || 'Error al obtener bajas');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al obtener bajas';
      setError(errorMessage);
      console.warn('Error fetching bajas:', errorMessage);
      // No lanzar error para evitar crashes en componentes
      return { data: [], pagination: { total: 0, current_page: 1, last_page: 1 } };
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva baja
  const createBaja = async (bajaData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('fecha_baja', bajaData.fecha_baja);
      formData.append('descripcion', bajaData.descripcion);
      formData.append('motivo', bajaData.motivo || '');
      formData.append('observaciones', bajaData.observaciones || '');
      
      // Agregar archivo si existe
      if (bajaData.documento) {
        formData.append('archivo', bajaData.documento);
      }

      const response = await apiClient.post('/v1/bajas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar lista local
      await fetchBajas();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear baja');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar baja existente
  const updateBaja = async (id, bajaData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('fecha_baja', bajaData.fecha_baja);
      formData.append('descripcion', bajaData.descripcion);
      formData.append('motivo', bajaData.motivo || '');
      formData.append('observaciones', bajaData.observaciones || '');
      formData.append('_method', 'PUT');
      
      // Agregar archivo si existe
      if (bajaData.documento) {
        formData.append('archivo', bajaData.documento);
      }

      const response = await apiClient.post(`/v1/bajas/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar lista local
      await fetchBajas();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar baja');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar baja
  const deleteBaja = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/v1/bajas/${id}`);
      
      // Note: List will be refreshed by parent component
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar baja');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener baja específica
  const getBaja = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/v1/bajas/${id}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar baja');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Asociar equipos a una baja
  const associateEquipment = async (bajaId, equipmentIds) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/v1/bajas/${bajaId}/equipos`, {
        equipo_ids: equipmentIds
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asociar equipos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener equipos asociados a una baja
  const getAssociatedEquipment = async (bajaId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/v1/bajas/${bajaId}/equipos`);
      return response.data.data || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar equipos asociados');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remover asociación de equipo con baja
  const removeEquipmentAssociation = async (bajaId, equipoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/v1/bajas/${bajaId}/equipos/${equipoId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al remover asociación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dar de baja un equipo (desde vista de equipos)
  const decommissionEquipment = async (equipoId, bajaData, file = null) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('fecha_baja', bajaData.fecha_baja);
      formData.append('descripcion', bajaData.descripcion);
      formData.append('motivo', bajaData.motivo || '');
      formData.append('observaciones', bajaData.observaciones || '');
      
      // Agregar archivo si existe
      if (file) {
        formData.append('archivo', file);
      }

      const response = await apiClient.post(`/v1/equipos/${equipoId}/dar-baja`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al dar de baja equipo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener equipos disponibles para asociar
  const getAvailableEquipment = async (page = 1, perPage = 15, search = '') => {
    try {
      setLoading(true);
      const response = await apiClient.get('/v1/equipos/available-for-baja', {
        params: { page, per_page: perPage, search }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener equipos disponibles');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Descargar documento de baja
  const downloadDocument = async (bajaId) => {
    try {
      const response = await apiClient.get(`/v1/bajas/${bajaId}/documento`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo del header o usar nombre por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = `baja_${bajaId}_documento.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al descargar documento');
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchBajas,
    createBaja,
    updateBaja,
    getAvailableEquipment,
    deleteBaja,
    getBaja,
    associateEquipment,
    getAssociatedEquipment,
    removeEquipmentAssociation,
    decommissionEquipment,
    downloadDocument,
    setError
  };
};

export default useBajas;
