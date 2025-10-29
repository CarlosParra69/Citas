import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { getPacientes } from "../../api/pacientes";
import LoadingSpinner from "../../components/LoadingSpinner";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";
import { useFocusEffect } from "@react-navigation/native";

const PacientesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Actualizar automáticamente cuando la pantalla gane el foco
  useFocusEffect(
    useCallback(() => {
      loadPacientes();
    }, [])
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    filterPacientes();
  }, [searchText, pacientes]);

  const loadPacientes = async () => {
    try {
      setError(null);
      const response = await getPacientes();

      if (response.data?.success) {
        // La API devuelve datos paginados de Laravel
        // response.data es el objeto de respuesta, response.data.data es el objeto paginado
        // response.data.data.data es el array de pacientes
        const pacientesData = response.data?.data?.data || [];
        setPacientes(pacientesData);
      } else {
        throw new Error(response.data?.message || "Error al cargar pacientes");
      }
    } catch (err) {
      let errorMessage = "Error al cargar pacientes";

      if (err.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicie sesión nuevamente.";
      } else if (err.response?.status === 403) {
        errorMessage = "No tiene permisos para ver los pacientes.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Error del servidor. Inténtelo más tarde.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Tiempo de espera agotado. Verifique su conexión.";
      } else if (!err.response) {
        errorMessage = "Error de conexión. Verifique su conexión a internet.";
      } else {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      }

      setError(errorMessage);
      console.error("Error loading pacientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterPacientes = () => {
    const pacientesArray = Array.isArray(pacientes) ? pacientes : [];

    if (!searchText.trim()) {
      setFilteredPacientes(pacientesArray);
      return;
    }

    const filtered = pacientesArray.filter((paciente) => {
      const searchLower = searchText.toLowerCase();
      const nombreCompleto =
        `${paciente.nombre} ${paciente.apellido}`.toLowerCase();
      const cedula = paciente.cedula?.toString() || "";

      return (
        nombreCompleto.includes(searchLower) || cedula.includes(searchText)
      );
    });

    setFilteredPacientes(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPacientes();
    setRefreshing(false);
  };

  const handlePacientePress = (paciente) => {
    navigation.navigate("PacienteDetailScreen", {
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
    });
  };

  const handleCrearPaciente = () => {
    navigation.navigate("CrearPacienteScreen");
  };

  const renderPaciente = ({ item }) => {
    const nombreCompleto = `${item.nombre} ${item.apellido}`;
    const edad = item.fecha_nacimiento
      ? new Date().getFullYear() - new Date(item.fecha_nacimiento).getFullYear()
      : "No especificada";

    return (
      <CardItem
        title={nombreCompleto}
        subtitle={`Cédula: ${item.cedula} • Edad: ${edad}`}
        description={item.email || "Email no especificado"}
        onPress={() => handlePacientePress(item)}
        rightContent={
          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>
              {item.genero === "M" ? "♂" : item.genero === "F" ? "♀" : "?"}
            </Text>
          </View>
        }
      />
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando pacientes..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes</Text>
      <Text style={styles.subtitle}>
        Gestiona la información de los pacientes
      </Text>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o cédula..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.gray}
        />
      </View>

      {/* Botón para crear paciente */}
      <View style={styles.createButtonContainer}>
        <ButtonPrimary
          title="+ Crear Paciente"
          onPress={handleCrearPaciente}
          style={styles.createButton}
        />
      </View>

      {!filteredPacientes || filteredPacientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText
              ? "No se encontraron pacientes"
              : "No hay pacientes registrados"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchText
              ? "Intenta con otro término de búsqueda"
              : "Crea el primer paciente para comenzar"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPacientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPaciente}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// Create styles function that uses theme colors
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
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 20,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: colors.input || colors.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    createButtonContainer: {
      marginBottom: 16,
      alignItems: "center",
    },
    createButton: {
      minWidth: 150,
      backgroundColor: colors.primary,
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
    genderBadge: {
      backgroundColor: colors.lightGray,
      borderRadius: 20,
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    genderText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: "bold",
    },
  });

export default PacientesScreen;
