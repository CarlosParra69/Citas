import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CitasScreen from "../screens/Citas/CitasScreen";
import CrearCitaScreen from "../screens/Citas/CrearCitaScreen";
import DetalleCitaScreen from "../screens/Citas/DetalleCitaScreen";
import CitasHoyScreen from "../screens/Citas/CitasHoyScreen";
import CitasPendientesScreen from "../screens/Citas/CitasPendientesScreen";
import ConfirmarCitaScreen from "../screens/Citas/ConfirmarCitaScreen";
import MiAgendaScreen from "../screens/Citas/MiAgendaScreen";
import ValoracionScreen from "../screens/Citas/ValoracionScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function CitasNavigator() {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in CitasNavigator useThemeColors:", error);
    colors = {
      primary: "#FF6B35",
      white: "#FFFFFF",
    };
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
          color: colors.white,
        },
      }}
    >
      <Stack.Screen
        name="CitasMain"
        component={CitasScreen}
        options={{ title: "Mis Citas" }}
      />
      <Stack.Screen
        name="CrearCitaScreen"
        component={CrearCitaScreen}
        options={{ title: "Nueva Cita" }}
      />
      <Stack.Screen
        name="DetalleCitaScreen"
        component={DetalleCitaScreen}
        options={{ title: "Detalle de Cita" }}
      />
      <Stack.Screen
        name="CitasHoyScreen"
        component={CitasHoyScreen}
        options={{ title: "Citas de Hoy" }}
      />
      <Stack.Screen
        name="CitasPendientesScreen"
        component={CitasPendientesScreen}
        options={{ title: "Citas Pendientes" }}
      />
      <Stack.Screen
        name="ConfirmarCitaScreen"
        component={ConfirmarCitaScreen}
        options={{ title: "Confirmar Cita" }}
      />
      <Stack.Screen
        name="MiAgendaScreen"
        component={MiAgendaScreen}
        options={{ title: "Mi Agenda" }}
      />
      <Stack.Screen
        name="ValoracionScreen"
        component={ValoracionScreen}
        options={{ title: "Valoración del Paciente" }}
      />
    </Stack.Navigator>
  );
}
