import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

//Add interceptor
let isRefreshing = false;

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (!isRefreshing)  {
                isRefreshing = true;
                alert("Session expired. Please log in again.");
                localStorage.removeItem("token");
                window.location.href = "/login?sessionExpired=true";
            }
        }
        return Promise.reject(error);
    }
);

export default API;