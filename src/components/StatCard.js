import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const StatCard = ({ title, value, subtitle, icon, color, style }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const cardColor = color || colors.primary;

  return (
    <View style={[styles.card, { borderLeftColor: cardColor }, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.value, { color: cardColor }]}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flex: 1,
      marginHorizontal: 4,
    },
    iconContainer: {
      marginBottom: 8,
    },
    content: {
      alignItems: "center",
    },
    value: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 4,
    },
    title: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      color: colors.lightGray,
      textAlign: "center",
    },
  });

export default StatCard;
