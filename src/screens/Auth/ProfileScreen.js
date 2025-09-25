import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";
import {
  saveImageToAvatars,
  compressImage,
  getRelativePath,
  deleteAvatarImage,
  avatarExists,
} from "../../utils/fileUtils";
import {
  uploadAvatar,
  deleteAvatar as deleteAvatarAPI,
  getAvatar,
} from "../../api/avatar";

const ProfileScreen = ({ navigation }) => {
  const { user, logout, loading } = useAuth();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [profileImage, setProfileImage] = useState(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  useEffect(() => {
    loadUserAvatar();
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Necesitamos acceso a tu galería para seleccionar fotos de perfil"
        );
      }
    })();
  }, []);

  const loadUserAvatar = async () => {
    try {
      setLoadingAvatar(true);
      const result = await getAvatar();

      if (result.success && result.data.avatar_url) {
        setProfileImage(result.data.avatar_url);
      }
    } catch (error) {
      console.error("Error cargando avatar:", error);
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    Alert.alert(
      "Eliminar Avatar",
      "¿Estás seguro de que deseas eliminar tu foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteAvatarAPI();

              if (result.success) {
                setProfileImage(null);
                Alert.alert("Éxito", "Avatar eliminado correctamente");
              } else {
                Alert.alert("Error", result.message);
              }
            } catch (error) {
              console.error("Error eliminando avatar:", error);
              Alert.alert("Error", "No se pudo eliminar el avatar");
            }
          },
        },
      ]
    );
  };

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
        await processAndUploadImage(result.assets[0].uri);
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
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const processAndUploadImage = async (imageUri) => {
    try {
      // Mostrar indicador de carga
      Alert.alert("Procesando", "Procesando imagen...");

      // Comprimir la imagen
      const compressedUri = await compressImage(imageUri);

      // Guardar en la carpeta avatars local
      const localAvatarPath = await saveImageToAvatars(compressedUri, user.id);

      // Crear FormData para enviar al servidor usando la imagen guardada localmente
      const formData = new FormData();
      formData.append("avatar", {
        uri: localAvatarPath, // Usar la imagen guardada localmente
        type: "image/jpeg",
        name: `avatar_${user.id}_${Date.now()}.jpg`,
      });

      // Subir al servidor
      const uploadResult = await uploadAvatar(formData);

      if (uploadResult.success) {
        // Actualizar la imagen con la URL del servidor
        setProfileImage(uploadResult.data.avatar_url);

        Alert.alert("Éxito", "Foto de perfil actualizada correctamente", [
          {
            text: "OK",
            onPress: () => {
              // Recargar los datos del usuario para mostrar la nueva imagen
              // Esto debería actualizarse automáticamente desde el servidor
            },
          },
        ]);
      } else {
        // Si falla la subida al servidor, mantener la imagen local
        setProfileImage(localAvatarPath);
        Alert.alert(
          "Aviso",
          "Imagen guardada localmente. Se subirá al servidor cuando haya conexión.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error procesando imagen:", error);
      Alert.alert("Error", "No se pudo procesar la imagen");
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const nombreCompleto =
    user?.nombre_completo ||
    (user?.nombre && user?.apellido
      ? `${user.nombre} ${user.apellido}`
      : null) ||
    user?.name ||
    "Usuario";

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>
          Información de tu cuenta y datos personales
        </Text>

        {/* Información personal */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarTouchable}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[styles.avatar, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.avatarText, { color: colors.white }]}>
                    {nombreCompleto
                      ? nombreCompleto.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>
              )}
              <View
                style={[styles.cameraIcon, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.cameraIconText, { color: colors.white }]}>
                  📷
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.userName, { color: colors.text }]}>
              {nombreCompleto}
            </Text>
            <Text style={[styles.userEmail, { color: colors.gray }]}>
              {user?.email || "No disponible"}
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.changePhotoButton}
            >
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                Cambiar foto de perfil
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información detallada */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información Personal</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre completo:</Text>
            <Text style={styles.value}>{nombreCompleto}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Cédula:</Text>
            <Text style={styles.value}>{user?.cedula || "No disponible"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email || "No disponible"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>
              {user?.telefono || "No disponible"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>
              {user?.edad ? `${user.edad} años` : "No disponible"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>EPS:</Text>
            <Text style={styles.value}>{user?.eps || "No especificada"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de registro:</Text>
            <Text style={styles.value}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No disponible"}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <ButtonPrimary
            title="Configuración"
            onPress={() => navigation.navigate("Configuracion")}
            style={[styles.actionButton, styles.secondaryButton]}
          />

          <ButtonPrimary
            title="Editar Perfil"
            onPress={() => navigation.navigate("EditProfileScreen")}
            style={[styles.actionButton, styles.secondaryButton]}
          />

          {profileImage && (
            <ButtonPrimary
              title="Eliminar Avatar"
              onPress={handleDeleteAvatar}
              style={[styles.actionButton, styles.dangerButton]}
            />
          )}

          <ButtonPrimary
            title="Cerrar Sesión"
            onPress={handleLogout}
            loading={loading}
            style={styles.actionButton}
          />
        </View>
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
      fontSize: 26,
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
    profileCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 24,
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
    avatarContainer: {
      alignItems: "center",
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.white,
    },
    userName: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: colors.gray,
    },
    infoCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 20,
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
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
      paddingVertical: 4,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      flex: 1,
    },
    value: {
      fontSize: 16,
      color: colors.gray,
      flex: 1,
      textAlign: "right",
    },
    actionsContainer: {
      gap: 12,
      marginTop: 8,
      marginBottom: 32,
    },
    actionButton: {
      marginBottom: 0,
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
    },
    dangerButton: {
      backgroundColor: colors.error,
    },
    avatarTouchable: {
      position: "relative",
      marginBottom: 16,
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
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
    },
    cameraIconText: {
      fontSize: 12,
    },
    changePhotoButton: {
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    changePhotoText: {
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default ProfileScreen;
