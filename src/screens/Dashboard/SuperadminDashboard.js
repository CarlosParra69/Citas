import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StatCard from "../../components/StatCard";
import ActivityFeed from "../../components/ActivityFeed";
import { useThemeColors } from "../../utils/themeColors";

const SuperadminDashboard = ({ dashboardData, navigation }) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  // Mock data - en producción vendría de la API
  const mockActivities = [
    {
      title: "Nuevo médico registrado",
      description: "Dr. Juan Pérez se unió al sistema",
      time: "Hace 2 horas",
    },
    {
      title: "Cita completada",
      description: "Consulta de cardiología finalizada",
      time: "Hace 4 horas",
    },
    {
      title: "Sistema actualizado",
      description: "Nueva versión desplegada exitosamente",
      time: "Hace 1 día",
    },
  ];

  // Acciones rápidas movidas a la pantalla de gestión de usuarios

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.welcomeText}>Bienvenido, Superadministrador</Text>

      {/* Estadísticas principales */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estadísticas del Sistema</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Usuarios"
            value={dashboardData?.totalUsuarios || 0}
            color={colors.primary}
          />
          <StatCard
            title="Médicos Activos"
            value={dashboardData?.totalMedicos || 0}
            color={colors.success}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Pacientes"
            value={dashboardData?.totalPacientes || 0}
            color={colors.info}
          />
          <StatCard
            title="Ingresos del Mes"
            value={`$${(dashboardData?.ingresosMes || 0).toLocaleString()}`}
            color={colors.warning}
          />
        </View>
      </View>

      {/* Actividad reciente */}
      <View style={styles.activitySection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Actividad Reciente
        </Text>
        <ActivityFeed activities={mockActivities} />
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
    welcomeText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 24,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    statsSection: {
      marginBottom: 24,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    actionsSection: {
      marginBottom: 24,
    },
    activitySection: {
      marginBottom: 24,
    },
  });

export default SuperadminDashboard;
