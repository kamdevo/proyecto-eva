import { useState, useEffect, useCallback } from 'react';
import mantenimientoService from '../services/mantenimientoService';

export const useMantenimientoData = () => {
  const [planesData, setPlanesData] = useState([]);
  const [proveedoresData, setProveedoresData] = useState([]);
  const [equiposData, setEquiposData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  // Cargar planes de mantenimiento
  const loadPlanes = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mantenimientoService.getPlanes(filters);
      
      if (response.success) {
        setPlanesData(response.data.data || []);
        setPagination({
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 10,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1
        });
      } else {
        setError(response.message || 'Error al cargar planes de mantenimiento');
      }
    } catch (err) {
      console.error('Error loading planes:', err);
      setError('Error de conexión al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proveedores
  const loadProveedores = useCallback(async (filters = {}) => {
    try {
      const response = await mantenimientoService.getProveedores(filters);
      
      if (response.success) {
        setProveedoresData(response.data || []);
      }
    } catch (err) {
      console.error('Error loading proveedores:', err);
    }
  }, []);

  // Cargar equipos
  const loadEquipos = useCallback(async (filters = {}) => {
    try {
      const response = await mantenimientoService.getEquipos(filters);
      
      if (response.success) {
        setEquiposData(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading equipos:', err);
    }
  }, []);

  // Crear plan de mantenimiento
  const createPlan = useCallback(async (planData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mantenimientoService.createPlan(planData);
      
      if (response.success) {
        // Recargar datos después de crear
        await loadPlanes();
        return response;
      } else {
        setError(response.message || 'Error al crear plan');
        return response;
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      setError('Error de conexión al crear plan');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [loadPlanes]);

  // Actualizar plan de mantenimiento
  const updatePlan = useCallback(async (id, planData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mantenimientoService.updatePlan(id, planData);
      
      if (response.success) {
        // Recargar datos después de actualizar
        await loadPlanes();
        return response;
      } else {
        setError(response.message || 'Error al actualizar plan');
        return response;
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      setError('Error de conexión al actualizar plan');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [loadPlanes]);

  // Eliminar plan de mantenimiento
  const deletePlan = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mantenimientoService.deletePlan(id);
      
      if (response.success) {
        // Recargar datos después de eliminar
        await loadPlanes();
        return response;
      } else {
        setError(response.message || 'Error al eliminar plan');
        return response;
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Error de conexión al eliminar plan');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [loadPlanes]);

  // Subir archivo Excel
  const uploadExcel = useCallback(async (file, anio, reemplazar) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('anio', anio);
      formData.append('reemplazar', reemplazar ? '1' : '0');
      
      const response = await mantenimientoService.uploadExcel(formData);
      
      if (response.success) {
        // Recargar datos después de subir Excel
        await loadPlanes({ anio });
        return response;
      } else {
        setError(response.message || 'Error al procesar archivo Excel');
        return response;
      }
    } catch (err) {
      console.error('Error uploading Excel:', err);
      setError('Error de conexión al procesar archivo');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [loadPlanes]);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Descargar plantilla
  const downloadTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await mantenimientoService.downloadTemplate();
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Plantilla_Cronograma_Mantenimiento.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Plantilla descargada exitosamente' };
    } catch (err) {
      console.error('Error downloading template:', err);
      setError('Error al descargar plantilla');
      return { success: false, message: 'Error al descargar plantilla' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar consolidado
  const exportConsolidado = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      if (filters.formato === 'excel') {
        const blob = await mantenimientoService.exportConsolidado(filters);
        
        // Crear URL para descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cronograma_Mantenimiento_${filters.anio || new Date().getFullYear()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Archivo exportado exitosamente' };
      } else {
        const result = await mantenimientoService.exportConsolidado(filters);
        return result;
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Error al exportar datos');
      return { success: false, message: 'Error al exportar datos' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    planesData,
    proveedoresData,
    equiposData,
    pagination,
    
    // State
    loading,
    error,
    
    // Actions
    loadPlanes,
    loadProveedores,
    loadEquipos,
    createPlan,
    updatePlan,
    deletePlan,
    uploadExcel,
    downloadTemplate,
    exportConsolidado,
    clearError
  };
};

export default useMantenimientoData;
