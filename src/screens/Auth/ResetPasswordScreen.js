import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useThemeColors } from "../../utils/themeColors";
import { useTheme } from "../../context/ThemeContext";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import globalStyles from "../../styles/globalStyles";
import axiosInstance from "../../utils/axiosInstance";

const ResetPasswordScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Obtener parámetros de la URL (token y email)
  // Primero intentar desde route.params (navegación interna)
  // Luego intentar desde la URL actual (acceso externo)
  let { token, email } = route.params || {};

  // Si no hay parámetros en route.params, intentar obtenerlos de la URL actual
  if (!token || !email) {
    try {
      // Solución alternativa para acceso externo desde navegador
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlEmail = urlParams.get('email');

        if (urlToken && urlEmail) {
          token = urlToken;
          email = decodeURIComponent(urlEmail);
          console.log('Parámetros obtenidos de URL externa:', { token, email });
        }
      }
    } catch (error) {
      console.log('No se pudieron obtener parámetros de URL externa:', error);
    }
  }

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar que tenemos token y email
    if (!token || !email) {
      Alert.alert(
        "Error",
        "Enlace inválido o parámetros faltantes. Solicita un nuevo enlace de recuperación.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login")
          }
        ]
      );
    }
  }, [token, email]);

  // Debug: mostrar parámetros actuales
  useEffect(() => {
    console.log('ResetPasswordScreen - Parámetros recibidos:', {
      routeParams: route.params,
      token,
      email,
      fullUrl: typeof window !== 'undefined' ? window.location?.href : 'No disponible'
    });
  }, []);

  const validateForm = () => {
    let isValid = true;

    // Limpiar errores previos
    setPasswordError("");
    setConfirmPasswordError("");

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError("La contraseña es requerida");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Debes confirmar la contraseña");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email: email,
        token: token,
        password: password,
        password_confirmation: confirmPassword,
      });

      if (response.data.success) {
        Alert.alert(
          "Contraseña actualizada",
          "Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);

      let errorMessage = "Error al actualizar la contraseña. El enlace podría haber expirado.";

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return null; // No renderizar nada si no hay token o email
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={
            theme === "dark"
              ? require("../../assets/svg/MediApp_logo_dark.png")
              : require("../../assets/svg/MediApp_logo.png")
          }
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.hospitalTitle}>MediApp</Text>
        <Text style={styles.subtitle}>Nueva Contraseña</Text>

        <Text style={styles.description}>
          Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
        </Text>

        <InputField
          placeholder="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          keyboardType="default"
          secureTextEntry
          autoCapitalize="none"
          error={passwordError}
        />

        <InputField
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          keyboardType="default"
          secureTextEntry
          autoCapitalize="none"
          error={confirmPasswordError}
        />

        <ButtonPrimary
          title="Actualizar contraseña"
          onPress={handleResetPassword}
          disabled={loading}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.backButtonText}>← Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      justifyContent: "center",
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
    description: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
    },
    backButton: {
      marginTop: 20,
      alignItems: "center",
    },
    backButtonText: {
      color: colors.primary,
      fontSize: 16,
      textDecorationLine: "underline",
    },
  });

export default ResetPasswordScreen;