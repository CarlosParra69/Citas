import axiosInstance from "../utils/axiosInstance";

/**
 * Subir avatar al servidor
 * @param {FormData} formData - FormData con la imagen
 * @returns {Promise} - Respuesta del servidor
 */
export const uploadAvatar = async (avatarData) => {
  try {
    // Verificar si es FormData o un objeto JSON
    const isFormData =
      avatarData instanceof FormData ||
      (avatarData.avatar && avatarData.avatar.uri);

    if (isFormData) {
      const response = await axiosInstance.post("/avatar/upload", avatarData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: axiosInstance.defaults.headers.Authorization,
        },
      });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      const response = await axiosInstance.post("/avatar/upload", avatarData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: axiosInstance.defaults.headers.Authorization,
        },
      });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    }
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

/**
 * Obtener avatar de un usuario específico por ID
 * @param {number} userId - ID del usuario
 * @returns {Promise} - Respuesta del servidor
 */
export const getAvatarByUserId = async (userId) => {
  try {
    const response = await axiosInstance.get(`/avatar/user/${userId}`);

    return {
      success: response.data.success,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error obteniendo avatar del usuario:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener el avatar",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Subir avatar público (sin autenticación)
 * @param {FormData} formData - FormData con la imagen y user_id
 * @returns {Promise} - Respuesta del servidor
 */
export const uploadAvatarPublic = async (avatarData) => {
  try {
    const response = await axiosInstance.post("/avatar/upload-public", avatarData, {
      headers: {
        "Content-Type": "multipart/form-data",
        // No incluir Authorization header para rutas públicas
      },
    });
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error subiendo avatar público:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al subir el avatar",
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Obtener imagen de avatar directamente por filename
 * @param {string} filename - Nombre del archivo de imagen
 * @returns {Promise} - URL de la imagen o null si hay error
 */
export const getAvatarImage = async (filename) => {
  try {
    if (!filename) {
      return null;
    }

    // Construir la URL completa para obtener la imagen
    const imageUrl = `${axiosInstance.defaults.baseURL}/avatar/image/${filename}`;
    return imageUrl;
  } catch (error) {
    console.error("Error obteniendo imagen de avatar:", error);
    return null;
  }
};
