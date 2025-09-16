import React from "react";
import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../../styles/globalStyles";

const fakeUser = {
  nombre: "Carlos Parra",
  email: "carlos.parra@novasalud.com",
  telefono: "555-9876",
  rol: "Paciente",
};

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de Usuario</Text>
      <Text style={styles.label}>Nombre:</Text>
      <Text style={styles.value}>{fakeUser.nombre}</Text>
      <Text style={styles.label}>Correo:</Text>
      <Text style={styles.value}>{fakeUser.email}</Text>
      <Text style={styles.label}>Teléfono:</Text>
      <Text style={styles.value}>{fakeUser.telefono}</Text>
      <Text style={styles.label}>Rol:</Text>
      <Text style={styles.value}>{fakeUser.rol}</Text>
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

export default ProfileScreen;
