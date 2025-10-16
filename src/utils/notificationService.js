import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servicio para manejar notificaciones push en la aplicación MediApp
 */
class NotificationService {

  constructor() {
    this.configurarNotificationHandler();
  }

  /**
   * Configura el comportamiento de las notificaciones
   */
  configurarNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  /**
   * Verifica y solicita permisos de notificaciones
   */
  async solicitarPermisos() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      await AsyncStorage.setItem('notificaciones_activas', finalStatus === 'granted' ? 'true' : 'false');

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de notificaciones:', error);
      return false;
    }
  }

  /**
   * Verifica si los permisos están concedidos
   */
  async verificarPermisos() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const permiso = status === 'granted';
      const preferencia = await AsyncStorage.getItem('notificaciones_activas');

      return permiso && preferencia === 'true';
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  /**
   * Programa una notificación de prueba
   */
  async programarNotificacionPrueba(segundos = 10) {
    try {
      const tienePermisos = await this.verificarPermisos();

      if (!tienePermisos) {
        throw new Error('No tiene permisos para recibir notificaciones');
      }

      const trigger = new Date(Date.now() + segundos * 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Notificación de Prueba',
          body: 'Esta es una notificación de prueba desde MediApp',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      return true;
    } catch (error) {
      console.error('Error programando notificación de prueba:', error);
      return false;
    }
  }

  /**
   * Programa una notificación para recordatorio de cita
   */
  async programarRecordatorioCita(cita, minutosAnticipacion = 30) {
    try {
      const tienePermisos = await this.verificarPermisos();

      if (!tienePermisos) {
        console.log('No hay permisos para notificaciones');
        return false;
      }

      // Calcular fecha y hora de la notificación
      const fechaCita = new Date(cita.fecha_hora);
      const fechaNotificacion = new Date(fechaCita.getTime() - (minutosAnticipacion * 60 * 1000));

      // Solo programar si la fecha de notificación es futura
      if (fechaNotificacion <= new Date()) {
        console.log('La cita ya pasó o está muy próxima');
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de Cita Médica',
          body: `Tienes una cita con ${cita.medico?.nombre || 'el médico'} ${cita.medico?.apellido || ''} en ${minutosAnticipacion} minutos`,
          data: {
            citaId: cita.id,
            tipo: 'recordatorio_cita',
            medicoId: cita.medico_id,
            pacienteId: cita.paciente_id
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: fechaNotificacion,
      });

      console.log(`Notificación programada para cita ${cita.id} a las ${fechaNotificacion}`);
      return true;
    } catch (error) {
      console.error('Error programando recordatorio de cita:', error);
      return false;
    }
  }

  /**
   * Programa notificación para nueva cita pendiente (para médicos)
   */
  async programarNotificacionCitaPendiente(cita) {
    try {
      const tienePermisos = await this.verificarPermisos();

      if (!tienePermisos) {
        console.log('No hay permisos para notificaciones');
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nueva Cita Pendiente',
          body: `Tienes una nueva cita pendiente de aprobación con ${cita.paciente?.nombre || 'un paciente'}`,
          data: {
            citaId: cita.id,
            tipo: 'cita_pendiente',
            medicoId: cita.medico_id,
            pacienteId: cita.paciente_id
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Inmediata
      });

      console.log(`Notificación inmediata programada para cita pendiente ${cita.id}`);
      return true;
    } catch (error) {
      console.error('Error programando notificación de cita pendiente:', error);
      return false;
    }
  }

  /**
   * Programa notificación para confirmación de cita (para pacientes)
   */
  async programarNotificacionConfirmacionCita(cita) {
    try {
      const tienePermisos = await this.verificarPermisos();

      if (!tienePermisos) {
        console.log('No hay permisos para notificaciones');
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Cita Confirmada',
          body: `Tu cita con ${cita.medico?.nombre || 'el médico'} ha sido confirmada para ${this.formatearFechaCita(cita.fecha_hora)}`,
          data: {
            citaId: cita.id,
            tipo: 'cita_confirmada',
            medicoId: cita.medico_id,
            pacienteId: cita.paciente_id
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.NORMAL,
        },
        trigger: null, // Inmediata
      });

      console.log(`Notificación de confirmación programada para cita ${cita.id}`);
      return true;
    } catch (error) {
      console.error('Error programando notificación de confirmación:', error);
      return false;
    }
  }

  /**
   * Programa notificación para cancelación de cita
   */
  async programarNotificacionCancelacionCita(cita, motivo = '') {
    try {
      const tienePermisos = await this.verificarPermisos();

      if (!tienePermisos) {
        console.log('No hay permisos para notificaciones');
        return false;
      }

      const body = motivo
        ? `Tu cita con ${cita.medico?.nombre || 'el médico'} ha sido cancelada. Motivo: ${motivo}`
        : `Tu cita con ${cita.medico?.nombre || 'el médico'} ha sido cancelada`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Cita Cancelada',
          body,
          data: {
            citaId: cita.id,
            tipo: 'cita_cancelada',
            medicoId: cita.medico_id,
            pacienteId: cita.paciente_id
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.NORMAL,
        },
        trigger: null, // Inmediata
      });

      console.log(`Notificación de cancelación programada para cita ${cita.id}`);
      return true;
    } catch (error) {
      console.error('Error programando notificación de cancelación:', error);
      return false;
    }
  }

  /**
   * Programa notificación para resultados disponibles
   */
  async programarNotificacionResultadosDisponibles(resultados) {
    try {
      const tienePermisos = await this.verificarPermisos();

      if (!tienePermisos) {
        console.log('No hay permisos para notificaciones');
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Resultados Disponibles',
          body: `Tus resultados médicos están disponibles para revisión`,
          data: {
            tipo: 'resultados_disponibles',
            resultadoId: resultados.id
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.NORMAL,
        },
        trigger: null, // Inmediata
      });

      console.log(`Notificación de resultados programada para resultado ${resultados.id}`);
      return true;
    } catch (error) {
      console.error('Error programando notificación de resultados:', error);
      return false;
    }
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  async cancelarTodasNotificaciones() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas las notificaciones programadas han sido canceladas');
      return true;
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
      return false;
    }
  }

  /**
   * Cancela notificaciones específicas de una cita
   */
  async cancelarNotificacionesCita(citaId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduledNotifications) {
        if (notification.content.data?.citaId === citaId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }

      console.log(`Notificaciones canceladas para cita ${citaId}`);
      return true;
    } catch (error) {
      console.error('Error cancelando notificaciones de cita:', error);
      return false;
    }
  }

  /**
   * Formatea fecha y hora para mostrar en notificaciones
   */
  formatearFechaCita(fechaHora) {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Programa notificaciones automáticas para todas las citas próximas
   */
  async programarNotificacionesCitasProximas(citas, minutosAnticipacion = 30) {
    try {
      const resultados = [];

      for (const cita of citas) {
        // Solo programar para citas futuras
        if (new Date(cita.fecha_hora) > new Date()) {
          const programada = await this.programarRecordatorioCita(cita, minutosAnticipacion);
          resultados.push({
            citaId: cita.id,
            programada,
            fechaNotificacion: new Date(new Date(cita.fecha_hora).getTime() - (minutosAnticipacion * 60 * 1000))
          });
        }
      }

      console.log(`Notificaciones programadas para ${resultados.filter(r => r.programada).length} de ${citas.length} citas`);
      return resultados;
    } catch (error) {
      console.error('Error programando notificaciones masivas:', error);
      return [];
    }
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;