import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import ButtonPrimary from "./ButtonPrimary";
import { useThemeColors } from "../utils/themeColors";

const ApprovalModal = ({ visible, onClose, onApprove, cita }) => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in ApprovalModal useThemeColors:", error);
    colors = {
      background: "#F9F9F9",
      primary: "#FF6B35",
      text: "#1C1C1E",
      error: "#FF3B30",
      gray: "#8E8E93",
      white: "#FFFFFF",
      border: "#C6C6C8",
      success: "#34C759",
    };
  }

  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(observaciones);
      setObservaciones("");
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo aprobar la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setObservaciones("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Aprobar Cita</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.patientInfo}>
              Paciente: {cita?.paciente?.nombre} {cita?.paciente?.apellido}
            </Text>
            <Text style={styles.appointmentInfo}>
              Fecha:{" "}
              {cita?.fecha_hora
                ? new Date(cita.fecha_hora).toLocaleDateString("es-ES")
                : ""}
            </Text>
            <Text style={styles.appointmentInfo}>
              Hora:{" "}
              {cita?.fecha_hora
                ? new Date(cita.fecha_hora).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>

            <Text style={styles.label}>Observaciones (opcional)</Text>
            <TextInput
              style={styles.textInput}
              multiline={true}
              numberOfLines={4}
              placeholder="Ingrese observaciones sobre la aprobación..."
              value={observaciones}
              onChangeText={setObservaciones}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {observaciones.length}/500 caracteres
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <ButtonPrimary
              title="Aprobar Cita"
              onPress={handleApprove}
              disabled={loading}
              style={styles.approveButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: colors.white,
      borderRadius: 12,
      width: "90%",
      maxWidth: 400,
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 18,
      color: colors.gray,
      fontWeight: "bold",
    },
    content: {
      padding: 20,
    },
    patientInfo: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    appointmentInfo: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 4,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      textAlignVertical: "top",
      minHeight: 100,
    },
    charCount: {
      fontSize: 12,
      color: colors.gray,
      textAlign: "right",
      marginTop: 4,
    },
    actions: {
      flexDirection: "row",
      padding: 20,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.lightGray,
    },
    cancelButtonText: {
      color: colors.gray,
      fontSize: 16,
      fontWeight: "600",
    },
    approveButton: {
      flex: 1,
    },
  });

export default ApprovalModal;
