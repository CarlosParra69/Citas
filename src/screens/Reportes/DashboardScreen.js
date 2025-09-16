import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Dashboard de reportes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DashboardScreen;
