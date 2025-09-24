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
import { useAuthContext } from "../context/AuthContext";
import {
  getEspecialidades,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad,
} from "../api/especialidades";
import LoadingSpinner from "../components/LoadingSpinner";
import ButtonPrimary from "../components/ButtonPrimary";
import { useThemeColors } from "../utils/themeColors";
import { useGlobalStyles } from "../styles/globalStyles";

const GestionEspecialidadesScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const styles = createStyles(colors);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEspecialidad, setEditingEspecialidad] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.rol === "superadmin") {
        loadEspecialidades();
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

  const loadEspecialidades = async () => {
    try {
      setLoading(true);
      const response = await getEspecialidades();
      if (response.success) {
        setEspecialidades(response.data || []);
      } else {
        Alert.alert("Error", "No se pudieron cargar las especialidades");
      }
    } catch (error) {
      console.error("Error loading especialidades:", error);
      Alert.alert("Error", "No se pudieron cargar las especialidades");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEspecialidades();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
    });
    setEditingEspecialidad(null);
    setShowCreateForm(false);
  };

  const handleCreate = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre de la especialidad es requerido");
      return;
    }

    try {
      setSaving(true);
      const response = await createEspecialidad({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      });

      if (response.success) {
        await loadEspecialidades();
        resetForm();
        Alert.alert("Éxito", "Especialidad creada correctamente");
      } else {
        Alert.alert(
          "Error",
          response.message || "No se pudo crear la especialidad"
        );
      }
    } catch (error) {
      console.error("Error creating especialidad:", error);
      Alert.alert("Error", "No se pudo crear la especialidad");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (especialidad) => {
    setEditingEspecialidad(especialidad);
    setFormData({
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion || "",
    });
    setShowCreateForm(true);
  };

  const handleUpdate = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre de la especialidad es requerido");
      return;
    }

    try {
      setSaving(true);
      const response = await updateEspecialidad(editingEspecialidad.id, {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      });

      if (response.success) {
        await loadEspecialidades();
        resetForm();
        Alert.alert("Éxito", "Especialidad actualizada correctamente");
      } else {
        Alert.alert(
          "Error",
          response.message || "No se pudo actualizar la especialidad"
        );
      }
    } catch (error) {
      console.error("Error updating especialidad:", error);
      Alert.alert("Error", "No se pudo actualizar la especialidad");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (especialidadId) => {
    Alert.alert(
      "¿Eliminar especialidad?",
      "Esta acción no se puede deshacer y puede afectar a médicos y citas existentes",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteEspecialidad(especialidadId);
              if (response.success) {
                setEspecialidades((prev) =>
                  prev.filter((esp) => esp.id !== especialidadId)
                );
                Alert.alert("Éxito", "Especialidad eliminada correctamente");
              } else {
                Alert.alert("Error", "No se pudo eliminar la especialidad");
              }
            } catch (error) {
              console.error("Error deleting especialidad:", error);
              Alert.alert("Error", "No se pudo eliminar la especialidad");
            }
          },
        },
      ]
    );
  };

  const filteredEspecialidades = (
    Array.isArray(especialidades) ? especialidades : []
  ).filter(
    (especialidad) =>
      especialidad.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      especialidad.descripcion
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const renderEspecialidadItem = ({ item }) => (
    <View style={styles.especialidadCard}>
      <View style={styles.especialidadInfo}>
        <Text style={styles.especialidadName}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.especialidadDescription}>{item.descripcion}</Text>
        )}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Médicos: {item.medicos_count || 0}
          </Text>
          <Text style={styles.statsText}>Citas: {item.citas_count || 0}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingEspecialidad ? "Editar Especialidad" : "Nueva Especialidad"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la especialidad *"
        value={formData.nombre}
        onChangeText={(value) =>
          setFormData((prev) => ({ ...prev, nombre: value }))
        }
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción (opcional)"
        value={formData.descripcion}
        onChangeText={(value) =>
          setFormData((prev) => ({ ...prev, descripcion: value }))
        }
        multiline
        numberOfLines={3}
      />

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.formButton, styles.cancelButton]}
          onPress={resetForm}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.formButton, styles.saveButton]}
          onPress={editingEspecialidad ? handleUpdate : handleCreate}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving
              ? "Guardando..."
              : editingEspecialidad
              ? "Actualizar"
              : "Crear"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "No se encontraron especialidades con la búsqueda"
          : "No hay especialidades registradas"}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando especialidades..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Especialidades</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar especialidades..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.resultsText}>
          {filteredEspecialidades.length} especialidad
          {filteredEspecialidades.length !== 1 ? "es" : ""} encontrada
          {filteredEspecialidades.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Botón crear */}
      {!showCreateForm && (
        <View style={styles.createButtonContainer}>
          <ButtonPrimary
            title="Nueva Especialidad"
            onPress={() => setShowCreateForm(true)}
            style={styles.createButton}
          />
        </View>
      )}

      {/* Formulario */}
      {showCreateForm && renderForm()}

      {/* Lista de especialidades */}
      <FlatList
        data={filteredEspecialidades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEspecialidadItem}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={
          filteredEspecialidades.length === 0 ? styles.emptyList : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Create styles function that uses theme colors
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
    resultsText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    createButtonContainer: {
      padding: 16,
    },
    createButton: {
      marginBottom: 0,
    },
    formContainer: {
      backgroundColor: colors.white,
      margin: 16,
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
    formTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 16,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.lightGray,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.white,
      marginBottom: 12,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    formButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    formButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: colors.gray,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    especialidadCard: {
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
    especialidadInfo: {
      marginBottom: 12,
    },
    especialidadName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    especialidadDescription: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 8,
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 16,
    },
    statsText: {
      fontSize: 12,
      color: colors.lightGray,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: colors.lightGray,
      paddingTop: 12,
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
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    editButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "600",
    },
    deleteButtonText: {
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

export default GestionEspecialidadesScreen;
