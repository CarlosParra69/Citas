import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const QuickActionCard = ({ title, subtitle, icon, onPress, color, style }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const cardColor = color || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: cardColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.arrow, { borderLeftColor: cardColor }]}>
        <Text style={[styles.arrowText, { color: cardColor }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginVertical: 4,
    },
    iconContainer: {
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.gray,
    },
    arrow: {
      borderLeftWidth: 2,
      borderLeftColor: colors.primary,
      paddingLeft: 8,
    },
    arrowText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

export default QuickActionCard;
