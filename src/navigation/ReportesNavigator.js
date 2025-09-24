import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../screens/Reportes/DashboardScreen";
import MedicosMasCitasScreen from "../screens/Reportes/MedicosMasCitasScreen";
import PatronesCitasScreen from "../screens/Reportes/PatronesCitasScreen";
import MedicoDetailScreen from "../screens/Medicos/MedicoDetailScreen";
import UsuariosScreen from "../screens/UsuariosScreen";
import MisEstadisticasScreen from "../screens/MisEstadisticasScreen";
import CrearMedicoScreen from "../screens/CrearMedicoScreen";
import GestionCitasScreen from "../screens/GestionCitasScreen";
import GestionEspecialidadesScreen from "../screens/GestionEspecialidadesScreen";
import GestionMedicosScreen from "../screens/GestionMedicosScreen";
import GestionPacientesScreen from "../screens/GestionPacientesScreen";
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
        name="UsuariosScreen"
        component={UsuariosScreen}
        options={{ title: "Gestión de Usuarios" }}
      />
      <Stack.Screen
        name="MisEstadisticasScreen"
        component={MisEstadisticasScreen}
        options={{ title: "Mis Estadísticas" }}
      />
      <Stack.Screen
        name="CrearMedicoScreen"
        component={CrearMedicoScreen}
        options={{ title: "Crear Médico" }}
      />
      <Stack.Screen
        name="GestionCitasScreen"
        component={GestionCitasScreen}
        options={{ title: "Gestión de Citas" }}
      />
      <Stack.Screen
        name="GestionEspecialidadesScreen"
        component={GestionEspecialidadesScreen}
        options={{ title: "Gestión de Especialidades" }}
      />
      <Stack.Screen
        name="GestionMedicosScreen"
        component={GestionMedicosScreen}
        options={{ title: "Gestión de Médicos" }}
      />
      <Stack.Screen
        name="GestionPacientesScreen"
        component={GestionPacientesScreen}
        options={{ title: "Gestión de Pacientes" }}
      />
    </Stack.Navigator>
  );
}
