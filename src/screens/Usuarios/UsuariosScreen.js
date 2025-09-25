import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { getUsuarios, updateUsuarioEstado } from "../../api/usuarios";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";

const UsuariosScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("todos");
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "superadmin") {
        loadUsuarios();
      } else {
        Alert.alert(
          "Acceso Denegado",
          "No tienes permisos para acceder a esta pantalla",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }, [user])
  );

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await getUsuarios();
      if (response.success) {
        setUsuarios(response.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar los usuarios");
      }
    } catch (error) {
      console.error("Error loading usuarios:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsuarios();
    setRefreshing(false);
  };

  const toggleUsuarioEstado = async (usuarioId, currentEstado) => {
    const newEstado = currentEstado === "activo" ? "inactivo" : "activo";
    const actionText = newEstado === "activo" ? "activar" : "desactivar";

    Alert.alert(
      `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario?`,
      `¿Estás seguro de que deseas ${actionText} este usuario?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const response = await updateUsuarioEstado(usuarioId, newEstado);
              if (response.success) {
                // Actualizar el estado local
                setUsuarios((prevUsuarios) =>
                  prevUsuarios.map((usuario) =>
                    usuario.id === usuarioId
                      ? { ...usuario, estado: newEstado }
                      : usuario
                  )
                );
                Alert.alert(
                  "Éxito",
                  `Usuario ${
                    newEstado === "activo" ? "activado" : "desactivado"
                  } correctamente`
                );
              } else {
                Alert.alert(
                  "Error",
                  "No se pudo actualizar el estado del usuario"
                );
              }
            } catch (error) {
              console.error("Error updating usuario estado:", error);
              Alert.alert(
                "Error",
                "No se pudo actualizar el estado del usuario"
              );
            }
          },
        },
      ]
    );
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usuario.cedula && usuario.cedula.includes(searchQuery));

    const matchesRole =
      selectedRole === "todos" || usuario.rol === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (rol) => {
    switch (rol) {
      case "superadmin":
        return colors.error;
      case "medico":
        return colors.success;
      case "paciente":
        return colors.primary;
      default:
        return colors.gray;
    }
  };

  const getEstadoColor = (estado) => {
    return estado === "activo" ? colors.success : colors.error;
  };

  const renderUsuarioItem = ({ item }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioHeader}>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioName}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.usuarioEmail}>{item.email}</Text>
          {item.cedula && (
            <Text style={styles.usuarioCedula}>Cédula: {item.cedula}</Text>
          )}
        </View>

        <View style={styles.badgesContainer}>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleColor(item.rol) },
            ]}
          >
            <Text style={styles.roleBadgeText}>
              {item.rol
                ? item.rol.charAt(0).toUpperCase() + item.rol.slice(1)
                : "Sin rol"}
            </Text>
          </View>

          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: getEstadoColor(item.estado) },
            ]}
          >
            <Text style={styles.estadoBadgeText}>
              {item.estado
                ? item.estado.charAt(0).toUpperCase() + item.estado.slice(1)
                : "Sin estado"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.estado === "activo"
              ? styles.deactivateButton
              : styles.activateButton,
          ]}
          onPress={() => toggleUsuarioEstado(item.id, item.estado)}
        >
          <Text style={styles.actionButtonText}>
            {item.estado === "activo" ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery || selectedRole !== "todos"
          ? "No se encontraron usuarios con los filtros aplicados"
          : "No hay usuarios registrados"}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o cédula..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros por rol */}
        <View style={styles.filtersContainer}>
          {["todos", "superadmin", "medico", "paciente"].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                selectedRole === role && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedRole === role && styles.activeFilterButtonText,
                ]}
              >
                {role === "todos"
                  ? "Todos"
                  : role
                  ? role.charAt(0).toUpperCase() + role.slice(1)
                  : "Sin rol"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultsText}>
          {filteredUsuarios.length} usuario
          {filteredUsuarios.length !== 1 ? "s" : ""} encontrado
          {filteredUsuarios.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUsuarioItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          filteredUsuarios.length === 0 ? styles.emptyList : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.white,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 16,
      textAlign: "center",
    },
    searchContainer: {
      marginBottom: 12,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.white,
    },
    filtersContainer: {
      flexDirection: "row",
      marginBottom: 12,
      gap: 8,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.lightGray,
      alignItems: "center",
    },
    activeFilterButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 12,
      color: colors.gray,
      fontWeight: "500",
    },
    activeFilterButtonText: {
      color: colors.white,
    },
    resultsText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    usuarioCard: {
      backgroundColor: colors.white,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    usuarioHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    usuarioInfo: {
      flex: 1,
    },
    usuarioName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    usuarioEmail: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 2,
    },
    usuarioCedula: {
      fontSize: 12,
      color: colors.lightGray,
    },
    badgesContainer: {
      alignItems: "flex-end",
      gap: 4,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    roleBadgeText: {
      fontSize: 10,
      color: colors.white,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    estadoBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    estadoBadgeText: {
      fontSize: 10,
      color: colors.white,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    actionsContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.lightGray,
      paddingTop: 12,
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
    },
    activateButton: {
      backgroundColor: colors.success,
    },
    deactivateButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
    },
    emptyList: {
      flexGrow: 1,
    },
  });

export default UsuariosScreen;
