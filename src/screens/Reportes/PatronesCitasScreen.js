import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { getPatronesCitas } from "../../api/reportes";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";

const PatronesCitasScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const styles = createStyles(colors);
  const [patronesData, setPatronesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "superadmin") {
        loadPatronesData();
      } else {
        Alert.alert(
          "Acceso Denegado",
          "No tienes permisos para acceder a esta pantalla",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }, [user])
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadPatronesData = async () => {
    try {
      setError(null);
      const response = await getPatronesCitas();

      if (response.data.success) {
        setPatronesData(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Error al cargar patrones de citas"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading patrones data:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatronesData();
    setRefreshing(false);
  };

  const renderHorarioPopular = (horario, index) => (
    <View key={index} style={styles.horarioItem}>
      <Text style={styles.horarioHora}>{horario.hora}</Text>
      <View style={styles.horarioBar}>
        <View
          style={[
            styles.horarioFill,
            {
              width: `${
                (horario.cantidad / patronesData.max_citas_hora) * 100
              }%`,
            },
          ]}
        />
      </View>
      <Text style={styles.horarioCantidad}>{horario.cantidad}</Text>
    </View>
  );

  const renderDiaPopular = (dia, index) => (
    <View key={index} style={styles.diaItem}>
      <Text style={styles.diaNombre}>{dia.dia_semana}</Text>
      <View style={styles.diaBar}>
        <View
          style={[
            styles.diaFill,
            { width: `${(dia.cantidad / patronesData.max_citas_dia) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.diaCantidad}>{dia.cantidad}</Text>
    </View>
  );

  const renderEspecialidadPopular = (especialidad, index) => (
    <View key={index} style={styles.especialidadItem}>
      <View style={styles.especialidadRank}>
        <Text style={styles.rankNumber}>#{index + 1}</Text>
      </View>
      <View style={styles.especialidadInfo}>
        <Text style={styles.especialidadNombre}>{especialidad.nombre}</Text>
        <Text style={styles.especialidadCitas}>
          {especialidad.total_citas} citas
        </Text>
      </View>
      <View style={styles.especialidadBar}>
        <View
          style={[
            styles.especialidadFill,
            {
              width: `${
                (especialidad.total_citas /
                  patronesData.max_citas_especialidad) *
                100
              }%`,
            },
          ]}
        />
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando patrones de citas..." />;
  }

  if (!patronesData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudieron cargar los patrones de citas
        </Text>
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
        <Text style={styles.title}>Patrones de Citas</Text>
        <Text style={styles.subtitle}>
          Análisis de comportamiento temporal y demográfico
        </Text>

        {/* Estadísticas generales */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {patronesData.total_citas_analizadas || 0}
              </Text>
              <Text style={styles.statLabel}>Citas Analizadas</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {patronesData.promedio_citas_dia || 0}
              </Text>
              <Text style={styles.statLabel}>Promedio/Día</Text>
            </View>
          </View>
        </View>

        {/* Horarios más populares */}
        {patronesData.horarios_populares && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horarios Más Populares</Text>
            <Text style={styles.sectionSubtitle}>
              Distribución de citas por hora del día
            </Text>
            {patronesData.horarios_populares
              .slice(0, 8)
              .map(renderHorarioPopular)}
          </View>
        )}

        {/* Días más populares */}
        {patronesData.dias_populares && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Días Más Populares</Text>
            <Text style={styles.sectionSubtitle}>
              Distribución de citas por día de la semana
            </Text>
            {patronesData.dias_populares.map(renderDiaPopular)}
          </View>
        )}

        {/* Especialidades más solicitadas */}
        {patronesData.especialidades_populares && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Especialidades Más Solicitadas
            </Text>
            <Text style={styles.sectionSubtitle}>
              Ranking por número total de citas
            </Text>
            {patronesData.especialidades_populares
              .slice(0, 10)
              .map(renderEspecialidadPopular)}
          </View>
        )}

        {/* Tendencias temporales */}
        {patronesData.tendencia_mensual && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendencia Mensual</Text>
            <Text style={styles.sectionSubtitle}>
              Evolución de citas en los últimos meses
            </Text>

            <View style={styles.tendenciaContainer}>
              {patronesData.tendencia_mensual.map((mes, index) => (
                <View key={index} style={styles.mesItem}>
                  <Text style={styles.mesNombre}>{mes.mes}</Text>
                  <View style={styles.mesBar}>
                    <View
                      style={[
                        styles.mesFill,
                        {
                          height: `${
                            (mes.citas / patronesData.max_citas_mes) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.mesCitas}>{mes.citas}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Información del análisis */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Información del Análisis</Text>
          <Text style={styles.infoText}>
            • Los datos incluyen todas las citas registradas en el sistema
          </Text>
          <Text style={styles.infoText}>
            • Los horarios se agrupan por hora completa (ej: 09:00-09:59)
          </Text>
          <Text style={styles.infoText}>
            • Las tendencias ayudan a optimizar la programación de citas
          </Text>
          <Text style={styles.infoText}>
            • Los datos se actualizan automáticamente cada día
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
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
      color: colors.text,
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
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.gray,
      textAlign: "center",
    },
    section: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 16,
    },
    horarioItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    horarioHora: {
      width: 60,
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    horarioBar: {
      flex: 1,
      height: 20,
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      marginHorizontal: 12,
    },
    horarioFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    horarioCantidad: {
      width: 30,
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
      textAlign: "right",
    },
    diaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    diaNombre: {
      width: 80,
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    diaBar: {
      flex: 1,
      height: 20,
      backgroundColor: colors.lightGray,
      borderRadius: 10,
      marginHorizontal: 12,
    },
    diaFill: {
      height: "100%",
      backgroundColor: colors.success,
      borderRadius: 10,
    },
    diaCantidad: {
      width: 30,
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
      textAlign: "right",
    },
    especialidadItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    especialidadRank: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    rankNumber: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "bold",
    },
    especialidadInfo: {
      flex: 1,
    },
    especialidadNombre: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    especialidadCitas: {
      fontSize: 12,
      color: colors.gray,
    },
    especialidadBar: {
      width: 60,
      height: 8,
      backgroundColor: colors.lightGray,
      borderRadius: 4,
      marginLeft: 12,
    },
    especialidadFill: {
      height: "100%",
      backgroundColor: colors.secondary,
      borderRadius: 4,
    },
    tendenciaContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "end",
      height: 120,
    },
    mesItem: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: 2,
    },
    mesNombre: {
      fontSize: 10,
      color: colors.gray,
      marginBottom: 4,
      transform: [{ rotate: "-45deg" }],
    },
    mesBar: {
      width: 20,
      flex: 1,
      backgroundColor: colors.lightGray,
      borderRadius: 2,
      justifyContent: "end",
    },
    mesFill: {
      width: "100%",
      backgroundColor: colors.warning,
      borderRadius: 2,
    },
    mesCitas: {
      fontSize: 10,
      color: colors.text,
      fontWeight: "600",
      marginTop: 4,
    },
    infoSection: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
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
    },
  });

export default PatronesCitasScreen;
