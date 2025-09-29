import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { useCitas } from "../../context/CitasContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { formatDate } from "../../utils/formatDate";

const MiAgendaScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { user } = useAuthContext();
  const { fetchCitasMedico, citasMedico, loading } = useCitas();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day"); // 'day', 'week', 'month'
  const [agendaData, setAgendaData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadAgendaData();
      }
    }, [user, selectedDate, viewMode])
  );

  const loadAgendaData = async () => {
    if (!user?.id) return;

    try {
      await fetchCitasMedico(user.id);
      // Filtrar y organizar citas según la vista seleccionada
      organizeAgendaData();
    } catch (error) {
      console.error("Error loading agenda:", error);
      Alert.alert("Error", "No se pudo cargar la agenda");
    }
  };

  const organizeAgendaData = () => {
    if (!citasMedico) return;

    let filteredCitas = [];

    switch (viewMode) {
      case "day":
        filteredCitas = citasMedico.filter((cita) => {
          const citaDate = new Date(cita.fecha_hora).toDateString();
          return citaDate === selectedDate.toDateString();
        });
        break;
      case "week":
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        filteredCitas = citasMedico.filter((cita) => {
          const citaDate = new Date(cita.fecha_hora);
          return citaDate >= weekStart && citaDate <= weekEnd;
        });
        break;
      case "month":
        const monthStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        const monthEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        );

        filteredCitas = citasMedico.filter((cita) => {
          const citaDate = new Date(cita.fecha_hora);
          return citaDate >= monthStart && citaDate <= monthEnd;
        });
        break;
    }

    // Ordenar por hora
    filteredCitas.sort(
      (a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora)
    );
    setAgendaData(filteredCitas);
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "programada":
        return colors.info;
      case "confirmada":
        return colors.success;
      case "en_curso":
        return colors.warning;
      case "completada":
        return colors.primary;
      case "cancelada":
        return colors.error;
      case "no_asistio":
        return colors.gray;
      case "pendiente":
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  const formatAppointmentTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const navigateToDetalleCita = (citaId) => {
    navigation.navigate("DetalleCitaScreen", { citaId });
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentItem}
      onPress={() => navigateToDetalleCita(item.id)}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatAppointmentTime(item.fecha_hora)}
        </Text>
      </View>

      <View style={styles.appointmentContent}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.paciente?.nombre} {item.paciente?.apellido}
          </Text>
          <Text style={styles.appointmentReason}>
            {item.motivo_consulta || "Sin motivo especificado"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getEstadoColor(item.estado) },
          ]}
        >
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {viewMode === "day"
          ? "No hay citas programadas para este día"
          : viewMode === "week"
          ? "No hay citas programadas para esta semana"
          : "No hay citas programadas para este mes"}
      </Text>
    </View>
  );

  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);

    switch (viewMode) {
      case "day":
        newDate.setDate(selectedDate.getDate() + direction);
        break;
      case "week":
        newDate.setDate(selectedDate.getDate() + direction * 7);
        break;
      case "month":
        newDate.setMonth(selectedDate.getMonth() + direction);
        break;
    }

    setSelectedDate(newDate);
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case "day":
        return selectedDate.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "month":
        return selectedDate.toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        });
      default:
        return "";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando agenda..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con navegación de fecha */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeDate(-1)}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{getDateRangeText()}</Text>
          <Text style={styles.appointmentsCount}>
            {agendaData.length} cita{agendaData.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeDate(1)}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de vista */}
      <View style={styles.viewSelector}>
        {["day", "week", "month"].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewButton,
              viewMode === mode && styles.activeViewButton,
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text
              style={[
                styles.viewButtonText,
                viewMode === mode && styles.activeViewButtonText,
              ]}
            >
              {mode === "day" ? "Día" : mode === "week" ? "Semana" : "Mes"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de citas */}
      <FlatList
        data={agendaData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointmentItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          agendaData.length === 0 ? styles.emptyList : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    navButtonText: {
      fontSize: 20,
      color: colors.white,
      fontWeight: "bold",
    },
    dateContainer: {
      flex: 1,
      alignItems: "center",
    },
    dateText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    welcomeText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 24,
      textAlign: "center",
    },
    appointmentsCount: {
      fontSize: 12,
      color: colors.gray,
      marginTop: 2,
    },
    viewSelector: {
      flexDirection: "row",
      backgroundColor: colors.white,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 8,
      padding: 4,
    },
    viewButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 6,
    },
    activeViewButton: {
      backgroundColor: colors.primary,
    },
    viewButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.gray,
    },
    activeViewButtonText: {
      color: colors.white,
    },
    appointmentItem: {
      flexDirection: "row",
      backgroundColor: colors.card || colors.surface,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeContainer: {
      marginRight: 16,
      minWidth: 60,
    },
    timeText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    appointmentContent: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    appointmentReason: {
      fontSize: 14,
      color: colors.gray,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      color: colors.white,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
    },
    emptyList: {
      flexGrow: 1,
    },
  });

export default MiAgendaScreen;
