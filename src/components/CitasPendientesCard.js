import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColors } from "../utils/themeColors";
import { formatDate } from "../utils/formatDate";

const CitasPendientesCard = ({ cita, onAprobar, onRechazar }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: formatTime(dateTimeString),
    };
  };

  const { date, time } = formatDateTime(cita.fecha_hora);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {cita.paciente?.nombre} {cita.paciente?.apellido}
          </Text>
          <Text style={styles.patientId}>Cédula: {cita.paciente?.cedula}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pendiente</Text>
        </View>
      </View>

      <View style={styles.appointmentInfo}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.specialtyText}>
            Especialidad: {cita.especialidad?.nombre}
          </Text>
          {cita.motivo_consulta && (
            <Text style={styles.reasonText}>
              Motivo: {cita.motivo_consulta}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={onRechazar}
        >
          <Text style={styles.rejectButtonText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={onAprobar}
        >
          <Text style={styles.approveButtonText}>Aprobar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card || colors.surface,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    patientId: {
      fontSize: 14,
      color: colors.gray,
    },
    statusBadge: {
      backgroundColor: colors.warning,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.white,
    },
    appointmentInfo: {
      marginBottom: 16,
    },
    dateTimeContainer: {
      marginBottom: 8,
    },
    dateText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    timeText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
    },
    detailsContainer: {
      backgroundColor: colors.lightBackground,
      padding: 12,
      borderRadius: 8,
    },
    specialtyText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    reasonText: {
      fontSize: 14,
      color: colors.gray,
      fontStyle: "italic",
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    rejectButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    approveButton: {
      backgroundColor: colors.success,
    },
    approveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default CitasPendientesCard;
