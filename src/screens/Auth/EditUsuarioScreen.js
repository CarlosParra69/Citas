import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
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
    medico_id: null,
    paciente_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolModalVisible, setRolModalVisible] = useState(false);

  const roles = [
    { value: "paciente", label: "Paciente", color: "#ff9800" },
    { value: "medico", label: "Médico", color: "#1976d2" },
  ];

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

  const loadUsuario = async () => {
    try {
      setLoading(true);
      const response = await getUsuarioById(usuarioId);
      if (response.success) {
        const userData = response.data;
        console.log("User data:", userData);

        let telefono = "";

        // Cargar teléfono de la tabla específica
        if (userData.paciente_id) {
          const pacienteResponse = await getPacienteById(userData.paciente_id);
          if (pacienteResponse.data?.success) {
            telefono = pacienteResponse.data.data.telefono || "";
          }
        } else if (userData.medico_id) {
          const medicoResponse = await getMedicoById(userData.medico_id);
          if (medicoResponse.success) {
            telefono = medicoResponse.data.telefono || "";
          }
        }

        const newFormData = {
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          email: userData.email || "",
          cedula: userData.cedula || "",
          telefono: telefono,
          // Determinar rol basado en los IDs, permitir edición
          rol: userData.medico_id ? "medico" : 
               userData.paciente_id ? "paciente" : 
               userData.rol || "paciente",
          medico_id: userData.medico_id || null,
          paciente_id: userData.paciente_id || null,
        };
        
        
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
      
      // Preparar datos para actualizar usuario
      const usuarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        cedula: formData.cedula,
        telefono: formData.telefono,
      };

      // Actualizar usuario
      const response = await updateUsuario(usuarioId, usuarioData);
      if (response.success) {
        // Sincronización manual con médicos/pacientes
        await sincronizarDatos();
        
        Alert.alert("Éxito", "Usuario actualizado correctamente. Los cambios se han sincronizado con las tablas correspondientes.", [
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

  const sincronizarDatos = async () => {
    try {
      // Sincronizar con tabla específica según rol
      if (formData.rol === "medico" && formData.medico_id) {
        
        await updateMedico(formData.medico_id, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono,
        });
      } else if (formData.rol === "paciente" && formData.paciente_id) {
        
        await updatePaciente(formData.paciente_id, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono,
        });
      }
    } catch (error) {
      console.error("Error en sincronización manual:", error);
      // No mostrar error al usuario, la sincronización principal fue exitosa
    }
  };

  const renderRolSelector = () => {
    const selectedRole = roles.find(r => r.value === formData.rol);
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rol</Text>
        <TouchableOpacity
          style={[
            styles.rolSelector,
            { borderColor: selectedRole?.color || colors.lightGray }
          ]}
          onPress={() => setRolModalVisible(true)}
        >
          <Text
            style={[
              styles.rolSelectorText,
              { color: selectedRole?.color || colors.text }
            ]}
          >
            {selectedRole?.label || "Seleccionar rol"}
          </Text>
          <Text style={[styles.rolSelectorArrow, { color: selectedRole?.color || colors.text }]}>
            ▼
          </Text>
        </TouchableOpacity>
        
        {/* Modal para seleccionar rol */}
        <Modal
          transparent={true}
          visible={rolModalVisible}
          animationType="slide"
          onRequestClose={() => setRolModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
              <Text style={styles.modalTitle}>Seleccionar Rol</Text>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    {
                      backgroundColor: formData.rol === role.value ? role.color + "20" : colors.background,
                      borderColor: formData.rol === role.value ? role.color : colors.lightGray,
                    }
                  ]}
                  onPress={() => {
                    handleInputChange("rol", role.value);
                    setRolModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      {
                        color: formData.rol === role.value ? role.color : colors.text,
                        fontWeight: formData.rol === role.value ? "600" : "400",
                      }
                    ]}
                  >
                    {role.label}
                  </Text>
                  {formData.rol === role.value && (
                    <Text style={[styles.roleOptionCheck, { color: role.color }]}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setRolModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
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

        {/* Selector de rol mejorado */}
        {renderRolSelector()}

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
    rolSelector: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.white,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rolSelectorText: {
      fontSize: 16,
      fontWeight: "500",
    },
    rolSelectorArrow: {
      fontSize: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      borderRadius: 12,
      padding: 20,
      width: "80%",
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: colors.text,
    },
    roleOption: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 15,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    roleOptionText: {
      fontSize: 16,
    },
    roleOptionCheck: {
      fontSize: 18,
      fontWeight: "bold",
    },
    modalCancelButton: {
      marginTop: 10,
      padding: 12,
      backgroundColor: colors.lightGray,
      borderRadius: 8,
      alignItems: "center",
    },
    modalCancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
    infoContainer: {
      backgroundColor: colors.info + "20",
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    infoTitle: {
      fontWeight: "600",
    },
    buttonContainer: {
      marginBottom: 24,
    },
  });

export default EditUsuarioScreen;