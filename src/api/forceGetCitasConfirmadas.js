import axiosInstance from "../utils/axiosInstance";

// Función para forzar la carga de todas las citas confirmadas (para superadmin)
export const forceGetAllCitasConfirmadas = async () => {
  try {
    const response = await axiosInstance.get("/citas", { 
      params: { 
        estado: "programada" // Solo citas con estado "programada" (confirmadas por médico, pendientes de confirmación del paciente)
      }
    });
    
    if (response.data && response.data.success) {
      const citasData = response.data.data?.data || response.data.data || [];
      return citasData;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching force citas confirmadas:", error);
    return [];
  }
};