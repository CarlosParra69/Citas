import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "../../utils/themeColors";
import { useCitas } from "../../context/CitasContext";
import { useAuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const ValoracionScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuthContext();
  const { completarCitaPendiente, loading } = useCitas();

  const { citaId } = route.params;

  const [formData, setFormData] = useState({
    diagnostico: "",
    tratamiento: "",
    costo: "",
    descuento: "",
    total_pagar: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Calcular total a pagar cuando cambien costo o descuento
    if (formData.costo) {
      const costo = parseFloat(formData.costo) || 0;
      const descuento = parseFloat(formData.descuento) || 0;
      const total = costo - descuento;
      setFormData((prev) => ({
        ...prev,
        total_pagar: total.toString(),
      }));
    }
  }, [formData.costo, formData.descuento]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.diagnostico.trim()) {
      newErrors.diagnostico = "El diagnóstico es requerido";
    }

    if (!formData.tratamiento.trim()) {
      newErrors.tratamiento = "El tratamiento es requerido";
    }

    if (!formData.costo.trim()) {
      newErrors.costo = "El costo es requerido";
    } else {
      const costo = parseFloat(formData.costo);
      if (isNaN(costo) || costo < 0) {
        newErrors.costo = "Ingrese un costo válido";
      }
    }

    if (formData.descuento && parseFloat(formData.descuento) < 0) {
      newErrors.descuento = "El descuento no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVolver = () => {
    Alert.alert(
      "Confirmar",
      "¿Desea salir sin completar la valoración? Podrá volver más tarde.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          onPress: () => navigation.navigate("CitasHoyScreen"),
        },
      ]
    );
  };

  const handleCompletarCita = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Por favor complete todos los campos requeridos");
      return;
    }

    try {
      const citaData = {
        diagnostico: formData.diagnostico.trim(),
        tratamiento: formData.tratamiento.trim(),
        costo: parseFloat(formData.costo),
        descuento: parseFloat(formData.descuento) || 0,
        total_pagar:
          parseFloat(formData.total_pagar) || parseFloat(formData.costo),
        estado: "completada",
      };

      await completarCitaPendiente(citaId, citaData);

      Alert.alert("Éxito", "Cita completada correctamente", [
        {
          text: "OK",
          onPress: () => navigation.navigate("CitasHoyScreen"),
        },
      ]);
    } catch (error) {
      console.error("Error completando cita:", error);
      Alert.alert("Error", "No se pudo completar la cita");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Procesando..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Valoración del Paciente</Text>

      {/* Diagnóstico */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Diagnóstico *</Text>
        <TextInput
          style={[styles.textArea, errors.diagnostico && styles.inputError]}
          placeholder="Ingrese el diagnóstico del paciente"
          value={formData.diagnostico}
          onChangeText={(value) => handleInputChange("diagnostico", value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.diagnostico && (
          <Text style={styles.errorText}>{errors.diagnostico}</Text>
        )}
      </View>

      {/* Tratamiento */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tratamiento *</Text>
        <TextInput
          style={[styles.textArea, errors.tratamiento && styles.inputError]}
          placeholder="Ingrese el tratamiento prescrito"
          value={formData.tratamiento}
          onChangeText={(value) => handleInputChange("tratamiento", value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.tratamiento && (
          <Text style={styles.errorText}>{errors.tratamiento}</Text>
        )}
      </View>

      {/* Costo */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Costo de la Consulta *</Text>
        <TextInput
          style={[styles.input, errors.costo && styles.inputError]}
          placeholder="0.00"
          value={formData.costo}
          onChangeText={(value) => handleInputChange("costo", value)}
          keyboardType="numeric"
        />
        {errors.costo && <Text style={styles.errorText}>{errors.costo}</Text>}
      </View>

      {/* Descuento */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descuento</Text>
        <TextInput
          style={[styles.input, errors.descuento && styles.inputError]}
          placeholder="0.00"
          value={formData.descuento}
          onChangeText={(value) => handleInputChange("descuento", value)}
          keyboardType="numeric"
        />
        {errors.descuento && (
          <Text style={styles.errorText}>{errors.descuento}</Text>
        )}
      </View>

      {/* Total a Pagar */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Total a Pagar</Text>
        <TextInput
          style={[styles.input, styles.totalInput]}
          value={formData.total_pagar}
          editable={false}
          placeholder="0.00"
        />
      </View>

      {/* Botones de Acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompletarCita}
        >
          <Text style={styles.completeButtonText}>Cita Completada</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
      textAlign: "center",
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.input || colors.surface,
      color: colors.text,
    },
    textArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.input || colors.surface,
      color: colors.text,
      height: 100,
    },
    totalInput: {
      backgroundColor: colors.background,
      color: colors.primary,
      fontWeight: "bold",
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 16,
    },
    backButton: {
      backgroundColor: colors.gray,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      flex: 1,
      alignItems: "center",
    },
    backButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    completeButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
      flex: 1,
      alignItems: "center",
    },
    completeButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default ValoracionScreen;
