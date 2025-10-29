import React, { useState, useEffect } from "react";
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
import LoadingSpinner from "../../components/LoadingSpinner";
import CancellationModal from "../../components/CancellationModal";
import { useThemeColors } from "../../utils/themeColors";
import {
  formatDate,
  formatTime,
  formatCitaDateTime,
} from "../../utils/formatDate";

const ConfirmarCitaScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuthContext();
  const citasContext = useCitas();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellationModalVisible, setCancellationModalVisible] =
    useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState(null);

  const {
    loading = false,
    error = null,
    fetchCitas = async () => {},
    fetchForceCitasConfirmadas = async () => {},
    forceCitasConfirmadas = [],
    forceCitasConfirmadasLoading = false,
    confirmarCitaPendiente = async () => {},
    eliminarCita = async () => {},
    clearCitas = () => {},
    clearForceCitasConfirmadas = () => {},
  } = citasContext || {};

  // Verificar si el usuario está disponible
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuario no autenticado</Text>
      </View>
    );
  }

  useEffect(() => {
    // Limpiar citas anteriores para evitar mostrar datos de otros usuarios
    clearCitas();
    if (user?.rol === "superadmin") {
      clearForceCitasConfirmadas();
      fetchForceCitasConfirmadas(user);
    } else {
      fetchCitas(user);
    }
  }, []);

  const loadCitasProgramadas = async () => {
    try {
      if (user?.rol === "superadmin") {
        await fetchForceCitasConfirmadas(user);
      } else {
        await fetchCitas(user);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las citas programadas");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.rol === "superadmin") {
      await fetchForceCitasConfirmadas(user);
    } else {
      await fetchCitas(user);
    }
    setRefreshing(false);
  };

  const handleConfirm = async (citaId) => {
    Alert.alert(
      "Confirmar Cita",
      "¿Está seguro de que desea confirmar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await confirmarCitaPendiente(citaId);
              Alert.alert("Éxito", "Cita confirmada correctamente");
              
              // Recargar automáticamente las citas según el rol
              if (user?.rol === "superadmin") {
                await fetchForceCitasConfirmadas(user);
              } else {
                await fetchCitas(user);
              }
            } catch (error) {
              Alert.alert("Error", "No se pudo confirmar la cita");
            }
          },
        },
      ]
    );
  };

  const handleCancel = (citaId) => {
    setSelectedCitaId(citaId);
    setCancellationModalVisible(true);
  };

  const handleCancellationConfirm = async (motivoCancelacion) => {
    try {
      await eliminarCita(selectedCitaId, motivoCancelacion);
      Alert.alert("Éxito", "Cita cancelada correctamente");
      setCancellationModalVisible(false);
      setSelectedCitaId(null);
      
      // Recargar automáticamente las citas según el rol
      if (user?.rol === "superadmin") {
        await fetchForceCitasConfirmadas(user);
      } else {
        await fetchCitas(user);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo cancelar la cita");
    }
  };

  const handleCancellationModalClose = () => {
    setCancellationModalVisible(false);
    setSelectedCitaId(null);
  };

  const renderCitaItem = ({ item }) => (
    <View style={styles.citaCard}>
      <View style={styles.citaHeader}>
        <Text style={styles.pacienteName}>
          Dr. {item.medico?.nombre} {item.medico?.apellido}
        </Text>
        <Text style={styles.citaDate}>
          {formatCitaDateTime(item.fecha_hora)}
        </Text>
      </View>

      <Text style={styles.motivoConsulta}>{item.motivo_consulta}</Text>

      {item.observaciones && (
        <Text style={styles.observaciones}>{item.observaciones}</Text>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.confirmButton]}
          onPress={() => handleConfirm(item.id)}
        >
          <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const displayLoading = (loading && !refreshing) || (forceCitasConfirmadasLoading && user?.rol === "superadmin");
  if (displayLoading) {
    return <LoadingSpinner message="Cargando citas confirmadas..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Cita</Text>
      <Text style={styles.subtitle}>
        {user?.rol === "superadmin"
          ? "Todas las citas confirmadas por médicos del sistema"
          : "Citas aprobadas por el médico, pendientes de tu confirmación"
        }
      </Text>

      {(() => {
        // Para superadmin, usar citas forzadas, para otros usuarios usar citas normales
        const citasData = user?.rol === "superadmin" ? forceCitasConfirmadas : citasContext?.citas || [];
        
        // Filtrar citas programadas (estado "programada" = confirmadas por médico, pendientes de confirmación del paciente)
        const programadas = citasData.filter(
          (cita) => cita.estado?.toLowerCase() === "programada"
        );

        return programadas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {user?.rol === "superadmin"
                ? "No hay citas confirmadas en el sistema"
                : "No tienes citas pendientes de confirmación"
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {user?.rol === "superadmin"
                ? "Las citas confirmadas por los médicos aparecerán aquí"
                : "Las citas aprobadas por el médico aparecerán aquí"
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={programadas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCitaItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
          />
        );
      })()}

      {/* Modal de cancelación */}
      <CancellationModal
        visible={cancellationModalVisible}
        onClose={handleCancellationModalClose}
        onCancel={handleCancellationConfirm}
        cita={(() => {
          // Buscar la cita seleccionada para mostrar en el modal
          const citasData = user?.rol === "superadmin" ? forceCitasConfirmadas : citasContext?.citas || [];
          const programadas = citasData.filter(
            (cita) => cita.estado?.toLowerCase() === "programada"
          );
          return programadas.find((cita) => cita.id === selectedCitaId);
        })()}
      />
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
      color: colors.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.gray,
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
    cancelButton: {
      backgroundColor: colors.error,
    },
    cancelButtonText: {
      color: colors.white || "#FFFFFF",
      fontWeight: "bold",
    },
    confirmButton: {
      backgroundColor: colors.success,
    },
    confirmButtonText: {
      color: colors.white || "#FFFFFF",
      fontWeight: "bold",
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center",
      marginTop: 20,
    },
  });

export default ConfirmarCitaScreen;
