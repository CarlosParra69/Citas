/**
 * Simple theming shim for the project.
 * Provides a minimal useThemeColors() hook that returns a color palette.
 * Can be later replaced by a full ThemeContext without changing call sites.
 */
import { useTheme } from "../context/ThemeContext";

// Import colors with fallback - ultra defensive approach
let base;
try {
  try {
    // Try ES6 import first
    const colorsModule = require("./colors");
    base = colorsModule.default || colorsModule;
  } catch (requireError) {
    console.error("Error with require, trying direct import:", requireError);
    // Try direct import as fallback
    const colorsPath = "./colors";
    base = require(colorsPath);
  }
} catch (error) {
  console.error("Error importing colors in themeColors:", error);
  base = {
    primary: "#FF6B35",
    secondary: "#FF8C42",
    success: "#34C759",
    danger: "#FF3B30",
    warning: "#FF9500",
    info: "#FF8C42",
    light: "#F2F2F7",
    dark: "#1C1C1E",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#8E8E93",
    lightGray: "#C7C7CC",
    background: "#F9F9F9",
    border: "#C6C6C8",
    text: "#1C1C1E",
    error: "#FF3B30",
    surface: "#FFFFFF",
  };
}

const safeBase = base || {};

export const lightColors = {
  // Restaurar paleta de colores naranjas original para modo claro
  primary: "#FF6B35", // Naranja principal
  secondary: "#FF8C42", // Naranja secundario
  success: "#34C759", // Verde para éxito
  danger: "#FF3B30", // Rojo para errores
  warning: "#FF9500", // Naranja para advertencias
  info: "#FF8C42", // Naranja para información

  // Colores base para modo claro
  light: "#F2F2F7",
  dark: "#1C1C1E",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#8E8E93",
  lightGray: "#C7C7CC",
  background: "#F9F9F9", // Fondo gris claro
  border: "#C6C6C8", // Bordes gris claro
  text: "#000000", // Texto negro puro para títulos
  error: "#FF3B30", // Rojo para errores
  surface: "#FFFFFF", // Superficie blanca

  // Colores adicionales para mejor UX
  textSecondary: "#8E8E93", // Gris para texto secundario
  lightBackground: "#F9F9F9", // Fondo claro para tarjetas
  card: "#FFFFFF", // Fondo para tarjetas
  input: "#FFFFFF", // Fondo para inputs
  shadow: "rgba(0, 0, 0, 0.1)", // Sombra suave
};

export const darkColors = {
  // Paleta completamente oscura - negros y grises
  primary: "#2D2D2D", // Gris oscuro para elementos principales
  secondary: "#404040", // Gris medio para elementos secundarios
  success: "#4CAF50", // Verde para éxito (mismo en ambos modos)
  danger: "#F44336", // Rojo para errores (mismo en ambos modos)
  warning: "#FF9800", // Naranja para advertencias (mismo en ambos modos)
  info: "#2196F3", // Azul para información (mismo en ambos modos)

  // Colores base para modo oscuro - pura oscuridad
  light: "#F5F5F5", // Gris muy claro para contraste
  dark: "#000000", // Negro puro
  white: "#FFFFFF", // Blanco puro
  black: "#000000", // Negro puro
  gray: "#B0B0B0", // Gris medio para texto secundario
  lightGray: "#2A2A2A", // Gris oscuro para bordes

  // Fondos negros y grises oscuros
  background: "#121212", // Fondo principal negro grisáceo
  border: "#333333", // Bordes gris oscuro
  text: "#FFFFFF", // Texto blanco puro
  error: "#F44336", // Rojo para errores
  surface: "#1E1E1E", // Superficie gris muy oscuro
  surfaceSecondary: "#2A2A2A", // Superficie secundaria

  // Colores adicionales para UX en modo oscuro
  textSecondary: "#B0B0B0", // Gris claro para texto secundario
  lightBackground: "#1E1E1E", // Fondo para tarjetas
  card: "#1E1E1E", // Fondo para tarjetas
  input: "#2A2A2A", // Fondo para inputs
  shadow: "rgba(0, 0, 0, 0.5)", // Sombra negra intensa

  // Colores para estados interactivos
  hover: "#2A2A2A", // Color al pasar el mouse
  pressed: "#333333", // Color al presionar
  disabled: "#1A1A1A", // Color para elementos deshabilitados
};

export const useThemeColors = () => {
  try {
    const { theme } = useTheme();
    return theme === "dark" ? darkColors : lightColors;
  } catch (error) {
    console.error("Error in useThemeColors:", error);
    return lightColors; // Fallback to light colors
  }
};

export default lightColors;
