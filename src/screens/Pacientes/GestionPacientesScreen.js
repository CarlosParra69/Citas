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
import ButtonPrimary from "../../components/ButtonPrimary";
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
    }, [user, selectedEstado])
  );

  const loadPacientes = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los pacientes sin filtros del backend para hacer filtrado en frontend
      const response = await getPacientes({});
      
      if (response.success && response.data) {
        // Manejar tanto array directo como paginación
        let pacientesData = [];
        
        if (Array.isArray(response.data)) {
          // Si response.data es un array directo
          pacientesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Si response.data es un objeto de paginación
          pacientesData = response.data.data;
        } else {
          console.warn("Estructura de datos inesperada:", response.data);
          pacientesData = [];
        }
        
        // Convertir activo (1/0) a boolean para consistencia
        const pacientesWithBooleanEstado = pacientesData.map(paciente => ({
          ...paciente,
          activo: paciente.activo === 1 || paciente.activo === true
        }));
        
        setPacientes(pacientesWithBooleanEstado);
      } else {
        console.error("Respuesta sin éxito:", response);
        setPacientes([]);
      }
    } catch (error) {
      console.error("Error loading pacientes:", error);
      Alert.alert("Error", `No se pudieron cargar los pacientes: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPacientes();
    setRefreshing(false);
  };

  const handleToggleEstado = async (pacienteId, currentActivo) => {
    const newActivo = !currentActivo;
    const actionText = newActivo ? "activar" : "desactivar";

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
                activo: newActivo ? 1 : 0,
              });
              
              if (response.data?.success) {
                // Recargar todos los pacientes para obtener datos actualizados
                await loadPacientes();
                
                Alert.alert(
                  "Éxito",
                  `Paciente ${
                    newActivo ? "activado" : "desactivado"
                  } correctamente`
                );
              } else {
                Alert.alert(
                  "Error",
                  `No se pudo actualizar el estado del paciente: ${response.data?.message || 'Error desconocido'}`
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                `No se pudo actualizar el estado del paciente: ${error.response?.data?.message || error.message || 'Error de conexión'}`
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
              Alert.alert("Error", "No se pudo eliminar el paciente");
            }
          },
        },
      ]
    );
  };

  const handleCreatePaciente = () => {
    navigation.navigate("CrearPacienteScreen");
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
        selectedEstado === "todos" ||
        (selectedEstado === "activo" && paciente.activo === true) ||
        (selectedEstado === "inactivo" && paciente.activo === false);

      return matchesSearch && matchesEstado;
    }
  );

  const getEstadoColor = (activo) => {
    return activo ? colors.success : colors.error;
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
              { backgroundColor: getEstadoColor(item.activo) },
            ]}
          >
            <Text style={styles.estadoText}>
              {item.activo ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() =>
            navigation.navigate("PacienteDetailScreen", {
              pacienteId: item.id,
              pacienteNombre: `${item.nombre} ${item.apellido}`
            })
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
            item.activo
              ? styles.deactivateButton
              : styles.activateButton,
          ]}
          onPress={() => handleToggleEstado(item.id, item.activo)}
        >
          <Text style={styles.toggleButtonText}>
            {item.activo ? "Desactivar" : "Activar"}
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
        <View style={styles.headerTop}>
          <Text style={styles.title}>Gestión de Pacientes</Text>
          <ButtonPrimary
            title="+ Crear Paciente"
            onPress={handleCreatePaciente}
            style={styles.createButton}
          />
        </View>

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
              onPress={() => {
                setSelectedEstado(estado);
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedEstado === estado && styles.activeFilterButtonText,
                ]}
              >
                {estado === "todos"
                  ? "Todos"
                  : estado === "activo"
                    ? "Activos"
                    : "Inactivos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statusInfo}>
          <Text style={styles.resultsText}>
            {filteredPacientes.length} paciente
            {filteredPacientes.length !== 1 ? "s" : ""} encontrado
            {filteredPacientes.length !== 1 ? "s" : ""}
          </Text>
        </View>
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
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
    },
    createButton: {
      backgroundColor: colors.primary,
      minWidth: 120,
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
    statusInfo: {
      marginTop: 8,
      paddingHorizontal: 8,
    },
    totalText: {
      fontSize: 12,
      color: colors.lightGray,
      textAlign: "center",
      marginTop: 4,
    },
  });

export default GestionPacientesScreen;
