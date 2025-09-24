import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { createPaciente } from "../../api/pacientes";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import GenderSelector from "../../components/GenderSelector";
import { useThemeColors } from "../../utils/themeColors";

const CrearPacienteScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
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
    alergias: "",
    medicamentos_actuales: "",
    antecedentes_medicos: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
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

    if (!formData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida";
    } else if (!/^\d+$/.test(formData.cedula)) {
      newErrors.cedula = "La cédula debe contener solo números";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
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
      // Enviar todos los campos, incluso los vacíos (la API debe manejar nulls)
      const dataToSend = { ...formData };

      const response = await createPaciente(dataToSend);

      if (response.data.success) {
        Alert.alert("Éxito", "Paciente creado exitosamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        throw new Error(response.data.message || "Error al crear paciente");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      Alert.alert("Error", errorMessage);
      console.error("Error creating paciente:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Crear Nuevo Paciente</Text>
        <Text style={styles.subtitle}>
          Completa la información del paciente
        </Text>

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
            label="Cédula *"
            value={formData.cedula}
            onChangeText={(value) => handleInputChange("cedula", value)}
            error={errors.cedula}
            placeholder="Ingresa la cédula"
            keyboardType="numeric"
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

          <InputField
            label="Dirección"
            value={formData.direccion}
            onChangeText={(value) => handleInputChange("direccion", value)}
            placeholder="Ingresa la dirección"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Información médica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Médica</Text>

          <InputField
            label="EPS"
            value={formData.eps}
            onChangeText={(value) => handleInputChange("eps", value)}
            placeholder="Nombre de la EPS"
          />

          <InputField
            label="Alergias"
            value={formData.alergias}
            onChangeText={(value) => handleInputChange("alergias", value)}
            placeholder="Describe las alergias conocidas"
            multiline
            numberOfLines={3}
          />

          <InputField
            label="Medicamentos Actuales"
            value={formData.medicamentos_actuales}
            onChangeText={(value) =>
              handleInputChange("medicamentos_actuales", value)
            }
            placeholder="Medicamentos que toma actualmente"
            multiline
            numberOfLines={3}
          />

          <InputField
            label="Antecedentes Médicos"
            value={formData.antecedentes_medicos}
            onChangeText={(value) =>
              handleInputChange("antecedentes_medicos", value)
            }
            placeholder="Antecedentes médicos relevantes"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Contacto de emergencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>

          <InputField
            label="Nombre del Contacto"
            value={formData.contacto_emergencia}
            onChangeText={(value) =>
              handleInputChange("contacto_emergencia", value)
            }
            placeholder="Nombre del contacto de emergencia"
          />

          <InputField
            label="Teléfono del Contacto"
            value={formData.telefono_emergencia}
            onChangeText={(value) =>
              handleInputChange("telefono_emergencia", value)
            }
            placeholder="Teléfono del contacto de emergencia"
            keyboardType="phone-pad"
          />
        </View>

        <ButtonPrimary
          title="Crear Paciente"
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
    submitButton: {
      marginTop: 8,
      marginBottom: 32,
    },
  });

export default CrearPacienteScreen;
