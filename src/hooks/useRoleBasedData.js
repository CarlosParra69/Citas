import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useCitas } from "../context/CitasContext";
import { useThemeColors } from "../utils/themeColors";
import {
  dashboardMedico,
  dashboardPaciente,
  estadisticasMedico,
  getDashboardData,
} from "../api/reportes";

const ROLES = {
  SUPERADMIN: "superadmin",
  MEDICO: "medico",
  PACIENTE: "paciente",
};

export const useRoleBasedData = () => {
  let user, citasContext;

  try {
    user = useAuthContext()?.user;
    citasContext = useCitas();
  } catch (error) {
    console.error("Error in useRoleBasedData contexts:", error);
    user = null;
    citasContext = {
      fetchCitasPendientes: async () => [],
      citasPendientes: [],
    };
  }

  const { fetchCitasPendientes, citasPendientes } = citasContext;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      switch (user.rol) {
        case ROLES.SUPERADMIN:
          // Para superadmin, cargar datos generales del sistema
          try {
            const dashboardResponse = await getDashboardData();

            // Mapear los datos reales del backend a los nombres esperados por el frontend
            const mappedData = {
              totalUsuarios: dashboardResponse.totalUsuarios || 0,
              totalMedicos: dashboardResponse.total_medicos_activos || 0,
              totalPacientes: dashboardResponse.total_pacientes_activos || 0,
              ingresosMes: dashboardResponse.ingresos_mes || 0,
              citasPorEstado: dashboardResponse.citasPorEstado || {},
              actividadReciente: dashboardResponse.actividadReciente || [],
              citasPendientes: dashboardResponse.citas_programadas_mes || 0,
              citasHoy: dashboardResponse.citas_hoy || 0,
            };

            setDashboardData(mappedData);
          } catch (error) {
            console.error("Error loading superadmin data:", error);
            // Fallback con datos por defecto
            setDashboardData({
              totalUsuarios: 0,
              totalMedicos: 0,
              totalPacientes: 0,
              ingresosMes: 0,
              citasPorEstado: {},
              actividadReciente: [],
            });
          }
          break;

        case ROLES.MEDICO:
          // Para médicos, cargar dashboard específico
          try {
            const [medicoDashboard, medicoEstadisticas] = await Promise.all([
              dashboardMedico(),
              estadisticasMedico(user.id),
            ]);

            // El backend devuelve datos anidados bajo la propiedad 'data'
            const medicoData =
              medicoDashboard.data?.data || medicoDashboard.data || {};

            const mappedData = {
              citasPendientes: medicoData?.estadisticas?.citas_pendientes || 0,
              citasHoy: medicoData?.estadisticas?.citas_hoy || 0,
              proximasCitas: medicoData?.proximas_citas || [],
              estadisticasPersonales: {
                citasCompletadas:
                  medicoEstadisticas.data?.total_citas_completadas || 0,
                promedioMensual: medicoEstadisticas.data?.citas_mes_actual || 0,
              },
              agendaHoy: medicoData?.agenda_hoy || [],
            };

            setDashboardData(mappedData);
          } catch (error) {
            console.error("Error loading medico data:", error);
            setDashboardData({
              citasPendientes: 0,
              citasHoy: 0,
              proximasCitas: [],
              estadisticasPersonales: {
                citasCompletadas: 0,
                promedioMensual: 0,
              },
              agendaHoy: [],
            });
          }
          break;

        case ROLES.PACIENTE:
          // Para pacientes, cargar dashboard específico
          try {
            const pacienteDashboard = await dashboardPaciente();

            // El backend devuelve datos anidados bajo la propiedad 'data'
            const pacienteData =
              pacienteDashboard.data?.data || pacienteDashboard.data || {};

            const mappedData = {
              proximasCitas: pacienteData?.proximas_citas || [],
              historialReciente: pacienteData?.historial_reciente || [],
            };

            setDashboardData(mappedData);
          } catch (error) {
            console.error("Error loading paciente data:", error);
            setDashboardData({
              proximasCitas: [],
              historialReciente: [],
            });
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const refreshData = () => {
    loadDashboardData();
  };

  return {
    dashboardData,
    loading,
    refreshData,
    userRole: user?.rol,
    isSuperadmin: user?.rol === ROLES.SUPERADMIN,
    isMedico: user?.rol === ROLES.MEDICO,
    isPaciente: user?.rol === ROLES.PACIENTE,
  };
};
