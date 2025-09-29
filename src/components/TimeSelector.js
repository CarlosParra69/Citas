import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import {
  DateTimePickerAndroid,
  DateTimePickerIOS,
} from "@react-native-community/datetimepicker";
import { useThemeColors } from "../utils/themeColors";
import { formatDateTimeForAPI } from "../utils/formatDate";

// Componente para seleccionar hora de cita con interfaz tipo alarma
const TimeSelector = ({
  selectedDateTime,
  onDateTimeSelect,
  onAvailabilityCheck,
  isAvailable,
  checkingAvailability,
  colors,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const componentStyles = createTimeSelectorStyles(colors);

  const formatTime = (dateTime) => {
    if (!dateTime) return "Seleccionar hora";
    return dateTime.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleTimeSelect = (event, selectedTime) => {
    if (selectedTime) {
      // Obtener la hora en formato 24h para almacenamiento
      const hours24 = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();

      // Crear nueva fecha con la hora seleccionada
      const newDateTime = new Date();
      newDateTime.setHours(hours24, minutes, 0, 0);

      // Si es una fecha futura, mantener esa fecha, sino usar hoy
      if (selectedDateTime && selectedDateTime > new Date()) {
        newDateTime.setFullYear(
          selectedDateTime.getFullYear(),
          selectedDateTime.getMonth(),
          selectedDateTime.getDate()
        );
      }

      onDateTimeSelect(newDateTime);

      if (onAvailabilityCheck) {
        // Usar la función de utilidad para formatear la fecha correctamente
        const isoString = formatDateTimeForAPI(newDateTime);
        onAvailabilityCheck(isoString);
      }
    }

    if (Platform.OS === "ios") {
      setShowTimePicker(false);
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === "ios") {
      setShowTimePicker(true);
    } else {
      DateTimePickerAndroid.open({
        value: selectedDateTime || new Date(),
        onChange: handleTimeSelect,
        mode: "time",
        is24Hour: false,
        display: "clock", // Mostrar como reloj en Android
      });
    }
  };

  const getTimeStatusColor = () => {
    if (checkingAvailability) return colors.primary;
    if (isAvailable === true) return colors.success;
    if (isAvailable === false) return colors.error;
    return colors.text;
  };

  const getTimeStatusText = () => {
    if (checkingAvailability) return "Verificando disponibilidad...";
    if (isAvailable === true) return "✓ Médico disponible";
    if (isAvailable === false) return "✗ Médico no disponible";
    return "";
  };

  return (
    <View style={componentStyles.container}>
      <TouchableOpacity
        style={componentStyles.timeButton}
        onPress={openTimePicker}
      >
        <Text style={componentStyles.timeButtonIcon}>🕐</Text>
        <Text style={componentStyles.timeButtonText}>
          {formatTime(selectedDateTime)}
        </Text>
      </TouchableOpacity>

      {selectedDateTime && (
        <View style={componentStyles.statusContainer}>
          <Text
            style={[
              componentStyles.statusText,
              { color: getTimeStatusColor() },
            ]}
          >
            {getTimeStatusText()}
          </Text>
        </View>
      )}

      {showTimePicker && Platform.OS === "ios" && (
        <DateTimePickerIOS
          value={selectedDateTime || new Date()}
          mode="time"
          is24Hour={false}
          onChange={handleTimeSelect}
          textColor={colors.primary}
          accentColor={colors.primary}
        />
      )}
    </View>
  );
};

// Componente para seleccionar fecha
const DateSelector = ({ selectedDate, onDateSelect, colors }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const componentStyles = createDateSelectorStyles(colors);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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
        <View key={`empty-${i}`} style={componentStyles.dayContainer}>
          <View style={componentStyles.emptyDay} />
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
            componentStyles.dayContainer,
            isSelected && componentStyles.selectedDayContainer,
            isToday && componentStyles.todayContainer,
          ]}
          onPress={() => handleDatePress(day)}
          disabled={isPast}
        >
          <View
            style={[
              componentStyles.day,
              isSelected && componentStyles.selectedDay,
              isToday && componentStyles.today,
              isPast && componentStyles.pastDay,
            ]}
          >
            <Text
              style={[
                componentStyles.dayText,
                isSelected && componentStyles.selectedDayText,
                isToday && componentStyles.todayText,
                isPast && componentStyles.pastDayText,
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

  return (
    <View style={componentStyles.container}>
      {/* Selector de Mes */}
      <View style={componentStyles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={componentStyles.navButton}>‹</Text>
        </TouchableOpacity>

        <Text style={componentStyles.monthText}>
          {formatMonth(currentMonth)}
        </Text>

        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={componentStyles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={componentStyles.weekDays}>
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <Text key={day} style={componentStyles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendario */}
      <View style={componentStyles.calendar}>{renderCalendar()}</View>

      {/* Fecha seleccionada */}
      {selectedDate && (
        <View style={componentStyles.selectedDateContainer}>
          <Text style={componentStyles.selectedDateText}>
            Fecha: {selectedDate.toLocaleDateString("es-ES")}
          </Text>
        </View>
      )}
    </View>
  );
};

// Componente principal que combina fecha y hora
const CitaTimeSelector = ({
  selectedDateTime,
  onDateTimeSelect,
  onAvailabilityCheck,
  isAvailable,
  checkingAvailability,
}) => {
  const colors = useThemeColors();

  const handleDateSelect = (date) => {
    // Si ya hay una fecha y hora seleccionada, mantener la hora
    if (selectedDateTime) {
      const newDateTime = new Date(date);
      newDateTime.setHours(
        selectedDateTime.getHours(),
        selectedDateTime.getMinutes(),
        0,
        0
      );
      onDateTimeSelect(newDateTime);
    } else {
      onDateTimeSelect(date);
    }
  };

  const selectedDate = selectedDateTime ? new Date(selectedDateTime) : null;

  return (
    <View>
      <DateSelector
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        colors={colors}
      />

      {selectedDate && (
        <TimeSelector
          selectedDateTime={selectedDateTime}
          onDateTimeSelect={onDateTimeSelect}
          onAvailabilityCheck={onAvailabilityCheck}
          isAvailable={isAvailable}
          checkingAvailability={checkingAvailability}
          colors={colors}
        />
      )}
    </View>
  );
};

// Estilos para TimeSelector
const createTimeSelectorStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 2,
      borderColor: colors.primary + "E0", // 50% opacity
    },
    timeButtonIcon: {
      fontSize: 24,
    },
    timeButtonText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.white,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    statusContainer: {
      marginTop: 12,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.lightGray + "40",
    },
    statusText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
  });

// Estilos para DateSelector
const createDateSelectorStyles = (colors) =>
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
      textAlign: "center",
    },
  });

export default CitaTimeSelector;
