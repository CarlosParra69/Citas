import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StatCard from "../../components/StatCard";
import QuickActionCard from "../../components/QuickActionCard";
import ActivityFeed from "../../components/ActivityFeed";
import { useThemeColors } from "../../utils/themeColors";

const MedicoDashboard = ({ dashboardData, navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  // Mock data - en producción vendría de la API
  const mockActivities = [
    {
      title: "Cita completada",
      description: "Consulta con María González",
      time: "Hace 30 min",
    },
    {
      title: "Nueva cita pendiente",
      description: "Aprobación requerida para consulta",
      time: "Hace 2 horas",
    },
    {
      title: "Cita cancelada",
      description: "Paciente canceló su cita",
      time: "Hace 4 horas",
    },
  ];

  const quickActions = [
    {
      title: "Citas Pendientes",
      subtitle: `${
        dashboardData?.citasPendientes || 0
      } citas requieren aprobación`,
      onPress: () =>
        navigation.navigate("Citas", { screen: "CitasPendientesScreen" }),
    },
    {
      title: "Crear Paciente",
      subtitle: "Registrar nuevo paciente en el sistema",
      onPress: () =>
        navigation.navigate("Pacientes", { screen: "CrearPacienteScreen" }),
    },
    {
      title: "Mi Agenda",
      subtitle: "Ver calendario y citas programadas",
      onPress: () => navigation.navigate("Citas", { screen: "MiAgendaScreen" }),
    },
    {
      title: "Mis Estadísticas",
      subtitle: "Ver rendimiento y métricas",
      onPress: () => navigation.navigate("MisEstadisticasScreen"),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.welcomeText}>Bienvenido, Doctor</Text>

      {/* Estadísticas personales */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Mi Rendimiento</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Citas Pendientes"
            value={dashboardData?.citasPendientes || 0}
            color={colors.warning}
          />
          <StatCard
            title="Citas Hoy"
            value={dashboardData?.citasHoy || 0}
            color={colors.primary}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Citas Completadas"
            value={dashboardData?.estadisticasPersonales?.citasCompletadas || 0}
            color={colors.success}
          />
          <StatCard
            title="Promedio Mensual"
            value={dashboardData?.estadisticasPersonales?.promedioMensual || 0}
            color={colors.info}
          />
        </View>
      </View>

      {/* Próximas citas */}
      {dashboardData?.proximasCitas &&
        dashboardData.proximasCitas.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.sectionTitle}>Próximas Citas</Text>
            {dashboardData.proximasCitas.slice(0, 3).map((cita, index) => (
              <View key={index} style={styles.upcomingItem}>
                <Text style={styles.patientName}>
                  {cita.paciente?.nombre} {cita.paciente?.apellido}
                </Text>
                <Text style={styles.appointmentTime}>
                  {new Date(cita.fecha_hora).toLocaleDateString("es-ES")} -{" "}
                  {new Date(cita.fecha_hora).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

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
        <ActivityFeed activities={mockActivities} useFlatList={false} />
      </View>
    </ScrollView>
  );
};

// Create styles function that uses theme colors
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
    upcomingSection: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
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
    upcomingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    patientName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    appointmentTime: {
      fontSize: 14,
      color: colors.gray,
    },
    actionsSection: {
      marginBottom: 24,
    },
    activitySection: {
      marginBottom: 24,
    },
  });

export default MedicoDashboard;
