import axios from 'axios';

const api = axios.create({
    baseURL: 'https://devflow-backend-l85l.onrender.com/api/v1', 
});

export default api;