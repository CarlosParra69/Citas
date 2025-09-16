import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CitasHoyScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Citas de hoy</Text>
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

export default CitasHoyScreen;
