import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';

    if (!error.response) {
      message = 'Unable to connect to CabGo backend server. Please verify the backend is running at ' + API_BASE_URL;
    } else if (error.response.data) {
      // Express-validator errors array
      if (Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
        message = error.response.data.errors.map((e) => e.msg).join(', ');
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.status === 401) {
        message = 'Authentication required or session expired. Please log in again.';
      } else if (error.response.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.response.status === 404) {
        message = 'Requested resource not found.';
      } else if (error.response.status >= 500) {
        message = 'Internal server error occurred. Please try again later.';
      }
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export default api;
