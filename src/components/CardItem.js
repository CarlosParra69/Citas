import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const CardItem = ({ title, subtitle, onPress, rightContent }) => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in CardItem useThemeColors:", error);
    colors = {
      white: "#FFFFFF",
      black: "#000000",
      text: "#1C1C1E",
      gray: "#8E8E93",
    };
  }

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightContent && (
          <View style={styles.rightContent}>{rightContent}</View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      marginVertical: 8,
      marginHorizontal: 16,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    content: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.gray,
      marginTop: 4,
    },
    rightContent: {
      marginLeft: 16,
    },
  });

export default CardItem;
