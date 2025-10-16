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
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    badge: true,
    alert: true,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadConfiguracion();
      checkNotificationPermissions();
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

  // Funciones para manejo de permisos de notificaciones
  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const permiso = status === 'granted';
      setPermisoNotificaciones(permiso);

      // Guardar preferencia en AsyncStorage
      await AsyncStorage.setItem('notificaciones_activas', permiso.toString());

      return permiso;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const permiso = status === 'granted';

      setPermisoNotificaciones(permiso);
      await AsyncStorage.setItem('notificaciones_activas', permiso.toString());

      if (permiso) {
        Alert.alert('Permisos concedidos', 'Ahora puedes recibir notificaciones');
      } else {
        Alert.alert('Permisos denegados', 'No puedes recibir notificaciones');
      }

      return permiso;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'No se pudieron solicitar los permisos');
      return false;
    }
  };

  const programarNotificacionPrueba = async () => {
    try {
      const permiso = await checkNotificationPermissions();

      if (!permiso) {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para programar notificaciones');
        return;
      }

      const trigger = new Date(Date.now() + 10 * 1000); // 10 segundos para prueba

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Notificación de Prueba',
          body: 'Esta es una notificación de prueba desde MediApp',
          sound: notificationSettings.sound ? 'default' : null,
        },
        trigger,
      });

      Alert.alert('Notificación programada', 'Recibirás una notificación de prueba en 10 segundos');
    } catch (error) {
      console.error('Error programando notificación:', error);
      Alert.alert('Error', 'No se pudo programar la notificación');
    }
  };

  const programarNotificacionCita = async (cita, minutosAnticipacion = 30) => {
    try {
      const permiso = await checkNotificationPermissions();

      if (!permiso) {
        console.log('No hay permisos para notificaciones');
        return;
      }

      // Calcular fecha y hora de la notificación
      const fechaCita = new Date(cita.fecha_hora);
      const fechaNotificacion = new Date(fechaCita.getTime() - (minutosAnticipacion * 60 * 1000));

      // Solo programar si la fecha de notificación es futura
      if (fechaNotificacion <= new Date()) {
        console.log('La cita ya pasó o está muy próxima');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de Cita',
          body: `Tienes una cita con ${cita.medico?.nombre || 'el médico'} en ${minutosAnticipacion} minutos`,
          data: { citaId: cita.id, tipo: 'recordatorio_cita' },
          sound: notificationSettings.sound ? 'default' : null,
        },
        trigger: fechaNotificacion,
      });

      console.log(`Notificación programada para cita ${cita.id} a las ${fechaNotificacion}`);
    } catch (error) {
      console.error('Error programando notificación de cita:', error);
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
            <Ionicons
              name="sunny"
              size={20}
              color={theme === "light" ? colors.white : colors.text}
              style={styles.themeIcon}
            />
            <Text
              style={[
                styles.themeOptionText,
                theme === "light" && styles.selectedThemeOptionText,
              ]}
            >
              Claro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "dark" && styles.selectedThemeOption,
            ]}
            onPress={setDarkTheme}
          >
            <Ionicons
              name="moon"
              size={20}
              color={theme === "dark" ? colors.white : colors.text}
              style={styles.themeIcon}
            />
            <Text
              style={[
                styles.themeOptionText,
                theme === "dark" && styles.selectedThemeOptionText,
              ]}
            >
              Oscuro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "system" && styles.selectedThemeOption,
            ]}
            onPress={setSystemTheme}
          >
            <Ionicons
              name="phone-portrait"
              size={20}
              color={theme === "system" ? colors.white : colors.text}
              style={styles.themeIcon}
            />
            <Text
              style={[
                styles.themeOptionText,
                theme === "system" && styles.selectedThemeOptionText,
              ]}
            >
              Sistema
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

      {/* Configuración de permisos de notificaciones push */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permisos de Notificaciones</Text>

        <View style={styles.permissionSection}>
          <View style={styles.permissionItem}>
            <View style={styles.permissionInfo}>
              <Text style={styles.settingTitle}>Notificaciones Push</Text>
              <Text style={styles.settingDescription}>
                Permite recibir notificaciones en tu dispositivo
              </Text>
            </View>
            <View style={styles.permissionActions}>
              <Text style={[
                styles.permissionStatus,
                { color: permisoNotificaciones ? colors.success : colors.error }
              ]}>
                {permisoNotificaciones ? 'Activado' : 'Desactivado'}
              </Text>
              <TouchableOpacity
                style={[styles.permissionButton, permisoNotificaciones && styles.permissionButtonDisabled]}
                onPress={requestNotificationPermissions}
                disabled={permisoNotificaciones}
              >
                <Text style={styles.permissionButtonText}>
                  {permisoNotificaciones ? 'Concedido' : 'Solicitar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={programarNotificacionPrueba}
          >
            <Ionicons name="notifications" size={20} color={colors.white} />
            <Text style={styles.testButtonText}>Probar Notificación</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuración de tipos de notificación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración de Notificaciones</Text>

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
    permissionSection: {
      marginBottom: 16,
    },
    permissionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      marginBottom: 16,
    },
    permissionInfo: {
      flex: 1,
      marginRight: 16,
    },
    permissionActions: {
      alignItems: "flex-end",
      gap: 8,
    },
    permissionStatus: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 4,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    permissionButtonDisabled: {
      backgroundColor: colors.gray,
    },
    permissionButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "500",
    },
    testButton: {
      backgroundColor: colors.info || colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    testButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default ConfiguracionNotificacionesScreen;
