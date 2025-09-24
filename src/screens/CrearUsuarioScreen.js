import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { createUsuario } from "../api/usuarios";
import InputField from "../components/InputField";
import ButtonPrimary from "../components/ButtonPrimary";
import GenderSelector from "../components/GenderSelector";
import { useThemeColors } from "../utils/themeColors";
import { useAuthContext } from "../context/AuthContext";

const CrearUsuarioScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "M",
    rol: "paciente",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Las contraseñas no coinciden";
    }

    if (formData.telefono && !/^\d+$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe contener solo números";
    }

    if (
      formData.fecha_nacimiento &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha_nacimiento)
    ) {
      newErrors.fecha_nacimiento = "La fecha debe tener el formato YYYY-MM-DD";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        rol: formData.rol,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };

      // Agregar campos opcionales si están presentes
      if (formData.cedula.trim()) dataToSend.cedula = formData.cedula.trim();
      if (formData.telefono.trim())
        dataToSend.telefono = formData.telefono.trim();
      if (formData.fecha_nacimiento.trim())
        dataToSend.fecha_nacimiento = formData.fecha_nacimiento.trim();
      if (formData.genero) dataToSend.genero = formData.genero;

      const response = await createUsuario(dataToSend);

      if (response.data.success) {
        Alert.alert("Éxito", "Usuario creado exitosamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        throw new Error(response.data.message || "Error al crear usuario");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      Alert.alert("Error", errorMessage);
      console.error("Error creating usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determinar roles disponibles según el rol del usuario actual
  const getAvailableRoles = () => {
    if (user?.rol === "superadmin") {
      return [
        { label: "Paciente", value: "paciente" },
        { label: "Médico", value: "medico" },
        { label: "Superadmin", value: "superadmin" },
      ];
    } else if (user?.rol === "medico") {
      return [{ label: "Paciente", value: "paciente" }];
    }
    return [];
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Crear Nuevo Usuario</Text>
        <Text style={styles.subtitle}>Completa la información del usuario</Text>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <InputField
            label="Nombre *"
            value={formData.nombre}
            onChangeText={(value) => handleInputChange("nombre", value)}
            error={errors.nombre}
            placeholder="Ingresa el nombre"
          />

          <InputField
            label="Apellido *"
            value={formData.apellido}
            onChangeText={(value) => handleInputChange("apellido", value)}
            error={errors.apellido}
            placeholder="Ingresa el apellido"
          />

          <InputField
            label="Email *"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            error={errors.email}
            placeholder="ejemplo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Cédula"
            value={formData.cedula}
            onChangeText={(value) => handleInputChange("cedula", value)}
            placeholder="Ingresa la cédula"
            keyboardType="numeric"
          />

          <InputField
            label="Teléfono"
            value={formData.telefono}
            onChangeText={(value) => handleInputChange("telefono", value)}
            error={errors.telefono}
            placeholder="Ingresa el teléfono"
            keyboardType="phone-pad"
          />

          <InputField
            label="Fecha de Nacimiento"
            value={formData.fecha_nacimiento}
            onChangeText={(value) =>
              handleInputChange("fecha_nacimiento", value)
            }
            error={errors.fecha_nacimiento}
            placeholder="YYYY-MM-DD"
          />

          <GenderSelector
            label="Género"
            value={formData.genero}
            onValueChange={(value) => handleInputChange("genero", value)}
          />
        </View>

        {/* Información de cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>

          <View style={styles.roleSelector}>
            <Text style={styles.roleLabel}>Rol del Usuario *</Text>
            <View style={styles.roleButtons}>
              {getAvailableRoles().map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    formData.rol === role.value && styles.activeRoleButton,
                  ]}
                  onPress={() => handleInputChange("rol", role.value)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.rol === role.value &&
                        styles.activeRoleButtonText,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            label="Contraseña *"
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            error={errors.password}
            placeholder="Ingresa la contraseña"
            secureTextEntry
            autoCapitalize="none"
          />

          <InputField
            label="Confirmar Contraseña *"
            value={formData.password_confirmation}
            onChangeText={(value) =>
              handleInputChange("password_confirmation", value)
            }
            error={errors.password_confirmation}
            placeholder="Confirma la contraseña"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <ButtonPrimary
          title="Crear Usuario"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    roleSelector: {
      marginBottom: 16,
    },
    roleLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    roleButtons: {
      flexDirection: "row",
      gap: 8,
    },
    roleButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.lightGray,
      alignItems: "center",
      backgroundColor: colors.white,
    },
    activeRoleButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    roleButtonText: {
      fontSize: 14,
      color: colors.gray,
      fontWeight: "500",
    },
    activeRoleButtonText: {
      color: colors.white,
    },
    submitButton: {
      marginTop: 8,
      marginBottom: 32,
    },
  });

export default CrearUsuarioScreen;
