import axiosInstance from "../utils/axiosInstance";

export const getEstadisticasMedico = async (medicoId, periodo = "mes") => {
  const response = await axiosInstance.get(
    `/reportes/estadisticas-medico/${medicoId}?periodo=${periodo}`
  );
  return response.data;
};

export const getEstadisticasPaciente = async (pacienteId) => {
  const response = await axiosInstance.get(
    `/estadisticas/paciente/${pacienteId}`
  );
  return response.data;
};

export const getEstadisticasSistema = async () => {
  const response = await axiosInstance.get("/estadisticas/sistema");
  return response.data;
};
