import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { updateUser } from "../../api/auth";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";

const EditProfileScreen = ({ navigation, route }) => {
  const { user, updateUser: updateUserContext } = useAuthContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    email: "",
    eps: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        cedula: user.cedula || "",
        telefono: user.telefono || "",
        email: user.email || "",
        eps: user.eps || "",
      });
    }
  }, [user]);

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await updateUser({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        eps: formData.eps.trim(),
      });

      if (response.success) {
        // Actualizar el contexto del usuario
        await updateUserContext();
        Alert.alert("Éxito", "Perfil actualizado correctamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "No se pudo actualizar el perfil"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos del perfil..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Editar Perfil
        </Text>
        <Text style={[styles.subtitle, { color: colors.gray }]}>
          Actualiza tu información personal
        </Text>

        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Información Personal
          </Text>

          <InputField
            label="Nombre *"
            placeholder="Ingresa tu nombre"
            value={formData.nombre}
            onChangeText={(value) => handleChange("nombre", value)}
            error={errors.nombre}
          />

          <InputField
            label="Apellido *"
            placeholder="Ingresa tu apellido"
            value={formData.apellido}
            onChangeText={(value) => handleChange("apellido", value)}
            error={errors.apellido}
          />

          <InputField
            label="Cédula *"
            placeholder="Ingresa tu número de cédula"
            value={formData.cedula}
            onChangeText={(value) => handleChange("cedula", value)}
            keyboardType="numeric"
            error={errors.cedula}
          />

          <InputField
            label="Teléfono *"
            placeholder="Ingresa tu número de teléfono"
            value={formData.telefono}
            onChangeText={(value) => handleChange("telefono", value)}
            keyboardType="phone-pad"
            error={errors.telefono}
          />

          <InputField
            label="Correo electrónico *"
            placeholder="Ingresa tu correo electrónico"
            value={formData.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <InputField
            label="EPS"
            placeholder="Ingresa tu EPS (opcional)"
            value={formData.eps}
            onChangeText={(value) => handleChange("eps", value)}
            error={errors.eps}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.gray }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.gray }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <ButtonPrimary
            title="Guardar Cambios"
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            style={styles.saveButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 24,
    },
    formCard: {
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 32,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
    },
  });

export default EditProfileScreen;
