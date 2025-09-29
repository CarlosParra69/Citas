import { StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

export const createGlobalStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    text: {
      fontSize: 16,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.card || colors.surface || colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    error: {
      color: colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: 8,
      textAlign: "center",
    },
    // Estilos adicionales para modo oscuro
    input: {
      backgroundColor: colors.input || colors.surface || colors.white,
      borderColor: colors.border,
      color: colors.text,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    buttonSecondaryText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });

// Hook para usar estilos globales con tema
export const useGlobalStyles = () => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in useGlobalStyles useThemeColors:", error);
    colors = {
      background: "#F9F9F9",
      primary: "#FF6B35",
      text: "#1C1C1E",
      gray: "#8E8E93",
      white: "#FFFFFF",
      border: "#C6C6C8",
    };
  }

  return createGlobalStyles(colors);
};

// Para compatibilidad hacia atrás, exportamos una versión por defecto con colores light
let colors;
try {
  try {
    // Try ES6 import first
    const colorsModule = require("../utils/colors");
    colors = colorsModule.default || colorsModule;
  } catch (requireError) {
    console.error("Error with require, trying direct access:", requireError);
    // Try direct access as fallback
    colors = require("../utils/colors");
  }
} catch (error) {
  console.error("Error importing colors in globalStyles:", error);
  colors = {
    background: "#F9F9F9",
    primary: "#FF6B35",
    text: "#1C1C1E",
    gray: "#8E8E93",
    white: "#FFFFFF",
    border: "#C6C6C8",
    error: "#FF3B30",
    black: "#000000",
  };
}

export default createGlobalStyles(colors);
