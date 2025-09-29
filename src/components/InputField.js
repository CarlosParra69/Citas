import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const InputField = ({ label, error, ...props }) => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in InputField useThemeColors:", error);
    colors = {
      text: "#1C1C1E",
      border: "#C6C6C8",
      error: "#FF3B30",
      gray: "#8E8E93",
    };
  }

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.gray}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginBottom: 15,
    },
    label: {
      marginBottom: 5,
      fontSize: 14,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 5,
    },
  });

export default InputField;
