import React, { createContext, useState, useContext } from "react";
import {
  getEstadisticasMedico,
  getEstadisticasPaciente,
} from "../api/estadisticas";

const EstadisticasContext = createContext();

export const EstadisticasProvider = ({ children }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEstadisticasMedico = async (medicoId, periodo = "mes") => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEstadisticasMedico(medicoId, periodo);

      if (response.success) {
        setEstadisticas(response.data);
        return response.data;
      } else {
        throw new Error(
          response.message || "Error al cargar estadísticas del médico"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching estadísticas médico:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticasPaciente = async (pacienteId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEstadisticasPaciente(pacienteId);

      if (response.success) {
        setEstadisticas(response.data);
        return response.data;
      } else {
        throw new Error(
          response.message || "Error al cargar estadísticas del paciente"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching estadísticas paciente:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearEstadisticas = () => {
    setEstadisticas(null);
  };

  return (
    <EstadisticasContext.Provider
      value={{
        estadisticas,
        loading,
        error,
        fetchEstadisticasMedico,
        fetchEstadisticasPaciente,
        clearError,
        clearEstadisticas,
      }}
    >
      {children}
    </EstadisticasContext.Provider>
  );
};

export const useEstadisticas = () => {
  const context = useContext(EstadisticasContext);
  if (!context) {
    throw new Error(
      "useEstadisticas debe ser usado dentro de un EstadisticasProvider"
    );
  }
  return context;
};
