import axios from 'axios';

const api = axios.create({
    baseURL: '/api',  // This will be proxied to http://localhost:5000
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;