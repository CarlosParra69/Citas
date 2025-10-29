// Configuración de la API
import Constants from "expo-constants";
let isDevelopment;
try {
  // Check if we're in development environment
  // Para EAS Build, también verificamos si estamos en modo preview o development
  const isEASBuild = typeof Constants !== "undefined" && Constants.expoConfig?.extra?.eas;
  const isPreviewBuild = isEASBuild && process.env.NODE_ENV !== "production";

  isDevelopment = typeof __DEV__ !== "undefined" ? __DEV__ : (isPreviewBuild || true);
} catch (error) {
  console.error("Error checking __DEV__:", error);
  isDevelopment = true; // Default to development
}

// Para builds de EAS, permitir override mediante variable de entorno
const forceDevelopmentURL = process.env.EXPO_PUBLIC_FORCE_DEVELOPMENT_URL === "true";

export const API_CONFIG = {
  // Configuraciones para diferentes entornos
  BASE_URL: (isDevelopment || forceDevelopmentURL)
    ? "http://192.168.1.12:8000/api" // URL de desarrollo (ngrok)
    : "http://192.168.1.12:8000/api", // Producción

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
