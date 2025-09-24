import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CitasProvider } from "./src/context/CitasContext";
import { PacientesProvider } from "./src/context/PacientesContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { UsuariosProvider } from "./src/context/UsuariosContext";
import { EstadisticasProvider } from "./src/context/EstadisticasContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CitasProvider>
          <PacientesProvider>
            <UsuariosProvider>
              <EstadisticasProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </EstadisticasProvider>
            </UsuariosProvider>
          </PacientesProvider>
        </CitasProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
