import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import StatCard from "../../components/StatCard";
import QuickActionCard from "../../components/QuickActionCard";
import ActivityFeed from "../../components/ActivityFeed";
import { useThemeColors } from "../../utils/themeColors";
import { useAuthContext } from "../../context/AuthContext";
import { getActividadesRecientes } from "../../api/actividades";
import LoadingSpinner from "../../components/LoadingSpinner";

const PacienteDashboard = ({ dashboardData, navigation }) => {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  // Estados para actividades y carga
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [loadingActividades, setLoadingActividades] = useState(true);

  // Cargar actividades recientes desde la API
  useEffect(() => {
    const cargarActividades = async () => {
      try {
        setLoadingActividades(true);
        const response = await getActividadesRecientes({
          usuario_id: user?.id,
          limite: 5
        });
        
        if (response.success) {
          setActividadesRecientes(response.data);
        } else {
          console.warn('Error cargando actividades:', response.error);
          setActividadesRecientes([]);
        }
      } catch (error) {
        console.error('Error al cargar actividades:', error);
        setActividadesRecientes([]);
      } finally {
        setLoadingActividades(false);
      }
    };

    if (user?.id) {
      cargarActividades();
    } else {
      setLoadingActividades(false);
    }
  }, [user?.id]);

  const quickActions = [
    {
      title: "Agendar Cita",
      subtitle: "Programar nueva consulta médica",
      onPress: () =>
        navigation.navigate("Citas", { screen: "CrearCitaScreen" }),
    },
    {
      title: "Mis Citas",
      subtitle: "Ver citas programadas y historial",
      onPress: () => navigation.navigate("Citas", { screen: "CitasMain" }),
    },
    /*{
      title: "Mi Historial",
      subtitle: "Ver historial médico completo",
      onPress: () => {
        const pacienteId = user?.paciente_id || user?.id;
        navigation.navigate("Médicos", {
          screen: "HistorialMedicoScreen",
          params: { pacienteId },
        });
      },
    },*/
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.welcomeText}>Bienvenido</Text>

      {/* Próximas citas */}
      {dashboardData?.proximasCitas &&
        dashboardData.proximasCitas.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.sectionTitle}>Próximas Citas</Text>
            {dashboardData.proximasCitas.slice(0, 2).map((cita, index) => (
              <TouchableOpacity
                key={index}
                style={styles.upcomingItem}
                onPress={() =>
                  navigation.navigate("DetalleCitaScreen", { citaId: cita.id })
                }
              >
                <View style={styles.appointmentInfo}>
                  <Text style={styles.doctorName}>
                    Dr. {cita.medico?.nombre} {cita.medico?.apellido}
                  </Text>
                  <Text style={styles.specialty}>
                    {cita.especialidad?.nombre}
                  </Text>
                </View>
                <View style={styles.timeInfo}>
                  <Text style={styles.appointmentDate}>
                    {new Date(cita.fecha_hora).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                  <Text style={styles.appointmentTime}>
                    {new Date(cita.fecha_hora).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      {/* Estadísticas personales */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Mi Actividad</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Citas Programadas"
            value={dashboardData?.proximasCitas?.length || 0}
            color={colors.primary}
          />
          <StatCard
            title="Citas Completadas"
            value={dashboardData?.historialReciente?.length || 0}
            color={colors.success}
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
        {loadingActividades ? (
          <LoadingSpinner />
        ) : (
          <ActivityFeed
            activities={actividadesRecientes}
            useFlatList={false}
          />
        )}
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
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    appointmentInfo: {
      flex: 1,
    },
    doctorName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    specialty: {
      fontSize: 14,
      color: colors.gray,
    },
    timeInfo: {
      alignItems: "flex-end",
    },
    appointmentDate: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 2,
    },
    appointmentTime: {
      fontSize: 12,
      color: colors.gray,
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

export default PacienteDashboard;
