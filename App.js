import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CitasProvider } from "./src/context/CitasContext";
import { PacientesProvider } from "./src/context/PacientesContext";

export default function App() {
  return (
    <AuthProvider>
      <CitasProvider>
        <PacientesProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </PacientesProvider>
      </CitasProvider>
    </AuthProvider>
  );
}
