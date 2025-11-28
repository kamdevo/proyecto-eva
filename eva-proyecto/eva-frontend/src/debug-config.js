// Debug configuration file
import { API_CONFIG, AUTH_ENDPOINTS } from "./config/api.js";

export const debugConfig = {
  envVars: {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_AUTH_REGISTER_URL: import.meta.env.VITE_AUTH_REGISTER_URL,
  },
  apiConfig: API_CONFIG,
  authEndpoints: AUTH_ENDPOINTS,
};
