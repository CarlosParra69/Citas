import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const LoadingSpinner = ({ message = "Cargando..." }) => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in LoadingSpinner useThemeColors:", error);
    colors = {
      background: "#F9F9F9",
      primary: "#FF6B35",
      text: "#1C1C1E",
    };
  }

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    message: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
    },
  });

export default LoadingSpinner;
