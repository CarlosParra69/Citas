import React, { createContext, useState, useContext } from "react";
import {
  getCitas,
  createCita,
  updateCita,
  cancelarCita,
  getCitasHoy,
  getCitasPendientes,
  aprobarCita,
  rechazarCita,
  confirmarCita,
  atenderCita,
  completarCita,
  destroyCita,
} from "../api/citas";
import { forceGetAllCitas } from "../api/forceGetCitas";

const CitasContext = createContext({
  citas: [],
  citasHoy: [],
  citasPendientes: [],
  forceCitas: [],
  loading: false,
  forceLoading: false,
  error: null,
  fetchCitas: async () => {},
  fetchCitasHoy: async () => {},
  fetchCitasPendientes: async () => {},
  fetchForceCitas: async () => {},
  agregarCita: async () => {},
  actualizarCita: async () => {},
  eliminarCita: async () => {},
  aprobarCitaPendiente: async () => {},
  rechazarCitaPendiente: async () => {},
  completarCitaPendiente: async () => {},
  clearError: () => {},
  clearCitas: () => {},
  clearForceCitas: () => {},
  destroyCitaById: async () => {},
});

export const CitasProvider = ({ children }) => {
  const [citas, setCitas] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [forceCitas, setForceCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [forceLoading, setForceLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCitas = async (user = null) => {
    try {
      setLoading(true);
      setError(null);

      // Limpiar citas anteriores para evitar mostrar datos de otros usuarios
      setCitas([]);

      // Filtrar citas según el rol del usuario
      let params = {};
      if (user?.rol === "medico" && user?.medico_id) {
        params.medico_id = user.medico_id;
      } else if (user?.rol === "paciente" && user?.paciente_id) {
        params.paciente_id = user.paciente_id;
      } else {
        // Si no hay usuario o rol válido, no cargar citas
        setCitas([]);
        setLoading(false);
        return;
      }

      if (typeof getCitas === "function") {
        try {
          const response = await getCitas(params);

          if (response && response.success) {
            // El backend devuelve datos paginados, extraemos el array de datos
            const citasData = response.data?.data || response.data || [];
            setCitas(Array.isArray(citasData) ? citasData : []);
          } else {
            throw new Error(response?.message || "Error al cargar citas");
          }
        } catch (apiError) {
          console.error("API Error in fetchCitas:", apiError);
          setCitas([]);
        }
      } else {
        console.warn("getCitas is not a function:", getCitas);
        setCitas([]);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching citas:", err);
      setCitas([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCitasHoy = async (user = null) => {
    try {
      setLoading(true);
      setError(null);

      // Si es médico, filtrar citas de hoy por su ID
      let params = {};
      if (user?.rol === "medico" && user?.medico_id) {
        params.medico_id = user.medico_id;
      } else if (user?.rol === "paciente" && user?.paciente_id) {
        params.paciente_id = user.paciente_id;
      }

      const response = await getCitasHoy(params);

      if (response && response.success !== false) {
        // El backend puede devolver datos paginados o un array directo
        const citasData = response.data?.data || response.data || [];
        setCitasHoy(citasData);
      } else {
        setCitasHoy([]);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching citas hoy:", err);
      setCitasHoy([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchForceCitas = async (user = null) => {
    try {
      setForceLoading(true);
      setError(null);

      // Solo permitir para superadministradores
      if (user?.rol !== "superadmin") {
        setForceCitas([]);
        setForceLoading(false);
        return;
      }

      const citasData = await forceGetAllCitas();
      setForceCitas(citasData);
      
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching force citas:", err);
      setForceCitas([]);
    } finally {
      setForceLoading(false);
    }
  };

  const fetchCitasPendientes = async (medicoId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCitasPendientes(medicoId);

      if (response && response.success !== false) {
        const citasData = response.data?.data || response.data || [];
        setCitasPendientes(citasData);
        return citasData;
      } else {
        setCitasPendientes([]);
        return [];
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error fetching citas pendientes:", err);
      setCitasPendientes([]);
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
        setCitas((prevCitas) => [...prevCitas, nuevaCita]);
        return nuevaCita;
      } else {
        throw new Error(response.message || "Error al crear cita");
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

  const actualizarCita = async (id, citaData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateCita(id, citaData);

      if (response.success) {
        const citaActualizada = response.data;
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaActualizada : cita))
        );
        return citaActualizada;
      } else {
        throw new Error(response.message || "Error al actualizar cita");
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

  const eliminarCita = async (id, motivoCancelacion = "") => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelarCita(id, motivoCancelacion);

      if (response.success) {
        const citaCancelada = response.data;
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaCancelada : cita))
        );
        setCitasHoy((prevCitas) => prevCitas.filter((cita) => cita.id !== id));
        setCitasPendientes((prevCitas) =>
          prevCitas.filter((cita) => cita.id !== id)
        );
        return citaCancelada;
      } else {
        throw new Error(response.message || "Error al cancelar cita");
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

  const aprobarCitaPendiente = async (id, observaciones = "") => {
    try {
      setLoading(true);
      setError(null);
      const response = await aprobarCita(id, { observaciones });

      if (response.success) {
        const citaAprobada = response.data;
        // Actualizar en todas las listas
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaAprobada : cita))
        );
        setCitasPendientes((prevCitas) =>
          prevCitas.filter((cita) => cita.id !== id)
        );
        return citaAprobada;
      } else {
        throw new Error(response.message || "Error al aprobar cita");
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

  const rechazarCitaPendiente = async (id, motivoRechazo) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rechazarCita(id, {
        motivo_rechazo: motivoRechazo,
      });

      if (response.success) {
        const citaRechazada = response.data;
        // Actualizar en todas las listas
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaRechazada : cita))
        );
        setCitasPendientes((prevCitas) =>
          prevCitas.filter((cita) => cita.id !== id)
        );
        return citaRechazada;
      } else {
        throw new Error(response.message || "Error al rechazar cita");
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

  const confirmarCitaPendiente = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await confirmarCita(id);

      if (response.success) {
        const citaConfirmada = response.data;
        // Actualizar en todas las listas
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaConfirmada : cita))
        );
        return citaConfirmada;
      } else {
        throw new Error(response.message || "Error al confirmar cita");
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

  const atenderCitaPendiente = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await atenderCita(id);

      if (response.success) {
        const citaEnCurso = response.data;
        // Actualizar en todas las listas
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaEnCurso : cita))
        );
        setCitasHoy((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaEnCurso : cita))
        );
        return citaEnCurso;
      } else {
        throw new Error(response.message || "Error al atender cita");
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

  const completarCitaPendiente = async (id, citaData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await completarCita(id, citaData);

      if (response.success) {
        const citaCompletada = response.data;
        // Actualizar en todas las listas
        setCitas((prevCitas) =>
          prevCitas.map((cita) => (cita.id === id ? citaCompletada : cita))
        );
        setCitasHoy((prevCitas) => prevCitas.filter((cita) => cita.id !== id));
        return citaCompletada;
      } else {
        throw new Error(response.message || "Error al completar cita");
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

  const clearCitas = () => {
    setCitas([]);
    setCitasHoy([]);
    setCitasPendientes([]);
  };

  const clearForceCitas = () => {
    setForceCitas([]);
  };

  const destroyCitaById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await destroyCita(id);

      if (response.success) {
        // Remover la cita de todas las listas
        setCitas((prevCitas) => prevCitas.filter((cita) => cita.id !== id));
        setCitasHoy((prevCitas) => prevCitas.filter((cita) => cita.id !== id));
        setCitasPendientes((prevCitas) => prevCitas.filter((cita) => cita.id !== id));
        setForceCitas((prevCitas) => prevCitas.filter((cita) => cita.id !== id));
        return response.data;
      } else {
        throw new Error(response.message || "Error al eliminar cita");
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

  return (
    <CitasContext.Provider
      value={{
        citas,
        citasHoy,
        citasPendientes,
        forceCitas,
        loading,
        forceLoading,
        error,
        fetchCitas,
        fetchCitasHoy,
        fetchCitasPendientes,
        fetchForceCitas,
        agregarCita,
        actualizarCita,
        eliminarCita,
        aprobarCitaPendiente,
        rechazarCitaPendiente,
        confirmarCitaPendiente,
        atenderCitaPendiente,
        completarCitaPendiente,
        clearError,
        clearCitas,
        clearForceCitas,
        destroyCitaById,
      }}
    >
      {children}
    </CitasContext.Provider>
  );
};

export const useCitas = () => {
  try {
    const context = useContext(CitasContext);
    if (!context) {
      console.warn(
        "useCitas: CitasContext not found, returning default values"
      );
      return {
        citas: [],
        citasHoy: [],
        citasPendientes: [],
        forceCitas: [],
        loading: false,
        forceLoading: false,
        error: null,
        fetchCitas: async () => {},
        fetchCitasHoy: async () => {},
        fetchCitasPendientes: async () => {},
        fetchForceCitas: async () => {},
        agregarCita: async () => {},
        actualizarCita: async () => {},
        eliminarCita: async () => {},
        aprobarCitaPendiente: async () => {},
        rechazarCitaPendiente: async () => {},
        completarCitaPendiente: async () => {},
        clearError: () => {},
        clearCitas: () => {},
        clearForceCitas: () => {},
        destroyCitaById: async () => {},
      };
    }
    return context;
  } catch (error) {
    console.error("Error in useCitas hook:", error);
    return {
      citas: [],
      citasHoy: [],
      citasPendientes: [],
      forceCitas: [],
      loading: false,
      forceLoading: false,
      error: null,
      fetchCitas: async () => {},
      fetchCitasHoy: async () => {},
      fetchCitasPendientes: async () => {},
      fetchForceCitas: async () => {},
      agregarCita: async () => {},
      actualizarCita: async () => {},
      eliminarCita: async () => {},
      aprobarCitaPendiente: async () => {},
      rechazarCitaPendiente: async () => {},
      completarCitaPendiente: async () => {},
      clearError: () => {},
      clearCitas: () => {},
      clearForceCitas: () => {},
      destroyCitaById: async () => {},
    };
  }
};
