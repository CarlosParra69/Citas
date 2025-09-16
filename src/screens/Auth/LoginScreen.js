import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import useAuth from "../../hooks/useAuth";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import globalStyles from "../../styles/globalStyles";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hospitalTitle}>Adso Health</Text>
      <Text style={styles.subtitle}>Acceso a Citas Médicas</Text>
      <InputField
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputField
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <ButtonPrimary
        title="Iniciar Sesión"
        onPress={handleLogin}
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

export default LoginScreen;
