import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthContext } from "../context/AuthContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  let user, loading;

  try {
    const authContext = useAuthContext();
    user = authContext?.user;
    loading = authContext?.loading || false;
  } catch (error) {
    console.error("Error in AppNavigator useAuthContext:", error);
    user = null;
    loading = false;
  }

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    try {
      return <LoadingSpinner message="Verificando sesión..." />;
    } catch (error) {
      console.error("Error rendering LoadingSpinner in AppNavigator:", error);
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F9F9F9",
          }}
        >
          <Text style={{ fontSize: 16, color: "#FF6B35" }}>Cargando...</Text>
        </View>
      );
    }
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}
