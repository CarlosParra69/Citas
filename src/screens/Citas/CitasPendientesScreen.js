import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { useCitas } from "../../context/CitasContext";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner";
import RejectionModal from "./RejectionModal";
import { useThemeColors } from "../../utils/themeColors";
import notificationService from "../../utils/notificationService";
import { useNotificationScheduler } from "../../hooks/useNotificationScheduler";
import {
  formatDate,
  formatTime,
  formatCitaDateTime,
} from "../../utils/formatDate";

const CitasPendientesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuthContext();
  const citasContext = useCitas();

  // Fallback para colores si es necesario
  const safeColors = colors || {
    background: "#F9F9F9",
    primary: "#FF6B35",
    text: "#1C1C1E",
    error: "#FF3B30",
    gray: "#8E8E93",
    white: "#FFFFFF",
    border: "#C6C6C8",
    success: "#34C759",
    textSecondary: "#8E8E93",
  };

  // Usar el estado del contexto en lugar del estado local
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState(null);

  // Hook para programación automática de notificaciones
  const { programarNotificacionesCitas } = useNotificationScheduler(
    contextCitasPendientes || [],
    30, // 30 minutos de anticipación
    true // Programar automáticamente
  );

  // Verificar si el usuario está disponible
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuario no autenticado</Text>
      </View>
    );
  }

  const {
    loading = false,
    error = null,
    citasPendientes: contextCitasPendientes = [],
    fetchCitasPendientes = async () => [],
    aprobarCitaPendiente = async () => {},
    rechazarCitaPendiente = async () => {},
  } = citasContext || {};

  useEffect(() => {
    if (user?.medico_id) {
      fetchCitasPendientes(user.medico_id);
    }
  }, [user]);

  const loadCitasPendientes = async () => {
    try {
      if (!user?.medico_id) {
        Alert.alert("Error", "Información de usuario no disponible");
        return;
      }

      await fetchCitasPendientes(user.medico_id);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las citas pendientes");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.medico_id) {
      await fetchCitasPendientes(user.medico_id);
    }
    setRefreshing(false);
  };

  const handleApprove = async (citaId) => {
    Alert.alert(
      "Aprobar Cita",
      "¿Está seguro de que desea aprobar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          onPress: async () => {
            try {
              // Buscar la cita para obtener información del paciente
              const cita = contextCitasPendientes.find(c => c.id === citaId);

              await aprobarCitaPendiente(citaId);

              // Enviar notificación de confirmación al paciente
              if (cita) {
                await notificationService.programarNotificacionConfirmacionCita(cita);
              }

              Alert.alert("Éxito", "Cita aprobada correctamente");
              // El contexto se actualiza automáticamente
            } catch (error) {
              Alert.alert("Error", "No se pudo aprobar la cita");
            }
          },
        },
      ]
    );
  };

  const handleReject = (citaId) => {
    setSelectedCitaId(citaId);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCitaId(null);
  };

  const handleRejectionSuccess = async (citaId, motivo) => {
    try {
      // Buscar la cita para obtener información del paciente
      const cita = contextCitasPendientes.find(c => c.id === citaId);

      if (cita) {
        // Enviar notificación de cancelación al paciente
        await notificationService.programarNotificacionCancelacionCita(cita, motivo);
      }

      // El contexto se actualiza automáticamente
    } catch (error) {
      console.error('Error enviando notificación de rechazo:', error);
    }
  };

  // Función para probar notificaciones
  const probarNotificaciones = async () => {
    try {
      const exito = await notificationService.programarNotificacionPrueba(5);
      if (exito) {
        Alert.alert('Notificación programada', 'Recibirás una notificación de prueba en 5 segundos');
      } else {
        Alert.alert('Error', 'No se pudo programar la notificación de prueba');
      }
    } catch (error) {
      Alert.alert('Error', 'No tienes permisos para recibir notificaciones');
    }
  };

  // Función para programar notificaciones automáticas para citas próximas
  const programarNotificacionesAutomaticas = async () => {
    try {
      const resultado = await programarNotificacionesCitas();

      if (resultado.total === 0) {
        Alert.alert('Sin citas', 'No hay citas para programar notificaciones');
        return;
      }

      if (resultado.futuras === 0) {
        Alert.alert('Sin citas futuras', 'No hay citas futuras para programar notificaciones');
        return;
      }

      Alert.alert(
        'Notificaciones programadas',
        `Se programaron ${resultado.programadas} notificaciones para ${resultado.futuras} citas próximas`
      );
    } catch (error) {
      console.error('Error programando notificaciones automáticas:', error);
      Alert.alert('Error', 'No se pudieron programar las notificaciones automáticas');
    }
  };

  const renderCitaItem = ({ item }) => {
    return (
      <View style={styles.citaCard}>
        <View style={styles.citaHeader}>
          <Text style={styles.pacienteName}>
            {item.paciente?.nombre || "Sin nombre"}{" "}
            {item.paciente?.apellido || "Sin apellido"}
          </Text>
          <Text style={styles.citaDate}>
            {formatCitaDateTime(item.fecha_hora)}
          </Text>
        </View>

        <Text style={styles.motivoConsulta}>
          {item.motivo_consulta || "Sin motivo"}
        </Text>

        {item.observaciones && (
          <Text style={styles.observaciones}>{item.observaciones}</Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item.id)}
          >
            <Text style={styles.rejectButtonText}>Rechazar Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id)}
          >
            <Text style={styles.approveButtonText}>Aprobar Cita</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas Pendientes</Text>

      {/* Botones de notificaciones */}
      <View style={styles.notificationButtons}>
        <TouchableOpacity
          style={[styles.notificationButton, styles.testButton]}
          onPress={probarNotificaciones}
        >
          <Text style={styles.testButtonText}>Probar Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, styles.autoButton]}
          onPress={programarNotificacionesAutomaticas}
        >
          <Text style={styles.autoButtonText}>Programar Automático</Text>
        </TouchableOpacity>
      </View>

      {(contextCitasPendientes?.length || 0) === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No tienes citas pendientes de aprobación
          </Text>
        </View>
      ) : (
        <FlatList
          data={contextCitasPendientes || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCitaItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Renderizar modal solo si está visible y tenemos los datos necesarios */}
      {modalVisible && selectedCitaId && (
        <RejectionModal
          visible={modalVisible}
          onClose={handleModalClose}
          citaId={selectedCitaId}
          onReject={handleRejectionSuccess}
        />
      )}
    </View>
  );
};

// Create styles function that uses theme colors
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
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    listContainer: {
      paddingBottom: 20,
    },
    citaCard: {
      backgroundColor: colors.card || colors.surface,
      marginHorizontal: 16,
      marginVertical: 4,
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
    citaHeader: {
      marginBottom: 8,
    },
    pacienteName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    citaDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    motivoConsulta: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    observaciones: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginBottom: 12,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    rejectButtonText: {
      color: colors.white || "#FFFFFF",
      fontWeight: "bold",
    },
    approveButton: {
      backgroundColor: colors.success,
    },
    approveButtonText: {
      color: colors.white || "#FFFFFF",
      fontWeight: "bold",
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center",
      marginTop: 20,
    },
    notificationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      gap: 12,
    },
    notificationButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    testButton: {
      backgroundColor: colors.info || colors.primary,
    },
    testButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "500",
    },
    autoButton: {
      backgroundColor: colors.success,
    },
    autoButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "500",
    },
  });

export default CitasPendientesScreen;
