import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import useAuth from "../../hooks/useAuth";
import ButtonPrimary from "../../components/ButtonPrimary";
import globalStyles from "../../styles/globalStyles";
import colors from "../../utils/colors";

const ProfileScreen = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.title}>Mi Perfil</Text>
        
        <View style={globalStyles.card}>
          <Text style={styles.label}>Nombre completo:</Text>
          <Text style={styles.value}>{user?.nombre_completo || `${user?.nombre} ${user?.apellido}` || "No disponible"}</Text>
          
          <Text style={styles.label}>Cédula:</Text>
          <Text style={styles.value}>{user?.cedula || "No disponible"}</Text>
          
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || "No disponible"}</Text>
          
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{user?.telefono || "No disponible"}</Text>
          
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{user?.edad ? `${user.edad} años` : "No disponible"}</Text>
          
          <Text style={styles.label}>EPS:</Text>
          <Text style={styles.value}>{user?.eps || "No especificada"}</Text>
          
          <Text style={styles.label}>Fecha de registro:</Text>
          <Text style={styles.value}>
            {user?.created_at 
              ? new Date(user.created_at).toLocaleDateString('es-ES')
              : "No disponible"
            }
          </Text>
        </View>

        <ButtonPrimary
          title="Cerrar Sesión"
          onPress={handleLogout}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 8,
  },
});

export default ProfileScreen;