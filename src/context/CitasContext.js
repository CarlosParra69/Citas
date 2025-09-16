import React, { createContext, useState, useContext } from "react";
import { getCitas, createCita, updateCita, cancelarCita } from "../api/citas";

const CitasContext = createContext();

export const CitasProvider = ({ children }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const response = await getCitas();
      setCitas(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarCita = async (citaData) => {
    try {
      setLoading(true);
      const response = await createCita(citaData);
      setCitas([...citas, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarCita = async (id, citaData) => {
    try {
      setLoading(true);
      const response = await updateCita(id, citaData);
      setCitas(citas.map((cita) => (cita.id === id ? response.data : cita)));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCita = async (id) => {
    try {
      setLoading(true);
      await cancelarCita(id);
      setCitas(citas.filter((cita) => cita.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitasContext.Provider
      value={{
        citas,
        loading,
        error,
        fetchCitas,
        agregarCita,
        actualizarCita,
        eliminarCita,
      }}
    >
      {children}
    </CitasContext.Provider>
  );
};

export const useCitas = () => {
  const context = useContext(CitasContext);
  if (!context) {
    throw new Error("useCitas debe ser usado dentro de un CitasProvider");
  }
  return context;
};
