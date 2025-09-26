import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useAuthContext } from "../../context/AuthContext";
import { getEspecialidades } from "../../api/especialidades";
import { createMedico, updateMedico } from "../../api/medicos";
import InputField from "../../components/InputField";
import ButtonPrimary from "../../components/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";
import {
  DateTimePickerAndroid,
  DateTimePickerIOS,
} from "@react-native-community/datetimepicker";

// Componente para seleccionar horarios con interfaz tipo alarma
const HorariosSelector = ({ horarios, onHorariosChange, error, colors }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pickerMode, setPickerMode] = useState("inicio");

  const diasSemana = [
    { key: "lunes", label: "Lunes", color: "#FF6B6B" },
    { key: "martes", label: "Martes", color: "#4ECDC4" },
    { key: "miercoles", label: "Miércoles", color: "#45B7D1" },
    { key: "jueves", label: "Jueves", color: "#96CEB4" },
    { key: "viernes", label: "Viernes", color: "#FFEAA7" },
    { key: "sabado", label: "Sábado", color: "#DDA0DD" },
    { key: "domingo", label: "Domingo", color: "#98D8C8" },
  ];

  const componentStyles = createHorariosStyles(colors);

  const formatTime = (timeString) => {
    if (!timeString) return "Seleccionar";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const handleTimeSelect = (event, selectedTime) => {
    if (selectedTime && selectedDay && selectedSlot !== null) {
      const timeString = selectedTime.toTimeString().slice(0, 5);
      const nuevosHorarios = { ...horarios };

      if (!nuevosHorarios[selectedDay]) nuevosHorarios[selectedDay] = [];

      if (!nuevosHorarios[selectedDay][selectedSlot]) {
        nuevosHorarios[selectedDay][selectedSlot] = { inicio: "", fin: "" };
      }

      nuevosHorarios[selectedDay][selectedSlot][pickerMode] = timeString;
      onHorariosChange(selectedDay, nuevosHorarios[selectedDay]);
    }
  };

  const openTimePicker = (dia, slotIndex, mode) => {
    setSelectedDay(dia);
    setSelectedSlot(slotIndex);
    setPickerMode(mode);

    if (Platform.OS === "ios") {
      setShowTimePicker(true);
    } else {
      DateTimePickerAndroid.open({
        value: new Date(),
        onChange: handleTimeSelect,
        mode: "time",
        is24Hour: true,
      });
    }
  };

  const addHorario = (dia) => {
    const nuevosHorarios = { ...horarios };
    if (!nuevosHorarios[dia]) nuevosHorarios[dia] = [];
    nuevosHorarios[dia].push({ inicio: "08:00", fin: "17:00" });
    onHorariosChange(dia, nuevosHorarios[dia]);
  };

  const removeHorario = (dia, slotIndex) => {
    const nuevosHorarios = { ...horarios };
    if (nuevosHorarios[dia]) {
      nuevosHorarios[dia] = nuevosHorarios[dia].filter(
        (_, i) => i !== slotIndex
      );
      onHorariosChange(dia, nuevosHorarios[dia]);
    }
  };

  return (
    <View>
      {diasSemana.map((dia) => (
        <View key={dia.key} style={componentStyles.diaContainer}>
          <View style={componentStyles.diaHeader}>
            <View
              style={[
                componentStyles.diaIndicator,
                { backgroundColor: dia.color },
              ]}
            />
            <Text style={componentStyles.diaLabel}>{dia.label}</Text>
          </View>

          {horarios[dia.key]?.map((horario, index) => (
            <View key={index} style={componentStyles.horarioCard}>
              <View style={componentStyles.horarioRow}>
                <TouchableOpacity
                  style={componentStyles.timeButton}
                  onPress={() => openTimePicker(dia.key, index, "inicio")}
                >
                  <Text style={componentStyles.timeButtonIcon}>🕐</Text>
                  <Text style={componentStyles.timeButtonText}>
                    {formatTime(horario.inicio)}
                  </Text>
                </TouchableOpacity>

                <Text style={componentStyles.timeSeparator}>a</Text>

                <TouchableOpacity
                  style={componentStyles.timeButton}
                  onPress={() => openTimePicker(dia.key, index, "fin")}
                >
                  <Text style={componentStyles.timeButtonIcon}>🕐</Text>
                  <Text style={componentStyles.timeButtonText}>
                    {formatTime(horario.fin)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.deleteSlotButton}
                  onPress={() => removeHorario(dia.key, index)}
                >
                  <Text style={componentStyles.deleteSlotButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={componentStyles.addButton}
            onPress={() => addHorario(dia.key)}
          >
            <Text style={componentStyles.addButtonIcon}>⏰</Text>
            <Text style={componentStyles.addButtonText}>Agregar horario</Text>
          </TouchableOpacity>
        </View>
      ))}

      {showTimePicker && Platform.OS === "ios" && (
        <DateTimePickerIOS
          value={new Date()}
          mode="time"
          is24Hour={true}
          onChange={handleTimeSelect}
        />
      )}

      {error && <Text style={componentStyles.errorText}>{error}</Text>}
    </View>
  );
};

const CrearMedicoScreen = ({ navigation, route }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const { user } = useAuthContext();
  const { medico } = route.params || {};
  const isEditing = !!medico;
  const styles = createStyles(colors);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    password: "",
    password_confirmation: "",
    telefono: "",
    especialidad_id: "",
    registro_medico: "",
    tarifa_consulta: "",
    biografia: "",
    horarios_atencion: {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: [],
    },
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.rol !== "superadmin") {
      Alert.alert(
        "Acceso Denegado",
        "No tienes permisos para acceder a esta pantalla",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }
    loadEspecialidades();
    if (isEditing) {
      loadMedicoData();
    }
  }, [user, isEditing]);

  const loadMedicoData = () => {
    if (medico) {
      setFormData({
        nombre: medico.nombre || "",
        apellido: medico.apellido || "",
        cedula: medico.cedula || "",
        email: medico.email || "",
        telefono: medico.telefono || "",
        especialidad_id: medico.especialidad_id || "",
        registro_medico: medico.registro_medico || "",
        tarifa_consulta: medico.tarifa_consulta || "",
        biografia: medico.biografia || "",
        horarios_atencion: medico.horarios_atencion || {
          lunes: [],
          martes: [],
          miercoles: [],
          jueves: [],
          viernes: [],
          sabado: [],
          domingo: [],
        },
        activo: medico.activo !== undefined ? medico.activo : true,
      });
    }
  };

  const loadEspecialidades = async () => {
    try {
      const response = await getEspecialidades();
      if (response.success) {
        setEspecialidades(response.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar las especialidades");
      }
    } catch (error) {
      console.error("Error loading especialidades:", error);
      Alert.alert("Error", "No se pudieron cargar las especialidades");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar campos requeridos
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida";
    } else if (formData.cedula.trim().length < 6) {
      newErrors.cedula = "La cédula debe tener al menos 6 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingrese un email válido";
    }

    if (!isEditing) {
      if (!formData.password.trim()) {
        newErrors.password = "La contraseña es requerida";
      } else if (formData.password.trim().length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }

      if (!formData.password_confirmation.trim()) {
        newErrors.password_confirmation =
          "La confirmación de contraseña es requerida";
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Las contraseñas no coinciden";
      }
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (formData.telefono.trim().length < 7) {
      newErrors.telefono = "El teléfono debe tener al menos 7 dígitos";
    }

    if (!formData.especialidad_id) {
      newErrors.especialidad_id = "Debe seleccionar una especialidad";
    }

    if (!formData.registro_medico.trim()) {
      newErrors.registro_medico = "El registro médico es requerido";
    }

    if (!formData.horarios_atencion) {
      newErrors.horarios_atencion = "Los horarios de atención son requeridos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleHorariosChange = (dia, horarios) => {
    setFormData((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        [dia]: horarios,
      },
    }));
    if (errors.horarios_atencion) {
      setErrors((prev) => ({ ...prev, horarios_atencion: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const medicoData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        especialidad_id: formData.especialidad_id,
        registro_medico: formData.registro_medico.trim(),
        tarifa_consulta: formData.tarifa_consulta
          ? parseFloat(formData.tarifa_consulta)
          : null,
        biografia: formData.biografia.trim(),
        horarios_atencion: formData.horarios_atencion,
        activo: formData.activo,
      };

      // Agregar credenciales solo si no es edición
      if (!isEditing) {
        medicoData.password = formData.password;
        medicoData.password_confirmation = formData.password_confirmation;
      }

      let response;
      if (isEditing) {
        response = await updateMedico(medico.id, medicoData);
      } else {
        response = await createMedico(medicoData);
      }

      if (response.success) {
        const action = isEditing ? "actualizado" : "creado";
        Alert.alert(
          `Médico ${action}`,
          `El médico ha sido ${action} exitosamente.`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          response.message ||
            `No se pudo ${isEditing ? "actualizar" : "crear"} el médico`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} medico:`,
        error
      );
      Alert.alert(
        "Error",
        `No se pudo ${
          isEditing ? "actualizar" : "crear"
        } el médico. Verifique los datos e intente nuevamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>
        {isEditing ? "Editar Médico" : "Crear Nuevo Médico"}
      </Text>

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <InputField
          label="Nombre *"
          placeholder="Ingrese el nombre"
          value={formData.nombre}
          onChangeText={(value) => handleChange("nombre", value)}
          error={errors.nombre}
        />

        <InputField
          label="Apellido *"
          placeholder="Ingrese el apellido"
          value={formData.apellido}
          onChangeText={(value) => handleChange("apellido", value)}
          error={errors.apellido}
        />

        <InputField
          label="Cédula *"
          placeholder="Ingrese la cédula"
          value={formData.cedula}
          onChangeText={(value) => handleChange("cedula", value)}
          keyboardType="numeric"
          error={errors.cedula}
        />

        <InputField
          label="Email *"
          placeholder="Ingrese el email"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        {!isEditing && (
          <>
            <InputField
              label="Contraseña *"
              placeholder="Ingrese la contraseña"
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry
              error={errors.password}
            />

            <InputField
              label="Confirmar Contraseña *"
              placeholder="Confirme la contraseña"
              value={formData.password_confirmation}
              onChangeText={(value) =>
                handleChange("password_confirmation", value)
              }
              secureTextEntry
              error={errors.password_confirmation}
            />
          </>
        )}

        <InputField
          label="Teléfono *"
          placeholder="Ingrese el teléfono"
          value={formData.telefono}
          onChangeText={(value) => handleChange("telefono", value)}
          keyboardType="phone-pad"
          error={errors.telefono}
        />
      </View>

      {/* Información Profesional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Profesional</Text>

        <Text style={styles.label}>Especialidad *</Text>
        <View style={styles.especialidadesContainer}>
          {especialidades.map((especialidad) => (
            <TouchableOpacity
              key={especialidad.id}
              style={[
                styles.especialidadChip,
                formData.especialidad_id === especialidad.id &&
                  styles.selectedEspecialidadChip,
              ]}
              onPress={() => handleChange("especialidad_id", especialidad.id)}
            >
              <Text
                style={[
                  styles.especialidadChipText,
                  formData.especialidad_id === especialidad.id &&
                    styles.selectedEspecialidadChipText,
                ]}
              >
                {especialidad.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.especialidad_id && (
          <Text style={styles.errorText}>{errors.especialidad_id}</Text>
        )}

        <InputField
          label="Registro Médico *"
          placeholder="Ingrese el registro médico"
          value={formData.registro_medico}
          onChangeText={(value) => handleChange("registro_medico", value)}
          error={errors.registro_medico}
        />

        <InputField
          label="Tarifa de Consulta"
          placeholder="Ingrese la tarifa de consulta (opcional)"
          value={formData.tarifa_consulta}
          onChangeText={(value) => handleChange("tarifa_consulta", value)}
          keyboardType="numeric"
          error={errors.tarifa_consulta}
        />

        <InputField
          label="Biografía"
          placeholder="Ingrese una breve biografía del médico (opcional)"
          value={formData.biografia}
          onChangeText={(value) => handleChange("biografia", value)}
          multiline
          numberOfLines={4}
          error={errors.biografia}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Estado</Text>
          <TouchableOpacity
            style={[
              styles.switch,
              formData.activo ? styles.switchActive : styles.switchInactive,
            ]}
            onPress={() => handleChange("activo", !formData.activo)}
          >
            <Text style={styles.switchText}>
              {formData.activo ? "Activo" : "Inactivo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horarios de Atención */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios de Atención</Text>
        <HorariosSelector
          horarios={formData.horarios_atencion}
          onHorariosChange={handleHorariosChange}
          error={errors.horarios_atencion}
          colors={colors}
        />
      </View>

      <ButtonPrimary
        title={isEditing ? "Actualizar Médico" : "Crear Médico"}
        onPress={handleSubmit}
        disabled={loading}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

// Create styles function for HorariosSelector component
const createHorariosStyles = (colors) =>
  StyleSheet.create({
    diaContainer: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    diaHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    diaIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    diaLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 8,
    },
    horarioCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    horarioRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    timeButton: {
      flex: 1,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    timeButtonIcon: {
      fontSize: 16,
    },
    timeButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    timeSeparator: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.gray,
      marginHorizontal: 8,
    },
    deleteSlotButton: {
      backgroundColor: colors.error,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteSlotButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "bold",
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      alignSelf: "flex-start",
    },
    addButtonIcon: {
      fontSize: 16,
    },
    addButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

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
    section: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    especialidadesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    especialidadChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.lightGray,
      backgroundColor: colors.white,
    },
    selectedEspecialidadChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    especialidadChipText: {
      fontSize: 14,
      color: colors.gray,
    },
    selectedEspecialidadChipText: {
      color: colors.white,
      fontWeight: "600",
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    submitButton: {
      marginTop: 8,
      marginBottom: 20,
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    switch: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    switchActive: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    switchInactive: {
      backgroundColor: colors.lightGray,
      borderColor: colors.lightGray,
    },
    switchText: {
      color: colors.white,
      fontWeight: "600",
    },
    // Los estilos de horarios ahora están en createHorariosStyles
  });

export default CrearMedicoScreen;
