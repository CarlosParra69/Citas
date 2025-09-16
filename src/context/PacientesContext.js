import React, { createContext, useState, useContext } from "react";
import {
  getPacientes,
  createPaciente,
  updatePaciente,
  deletePaciente,
} from "../api/pacientes";

const PacientesContext = createContext();

export const PacientesProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await getPacientes();
      setPacientes(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarPaciente = async (pacienteData) => {
    try {
      setLoading(true);
      const response = await createPaciente(pacienteData);
      setPacientes([...pacientes, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarPaciente = async (id, pacienteData) => {
    try {
      setLoading(true);
      const response = await updatePaciente(id, pacienteData);
      setPacientes(
        pacientes.map((paciente) =>
          paciente.id === id ? response.data : paciente
        )
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarPaciente = async (id) => {
    try {
      setLoading(true);
      await deletePaciente(id);
      setPacientes(pacientes.filter((paciente) => paciente.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PacientesContext.Provider
      value={{
        pacientes,
        loading,
        error,
        fetchPacientes,
        agregarPaciente,
        actualizarPaciente,
        eliminarPaciente,
      }}
    >
      {children}
    </PacientesContext.Provider>
  );
};

export const usePacientes = () => {
  const context = useContext(PacientesContext);
  if (!context) {
    throw new Error(
      "usePacientes debe ser usado dentro de un PacientesProvider"
    );
  }
  return context;
};
