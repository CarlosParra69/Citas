import axiosInstance from "../utils/axiosInstance";

export const getConfiguracionNotificaciones = async () => {
  const response = await axiosInstance.get("/notificaciones/configuracion");
  return response.data;
};

export const updateConfiguracionNotificaciones = async (configuracion) => {
  const response = await axiosInstance.put(
    "/notificaciones/configuracion",
    configuracion
  );
  return response.data;
};

export const getHistorialNotificaciones = async () => {
  const response = await axiosInstance.get("/notificaciones/historial");
  return response.data;
};

export const marcarNotificacionLeida = async (notificacionId) => {
  const response = await axiosInstance.patch(
    `/notificaciones/${notificacionId}/leida`
  );
  return response.data;
};

export const enviarNotificacionTest = async (tipo) => {
  const response = await axiosInstance.post("/notificaciones/test", { tipo });
  return response.data;
};
