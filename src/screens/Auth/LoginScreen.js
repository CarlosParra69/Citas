import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import useAuth from "../../hooks/useAuth";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import globalStyles from "../../styles/globalStyles";
import colors from "../../utils/colors";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [cedula, setCedula] = useState("");
  const [emailError, setEmailError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const { login, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    let isValid = true;

    // Limpiar errores previos
    setEmailError("");
    setCedulaError("");

    // Validar email
    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingrese un correo electrónico válido");
      isValid = false;
    }

    // Validar cédula
    if (!cedula.trim()) {
      setCedulaError("La contraseña es requerida");
      isValid = false;
    } else if (cedula.trim().length < 6) {
      setCedulaError("La cédula debe tener al menos 6 caracteres");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email.trim(), cedula.trim());
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hospitalTitle}>Nueva EPS</Text>
      <Text style={styles.subtitle}>Gestión de Citas Médicas</Text>

      <InputField
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <InputField
        placeholder="Contraseña"
        value={cedula}
        onChangeText={setCedula}
        keyboardType="password"
        secureTextEntry
        autoCapitalize="none"
        error={cedulaError}
      />

      <ButtonPrimary
        title="Iniciar Sesión"
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerText}>
          ¿No tienes cuenta? Regístrate aquí
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  hospitalTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
    marginBottom: 32,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
