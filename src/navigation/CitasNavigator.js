import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CitasScreen from "../screens/Citas/CitasScreen";
import CrearCitaScreen from "../screens/Citas/CrearCitaScreen";
import DetalleCitaScreen from "../screens/Citas/DetalleCitaScreen";
import CitasHoyScreen from "../screens/Citas/CitasHoyScreen";
import CitasPendientesScreen from "../screens/Citas/CitasPendientesScreen";
import MiAgendaScreen from "../screens/Citas/MiAgendaScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function CitasNavigator() {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
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
        name="MiAgendaScreen"
        component={MiAgendaScreen}
        options={{ title: "Mi Agenda" }}
      />
    </Stack.Navigator>
  );
}
