import axiosInstance from "../utils/axiosInstance";
import { getCitas, getProximasCitas } from "./citas";

/**
 * Combina datos de citas para crear actividades recientes
 * @param {Object} params - Parámetros de filtrado
 * @returns {Promise} - Actividades recientes basadas en citas
 */
export const getActividadesRecientes = async (params = {}) => {
  try {
    const actividades = [];

    // Obtener próximas citas
    try {
      const proximasCitasResponse = await getProximasCitas();
      
      if (proximasCitasResponse.success && proximasCitasResponse.data) {
        const citas = Array.isArray(proximasCitasResponse.data) 
          ? proximasCitasResponse.data 
          : proximasCitasResponse.data.data || [];
          
        citas.slice(0, 3).forEach(cita => {
          actividades.push({
            title: "Cita programada",
            description: `Consulta con Dr. ${cita.medico?.nombre || ''} ${cita.medico?.apellido || ''}`,
            time: formatTimeAgo(cita.fecha_hora),
            type: 'cita',
            cita_id: cita.id
          });
        });
      }
    } catch (error) {
      console.warn("Error obteniendo próximas citas para actividades:", error);
    }

    // Obtener citas generales para más actividades
    try {
      const citasResponse = await getCitas({ 
        limite: 3,
        orden: 'desc'
      });
      
      if (citasResponse.success && citasResponse.data) {
        const citas = Array.isArray(citasResponse.data) 
          ? citasResponse.data 
          : citasResponse.data.data || [];
          
        citas.forEach(cita => {
          if (cita.estado === 'completada') {
            actividades.push({
              title: "Cita completada",
              description: `Consulta con ${cita.paciente?.nombre || ''} ${cita.paciente?.apellido || ''}`,
              time: formatTimeAgo(cita.fecha_hora),
              type: 'cita',
              cita_id: cita.id
            });
          } else if (cita.estado === 'cancelada') {
            actividades.push({
              title: "Cita cancelada",
              description: `Cita cancelada por ${cita.paciente?.nombre || 'el paciente'}`,
              time: formatTimeAgo(cita.fecha_hora),
              type: 'cita',
              cita_id: cita.id
            });
          }
        });
      }
    } catch (error) {
      console.warn("Error obteniendo citas generales para actividades:", error);
    }

    // Si no hay actividades, crear algunas por defecto basadas en el tipo de usuario
    if (actividades.length === 0) {
      if (params.tipo === 'medico') {
        actividades.push(
          {
            title: "Bienvenido al sistema",
            description: "Gestiona tus citas y pacientes desde aquí",
            time: "Hace un momento",
            type: 'sistema'
          },
          {
            title: "Nuevas funcionalidades",
            description: "Explora las herramientas de gestión disponibles",
            time: "Hace un momento",
            type: 'sistema'
          }
        );
      } else {
        actividades.push(
          {
            title: "Bienvenido",
            description: "Programa tus citas médicas fácilmente",
            time: "Hace un momento",
            type: 'sistema'
          },
          {
            title: "Recordatorio",
            description: "No olvide agendar su próxima cita médica",
            time: "Hace un momento",
            type: 'recordatorio'
          }
        );
      }
    }

    // Ordenar por fecha y limitar
    const actividadesOrdenadas = actividades
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, params.limite || 5);

    return {
      success: true,
      data: actividadesOrdenadas,
    };
  } catch (error) {
    console.error("Error obteniendo actividades recientes:", error);
    
    // Fallback con actividades por defecto
    const actividadesPorDefecto = [
      {
        title: "Sin actividades recientes",
        description: "No hay actividades para mostrar en este momento",
        time: "Ahora",
        type: 'info'
      }
    ];

    return {
      success: true,
      data: actividadesPorDefecto,
    };
  }
};

/**
 * Obtener actividades por tipo específico
 * @param {string} tipo - Tipo de actividad (medico, paciente)
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise} - Actividades filtradas por tipo
 */
export const getActividadesPorTipo = async (tipo, params = {}) => {
  try {
    const response = await getActividadesRecientes({ ...params, tipo });
    
    if (!response.success) {
      return response;
    }

    // Filtrar por tipo específico
    const actividadesFiltradas = response.data.filter(actividad => {
      if (tipo === 'medico') {
        return actividad.type === 'cita' || actividad.type === 'sistema';
      }
      if (tipo === 'paciente') {
        return actividad.type === 'cita' || actividad.type === 'recordatorio' || actividad.type === 'sistema';
      }
      return true;
    });

    return {
      success: true,
      data: actividadesFiltradas,
    };
  } catch (error) {
    console.error(`Error obteniendo actividades de tipo ${tipo}:`, error);
    return {
      success: false,
      data: [],
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Crear nueva actividad en el sistema (placeholder)
 * @param {Object} actividadData - Datos de la nueva actividad
 * @returns {Promise} - Respuesta del servidor
 */
export const crearActividad = async (actividadData) => {
  try {
    // Esta función sería para crear actividades futuras
    // Por ahora retornamos un success simulado
    console.log("Crear actividad:", actividadData);
    
    return {
      success: true,
      message: "Actividad creada exitosamente",
    };
  } catch (error) {
    console.error("Error creando actividad:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al crear la actividad",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Formatea una fecha para mostrar tiempo relativo
 * @param {string} dateString - Fecha en string
 * @returns {string} - Tiempo relativo formateado
 */
const formatTimeAgo = (dateString) => {
  try {
    if (!dateString) return "Tiempo desconocido";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Ahora mismo";
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  } catch (error) {
    console.warn("Error formateando tiempo:", error);
    return "Tiempo desconocido";
  }
};