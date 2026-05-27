import axios from 'axios';

const api = axios.create({
    // Добавили /v1, как прописано в твоем server.js
    baseURL: 'http://localhost:5000/api/v1', 
});

export default api;