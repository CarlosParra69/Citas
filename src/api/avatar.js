import axiosInstance from "../utils/axiosInstance";

/**
 * Subir avatar al servidor
 * @param {FormData} formData - FormData con la imagen
 * @returns {Promise} - Respuesta del servidor
 */
export const uploadAvatar = async (formData) => {
  try {
    const response = await axiosInstance.post("/avatar/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error subiendo avatar:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al subir el avatar",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Eliminar avatar del servidor
 * @returns {Promise} - Respuesta del servidor
 */
export const deleteAvatar = async () => {
  try {
    const response = await axiosInstance.delete("/avatar/delete");

    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error eliminando avatar:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al eliminar el avatar",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Obtener avatar del usuario
 * @returns {Promise} - Respuesta del servidor
 */
export const getAvatar = async () => {
  try {
    const response = await axiosInstance.get("/avatar/get");

    return {
      success: response.data.success,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error obteniendo avatar:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener el avatar",
      error: error.response?.data || error.message,
    };
  }
};
