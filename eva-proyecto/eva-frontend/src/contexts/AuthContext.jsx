/**
 * Contexto de autenticación para React
 * Proporciona estado global de autenticación y métodos para toda la aplicación
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "../services/authService";
import permissionService from "../services/permissionService";

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_LOADING: "SET_LOADING",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      // Inicializar servicio de permisos con los datos del usuario
      permissionService.initialize(action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      // Limpiar permisos al hacer logout
      permissionService.clear();
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      // Inicializar permisos si hay usuario
      if (action.payload.user) {
        permissionService.initialize(action.payload.user);
      }
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.updates },
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Inicializar autenticación al cargar la aplicación
  useEffect(() => {
    initializeAuth();
  }, []);

  // Escuchar eventos de autenticación
  useEffect(() => {
    const handleAuthLogin = (event) => {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: event.detail.user },
      });
    };

    const handleAuthLogout = () => {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    window.addEventListener("auth:login", handleAuthLogin);
    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:login", handleAuthLogin);
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  // Inicializar autenticación
  const initializeAuth = async () => {
    try {
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: { isLoading: true },
      });

      console.log("🔄 [AuthContext] Inicializando autenticación...");

      // Verificar si hay datos de sesión en localStorage
      const token = localStorage.getItem("eva_auth_token");
      const storedUser = localStorage.getItem("eva_user");

      if (token && storedUser) {
        try {
          // Intentar validar con el backend
          const isValid = await authService.isAuthenticated();

          if (isValid && authService.user) {
            console.log(
              "✅ [AuthContext] Usuario autenticado:",
              authService.user
            );
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: { user: authService.user },
            });
          } else {
            console.log(
              "ℹ️ [AuthContext] Validación fallida, pero manteniendo datos locales temporalmente"
            );
            // Si falla por error del servidor, usar datos locales temporalmente
            try {
              const localUser = JSON.parse(storedUser);
              dispatch({
                type: AUTH_ACTIONS.SET_USER,
                payload: { user: localUser },
              });
              console.log(
                "📦 [AuthContext] Usando datos locales mientras el servidor se recupera"
              );
            } catch (parseError) {
              console.warn(
                "⚠️ [AuthContext] Error al parsear usuario local:",
                parseError
              );
              console.log("ℹ️ [AuthContext] No hay sesión válida");
              dispatch({
                type: AUTH_ACTIONS.SET_LOADING,
                payload: { isLoading: false },
              });
            }
          }
        } catch (error) {
          console.error(
            "❌ [AuthContext] Error al validar sesión, usando datos locales:",
            error
          );
          // En caso de error del servidor, usar datos locales
          try {
            const localUser = JSON.parse(storedUser);
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: { user: localUser },
            });
          } catch (parseError) {
            console.warn(
              "⚠️ [AuthContext] Error al parsear usuario de respaldo:",
              parseError
            );
            dispatch({
              type: AUTH_ACTIONS.SET_LOADING,
              payload: { isLoading: false },
            });
          }
        }
      } else {
        console.log("ℹ️ [AuthContext] No hay sesión válida");
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: { isLoading: false },
        });
      }
    } catch (error) {
      console.error("❌ [AuthContext] Error al inicializar:", error);
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: { isLoading: false },
      });
    }
  };

  // Función de login
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const result = await authService.login(credentials);

      // Verificar si el login fue exitoso antes de actualizar el estado
      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: result.user },
        });
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: result.message || "Error al iniciar sesión" },
        });
      }

      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error("Logout error:", error);
      // Forzar logout local incluso si falla el servidor
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const result = await authService.register(userData);

      // Después del registro exitoso, no loguear automáticamente
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: { isLoading: false },
      });

      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (updates) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: { updates },
    });
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para refrescar datos del usuario
  const refreshUser = async () => {
    try {
      const result = await authService.getCurrentUser();
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: { user: result.user },
      });
      return result.user;
    } catch (error) {
      console.error("Error refreshing user:", error);
      await logout();
      throw error;
    }
  };

  // Funciones de verificación de permisos
  const hasRole = (roleName) => {
    return authService.hasRole(roleName);
  };

  const hasPermission = (permissionName) => {
    return authService.hasPermission(permissionName);
  };

  // Función para solicitar restablecimiento de contraseña
  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (resetData) => {
    try {
      return await authService.resetPassword(resetData);
    } catch (error) {
      throw error;
    }
  };

  // Valor del contexto
  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Acciones
    login,
    logout,
    register,
    updateUser,
    clearError,
    refreshUser,
    forgotPassword,
    resetPassword,

    // Verificaciones
    hasRole,
    hasPermission,

    // Verificaciones de permisos específicas
    canRead: (module) => permissionService.canRead(module),
    canInsert: (module) => permissionService.canInsert(module),
    canEdit: (module) => permissionService.canEdit(module),
    canDelete: (module) => permissionService.canDelete(module),
    hasAnyPermission: (module) => permissionService.hasAnyPermission(module),
    canAccessRoute: (route) => permissionService.canAccessRoute(route),
    isAdmin: () => permissionService.isAdmin(),

    // Utilidades
    getToken: () => authService.getToken(),
    isTokenExpiringSoon: () => authService.isTokenExpiringSoon(),
    permissionService, // Exponer el servicio completo para casos avanzados
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
