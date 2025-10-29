import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { getUsuarios, cambiarEstadoUsuario, deleteUsuario } from "../../api/usuarios";
import LoadingSpinner from "../../components/LoadingSpinner";
import QuickActionCard from "../../components/QuickActionCard";
import { useThemeColors } from "../../utils/themeColors";

const UsuariosScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const { user } = useAuthContext();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("todos");
  const [selectedEstado, setSelectedEstado] = useState("todos");
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Acciones rápidas para superadmin
  const quickActions = [
    {
      title: "Gestionar Médicos",
      subtitle: "Administrar médicos del sistema",
      onPress: () => navigation.navigate("GestionMedicosScreen"),
    },
    {
      title: "Gestionar Especialidades",
      subtitle: "Administrar especialidades médicas",
      onPress: () => navigation.navigate("GestionEspecialidadesScreen"),
    },
    {
      title: "Gestionar Pacientes",
      subtitle: "Administrar pacientes del sistema",
      onPress: () => navigation.navigate("GestionPacientesScreen"),
    },
    {
      title: "Crear Superadmin",
      subtitle: "Registrar nuevo Administrador en el sistema",
      onPress: () => navigation.navigate("CrearUsuarioScreen"),
    },
    {
      title: "Crear Médico",
      subtitle: "Registrar nuevo médico",
      onPress: () => navigation.navigate("CrearMedicoScreen"),
    },
    {
      title: "Crear Paciente",
      subtitle: "Registrar nuevo paciente",
      onPress: () => navigation.navigate("CrearPacienteScreen"),
    },
  ];

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
    }, [user, selectedRole, selectedEstado])
  );

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedRole !== "todos") {
        filters.rol = selectedRole;
      }
      if (selectedEstado !== "todos") {
        filters.activo = selectedEstado === "activo" ? 1 : 0;
      }
      const response = await getUsuarios(filters);
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

  const toggleUsuarioEstado = async (usuarioId, currentActivo) => {
    const newActivo = currentActivo ? 0 : 1;
    const actionText = newActivo === 1 ? "activar" : "desactivar";

    Alert.alert(
      `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario?`,
      `¿Estás seguro de que deseas ${actionText} este usuario?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const response = await cambiarEstadoUsuario(usuarioId, newActivo);
              if (response.success) {
                // Actualizar el estado local
                setUsuarios((prevUsuarios) =>
                  prevUsuarios.map((usuario) =>
                    usuario.id === usuarioId
                      ? { ...usuario, activo: newActivo === 1 }
                      : usuario
                  )
                );
                Alert.alert(
                  "Éxito",
                  `Usuario ${
                    newActivo === 1 ? "activado" : "desactivado"
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

  const eliminarUsuario = async (usuarioId) => {
    Alert.alert(
      "¿Eliminar usuario?",
      "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteUsuario(usuarioId);
              if (response.success) {
                // Remover el usuario de la lista local
                setUsuarios((prevUsuarios) =>
                  prevUsuarios.filter((usuario) => usuario.id !== usuarioId)
                );
                Alert.alert("Éxito", "Usuario eliminado correctamente");
              } else {
                Alert.alert("Error", "No se pudo eliminar el usuario");
              }
            } catch (error) {
              console.error("Error deleting usuario:", error);
              Alert.alert("Error", "No se pudo eliminar el usuario");
            }
          },
        },
      ]
    );
  };

  const editarUsuario = (usuarioId) => {
    navigation.navigate("EditUsuarioScreen", { usuarioId });
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usuario.cedula && usuario.cedula.includes(searchQuery));

    const matchesRole =
      selectedRole === "todos" || usuario.rol === selectedRole;

    const matchesEstado =
      selectedEstado === "todos" ||
      (selectedEstado === "activo" && usuario.activo) ||
      (selectedEstado === "inactivo" && !usuario.activo);

    return matchesSearch && matchesRole && matchesEstado;
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

  const getEstadoColor = (activo) => {
    return activo ? colors.success : colors.error;
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
              { backgroundColor: getEstadoColor(item.activo) },
            ]}
          >
            <Text style={styles.estadoBadgeText}>
              {item.activo ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => editarUsuario(item.id)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              item.activo
                ? styles.deactivateButton
                : styles.activateButton,
            ]}
            onPress={() => toggleUsuarioEstado(item.id, item.activo)}
          >
            <Text style={styles.actionButtonText}>
              {item.activo ? "Desactivar" : "Activar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => eliminarUsuario(item.id)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery || selectedRole !== "todos" || selectedEstado !== "todos"
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

        {/* Filtros por estado */}
        <View style={styles.filtersContainer}>
          {["todos", "activo", "inactivo"].map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filterButton,
                selectedEstado === estado && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedEstado(estado)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedEstado === estado && styles.activeFilterButtonText,
                ]}
              >
                {estado === "todos"
                  ? "Todos"
                  : estado === "activo"
                  ? "Activos"
                  : "Inactivos"}
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

      {/* Acciones rápidas para superadmin */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContainer}
        >
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              onPress={action.onPress}
              style={styles.quickActionCard}
            />
          ))}
        </ScrollView>
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
      color: colors.text,
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
    quickActionsSection: {
      backgroundColor: colors.white,
      padding: 16,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    quickActionsContainer: {
      gap: 12,
      paddingRight: 16,
    },
    quickActionCard: {
      width: 200,
      marginBottom: 0,
    },
    usuarioCard: {
      backgroundColor: colors.card || colors.surface,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow || colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
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
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    editButton: {
      backgroundColor: colors.info,
    },
    activateButton: {
      backgroundColor: colors.success,
    },
    deactivateButton: {
      backgroundColor: colors.warning,
    },
    deleteButton: {
      backgroundColor: colors.danger,
    },
    actionButtonText: {
      color: colors.white,
      fontSize: 12,
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
