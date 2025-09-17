// Configuración de la API
export const API_CONFIG = {
  // Configuraciones para diferentes entornos
  BASE_URL: __DEV__ 
    ? "http://10.2.233.158:8000/api"  // Tu IP local para desarrollo
    : "https://tu-api-produccion.com/api", // Producción
  
  // URLs alternativas para probar si hay problemas de conexión
  ALTERNATIVE_URLS: [
    "http://localhost:8000/api",      // Para emulador iOS
    "http://10.0.2.2:8000/api",      // Para emulador Android
    "http://127.0.0.1:8000/api",     // Localhost alternativo
  ],
  
  TIMEOUT: 30000, // Aumentado a 30 segundos
  
  HEADERS: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
};

// Función para obtener la URL base según el entorno
export const getBaseURL = () => {
  return API_CONFIG.BASE_URL;
};