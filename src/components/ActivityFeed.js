import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useThemeColors } from "../utils/themeColors";

const ActivityFeed = ({ activities, style, useFlatList = true }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const renderActivity = (item, index) => (
    <View key={index} style={styles.activityItem}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        {index < activities.length - 1 && <View style={styles.line} />}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  const renderActivityFlatList = ({ item, index }) =>
    renderActivity(item, index);

  if (!activities || activities.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>No hay actividades recientes</Text>
      </View>
    );
  }

  if (useFlatList) {
    return (
      <View style={[styles.container, style]}>
        <FlatList
          data={activities}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderActivityFlatList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // Render sin FlatList para evitar conflictos de virtualización
  return (
    <View style={[styles.container, style]}>
      {activities.map((activity, index) => renderActivity(activity, index))}
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyContainer: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
    },
    activityItem: {
      flexDirection: "row",
      marginBottom: 16,
    },
    timeline: {
      alignItems: "center",
      marginRight: 12,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    line: {
      width: 2,
      height: 40,
      backgroundColor: colors.lightGray,
      marginTop: 8,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 4,
    },
    activityTime: {
      fontSize: 12,
      color: colors.lightGray,
    },
  });

export default ActivityFeed;
