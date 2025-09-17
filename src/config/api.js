// Configuración de la API
export const API_CONFIG = {
  // Configuraciones para diferentes entornos
  BASE_URL: __DEV__ 
    ? "http://192.168.1.12:8000/api"  // Tu IP local para desarrollo
    : "https://tu-api-produccion.com/api", // Producción
  
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