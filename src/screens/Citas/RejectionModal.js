import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useCitas } from "../../context/CitasContext";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";

const RejectionModal = ({ visible, onClose, citaId, onReject }) => {
  let colors, citasContext;

  try {
    colors = useThemeColors();
    citasContext = useCitas();
  } catch (error) {
    console.error("Error in RejectionModal contexts:", error);
    return null; // No renderizar si hay error de contexto
  }

  const safeColors = colors || {
    background: "#F9F9F9",
    primary: "#FF6B35",
    text: "#1C1C1E",
    error: "#FF3B30",
    gray: "#8E8E93",
    white: "#FFFFFF",
    border: "#C6C6C8",
    secondary: "#FF8C42",
  };

  const styles = React.useMemo(() => createStyles(safeColors), [safeColors]);

  const { rechazarCitaPendiente, loading } = citasContext || {
    rechazarCitaPendiente: async () => {},
    loading: false,
  };

  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [error, setError] = useState("");

  // Verificar si los colores están disponibles
  if (!colors) {
    return null;
  }

  const handleReject = async () => {
    if (!motivoRechazo.trim()) {
      setError("El motivo de rechazo es obligatorio");
      return;
    }

    try {
      await rechazarCitaPendiente(citaId, motivoRechazo.trim());
      Alert.alert("Éxito", "Cita rechazada correctamente");
      setMotivoRechazo("");
      setError("");
      onReject && onReject();
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo rechazar la cita");
    }
  };

  const handleClose = () => {
    setMotivoRechazo("");
    setError("");
    onClose();
  };

  // Verificar que tenemos todos los datos necesarios antes de renderizar
  if (!visible || !citaId) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Rechazar Cita</Text>
          <Text style={styles.subtitle}>
            Por favor, indique el motivo del rechazo:
          </Text>

          <InputField
            placeholder="Motivo de rechazo"
            value={motivoRechazo}
            onChangeText={(text) => {
              setMotivoRechazo(text);
              if (error) setError("");
            }}
            error={error}
            multiline={true}
            numberOfLines={3}
            style={styles.textArea}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
              disabled={loading}
            >
              <Text style={styles.rejectButtonText}>
                {loading ? "Rechazando..." : "Confirmar Rechazo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 20,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.secondary,
    },
    cancelButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    rejectButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

export default RejectionModal;
