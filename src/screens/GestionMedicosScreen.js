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
import { useAuthContext } from "../context/AuthContext";
import { getMedicos, updateMedico, deleteMedico } from "../api/medicos";
import LoadingSpinner from "../components/LoadingSpinner";
import { useThemeColors } from "../utils/themeColors";
import { useGlobalStyles } from "../styles/globalStyles";

const GestionMedicosScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const styles = createStyles(colors);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("todos");

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "superadmin") {
        loadMedicos();
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

  const loadMedicos = async () => {
    try {
      setLoading(true);
      const response = await getMedicos();
      if (response.success) {
        setMedicos(response.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar los médicos");
      }
    } catch (error) {
      console.error("Error loading medicos:", error);
      Alert.alert("Error", "No se pudieron cargar los médicos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicos();
    setRefreshing(false);
  };

  const handleToggleEstado = async (medicoId, currentEstado) => {
    const newEstado = currentEstado === "activo" ? "inactivo" : "activo";
    const actionText = newEstado === "activo" ? "activar" : "desactivar";

    Alert.alert(
      `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} médico?`,
      `¿Estás seguro de que deseas ${actionText} este médico?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const response = await updateMedico(medicoId, {
                estado: newEstado,
              });
              if (response.success) {
                setMedicos((prev) =>
                  prev.map((medico) =>
                    medico.id === medicoId
                      ? { ...medico, estado: newEstado }
                      : medico
                  )
                );
                Alert.alert(
                  "Éxito",
                  `Médico ${
                    newEstado === "activo" ? "activado" : "desactivado"
                  } correctamente`
                );
              } else {
                Alert.alert(
                  "Error",
                  "No se pudo actualizar el estado del médico"
                );
              }
            } catch (error) {
              console.error("Error updating medico estado:", error);
              Alert.alert(
                "Error",
                "No se pudo actualizar el estado del médico"
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteMedico = async (medicoId) => {
    Alert.alert(
      "¿Eliminar médico?",
      "Esta acción no se puede deshacer y puede afectar citas existentes",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteMedico(medicoId);
              if (response.success) {
                setMedicos((prev) =>
                  prev.filter((medico) => medico.id !== medicoId)
                );
                Alert.alert("Éxito", "Médico eliminado correctamente");
              } else {
                Alert.alert("Error", "No se pudo eliminar el médico");
              }
            } catch (error) {
              console.error("Error deleting medico:", error);
              Alert.alert("Error", "No se pudo eliminar el médico");
            }
          },
        },
      ]
    );
  };

  const filteredMedicos = (Array.isArray(medicos) ? medicos : []).filter(
    (medico) => {
      const matchesSearch =
        medico.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medico.apellido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medico.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medico.especialidades?.some((esp) =>
          esp.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesEstado =
        selectedEstado === "todos" || medico.estado === selectedEstado;

      return matchesSearch && matchesEstado;
    }
  );

  const getEstadoColor = (estado) => {
    return estado === "activo" ? colors.success : colors.error;
  };

  const renderMedicoItem = ({ item }) => (
    <View style={styles.medicoCard}>
      <View style={styles.medicoHeader}>
        <View style={styles.medicoInfo}>
          <Text style={styles.medicoName}>
            Dr. {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.medicoEmail}>{item.email}</Text>
          <Text style={styles.medicoTelefono}>{item.telefono}</Text>

          <View style={styles.especialidadesContainer}>
            {item.especialidades?.map((esp) => (
              <View key={esp.id} style={styles.especialidadBadge}>
                <Text style={styles.especialidadText}>{esp.nombre}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Citas: {item.citas_count || 0}</Text>
            <Text style={styles.statsText}>
              Pacientes: {item.pacientes_count || 0}
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
              {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() =>
            navigation.navigate("MedicoDetailScreen", { medicoId: item.id })
          }
        >
          <Text style={styles.viewButtonText}>Ver Detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            navigation.navigate("CrearMedicoScreen", { medico: item })
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
          onPress={() => handleDeleteMedico(item.id)}
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
          ? "No se encontraron médicos con los filtros aplicados"
          : "No hay médicos registrados"}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando médicos..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Médicos</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o especialidad..."
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
                  : estado.charAt(0).toUpperCase() + estado.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultsText}>
          {filteredMedicos.length} médico
          {filteredMedicos.length !== 1 ? "s" : ""} encontrado
          {filteredMedicos.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Lista de médicos */}
      <FlatList
        data={filteredMedicos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMedicoItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          filteredMedicos.length === 0 ? styles.emptyList : null
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
    medicoCard: {
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
    medicoHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    medicoInfo: {
      flex: 1,
    },
    medicoName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    medicoEmail: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 2,
    },
    medicoTelefono: {
      fontSize: 12,
      color: colors.lightGray,
      marginBottom: 8,
    },
    especialidadesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: 8,
    },
    especialidadBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    especialidadText: {
      fontSize: 10,
      color: colors.white,
      fontWeight: "bold",
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

export default GestionMedicosScreen;
