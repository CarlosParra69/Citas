import React, { createContext, useState, useContext } from "react";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuarioById,
} from "../api/usuarios";

const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsuarios = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsuarios(filters);

      if (response.success) {
        const usuariosData = response.data?.data || response.data || [];
        setUsuarios(usuariosData);
      } else {
        throw new Error(response.message || "Error al cargar usuarios");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarioById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsuarioById(id);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Error al cargar usuario");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const agregarUsuario = async (usuarioData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createUsuario(usuarioData);

      if (response.success) {
        const nuevoUsuario = response.data;
        setUsuarios((prevUsuarios) => [...prevUsuarios, nuevoUsuario]);
        return nuevoUsuario;
      } else {
        throw new Error(response.message || "Error al crear usuario");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = async (id, usuarioData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateUsuario(id, usuarioData);

      if (response.success) {
        const usuarioActualizado = response.data;
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === id ? usuarioActualizado : usuario
          )
        );
        return usuarioActualizado;
      } else {
        throw new Error(response.message || "Error al actualizar usuario");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteUsuario(id);

      if (response.success) {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((usuario) => usuario.id !== id)
        );
      } else {
        throw new Error(response.message || "Error al eliminar usuario");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <UsuariosContext.Provider
      value={{
        usuarios,
        loading,
        error,
        fetchUsuarios,
        fetchUsuarioById,
        agregarUsuario,
        actualizarUsuario,
        eliminarUsuario,
        clearError,
      }}
    >
      {children}
    </UsuariosContext.Provider>
  );
};

export const useUsuarios = () => {
  const context = useContext(UsuariosContext);
  if (!context) {
    throw new Error("useUsuarios debe ser usado dentro de un UsuariosProvider");
  }
  return context;
};
