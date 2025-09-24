import axiosInstance from "../utils/axiosInstance";

export const getDashboardData = () => {
  return axiosInstance.get("/reportes/dashboard");
};

export const getMedicosMasCitas = () => {
  return axiosInstance.get("/reportes/medicos-mas-citas");
};

export const getPatronesCitas = () => {
  return axiosInstance.get("/reportes/patrones-citas");
};

export const dashboardMedico = () => {
  return axiosInstance.get("/reportes/dashboard-medico");
};

export const dashboardPaciente = () => {
  return axiosInstance.get("/reportes/dashboard-paciente");
};

export const estadisticasMedico = (medicoId = null) => {
  const url = medicoId
    ? `/reportes/estadisticas-medico/${medicoId}`
    : "/reportes/estadisticas-medico";
  return axiosInstance.get(url);
};
