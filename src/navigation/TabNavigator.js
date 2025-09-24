import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CitasNavigator from "./CitasNavigator";
import EspecialidadesNavigator from "./EspecialidadesNavigator";
import MedicosNavigator from "./MedicosNavigator";
import PacientesNavigator from "./PacientesNavigator";
import ReportesNavigator from "./ReportesNavigator";
import ConfiguracionNavigator from "./ConfiguracionNavigator";
import AdministracionNavigator from "./AdministracionNavigator";
import { useThemeColors } from "../utils/themeColors";
import { useAuthContext } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const isSuperadmin = user?.rol === "superadmin";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Citas") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Especialidades") {
            iconName = focused ? "medical" : "medical-outline";
          } else if (route.name === "Médicos") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Pacientes") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "Administración") {
            iconName = focused ? "shield" : "shield-outline";
          } else if (route.name === "Reportes") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Configuración") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false, // Ocultar header del tab para usar el del stack
        tabBarLabelStyle: {
          fontSize: 10,
        },
      })}
    >
      <Tab.Screen name="Citas" component={CitasNavigator} />
      <Tab.Screen name="Especialidades" component={EspecialidadesNavigator} />
      <Tab.Screen name="Médicos" component={MedicosNavigator} />
      <Tab.Screen name="Pacientes" component={PacientesNavigator} />
      {isSuperadmin && (
        <Tab.Screen name="Administración" component={AdministracionNavigator} />
      )}
      <Tab.Screen name="Reportes" component={ReportesNavigator} />
      <Tab.Screen name="Configuración" component={ConfiguracionNavigator} />
    </Tab.Navigator>
  );
}
