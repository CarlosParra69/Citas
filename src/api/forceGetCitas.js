import axiosInstance from "../utils/axiosInstance";

// Función alternativa para forzar la carga de todas las citas
export const forceGetAllCitas = async () => {
  try {
    const response = await axiosInstance.get("/citas", { 
      params: {} // Sin parámetros para obtener todas las citas
    });
    
    if (response.data && response.data.success) {
      const citasData = response.data.data?.data || response.data.data || [];
      return citasData;
    }
    
    return [];
  } catch (error) {
    return [];
  }
};