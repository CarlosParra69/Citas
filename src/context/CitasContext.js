import React, { createContext, useState, useContext } from "react";
import { getCitas, createCita, updateCita, cancelarCita, getCitasHoy } from "../api/citas";

const CitasContext = createContext();

export const CitasProvider = ({ children }) => {
  const [citas, setCitas] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCitas();
      
      if (response.success) {
        // El backend devuelve datos paginados, extraemos el array de datos
        const citasData = response.data?.data || response.data || [];
        setCitas(citasData);
      } else {
        throw new Error(response.message || "Error al cargar citas");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching citas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitasHoy = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCitasHoy();
      
      if (response.success) {
        // El backend puede devolver datos paginados o un array directo
        const citasData = response.data?.data || response.data || [];
        setCitasHoy(citasData);
      } else {
        throw new Error(response.message || "Error al cargar citas de hoy");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching citas hoy:", err);
    } finally {
      setLoading(false);
    }
  };

  const agregarCita = async (citaData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createCita(citaData);
      
      if (response.success) {
        const nuevaCita = response.data;
        setCitas(prevCitas => [...prevCitas, nuevaCita]);
        return nuevaCita;
      } else {
        throw new Error(response.message || "Error al crear cita");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const actualizarCita = async (id, citaData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateCita(id, citaData);
      
      if (response.success) {
        const citaActualizada = response.data;
        setCitas(prevCitas => 
          prevCitas.map(cita => cita.id === id ? citaActualizada : cita)
        );
        return citaActualizada;
      } else {
        throw new Error(response.message || "Error al actualizar cita");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const eliminarCita = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelarCita(id);
      
      if (response.success) {
        setCitas(prevCitas => prevCitas.filter(cita => cita.id !== id));
        setCitasHoy(prevCitas => prevCitas.filter(cita => cita.id !== id));
      } else {
        throw new Error(response.message || "Error al cancelar cita");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
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
    <CitasContext.Provider
      value={{
        citas,
        citasHoy,
        loading,
        error,
        fetchCitas,
        fetchCitasHoy,
        agregarCita,
        actualizarCita,
        eliminarCita,
        clearError,
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
