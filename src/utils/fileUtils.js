import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

// Crear la carpeta avatars si no existe
export const ensureAvatarsDirectory = async () => {
  try {
    const avatarsDir = `${FileSystem.documentDirectory}avatars/`;

    // Crear el directorio directamente (se crea si no existe)
    await FileSystem.makeDirectoryAsync(avatarsDir, {
      intermediates: true,
    }).catch(() => {
      // Ignorar error si el directorio ya existe
      console.log("Carpeta avatars ya existe o se creó exitosamente");
    });

    return avatarsDir;
  } catch (error) {
    console.error("Error creando carpeta avatars:", error);
    // Retornar el directorio de todas formas
    return `${FileSystem.documentDirectory}avatars/`;
  }
};

// Generar nombre único para el archivo
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = originalName.split(".").pop();
  return `avatar_${timestamp}_${random}.${extension}`;
};

// Guardar imagen en la carpeta avatars
export const saveImageToAvatars = async (imageUri, userId) => {
  try {
    // Asegurar que la carpeta existe
    const avatarsDir = await ensureAvatarsDirectory();

    // Generar nombre único para el archivo
    const fileName = generateUniqueFileName(`user_${userId}_avatar.jpg`);
    const destinationUri = `${avatarsDir}${fileName}`;

    // Copiar la imagen a la carpeta avatars
    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationUri,
    });

    console.log("Imagen guardada en:", destinationUri);
    return destinationUri;
  } catch (error) {
    console.error("Error guardando imagen en avatars:", error);
    throw error;
  }
};

// Comprimir imagen antes de guardarla
export const compressImage = async (imageUri, quality = 0.7) => {
  try {
    const compressedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800, height: 800 } }], // Redimensionar a máximo 800x800
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return compressedImage.uri;
  } catch (error) {
    console.error("Error comprimiendo imagen:", error);
    return imageUri; // Retornar la original si hay error
  }
};

// Obtener la ruta relativa para enviar al backend
export const getRelativePath = (absolutePath) => {
  // Extraer solo el nombre del archivo de la ruta completa
  const pathParts = absolutePath.split("/");
  const fileName = pathParts[pathParts.length - 1];
  return `avatars/${fileName}`;
};

// Eliminar imagen de la carpeta avatars
export const deleteAvatarImage = async (imagePath) => {
  try {
    if (!imagePath) return;

    // Eliminar sin opciones adicionales
    await FileSystem.deleteAsync(imagePath);
    console.log("Imagen eliminada:", imagePath);
  } catch (error) {
    console.error("Error eliminando imagen:", error.message);
    // No lanzar error si el archivo no existe
  }
};

// Obtener todas las imágenes de avatars
export const getAllAvatars = async () => {
  try {
    const avatarsDir = await ensureAvatarsDirectory();
    const files = await FileSystem.readDirectoryAsync(avatarsDir);

    return files.map((fileName) => `${avatarsDir}${fileName}`);
  } catch (error) {
    console.error("Error obteniendo avatars:", error);
    return [];
  }
};

// Verificar si una imagen existe en avatars
export const avatarExists = async (imagePath) => {
  try {
    // Verificación simple sin parámetros adicionales
    const fileInfo = await FileSystem.getInfoAsync(imagePath);
    return fileInfo.exists === true;
  } catch (error) {
    console.log("Error verificando existencia de archivo:", error.message);
    return false;
  }
};
