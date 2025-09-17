import React from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import useAuth from "../../hooks/useAuth";
import ButtonPrimary from "../../components/ButtonPrimary";
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

  const nombreCompleto = user?.nombre_completo || 
    (user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : null) ||
    user?.name || "Usuario";

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>
          Información de tu cuenta y datos personales
        </Text>
        
        {/* Información personal */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nombreCompleto.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{nombreCompleto}</Text>
            <Text style={styles.userEmail}>{user?.email || "No disponible"}</Text>
          </View>
        </View>

        {/* Información detallada */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre completo:</Text>
            <Text style={styles.value}>{nombreCompleto}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cédula:</Text>
            <Text style={styles.value}>{user?.cedula || "No disponible"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email || "No disponible"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{user?.telefono || "No disponible"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Edad:</Text>
            <Text style={styles.value}>{user?.edad ? `${user.edad} años` : "No disponible"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>EPS:</Text>
            <Text style={styles.value}>{user?.eps || "No especificada"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de registro:</Text>
            <Text style={styles.value}>
              {user?.created_at 
                ? new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : "No disponible"
              }
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <ButtonPrimary
            title="Editar Perfil"
            onPress={() => Alert.alert("Información", "Funcionalidad próximamente disponible")}
            style={[styles.actionButton, styles.secondaryButton]}
          />
          
          <ButtonPrimary
            title="Cerrar Sesión"
            onPress={handleLogout}
            loading={loading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.gray,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: colors.gray,
    flex: 1,
    textAlign: "right",
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 0,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
});

export default ProfileScreen;