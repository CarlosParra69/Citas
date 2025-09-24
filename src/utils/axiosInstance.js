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
      console.log(
        `Enviando token para ${config.method?.toUpperCase()} ${
          config.url
        } - Token: ${token.substring(0, 20)}...`
      );
    } else {
      console.log(
        `No hay token para ${config.method?.toUpperCase()} ${config.url}`
      );
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
    console.log("Status:", error.response?.status);

    if (error.code === "ECONNABORTED") {
      console.log("Error de timeout");
    }

    // Solo eliminar token si es un error de autenticación real (no temporal)
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.error_code;
      console.log("Código de error:", errorCode);

      // Solo eliminar token si es un error de token expirado o inválido
      if (
        errorCode === "TOKEN_EXPIRED" ||
        errorCode === "TOKEN_INVALID" ||
        errorCode === "TOKEN_ABSENT"
      ) {
        console.log("Eliminando token por error de autenticación");
        await AsyncStorage.removeItem("token");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
