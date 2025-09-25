import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MedicosScreen from "../screens/Medicos/MedicosScreen";
import MedicoDetailScreen from "../screens/Medicos/MedicoDetailScreen";
import CrearMedicoScreen from "../screens/Medicos/CrearMedicoScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function MedicosNavigator() {
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
        name="MedicosMain"
        component={MedicosScreen}
        options={{ title: "Médicos" }}
      />
      <Stack.Screen
        name="MedicoDetailScreen"
        component={MedicoDetailScreen}
        options={({ route }) => ({
          title: route.params?.medicoNombre || "Detalle Médico",
        })}
      />
      <Stack.Screen
        name="CrearMedicoScreen"
        component={CrearMedicoScreen}
        options={({ route }) => ({
          title: route.params?.medico ? "Editar Médico" : "Crear Médico",
        })}
      />
    </Stack.Navigator>
  );
}
