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
import { getCitas, deleteCita, updateCitaEstado } from "../../api/citas";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";
import { formatDate } from "../../utils/formatDate";

const GestionCitasScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const styles = createStyles(colors);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("todos");

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "superadmin") {
        loadCitas();
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

  const loadCitas = async () => {
    try {
      setLoading(true);
      const response = await getCitas();
      if (response.success) {
        setCitas(response.data.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar las citas");
      }
    } catch (error) {
      console.error("Error loading citas:", error);
      Alert.alert("Error", "No se pudieron cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitas();
    setRefreshing(false);
  };

  const handleDeleteCita = async (citaId) => {
    Alert.alert("¿Eliminar cita?", "Esta acción no se puede deshacer", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteCita(citaId);
            if (response.success) {
              setCitas((prev) => prev.filter((cita) => cita.id !== citaId));
              Alert.alert("Éxito", "Cita eliminada correctamente");
            } else {
              Alert.alert("Error", "No se pudo eliminar la cita");
            }
          } catch (error) {
            console.error("Error deleting cita:", error);
            Alert.alert("Error", "No se pudo eliminar la cita");
          }
        },
      },
    ]);
  };

  const handleChangeEstado = async (citaId, newEstado) => {
    try {
      const response = await updateCitaEstado(citaId, newEstado);
      if (response.success) {
        setCitas((prev) =>
          prev.map((cita) =>
            cita.id === citaId ? { ...cita, estado: newEstado } : cita
          )
        );
        Alert.alert("Éxito", "Estado de la cita actualizado");
      } else {
        Alert.alert("Error", "No se pudo actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating cita estado:", error);
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "programada":
        return colors.primary;
      case "confirmada":
        return colors.success;
      case "en_curso":
        return colors.warning;
      case "completada":
        return colors.info;
      case "cancelada":
        return colors.error;
      case "no_asistio":
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const filteredCitas = citas.filter((cita) => {
    const matchesSearch =
      cita.paciente?.nombre
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cita.paciente?.apellido
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cita.medico?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cita.medico?.apellido
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cita.motivo_consulta?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEstado =
      selectedEstado === "todos" || cita.estado === selectedEstado;

    return matchesSearch && matchesEstado;
  });

  const renderCitaItem = ({ item }) => (
    <View style={styles.citaCard}>
      <View style={styles.citaHeader}>
        <View style={styles.citaInfo}>
          <Text style={styles.pacienteName}>
            {item.paciente?.nombre} {item.paciente?.apellido}
          </Text>
          <Text style={styles.medicoName}>
            Dr. {item.medico?.nombre} {item.medico?.apellido}
          </Text>
          <Text style={styles.fechaHora}>{formatDate(item.fecha_hora)}</Text>
          <Text style={styles.motivo}>{item.motivo_consulta}</Text>
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
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            navigation.navigate("DetalleCitaScreen", { citaId: item.id })
          }
        >
          <Text style={styles.editButtonText}>Ver Detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCita(item.id)}
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
          ? "No se encontraron citas con los filtros aplicados"
          : "No hay citas registradas"}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando citas..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Citas</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por paciente, médico o motivo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros por estado */}
        <View style={styles.filtersContainer}>
          {[
            "todos",
            "programada",
            "confirmada",
            "en_curso",
            "completada",
            "cancelada",
            "no_asistio",
          ].map((estado) => (
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
                  ? "Todas"
                  : estado
                  ? estado.charAt(0).toUpperCase() +
                    estado.slice(1).replace("_", " ")
                  : "Sin estado"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultsText}>
          {filteredCitas.length} cita{filteredCitas.length !== 1 ? "s" : ""}{" "}
          encontrada
          {filteredCitas.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Lista de citas */}
      <FlatList
        data={filteredCitas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCitaItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          filteredCitas.length === 0 ? styles.emptyList : null
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
      flexWrap: "wrap",
      marginBottom: 12,
      gap: 6,
    },
    filterButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
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
      fontSize: 11,
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
    pacienteName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    medicoName: {
      fontSize: 14,
      color: colors.primary,
      marginBottom: 2,
    },
    fechaHora: {
      fontSize: 12,
      color: colors.gray,
      marginBottom: 2,
    },
    motivo: {
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
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    editButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    editButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "600",
    },
    deleteButtonText: {
      color: colors.white,
      fontSize: 12,
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

export default GestionCitasScreen;
