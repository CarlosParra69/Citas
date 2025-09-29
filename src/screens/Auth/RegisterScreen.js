import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import InputField from "../../components/InputField";
import GenderSelector from "../../components/GenderSelector";
import ButtonPrimary from "../../components/ButtonPrimary";
import useAuth from "../../hooks/useAuth";
import { useThemeColors } from "../../utils/themeColors";

const RegisterScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    fecha_nacimiento: "",
    genero: "M",
    telefono: "",
    email: "",
    direccion: "",
    eps: "",
  });

  const [errors, setErrors] = useState({});
  const { register, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    // Validar cédula
    if (!formData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida";
    } else if (formData.cedula.trim().length < 6) {
      newErrors.cedula = "La cédula debe tener al menos 6 caracteres";
    }

    // Validar fecha de nacimiento
    if (!formData.fecha_nacimiento.trim()) {
      newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida";
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (formData.telefono.trim().length < 7) {
      newErrors.telefono = "El teléfono debe tener al menos 7 dígitos";
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        direccion: formData.direccion.trim(),
        eps: formData.eps.trim(),
      });

      Alert.alert(
        "Registro Exitoso",
        "Tu cuenta ha sido creada correctamente y has iniciado sesión automáticamente.",
        [
          {
            text: "OK",
          },
        ]
      );
    } catch (error) {
      console.error("Error al registrarse:", error);
    }
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.hospitalTitle}>Sistema EPS</Text>
      <Text style={styles.subtitle}>Crear Nueva Cuenta</Text>

      <InputField
        placeholder="Nombre"
        value={formData.nombre}
        onChangeText={(value) => handleChange("nombre", value)}
        error={errors.nombre}
      />

      <InputField
        placeholder="Apellido"
        value={formData.apellido}
        onChangeText={(value) => handleChange("apellido", value)}
        error={errors.apellido}
      />

      <InputField
        placeholder="Cédula"
        value={formData.cedula}
        onChangeText={(value) => handleChange("cedula", value)}
        keyboardType="numeric"
        error={errors.cedula}
      />

      <InputField
        placeholder="Fecha de nacimiento (YYYY-MM-DD)"
        value={formData.fecha_nacimiento}
        onChangeText={(value) => handleChange("fecha_nacimiento", value)}
        error={errors.fecha_nacimiento}
      />

      <GenderSelector
        value={formData.genero}
        onValueChange={(value) => handleChange("genero", value)}
        error={errors.genero}
      />

      <InputField
        placeholder="Teléfono"
        value={formData.telefono}
        onChangeText={(value) => handleChange("telefono", value)}
        keyboardType="phone-pad"
        error={errors.telefono}
      />

      <InputField
        placeholder="Correo electrónico"
        value={formData.email}
        onChangeText={(value) => handleChange("email", value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <InputField
        placeholder="Dirección (opcional)"
        value={formData.direccion}
        onChangeText={(value) => handleChange("direccion", value)}
        error={errors.direccion}
      />

      <InputField
        placeholder="EPS (opcional)"
        value={formData.eps}
        onChangeText={(value) => handleChange("eps", value)}
        error={errors.eps}
      />

      <ButtonPrimary
        title="Registrarse"
        onPress={handleRegister}
        disabled={loading}
      />

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>
          ¿Ya tienes cuenta? Inicia sesión aquí
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
      justifyContent: "center",
      minHeight: "100%",
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
    loginLink: {
      marginTop: 20,
      alignItems: "center",
    },
    loginText: {
      color: colors.primary,
      fontSize: 16,
      textDecorationLine: "underline",
    },
  });

export default RegisterScreen;
