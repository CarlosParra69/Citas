import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuthContext } from "../context/AuthContext";
import { getEspecialidades } from "../api/especialidades";
import { createMedico } from "../api/medicos";
import InputField from "../components/InputField";
import ButtonPrimary from "../components/ButtonPrimary";
import LoadingSpinner from "../components/LoadingSpinner";
import { useThemeColors } from "../utils/themeColors";
import { useGlobalStyles } from "../styles/globalStyles";

const CrearMedicoScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const { user } = useAuthContext();
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "",
    especialidades: [],
    numero_licencia: "",
    anos_experiencia: "",
  });

  const [errors, setErrors] = useState({});
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.rol !== "superadmin") {
      Alert.alert(
        "Acceso Denegado",
        "No tienes permisos para acceder a esta pantalla",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }
    loadEspecialidades();
  }, [user]);

  const loadEspecialidades = async () => {
    try {
      const response = await getEspecialidades();
      if (response.success) {
        setEspecialidades(response.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar las especialidades");
      }
    } catch (error) {
      console.error("Error loading especialidades:", error);
      Alert.alert("Error", "No se pudieron cargar las especialidades");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar campos requeridos
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida";
    } else if (formData.cedula.trim().length < 6) {
      newErrors.cedula = "La cédula debe tener al menos 6 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingrese un email válido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (formData.telefono.trim().length < 7) {
      newErrors.telefono = "El teléfono debe tener al menos 7 dígitos";
    }

    if (formData.especialidades.length === 0) {
      newErrors.especialidades = "Debe seleccionar al menos una especialidad";
    }

    if (!formData.numero_licencia.trim()) {
      newErrors.numero_licencia = "El número de licencia es requerido";
    }

    if (!formData.anos_experiencia.trim()) {
      newErrors.anos_experiencia = "Los años de experiencia son requeridos";
    } else {
      const anos = parseInt(formData.anos_experiencia);
      if (isNaN(anos) || anos < 0 || anos > 50) {
        newErrors.anos_experiencia = "Ingrese un número válido de años (0-50)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEspecialidadToggle = (especialidadId) => {
    setFormData((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidadId)
        ? prev.especialidades.filter((id) => id !== especialidadId)
        : [...prev.especialidades, especialidadId],
    }));

    // Limpiar error de especialidades si existe
    if (errors.especialidades) {
      setErrors((prev) => ({ ...prev, especialidades: "" }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const medicoData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        especialidades: formData.especialidades,
        numero_licencia: formData.numero_licencia.trim(),
        anos_experiencia: parseInt(formData.anos_experiencia),
      };

      const response = await createMedico(medicoData);

      if (response.success) {
        Alert.alert(
          "Médico Creado",
          "El médico ha sido creado exitosamente. Se han enviado las credenciales de acceso por email.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "No se pudo crear el médico");
      }
    } catch (error) {
      console.error("Error creating medico:", error);
      Alert.alert(
        "Error",
        "No se pudo crear el médico. Verifique los datos e intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Crear Nuevo Médico</Text>

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <InputField
          label="Nombre *"
          placeholder="Ingrese el nombre"
          value={formData.nombre}
          onChangeText={(value) => handleChange("nombre", value)}
          error={errors.nombre}
        />

        <InputField
          label="Apellido *"
          placeholder="Ingrese el apellido"
          value={formData.apellido}
          onChangeText={(value) => handleChange("apellido", value)}
          error={errors.apellido}
        />

        <InputField
          label="Cédula *"
          placeholder="Ingrese la cédula"
          value={formData.cedula}
          onChangeText={(value) => handleChange("cedula", value)}
          keyboardType="numeric"
          error={errors.cedula}
        />

        <InputField
          label="Email *"
          placeholder="Ingrese el email"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <InputField
          label="Teléfono *"
          placeholder="Ingrese el teléfono"
          value={formData.telefono}
          onChangeText={(value) => handleChange("telefono", value)}
          keyboardType="phone-pad"
          error={errors.telefono}
        />
      </View>

      {/* Información Profesional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Profesional</Text>

        <Text style={styles.label}>Especialidades *</Text>
        <View style={styles.especialidadesContainer}>
          {especialidades.map((especialidad) => (
            <TouchableOpacity
              key={especialidad.id}
              style={[
                styles.especialidadChip,
                formData.especialidades.includes(especialidad.id) &&
                  styles.selectedEspecialidadChip,
              ]}
              onPress={() => handleEspecialidadToggle(especialidad.id)}
            >
              <Text
                style={[
                  styles.especialidadChipText,
                  formData.especialidades.includes(especialidad.id) &&
                    styles.selectedEspecialidadChipText,
                ]}
              >
                {especialidad.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.especialidades && (
          <Text style={styles.errorText}>{errors.especialidades}</Text>
        )}

        <InputField
          label="Número de Licencia *"
          placeholder="Ingrese el número de licencia médica"
          value={formData.numero_licencia}
          onChangeText={(value) => handleChange("numero_licencia", value)}
          error={errors.numero_licencia}
        />

        <InputField
          label="Años de Experiencia *"
          placeholder="Ingrese los años de experiencia"
          value={formData.anos_experiencia}
          onChangeText={(value) => handleChange("anos_experiencia", value)}
          keyboardType="numeric"
          error={errors.anos_experiencia}
        />
      </View>

      <ButtonPrimary
        title="Crear Médico"
        onPress={handleSubmit}
        disabled={loading}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 24,
    },
    section: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.black,
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
      color: colors.primary,
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    especialidadesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    especialidadChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.lightGray,
      backgroundColor: colors.white,
    },
    selectedEspecialidadChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    especialidadChipText: {
      fontSize: 14,
      color: colors.gray,
    },
    selectedEspecialidadChipText: {
      color: colors.white,
      fontWeight: "600",
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    submitButton: {
      marginTop: 8,
      marginBottom: 20,
    },
  });

export default CrearMedicoScreen;
