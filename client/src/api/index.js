import axios from 'axios';

const api = axios.create({
    baseURL: 'https://devflow-backend-l85l.onrender.com/api/v1', 
});

// Синхронизируем токен для кастомного инстанса (на случай, если используешь его в компонентах)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;