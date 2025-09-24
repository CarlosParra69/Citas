import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getCitaById } from "../../api/citas";
import { useCitas } from "../../context/CitasContext";
import { useAuthContext } from "../../context/AuthContext";
import ButtonPrimary from "../../components/ButtonPrimary";
import ApprovalModal from "../../components/ApprovalModal";
import RejectionModal from "../../components/RejectionModal";
import CancellationModal from "../../components/CancellationModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";

const DetalleCitaScreen = ({ route, navigation }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const { citaId } = route.params;
  const styles = createStyles(colors);
  const { eliminarCita, aprobarCitaPendiente, rechazarCitaPendiente } =
    useCitas();
  const { user } = useAuthContext();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [cancellationModalVisible, setCancellationModalVisible] =
    useState(false);

  useEffect(() => {
    loadCitaDetail();
  }, [citaId]);

  const loadCitaDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCitaById(citaId);

      if (response.success) {
        setCita(response.data);
      } else {
        throw new Error(response.message || "Error al cargar la cita");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = () => {
    setCancellationModalVisible(true);
  };

  const handleCancellationConfirm = async (motivoCancelacion) => {
    try {
      await eliminarCita(cita.id, motivoCancelacion);
      Alert.alert("Éxito", "Cita cancelada correctamente");
      // Recargar la cita para mostrar el estado actualizado
      await loadCitaDetail();
    } catch (error) {
      Alert.alert("Error", "No se pudo cancelar la cita");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "programada":
        return colors.info;
      case "confirmada":
        return colors.success;
      case "en_curso":
        return colors.warning;
      case "completada":
        return colors.primary;
      case "cancelada":
        return colors.danger;
      case "no_asistio":
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const canCancelCita = () => {
    if (!cita) return false;
    const estadosPermitidos = ["programada", "confirmada"];
    return estadosPermitidos.includes(cita.estado?.toLowerCase());
  };

  const canApproveCita = () => {
    if (!cita || !user) return false;
    return (
      user.rol === "medico" &&
      cita.estado?.toLowerCase() === "pendiente" &&
      cita.medico_id === user.id
    );
  };

  const canRejectCita = () => {
    return canApproveCita(); // Mismo criterio que aprobación
  };

  const handleApprove = () => {
    setApprovalModalVisible(true);
  };

  const handleReject = () => {
    setRejectionModalVisible(true);
  };

  const handleApprovalConfirm = async (observaciones) => {
    try {
      await aprobarCitaPendiente(cita.id, observaciones);
      Alert.alert("Éxito", "Cita aprobada correctamente");
      // Recargar la cita para mostrar el estado actualizado
      await loadCitaDetail();
    } catch (error) {
      Alert.alert("Error", "No se pudo aprobar la cita");
    }
  };

  const handleRejectionConfirm = async (motivoRechazo) => {
    try {
      await rechazarCitaPendiente(cita.id, motivoRechazo);
      Alert.alert("Éxito", "Cita rechazada correctamente");
      // Recargar la cita para mostrar el estado actualizado
      await loadCitaDetail();
    } catch (error) {
      Alert.alert("Error", "No se pudo rechazar la cita");
    }
  };

  const closeModals = () => {
    setApprovalModalVisible(false);
    setRejectionModalVisible(false);
    setCancellationModalVisible(false);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando detalle de cita..." />;
  }

  if (error || !cita) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudo cargar la información de la cita
        </Text>
        <ButtonPrimary title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Detalle de la Cita</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: getEstadoColor(cita.estado) },
            ]}
          >
            <Text style={styles.estadoText}>{cita.estado}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Información del Paciente */}
        {cita.paciente && (
          <>
            <Text style={styles.sectionTitle}>Información del Paciente</Text>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>
              {cita.paciente.nombre} {cita.paciente.apellido}
            </Text>

            <Text style={styles.label}>Cédula:</Text>
            <Text style={styles.value}>{cita.paciente.cedula}</Text>

            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>
              {cita.paciente.telefono || "No especificado"}
            </Text>

            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {cita.paciente.email || "No especificado"}
            </Text>

            <View style={styles.separator} />
          </>
        )}

        {/* Información del Médico */}
        <Text style={styles.sectionTitle}>Información del Médico</Text>
        <Text style={styles.label}>Médico:</Text>
        <Text style={styles.value}>
          {cita.medico
            ? `Dr. ${cita.medico.nombre} ${cita.medico.apellido}`
            : "No asignado"}
        </Text>

        {cita.medico?.especialidad && (
          <>
            <Text style={styles.label}>Especialidad:</Text>
            <Text style={styles.value}>{cita.medico.especialidad.nombre}</Text>
          </>
        )}

        <Text style={styles.label}>Fecha y Hora:</Text>
        <Text style={styles.value}>{formatDate(cita.fecha_hora)}</Text>

        <Text style={styles.label}>Motivo de Consulta:</Text>
        <Text style={styles.value}>
          {cita.motivo_consulta || "No especificado"}
        </Text>

        {cita.observaciones && (
          <>
            <Text style={styles.label}>Observaciones:</Text>
            <Text style={styles.value}>{cita.observaciones}</Text>
          </>
        )}

        {cita.diagnostico && (
          <>
            <Text style={styles.label}>Diagnóstico:</Text>
            <Text style={styles.value}>{cita.diagnostico}</Text>
          </>
        )}

        {cita.tratamiento && (
          <>
            <Text style={styles.label}>Tratamiento:</Text>
            <Text style={styles.value}>{cita.tratamiento}</Text>
          </>
        )}

        {cita.costo && (
          <>
            <Text style={styles.label}>Costo:</Text>
            <Text style={styles.value}>${cita.costo.toLocaleString()}</Text>
          </>
        )}

        <Text style={styles.label}>Creada:</Text>
        <Text style={styles.value}>{formatDate(cita.created_at)}</Text>

        {cita.motivo_cancelacion && (
          <>
            <Text style={styles.label}>Motivo de Cancelación:</Text>
            <Text style={styles.value}>{cita.motivo_cancelacion}</Text>
          </>
        )}

        {cita.fecha_cancelacion && (
          <>
            <Text style={styles.label}>Fecha de Cancelación:</Text>
            <Text style={styles.value}>
              {formatDate(cita.fecha_cancelacion)}
            </Text>
          </>
        )}

        {cita.motivo_rechazo && (
          <>
            <Text style={styles.label}>Motivo de Rechazo:</Text>
            <Text style={styles.value}>{cita.motivo_rechazo}</Text>
          </>
        )}
      </View>

      {/* Acciones basadas en rol */}
      <View style={styles.actionsContainer}>
        {canApproveCita() && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
            >
              <Text style={styles.approveButtonText}>Aprobar Cita</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.rejectButtonText}>Rechazar Cita</Text>
            </TouchableOpacity>
          </View>
        )}

        {canCancelCita() && (
          <ButtonPrimary
            title="Cancelar Cita"
            onPress={handleCancelarCita}
            style={styles.cancelButton}
          />
        )}
      </View>

      {/* Modales */}
      <ApprovalModal
        visible={approvalModalVisible}
        onClose={closeModals}
        onApprove={handleApprovalConfirm}
        cita={cita}
      />

      <RejectionModal
        visible={rejectionModalVisible}
        onClose={closeModals}
        onReject={handleRejectionConfirm}
        cita={cita}
      />

      <CancellationModal
        visible={cancellationModalVisible}
        onClose={closeModals}
        onCancel={handleCancellationConfirm}
        cita={cita}
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
      marginBottom: 20,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "600",
      marginTop: 12,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: colors.gray,
      marginBottom: 8,
      lineHeight: 22,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    estadoBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignItems: "center",
    },
    estadoText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginTop: 16,
      marginBottom: 8,
    },
    actionsContainer: {
      marginTop: 20,
    },
    actionButtonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    approveButton: {
      backgroundColor: colors.success,
    },
    approveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    rejectButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    cancelButton: {
      backgroundColor: colors.danger,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center",
      marginBottom: 20,
    },
  });

export default DetalleCitaScreen;
