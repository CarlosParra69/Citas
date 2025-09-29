import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "../api/auth";

const AuthContext = createContext({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
  setUser: () => {},
});

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
      if (typeof AsyncStorage !== "undefined" && AsyncStorage.getItem) {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          try {
            if (typeof authApi !== "undefined" && authApi.getProfile) {
              const userData = await authApi.getProfile();
              setUser(userData.data);
            } else {
              console.warn("authApi.getProfile not available");
              setUser(null);
            }
          } catch (apiError) {
            console.error("Error getting profile:", apiError);
            try {
              if (
                typeof AsyncStorage !== "undefined" &&
                AsyncStorage.removeItem
              ) {
                await AsyncStorage.removeItem("token");
              }
            } catch (removeError) {
              console.error("Error removing token:", removeError);
            }
          }
        }
      }
    } catch (error) {
      // Log detallado para debugging (solo en consola)
      console.error("Error al verificar estado de autenticación:", error);

      // Verificar si es un error de base de datos
      if (error.message && error.message.includes("SQLSTATE")) {
        console.error(
          "Error de base de datos en checkAuthState:",
          error.message
        );
      }

      console.log("No hay sesión activa");
      try {
        if (typeof AsyncStorage !== "undefined" && AsyncStorage.removeItem) {
          await AsyncStorage.removeItem("token");
        }
      } catch (storageError) {
        console.error("Error removing token:", storageError);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.login({ email, password });

      if (response.success && response.data.access_token) {
        await AsyncStorage.setItem("token", response.data.access_token);
        setUser(response.data.user);
        return response;
      } else {
        throw new Error(response.message || "Error en el login");
      }
    } catch (err) {
      // El mensaje ya viene sanitizado desde el interceptor de axios
      const errorMessage = err.message;
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
      // El mensaje ya viene sanitizado desde el interceptor de axios
      const errorMessage = err.message;
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
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.warn(
        "useAuthContext: AuthContext not found, returning default values"
      );
      return {
        user: null,
        loading: false,
        error: null,
        login: async () => {},
        register: async () => {},
        logout: async () => {},
        clearError: () => {},
        setUser: () => {},
      };
    }
    return context;
  } catch (error) {
    console.error("Error in useAuthContext hook:", error);
    return {
      user: null,
      loading: false,
      error: null,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      clearError: () => {},
      setUser: () => {},
    };
  }
};
