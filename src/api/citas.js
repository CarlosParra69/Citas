import axiosInstance from "../utils/axiosInstance";

export const getCitas = async () => {
  const response = await axiosInstance.get("/citas");
  return response.data;
};

export const getCitaById = async (id) => {
  const response = await axiosInstance.get(`/citas/${id}`);
  return response.data;
};

export const getCitasHoy = async () => {
  const response = await axiosInstance.get("/citas-hoy");
  return response.data;
};

export const getProximasCitas = async () => {
  const response = await axiosInstance.get("/proximas-citas");
  return response.data;
};

export const createCita = async (citaData) => {
  const response = await axiosInstance.post("/citas", citaData);
  return response.data;
};

export const updateCita = async (id, citaData) => {
  const response = await axiosInstance.put(`/citas/${id}`, citaData);
  return response.data;
};

export const cambiarEstadoCita = async (id, estadoData) => {
  const response = await axiosInstance.patch(`/citas/${id}/estado`, estadoData);
  return response.data;
};

export const cancelarCita = async (id, motivoCancelacion = "") => {
  const response = await axiosInstance.patch(`/citas/${id}/cancelar`, {
    motivo_cancelacion: motivoCancelacion,
  });
  return response.data;
};

export const getCitasPendientes = async (medicoId) => {
  const response = await axiosInstance.get(`/citas-pendientes/${medicoId}`);
  return response.data;
};

export const aprobarCita = async (id, data = {}) => {
  const response = await axiosInstance.patch(`/citas/${id}/aprobar`, data);
  return response.data;
};

export const rechazarCita = async (id, data) => {
  const response = await axiosInstance.patch(`/citas/${id}/rechazar`, data);
  return response.data;
};
