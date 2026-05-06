// API Configuration - centralizado desde api.js
import { API_CONFIG } from './api.js';

export const apiConfig = {
  baseURL: API_CONFIG.API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
};

export default apiConfig;