import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CitasNavigator from "./CitasNavigator";
import EspecialidadesNavigator from "./EspecialidadesNavigator";
import MedicosNavigator from "./MedicosNavigator";
import PacientesNavigator from "./PacientesNavigator";
import ReportesNavigator from "./ReportesNavigator";
import PerfilNavigator from "./PerfilNavigator";
import AdministracionNavigator from "./AdministracionNavigator";
import { useThemeColors } from "../utils/themeColors";
import { useAuthContext } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const isSuperadmin = user?.rol === "superadmin";
  const isPaciente = user?.rol === "paciente";
  const isMedico = user?.rol === "medico";

  const getTabBarIcon = ({ focused, color, size, route }) => {
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
    } else if (route.name === "Perfil") {
      iconName = focused ? "person" : "person-outline";
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: (props) => getTabBarIcon({ ...props, route }),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
        },
      })}
    >
      {/* Todas las pestañas comunes */}
      <Tab.Screen name="Citas" component={CitasNavigator} />
      <Tab.Screen name="Médicos" component={MedicosNavigator} />
      <Tab.Screen name="Perfil" component={PerfilNavigator} />

      {/* Pestañas específicas por rol */}
      {isSuperadmin && (
        <>
          <Tab.Screen
            name="Especialidades"
            component={EspecialidadesNavigator}
          />
          <Tab.Screen name="Pacientes" component={PacientesNavigator} />
          <Tab.Screen
            name="Administración"
            component={AdministracionNavigator}
          />
          <Tab.Screen name="Reportes" component={ReportesNavigator} />
        </>
      )}

      {isMedico && (
        <>
          <Tab.Screen
            name="Especialidades"
            component={EspecialidadesNavigator}
          />
          <Tab.Screen name="Reportes" component={ReportesNavigator} />
        </>
      )}

      {isPaciente && (
        <>{/* Los pacientes solo tienen acceso a Citas, Médicos y Perfil */}</>
      )}
    </Tab.Navigator>
  );
}
