import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/Reportes/DashboardScreen';
import MedicosMasCitasScreen from '../screens/Reportes/MedicosMasCitasScreen';
import PatronesCitasScreen from '../screens/Reportes/PatronesCitasScreen';
import MedicoDetailScreen from '../screens/Medicos/MedicoDetailScreen';
import colors from '../utils/colors';

const Stack = createStackNavigator();

export default function ReportesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="MedicosMasCitasScreen" 
        component={MedicosMasCitasScreen} 
        options={{ title: 'Médicos Top' }}
      />
      <Stack.Screen 
        name="PatronesCitasScreen" 
        component={PatronesCitasScreen} 
        options={{ title: 'Patrones de Citas' }}
      />
      <Stack.Screen 
        name="MedicoDetailScreen" 
        component={MedicoDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.medicoNombre || 'Detalle Médico' 
        })}
      />
    </Stack.Navigator>
  );
}