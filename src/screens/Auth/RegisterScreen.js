import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import globalStyles from "../../styles/globalStyles";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import useAuth from "../../hooks/useAuth";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: "Carlos Parra",
    email: "carlos.parra@novasalud.com",
    password: "123456",
    confirmPassword: "123456",
  });
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      await register(formData);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error al registrarse:", error);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hospitalTitle}>Hospital NovaSalud Express</Text>
      <Text style={styles.subtitle}>Registro de Usuario</Text>
      <InputField
        placeholder="Nombre completo"
        value={formData.nombre}
        onChangeText={(value) => handleChange("nombre", value)}
      />
      <InputField
        placeholder="Correo electrónico"
        value={formData.email}
        onChangeText={(value) => handleChange("email", value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputField
        placeholder="Contraseña"
        value={formData.password}
        onChangeText={(value) => handleChange("password", value)}
        secureTextEntry
      />
      <InputField
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword}
        onChangeText={(value) => handleChange("confirmPassword", value)}
        secureTextEntry
      />
      <ButtonPrimary
        title="Registrarse"
        onPress={handleRegister}
        loading={loading}
      />
      {error && <Text style={globalStyles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F8FF",
  },
  hospitalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1976D2",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: "#424242",
    textAlign: "center",
    marginBottom: 24,
  },
});

export default RegisterScreen;
