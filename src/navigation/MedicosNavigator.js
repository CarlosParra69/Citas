import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MedicosScreen from '../screens/Medicos/MedicosScreen';
import MedicoDetailScreen from '../screens/Medicos/MedicoDetailScreen';
import colors from '../utils/colors';

const Stack = createStackNavigator();

export default function MedicosNavigator() {
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
        name="MedicosMain" 
        component={MedicosScreen} 
        options={{ title: 'Médicos' }}
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