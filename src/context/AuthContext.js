import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un token guardado al iniciar la app
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const userData = await authApi.getProfile();
        setUser(userData.data);
      }
    } catch (error) {
      console.log("No hay sesión activa");
      await AsyncStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, cedula) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login({ email, cedula });
      
      if (response.success && response.data.access_token) {
        await AsyncStorage.setItem("token", response.data.access_token);
        setUser(response.data.paciente);
        return response;
      } else {
        throw new Error(response.message || "Error en el login");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(userData);
      
      if (response.success && response.data.access_token) {
        // Auto-login después del registro exitoso
        await AsyncStorage.setItem("token", response.data.access_token);
        setUser(response.data.paciente);
        return response;
      } else {
        throw new Error(response.message || "Error en el registro");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.log("Error al hacer logout en el servidor:", err);
    } finally {
      await AsyncStorage.removeItem("token");
      setUser(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
};
