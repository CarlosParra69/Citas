import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
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
import { formatDateTimeForAPI, formatDateTimeUTCForAPI, isDateTimeFuture } from "../../utils/formatDate";

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
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  
  // SIMPLIFICADO: Solo estados necesarios para disponibilidad
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityCheckInProgress, setAvailabilityCheckInProgress] = useState(false);

  // Componente SelectModal para especialidades
  const SelectModal = ({
    options,
    selectedValue,
    onSelect,
    placeholder,
    label,
    error
  }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(option => option.id === selectedValue);

    return (
      <View style={styles.selectContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
         
        <TouchableOpacity
          style={[
            styles.selectButton,
            error && styles.selectButtonError,
            modalVisible && styles.selectButtonActive
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text
            style={[
              styles.selectButtonText,
              !selectedOption && styles.selectButtonPlaceholder
            ]}
          >
            {selectedOption ? selectedOption.nombre : placeholder}
          </Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar {label}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalList}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.modalOption,
                      selectedValue === option.id && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      onSelect(option.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedValue === option.id && styles.modalOptionTextSelected
                      ]}
                    >
                      {option.nombre}
                    </Text>
                    {selectedValue === option.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

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
    // Reset availability check when medico changes
    if (formData.medico_id) {
      setIsAvailable(null);
      setAvailabilityCheckInProgress(false);
    }
  }, [formData.medico_id]);

  // Reset selected date when medico changes
  useEffect(() => {
    if (formData.medico_id !== "") {
      setSelectedDateTime(null);
      setFormData((prev) => ({ ...prev, fecha_hora: "" }));
      setIsAvailable(null);
      setAvailabilityCheckInProgress(false);
    }
  }, [formData.medico_id]);

  const loadInitialData = async () => {
    try {
      const especialidadesResponse = await getEspecialidades();
      if (especialidadesResponse.success) {
        setEspecialidades(especialidadesResponse.data || []);
      }

      // Si es médico o superadministrador, cargar pacientes para selección
      if (user?.rol === "medico" || user?.rol === "superadmin") {
        const pacientesResponse = await getPacientes();
         
        if (pacientesResponse.data?.success) {
          // Manejar la estructura de respuesta de Laravel paginada
          const pacientesData = pacientesResponse.data?.data?.data || pacientesResponse.data?.data || [];
          setPacientes(pacientesData);
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

  // FUNCIÓN SIMPLIFICADA DE VERIFICACIÓN
  const checkAvailability = async (dateTimeString) => {
    
    
    if (!formData.medico_id || !dateTimeString) return;
    
    // Prevenir múltiples verificaciones simultáneas
    if (availabilityCheckInProgress) {
      
      return;
    }

    try {
      setAvailabilityCheckInProgress(true);
      setCheckingAvailability(true);
      
      
      
      const availabilityResponse = await checkMedicoAvailability(
        formData.medico_id,
        dateTimeString,
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          offset: new Date().getTimezoneOffset(),
          timestamp: new Date().getTime(),
        }
      );

      if (availabilityResponse.success) {
        
        setIsAvailable(availabilityResponse.data.available);
      } else {
        
        setIsAvailable(false);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
    } finally {
      setCheckingAvailability(false);
      setAvailabilityCheckInProgress(false);
      
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Si es médico o superadministrador, debe seleccionar paciente
    if ((user?.rol === "medico" || user?.rol === "superadmin") && !formData.paciente_id) {
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

    if (isAvailable === false) {
      newErrors.fecha_hora = "El médico no está disponible en esta fecha y hora";
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
      const isSuperAdmin = user?.rol === "superadmin";
      const estadoInicial = (isMedico || isSuperAdmin) ? "programada" : "pendiente_aprobacion";

      const citaData = {
        paciente_id: (isMedico || isSuperAdmin)
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

      const mensaje = (isMedico || isSuperAdmin)
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

    // Limpiar estados de disponibilidad
    setCheckingAvailability(false);
    setIsAvailable(null);
    setAvailabilityCheckInProgress(false);

    // Usar formato UTC para envío final al backend
    const utcDateString = formatDateTimeUTCForAPI(dateTime);

    // Guardar UTC para envío final
    setFormData((prev) => ({ ...prev, fecha_hora: utcDateString }));

    if (errors.fecha_hora) {
      setErrors((prev) => ({ ...prev, fecha_hora: "" }));
    }
  };

  const handleAvailabilityCheck = (dateTimeString) => {
    
    
    // Llamar verificación directamente
    checkAvailability(dateTimeString);
  };

  if (loadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  const isMedico = user?.rol === "medico";
  const isSuperAdmin = user?.rol === "superadmin";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {(isMedico || isSuperAdmin) ? "Crear Cita Médica" : "Nueva Cita Médica"}
        </Text>

        {/* Selector de Paciente (para médicos y superadministradores) */}
        {(isMedico || isSuperAdmin) && (
          <SelectModal
            options={pacientes.map(paciente => ({
              id: paciente.id,
              nombre: `${paciente.nombre} ${paciente.apellido}`,
              cedula: paciente.cedula,
              email: paciente.email,
              paciente: paciente // Guardar la referencia completa del paciente
            }))}
            selectedValue={selectedPaciente}
            onSelect={(pacienteId) => {
              const paciente = pacientes.find(p => p.id === pacienteId);
              setSelectedPaciente(pacienteId);
              setFormData((prev) => ({ ...prev, paciente_id: pacienteId.toString() }));
              if (errors.paciente_id) {
                setErrors((prev) => ({ ...prev, paciente_id: "" }));
              }
            }}
            placeholder="Selecciona un paciente"
            label="Paciente *"
            error={errors.paciente_id}
            colors={colors}
          />
        )}

        {/* Selector de Especialidad */}
        <SelectModal
          options={especialidades}
          selectedValue={selectedEspecialidad}
          onSelect={setSelectedEspecialidad}
          placeholder="Selecciona una especialidad"
          label="Especialidad *"
          error={errors.especialidad}
          colors={colors}
        />

        {/* Selector de Médico */}
        {selectedEspecialidad && (
          <>
            <Text style={styles.label}>Médico</Text>
            <View style={styles.pickerContainer}>
              {medicos.length === 0 ? (
                <Text style={styles.noDataText}>
                  No hay médicos disponibles
                </Text>
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
          onAvailabilityCheck={handleAvailabilityCheck}
          isAvailable={isAvailable}
          checkingAvailability={checkingAvailability}
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
    </KeyboardAvoidingView>
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
    // Estilos para SelectModal
    selectContainer: {
      marginBottom: 16,
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.input || colors.surface,
    },
    selectButtonError: {
      borderColor: colors.error,
    },
    selectButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    selectButtonText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    selectButtonPlaceholder: {
      color: colors.gray,
    },
    selectArrow: {
      fontSize: 12,
      color: colors.gray,
      marginLeft: 8,
    },
    // Estilos del modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background || colors.white,
      borderRadius: 12,
      width: '90%',
      maxHeight: '70%',
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || colors.lightGray,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    closeButtonText: {
      fontSize: 18,
      color: colors.gray,
      fontWeight: 'bold',
    },
    modalList: {
      maxHeight: 400,
    },
    modalOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || colors.lightGray,
    },
    modalOptionSelected: {
      backgroundColor: colors.primary + '20',
    },
    modalOptionText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    modalOptionTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    checkmark: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

export default CrearCitaScreen;
