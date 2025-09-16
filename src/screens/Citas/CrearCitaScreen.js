import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CrearCitaScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Crear nueva cita</Text>
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

export default CrearCitaScreen;
