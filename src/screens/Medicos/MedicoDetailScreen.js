import React from "react";
import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../../styles/globalStyles";

const fakeMedico = {
  nombre: "Dra. Ana Torres",
  especialidad: "Cardiología",
  descripcion: "Especialista en corazón y circulación.",
  disponibilidad: "Lunes a Viernes, 8:00 - 16:00",
  telefono: "555-1234",
  email: "ana.torres@novasalud.com",
};

const MedicoDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fakeMedico.nombre}</Text>
      <Text style={styles.subtitle}>{fakeMedico.especialidad}</Text>
      <Text style={styles.text}>{fakeMedico.descripcion}</Text>
      <Text style={styles.text}>
        Disponibilidad: {fakeMedico.disponibilidad}
      </Text>
      <Text style={styles.text}>Teléfono: {fakeMedico.telefono}</Text>
      <Text style={styles.text}>Email: {fakeMedico.email}</Text>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#424242",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#212121",
    marginBottom: 8,
    textAlign: "center",
  },
});

export default MedicoDetailScreen;
