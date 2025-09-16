import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MedicosMasCitasScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Médicos con más citas</Text>
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

export default MedicosMasCitasScreen;
