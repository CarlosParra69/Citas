/**
 * Simple theming shim for the project.
 * Provides a minimal useThemeColors() hook that returns a color palette.
 * Can be later replaced by a full ThemeContext without changing call sites.
 */
import { useTheme } from "../context/ThemeContext";
import base from "./colors";

export const lightColors = {
  ...base,
  // Ensure required keys exist with sensible defaults
  background: base.background ?? "#F9F9F9",
  text: base.text ?? "#1C1C1E",
  gray: base.gray ?? "#8E8E93",
  textSecondary: base.gray ?? "#8E8E93",
  lightBackground: base.background ?? "#F9F9F9",
};

export const darkColors = {
  ...base,
  background: "#121212",
  text: "#F2F2F2",
  gray: "#A0A0A0",
  border: "#2A2A2A",
  surface: "#1E1E1E",
  textSecondary: "#A0A0A0",
  lightBackground: "#1E1E1E",
};

export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme === "dark" ? darkColors : lightColors;
};

export default lightColors;
