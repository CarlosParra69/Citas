import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/Auth/ProfileScreen";
import EditProfileScreen from "../screens/Auth/EditProfileScreen";
import ConfiguracionNotificacionesScreen from "../screens/ConfiguracionNotificacionesScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function PerfilNavigator() {
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
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
      <Stack.Screen
        name="Configuracion"
        component={ConfiguracionNotificacionesScreen}
        options={{ title: "Configuración" }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ title: "Editar Perfil" }}
      />
    </Stack.Navigator>
  );
}
