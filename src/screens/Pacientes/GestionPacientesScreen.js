import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import {
  getPacientes,
  updatePaciente,
  deletePaciente,
} from "../../api/pacientes";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";

const GestionPacientesScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const styles = createStyles(colors);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("todos");

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "superadmin") {
        loadPacientes();
      } else {
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
      }
    }, [user])
  );

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const response = await getPacientes();
      if (response.success) {
        setPacientes(response.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar los pacientes");
      }
    } catch (error) {
      console.error("Error loading pacientes:", error);
      Alert.alert("Error", "No se pudieron cargar los pacientes");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPacientes();
    setRefreshing(false);
  };

  const handleToggleEstado = async (pacienteId, currentEstado) => {
    const newEstado = currentEstado === "activo" ? "inactivo" : "activo";
    const actionText = newEstado === "activo" ? "activar" : "desactivar";

    Alert.alert(
      `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} paciente?`,
      `¿Estás seguro de que deseas ${actionText} este paciente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const response = await updatePaciente(pacienteId, {
                estado: newEstado,
              });
              if (response.success) {
                setPacientes((prev) =>
                  prev.map((paciente) =>
                    paciente.id === pacienteId
                      ? { ...paciente, estado: newEstado }
                      : paciente
                  )
                );
                Alert.alert(
                  "Éxito",
                  `Paciente ${
                    newEstado === "activo" ? "activado" : "desactivado"
                  } correctamente`
                );
              } else {
                Alert.alert(
                  "Error",
                  "No se pudo actualizar el estado del paciente"
                );
              }
            } catch (error) {
              console.error("Error updating paciente estado:", error);
              Alert.alert(
                "Error",
                "No se pudo actualizar el estado del paciente"
              );
            }
          },
        },
      ]
    );
  };

  const handleDeletePaciente = async (pacienteId) => {
    Alert.alert(
      "¿Eliminar paciente?",
      "Esta acción no se puede deshacer y puede afectar citas existentes",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deletePaciente(pacienteId);
              if (response.success) {
                setPacientes((prev) =>
                  prev.filter((paciente) => paciente.id !== pacienteId)
                );
                Alert.alert("Éxito", "Paciente eliminado correctamente");
              } else {
                Alert.alert("Error", "No se pudo eliminar el paciente");
              }
            } catch (error) {
              console.error("Error deleting paciente:", error);
              Alert.alert("Error", "No se pudo eliminar el paciente");
            }
          },
        },
      ]
    );
  };

  const filteredPacientes = (Array.isArray(pacientes) ? pacientes : []).filter(
    (paciente) => {
      const matchesSearch =
        paciente.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.apellido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paciente.cedula?.includes(searchQuery) ||
        paciente.telefono?.includes(searchQuery);

      const matchesEstado =
        selectedEstado === "todos" || paciente.estado === selectedEstado;

      return matchesSearch && matchesEstado;
    }
  );

  const getEstadoColor = (estado) => {
    return estado === "activo" ? colors.success : colors.error;
  };

  const getGeneroText = (genero) => {
    switch (genero) {
      case "M":
        return "Masculino";
      case "F":
        return "Femenino";
      case "O":
        return "Otro";
      default:
        return "No especificado";
    }
  };

  const renderPacienteItem = ({ item }) => (
    <View style={styles.pacienteCard}>
      <View style={styles.pacienteHeader}>
        <View style={styles.pacienteInfo}>
          <Text style={styles.pacienteName}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.pacienteEmail}>{item.email}</Text>
          <Text style={styles.pacienteCedula}>Cédula: {item.cedula}</Text>
          <Text style={styles.pacienteTelefono}>Tel: {item.telefono}</Text>

          <View style={styles.demografiaContainer}>
            <Text style={styles.demografiaText}>
              Género: {getGeneroText(item.genero)}
            </Text>
            <Text style={styles.demografiaText}>
              Edad: {item.edad ? `${item.edad} años` : "No especificada"}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Citas: {item.citas_count || 0}</Text>
            <Text style={styles.statsText}>
              Médicos: {item.medicos_count || 0}
            </Text>
          </View>
        </View>

        <View style={styles.estadoContainer}>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: getEstadoColor(item.estado) },
            ]}
          >
            <Text style={styles.estadoText}>
              {item.estado
                ? item.estado.charAt(0).toUpperCase() + item.estado.slice(1)
                : "Sin estado"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() =>
            navigation.navigate("PacienteDetailScreen", { pacienteId: item.id })
          }
        >
          <Text style={styles.viewButtonText}>Ver Detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            navigation.navigate("CrearPacienteScreen", { paciente: item })
          }
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            item.estado === "activo"
              ? styles.deactivateButton
              : styles.activateButton,
          ]}
          onPress={() => handleToggleEstado(item.id, item.estado)}
        >
          <Text style={styles.toggleButtonText}>
            {item.estado === "activo" ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePaciente(item.id)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery || selectedEstado !== "todos"
          ? "No se encontraron pacientes con los filtros aplicados"
          : "No hay pacientes registrados"}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando pacientes..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Pacientes</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email, cédula o teléfono..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros por estado */}
        <View style={styles.filtersContainer}>
          {["todos", "activo", "inactivo"].map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filterButton,
                selectedEstado === estado && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedEstado(estado)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedEstado === estado && styles.activeFilterButtonText,
                ]}
              >
                {estado === "todos"
                  ? "Todos"
                  : estado
                  ? estado.charAt(0).toUpperCase() + estado.slice(1)
                  : "Sin estado"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultsText}>
          {filteredPacientes.length} paciente
          {filteredPacientes.length !== 1 ? "s" : ""} encontrado
          {filteredPacientes.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Lista de pacientes */}
      <FlatList
        data={filteredPacientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPacienteItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          filteredPacientes.length === 0 ? styles.emptyList : null
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
      backgroundColor: colors.white,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 16,
      textAlign: "center",
    },
    searchContainer: {
      marginBottom: 12,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.white,
    },
    filtersContainer: {
      flexDirection: "row",
      marginBottom: 12,
      gap: 8,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.lightGray,
      alignItems: "center",
    },
    activeFilterButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 12,
      color: colors.gray,
      fontWeight: "500",
    },
    activeFilterButtonText: {
      color: colors.white,
    },
    resultsText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    pacienteCard: {
      backgroundColor: colors.white,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    pacienteHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    pacienteInfo: {
      flex: 1,
    },
    pacienteName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    pacienteEmail: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 2,
    },
    pacienteCedula: {
      fontSize: 12,
      color: colors.lightGray,
      marginBottom: 2,
    },
    pacienteTelefono: {
      fontSize: 12,
      color: colors.lightGray,
      marginBottom: 8,
    },
    demografiaContainer: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 8,
    },
    demografiaText: {
      fontSize: 12,
      color: colors.lightGray,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 16,
    },
    statsText: {
      fontSize: 12,
      color: colors.lightGray,
    },
    estadoContainer: {
      alignItems: "flex-end",
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
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: colors.lightGray,
      paddingTop: 12,
      gap: 4,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderRadius: 4,
      alignItems: "center",
    },
    viewButton: {
      backgroundColor: colors.info,
    },
    editButton: {
      backgroundColor: colors.primary,
    },
    activateButton: {
      backgroundColor: colors.success,
    },
    deactivateButton: {
      backgroundColor: colors.warning,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    viewButtonText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "600",
    },
    editButtonText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "600",
    },
    toggleButtonText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "600",
    },
    deleteButtonText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "600",
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

export default GestionPacientesScreen;
