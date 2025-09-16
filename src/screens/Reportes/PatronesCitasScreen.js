import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PatronesCitasScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Patrones de citas</Text>
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

export default PatronesCitasScreen;
