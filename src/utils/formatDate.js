export const formatDate = (date) => {
  if (!date) return "";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleDateString("es-ES", options);
};

export const formatShortDate = (date) => {
  if (!date) return "";

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return new Date(date).toLocaleDateString("es-ES", options);
};

export const formatTime = (date) => {
  if (!date) return "";

  const options = {
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleTimeString("es-ES", options);
};

/**
 * Convierte una fecha a formato ISO local para evitar problemas de zona horaria
 * @param {Date} dateTime - La fecha y hora a convertir
 * @returns {string} - Fecha en formato ISO (ej: "2024-01-15T15:30:00")
 */
export const formatDateTimeForAPI = (dateTime) => {
  if (!dateTime) return "";

  // Crear fecha en zona horaria local
  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, "0");
  const day = String(dateTime.getDate()).padStart(2, "0");
  const hours = String(dateTime.getHours()).padStart(2, "0");
  const minutes = String(dateTime.getMinutes()).padStart(2, "0");
  const seconds = String(dateTime.getSeconds()).padStart(2, "0");

  // Formato: YYYY-MM-DDTHH:MM:SS (sin Z para indicar que es local)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Función para verificar si el formato es correcto
export const validateDateTimeFormat = (dateTimeString) => {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  return isoRegex.test(dateTimeString);
};

/**
 * Verifica si una fecha es futura considerando la zona horaria local
 * @param {Date} dateTime - La fecha y hora a verificar
 * @param {number} minutesBuffer - Minutos de buffer (default: 30)
 * @returns {boolean} - True si la fecha es futura
 */
export const isDateTimeFuture = (dateTime, minutesBuffer = 30) => {
  if (!dateTime) return false;

  const now = new Date();
  const bufferTime = new Date(now.getTime() + minutesBuffer * 60 * 1000);

  return dateTime > bufferTime;
};

/**
 * Obtiene la información de zona horaria del dispositivo
 * @returns {object} - Información de zona horaria
 */
export const getTimezoneInfo = () => {
  const now = new Date();
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: now.getTimezoneOffset(),
    timestamp: now.getTime(),
    iso: now.toISOString(),
    local: now.toLocaleString("es-CO", { timeZone: "America/Bogota" }),
  };
};
