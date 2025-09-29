import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useCitas } from "../context/CitasContext";
import { useThemeColors } from "../utils/themeColors";
import {
  dashboardMedico,
  dashboardPaciente,
  estadisticasMedico,
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
          setDashboardData({
            totalUsuarios: 0, // Implementar API para esto
            totalMedicos: 0,
            totalPacientes: 0,
            ingresosMes: 0,
            citasPorEstado: {},
            actividadReciente: [],
          });
          break;

        case ROLES.MEDICO:
          // Para médicos, cargar dashboard específico
          const medicoDashboard = await dashboardMedico();
          const medicoEstadisticas = await estadisticasMedico();
          setDashboardData({
            citasPendientes:
              medicoDashboard.data?.estadisticas?.citas_pendientes || 0,
            citasHoy: medicoDashboard.data?.estadisticas?.citas_hoy || 0,
            proximasCitas: medicoDashboard.data?.proximas_citas || [],
            estadisticasPersonales: {
              citasCompletadas:
                medicoEstadisticas.data?.total_citas_completadas || 0,
              promedioMensual: medicoEstadisticas.data?.citas_mes_actual || 0,
            },
            agendaHoy: [], // Implementar API específica para agenda
          });
          break;

        case ROLES.PACIENTE:
          // Para pacientes, cargar dashboard específico
          const pacienteDashboard = await dashboardPaciente();
          setDashboardData({
            proximasCitas: pacienteDashboard.data?.proximas_citas || [],
            historialReciente: pacienteDashboard.data?.historial_reciente || [],
            recordatorios: [], // Implementar API específica para recordatorios
          });
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
