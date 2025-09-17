import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Interceptor para agregar el token JWT
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Error de red:", error.message);
    console.log("URL solicitada:", error.config?.url);
    console.log("Método:", error.config?.method);
    
    if (error.code === 'ECONNABORTED') {
      console.log("Error de timeout");
    }
    
    if (error.response?.status === 401) {
      // Manejar token expirado
      await AsyncStorage.removeItem("token");
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
