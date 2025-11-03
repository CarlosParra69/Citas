import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../context/AuthContext";
import { createPaciente, updatePaciente } from "../../api/pacientes";
import { uploadAvatar } from "../../api/avatar";
import {
  saveImageToAvatars,
  compressImage,
  getRelativePath,
  deleteAvatarImage,
  avatarExists,
} from "../../utils/fileUtils";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import GenderSelector from "../../components/GenderSelector";
import { useThemeColors } from "../../utils/themeColors";

const CrearPacienteScreen = ({ navigation, route }) => {
  const { paciente } = route.params || {};
  const isEditing = !!paciente;
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const styles = createStyles(colors);

  useEffect(() => {
    if (user?.rol !== "superadmin" && user?.rol !== "medico") {
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
    
    if (isEditing && paciente) {
      loadPacienteData();
    }
  }, [user, isEditing]);

  const formatFechaNacimiento = (fecha) => {
    if (!fecha) return "";
    
    // Si ya está en formato YYYY-MM-DD, devolver tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    
    // Si es un timestamp o formato Date, convertir a YYYY-MM-DD
    try {
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.warn("Error formateando fecha:", error);
    }
    
    return "";
  };

  const loadPacienteData = () => {
    if (paciente) {
      setFormData({
        nombre: paciente.nombre || "",
        apellido: paciente.apellido || "",
        cedula: paciente.cedula || "",
        fecha_nacimiento: formatFechaNacimiento(paciente.fecha_nacimiento),
        genero: paciente.genero || "M",
        telefono: paciente.telefono || "",
        email: paciente.email || "",
        direccion: paciente.direccion || "",
        eps: paciente.eps || "",
        alergias: paciente.alergias || "",
        medicamentos_actuales: paciente.medicamentos_actuales || "",
        antecedentes_medicos: paciente.antecedentes_medicos || "",
        contacto_emergencia: paciente.contacto_emergencia || "",
        telefono_emergencia: paciente.telefono_emergencia || "",
        activo: paciente.activo !== undefined ? paciente.activo : true,
        password: "",
        password_confirmation: "",
      });
    }
  };

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
    activo: true,
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    Alert.alert("Seleccionar imagen", "Elige una opción", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Galería",
        onPress: pickImageFromGallery,
      },
      {
        text: "Cámara",
        onPress: pickImageFromCamera,
      },
    ]);
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Necesitamos acceso a la cámara para tomar fotos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const processAndUploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);

      // Comprimir la imagen
      const compressedUri = await compressImage(imageUri);

      // Guardar en la carpeta avatars local
      const localAvatarPath = await saveImageToAvatars(
        compressedUri,
        `temp_${Date.now()}`
      );

      return localAvatarPath;
    } catch (error) {
      console.error("Error procesando imagen:", error);
      Alert.alert("Error", "No se pudo procesar la imagen");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

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

    // Solo validar contraseña si no es modo edición
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = "La contraseña es requerida";
      } else if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }

      if (!formData.password_confirmation) {
        newErrors.password_confirmation =
          "La confirmación de contraseña es requerida";
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Las contraseñas no coinciden";
      }
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
      const dataToSend = { ...formData };
      
      let response;
      if (isEditing) {
        response = await updatePaciente(paciente.id, dataToSend);
      } else {
        response = await createPaciente(dataToSend);
      }

      if (response.data?.success) {
        const action = isEditing ? "actualizado" : "creado";
        
        if (isEditing) {
          Alert.alert(
            `Paciente ${action}`,
            `El paciente ha sido ${action} exitosamente.`,
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          // Buscar el ID del usuario en diferentes estructuras posibles
          let userId = null;
          if (response.data?.user?.id) {
            userId = response.data.user.id;
          } else if (response.data?.data?.user?.id) {
            userId = response.data.data.user.id;
          }

          // Si hay imagen de perfil, subirla después de crear el paciente
          if (profileImage && userId) {
            try {
              const localAvatarPath = await processAndUploadImage(profileImage);

              if (localAvatarPath) {
                const fileExists = await avatarExists(localAvatarPath);

                if (fileExists) {
                  const formData = new FormData();
                  formData.append("avatar", {
                    uri: localAvatarPath,
                    type: "image/jpeg",
                    name: `avatar_${userId}_${Date.now()}.jpg`,
                  });
                  formData.append("user_id", userId);

                  const uploadResult = await uploadAvatar(formData);

                  if (uploadResult.success) {
                    Alert.alert(
                      `Paciente ${action}`,
                      "El paciente ha sido creado exitosamente con foto de perfil.",
                      [
                        {
                          text: "OK",
                          onPress: () => navigation.goBack(),
                        },
                      ]
                    );
                  } else {
                    Alert.alert(
                      `Paciente ${action}`,
                      "El paciente ha sido creado exitosamente, pero no se pudo subir la foto de perfil."
                    );
                  }
                }
              }
            } catch (imageError) {
              console.error("Error procesando imagen:", imageError);
              Alert.alert(
                `Paciente ${action}`,
                "El paciente ha sido creado exitosamente, pero ocurrió un error con la imagen de perfil."
              );
            }
          } else {
            Alert.alert(
              `Paciente ${action}`,
              "El paciente ha sido creado exitosamente. Se han enviado las credenciales de acceso por email.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }
        }
      } else {
        throw new Error(response.data?.message || `Error al ${isEditing ? "actualizar" : "crear"} paciente`);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      Alert.alert("Error", errorMessage);
      console.error(`Error ${isEditing ? "updating" : "creating"} paciente:`, err);
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
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEditing ? "Editar Paciente" : "Crear Nuevo Paciente"}
        </Text>
        <Text style={styles.subtitle}>
          {isEditing ? "Modifica la información del paciente" : "Completa la información del paciente"}
        </Text>

        {/* Foto de Perfil */}
        <View style={styles.profileImageSection}>
          <Text style={styles.sectionTitle}>Foto de Perfil</Text>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.avatarContainer}
            disabled={uploadingImage}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.info }]}>
                <Ionicons name="person" size={32} color={colors.white} />
              </View>
            )}
            <View
              style={[styles.cameraIcon, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileImageHint, { color: colors.gray }]}>
            Toca para {profileImage ? "cambiar" : "agregar"} foto de perfil
          </Text>
          {uploadingImage && (
            <Text style={[styles.uploadingText, { color: colors.primary }]}>
              Procesando imagen...
            </Text>
          )}
        </View>

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

        {/* Credenciales de acceso - Solo mostrar en modo creación */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>

            <InputField
              label="Contraseña *"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              error={errors.password}
              placeholder="Ingresa una contraseña"
              secureTextEntry
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
            />
          </View>
        )}

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
          title={isEditing ? "Actualizar Paciente" : "Crear Paciente"}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
      color: colors.text,
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
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
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
    profileImageSection: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 12,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      borderWidth: 2,
      borderColor: colors.border,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "bold",
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: colors.border,
    },
    cameraIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.border,
    },
    cameraIconText: {
      fontSize: 12,
    },
    profileImageHint: {
      fontSize: 14,
      textAlign: "center",
    },
    uploadingText: {
      fontSize: 12,
      marginTop: 4,
      fontStyle: "italic",
    },
  });

export default CrearPacienteScreen;
