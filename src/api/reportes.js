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
