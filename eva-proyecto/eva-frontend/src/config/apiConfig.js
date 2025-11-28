// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default apiConfig;