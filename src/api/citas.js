import axiosInstance from "../utils/axiosInstance";

export const getCitas = async (params = {}) => {
  const response = await axiosInstance.get("/citas", { params });
  return response.data;
};

export const getCitaById = async (id) => {
  const response = await axiosInstance.get(`/citas/${id}`);
  return response.data;
};

export const getCitasHoy = async (params = {}) => {
  const response = await axiosInstance.get("/citas-hoy", { params });
  return response.data;
};

export const atenderCita = async (id) => {
  const response = await axiosInstance.patch(`/citas/${id}/atender`);
  return response.data;
};

export const completarCita = async (id, citaData) => {
  const response = await axiosInstance.patch(
    `/citas/${id}/completar`,
    citaData
  );
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

export const confirmarCita = async (id) => {
  const response = await axiosInstance.patch(`/citas/${id}/confirmar`);
  return response.data;
};

export const destroyCita = async (id) => {
  const response = await axiosInstance.delete(`/citas/${id}`);
  return response.data;
};
