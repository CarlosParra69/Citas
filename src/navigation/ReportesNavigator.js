import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../screens/Reportes/DashboardScreen";
import MedicosMasCitasScreen from "../screens/Reportes/MedicosMasCitasScreen";
import PatronesCitasScreen from "../screens/Reportes/PatronesCitasScreen";
import MedicoDetailScreen from "../screens/Medicos/MedicoDetailScreen";
import MisEstadisticasScreen from "../screens/Estadisticas/MisEstadisticasScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function ReportesNavigator() {
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
          color: colors.white,
        },
      }}
    >
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="MedicosMasCitasScreen"
        component={MedicosMasCitasScreen}
        options={{ title: "Médicos Top" }}
      />
      <Stack.Screen
        name="PatronesCitasScreen"
        component={PatronesCitasScreen}
        options={{ title: "Patrones de Citas" }}
      />
      <Stack.Screen
        name="MedicoDetailScreen"
        component={MedicoDetailScreen}
        options={({ route }) => ({
          title: route.params?.medicoNombre || "Detalle Médico",
        })}
      />
      <Stack.Screen
        name="MisEstadisticasScreen"
        component={MisEstadisticasScreen}
        options={{ title: "Mis Estadísticas" }}
      />
    </Stack.Navigator>
  );
}
