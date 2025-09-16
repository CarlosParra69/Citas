import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PacienteDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Detalle del Paciente</Text>
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

export default PacienteDetailScreen;
