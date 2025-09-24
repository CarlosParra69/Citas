import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StatCard from "../StatCard";
import QuickActionCard from "../QuickActionCard";
import ActivityFeed from "../ActivityFeed";
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

  const quickActions = [
    {
      title: "Crear Usuario",
      subtitle: "Registrar nuevo usuario en el sistema",
      onPress: () =>
        navigation.navigate("Administración", { screen: "CrearUsuarioScreen" }),
    },
    {
      title: "Gestionar Usuarios",
      subtitle: "Administrar médicos y pacientes",
      onPress: () =>
        navigation.navigate("Administración", { screen: "UsuariosScreen" }),
    },
    {
      title: "Gestionar Médicos",
      subtitle: "Administrar médicos del sistema",
      onPress: () =>
        navigation.navigate("Administración", {
          screen: "GestionMedicosScreen",
        }),
    },
    {
      title: "Gestionar Especialidades",
      subtitle: "Administrar especialidades médicas",
      onPress: () =>
        navigation.navigate("Administración", {
          screen: "GestionEspecialidadesScreen",
        }),
    },
    {
      title: "Gestionar Pacientes",
      subtitle: "Administrar pacientes del sistema",
      onPress: () =>
        navigation.navigate("Administración", {
          screen: "GestionPacientesScreen",
        }),
    },
    {
      title: "Reportes del Sistema",
      subtitle: "Ver estadísticas detalladas",
      onPress: () => navigation.navigate("Reportes"),
    },
  ];

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

      {/* Acciones rápidas */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        {quickActions.map((action, index) => (
          <QuickActionCard
            key={index}
            title={action.title}
            subtitle={action.subtitle}
            onPress={action.onPress}
          />
        ))}
      </View>

      {/* Actividad reciente */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
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
    },
    welcomeText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
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
