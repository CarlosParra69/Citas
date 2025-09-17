import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from "react-native";
import { getPacienteById, getPacienteHistorial } from "../../api/pacientes";
import LoadingSpinner from "../../components/LoadingSpinner";
import ButtonPrimary from "../../components/ButtonPrimary";
import CardItem from "../../components/CardItem";
import colors from "../../utils/colors";
import { formatDateOnly } from "../../utils/formatDate";

const PacienteDetailScreen = ({ route, navigation }) => {
  const { pacienteId, pacienteNombre } = route.params;
  
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPacienteData();
  }, [pacienteId]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadPacienteData = async () => {
    try {
      setError(null);
      
      // Cargar datos del paciente y historial en paralelo
      const [pacienteResponse, historialResponse] = await Promise.all([
        getPacienteById(pacienteId),
        getPacienteHistorial(pacienteId).catch(() => ({ data: { success: false, data: [] } }))
      ]);
      
      if (pacienteResponse.data.success) {
        setPaciente(pacienteResponse.data.data);
      } else {
        throw new Error(pacienteResponse.data.message || "Error al cargar información del paciente");
      }

      if (historialResponse.data.success) {
        setHistorial(historialResponse.data.data || []);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading paciente data:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPacienteData();
    setRefreshing(false);
  };

  const handleAgendarCita = () => {
    navigation.navigate("Citas", {
      screen: "CrearCitaScreen",
      params: { preselectedPaciente: pacienteId }
    });
  };

  const handleEditarPaciente = () => {
    navigation.navigate("EditarPacienteScreen", { 
      pacienteId: pacienteId,
      pacienteData: paciente 
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "No especificada";
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return `${edad} años`;
  };

  const renderHistorialItem = ({ item }) => (
    <CardItem
      title={`Cita - ${formatDateOnly(item.fecha_hora)}`}
      subtitle={item.medico?.nombre_completo || "Médico no especificado"}
      description={item.diagnostico || item.motivo_consulta || "Sin diagnóstico"}
    />
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando información del paciente..." />;
  }

  if (!paciente) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información del paciente</Text>
        <ButtonPrimary
          title="Volver"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Información básica del paciente */}
        <View style={styles.pacienteCard}>
          <Text style={styles.pacienteNombre}>{nombreCompleto}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cédula:</Text>
            <Text style={styles.value}>{paciente.cedula}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{paciente.email || "No especificado"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{paciente.telefono || "No especificado"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{calcularEdad(paciente.fecha_nacimiento)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Género:</Text>
            <Text style={styles.value}>
              {paciente.genero === 'M' ? 'Masculino' : 
               paciente.genero === 'F' ? 'Femenino' : 'No especificado'}
            </Text>
          </View>
          
          {paciente.direccion && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{paciente.direccion}</Text>
            </View>
          )}
        </View>

        {/* Información médica */}
        {(paciente.tipo_sangre || paciente.alergias || paciente.enfermedades_cronicas) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Información Médica</Text>
            
            {paciente.tipo_sangre && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Tipo de Sangre:</Text>
                <Text style={[styles.value, styles.bloodType]}>{paciente.tipo_sangre}</Text>
              </View>
            )}
            
            {paciente.alergias && (
              <View style={styles.medicalInfo}>
                <Text style={styles.medicalLabel}>Alergias:</Text>
                <Text style={styles.medicalText}>{paciente.alergias}</Text>
              </View>
            )}
            
            {paciente.enfermedades_cronicas && (
              <View style={styles.medicalInfo}>
                <Text style={styles.medicalLabel}>Enfermedades Crónicas:</Text>
                <Text style={styles.medicalText}>{paciente.enfermedades_cronicas}</Text>
              </View>
            )}
          </View>
        )}

        {/* Contacto de emergencia */}
        {(paciente.contacto_emergencia_nombre || paciente.contacto_emergencia_telefono) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contacto de Emergencia</Text>
            
            {paciente.contacto_emergencia_nombre && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{paciente.contacto_emergencia_nombre}</Text>
              </View>
            )}
            
            {paciente.contacto_emergencia_telefono && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{paciente.contacto_emergencia_telefono}</Text>
              </View>
            )}
          </View>
        )}

        {/* Historial médico */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial Médico ({historial.length})</Text>
          
          {!historial || historial.length === 0 ? (
            <Text style={styles.emptyHistorial}>No hay historial médico disponible</Text>
          ) : (
            <View style={styles.historialList}>
              {historial.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.historialItem}>
                  <Text style={styles.historialFecha}>{formatDateOnly(item.fecha_hora)}</Text>
                  <Text style={styles.historialMedico}>
                    {item.medico?.nombre_completo || "Médico no especificado"}
                  </Text>
                  <Text style={styles.historialDiagnostico}>
                    {item.diagnostico || item.motivo_consulta || "Sin diagnóstico"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <ButtonPrimary
            title="Agendar Nueva Cita"
            onPress={handleAgendarCita}
            style={styles.actionButton}
          />
          
          <ButtonPrimary
            title="Editar Información"
            onPress={handleEditarPaciente}
            style={[styles.actionButton, styles.secondaryButton]}
          />
        </View>
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
  pacienteCard: {
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
  pacienteNombre: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
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
  bloodType: {
    color: colors.error,
    fontWeight: "600",
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
  medicalInfo: {
    marginBottom: 8,
  },
  medicalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  medicalText: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
  emptyHistorial: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    fontStyle: "italic",
  },
  historialList: {
    gap: 12,
  },
  historialItem: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  historialFecha: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  historialMedico: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  historialDiagnostico: {
    fontSize: 12,
    color: colors.gray,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 0,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
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

export default PacienteDetailScreen;
