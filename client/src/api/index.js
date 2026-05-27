import axios from 'axios';

const api = axios.create({
    // Меняем локальный адрес на живой бэкенд из Render
    baseURL: 'https://devflow-backend-l85l.onrender.com/api/v1', 
});

export default api;