import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { useCitas } from "../../context/CitasContext";
import CardItem from "../../components/CardItem";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatTime } from "../../utils/formatDate";
import colors from "../../utils/colors";

const CitasHoyScreen = ({ navigation }) => {
  const { citasHoy, loading, error, fetchCitasHoy, clearError } = useCitas();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCitasHoy();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error]);

  const loadCitasHoy = async () => {
    try {
      await fetchCitasHoy();
    } catch (err) {
      console.error("Error loading citas hoy:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitasHoy();
    setRefreshing(false);
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programada':
        return colors.info;
      case 'confirmada':
        return colors.success;
      case 'en_curso':
        return colors.warning;
      case 'completada':
        return colors.primary;
      case 'cancelada':
        return colors.danger;
      case 'no_asistio':
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  const renderCita = (cita) => {
    const medicoNombre = cita.medico 
      ? `Dr. ${cita.medico.nombre} ${cita.medico.apellido}`
      : "Médico no asignado";
    
    const hora = formatTime(cita.fecha_hora);
    
    const estadoBadge = (
      <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(cita.estado) }]}>
        <Text style={styles.estadoText}>{cita.estado}</Text>
      </View>
    );

    return (
      <CardItem
        key={cita.id}
        title={`${hora} - ${medicoNombre}`}
        subtitle={cita.motivo_consulta}
        onPress={() => navigation.navigate("DetalleCitaScreen", { citaId: cita.id })}
        rightContent={estadoBadge}
      />
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando citas de hoy..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas de Hoy</Text>
      <Text style={styles.subtitle}>
        {new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>
      
      {!citasHoy || citasHoy.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes citas para hoy</Text>
          <Text style={styles.emptySubtext}>¡Disfruta tu día libre!</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.citasList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {citasHoy.map(renderCita)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 20,
    textTransform: "capitalize",
  },
  citasList: {
    flex: 1,
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

export default CitasHoyScreen;
