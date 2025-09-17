import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CitasNavigator from './CitasNavigator';
import EspecialidadesNavigator from './EspecialidadesNavigator';
import MedicosNavigator from './MedicosNavigator';
import PacientesNavigator from './PacientesNavigator';
import ReportesNavigator from './ReportesNavigator';
import ProfileScreen from '../screens/Auth/ProfileScreen';
import colors from '../utils/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Citas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Especialidades') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Médicos') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Pacientes') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else if (route.name === 'Reportes') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen name="Reportes" component={ReportesNavigator} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
