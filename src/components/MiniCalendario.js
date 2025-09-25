import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { useThemeColors } from "../utils/themeColors";
import { getBaseURL } from "../config/api";

const MiniCalendario = ({
  selectedDate,
  onDateSelect,
  medicoId,
  onAvailabilityCheck,
  isAvailable,
  checkingAvailability,
}) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [medicoHorarios, setMedicoHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Obtener horarios del médico cuando cambia el médico
  useEffect(() => {
    if (medicoId) {
      loadMedicoHorarios();
    } else {
      setMedicoHorarios([]);
    }
  }, [medicoId]);

  const loadMedicoHorarios = async () => {
    if (!medicoId) return;

    try {
      setLoadingHorarios(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${getBaseURL()}/medicos/${medicoId}/disponibilidad?fecha=${today}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.horarios_atencion) {
          // Convertir los horarios del médico a slots de 30 minutos
          const horarios = data.data.horarios_atencion;
          const dayOfWeek = new Date().getDay();
          const days = [
            "domingo",
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
          ];
          const todayName = days[dayOfWeek];

          if (horarios[todayName]) {
            const timeSlots = generateTimeSlots(horarios[todayName]);
            setMedicoHorarios(timeSlots);
          }
        }
      }
    } catch (error) {
      console.error("Error loading medico horarios:", error);
      setMedicoHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  // Generar slots de tiempo de 30 minutos a partir de los horarios del médico
  const generateTimeSlots = (horarios) => {
    const slots = [];

    horarios.forEach((horario) => {
      const [startTime, endTime] = horario.split("-");
      if (startTime && endTime) {
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        let currentHour = startHour;
        let currentMin = startMin || 0;

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMin < endMin)
        ) {
          const timeString = `${currentHour
            .toString()
            .padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;
          slots.push(timeString);

          currentMin += 30;
          if (currentMin >= 60) {
            currentMin = 0;
            currentHour += 1;
          }
        }
      }
    });

    return slots;
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

    onDateSelect(selectedDate);
    setShowTimePicker(true);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(":");
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const isoString = dateTime.toISOString();
    onDateSelect(dateTime);

    if (onAvailabilityCheck) {
      onAvailabilityCheck(isoString);
    }

    setShowTimePicker(false);
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
    if (!selectedDate) return null;

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
          <Text style={styles.noSlotsText}>
            No hay horarios disponibles para este médico hoy
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.timeSlotsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timeSlotsTitle}>Horarios disponibles:</Text>
        <View style={styles.timeGrid}>
          {medicoHorarios.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.selectedTimeSlot,
              ]}
              onPress={() => handleTimeSelect(time)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.selectedTimeSlotText,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
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
            Fecha seleccionada: {selectedDate.toLocaleDateString("es-ES")}
            {selectedTime && ` a las ${selectedTime}`}
          </Text>

          {checkingAvailability && (
            <Text style={styles.checkingText}>
              Verificando disponibilidad...
            </Text>
          )}

          {isAvailable !== null && !checkingAvailability && (
            <Text
              style={[
                styles.availabilityText,
                { color: isAvailable ? colors.success : colors.error },
              ]}
            >
              {isAvailable ? "✓ Médico disponible" : "✗ Médico no disponible"}
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
              Seleccionar hora - {selectedDate?.toLocaleDateString("es-ES")}
            </Text>

            <View style={styles.timeSlotsContainer}>{renderTimeSlots()}</View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimePicker(false)}
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
      backgroundColor: colors.white,
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
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyDay: {
      width: 32,
      height: 32,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    selectedDayContainer: {
      backgroundColor: colors.primary + "20",
    },
    selectedDay: {
      backgroundColor: colors.primary,
    },
    selectedDayText: {
      color: colors.white,
      fontWeight: "600",
    },
    todayContainer: {
      backgroundColor: colors.accent + "20",
    },
    today: {
      backgroundColor: colors.accent,
    },
    todayText: {
      color: colors.white,
      fontWeight: "600",
    },
    pastDay: {
      backgroundColor: colors.lightGray,
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
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      width: "90%",
      maxHeight: "70%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 20,
    },
    timeSlotsContainer: {
      maxHeight: 350,
    },
    timeSlotsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    timeSlot: {
      width: "48%",
      padding: 12,
      marginVertical: 4,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    selectedTimeSlot: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timeSlotText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      fontWeight: "500",
    },
    selectedTimeSlotText: {
      color: colors.white,
      fontWeight: "600",
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
    closeButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.error,
      borderRadius: 8,
    },
    closeButtonText: {
      color: colors.white,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default MiniCalendario;
