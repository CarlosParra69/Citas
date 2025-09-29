import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import { getEspecialidades } from "../../api/especialidades";
import LoadingSpinner from "../../components/LoadingSpinner";
import CardItem from "../../components/CardItem";
import { useThemeColors } from "../../utils/themeColors";

const EspecialidadesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEspecialidades();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadEspecialidades = async () => {
    try {
      setError(null);
      const response = await getEspecialidades();

      if (response.success) {
        const especialidadesData = response.data || [];
        setEspecialidades(especialidadesData);
      } else {
        throw new Error(response.message || "Error al cargar especialidades");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading especialidades:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEspecialidades();
    setRefreshing(false);
  };

  const handleEspecialidadPress = (especialidad) => {
    navigation.navigate("MedicosScreen", {
      especialidadId: especialidad.id,
      especialidadNombre: especialidad.nombre,
    });
  };

  const renderEspecialidad = ({ item }) => (
    <CardItem
      title={item.nombre}
      description={item.descripcion || "Especialidad médica disponible"}
      onPress={() => handleEspecialidadPress(item)}
      rightContent={
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.activo ? colors.success : colors.gray },
            ]}
          />
        </View>
      }
    />
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando especialidades..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especialidades Médicas</Text>
      <Text style={styles.subtitle}>
        Selecciona una especialidad para ver los médicos disponibles
      </Text>

      {!especialidades || especialidades.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay especialidades disponibles
          </Text>
          <Text style={styles.emptySubtext}>
            Contacta con el centro médico para más información
          </Text>
        </View>
      ) : (
        <FlatList
          data={especialidades}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEspecialidad}
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
    statusBadge: {
      alignItems: "center",
      justifyContent: "center",
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
  });

export default EspecialidadesScreen;
