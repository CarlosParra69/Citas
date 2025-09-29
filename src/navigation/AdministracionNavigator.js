import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import UsuariosScreen from "../screens/Auth/UsuariosScreen";
import CrearUsuarioScreen from "../screens/Auth/CrearUsuarioScreen";
import GestionMedicosScreen from "../screens/Medicos/GestionMedicosScreen";
import GestionEspecialidadesScreen from "../screens/Especialidades/GestionEspecialidadesScreen";
import GestionPacientesScreen from "../screens/Pacientes/GestionPacientesScreen";
import CrearMedicoScreen from "../screens/Medicos/CrearMedicoScreen";
import CrearPacienteScreen from "../screens/Pacientes/CrearPacienteScreen";
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
          color: colors.white,
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
      <Stack.Screen
        name="CrearMedicoScreen"
        component={CrearMedicoScreen}
        options={{ title: "Crear Médico" }}
      />
      <Stack.Screen
        name="CrearPacienteScreen"
        component={CrearPacienteScreen}
        options={{ title: "Crear Paciente" }}
      />
    </Stack.Navigator>
  );
}
