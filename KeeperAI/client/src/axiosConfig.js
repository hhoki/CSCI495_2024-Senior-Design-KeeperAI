import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : '/api',
    timeout: 30000,  // Increased to 30 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// Special instance for long-running operations
export const longRunningApi = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : '/api',
    timeout: 60000,  // 1 minute timeout for long operations
    headers: {
        'Content-Type': 'application/json'
    }
});

longRunningApi.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error (Long Running):', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default api;