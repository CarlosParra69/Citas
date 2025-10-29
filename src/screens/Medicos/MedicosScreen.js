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
import { getMedicos } from "../../api/medicos";
import LoadingSpinner from "../../components/LoadingSpinner";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";
import { useRoleBasedData } from "../../hooks/useRoleBasedData";
import { useFocusEffect } from "@react-navigation/native";

const MedicosScreen = ({ route, navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { especialidadId, especialidadNombre } = route.params || {};
  const { isSuperadmin } = useRoleBasedData();

  const [medicos, setMedicos] = useState([]);
  const [filteredMedicos, setFilteredMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Actualizar automáticamente cuando la pantalla gane el foco
  useFocusEffect(
    useCallback(() => {
      loadMedicos();
    }, [especialidadId])
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    filterMedicos();
  }, [searchText, medicos]);

  const loadMedicos = async () => {
    try {
      setError(null);
      const params = especialidadId ? { especialidad_id: especialidadId } : {};
      const response = await getMedicos(params);

      if (response.success) {
        const medicosData = response.data || [];
        setMedicos(medicosData);
      } else {
        throw new Error(response.message || "Error al cargar médicos");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading medicos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicos = () => {
    const medicosArray = Array.isArray(medicos) ? medicos : [];

    if (!searchText.trim()) {
      setFilteredMedicos(medicosArray);
      return;
    }

    const filtered = medicosArray.filter((medico) => {
      const searchLower = searchText.toLowerCase();
      const nombreCompleto =
        (medico.nombre_completo || `${medico.nombre} ${medico.apellido}`).toLowerCase();
      const registroMedico = medico.registro_medico?.toString() || "";

      return (
        nombreCompleto.includes(searchLower) ||
        registroMedico.includes(searchText)
      );
    });

    setFilteredMedicos(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicos();
    setRefreshing(false);
  };

  const handleMedicoPress = (medico) => {
    navigation.navigate("MedicoDetailScreen", {
      medicoId: medico.id,
      medicoNombre:
        medico.nombre_completo || `${medico.nombre} ${medico.apellido}`,
    });
  };

  const handleCreateMedico = () => {
    navigation.navigate("CrearMedicoScreen");
  };

  const renderMedico = ({ item }) => {
    const nombreCompleto =
      item.nombre_completo || `${item.nombre} ${item.apellido}`;
    const especialidadNombre =
      item.especialidad?.nombre || "Especialidad no especificada";
    const registroMedico = item.registro_medico
      ? `Reg: ${item.registro_medico}`
      : "";

    return (
      <CardItem
        title={nombreCompleto}
        subtitle={especialidadNombre}
        description={registroMedico}
        onPress={() => handleMedicoPress(item)}
        rightContent={
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.activo ? colors.success : colors.gray },
              ]}
            />
            <Text style={styles.statusText}>
              {item.activo ? "Activo" : "Inactivo"}
            </Text>
          </View>
        }
      />
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando médicos..." />;
  }

  const title = especialidadNombre
    ? `Médicos - ${especialidadNombre}`
    : "Nuestros Médicos";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {especialidadNombre
          ? `Médicos especializados en ${especialidadNombre.toLowerCase()}`
          : "Todos los médicos disponibles"}
      </Text>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o registro médico..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.gray}
        />
      </View>

      {/* Botón para crear médico - Solo visible para superadmin */}
      {isSuperadmin && (
        <View style={styles.createButtonContainer}>
          <ButtonPrimary
            title="+ Crear Médico"
            onPress={handleCreateMedico}
            style={styles.createButton}
          />
        </View>
      )}

      {!filteredMedicos || filteredMedicos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText
              ? "No se encontraron médicos"
              : "No hay médicos disponibles"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchText
              ? "Intenta con otro término de búsqueda"
              : especialidadNombre
                ? `No hay médicos disponibles para ${especialidadNombre}`
                : "No hay médicos registrados en el sistema"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedicos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMedico}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
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
      fontSize: 24,
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
    statusContainer: {
      alignItems: "center",
      gap: 4,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    statusText: {
      fontSize: 12,
      color: colors.gray,
      fontWeight: "500",
    },
  });

export default MedicosScreen;
