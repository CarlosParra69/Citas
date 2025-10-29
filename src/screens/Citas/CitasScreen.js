import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Loader from "../../components/Loader";
import CardItem from "../../components/CardItem";
import { formatDate, formatCitaDateTime } from "../../utils/formatDate";
import { useCitas } from "../../context/CitasContext";
import { useThemeColors } from "../../utils/themeColors";
import { useAuthContext } from "../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const CitasScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuthContext();
  const { citas, loading, error, fetchCitas, clearError, clearCitas, forceCitas, forceLoading, fetchForceCitas, clearForceCitas } =
    useCitas();
  const [refreshing, setRefreshing] = useState(false);

  // Función para crear botones con iconos usando TouchableOpacity
  const renderButtonWithIcon = (title, onPress, iconName, style) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.actionButton, style]}
      >
        <View style={styles.buttonContent}>
          <Ionicons name={iconName} size={20} color={colors.white} />
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Actualizar automáticamente cuando la pantalla gane el foco
  useFocusEffect(
    useCallback(() => {
      // Limpiar citas anteriores para evitar mostrar datos de otros usuarios
      clearCitas();
      if (user?.rol === "superadmin") {
        clearForceCitas();
        loadForceCitas();
      } else {
        loadCitas();
      }
    }, [user]) // Solo dependemos del usuario
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error]);

  const loadCitas = async () => {
    try {
      // Para usuarios normales (medico, paciente), cargar sus citas filtradas
      if (user?.rol !== "superadmin") {
        await fetchCitas(user);
      }
    } catch (err) {
      console.error("Error loading citas:", err);
    }
  };

  const loadForceCitas = async () => {
    try {
      // Para superadministrador, cargar todas las citas del sistema
      await fetchForceCitas(user);
    } catch (err) {
      console.error("Error loading force citas:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.rol === "superadmin") {
      await loadForceCitas();
    } else {
      await loadCitas();
    }
    setRefreshing(false);
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
        return colors.danger;
      case "no_asistio":
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const renderCita = (cita) => {
    const medicoNombre = cita.medico
      ? `Dr. ${cita.medico.nombre} ${cita.medico.apellido}`
      : "Médico no asignado";

    const estadoBadge = (
      <View
        style={[
          styles.estadoBadge,
          { backgroundColor: getEstadoColor(cita.estado) },
        ]}
      >
        <Text style={styles.estadoText}>{cita.estado}</Text>
      </View>
    );

    return (
      <CardItem
        key={cita.id}
        title={medicoNombre}
        subtitle={formatCitaDateTime(cita.fecha_hora)}
        onPress={() =>
          navigation.navigate("DetalleCitaScreen", { citaId: cita.id })
        }
        rightContent={estadoBadge}
      />
    );
  };

  const displayLoading = (loading && !refreshing) || (forceLoading && user?.rol === "superadmin");
  if (displayLoading) return <Loader />;

  // Para superadministrador, usar citas forzadas
  const displayCitas = user?.rol === "superadmin" ? forceCitas : citas;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {user?.rol === "superadmin" ? "Gestión de Citas del Sistema" : "Mis Citas Médicas"}
      </Text>

      <View style={styles.buttonsGridContainer}>
        {user?.rol === "superadmin" && (
          <>
            <View style={styles.buttonRow}>
              {renderButtonWithIcon(
                "Citas de Hoy",
                () => navigation.navigate("CitasHoyScreen"),
                "calendar",
                styles.citasHoyButton
              )}
              {renderButtonWithIcon(
                "Citas por Aprobar",
                () => navigation.navigate("CitasPendientesScreen"),
                "time",
                styles.citasPendientesButton
              )}
            </View>
            <View style={styles.buttonRow}>
              {renderButtonWithIcon(
                "Nueva Cita",
                () => navigation.navigate("CrearCitaScreen"),
                "add-circle",
                styles.nuevaCitaButton
              )}
              {renderButtonWithIcon(
                "Confirmar Cita",
                () => navigation.navigate("ConfirmarCitaScreen"),
                "checkmark-circle",
                styles.confirmarCitaButton
              )}
            </View>
          </>
        )}
        {user?.rol === "medico" && (
          <>
            <View style={styles.buttonRow}>
              {renderButtonWithIcon(
                "Citas de Hoy",
                () => navigation.navigate("CitasHoyScreen"),
                "calendar",
                styles.citasHoyButton
              )}
              {renderButtonWithIcon(
                "Citas por Aprobar",
                () => navigation.navigate("CitasPendientesScreen"),
                "time",
                styles.citasPendientesButton
              )}
            </View>
          </>
        )}
        {user?.rol === "paciente" && (
          <>
            <View style={styles.buttonRow}>
              {renderButtonWithIcon(
                "Nueva Cita",
                () => navigation.navigate("CrearCitaScreen"),
                "add-circle",
                styles.nuevaCitaButton
              )}
              {renderButtonWithIcon(
                "Confirmar Cita",
                () => navigation.navigate("ConfirmarCitaScreen"),
                "checkmark-circle",
                styles.confirmarCitaButton
              )}
            </View>
          </>
        )}
      </View>

      {!displayCitas || displayCitas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {user?.rol === "superadmin"
              ? "No hay citas en el sistema"
              : "No tienes citas programadas"
            }
          </Text>
          {user?.rol !== "superadmin" && (
            <Text style={styles.emptySubtext}>
              Presiona "Nueva Cita" para agendar una
            </Text>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.citasList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {displayCitas.map(renderCita)}
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    buttonsGridContainer: {
      marginBottom: 20,
      gap: 12,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      minHeight: 60,
      borderRadius: 12,
      elevation: 2,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowColor: "#000",
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
    },
    citasHoyButton: {
      backgroundColor: colors.primary || "#FF6B35",
    },
    citasPendientesButton: {
      backgroundColor: colors.warning || "#FF9800",
    },
    nuevaCitaButton: {
      backgroundColor: colors.success || "#4CAF50",
    },
    confirmarCitaButton: {
      backgroundColor: colors.info || "#2196F3",
    },
    citasList: {
      marginTop: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    estadoBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 80,
      alignItems: "center",
    },
    estadoText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
  });

export default CitasScreen;
