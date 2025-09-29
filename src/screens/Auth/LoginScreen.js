import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import useAuth from "../../hooks/useAuth";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import globalStyles from "../../styles/globalStyles";
import { useThemeColors } from "../../utils/themeColors";

const LoginScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
    setPasswordError("");

    // Validar email
    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingrese un correo electrónico válido");
      isValid = false;
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError("La contraseña es requerida");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email.trim(), password.trim());
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/svg/MediApp_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.hospitalTitle}>MediApp</Text>
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
        value={password}
        onChangeText={setPassword}
        keyboardType="default"
        secureTextEntry
        autoCapitalize="none"
        error={passwordError}
      />

      <ButtonPrimary
        title="Iniciar Sesión"
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    logo: {
      width: 120,
      height: 120,
      alignSelf: "center",
      marginBottom: 20,
    },
    hospitalTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
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
