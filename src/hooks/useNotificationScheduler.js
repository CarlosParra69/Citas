import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import notificationService from '../utils/notificationService';

/**
 * Hook personalizado para programar notificaciones automáticas de citas
 * @param {Array} citas - Lista de citas para programar notificaciones
 * @param {number} minutosAnticipacion - Minutos de anticipación para las notificaciones (default: 30)
 * @param {boolean} autoProgramar - Si debe programar automáticamente al cargar citas (default: true)
 */
export const useNotificationScheduler = (
  citas = [],
  minutosAnticipacion = 30,
  autoProgramar = true
) => {

  // Función para programar notificaciones para citas específicas
  const programarNotificacionesCitas = useCallback(async (citasParaProgramar = citas) => {
    try {
      if (!citasParaProgramar || citasParaProgramar.length === 0) {
        return { programadas: 0, total: 0 };
      }

      // Filtrar solo citas futuras
      const citasFuturas = citasParaProgramar.filter(cita =>
        new Date(cita.fecha_hora) > new Date()
      );

      if (citasFuturas.length === 0) {
        return { programadas: 0, total: citasParaProgramar.length };
      }

      const resultados = await notificationService.programarNotificacionesCitasProximas(
        citasFuturas,
        minutosAnticipacion
      );

      const programadas = resultados.filter(r => r.programada).length;

      console.log(`Notificaciones programadas automáticamente: ${programadas}/${citasFuturas.length}`);

      return {
        programadas,
        total: citasParaProgramar.length,
        futuras: citasFuturas.length
      };
    } catch (error) {
      console.error('Error programando notificaciones automáticas:', error);
      return { programadas: 0, total: 0 };
    }
  }, [citas, minutosAnticipacion]);

  // Función para programar una sola cita
  const programarNotificacionCita = useCallback(async (cita) => {
    try {
      if (!cita) return false;

      const exito = await notificationService.programarRecordatorioCita(cita, minutosAnticipacion);

      if (exito) {
        console.log(`Notificación programada para cita ${cita.id}`);
      }

      return exito;
    } catch (error) {
      console.error('Error programando notificación individual:', error);
      return false;
    }
  }, [minutosAnticipacion]);

  // Función para cancelar notificaciones de una cita
  const cancelarNotificacionesCita = useCallback(async (citaId) => {
    try {
      const exito = await notificationService.cancelarNotificacionesCita(citaId);

      if (exito) {
        console.log(`Notificaciones canceladas para cita ${citaId}`);
      }

      return exito;
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
      return false;
    }
  }, []);

  // Función para verificar permisos y mostrar alerta si es necesario
  const verificarPermisosNotificaciones = useCallback(async () => {
    try {
      const tienePermisos = await notificationService.verificarPermisos();

      if (!tienePermisos) {
        Alert.alert(
          'Permisos de Notificaciones',
          'Para recibir recordatorios de citas, necesitas habilitar las notificaciones push. ¿Deseas hacerlo ahora?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Habilitar', onPress: async () => {
              const permisosConcedidos = await notificationService.solicitarPermisos();
              if (permisosConcedidos) {
                // Programar notificaciones ahora que tenemos permisos
                await programarNotificacionesCitas();
              }
            }}
          ]
        );
      }

      return tienePermisos;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }, [programarNotificacionesCitas]);

  // Programar automáticamente cuando cambien las citas (si está habilitado)
  useEffect(() => {
    if (autoProgramar && citas.length > 0) {
      const timer = setTimeout(() => {
        programarNotificacionesCitas();
      }, 2000); // Esperar 2 segundos para evitar múltiples llamadas

      return () => clearTimeout(timer);
    }
  }, [citas, autoProgramar, programarNotificacionesCitas]);

  return {
    programarNotificacionesCitas,
    programarNotificacionCita,
    cancelarNotificacionesCita,
    verificarPermisosNotificaciones,
  };
};

export default useNotificationScheduler;