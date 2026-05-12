import axios from "axios";
import config from "../config/config";

const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // For cookies if needed
});

// Request Interceptor to add Auth Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token"); // Handle inconsistent token naming if any
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor handles errors globally (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log the error for debugging
        console.error("API call failed:", error);

        // Return a readable error message if possible
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
