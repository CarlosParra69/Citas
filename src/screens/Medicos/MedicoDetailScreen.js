import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from "react-native";
import { getMedicoById, getMedicoDisponibilidad } from "../../api/medicos";
import LoadingSpinner from "../../components/LoadingSpinner";
import ButtonPrimary from "../../components/ButtonPrimary";
import colors from "../../utils/colors";

const MedicoDetailScreen = ({ route, navigation }) => {
  const { medicoId, medicoNombre } = route.params;
  
  const [medico, setMedico] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMedicoData();
  }, [medicoId]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadMedicoData = async () => {
    try {
      setError(null);
      
      const medicoResponse = await getMedicoById(medicoId);
      
      if (medicoResponse.success) {
        setMedico(medicoResponse.data);
        
        // Cargar disponibilidad para hoy
        try {
          const today = new Date().toISOString().split('T')[0];
          const disponibilidadResponse = await getMedicoDisponibilidad(medicoId, today);
          if (disponibilidadResponse.success) {
            setDisponibilidad(disponibilidadResponse.data);
          }
        } catch (dispError) {
          console.log("No se pudo cargar disponibilidad:", dispError);
        }
      } else {
        throw new Error(medicoResponse.message || "Error al cargar información del médico");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading medico data:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicoData();
    setRefreshing(false);
  };

  const handleAgendarCita = () => {
    navigation.navigate("Citas", {
      screen: "CrearCitaScreen",
      params: { 
        preselectedEspecialidad: medico?.especialidad_id,
        preselectedMedico: medicoId 
      }
    });
  };

  const formatHorarios = (horarios) => {
    if (!horarios || typeof horarios !== 'object') return "No especificado";
    
    const diasSemana = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
      domingo: "Domingo"
    };
    
    return Object.entries(horarios)
      .filter(([dia, horario]) => horario && (horario.inicio || horario.fin))
      .map(([dia, horario]) => {
        const diaFormateado = diasSemana[dia] || dia;
        if (typeof horario === 'object' && horario.inicio && horario.fin) {
          return `${diaFormateado}: ${horario.inicio} - ${horario.fin}`;
        }
        return `${diaFormateado}: ${horario}`;
      })
      .join('\n') || "No especificado";
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando información del médico..." />;
  }

  if (!medico) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información del médico</Text>
        <ButtonPrimary
          title="Volver"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const nombreCompleto = medico.nombre_completo || `${medico.nombre} ${medico.apellido}`;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Información básica del médico */}
        <View style={styles.medicoCard}>
          <Text style={styles.medicoNombre}>{nombreCompleto}</Text>
          
          {medico.especialidad && (
            <Text style={styles.especialidad}>{medico.especialidad.nombre}</Text>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Registro Médico:</Text>
            <Text style={styles.value}>{medico.registro_medico || "No especificado"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{medico.telefono || "No especificado"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{medico.email || "No especificado"}</Text>
          </View>
          
          {medico.tarifa_consulta && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tarifa de Consulta:</Text>
              <Text style={[styles.value, styles.tarifa]}>
                ${medico.tarifa_consulta.toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: medico.activo ? colors.success : colors.gray }]} />
            <Text style={styles.statusText}>
              {medico.activo ? 'Médico Activo' : 'Médico Inactivo'}
            </Text>
          </View>
        </View>

        {/* Biografía */}
        {medico.biografia && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Biografía</Text>
            <Text style={styles.biografia}>{medico.biografia}</Text>
          </View>
        )}

        {/* Horarios de atención */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horarios de Atención</Text>
          <Text style={styles.horarios}>{formatHorarios(medico.horarios_atencion)}</Text>
        </View>

        {/* Disponibilidad de hoy */}
        {disponibilidad && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Disponibilidad Hoy</Text>
            <Text style={styles.disponibilidad}>
              {disponibilidad.disponible 
                ? "Disponible para citas" 
                : "No disponible hoy"
              }
            </Text>
          </View>
        )}

        {/* Botón para agendar cita */}
        {medico.activo && (
          <ButtonPrimary
            title="Agendar Cita con este Médico"
            onPress={handleAgendarCita}
            style={styles.agendarButton}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  medicoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicoNombre: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  especialidad: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: colors.gray,
    flex: 1,
    textAlign: "right",
  },
  tarifa: {
    color: colors.success,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  biografia: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  horarios: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  disponibilidad: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  agendarButton: {
    marginTop: 8,
    marginBottom: 20,
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

export default MedicoDetailScreen;
