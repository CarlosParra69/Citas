import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import { useThemeColors } from "../utils/themeColors";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  let colors;

  try {
    colors = useThemeColors();
  } catch (error) {
    console.error("Error in AuthNavigator useThemeColors:", error);
    colors = {
      primary: "#FF6B35",
      white: "#FFFFFF",
    };
  }

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
        name="Login"
        component={LoginScreen}
        options={{ title: "Iniciar Sesión" }}
      />
    </Stack.Navigator>
  );
}
