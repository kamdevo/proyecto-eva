// Debug configuration file
import { API_CONFIG, AUTH_ENDPOINTS } from "./config/api.js";

console.log("🔍 [DEBUG CONFIG] Variables de entorno cargadas:");
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("VITE_AUTH_REGISTER_URL:", import.meta.env.VITE_AUTH_REGISTER_URL);

console.log("🔍 [DEBUG CONFIG] Configuración API:");
console.log("API_CONFIG:", API_CONFIG);
console.log("AUTH_ENDPOINTS:", AUTH_ENDPOINTS);

export const debugConfig = {
  envVars: {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_AUTH_REGISTER_URL: import.meta.env.VITE_AUTH_REGISTER_URL,
  },
  apiConfig: API_CONFIG,
  authEndpoints: AUTH_ENDPOINTS,
};
