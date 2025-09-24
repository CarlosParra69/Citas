import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PacientesScreen from "../screens/Pacientes/PacientesScreen";
import PacienteDetailScreen from "../screens/Pacientes/PacienteDetailScreen";
import CrearPacienteScreen from "../screens/Pacientes/CrearPacienteScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function PacientesNavigator() {
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
        name="PacientesMain"
        component={PacientesScreen}
        options={{ title: "Pacientes" }}
      />
      <Stack.Screen
        name="PacienteDetailScreen"
        component={PacienteDetailScreen}
        options={({ route }) => ({
          title: route.params?.pacienteNombre || "Detalle Paciente",
        })}
      />
      <Stack.Screen
        name="CrearPacienteScreen"
        component={CrearPacienteScreen}
        options={{ title: "Crear Paciente" }}
      />
    </Stack.Navigator>
  );
}
