import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { getEstadisticasMedico } from "../../api/estadisticas";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";

const { width } = Dimensions.get("window");

const MisEstadisticasScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const { user } = useAuthContext();
  const styles = createStyles(colors);

  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("mes"); // 'semana', 'mes', 'trimestre', 'ano'

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "medico") {
        loadEstadisticas();
      } else {
        Alert.alert(
          "Acceso Denegado",
          "Solo los médicos pueden acceder a sus estadísticas",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }, [user, selectedPeriod])
  );

  const loadEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await getEstadisticasMedico(user.id, selectedPeriod);

      if (response.success) {
        setEstadisticas(response.data);
      } else {
        Alert.alert("Error", "No se pudieron cargar las estadísticas");
      }
    } catch (error) {
      console.error("Error loading estadisticas:", error);
      Alert.alert("Error", "No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEstadisticas();
    setRefreshing(false);
  };

  const renderStatCard = (title, value, subtitle, color = colors.primary) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderSimpleBarChart = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        </View>
      );
    }

    const maxValue = Math.max(...data.map((item) => item.value));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.barChart}>
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barInfo}>
                  <Text style={styles.barLabel}>{item.label}</Text>
                  <Text style={styles.barValue}>{item.value}</Text>
                </View>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${percentage}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case "semana":
        return "Esta semana";
      case "mes":
        return "Este mes";
      case "trimestre":
        return "Este trimestre";
      case "ano":
        return "Este año";
      default:
        return "Período";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando estadísticas..." />;
  }

  if (!estadisticas) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudieron cargar las estadísticas
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEstadisticas}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Mis Estadísticas</Text>
      <Text style={styles.subtitle}>{getPeriodText()}</Text>

      {/* Selector de período */}
      <View style={styles.periodSelector}>
        {[
          { key: "semana", label: "Semana" },
          { key: "mes", label: "Mes" },
          { key: "trimestre", label: "Trimestre" },
          { key: "ano", label: "Año" },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.activePeriodButtonText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Estadísticas principales */}
      <View style={styles.statsContainer}>
        {renderStatCard(
          "Citas Atendidas",
          estadisticas.citas_atendidas || 0,
          "Total de consultas completadas",
          colors.success
        )}

        {renderStatCard(
          "Citas Pendientes",
          estadisticas.citas_pendientes || 0,
          "Esperando aprobación",
          colors.warning
        )}

        {renderStatCard(
          "Citas Canceladas",
          estadisticas.citas_canceladas || 0,
          "No completadas",
          colors.error
        )}

        {renderStatCard(
          "Promedio Diario",
          estadisticas.promedio_diario || 0,
          "Citas por día",
          colors.info
        )}
      </View>

      {/* Gráfico de citas por día */}
      {renderSimpleBarChart(estadisticas.citas_por_dia || [], "Citas por Día")}

      {/* Gráfico de especialidades */}
      {renderSimpleBarChart(
        estadisticas.citas_por_especialidad || [],
        "Citas por Especialidad"
      )}

      {/* Estadísticas adicionales */}
      <View style={styles.additionalStats}>
        <Text style={styles.sectionTitle}>Resumen del Período</Text>

        <View style={styles.additionalStatsGrid}>
          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatValue}>
              {estadisticas.tasa_asistencia || 0}%
            </Text>
            <Text style={styles.additionalStatLabel}>Tasa de Asistencia</Text>
          </View>

          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatValue}>
              {estadisticas.tiempo_promedio || 0}min
            </Text>
            <Text style={styles.additionalStatLabel}>Tiempo Promedio</Text>
          </View>

          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatValue}>
              {estadisticas.pacientes_unicos || 0}
            </Text>
            <Text style={styles.additionalStatLabel}>Pacientes Únicos</Text>
          </View>

          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatValue}>
              ${estadisticas.ingresos_totales || 0}
            </Text>
            <Text style={styles.additionalStatLabel}>Ingresos Totales</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 24,
    },
    periodSelector: {
      flexDirection: "row",
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 4,
      marginBottom: 24,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 8,
    },
    activePeriodButton: {
      backgroundColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.gray,
    },
    activePeriodButtonText: {
      color: colors.white,
    },
    statsContainer: {
      marginBottom: 24,
    },
    statCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    statTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    statSubtitle: {
      fontSize: 12,
      color: colors.gray,
    },
    chartContainer: {
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
    chartTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    barChart: {
      marginTop: 8,
    },
    barContainer: {
      marginBottom: 12,
    },
    barInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    barLabel: {
      fontSize: 14,
      color: colors.text,
    },
    barValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    barBackground: {
      height: 20,
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    noDataText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
      padding: 20,
    },
    additionalStats: {
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    additionalStatsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    additionalStatItem: {
      width: "48%",
      backgroundColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      alignItems: "center",
    },
    additionalStatValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    additionalStatLabel: {
      fontSize: 12,
      color: colors.gray,
      textAlign: "center",
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
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default MisEstadisticasScreen;
