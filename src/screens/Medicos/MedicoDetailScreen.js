import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { getMedicoById, getMedicoDisponibilidad } from "../../api/medicos";
import { getAvatarByUserId } from "../../api/avatar";
import LoadingSpinner from "../../components/LoadingSpinner";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useThemeColors } from "../../utils/themeColors";

const MedicoDetailScreen = ({ route, navigation }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { medicoId, medicoNombre } = route.params;

  const [medico, setMedico] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [medicoAvatar, setMedicoAvatar] = useState(null);

  useEffect(() => {
    loadMedicoData();
  }, [medicoId]);

  useEffect(() => {
    if (medico?.user?.id) {
      loadMedicoAvatar();
    }
  }, [medico]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      setError(null);
    }
  }, [error]);

  const loadMedicoData = async () => {
    try {
      setError(null);

      const medicoResponse = await getMedicoById(medicoId);

      if (medicoResponse.success) {
        setMedico(medicoResponse.data);

        // Cargar disponibilidad para hoy
        try {
          const today = new Date().toISOString().split("T")[0];
          const disponibilidadResponse = await getMedicoDisponibilidad(
            medicoId,
            today
          );
          if (disponibilidadResponse.success) {
            setDisponibilidad(disponibilidadResponse.data);
          }
        } catch (dispError) {
          // console.log("No se pudo cargar disponibilidad:", dispError);
        }
      } else {
        throw new Error(
          medicoResponse.message || "Error al cargar información del médico"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
      console.error("Error loading medico data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicoAvatar = async () => {
    try {
      if (!medico.user || !medico.user.id) {
        // Si no hay usuario, intentar buscar por email
        if (medico.email) {
          // TODO: Implementar búsqueda de usuario por email
        }
        return;
      }

      // Usar el user_id del médico para obtener su avatar
      const result = await getAvatarByUserId(medico.user.id);

      if (result.success && result.data.avatar_url) {
        setMedicoAvatar(result.data.avatar_url);
      } else {
        // console.log("No se pudo obtener el avatar:", result.message);
      }
    } catch (error) {
      console.error("Error cargando avatar del médico:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicoData();
    setRefreshing(false);
  };

  const handleAgendarCita = () => {
    navigation.navigate("Citas", {
      screen: "CrearCitaScreen",
      params: {
        preselectedEspecialidad: medico?.especialidad_id,
        preselectedMedico: medicoId,
      },
    });
  };

  const formatHorarios = (horarios) => {
    if (!horarios) return "No especificado";

    let horariosObj;

    // Si es string JSON, convertirlo a objeto
    if (typeof horarios === "string") {
      try {
        horariosObj = JSON.parse(horarios);
        // console.log("Horarios parseados desde JSON:", horariosObj);
      } catch (e) {
        console.error("Error parseando horarios JSON:", e);
        return "Error en formato de horarios";
      }
    } else if (typeof horarios === "object") {
      horariosObj = horarios;
    } else {
      return "Formato de horarios no válido";
    }

    const diasSemana = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
      domingo: "Domingo",
    };

    const horariosFiltrados = Object.entries(horariosObj)
      .filter(([dia, horario]) => {
        if (Array.isArray(horario) && horario.length > 0) {
          return true; // Si es array con elementos
        }
        if (
          typeof horario === "object" &&
          horario &&
          (horario.inicio || horario.fin)
        ) {
          return true; // Si es objeto con inicio/fin
        }
        return false;
      })
      .map(([dia, horario]) => {
        const diaFormateado = diasSemana[dia] || dia;

        if (Array.isArray(horario)) {
          // Si es array de objetos como [{"inicio": "08:00", "fin": "12:00"}]
          const horariosFormateados = horario.map((h) => {
            if (typeof h === "object" && h.inicio && h.fin) {
              return `${h.inicio} - ${h.fin}`;
            } else if (typeof h === "string") {
              return h;
            }
            return String(h);
          });
          return `${diaFormateado}: ${horariosFormateados.join(", ")}`;
        } else if (
          typeof horario === "object" &&
          horario.inicio &&
          horario.fin
        ) {
          // Si es objeto como {inicio: "08:00", fin: "12:00"}
          return `${diaFormateado}: ${horario.inicio} - ${horario.fin}`;
        } else if (typeof horario === "string") {
          // Si es string directo
          return `${diaFormateado}: ${horario}`;
        }
        return `${diaFormateado}: ${horario}`;
      });

    const resultado =
      horariosFiltrados.length > 0
        ? horariosFiltrados.join("\n")
        : "No especificado";

    return resultado;
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Cargando información del médico..." />;
  }

  if (!medico) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudo cargar la información del médico
        </Text>
        <ButtonPrimary title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const nombreCompleto =
    medico.nombre_completo || `${medico.nombre} ${medico.apellido}`;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Información básica del médico */}
        <View style={styles.medicoCard}>
          <View style={styles.medicoHeader}>
            {/* Avatar del médico */}
            <View style={styles.avatarContainer}>
              {medicoAvatar ? (
                <Image
                  source={{ uri: medicoAvatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[styles.avatar, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.avatarText, { color: colors.white }]}>
                    {nombreCompleto
                      ? nombreCompleto.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.medicoInfo}>
              <Text style={styles.medicoNombre}>{nombreCompleto}</Text>

              {medico.especialidad && (
                <Text style={styles.especialidad}>
                  {medico.especialidad.nombre}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Registro Médico:</Text>
            <Text style={styles.value}>
              {medico.registro_medico || "No especificado"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>
              {medico.telefono || "No especificado"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {medico.email || "No especificado"}
            </Text>
          </View>

          {medico.tarifa_consulta && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tarifa de Consulta:</Text>
              <Text style={[styles.value, styles.tarifa]}>
                ${medico.tarifa_consulta.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: medico.activo ? colors.success : colors.gray,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {medico.activo ? "Médico Activo" : "Médico Inactivo"}
            </Text>
          </View>
        </View>

        {/* Biografía */}
        {medico.biografia && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Biografía</Text>
            <Text style={styles.biografia}>{medico.biografia}</Text>
          </View>
        )}

        {/* Horarios de atención */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horarios de Atención</Text>
          <Text style={styles.horarios}>
            {formatHorarios(medico.horarios_atencion)}
          </Text>
        </View>

        {/* Disponibilidad de hoy */}
        {disponibilidad && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Disponibilidad Hoy</Text>
            <View style={styles.disponibilidadContainer}>
              <Text
                style={[
                  styles.disponibilidad,
                  {
                    color: disponibilidad.disponible
                      ? colors.success
                      : colors.error,
                  },
                ]}
              >
                {disponibilidad.disponible
                  ? "✅ Disponible para citas"
                  : "❌ No disponible hoy"}
              </Text>

              {disponibilidad.horarios_atencion && (
                <Text style={styles.disponibilidadDetalle}>
                  Horario: {formatHorarios(disponibilidad.horarios_atencion)}
                </Text>
              )}

              {disponibilidad.horas_ocupadas &&
                disponibilidad.horas_ocupadas.length > 0 && (
                  <Text style={styles.disponibilidadDetalle}>
                    Horas ocupadas: {disponibilidad.horas_ocupadas.join(", ")}
                  </Text>
                )}
            </View>
          </View>
        )}

        {/* Botón para agendar cita */}
        {medico.activo && (
          <ButtonPrimary
            title="Agendar Cita con este Médico"
            onPress={handleAgendarCita}
            style={styles.agendarButton}
          />
        )}
      </ScrollView>
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
    content: {
      flex: 1,
      padding: 16,
    },
    avatarContainer: {
      marginRight: 16,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontSize: 24,
      fontWeight: "bold",
    },
    avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    medicoCard: {
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
    medicoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    medicoInfo: {
      flex: 1,
    },
    medicoNombre: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 8,
    },
    especialidad: {
      fontSize: 18,
      color: colors.secondary,
      fontWeight: "600",
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
      flex: 1,
    },
    value: {
      fontSize: 16,
      color: colors.gray,
      flex: 1,
      textAlign: "right",
    },
    tarifa: {
      color: colors.success,
      fontWeight: "600",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      gap: 8,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    statusText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
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
      marginBottom: 12,
    },
    biografia: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    horarios: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    disponibilidadContainer: {
      gap: 8,
    },
    disponibilidad: {
      fontSize: 16,
      fontWeight: "500",
    },
    disponibilidadDetalle: {
      fontSize: 14,
      color: colors.gray,
      marginTop: 4,
    },
    agendarButton: {
      marginTop: 8,
      marginBottom: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center",
      marginBottom: 20,
    },
  });

export default MedicoDetailScreen;
