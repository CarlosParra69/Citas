import axiosInstance from "../utils/axiosInstance";

export const getUsuarios = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.rol) params.append("rol", filters.rol);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.search) params.append("search", filters.search);

  const response = await axiosInstance.get(`/usuarios?${params.toString()}`);
  return response.data;
};

export const getUsuarioById = async (id) => {
  const response = await axiosInstance.get(`/usuarios/${id}`);
  return response.data;
};

export const createUsuario = async (usuarioData) => {
  const response = await axiosInstance.post("/usuarios", usuarioData);
  return response.data;
};

export const updateUsuario = async (id, usuarioData) => {
  const response = await axiosInstance.put(`/usuarios/${id}`, usuarioData);
  return response.data;
};

export const deleteUsuario = async (id) => {
  const response = await axiosInstance.delete(`/usuarios/${id}`);
  return response.data;
};

export const cambiarEstadoUsuario = async (id, estado) => {
  const response = await axiosInstance.patch(`/usuarios/${id}/estado`, {
    estado,
  });
  return response.data;
};
