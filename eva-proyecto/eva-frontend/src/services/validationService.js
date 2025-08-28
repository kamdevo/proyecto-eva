/**
 * ========================================
 * SERVICIO DE VALIDACIÓN - SISTEMA EVA
 * ========================================
 *
 * Servicio para validar conectividad y integridad de datos
 */

import httpClient from './httpClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class ValidationService {
  constructor() {
    this.baseUrl = '/api/v1';
  }

  /**
   * Verificar conectividad con el backend
   * @returns {Promise} Estado de la conexión
   */
  async checkBackendConnectivity() {
    try {
      const startTime = Date.now();
      const response = await httpClient.get(`${this.baseUrl}/health`);
      const endTime = Date.now();
      
      return {
        success: true,
        status: 'connected',
        responseTime: endTime - startTime,
        data: response.data,
        message: 'Conexión exitosa con el backend'
      };
    } catch (error) {
      return {
        success: false,
        status: 'disconnected',
        responseTime: 0,
        error: error.message,
        message: 'No se pudo conectar con el backend'
      };
    }
  }

  /**
   * Validar estructura de datos de tickets
   * @param {Array} tickets - Array de tickets a validar
   * @returns {Object} Resultado de la validación
   */
  validateTicketsData(tickets) {
    if (!Array.isArray(tickets)) {
      return {
        valid: false,
        errors: ['Los datos de tickets deben ser un array'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];
    const requiredFields = ['id', 'titulo', 'descripcion', 'estado'];
    const optionalFields = ['prioridad', 'fecha_creacion', 'usuario_asignado'];

    tickets.forEach((ticket, index) => {
      // Verificar campos requeridos
      requiredFields.forEach(field => {
        if (!ticket[field]) {
          errors.push(`Ticket ${index}: Campo requerido '${field}' faltante`);
        }
      });

      // Verificar tipos de datos
      if (ticket.id && typeof ticket.id !== 'string' && typeof ticket.id !== 'number') {
        errors.push(`Ticket ${index}: ID debe ser string o number`);
      }

      if (ticket.estado && !['abierto', 'en_proceso', 'cerrado', 'cancelado'].includes(ticket.estado)) {
        warnings.push(`Ticket ${index}: Estado '${ticket.estado}' no es estándar`);
      }

      if (ticket.prioridad && !['alta', 'media', 'baja'].includes(ticket.prioridad)) {
        warnings.push(`Ticket ${index}: Prioridad '${ticket.prioridad}' no es estándar`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalTickets: tickets.length,
      validTickets: tickets.length - errors.length
    };
  }

  /**
   * Validar estructura de datos de equipos
   * @param {Array} equipos - Array de equipos a validar
   * @returns {Object} Resultado de la validación
   */
  validateEquiposData(equipos) {
    if (!Array.isArray(equipos)) {
      return {
        valid: false,
        errors: ['Los datos de equipos deben ser un array'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];
    const requiredFields = ['id', 'name'];
    const optionalFields = ['tipo', 'marca', 'modelo', 'ubicacion'];

    equipos.forEach((equipo, index) => {
      requiredFields.forEach(field => {
        if (!equipo[field]) {
          errors.push(`Equipo ${index}: Campo requerido '${field}' faltante`);
        }
      });

      if (equipo.tipo && !['biomedico', 'industrial'].includes(equipo.tipo)) {
        warnings.push(`Equipo ${index}: Tipo '${equipo.tipo}' no es estándar`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalEquipos: equipos.length,
      validEquipos: equipos.length - errors.length
    };
  }

  /**
   * Validar estructura de datos de técnicos
   * @param {Array} tecnicos - Array de técnicos a validar
   * @returns {Object} Resultado de la validación
   */
  validateTecnicosData(tecnicos) {
    if (!Array.isArray(tecnicos)) {
      return {
        valid: false,
        errors: ['Los datos de técnicos deben ser un array'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];
    const requiredFields = ['id', 'name'];

    tecnicos.forEach((tecnico, index) => {
      requiredFields.forEach(field => {
        if (!tecnico[field]) {
          errors.push(`Técnico ${index}: Campo requerido '${field}' faltante`);
        }
      });

      if (tecnico.especialidad && !['Biomédico', 'Industrial', 'Infraestructura'].includes(tecnico.especialidad)) {
        warnings.push(`Técnico ${index}: Especialidad '${tecnico.especialidad}' no es estándar`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalTecnicos: tecnicos.length,
      validTecnicos: tecnicos.length - errors.length
    };
  }

  /**
   * Ejecutar validación completa del sistema
   * @returns {Promise} Resultado completo de la validación
   */
  async runFullValidation() {
    const results = {
      connectivity: await this.checkBackendConnectivity(),
      timestamp: new Date().toISOString(),
      validations: {}
    };

    // Si hay conectividad, validar datos
    if (results.connectivity.success) {
      try {
        // Importar servicios dinámicamente para evitar dependencias circulares
        const { default: ticketService } = await import('./ticketService.js');
        const { default: equipoService } = await import('./equipoService.js');
        const { default: tecnicoService } = await import('./tecnicoService.js');

        // Validar tickets
        try {
          const ticketsResponse = await ticketService.getTickets({ per_page: 10 });
          results.validations.tickets = this.validateTicketsData(ticketsResponse.data || []);
        } catch (error) {
          results.validations.tickets = {
            valid: false,
            errors: [`Error al obtener tickets: ${error.message}`],
            warnings: []
          };
        }

        // Validar equipos
        try {
          const equiposResponse = await equipoService.getEquipos({ per_page: 10 });
          results.validations.equipos = this.validateEquiposData(equiposResponse.data || []);
        } catch (error) {
          results.validations.equipos = {
            valid: false,
            errors: [`Error al obtener equipos: ${error.message}`],
            warnings: []
          };
        }

        // Validar técnicos
        try {
          const tecnicosResponse = await tecnicoService.getTecnicos({ per_page: 10 });
          results.validations.tecnicos = this.validateTecnicosData(tecnicosResponse.data || []);
        } catch (error) {
          results.validations.tecnicos = {
            valid: false,
            errors: [`Error al obtener técnicos: ${error.message}`],
            warnings: []
          };
        }

      } catch (error) {
        results.validations.error = `Error durante la validación: ${error.message}`;
      }
    }

    return results;
  }

  /**
   * Generar reporte de validación
   * @param {Object} validationResults - Resultados de la validación
   * @returns {Object} Reporte formateado
   */
  generateValidationReport(validationResults) {
    const report = {
      summary: {
        connectivity: validationResults.connectivity.success,
        responseTime: validationResults.connectivity.responseTime,
        timestamp: validationResults.timestamp
      },
      details: {},
      recommendations: []
    };

    // Procesar validaciones
    Object.entries(validationResults.validations || {}).forEach(([key, validation]) => {
      if (validation.valid !== undefined) {
        report.details[key] = {
          valid: validation.valid,
          errorCount: validation.errors?.length || 0,
          warningCount: validation.warnings?.length || 0,
          totalRecords: validation[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] || 0
        };

        // Generar recomendaciones
        if (!validation.valid) {
          report.recommendations.push(`Revisar estructura de datos de ${key}`);
        }
        if (validation.warnings?.length > 0) {
          report.recommendations.push(`Verificar advertencias en ${key}`);
        }
      }
    });

    // Recomendaciones generales
    if (!report.summary.connectivity) {
      report.recommendations.push('Verificar conectividad con el backend');
    }
    if (report.summary.responseTime > 2000) {
      report.recommendations.push('Optimizar tiempo de respuesta del backend');
    }

    return report;
  }
}

// Crear instancia singleton
const validationService = new ValidationService();
export default validationService;
