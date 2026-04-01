/**
 * ========================================
 * SERVICIO DE AUTENTICACIÓN - SISTEMA EVA
 * ========================================
 *
 * Manejo completo de autenticación con Laravel Sanctum
 */

import httpService, { setAuthToken, getCsrfToken } from "./httpService";
import { AUTH_ENDPOINTS } from "../config/api";

class AuthService {
  constructor() {
    this.user = null;
    this._isAuthenticated = false;
  }

  /**
   * Iniciar sesión
   */
  async login(credentials) {
    try {
      // 🔥 FIX: Limpiar datos de autenticación previos para asegurar que 
      // no mandamos un token caducado/corrupto en el header Authorization
      // lo cual causaría que Laravel rechace el login con código 401
      this.clearAuthData();

      // Obtener CSRF token antes del login
      await getCsrfToken();

      // Realizar login - el backend espera 'username' y 'password'
      const response = await httpService.post(AUTH_ENDPOINTS.LOGIN, {
        username: credentials.username || credentials.email,
        password: credentials.password,
        remember: credentials.remember || false,
      });

      const { user, token } = response.data;

      // Establecer token y usuario
      setAuthToken(token);
      this.user = user;
      this._isAuthenticated = true;

      // Almacenar información del usuario (asegurar persistencia)
      localStorage.setItem("eva_user", JSON.stringify(user));
      localStorage.setItem("eva_auth_token", token);

      // Debug logging disabled for production
      // console.log("✅ [AUTH] Sesión iniciada correctamente:", user);
      // console.log("🔐 [AUTH] Token almacenado:", token ? "Sí" : "No");

      return {
        success: true,
        user,
        token,
        message: "Sesión iniciada correctamente",
      };
    } catch (error) {
      console.error("❌ [AUTH] Error al iniciar sesión:", error);

      const errorMessage =
        error.response?.data?.message || "Error al iniciar sesión";
      const errors = error.response?.data?.errors || {};

      return {
        success: false,
        message: errorMessage,
        errors,
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {

      // Intentar llamar al endpoint de logout, pero no fallar si hay error
      try {
        await httpService.post(AUTH_ENDPOINTS.LOGOUT);
      } catch (logoutError) {
        console.warn("⚠️ [AUTH] Error en logout del servidor (continuando con logout local):", logoutError.response?.status);
        // Continuar con logout local aunque falle el servidor
      }

      // Limpiar datos locales SIEMPRE
      this.clearAuthData();

      return {
        success: true,
        message: "Sesión cerrada correctamente",
      };
    } catch (error) {
      console.error("❌ [AUTH] Error crítico en logout:", error);

      // Limpiar datos locales como última medida
      this.clearAuthData();

      return {
        success: false,
        message: "Error al cerrar sesión",
      };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      console.log("🔐 [AUTH] Registrando usuario...");
      console.log("🔍 [DEBUG] AUTH_ENDPOINTS.REGISTER:", AUTH_ENDPOINTS.REGISTER);
      console.log("🔍 [DEBUG] Datos del usuario:", userData);

      // Obtener CSRF token
      console.log("🔐 [AUTH] Obteniendo CSRF token...");
      await getCsrfToken();
      console.log("✅ [AUTH] CSRF token obtenido");

      const response = await httpService.post(
        AUTH_ENDPOINTS.REGISTER,
        userData
      );

      console.log("📦 [AUTH] Respuesta completa del servidor:", response.data);

      // ✅ CORRECCIÓN: El backend devuelve response.data.data, no response.data directamente
      const responseData = response.data.data || response.data;
      const { user, token, verification_required, email_sent, message } = responseData;

      console.log("📦 [AUTH] Datos extraídos:", { user, token, verification_required, email_sent });

      // ⚠️ NUEVO FLUJO: Si requiere verificación de email, NO logear automáticamente
      if (verification_required) {
        console.log("📧 [AUTH] Cuenta creada. Verificación de email requerida.");
        console.log("📧 Email enviado:", email_sent);
        
        return {
          success: true,
          user,
          verification_required: true,
          email_sent: email_sent || false,
          message: message || "Cuenta creada. Por favor verifica tu email.",
        };
      }

      // FLUJO ANTIGUO: Si devuelve token, logear automáticamente
      if (token) {
        // Establecer token y usuario
        setAuthToken(token);
        this.user = user;
        this._isAuthenticated = true;

        localStorage.setItem("eva_user", JSON.stringify(user));

        console.log("✅ [AUTH] Usuario registrado y logeado correctamente:", user);

        return {
          success: true,
          user,
          token,
          message: "Usuario registrado correctamente",
        };
      }

      // Si no hay token ni verification_required, algo está mal
      return {
        success: false,
        message: "Respuesta inesperada del servidor",
      };

    } catch (error) {
      console.error("❌ [AUTH] Error al registrar usuario:", error);

      const errorMessage =
        error.response?.data?.message || "Error al registrar usuario";
      const errors = error.response?.data?.errors || {};

      return {
        success: false,
        message: errorMessage,
        errors,
      };
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await httpService.get(AUTH_ENDPOINTS.USER);

      // CORREGIDO: Extraer solo los datos del usuario de response.data.data
      this.user = response.data.data || response.data;
      this._isAuthenticated = true;

      localStorage.setItem("eva_user", JSON.stringify(this.user));

      return {
        success: true,
        user: this.user,
      };
    } catch (error) {
      console.error("❌ [AUTH] Error al obtener usuario:", error);

      this.clearAuthData();

      return {
        success: false,
        message: "No se pudo obtener la información del usuario",
      };
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated() {
    const token = localStorage.getItem("eva_auth_token");
    const user = localStorage.getItem("eva_user");

    if (token && user) {
      try {
        // Verificar que el token sigue siendo válido con el backend
        const response = await httpService.get(AUTH_ENDPOINTS.USER);
        
        // CORREGIDO: Extraer solo los datos del usuario de response.data.data
        this.user = response.data.data || response.data;
        this._isAuthenticated = true;

        // Actualizar usuario almacenado si es necesario
        localStorage.setItem("eva_user", JSON.stringify(this.user));

        return true;
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          console.error(
            "❌ [AUTH] Token inválido (401), limpiando autenticación"
          );
          this.clearAuthData();
          return false;
        } else if (status === 500) {
          console.error(
            "💥 [AUTH] Error 500 del servidor - posible token corrupto:",
            message
          );
          // Para error 500 que podría ser token corrupto, limpiamos también
          this.clearAuthData();
          return false;
        } else {
          // Para errores del servidor (network, etc.), mantener sesión y permitir reintento
          // Debug logging disabled for production
          // console.warn(
          //   `⚠️ [AUTH] Error del servidor (${
          //     status || "Network"
          //   }), manteniendo sesión temporalmente`
          // );
          // Retornar true temporalmente para no forzar logout por error del servidor
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Obtener usuario almacenado
   */
  getStoredUser() {
    try {
      const user = localStorage.getItem("eva_user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("❌ [AUTH] Error al obtener usuario almacenado:", error);
      return null;
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(email) {
    try {
      await getCsrfToken();

      const response = await httpService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
        email,
      });

      return {
        success: true,
        message:
          response.data.message ||
          "Se ha enviado un enlace de restablecimiento",
      };
    } catch (error) {
      console.error("❌ [AUTH] Error al solicitar restablecimiento:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al solicitar restablecimiento",
      };
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(resetData) {
    try {
      await getCsrfToken();

      const response = await httpService.post(
        AUTH_ENDPOINTS.RESET_PASSWORD,
        resetData
      );

      return {
        success: true,
        message:
          response.data.message || "Contraseña restablecida correctamente",
      };
    } catch (error) {
      console.error("❌ [AUTH] Error al restablecer contraseña:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Error al restablecer contraseña",
        errors: error.response?.data?.errors || {},
      };
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  clearAuthData() {
    setAuthToken(null);
    this.user = null;
    this._isAuthenticated = false;
    localStorage.removeItem("eva_user");
    localStorage.removeItem("eva_auth_token");
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

    return this.user.roles.some((userRole) => userRole.name === role);
  }

  /**
   * Obtener token almacenado
   */
  getToken() {
    return localStorage.getItem("eva_auth_token");
  }

  /**
   * Verificar si el token está próximo a expirar
   */
  isTokenExpiringSoon() {
    // Implementar lógica según tu configuración de tokens
    return false;
  }
}

// Crear instancia única del servicio
const authService = new AuthService();

export default authService;
