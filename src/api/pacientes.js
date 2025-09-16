import axiosInstance from "../utils/axiosInstance";

export const getPacientes = () => {
  return axiosInstance.get("/pacientes");
};

export const getPacienteById = (id) => {
  return axiosInstance.get(`/pacientes/${id}`);
};

export const getPacienteHistorial = (id) => {
  return axiosInstance.get(`/pacientes/${id}/historial`);
};

export const createPaciente = (pacienteData) => {
  return axiosInstance.post("/pacientes", pacienteData);
};

export const updatePaciente = (id, pacienteData) => {
  return axiosInstance.put(`/pacientes/${id}`, pacienteData);
};

export const deletePaciente = (id) => {
  return axiosInstance.delete(`/pacientes/${id}`);
};
