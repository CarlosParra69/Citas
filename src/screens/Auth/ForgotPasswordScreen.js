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

const ForgotPasswordScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;

    // Limpiar errores previos
    setEmailError("");

    // Validar email
    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Ingrese un correo electrónico válido");
      isValid = false;
    }

    return isValid;
  };

  const handleSendResetEmail = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if (response.data.success) {
        Alert.alert(
          "Correo enviado",
          "Se ha enviado un correo electrónico con instrucciones para recuperar tu contraseña. Revisa tu bandeja de entrada.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);

      let errorMessage = "Error al enviar el correo. Por favor, inténtalo de nuevo.";

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.subtitle}>Recuperar Contraseña</Text>

        <Text style={styles.description}>
          Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
        </Text>

        <InputField
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
        />

        <ButtonPrimary
          title="Enviar correo de recuperación"
          onPress={handleSendResetEmail}
          disabled={loading}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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

export default ForgotPasswordScreen;