import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "../utils/themeColors";

const ButtonPrimary = ({ onPress, title, disabled, loading, style }) => {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  const styles = React.useMemo(() => createStyles(colors), [colors]);

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
