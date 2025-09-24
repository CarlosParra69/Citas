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
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
  });

// Hook para usar estilos globales con tema
export const useGlobalStyles = () => {
  const colors = useThemeColors();
  return createGlobalStyles(colors);
};

// Para compatibilidad hacia atrás, exportamos una versión por defecto con colores light
import colors from "./colors";
export default createGlobalStyles(colors);
