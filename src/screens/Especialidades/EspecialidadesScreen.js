import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { getEspecialidades, createEspecialidad } from "../../api/especialidades";
import LoadingSpinner from "../../components/LoadingSpinner";
import CardItem from "../../components/CardItem";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";
import { useRoleBasedData } from "../../hooks/useRoleBasedData";

const EspecialidadesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { isSuperadmin } = useRoleBasedData();
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEspecialidades();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadEspecialidades = async () => {
    try {
      setError(null);
      const response = await getEspecialidades();

      if (response.success) {
        const especialidadesData = response.data || [];
        setEspecialidades(especialidadesData);
      } else {
        throw new Error(response.message || "Error al cargar especialidades");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading especialidades:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEspecialidades();
    setRefreshing(false);
  };

  const handleEspecialidadPress = (especialidad) => {
    navigation.navigate("MedicosScreen", {
      especialidadId: especialidad.id,
      especialidadNombre: especialidad.nombre,
    });
  };

  const handleCreateEspecialidad = () => {
    setShowCreateModal(true);
  };

  const handleSaveEspecialidad = async () => {
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
        setShowCreateModal(false);
        setFormData({ nombre: "", descripcion: "" });
        Alert.alert("Éxito", "Especialidad creada correctamente");
      } else {
        Alert.alert(
          "Error",
          response.message || "No se pudo crear la especialidad"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      Alert.alert("Error", errorMessage);
      console.error("Error creating especialidad:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setFormData({ nombre: "", descripcion: "" });
  };

  const renderEspecialidad = ({ item }) => (
    <CardItem
      title={item.nombre}
      description={item.descripcion || "Especialidad médica disponible"}
      onPress={() => handleEspecialidadPress(item)}
      rightContent={
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.activo ? colors.success : colors.gray },
            ]}
          />
        </View>
      }
    />
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando especialidades..." />;
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Especialidades Médicas</Text>
        <Text style={styles.subtitle}>
          Selecciona una especialidad para ver los médicos disponibles
        </Text>

        {/* Botón para crear especialidad - Solo visible para superadmin */}
        {isSuperadmin && (
          <View style={styles.createButtonContainer}>
            <ButtonPrimary
              title="+ Nueva Especialidad"
              onPress={handleCreateEspecialidad}
              style={styles.createButton}
            />
          </View>
        )}

        {!especialidades || especialidades.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay especialidades disponibles
            </Text>
            <Text style={styles.emptySubtext}>
              Contacta con el centro médico para más información
            </Text>
          </View>
        ) : (
          <FlatList
            data={especialidades}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEspecialidad}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal para crear especialidad */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelCreate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Especialidad</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la especialidad"
              placeholderTextColor={colors.text}
              value={formData.nombre}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, nombre: value }))
              }
            />
  
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={colors.text}
              value={formData.descripcion}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, descripcion: value }))
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelCreate}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEspecialidad}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Creando..." : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Create styles function that uses theme colors
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.gray,
      textAlign: "center",
      marginBottom: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
    },
    statusBadge: {
      alignItems: "center",
      justifyContent: "center",
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    createButtonContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    createButton: {
      minWidth: 200,
      backgroundColor: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 20,
      width: "90%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 20,
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
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    modalButton: {
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
  });

export default EspecialidadesScreen;
