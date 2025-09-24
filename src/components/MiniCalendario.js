import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useThemeColors } from "../utils/themeColors";

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

  // Generar horarios disponibles (8:00 AM - 6:00 PM)
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      timeSlots.push(timeString);
    }
  }

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

    return timeSlots.map((time) => (
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
    ));
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
      height: 300,
    },
    timeSlot: {
      padding: 12,
      marginVertical: 2,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedTimeSlot: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timeSlotText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
    },
    selectedTimeSlotText: {
      color: colors.white,
      fontWeight: "600",
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
