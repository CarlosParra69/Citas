import axiosInstance from '../utils/axiosInstance';

export const getEspecialidades = async () => {
  const response = await axiosInstance.get('/especialidades');
  return response.data;
};

export const getEspecialidadById = async (id) => {
  const response = await axiosInstance.get(`/especialidades/${id}`);
  return response.data;
};

export const getMedicosByEspecialidad = async (especialidadId) => {
  const response = await axiosInstance.get(`/especialidades/${especialidadId}/medicos`);
  return response.data;
};
