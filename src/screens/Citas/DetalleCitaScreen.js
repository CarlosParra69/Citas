import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { getCitaById } from "../../api/citas";
import { useCitas } from "../../context/CitasContext";
import ButtonPrimary from "../../components/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import colors from "../../utils/colors";

const DetalleCitaScreen = ({ route, navigation }) => {
  const { citaId } = route.params;
  const { eliminarCita } = useCitas();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCitaDetail();
  }, [citaId]);

  const loadCitaDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCitaById(citaId);
      
      if (response.success) {
        setCita(response.data);
      } else {
        throw new Error(response.message || "Error al cargar la cita");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = () => {
    Alert.alert(
      "Cancelar Cita",
      "¿Estás seguro que deseas cancelar esta cita?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí, Cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarCita(citaId);
              Alert.alert(
                "Cita Cancelada",
                "La cita ha sido cancelada exitosamente",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la cita");
            }
          },
        },
      ]
    );
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

  const canCancelCita = () => {
    if (!cita) return false;
    const estadosPermitidos = ['programada', 'confirmada'];
    return estadosPermitidos.includes(cita.estado?.toLowerCase());
  };

  if (loading) {
    return <LoadingSpinner message="Cargando detalle de cita..." />;
  }

  if (error || !cita) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información de la cita</Text>
        <ButtonPrimary
          title="Volver"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Detalle de la Cita</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(cita.estado) }]}>
            <Text style={styles.estadoText}>{cita.estado}</Text>
          </View>
        </View>
        
        <View style={styles.separator} />
        
        <Text style={styles.label}>Médico:</Text>
        <Text style={styles.value}>
          {cita.medico 
            ? `Dr. ${cita.medico.nombre} ${cita.medico.apellido}`
            : "No asignado"
          }
        </Text>
        
        {cita.medico?.especialidad && (
          <>
            <Text style={styles.label}>Especialidad:</Text>
            <Text style={styles.value}>{cita.medico.especialidad.nombre}</Text>
          </>
        )}
        
        <Text style={styles.label}>Fecha y Hora:</Text>
        <Text style={styles.value}>{formatDate(cita.fecha_hora)}</Text>
        
        <Text style={styles.label}>Motivo de Consulta:</Text>
        <Text style={styles.value}>{cita.motivo_consulta || "No especificado"}</Text>
        
        {cita.observaciones && (
          <>
            <Text style={styles.label}>Observaciones:</Text>
            <Text style={styles.value}>{cita.observaciones}</Text>
          </>
        )}
        
        {cita.diagnostico && (
          <>
            <Text style={styles.label}>Diagnóstico:</Text>
            <Text style={styles.value}>{cita.diagnostico}</Text>
          </>
        )}
        
        {cita.tratamiento && (
          <>
            <Text style={styles.label}>Tratamiento:</Text>
            <Text style={styles.value}>{cita.tratamiento}</Text>
          </>
        )}
        
        {cita.costo && (
          <>
            <Text style={styles.label}>Costo:</Text>
            <Text style={styles.value}>${cita.costo.toLocaleString()}</Text>
          </>
        )}
        
        <Text style={styles.label}>Creada:</Text>
        <Text style={styles.value}>{formatDate(cita.created_at)}</Text>
      </View>
      
      {canCancelCita() && (
        <ButtonPrimary
          title="Cancelar Cita"
          onPress={handleCancelarCita}
          style={styles.cancelButton}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 8,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  estadoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
});

export default DetalleCitaScreen;
