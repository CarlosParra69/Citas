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
import { Ionicons } from "@expo/vector-icons";
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
  // ELIMINAR lastTimeSelected para simplificar

  // Sincronizar tempDateTime con selectedDate
  useEffect(() => {
    if (selectedDate && (!tempDateTime || selectedDate.getTime() !== tempDateTime.getTime())) {
      setTempDateTime(selectedDate);
    }
  }, [selectedDate]);

  // Cargar horarios disponibles del médico cuando cambie la fecha o el médico
  useEffect(() => {
    const dateString = tempDateTime
      ? tempDateTime.toLocaleDateString("en-CA")
      : null;

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

  const loadMedicoHorarios = async () => {
    if (!medicoId) return;

    try {
      setLoadingHorarios(true);
      const fechaFormateada = tempDateTime.toLocaleDateString("en-CA");

      const response = await getMedicoDisponibilidad(medicoId, fechaFormateada);

      if (response && response.success) {
        let horariosAtencion;
        try {
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

        if (!horariosAtencion) {
          const horariosPorDefecto = generarHorasPorDefecto();
          setMedicoHorarios(horariosPorDefecto);
          return;
        }

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

  const generarHorasDisponibles = (horariosAtencion) => {
    if (!horariosAtencion) return [];

    const horasDisponibles = [];
    const diaSemana = tempDateTime
      .toLocaleDateString("es-ES", { weekday: "long" })
      .toLowerCase();

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
    if (!diaEspanol) return [];

    const horariosDelDia = horariosAtencion[diaEspanol];

    if (
      !horariosDelDia ||
      !Array.isArray(horariosDelDia) ||
      horariosDelDia.length === 0
    ) {
      return generarHorasPorDefecto();
    }

    horariosDelDia.forEach((rangoHorario) => {
      let horaInicio, horaFin;

      if (
        typeof rangoHorario === "object" &&
        rangoHorario.inicio &&
        rangoHorario.fin
      ) {
        horaInicio = rangoHorario.inicio;
        horaFin = rangoHorario.fin;
      } else if (typeof rangoHorario === "string") {
        const [inicio, fin] = rangoHorario.split("-");
        horaInicio = inicio;
        horaFin = fin;
      } else {
        return;
      }

      if (horaInicio && horaFin) {
        const [inicioHora, inicioMin] = horaInicio.split(":").map(Number);
        const [finHora, finMin] = horaFin.split(":").map(Number);

        if (
          isNaN(inicioHora) ||
          isNaN(inicioMin) ||
          isNaN(finHora) ||
          isNaN(finMin)
        ) {
          return;
        }

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

  const generarHorasPorDefecto = () => {
    const horasPorDefecto = [];
    const horaInicio = 8;
    const horaFin = 17;
    const intervalo = 30;

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
    console.log('MiniCalendario: handleDatePress ejecutado');
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      return;
    }

    setTempDateTime(newDate);

    if (medicoId) {
      loadMedicoHorarios()
        .then(() => {
          setShowTimePicker(true);
        })
        .catch((error) => {
          setShowTimePicker(true);
        });
    } else {
      onDateSelect(newDate);
    }
  };

  const handleTimeSelect = (time) => {
    
    setSelectedTime(time);
    const [hours, minutes] = time.split(":");

    if (!tempDateTime) {
      console.error("No hay fecha seleccionada");
      return;
    }

    const targetDate = new Date(
      tempDateTime.getFullYear(),
      tempDateTime.getMonth(),
      tempDateTime.getDate(),
      parseInt(hours),
      parseInt(minutes),
      0,
      0
    );

    
    onDateSelect(targetDate);

    
    if (onAvailabilityCheck) {
      const isoString = formatDateTimeForAPI(targetDate);
      onAvailabilityCheck(isoString);
    }

    
    setShowTimePicker(false);
  };

  const handleCloseModal = () => {
    setShowTimePicker(false);
    setSelectedTime("");
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

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayContainer}>
          <View style={styles.emptyDay} />
        </View>
      );
    }

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
          <Ionicons
            name="warning"
            size={24}
            color={colors.warning || colors.gray}
            style={styles.warningIcon}
          />
          <Text style={styles.noSlotsText}>Sin Horarios Disponibles</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthText}>{formatMonth(currentMonth)}</Text>

        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendar}>{renderCalendar()}</View>

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
            <Ionicons
              name="time"
              size={16}
              color={colors.white}
              style={styles.timeIcon}
            />
            <Text style={styles.openModalButtonText}>
              Ver Horarios Disponibles ({medicoHorarios.length})
            </Text>
          </TouchableOpacity>

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
              {isAvailable
                ? "✓ Médico disponible"
                : "✗ Médico no disponible"}
            </Text>
          )}
        </View>
      )}

      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleContainer}>
              <Ionicons
                name="time"
                size={20}
                color={colors.text}
                style={styles.timeIcon}
              />
              <Text style={styles.modalTitle}>
                Selecciona una Hora -{" "}
                {tempDateTime?.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.modalDateContainer}>
              <Ionicons
                name="calendar"
                size={20}
                color={colors.text}
                style={styles.calendarIcon}
              />
              <Text style={styles.modalDate}>
                {tempDateTime?.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

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
      width: "14.28%",
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
      backgroundColor: colors.success,
      borderRadius: 50,
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
    modalTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    timeIcon: {
      marginRight: 8,
    },
    modalDateContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    modalDate: {
      fontSize: 18,
      fontWeight: "500",
      color: colors.text,
      textAlign: "center",
    },
    calendarIcon: {
      marginRight: 8,
    },
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
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 8,
      gap: 8,
    },
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
    warningIcon: {
      marginBottom: 8,
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
  });

export default MiniCalendario;
