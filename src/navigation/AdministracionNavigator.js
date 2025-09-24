import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import UsuariosScreen from "../screens/UsuariosScreen";
import CrearUsuarioScreen from "../screens/CrearUsuarioScreen";
import GestionMedicosScreen from "../screens/GestionMedicosScreen";
import GestionEspecialidadesScreen from "../screens/GestionEspecialidadesScreen";
import GestionPacientesScreen from "../screens/GestionPacientesScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function AdministracionNavigator() {
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
        name="UsuariosScreen"
        component={UsuariosScreen}
        options={{ title: "Gestión de Usuarios" }}
      />
      <Stack.Screen
        name="CrearUsuarioScreen"
        component={CrearUsuarioScreen}
        options={{ title: "Crear Usuario" }}
      />
      <Stack.Screen
        name="GestionMedicosScreen"
        component={GestionMedicosScreen}
        options={{ title: "Gestión de Médicos" }}
      />
      <Stack.Screen
        name="GestionEspecialidadesScreen"
        component={GestionEspecialidadesScreen}
        options={{ title: "Gestión de Especialidades" }}
      />
      <Stack.Screen
        name="GestionPacientesScreen"
        component={GestionPacientesScreen}
        options={{ title: "Gestión de Pacientes" }}
      />
    </Stack.Navigator>
  );
}
