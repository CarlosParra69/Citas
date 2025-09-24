import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const LoadingSpinner = ({ message = "Cargando..." }) => {
  const colors = useThemeColors();
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
