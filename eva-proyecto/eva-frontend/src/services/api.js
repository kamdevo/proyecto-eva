import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost/Xampp1/htdocs/proyecto-eva/eva-proyecto/eva-backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const userData = JSON.parse(user);
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('usuario');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    
    return await response.json();
  },

  register: async (userData) => {
    const formData = new URLSearchParams();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    
    const response = await fetch(`${API_BASE_URL}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    
    return await response.json();
  }
};

// Servicios generales para CRUD
export const crudService = {
  // Obtener todos los registros de una tabla
  getAll: async (table) => {
    const response = await api.get(`/${table}.php`);
    return response.data;
  },

  // Obtener un registro por ID
  getById: async (table, id) => {
    const response = await api.get(`/${table}.php?id=${id}`);
    return response.data;
  },

  // Crear un nuevo registro
  create: async (table, data) => {
    const response = await api.post(`/${table}.php`, data);
    return response.data;
  },

  // Actualizar un registro
  update: async (table, id, data) => {
    const response = await api.put(`/${table}.php?id=${id}`, data);
    return response.data;
  },

  // Eliminar un registro
  delete: async (table, id) => {
    const response = await api.delete(`/${table}.php?id=${id}`);
    return response.data;
  }
};

export default api;
