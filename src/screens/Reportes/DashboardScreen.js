import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from "react-native";
import { getDashboardData } from "../../api/reportes";
import LoadingSpinner from "../../components/LoadingSpinner";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import colors from "../../utils/colors";

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const response = await getDashboardData();
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || "Error al cargar datos del dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateToReport = (reportName) => {
    switch (reportName) {
      case 'medicos':
        navigation.navigate('MedicosMasCitasScreen');
        break;
      case 'patrones':
        navigation.navigate('PatronesCitasScreen');
        break;
      default:
        Alert.alert('Información', 'Reporte no disponible');
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudieron cargar los datos del dashboard</Text>
        <ButtonPrimary
          title="Reintentar"
          onPress={loadDashboardData}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Dashboard de Reportes</Text>
        <Text style={styles.subtitle}>
          Resumen general del sistema de citas médicas
        </Text>

        {/* Estadísticas principales */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.total_citas || 0}
              </Text>
              <Text style={styles.statLabel}>Total Citas</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.citas_hoy || 0}
              </Text>
              <Text style={styles.statLabel}>Citas Hoy</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.total_pacientes || 0}
              </Text>
              <Text style={styles.statLabel}>Pacientes</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.total_medicos || 0}
              </Text>
              <Text style={styles.statLabel}>Médicos</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.total_especialidades || 0}
              </Text>
              <Text style={styles.statLabel}>Especialidades</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, styles.incomeNumber]}>
                ${(dashboardData.ingresos_mes || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Ingresos Mes</Text>
            </View>
          </View>
        </View>

        {/* Estados de citas */}
        {dashboardData.citas_por_estado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Citas por Estado</Text>
            {Object.entries(dashboardData.citas_por_estado).map(([estado, cantidad]) => (
              <View key={estado} style={styles.estadoRow}>
                <View style={[styles.estadoDot, { backgroundColor: getEstadoColor(estado) }]} />
                <Text style={styles.estadoNombre}>{formatEstadoName(estado)}</Text>
                <Text style={styles.estadoCantidad}>{cantidad}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Especialidades más solicitadas */}
        {dashboardData.especialidades_populares && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especialidades Más Solicitadas</Text>
            {dashboardData.especialidades_populares.slice(0, 5).map((item, index) => (
              <CardItem
                key={index}
                title={item.nombre}
                subtitle={`${item.total_citas} citas`}
                description={`${item.medicos_activos} médicos activos`}
                rightContent={
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                }
              />
            ))}
          </View>
        )}

        {/* Botones de navegación a reportes */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Reportes Detallados</Text>
          
          <ButtonPrimary
            title="Médicos con Más Citas"
            onPress={() => navigateToReport('medicos')}
            style={styles.reportButton}
          />
          
          <ButtonPrimary
            title="Patrones de Citas"
            onPress={() => navigateToReport('patrones')}
            style={[styles.reportButton, styles.secondaryButton]}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const getEstadoColor = (estado) => {
  const colores = {
    'programada': colors.info,
    'confirmada': colors.success,
    'en_curso': colors.warning,
    'completada': colors.primary,
    'cancelada': colors.error,
    'no_asistio': colors.gray
  };
  return colores[estado] || colors.gray;
};

const formatEstadoName = (estado) => {
  const nombres = {
    'programada': 'Programada',
    'confirmada': 'Confirmada',
    'en_curso': 'En Curso',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'no_asistio': 'No Asistió'
  };
  return nombres[estado] || estado;
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  incomeNumber: {
    fontSize: 18,
    color: colors.success,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    textAlign: "center",
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  estadoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  estadoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  estadoNombre: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  estadoCantidad: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  reportsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  reportButton: {
    marginBottom: 12,
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

export default DashboardScreen;
