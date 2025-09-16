import axiosInstance from "../utils/axiosInstance";

export const getCitas = () => {
  return axiosInstance.get("/citas");
};

export const getCitaById = (id) => {
  return axiosInstance.get(`/citas/${id}`);
};

export const getCitasHoy = () => {
  return axiosInstance.get("/citas-hoy");
};

export const createCita = (citaData) => {
  return axiosInstance.post("/citas", citaData);
};

export const updateCita = (id, citaData) => {
  return axiosInstance.put(`/citas/${id}`, citaData);
};

export const cancelarCita = (id) => {
  return axiosInstance.delete(`/citas/${id}`);
};
