import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EspecialidadesScreen from '../screens/Especialidades/EspecialidadesScreen';
import MedicosScreen from '../screens/Medicos/MedicosScreen';
import MedicoDetailScreen from '../screens/Medicos/MedicoDetailScreen';
import colors from '../utils/colors';

const Stack = createStackNavigator();

export default function EspecialidadesNavigator() {
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
        name="EspecialidadesMain" 
        component={EspecialidadesScreen} 
        options={{ title: 'Especialidades' }}
      />
      <Stack.Screen 
        name="MedicosScreen" 
        component={MedicosScreen} 
        options={({ route }) => ({ 
          title: route.params?.especialidadNombre || 'Médicos' 
        })}
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