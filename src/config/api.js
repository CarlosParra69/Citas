// Configuración de la API
export const API_CONFIG = {
  // Configuraciones para diferentes entornos
  BASE_URL: __DEV__
    ? "http://10.2.234.204:8000/api" // IP de la máquina host para desarrollo
    : "https://tu-api-produccion.com/api", // Producción

  TIMEOUT: 30000, // Aumentado a 30 segundos

  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Función para obtener la URL base según el entorno
export const getBaseURL = () => {
  return API_CONFIG.BASE_URL;
};
