import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import ButtonPrimary from "./ButtonPrimary";
import { useThemeColors } from "../utils/themeColors";

const CancellationModal = ({ visible, onClose, onCancel, cita }) => {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in CancellationModal useThemeColors:", error);
    colors = {
      background: "#F9F9F9",
      primary: "#FF6B35",
      text: "#1C1C1E",
      error: "#FF3B30",
      gray: "#8E8E93",
      white: "#FFFFFF",
      border: "#C6C6C8",
      danger: "#FF3B30",
    };
  }

  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!motivoCancelacion.trim()) {
      Alert.alert("Error", "Debe ingresar un motivo de cancelación");
      return;
    }

    try {
      setLoading(true);
      await onCancel(motivoCancelacion.trim());
      setMotivoCancelacion("");
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo cancelar la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivoCancelacion("");
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
          <Text style={styles.title}>Cancelar Cita</Text>

          <Text style={styles.subtitle}>
            ¿Está seguro que desea cancelar esta cita?
          </Text>

          {cita && (
            <View style={styles.citaInfo}>
              <Text style={styles.citaText}>
                Paciente: {cita.paciente?.nombre} {cita.paciente?.apellido}
              </Text>
              <Text style={styles.citaText}>
                Fecha: {new Date(cita.fecha_hora).toLocaleDateString("es-ES")}
              </Text>
              <Text style={styles.citaText}>
                Hora:{" "}
                {new Date(cita.fecha_hora).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Motivo de cancelación *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ingrese el motivo de la cancelación"
            value={motivoCancelacion}
            onChangeText={setMotivoCancelacion}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>No Cancelar</Text>
            </TouchableOpacity>

            <ButtonPrimary
              title="Confirmar Cancelación"
              onPress={handleCancel}
              disabled={loading}
              loading={loading}
              style={styles.confirmButton}
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
      padding: 20,
      margin: 20,
      width: "90%",
      maxWidth: 400,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      marginBottom: 20,
    },
    citaInfo: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    citaText: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 4,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      minHeight: 80,
      textAlignVertical: "top",
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.gray,
    },
    cancelButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    confirmButton: {
      flex: 1,
    },
  });

export default CancellationModal;
