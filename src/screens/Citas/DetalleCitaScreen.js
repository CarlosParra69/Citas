import React from "react";
import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../../styles/globalStyles";
import { formatDate } from "../../utils/formatDate";

const fakeCita = {
  medico: "Dra. Ana Torres",
  fecha: "2025-09-16T09:00:00",
  estado: "Confirmada",
  motivo: "Chequeo anual de corazón",
  consultorio: "A-101",
};

const DetalleCitaScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle de la Cita</Text>
      <Text style={styles.label}>Médico:</Text>
      <Text style={styles.value}>{fakeCita.medico}</Text>
      <Text style={styles.label}>Fecha:</Text>
      <Text style={styles.value}>{formatDate(fakeCita.fecha)}</Text>
      <Text style={styles.label}>Estado:</Text>
      <Text style={styles.value}>{fakeCita.estado}</Text>
      <Text style={styles.label}>Motivo:</Text>
      <Text style={styles.value}>{fakeCita.motivo}</Text>
      <Text style={styles.label}>Consultorio:</Text>
      <Text style={styles.value}>{fakeCita.consultorio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#424242",
    fontWeight: "bold",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#212121",
    marginBottom: 8,
  },
});

export default DetalleCitaScreen;
