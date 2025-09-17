import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from "react-native";
import { getMedicosMasCitas } from "../../api/reportes";
import LoadingSpinner from "../../components/LoadingSpinner";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import colors from "../../utils/colors";

const MedicosMasCitasScreen = ({ navigation }) => {
  const [medicosData, setMedicosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMedicosData();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadMedicosData = async () => {
    try {
      setError(null);
      const response = await getMedicosMasCitas();
      
      if (response.data.success) {
        setMedicosData(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Error al cargar datos de médicos");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading medicos data:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicosData();
    setRefreshing(false);
  };

  const handleMedicoPress = (medico) => {
    navigation.navigate("MedicoDetailScreen", {
      medicoId: medico.id,
      medicoNombre: medico.nombre_completo
    });
  };

  const renderMedico = (medico, index) => {
    const posicion = index + 1;
    const ingresosTotales = medico.ingresos_totales || 0;
    const citasCompletadas = medico.citas_completadas || 0;
    const promedioTarifa = citasCompletadas > 0 ? ingresosTotales / citasCompletadas : 0;
    
    return (
      <CardItem
        key={medico.id}
        title={medico.nombre_completo}
        subtitle={`${medico.especialidad?.nombre || 'Sin especialidad'} • ${citasCompletadas} citas`}
        description={`Ingresos: $${ingresosTotales.toLocaleString()} • Promedio: $${Math.round(promedioTarifa).toLocaleString()}`}
        onPress={() => handleMedicoPress(medico)}
        rightContent={
          <View style={styles.rankContainer}>
            <View style={[styles.rankBadge, getRankStyle(posicion)]}>
              <Text style={[styles.rankText, getRankTextStyle(posicion)]}>
                #{posicion}
              </Text>
            </View>
            <Text style={styles.citasCount}>{citasCompletadas}</Text>
            <Text style={styles.citasLabel}>citas</Text>
          </View>
        }
      />
    );
  };

  const getRankStyle = (posicion) => {
    if (posicion === 1) return { backgroundColor: '#FFD700' }; // Oro
    if (posicion === 2) return { backgroundColor: '#C0C0C0' }; // Plata
    if (posicion === 3) return { backgroundColor: '#CD7F32' }; // Bronce
    return { backgroundColor: colors.primary };
  };

  const getRankTextStyle = (posicion) => {
    if (posicion <= 3) return { color: colors.white };
    return { color: colors.white };
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando reporte de médicos..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Médicos con Más Citas</Text>
        <Text style={styles.subtitle}>
          Ranking de médicos por productividad y ingresos generados
        </Text>

        {/* Estadísticas generales */}
        {medicosData.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {medicosData.reduce((sum, m) => sum + (m.citas_completadas || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Total Citas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.incomeNumber]}>
                  ${medicosData.reduce((sum, m) => sum + (m.ingresos_totales || 0), 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Ingresos Totales</Text>
              </View>
            </View>
          </View>
        )}

        {/* Lista de médicos */}
        <View style={styles.medicosContainer}>
          {!medicosData || medicosData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay datos de médicos disponibles</Text>
              <Text style={styles.emptySubtext}>
                Los reportes se generan cuando hay citas completadas
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.listTitle}>
                Ranking de Médicos ({medicosData.length})
              </Text>
              {medicosData.map((medico, index) => renderMedico(medico, index))}
            </>
          )}
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Información del Reporte</Text>
          <Text style={styles.infoText}>
            • Este reporte muestra los médicos ordenados por número de citas completadas
          </Text>
          <Text style={styles.infoText}>
            • Los ingresos se calculan basados en las tarifas de consulta
          </Text>
          <Text style={styles.infoText}>
            • Solo se incluyen citas con estado "completada"
          </Text>
          <Text style={styles.infoText}>
            • Los datos se actualizan en tiempo real
          </Text>
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
  title: {
    fontSize: 24,
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
  medicosContainer: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  rankContainer: {
    alignItems: "center",
    gap: 4,
  },
  rankBadge: {
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  citasCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  citasLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
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
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default MedicosMasCitasScreen;
