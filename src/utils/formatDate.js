export const formatDate = (date) => {
  if (!date) return "";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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

  const localDate = new Date(date);

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  };

  return localDate.toLocaleTimeString("es-ES", options);
};

/**
 * Formatea la fecha y hora de una cita específicamente
 * @param {string|Date} date - La fecha de la cita
 * @returns {string} - Fecha y hora formateada con AM/PM
 */
export const formatCitaDateTime = (date) => {
  if (!date) return "";

  const localDate = new Date(date);

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  };

  return localDate.toLocaleDateString("es-ES", options);
};

/**
 * Convierte una fecha a formato ISO local para evitar problemas de zona horaria
 * @param {Date} dateTime - La fecha y hora a convertir
 * @returns {string} - Fecha en formato ISO (ej: "2024-01-15T15:30:00")
 */
export const formatDateTimeForAPI = (dateTime) => {
  if (!dateTime) return "";

  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, "0");
  const day = String(dateTime.getDate()).padStart(2, "0");
  const hours = String(dateTime.getHours()).padStart(2, "0");
  const minutes = String(dateTime.getMinutes()).padStart(2, "0");
  const seconds = String(dateTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Convierte una fecha local a UTC antes de enviarla al backend
 * @param {Date} dateTime - La fecha y hora local a convertir
 * @returns {string} - Fecha en formato UTC (ej: "2024-01-15T20:30:00Z")
 */
export const formatDateTimeUTCForAPI = (dateTime) => {
  if (!dateTime) return "";

  const colombiaOffset = 5 * 60 * 60 * 1000;
  const utcDateTime = new Date(dateTime.getTime() + colombiaOffset);
  
  const year = utcDateTime.getFullYear();
  const month = String(utcDateTime.getMonth() + 1).padStart(2, "0");
  const day = String(utcDateTime.getDate()).padStart(2, "0");
  const hours = String(utcDateTime.getHours()).padStart(2, "0");
  const minutes = String(utcDateTime.getMinutes()).padStart(2, "0");
  const seconds = String(utcDateTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
};

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
