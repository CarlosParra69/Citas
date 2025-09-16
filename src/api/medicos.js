import axiosInstance from "../utils/axiosInstance";

export const getMedicos = () => {
  return axiosInstance.get("/medicos");
};

export const getMedicoById = (id) => {
  return axiosInstance.get(`/medicos/${id}`);
};

export const getMedicoDisponibilidad = (id) => {
  return axiosInstance.get(`/medicos/${id}/disponibilidad`);
};

export const createMedico = (medicoData) => {
  return axiosInstance.post("/medicos", medicoData);
};

export const updateMedico = (id, medicoData) => {
  return axiosInstance.put(`/medicos/${id}`, medicoData);
};

export const deleteMedico = (id) => {
  return axiosInstance.delete(`/medicos/${id}`);
};
