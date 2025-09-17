import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Text, RefreshControl, Alert } from "react-native";
import Loader from "../../components/Loader";
import ButtonPrimary from "../../components/ButtonPrimary";
import CardItem from "../../components/CardItem";
import { formatDate } from "../../utils/formatDate";
import { useCitas } from "../../context/CitasContext";
import colors from "../../utils/colors";

const CitasScreen = ({ navigation }) => {
  const { citas, loading, error, fetchCitas, clearError } = useCitas();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCitas();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error]);

  const loadCitas = async () => {
    try {
      await fetchCitas();
    } catch (err) {
      console.error("Error loading citas:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCitas();
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
    
    const estadoBadge = (
      <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(cita.estado) }]}>
        <Text style={styles.estadoText}>{cita.estado}</Text>
      </View>
    );

    return (
      <CardItem
        key={cita.id}
        title={medicoNombre}
        subtitle={formatDate(cita.fecha_hora)}
        onPress={() => navigation.navigate("DetalleCitaScreen", { citaId: cita.id })}
        rightContent={estadoBadge}
      />
    );
  };

  if (loading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Citas Médicas</Text>
      
      <View style={styles.buttonContainer}>
        <ButtonPrimary
          title="Nueva Cita"
          onPress={() => navigation.navigate("CrearCitaScreen")}
        />
        <ButtonPrimary
          title="Citas de Hoy"
          onPress={() => navigation.navigate("CitasHoyScreen")}
          style={styles.secondaryButton}
        />
      </View>
      
      {!citas || citas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes citas programadas</Text>
          <Text style={styles.emptySubtext}>Presiona "Nueva Cita" para agendar una</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.citasList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {citas.map(renderCita)}
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
    marginBottom: 16,
    textAlign: "center",
  },
  citasList: {
    marginTop: 16,
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
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
});

export default CitasScreen;
