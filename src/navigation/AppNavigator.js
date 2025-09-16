import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { useAuthContext } from "../context/AuthContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useAuthContext();

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
