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

// Función para sanitizar mensajes de error
const sanitizeErrorMessage = (error) => {
  // Log detallado para debugging (solo en consola)
  console.error("Error detallado:", error);

  // Extraer mensaje del servidor si existe
  let errorMessage = error.response?.data?.message;

  // Si no hay mensaje del servidor o es un error de conexión, usar mensaje genérico
  if (!errorMessage) {
    // Verificar si es un error de conexión de base de datos
    if (error.message && error.message.includes("SQLSTATE")) {
      console.error("Error de base de datos detectado:", error.message);
      errorMessage =
        "Error de conexión con el servidor. Por favor, inténtelo de nuevo más tarde.";
    } else if (error.code === "ECONNABORTED") {
      console.log("Error de timeout");
      errorMessage =
        "Tiempo de espera agotado. Verifique su conexión a internet.";
    } else {
      errorMessage = "Error de conexión. Verifique su conexión a internet.";
    }
  }

  return errorMessage;
};

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Error de red:", error.message);
    console.log("URL solicitada:", error.config?.url);
    console.log("Método:", error.config?.method);
    console.log("Status:", error.response?.status);

    // Sanitizar el mensaje de error para evitar mostrar información sensible
    const sanitizedMessage = sanitizeErrorMessage(error);

    // Crear un nuevo error con el mensaje sanitizado
    const sanitizedError = new Error(sanitizedMessage);
    sanitizedError.response = error.response;
    sanitizedError.config = error.config;
    sanitizedError.code = error.code;

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

    return Promise.reject(sanitizedError);
  }
);

export default axiosInstance;
