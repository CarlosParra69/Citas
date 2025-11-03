import axiosInstance from "../utils/axiosInstance";

export const getPacientes = async (filters = {}) => {
  const params = new URLSearchParams();

  // Solo agregar filtro si se especifica explícitamente
  if (filters.activo !== undefined && filters.activo !== null) {
    params.append("activo", filters.activo);
  }
  
  // Agregar otros filtros si se proporcionan
  if (filters.search) {
    params.append("search", filters.search);
  }
  
  const url = `/pacientes${params.toString() ? '?' + params.toString() : ''}`;
  const response = await axiosInstance.get(url);
  return response.data;
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

export const registerPaciente = (pacienteData) => {
  return axiosInstance.post("/pacientes/register", pacienteData);
};

export const updatePaciente = (id, pacienteData) => {
  return axiosInstance.put(`/pacientes/${id}`, pacienteData);
};

export const deletePaciente = (id) => {
  return axiosInstance.delete(`/pacientes/${id}`);
};
