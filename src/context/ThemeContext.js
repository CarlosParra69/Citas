import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

let useColorScheme;
try {
  // Try to import useColorScheme hook from React Native
  const { useColorScheme: rnUseColorScheme } = require("react-native");
  useColorScheme = () => {
    try {
      const scheme = rnUseColorScheme();
      return scheme || "light";
    } catch (error) {
      console.error("Error using useColorScheme:", error);
      return "light";
    }
  };
} catch (error) {
  console.error("Error importing useColorScheme:", error);
  useColorScheme = () => "light";
}

const ThemeContext = createContext({
  theme: "light",
  isDark: false,
  isLight: true,
  isSystem: false,
  isLoading: false,
  toggleTheme: async () => {},
  setLightTheme: async () => {},
  setDarkTheme: async () => {},
  setSystemTheme: async () => {},
});

export const useTheme = () => {
  try {
    const context = useContext(ThemeContext);
    if (!context) {
      console.warn(
        "useTheme: ThemeContext not found, returning default values"
      );
      return {
        theme: "light",
        isDark: false,
        isLight: true,
        isSystem: false,
        isLoading: false,
        toggleTheme: async () => {},
        setLightTheme: async () => {},
        setDarkTheme: async () => {},
        setSystemTheme: async () => {},
      };
    }
    return context;
  } catch (error) {
    console.error("Error in useTheme hook:", error);
    return {
      theme: "light",
      isDark: false,
      isLight: true,
      isSystem: false,
      isLoading: false,
      toggleTheme: async () => {},
      setLightTheme: async () => {},
      setDarkTheme: async () => {},
      setSystemTheme: async () => {},
    };
  }
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme() || "light"; // Fallback to light if undefined
  const [theme, setTheme] = useState("light"); // Start with light theme as default
  const [isLoading] = useState(false); // Always false, don't block rendering

  useEffect(() => {
    loadThemePreference();
  }, [systemColorScheme]); // Add dependency to re-run when system theme changes

  const loadThemePreference = async () => {
    try {
      if (typeof AsyncStorage !== "undefined" && AsyncStorage.getItem) {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // Si no hay preferencia guardada, usar el del sistema
          setTheme(systemColorScheme || "light");
        }
      } else {
        setTheme(systemColorScheme || "light");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
      setTheme(systemColorScheme || "light");
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const setLightTheme = async () => {
    try {
      await AsyncStorage.setItem("theme", "light");
      setTheme("light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const setDarkTheme = async () => {
    try {
      await AsyncStorage.setItem("theme", "dark");
      setTheme("dark");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const setSystemTheme = async () => {
    try {
      await AsyncStorage.removeItem("theme");
      setTheme(systemColorScheme || "light");
    } catch (error) {
      console.error("Error removing theme preference:", error);
    }
  };

  const isDark = theme === "dark";
  const isLight = theme === "light";
  const isSystem = theme === (systemColorScheme || "light");

  const value = {
    theme,
    isDark,
    isLight,
    isSystem,
    isLoading: false, // Always return false to avoid blocking
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
