import axiosInstance from "../utils/axiosInstance";

export const getMedicos = async (params = {}) => {
  const response = await axiosInstance.get("/medicos", { params });
  return response.data;
};

export const getMedicoById = async (id) => {
  const response = await axiosInstance.get(`/medicos/${id}`);
  return response.data;
};

export const getMedicoDisponibilidad = async (id, fecha = null) => {
  const params = fecha ? { fecha } : {};
  const response = await axiosInstance.get(`/medicos/${id}/disponibilidad`, { params });
  return response.data;
};

export const createMedico = async (medicoData) => {
  const response = await axiosInstance.post("/medicos", medicoData);
  return response.data;
};

export const updateMedico = async (id, medicoData) => {
  const response = await axiosInstance.put(`/medicos/${id}`, medicoData);
  return response.data;
};

export const deleteMedico = async (id) => {
  const response = await axiosInstance.delete(`/medicos/${id}`);
  return response.data;
};
