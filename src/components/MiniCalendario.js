import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Picker,
} from "react-native";
import { useThemeColors } from "../utils/themeColors";
import { getMedicoDisponibilidad } from "../api/medicos";
import { formatDateTimeForAPI } from "../utils/formatDate";

const MiniCalendario = ({
  selectedDate,
  onDateSelect,
  medicoId,
  onAvailabilityCheck,
  isAvailable,
  checkingAvailability,
  onAvailabilityResult,
}) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [tempDateTime, setTempDateTime] = useState(selectedDate || new Date());
  const [medicoHorarios, setMedicoHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [lastLoadParams, setLastLoadParams] = useState({
    medicoId: null,
    date: null,
  });
  const [localAvailability, setLocalAvailability] = useState(null);
  const [localCheckingAvailability, setLocalCheckingAvailability] =
    useState(false);

  // Sincronizar tempDateTime con selectedDate cuando cambie
  useEffect(() => {
    if (
      selectedDate &&
      (!tempDateTime || selectedDate.getTime() !== tempDateTime.getTime())
    ) {
      setTempDateTime(selectedDate);
    }
  }, [selectedDate]);

  // Cargar horarios disponibles del médico cuando cambie la fecha o el médico
  useEffect(() => {
    const dateString = tempDateTime
      ? tempDateTime.toISOString().split("T")[0]
      : null;

    // Evitar llamadas duplicadas
    if (
      lastLoadParams.medicoId === medicoId &&
      lastLoadParams.date === dateString
    ) {
      return;
    }

    if (medicoId && tempDateTime) {
      setLastLoadParams({ medicoId, date: dateString });
      loadMedicoHorarios();
    } else {
      if (!medicoId) {
        setMedicoHorarios([]);
      }
    }
  }, [medicoId, tempDateTime, lastLoadParams]);

  // Escuchar cambios en las props de disponibilidad
  useEffect(() => {
    if (checkingAvailability !== localCheckingAvailability) {
      setLocalCheckingAvailability(checkingAvailability);
    }
    if (isAvailable !== localAvailability) {
      setLocalAvailability(isAvailable);
    }
  }, [checkingAvailability, isAvailable]);

  const loadMedicoHorarios = async () => {
    if (!medicoId) return;

    try {
      setLoadingHorarios(true);
      const fechaFormateada = tempDateTime.toISOString().split("T")[0];

      const response = await getMedicoDisponibilidad(medicoId, fechaFormateada);

      if (response && response.success) {
        // Los horarios pueden venir como string JSON escapado o como objeto
        let horariosAtencion;
        try {
          // Si es un string JSON, parsearlo
          if (typeof response.data.horarios_atencion === "string") {
            horariosAtencion = JSON.parse(response.data.horarios_atencion);
          } else if (typeof response.data.horarios_atencion === "object") {
            horariosAtencion = response.data.horarios_atencion;
          } else {
            horariosAtencion = null;
          }
        } catch (error) {
          horariosAtencion = null;
        }

        // Verificar si el médico tiene horarios de atención configurados
        if (!horariosAtencion) {
          const horariosPorDefecto = generarHorasPorDefecto();
          setMedicoHorarios(horariosPorDefecto);
          return;
        }

        // Los horarios vienen en formato de rangos como "08:00-17:00"
        // Necesito convertirlos a horas individuales disponibles
        const horariosDisponibles = generarHorasDisponibles(horariosAtencion);
        setMedicoHorarios(horariosDisponibles);
      } else {
        setMedicoHorarios([]);
      }
    } catch (error) {
      setMedicoHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  // Generar array de horas disponibles a partir de los rangos de horarios del médico
  const generarHorasDisponibles = (horariosAtencion) => {
    if (!horariosAtencion) return [];

    const horasDisponibles = [];
    const diaSemana = tempDateTime
      .toLocaleDateString("es-ES", { weekday: "long" })
      .toLowerCase();

    // Mapear días de español a inglés para coincidir con el backend
    const diasMap = {
      lunes: "lunes",
      martes: "martes",
      miércoles: "miercoles",
      jueves: "jueves",
      viernes: "viernes",
      sábado: "sabado",
      domingo: "domingo",
    };

    const diaEspanol = diasMap[diaSemana];

    // Verificar que diaEspanol existe y es válido
    if (!diaEspanol) return [];

    const horariosDelDia = horariosAtencion[diaEspanol];

    if (
      !horariosDelDia ||
      !Array.isArray(horariosDelDia) ||
      horariosDelDia.length === 0
    ) {
      // Usar horarios por defecto cuando no hay horarios específicos para este día
      return generarHorasPorDefecto();
    }

    // Generar horas disponibles para cada rango horario del día
    horariosDelDia.forEach((rangoHorario) => {
      let horaInicio, horaFin;

      // Verificar si es un objeto con propiedades inicio/fin o un string
      if (
        typeof rangoHorario === "object" &&
        rangoHorario.inicio &&
        rangoHorario.fin
      ) {
        // ✅ Formato correcto: {"inicio": "08:00", "fin": "17:00"}
        horaInicio = rangoHorario.inicio;
        horaFin = rangoHorario.fin;
      } else if (typeof rangoHorario === "string") {
        // ❌ Formato string: "08:00-17:00"
        const [inicio, fin] = rangoHorario.split("-");
        horaInicio = inicio;
        horaFin = fin;
      } else {
        return;
      }

      if (horaInicio && horaFin) {
        const [inicioHora, inicioMin] = horaInicio.split(":").map(Number);
        const [finHora, finMin] = horaFin.split(":").map(Number);

        // Verificar que las horas sean números válidos
        if (
          isNaN(inicioHora) ||
          isNaN(inicioMin) ||
          isNaN(finHora) ||
          isNaN(finMin)
        ) {
          return;
        }

        // Generar intervalos de 30 minutos
        const inicioMinutos = inicioHora * 60 + inicioMin;
        const finMinutos = finHora * 60 + finMin;

        for (let minutos = inicioMinutos; minutos < finMinutos; minutos += 30) {
          const hora = Math.floor(minutos / 60);
          const min = minutos % 60;

          const horaFormateada = `${hora.toString().padStart(2, "0")}:${min
            .toString()
            .padStart(2, "0")}`;

          horasDisponibles.push(horaFormateada);
        }
      }
    });

    return horasDisponibles;
  };

  // Generar horas por defecto cuando no hay horarios del backend
  const generarHorasPorDefecto = () => {
    const horasPorDefecto = [];
    const horaInicio = 8; // 8 AM
    const horaFin = 17; // 5 PM
    const intervalo = 30; // minutos

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += intervalo) {
        const horaFormateada = `${hora.toString().padStart(2, "0")}:${minuto
          .toString()
          .padStart(2, "0")}`;
        horasPorDefecto.push(horaFormateada);
      }
    }

    return horasPorDefecto;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
    });
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const handleDatePress = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // No permitir fechas pasadas
    if (selectedDate < today) {
      return;
    }

    // Actualizar la fecha temporal para cargar horarios
    setTempDateTime(selectedDate);

    // Si hay un médico seleccionado, mostrar modal con horarios
    if (medicoId) {
      // Cargar horarios antes de mostrar el modal
      loadMedicoHorarios()
        .then(() => {
          setShowTimePicker(true);
        })
        .catch((error) => {
          setShowTimePicker(true); // Mostrar modal de todas formas
        });
    } else {
      // Si no hay médico, solo seleccionar la fecha
      onDateSelect(selectedDate);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(":");

    // Usar la fecha seleccionada (tempDateTime) en lugar de la fecha actual
    if (!tempDateTime) {
      console.error("No hay fecha seleccionada");
      return;
    }

    // Crear fecha usando la fecha seleccionada con la hora elegida
    const targetDate = new Date(
      tempDateTime.getFullYear(),
      tempDateTime.getMonth(),
      tempDateTime.getDate(),
      parseInt(hours),
      parseInt(minutes),
      0,
      0
    );

    // Llamar a la función del padre para actualizar la fecha seleccionada
    onDateSelect(targetDate);

    if (onAvailabilityCheck) {
      // Usar la función de utilidad para formatear la fecha correctamente
      const isoString = formatDateTimeForAPI(targetDate);

      // Establecer estado local de carga
      setLocalCheckingAvailability(true);
      setLocalAvailability(null);

      // Llamar a la función del padre y manejar la respuesta
      onAvailabilityCheck(isoString);
    }

    setShowTimePicker(false);
  };

  const handleCloseModal = () => {
    setShowTimePicker(false);
    setSelectedTime("");
    // No limpiar la fecha seleccionada, mantenerla para que el usuario pueda intentar de nuevo
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayContainer}>
          <View style={styles.emptyDay} />
        </View>
      );
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayContainer,
            isSelected && styles.selectedDayContainer,
            isToday && styles.todayContainer,
          ]}
          onPress={() => handleDatePress(day)}
          disabled={isPast}
        >
          <View
            style={[
              styles.day,
              isSelected && styles.selectedDay,
              isToday && styles.today,
              isPast && styles.pastDay,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                isToday && styles.todayText,
                isPast && styles.pastDayText,
              ]}
            >
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderTimeSlots = () => {
    if (loadingHorarios) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando horarios...</Text>
        </View>
      );
    }

    if (medicoHorarios.length === 0) {
      return (
        <View style={styles.noSlotsContainer}>
          <Text style={styles.noSlotsText}>⚠️ Sin Horarios Disponibles</Text>
          <Text style={styles.noSlotsSubtext}>
            No se pudieron cargar los horarios del médico.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.timeSlotsContainer}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.timeSlotsContent}
      >
        {/* Grid de botones de horarios */}
        <View style={styles.timeGrid}>
          {medicoHorarios.map((time, index) => (
            <TouchableOpacity
              key={`${time}-${index}`}
              style={[
                styles.timeButton,
                selectedTime === time && styles.selectedTimeButton,
              ]}
              onPress={() => handleTimeSelect(time)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  selectedTime === time && styles.selectedTimeButtonText,
                ]}
              >
                {formatTime12Hour(time)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      {/* Modal debe estar fuera del contenedor principal */}

      {/* Selector de Mes */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthText}>{formatMonth(currentMonth)}</Text>

        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekDays}>
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendario */}
      <View style={styles.calendar}>{renderCalendar()}</View>

      {/* Fecha seleccionada */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            Fecha seleccionada:{" "}
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={styles.openModalButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.openModalButtonText}>
              🕐 Ver Horarios Disponibles ({medicoHorarios.length})
            </Text>
          </TouchableOpacity>

          {localCheckingAvailability && (
            <Text style={styles.checkingText}>
              Verificando disponibilidad...
            </Text>
          )}

          {localAvailability !== null && !localCheckingAvailability && (
            <Text
              style={[
                styles.availabilityText,
                { color: localAvailability ? colors.success : colors.error },
              ]}
            >
              {localAvailability
                ? "✓ Médico disponible"
                : "✗ Médico no disponible"}
            </Text>
          )}
        </View>
      )}

      {/* Modal de selección de hora */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              🕐 Selecciona una Hora -{" "}
              {tempDateTime?.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <Text style={styles.modalDate}>
              📅{" "}
              {tempDateTime?.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {renderTimeSlots()}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    navButton: {
      fontSize: 24,
      color: colors.primary,
      fontWeight: "bold",
      padding: 8,
    },
    monthText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textTransform: "capitalize",
    },
    weekDays: {
      flexDirection: "row",
      marginBottom: 8,
    },
    weekDayText: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "600",
      color: colors.gray,
    },
    calendar: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayContainer: {
      width: "14.28%", // 100% / 7 días
      aspectRatio: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    day: {
      width: 32,
      height: 32,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyDay: {
      width: 32,
      height: 32,
      borderRadius: 50,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    selectedDayContainer: {
      borderRadius: 50,
    },
    selectedDay: {
      backgroundColor: colors.primary,
      borderRadius: 50,
    },
    selectedDayText: {
      color: colors.white,
      fontWeight: "600",
    },
    todayContainer: {
      borderRadius: 50,
    },
    today: {
      backgroundColor: colors.accent,
      borderRadius: 50,
    },
    todayText: {
      color: colors.white,
      fontWeight: "600",
    },
    pastDay: {
      backgroundColor: colors.lightGray,
      borderRadius: 50,
    },
    pastDayText: {
      color: colors.gray,
    },
    selectedDateContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    selectedDateText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
      marginBottom: 4,
    },
    checkingText: {
      fontSize: 12,
      color: colors.primary,
      fontStyle: "italic",
    },
    availabilityText: {
      fontSize: 12,
      fontWeight: "600",
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999999,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: "96%",
      maxWidth: 450,
      maxHeight: "90%",
      minHeight: 400,
      elevation: 30,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 15,
      },
      shadowOpacity: 0.7,
      shadowRadius: 25,
      borderWidth: 2,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 12,
    },
    modalDate: {
      fontSize: 18,
      fontWeight: "500",
      color: colors.text,
      textAlign: "center",
      marginBottom: 16,
    },
    // Estilos de modalStatus eliminados - ya no se usa
    timeSlotsContainer: {
      flex: 1,
      maxHeight: 320,
      minHeight: 180,
    },
    timeSlotsContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    // Estilos de timeButtonsContainer y timeSlotsTitle eliminados - ya no se usa
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 8,
      gap: 8,
    },
    // Estilos de timeSlot eliminados - ya no se usa
    timeButton: {
      backgroundColor: colors.input || colors.surface,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 14,
      margin: 6,
      width: "48%",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      elevation: 4,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    selectedTimeButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      transform: [{ scale: 1.05 }],
      elevation: 6,
    },
    timeButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 18,
    },
    selectedTimeButtonText: {
      color: colors.white,
      fontWeight: "800",
    },
    loadingContainer: {
      padding: 20,
      alignItems: "center",
    },
    loadingText: {
      fontSize: 14,
      color: colors.primary,
      fontStyle: "italic",
    },
    noSlotsContainer: {
      padding: 20,
      alignItems: "center",
    },
    noSlotsText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    noSlotsSubtext: {
      fontSize: 12,
      color: colors.gray,
      textAlign: "center",
      marginTop: 8,
      opacity: 0.7,
    },
    closeButton: {
      marginTop: 24,
      padding: 18,
      backgroundColor: colors.error,
      borderRadius: 12,
      marginHorizontal: 12,
    },
    closeButtonText: {
      color: colors.white,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "600",
    },
    // Estilos del Picker eliminados - ya no se usa
    // Estilos de selectedTimeContainer eliminados - ya no se usa
    // Estilos de horariosIndicator eliminados - ya no se usa
    openModalButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
      elevation: 3,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    openModalButtonText: {
      color: colors.white,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
    },
    // Estilos de modalInfo eliminados - ya no se usa
  });

export default MiniCalendario;
