// Configuración de la API
let isDevelopment;
try {
  // Check if we're in development environment
  isDevelopment = typeof __DEV__ !== "undefined" ? __DEV__ : true;
} catch (error) {
  console.error("Error checking __DEV__:", error);
  isDevelopment = true; // Default to development
}

export const API_CONFIG = {
  // Configuraciones para diferentes entornos
  BASE_URL: isDevelopment
    ? "http://10.2.235.97:8000/api" // IP de la máquina host para desarrollo
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
