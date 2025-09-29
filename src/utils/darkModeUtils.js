/**
 * Utilidades específicas para el modo oscuro
 * Proporciona funciones y constantes para modo oscuro completamente negro/gris
 */

import { useThemeColors } from "./themeColors";

/**
 * Hook para obtener colores específicos del modo oscuro con utilidades adicionales
 */
export const useDarkModeColors = () => {
  const colors = useThemeColors();

  return {
    ...colors,
    // Gradientes para fondos
    gradientStart: colors.background,
    gradientEnd: colors.surface,

    // Sombras mejoradas para modo oscuro
    shadowLight: "rgba(0, 0, 0, 0.1)",
    shadowMedium: "rgba(0, 0, 0, 0.2)",
    shadowHeavy: "rgba(0, 0, 0, 0.3)",

    // Colores para estados interactivos
    hover: colors.surface,
    pressed: colors.surfaceSecondary,

    // Colores para elementos especiales
    accent: colors.info,
    highlight: colors.warning,
  };
};

/**
 * Función para determinar si el modo oscuro está activo
 */
export const isDarkMode = () => {
  try {
    const { useTheme } = require("../context/ThemeContext");
    const { theme } = useTheme();
    return theme === "dark";
  } catch (error) {
    return false;
  }
};

/**
 * Colores específicos para diferentes tipos de contenido en modo oscuro
 */
export const darkModeContentColors = {
  // Para texto sobre fondos de tarjetas
  cardText: "#FFFFFF",
  cardTextSecondary: "#B0B0B0",

  // Para fondos de modales y overlays
  modalBackground: "rgba(0, 0, 0, 0.8)",
  modalContent: "#1E1E1E",

  // Para elementos destacados (completamente oscuros)
  highlightBackground: "#2A2A2A",
  accentBackground: "#333333",

  // Para separadores y divisores
  divider: "#333333",
  dividerLight: "#2A2A2A",
};

export default {
  useDarkModeColors,
  isDarkMode,
  darkModeContentColors,
};
