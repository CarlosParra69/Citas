import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CitasScreen from '../screens/Citas/CitasScreen';
import EspecialidadesScreen from '../screens/Especialidades/EspecialidadesScreen';
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
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
      })}
    >
      <Tab.Screen name="Citas" component={CitasScreen} />
      <Tab.Screen name="Especialidades" component={EspecialidadesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
