import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "../utils/themeColors";

const ButtonPrimary = ({
  onPress,
  title,
  disabled,
  loading,
  style,
  colors: propColors,
}) => {
  const themeColors = useThemeColors();
  const colors = propColors || themeColors;

  // Verificar que colors tenga las propiedades necesarias
  const safeColors = colors || {
    primary: "#007AFF",
    gray: "#CCCCCC",
    white: "#FFFFFF",
  };

  const isDisabled = disabled || loading;

  // Crear estilos con manejo de errores
  const styles = React.useMemo(() => {
    try {
      return createStyles(safeColors);
    } catch (error) {
      console.warn("Error creating ButtonPrimary styles:", error);
      // Fallback styles
      return {
        button: {
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
          marginVertical: 10,
        },
        disabled: {
          backgroundColor: "#CCCCCC",
          opacity: 0.7,
        },
        text: {
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "bold",
        },
      };
    }
  }, [safeColors]);

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginVertical: 10,
    },
    disabled: {
      backgroundColor: colors.gray,
      opacity: 0.7,
    },
    text: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default ButtonPrimary;
