import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { CitasContext } from "../../context/CitasContext";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner";
import RejectionModal from "./RejectionModal";
import { useThemeColors } from "../../utils/themeColors";
import { formatDate, formatTime } from "../../utils/formatDate";

const CitasPendientesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { user } = useContext(AuthContext);
  const {
    loading,
    error,
    fetchCitasPendientes,
    aprobarCitaPendiente,
    rechazarCitaPendiente,
  } = useContext(CitasContext);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState(null);

  useEffect(() => {
    loadCitasPendientes();
  }, []);

  const loadCitasPendientes = async () => {
    try {
      const citas = await fetchCitasPendientes(user.medico_id);
      setCitasPendientes(citas || []);
    } catch (error) {
      console.error("Error loading pending appointments:", error);
      Alert.alert("Error", "No se pudieron cargar las citas pendientes");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitasPendientes();
    setRefreshing(false);
  };

  const handleApprove = async (citaId) => {
    Alert.alert(
      "Aprobar Cita",
      "¿Está seguro de que desea aprobar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          onPress: async () => {
            try {
              await aprobarCitaPendiente(citaId);
              Alert.alert("Éxito", "Cita aprobada correctamente");
              loadCitasPendientes(); // Recargar la lista
            } catch (error) {
              Alert.alert("Error", "No se pudo aprobar la cita");
            }
          },
        },
      ]
    );
  };

  const handleReject = (citaId) => {
    setSelectedCitaId(citaId);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCitaId(null);
  };

  const handleRejectionSuccess = () => {
    loadCitasPendientes();
  };

  const renderCitaItem = ({ item }) => (
    <CardItem style={styles.citaCard}>
      <View style={styles.citaHeader}>
        <Text style={styles.pacienteName}>
          {item.paciente?.nombre} {item.paciente?.apellido}
        </Text>
        <Text style={styles.citaDate}>
          {formatDate(item.fecha_hora)} - {formatTime(item.fecha_hora)}
        </Text>
      </View>

      <Text style={styles.motivoConsulta}>{item.motivo_consulta}</Text>

      {item.observaciones && (
        <Text style={styles.observaciones}>{item.observaciones}</Text>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectButtonText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.approveButtonText}>Aprobar</Text>
        </TouchableOpacity>
      </View>
    </CardItem>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas Pendientes</Text>

      {citasPendientes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No tienes citas pendientes de aprobación
          </Text>
        </View>
      ) : (
        <FlatList
          data={citasPendientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCitaItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <RejectionModal
        visible={modalVisible}
        onClose={handleModalClose}
        citaId={selectedCitaId}
        onReject={handleRejectionSuccess}
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
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 20,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    listContainer: {
      paddingBottom: 20,
    },
    citaCard: {
      marginBottom: 12,
    },
    citaHeader: {
      marginBottom: 8,
    },
    pacienteName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    citaDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    motivoConsulta: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    observaciones: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginBottom: 12,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    rejectButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    approveButton: {
      backgroundColor: colors.success,
    },
    approveButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

export default CitasPendientesScreen;
