import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { getUsuarioById, updateUsuario } from "../../api/usuarios";
import { getMedicoById, updateMedico } from "../../api/medicos";
import { getPacienteById, updatePaciente } from "../../api/pacientes";
import LoadingSpinner from "../../components/LoadingSpinner";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";

const EditUsuarioScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const { usuarioId } = route.params;
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    cedula: "",
    telefono: "",
    rol: "",
    activo: 1,
    medico_id: null,
    paciente_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.rol === "superadmin") {
      loadUsuario();
    } else {
      Alert.alert(
        "Acceso Denegado",
        "No tienes permisos para editar usuarios",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [user, usuarioId]);

  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData]);

  const loadUsuario = async () => {
    try {
      setLoading(true);
      const response = await getUsuarioById(usuarioId);
      if (response.success) {
        const userData = response.data;
        console.log("User data:", userData);
        console.log("Loading telefono, paciente_id:", userData.paciente_id, "medico_id:", userData.medico_id);

        let telefono = "";

        // Cargar teléfono de la tabla específica
        if (userData.paciente_id) {
          const pacienteResponse = await getPacienteById(userData.paciente_id);
          console.log("Paciente response:", pacienteResponse);
          console.log("Paciente response success:", pacienteResponse.data.success);
          if (pacienteResponse.data.success) {
            telefono = pacienteResponse.data.data.telefono || "";
            console.log("Telefono from paciente:", telefono);
          }
        }

        if (userData.medico_id) {
          const medicoResponse = await getMedicoById(userData.medico_id);
          console.log("Medico response:", medicoResponse);
          console.log("Medico response success:", medicoResponse.success);
          if (medicoResponse.success) {
            telefono = medicoResponse.data.telefono || "";
            console.log("Telefono from medico:", telefono);
          }
        }

        console.log("Setting formData telefono:", telefono);
        const newFormData = {
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          cedula: userData.cedula || "",
          telefono: telefono,
          rol: userData.rol || "",
          activo: userData.activo || 1,
          medico_id: userData.medico_id || null,
          paciente_id: userData.paciente_id || null,
        };
        console.log("New formData:", newFormData);
        setFormData(newFormData);
      } else {
        Alert.alert("Error", "No se pudo cargar el usuario");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading usuario:", error);
      Alert.alert("Error", "No se pudo cargar el usuario");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "activo") {
      value = parseInt(value) || 1;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.apellido || !formData.email) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar teléfono para pacientes
    if (formData.rol === "paciente" && (!formData.telefono || formData.telefono.trim() === "")) {
      Alert.alert("Error", "El teléfono es obligatorio para pacientes");
      return;
    }

    try {
      setSaving(true);
      const response = await updateUsuario(usuarioId, formData);
      if (response.success) {
        // Actualizar teléfono en médico o paciente
        if (formData.rol === "medico" && formData.medico_id) {
          try {
            await updateMedico(formData.medico_id, { telefono: formData.telefono });
          } catch (error) {
            console.error("Error updating medico telefono:", error);
          }
        } else if (formData.rol === "paciente" && formData.paciente_id) {
          try {
            await updatePaciente(formData.paciente_id, { telefono: formData.telefono });
          } catch (error) {
            console.error("Error updating paciente telefono:", error);
          }
        }

        Alert.alert("Éxito", "Usuario actualizado correctamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", "No se pudo actualizar el usuario");
      }
    } catch (error) {
      console.error("Error updating usuario:", error);
      Alert.alert("Error", "No se pudo actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando usuario..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Usuario</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(value) => handleInputChange("nombre", value)}
            placeholder="Ingresa el nombre"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={styles.input}
            value={formData.apellido}
            onChangeText={(value) => handleInputChange("apellido", value)}
            placeholder="Ingresa el apellido"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Ingresa el email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cédula</Text>
          <TextInput
            style={styles.input}
            value={formData.cedula}
            onChangeText={(value) => handleInputChange("cedula", value)}
            placeholder="Ingresa la cédula"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Teléfono{formData.rol === "paciente" ? " *" : ""}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange("telefono", value)}
            placeholder="Ingresa el teléfono"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rol</Text>
          <TextInput
            style={styles.input}
            value={formData.rol}
            onChangeText={(value) => handleInputChange("rol", value)}
            placeholder="Ingresa el rol"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Activo</Text>
            <Switch
              value={formData.activo === 1}
              onValueChange={(value) => handleInputChange("activo", value ? 1 : 0)}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonPrimary
          title={saving ? "Guardando..." : "Guardar Cambios"}
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 24,
    },
    formContainer: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.white,
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    buttonContainer: {
      marginBottom: 24,
    },
  });

export default EditUsuarioScreen;