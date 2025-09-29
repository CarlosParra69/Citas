import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { getPacienteHistorial } from "../../api/pacientes";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";
import { formatDate } from "../../utils/formatDate";

const HistorialMedicoScreen = ({ route, navigation }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const { pacienteId } = route.params || {};
  const { user } = useAuthContext();
  const styles = createStyles(colors);

  // Si no viene pacienteId en los params, usar el ID del paciente actual
  const targetPacienteId = pacienteId || user?.paciente_id || user?.id;

  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pacienteInfo, setPacienteInfo] = useState(null);
  const [filterEspecialidad, setFilterEspecialidad] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "medico") {
        // Los médicos necesitan un pacienteId específico
        if (targetPacienteId && targetPacienteId !== user?.id) {
          loadHistorialMedico();
        } else {
          Alert.alert(
            "Paciente requerido",
            "Selecciona un paciente para ver su historial médico",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else if (user?.rol === "paciente") {
        // Los pacientes pueden ver su propio historial
        if (targetPacienteId) {
          loadHistorialMedico();
        } else {
          Alert.alert(
            "Error",
            "No se pudo obtener tu información de paciente",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        Alert.alert(
          "Acceso Denegado",
          "No tienes permisos para acceder al historial médico",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }, [user, targetPacienteId])
  );

  const loadHistorialMedico = async () => {
    try {
      setLoading(true);
      // Cargar historial médico

      const response = await getPacienteHistorial(targetPacienteId);

      if (response.success) {
        console.log("✅ Historial médico cargado:", response);
        // El backend devuelve datos bajo la propiedad 'data'
        const historialData = response.data?.data || response.data || {};
        setHistorial(
          historialData.historial_citas || historialData.citas || []
        );
        setPacienteInfo(historialData.paciente);
      } else {
        Alert.alert("Error", "No se pudo cargar el historial médico");
      }
    } catch (error) {
      console.error("❌ Error loading historial medico:", error);
      Alert.alert("Error", "No se pudo cargar el historial médico");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistorialMedico();
    setRefreshing(false);
  };

  const filteredHistorial = historial.filter((cita) => {
    const matchesEspecialidad =
      filterEspecialidad === "todos" ||
      cita.especialidad?.id === parseInt(filterEspecialidad);

    const matchesEstado =
      filterEstado === "todos" || cita.estado === filterEstado;

    return matchesEspecialidad && matchesEstado;
  });

  // Ordenar por fecha descendente (más reciente primero)
  const sortedHistorial = filteredHistorial.sort(
    (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)
  );

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "completada":
        return colors.success;
      case "cancelada":
        return colors.error;
      case "no_asistio":
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  const getUniqueEspecialidades = () => {
    const especialidades = historial
      .map((cita) => cita.especialidad)
      .filter(
        (especialidad, index, self) =>
          especialidad &&
          self.findIndex((e) => e.id === especialidad.id) === index
      );
    return especialidades;
  };

  const renderCitaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.citaCard}
      onPress={() =>
        navigation.navigate("DetalleCitaScreen", { citaId: item.id })
      }
    >
      <View style={styles.citaHeader}>
        <View style={styles.citaInfo}>
          <Text style={styles.fechaText}>{formatDate(item.fecha_hora)}</Text>
          <Text style={styles.medicoText}>
            Dr. {item.medico?.nombre} {item.medico?.apellido}
          </Text>
        </View>

        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) },
          ]}
        >
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>

      <View style={styles.citaContent}>
        <Text style={styles.especialidadText}>
          {item.especialidad?.nombre || "Especialidad no especificada"}
        </Text>
        <Text style={styles.motivoText}>
          {item.motivo_consulta || "Motivo no especificado"}
        </Text>

        {item.observaciones && (
          <Text style={styles.observacionesText} numberOfLines={2}>
            {item.observaciones}
          </Text>
        )}

        {item.diagnostico && (
          <View style={styles.diagnosticoContainer}>
            <Text style={styles.diagnosticoLabel}>Diagnóstico:</Text>
            <Text style={styles.diagnosticoText} numberOfLines={2}>
              {item.diagnostico}
            </Text>
          </View>
        )}

        {item.tratamiento && (
          <View style={styles.tratamientoContainer}>
            <Text style={styles.tratamientoLabel}>Tratamiento:</Text>
            <Text style={styles.tratamientoText} numberOfLines={2}>
              {item.tratamiento}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {historial.length === 0
          ? "Este paciente no tiene historial médico registrado"
          : "No se encontraron citas con los filtros aplicados"}
      </Text>
    </View>
  );

  const renderFilters = () => {
    const especialidades = getUniqueEspecialidades();

    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtros:</Text>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Especialidad:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterEspecialidad === "todos" && styles.activeFilterOption,
              ]}
              onPress={() => setFilterEspecialidad("todos")}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterEspecialidad === "todos" &&
                    styles.activeFilterOptionText,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>

            {especialidades.map((especialidad) => (
              <TouchableOpacity
                key={especialidad.id}
                style={[
                  styles.filterOption,
                  filterEspecialidad === especialidad.id.toString() &&
                    styles.activeFilterOption,
                ]}
                onPress={() =>
                  setFilterEspecialidad(especialidad.id.toString())
                }
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterEspecialidad === especialidad.id.toString() &&
                      styles.activeFilterOptionText,
                  ]}
                >
                  {especialidad.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Estado:</Text>
          <View style={styles.filterOptions}>
            {["todos", "completada", "cancelada", "no_asistio"].map(
              (estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.filterOption,
                    filterEstado === estado && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilterEstado(estado)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterEstado === estado && styles.activeFilterOptionText,
                    ]}
                  >
                    {estado === "todos"
                      ? "Todos"
                      : estado
                      ? estado.charAt(0).toUpperCase() + estado.slice(1)
                      : "Sin estado"}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando historial médico..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con información del paciente */}
      {pacienteInfo && (
        <View style={styles.header}>
          <Text style={styles.title}>Historial Médico</Text>
          <Text style={styles.pacienteName}>
            {pacienteInfo.nombre} {pacienteInfo.apellido}
          </Text>
          <Text style={styles.pacienteInfo}>Cédula: {pacienteInfo.cedula}</Text>
        </View>
      )}

      {/* Filtros */}
      {renderFilters()}

      {/* Lista de citas */}
      <FlatList
        data={sortedHistorial}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCitaItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          sortedHistorial.length === 0 ? styles.emptyList : null
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
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    pacienteName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 4,
    },
    pacienteInfo: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    filtersContainer: {
      backgroundColor: colors.card || colors.surface,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
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
    filtersTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    filterRow: {
      marginBottom: 12,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    filterOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    filterOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input || colors.surface,
    },
    activeFilterOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterOptionText: {
      fontSize: 12,
      color: colors.gray,
    },
    activeFilterOptionText: {
      color: colors.white,
    },
    citaCard: {
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
    citaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    citaInfo: {
      flex: 1,
    },
    fechaText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 4,
    },
    medicoText: {
      fontSize: 14,
      color: colors.gray,
    },
    estadoBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    estadoText: {
      fontSize: 10,
      color: colors.white,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    citaContent: {
      borderTopWidth: 1,
      borderTopColor: colors.lightGray,
      paddingTop: 12,
    },
    especialidadText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    motivoText: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
      lineHeight: 20,
    },
    observacionesText: {
      fontSize: 14,
      color: colors.gray,
      fontStyle: "italic",
      marginBottom: 8,
    },
    diagnosticoContainer: {
      backgroundColor: colors.card || colors.surface,
      padding: 8,
      borderRadius: 6,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    diagnosticoLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    diagnosticoText: {
      fontSize: 14,
      color: colors.text,
    },
    tratamientoContainer: {
      backgroundColor: colors.card || colors.surface,
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tratamientoLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    tratamientoText: {
      fontSize: 14,
      color: colors.text,
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

export default HistorialMedicoScreen;
