import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  getConfiguracionNotificaciones,
  updateConfiguracionNotificaciones,
} from "../../api/notificaciones";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";

const ConfiguracionNotificacionesScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } =
    useTheme();
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const styles = createStyles(colors);

  const [configuracion, setConfiguracion] = useState({
    citas_recordatorio: true,
    citas_confirmacion: true,
    citas_cancelacion: true,
    resultados_disponibles: true,
    mensajes_sistema: false,
    hora_inicio: "08:00",
    hora_fin: "20:00",
    zona_horaria: "America/Bogota",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadConfiguracion();
    }, [])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Cambios sin guardar",
        "¿Deseas guardar los cambios antes de salir?",
        [
          {
            text: "No guardar",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
          { text: "Cancelar", style: "cancel" },
          {
            text: "Guardar",
            onPress: async () => {
              const success = await saveConfiguracion();
              if (success) {
                navigation.dispatch(e.data.action);
              }
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, configuracion]);

  const loadConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await getConfiguracionNotificaciones(user.id);

      if (response.success) {
        setConfiguracion(response.data);
      } else {
        // Usar configuración por defecto si no hay configuración guardada
        console.log("Usando configuración por defecto");
      }
    } catch (error) {
      console.error("Error loading configuracion:", error);
      Alert.alert("Error", "No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = (key, value) => {
    setConfiguracion((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveConfiguracion = async () => {
    try {
      setSaving(true);

      // Validar horarios
      const horaInicio = configuracion.hora_inicio;
      const horaFin = configuracion.hora_fin;

      if (horaInicio >= horaFin) {
        Alert.alert(
          "Error",
          "La hora de inicio debe ser anterior a la hora de fin"
        );
        return false;
      }

      const response = await updateConfiguracionNotificaciones(
        user.id,
        configuracion
      );

      if (response.success) {
        setHasUnsavedChanges(false);
        Alert.alert("Éxito", "Configuración guardada correctamente");
        return true;
      } else {
        Alert.alert("Error", "No se pudo guardar la configuración");
        return false;
      }
    } catch (error) {
      console.error("Error saving configuracion:", error);
      Alert.alert("Error", "No se pudo guardar la configuración");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const renderNotificationSetting = (key, title, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={configuracion[key]}
        onValueChange={(value) => updateConfiguracion(key, value)}
        trackColor={{ false: colors.lightGray, true: colors.primary }}
        thumbColor={configuracion[key] ? colors.white : colors.gray}
      />
    </View>
  );

  const renderTimeSetting = (key, label) => (
    <View style={styles.timeSetting}>
      <Text style={styles.timeLabel}>{label}</Text>
      <TextInput
        style={styles.timeInput}
        value={configuracion[key]}
        onChangeText={(value) => updateConfiguracion(key, value)}
        placeholder="HH:MM"
        keyboardType="numeric"
        maxLength={5}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando configuración..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Notificaciones</Text>
      <Text style={styles.subtitle}>
        Configura tus preferencias de notificaciones
      </Text>
      {/* Configuración de Tema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>

        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "light" && styles.selectedThemeOption,
            ]}
            onPress={setLightTheme}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "light" && styles.selectedThemeOptionText,
              ]}
            >
              ☀️ Claro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "dark" && styles.selectedThemeOption,
            ]}
            onPress={setDarkTheme}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "dark" && styles.selectedThemeOptionText,
              ]}
            >
              🌙 Oscuro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "system" && styles.selectedThemeOption,
            ]}
            onPress={setSystemTheme}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "system" && styles.selectedThemeOptionText,
              ]}
            >
              📱 Sistema
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Configuración de tipos de notificación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Notificación</Text>

        {renderNotificationSetting(
          "citas_recordatorio",
          "Recordatorios de Citas",
          "Recibe notificaciones antes de tus citas programadas"
        )}

        {renderNotificationSetting(
          "citas_confirmacion",
          "Confirmación de Citas",
          "Notificaciones cuando se confirma o aprueba una cita"
        )}

        {renderNotificationSetting(
          "citas_cancelacion",
          "Cancelación de Citas",
          "Alertas cuando se cancela una cita"
        )}

        {renderNotificationSetting(
          "resultados_disponibles",
          "Resultados Disponibles",
          "Notificaciones cuando tus resultados médicos están listos"
        )}

        {renderNotificationSetting(
          "mensajes_sistema",
          "Mensajes del Sistema",
          "Notificaciones administrativas y de mantenimiento"
        )}
      </View>
      {/* Botón de guardar */}
      {hasUnsavedChanges && (
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveConfiguracion}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 24,
    },
    section: {
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
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 16,
      lineHeight: 20,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.gray,
      lineHeight: 18,
    },
    timeContainer: {
      marginBottom: 16,
    },
    timeSetting: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    timeLabel: {
      fontSize: 16,
      color: colors.text,
      width: 120,
    },
    timeInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.input || colors.surface,
      color: colors.text,
    },
    timezoneText: {
      fontSize: 14,
      color: colors.gray,
      fontStyle: "italic",
    },
    infoSection: {
      backgroundColor: colors.info,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    saveSection: {
      marginTop: 8,
      marginBottom: 20,
      backgroundColor: colors.background,
    },
    saveButton: {
      backgroundColor: colors.success,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    saveButtonDisabled: {
      backgroundColor: colors.gray,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    themeOptions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.input || colors.surface,
    },
    selectedThemeOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeOptionText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    selectedThemeOptionText: {
      color: colors.white,
    },
  });

export default ConfiguracionNotificacionesScreen;
