import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner";
import MiniCalendario from "../../components/MiniCalendario";
import { useCitas } from "../../context/CitasContext";
import { useAuthContext } from "../../context/AuthContext";
import { getEspecialidades } from "../../api/especialidades";
import {
  getMedicos,
  getMedicoDisponibilidad,
  checkMedicoAvailability,
} from "../../api/medicos";
import { getPacientes } from "../../api/pacientes";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";
import { formatDateTimeForAPI, isDateTimeFuture } from "../../utils/formatDate";

const CrearCitaScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const { agregarCita, loading } = useCitas();
  const { user } = useAuthContext();
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    paciente_id: "",
    medico_id: "",
    especialidad_id: "",
    fecha_hora: "",
    motivo_consulta: "",
    observaciones: "",
  });

  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const [errors, setErrors] = useState({});
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEspecialidad) {
      loadMedicosByEspecialidad();
      setFormData((prev) => ({
        ...prev,
        especialidad_id: selectedEspecialidad,
      }));
    } else {
      setMedicos([]);
      setFormData((prev) => ({ ...prev, medico_id: "", especialidad_id: "" }));
    }
  }, [selectedEspecialidad]);

  useEffect(() => {
    // Reset availability check when medico or fecha changes
    if (formData.medico_id && formData.fecha_hora) {
      checkAvailability();
    } else {
      setAvailabilityChecked(false);
      setIsAvailable(false);
    }
  }, [formData.medico_id, formData.fecha_hora]);

  // Reset selected date when medico changes
  useEffect(() => {
    if (formData.medico_id !== "") {
      setSelectedDateTime(null);
      setFormData((prev) => ({ ...prev, fecha_hora: "" }));
      setAvailabilityChecked(false);
      setIsAvailable(false);
    }
  }, [formData.medico_id]);

  const loadInitialData = async () => {
    try {
      const especialidadesResponse = await getEspecialidades();
      if (especialidadesResponse.success) {
        setEspecialidades(especialidadesResponse.data || []);
      }

      // Si es médico, cargar pacientes para selección
      if (user?.rol === "medico") {
        const pacientesResponse = await getPacientes();
        if (pacientesResponse.success) {
          setPacientes(pacientesResponse.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Error", "No se pudieron cargar los datos iniciales");
    } finally {
      setLoadingData(false);
    }
  };

  const loadMedicosByEspecialidad = async () => {
    try {
      const medicosResponse = await getMedicos({
        especialidad_id: selectedEspecialidad,
      });
      if (medicosResponse.success) {
        setMedicos(medicosResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading medicos:", error);
      Alert.alert("Error", "No se pudieron cargar los médicos");
    }
  };

  const checkAvailability = async (dateTimeString = null) => {
    const fechaHoraToCheck = dateTimeString || formData.fecha_hora;
    if (!formData.medico_id || !fechaHoraToCheck) return;

    try {
      setCheckingAvailability(true);
      const availabilityResponse = await checkMedicoAvailability(
        formData.medico_id,
        fechaHoraToCheck,
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          offset: new Date().getTimezoneOffset(),
          timestamp: new Date().getTime(),
        }
      );

      if (availabilityResponse.success) {
        setIsAvailable(availabilityResponse.data.available);
        setAvailabilityChecked(true);
      } else {
        setIsAvailable(false);
        setAvailabilityChecked(true);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
      setAvailabilityChecked(true);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Si es médico, debe seleccionar paciente
    if (user?.rol === "medico" && !formData.paciente_id) {
      newErrors.paciente_id = "Selecciona un paciente";
    }

    if (!selectedEspecialidad) {
      newErrors.especialidad = "Selecciona una especialidad";
    }

    if (!formData.medico_id) {
      newErrors.medico_id = "Selecciona un médico";
    }

    if (!formData.fecha_hora) {
      newErrors.fecha_hora = "Selecciona fecha y hora en el calendario";
    } else {
      const fechaCita = new Date(formData.fecha_hora);
      if (!isDateTimeFuture(fechaCita, 30)) {
        newErrors.fecha_hora =
          "La fecha debe ser futura (mínimo 30 minutos de anticipación)";
      }
    }

    if (availabilityChecked && !isAvailable) {
      newErrors.fecha_hora =
        "El médico no está disponible en esta fecha y hora";
    }

    if (!formData.motivo_consulta.trim()) {
      newErrors.motivo_consulta = "El motivo de consulta es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Determinar el estado inicial basado en el rol del usuario
      const isMedico = user?.rol === "medico";
      const isPaciente = user?.rol === "paciente";
      const estadoInicial = isMedico ? "programada" : "pendiente_aprobacion";

      const citaData = {
        paciente_id: isMedico
          ? parseInt(formData.paciente_id)
          : user.paciente_id || user.id,
        medico_id: parseInt(formData.medico_id),
        especialidad_id: parseInt(formData.especialidad_id),
        fecha_hora: formData.fecha_hora,
        estado: estadoInicial,
        motivo_consulta: formData.motivo_consulta.trim(),
        observaciones: formData.observaciones.trim(),
      };

      await agregarCita(citaData);

      const mensaje = isMedico
        ? "Cita creada y aprobada exitosamente"
        : "Solicitud de cita enviada exitosamente. Pendiente de aprobación médica";

      Alert.alert("Cita Creada", mensaje, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cita. Inténtalo de nuevo.");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateSelect = (dateTime) => {
    setSelectedDateTime(dateTime);

    // Usar la función de utilidad para formatear la fecha correctamente
    const isoString = formatDateTimeForAPI(dateTime);

    setFormData((prev) => ({ ...prev, fecha_hora: isoString }));

    if (errors.fecha_hora) {
      setErrors((prev) => ({ ...prev, fecha_hora: "" }));
    }
  };

  if (loadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  const isMedico = user?.rol === "medico";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>
        {isMedico ? "Crear Cita Médica" : "Nueva Cita Médica"}
      </Text>

      {/* Selector de Paciente (solo para médicos) */}
      {isMedico && (
        <>
          <Text style={styles.label}>Paciente *</Text>
          <View style={styles.pickerContainer}>
            {pacientes.length === 0 ? (
              <Text style={styles.noDataText}>
                No hay pacientes disponibles
              </Text>
            ) : (
              pacientes.map((paciente) => (
                <TouchableOpacity
                  key={paciente.id}
                  style={[
                    styles.optionButton,
                    formData.paciente_id === paciente.id.toString() &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    handleChange("paciente_id", paciente.id.toString())
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.paciente_id === paciente.id.toString() &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {paciente.nombre} {paciente.apellido}
                  </Text>
                  <Text style={styles.patientDetails}>
                    {paciente.cedula} - {paciente.email}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
          {errors.paciente_id && (
            <Text style={styles.errorText}>{errors.paciente_id}</Text>
          )}
        </>
      )}

      {/* Selector de Especialidad */}
      <Text style={styles.label}>Especialidad</Text>
      <View style={styles.pickerContainer}>
        {especialidades.map((especialidad) => (
          <TouchableOpacity
            key={especialidad.id}
            style={[
              styles.optionButton,
              selectedEspecialidad === especialidad.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedEspecialidad(especialidad.id)}
          >
            <Text
              style={[
                styles.optionText,
                selectedEspecialidad === especialidad.id &&
                  styles.selectedOptionText,
              ]}
            >
              {especialidad.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.especialidad && (
        <Text style={styles.errorText}>{errors.especialidad}</Text>
      )}

      {/* Selector de Médico */}
      {selectedEspecialidad && (
        <>
          <Text style={styles.label}>Médico</Text>
          <View style={styles.pickerContainer}>
            {medicos.length === 0 ? (
              <Text style={styles.noDataText}>No hay médicos disponibles</Text>
            ) : (
              medicos.map((medico) => (
                <TouchableOpacity
                  key={medico.id}
                  style={[
                    styles.optionButton,
                    formData.medico_id === medico.id.toString() &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    handleChange("medico_id", medico.id.toString())
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.medico_id === medico.id.toString() &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Dr. {medico.nombre} {medico.apellido}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
          {errors.medico_id && (
            <Text style={styles.errorText}>{errors.medico_id}</Text>
          )}
        </>
      )}

      {/* Calendario para seleccionar fecha y hora */}
      <Text style={styles.label}>Fecha y Hora</Text>
      <MiniCalendario
        selectedDate={selectedDateTime}
        onDateSelect={handleDateSelect}
        medicoId={formData.medico_id}
        onAvailabilityCheck={(dateTimeString) => {
          if (formData.medico_id) {
            checkAvailability(dateTimeString);
          }
        }}
        isAvailable={isAvailable}
        checkingAvailability={checkingAvailability}
        onAvailabilityResult={(available) => {
          setIsAvailable(available);
          setAvailabilityChecked(true);
        }}
      />
      {errors.fecha_hora && (
        <Text style={styles.errorText}>{errors.fecha_hora}</Text>
      )}

      {/* Motivo de Consulta */}
      <InputField
        label="Motivo de Consulta *"
        placeholder="Describe el motivo de tu consulta"
        value={formData.motivo_consulta}
        onChangeText={(value) => handleChange("motivo_consulta", value)}
        multiline
        numberOfLines={3}
        error={errors.motivo_consulta}
      />

      {/* Observaciones */}
      <InputField
        label="Observaciones (Opcional)"
        placeholder="Información adicional"
        value={formData.observaciones}
        onChangeText={(value) => handleChange("observaciones", value)}
        multiline
        numberOfLines={2}
        error={errors.observaciones}
      />

      <ButtonPrimary
        title="Crear Cita"
        onPress={handleSubmit}
        disabled={loading}
        loading={loading}
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
      textAlign: "center",
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    pickerContainer: {
      marginBottom: 8,
    },
    optionButton: {
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.input || colors.surface,
    },
    selectedOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.white,
      fontWeight: "600",
    },
    noDataText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
      padding: 16,
    },
    helpText: {
      fontSize: 12,
      color: colors.gray,
      marginBottom: 8,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginBottom: 8,
    },
    patientDetails: {
      fontSize: 12,
      color: colors.gray,
      marginTop: 2,
    },
  });

export default CrearCitaScreen;
