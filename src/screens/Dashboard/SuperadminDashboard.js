import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StatCard from "../../components/StatCard";
import ActivityFeed from "../../components/ActivityFeed";
import { useThemeColors } from "../../utils/themeColors";
import { Ionicons } from "@expo/vector-icons";

const SuperadminDashboard = ({ dashboardData, navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Datos reales desde la API
  const activities = dashboardData?.actividadReciente || [];

  // Estadísticas adicionales calculadas
  const citasTotales = dashboardData?.citasPorEstado
    ? Object.values(dashboardData.citasPorEstado).reduce(
        (sum, val) => sum + val,
        0
      )
    : 0;

  const estadoSistema = {
    usuariosActivos: dashboardData?.totalUsuarios || 0,
    sistemaSaludable: true,
    ultimaActualizacion: new Date().toLocaleString(),
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con información del sistema */}
      <View style={styles.headerSection}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={styles.welcomeText}>Panel de Superadministrador</Text>
        </View>
        <View style={styles.systemStatus}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: estadoSistema.sistemaSaludable
                  ? colors.success
                  : colors.error,
              },
            ]}
          />
          <Text style={styles.statusText}>
            Sistema{" "}
            {estadoSistema.sistemaSaludable ? "Operativo" : "Con Problemas"}
          </Text>
        </View>
      </View>

      {/* Estadísticas principales */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Estadísticas del Sistema</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Usuarios"
              value={dashboardData?.totalUsuarios || 0}
              icon="people"
              color={colors.primary}
            />
            <StatCard
              title="Médicos Activos"
              value={dashboardData?.totalMedicos || 0}
              icon="medical"
              color={colors.success}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Pacientes"
              value={dashboardData?.totalPacientes || 0}
              icon="person"
              color={colors.info}
            />
            <StatCard
              title="Citas Totales"
              value={citasTotales}
              icon="calendar"
              color={colors.secondary}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Ingresos del Mes"
              value={`$${(dashboardData?.ingresosMes || 0).toLocaleString()}`}
              icon="cash"
              color={colors.warning}
            />
            <StatCard
              title="Citas Hoy"
              value={dashboardData?.citasHoy || 0}
              icon="today"
              color={colors.accent}
            />
          </View>
        </View>
      </View>

      {/* Estados del sistema */}
      <View style={styles.systemSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Estado del Sistema</Text>
        </View>

        <View style={styles.systemInfo}>
          <View style={styles.systemRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text style={styles.systemText}>
              Usuarios activos: {estadoSistema.usuariosActivos}
            </Text>
          </View>
          <View style={styles.systemRow}>
            <Ionicons name="time" size={16} color={colors.info} />
            <Text style={styles.systemText}>
              Última actualización: {estadoSistema.ultimaActualizacion}
            </Text>
          </View>
        </View>
      </View>

      {/* Actividad reciente */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Actividad Reciente
          </Text>
        </View>
        <ActivityFeed activities={activities} useFlatList={false} />
      </View>
    </ScrollView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    headerSection: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    welcomeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginLeft: 8,
    },
    systemStatus: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
    },
    statsSection: {
      marginBottom: 24,
    },
    statsGrid: {
      gap: 12,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    systemSection: {
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    systemInfo: {
      gap: 12,
    },
    systemRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    systemText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
    },
    actionsSection: {
      marginBottom: 24,
    },
    activitySection: {
      marginBottom: 24,
    },
  });

export default SuperadminDashboard;
