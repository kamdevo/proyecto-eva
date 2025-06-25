/**
 * ========================================
 * SERVICIO DE AUTENTICACIÓN - SISTEMA EVA
 * ========================================
 * 
 * Manejo completo de autenticación con Laravel Sanctum
 */

import httpService, { setAuthToken, getCsrfToken } from './httpService.js';
import { AUTH_ENDPOINTS } from '../config/api.js';

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  /**
   * Iniciar sesión
   */
  async login(credentials) {
    try {
      console.log('🔐 [AUTH] Iniciando sesión...');
      
      // Obtener CSRF token antes del login
      await getCsrfToken();
      
      // Realizar login
      const response = await httpService.post(AUTH_ENDPOINTS.LOGIN, {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember || false
      });

      const { user, token } = response.data;

      // Establecer token y usuario
      setAuthToken(token);
      this.user = user;
      this.isAuthenticated = true;

      // Almacenar información del usuario
      localStorage.setItem('eva_user', JSON.stringify(user));

      console.log('✅ [AUTH] Sesión iniciada correctamente:', user);
      
      return {
        success: true,
        user,
        token,
        message: 'Sesión iniciada correctamente'
      };

    } catch (error) {
      console.error('❌ [AUTH] Error al iniciar sesión:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      const errors = error.response?.data?.errors || {};

      return {
        success: false,
        message: errorMessage,
        errors
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      console.log('🔐 [AUTH] Cerrando sesión...');
      
      // Llamar al endpoint de logout
      await httpService.post(AUTH_ENDPOINTS.LOGOUT);
      
      // Limpiar datos locales
      this.clearAuthData();
      
      console.log('✅ [AUTH] Sesión cerrada correctamente');
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };

    } catch (error) {
      console.error('❌ [AUTH] Error al cerrar sesión:', error);
      
      // Limpiar datos locales aunque falle la petición
      this.clearAuthData();
      
      return {
        success: false,
        message: 'Error al cerrar sesión'
      };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      console.log('🔐 [AUTH] Registrando usuario...');
      
      // Obtener CSRF token
      await getCsrfToken();
      
      const response = await httpService.post(AUTH_ENDPOINTS.REGISTER, userData);
      
      const { user, token } = response.data;
      
      // Establecer token y usuario
      setAuthToken(token);
      this.user = user;
      this.isAuthenticated = true;
      
      localStorage.setItem('eva_user', JSON.stringify(user));
      
      console.log('✅ [AUTH] Usuario registrado correctamente:', user);
      
      return {
        success: true,
        user,
        token,
        message: 'Usuario registrado correctamente'
      };

    } catch (error) {
      console.error('❌ [AUTH] Error al registrar usuario:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
      const errors = error.response?.data?.errors || {};

      return {
        success: false,
        message: errorMessage,
        errors
      };
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await httpService.get(AUTH_ENDPOINTS.USER);
      
      this.user = response.data;
      this.isAuthenticated = true;
      
      localStorage.setItem('eva_user', JSON.stringify(this.user));
      
      return {
        success: true,
        user: this.user
      };

    } catch (error) {
      console.error('❌ [AUTH] Error al obtener usuario:', error);
      
      this.clearAuthData();
      
      return {
        success: false,
        message: 'No se pudo obtener la información del usuario'
      };
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isUserAuthenticated() {
    const token = localStorage.getItem('eva_auth_token');
    const user = localStorage.getItem('eva_user');
    
    if (token && user) {
      try {
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error('❌ [AUTH] Error al parsear usuario almacenado:', error);
        this.clearAuthData();
      }
    }
    
    return false;
  }

  /**
   * Obtener usuario almacenado
   */
  getStoredUser() {
    try {
      const user = localStorage.getItem('eva_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('❌ [AUTH] Error al obtener usuario almacenado:', error);
      return null;
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(email) {
    try {
      await getCsrfToken();
      
      const response = await httpService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      
      return {
        success: true,
        message: response.data.message || 'Se ha enviado un enlace de restablecimiento'
      };

    } catch (error) {
      console.error('❌ [AUTH] Error al solicitar restablecimiento:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al solicitar restablecimiento'
      };
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(resetData) {
    try {
      await getCsrfToken();
      
      const response = await httpService.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
      
      return {
        success: true,
        message: response.data.message || 'Contraseña restablecida correctamente'
      };

    } catch (error) {
      console.error('❌ [AUTH] Error al restablecer contraseña:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al restablecer contraseña',
        errors: error.response?.data?.errors || {}
      };
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  clearAuthData() {
    setAuthToken(null);
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('eva_user');
    localStorage.removeItem('eva_auth_token');
  }

  /**
   * Verificar permisos del usuario
   */
  hasPermission(permission) {
    if (!this.user || !this.user.permissions) {
      return false;
    }
    
    return this.user.permissions.includes(permission);
  }

  /**
   * Verificar rol del usuario
   */
  hasRole(role) {
    if (!this.user || !this.user.roles) {
      return false;
    }
    
    return this.user.roles.some(userRole => userRole.name === role);
  }
}

// Crear instancia única del servicio
const authService = new AuthService();

export default authService;
