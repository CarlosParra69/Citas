import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const Loader = () => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in Loader useThemeColors:", error);
    colors = {
      primary: "#FF6B35",
    };
  }

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default Loader;
