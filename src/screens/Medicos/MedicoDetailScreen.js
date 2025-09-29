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
import {
  getMedicoById,
  getMedicoDisponibilidad,
  checkMedicoAvailability,
} from "../../api/medicos";
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
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [customDateTime, setCustomDateTime] = useState(null);

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

  useEffect(() => {
    // Verificar disponibilidad cuando ambos datos estén disponibles
    if (
      medico &&
      disponibilidad &&
      !availabilityChecked &&
      !checkingAvailability
    ) {
      const timer = setTimeout(() => {
        if (!checkingAvailability && !availabilityChecked) {
          checkAvailability();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [medico, disponibilidad, availabilityChecked, checkingAvailability]);

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

        // La verificación se hará automáticamente cuando los datos estén listos
      } else {
        throw new Error(
          medicoResponse.message || "Error al cargar información del médico"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error de conexión";
      setError(errorMessage);
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
      // Error loading avatar
    }
  };

  const getNextAvailableDateTime = () => {
    const now = new Date();
    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];

    // Usar los datos de disponibilidad que ya se cargaron
    const horariosAtencion =
      disponibilidad?.horarios_atencion || medico?.horarios_atencion;

    // Verificación de seguridad: si no hay horarios, usar fecha por defecto
    if (!horariosAtencion) {
      const futureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return (
        futureTime.getFullYear() +
        "-" +
        String(futureTime.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(futureTime.getDate()).padStart(2, "0") +
        "T09:00:00"
      );
    }

    // Buscar el próximo día hábil con horarios disponibles
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);

      const diaSemana = diasSemana[checkDate.getDay()];
      const horariosDelDia = horariosAtencion[diaSemana];

      // Si el día tiene horarios configurados
      if (
        horariosDelDia &&
        Array.isArray(horariosDelDia) &&
        horariosDelDia.length > 0
      ) {
        // Si es hoy, verificar que la hora sea futura
        if (i === 0) {
          // Buscar el próximo horario disponible hoy
          const horaActual = checkDate.getHours();
          const horariosValidos = horariosDelDia.filter((horario) => {
            const match = horario.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
            if (match) {
              const horaInicio = parseInt(match[1]);
              return horaInicio > horaActual;
            }
            return false;
          });

          if (horariosValidos.length > 0) {
            // Usar el primer horario disponible hoy
            const match = horariosValidos[0].match(
              /(\d{2}):(\d{2})-(\d{2}):(\d{2})/
            );
            if (match) {
              return (
                checkDate.getFullYear() +
                "-" +
                String(checkDate.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(checkDate.getDate()).padStart(2, "0") +
                "T" +
                match[1] +
                ":00:00"
              );
            }
          }
        } else {
          // Para días futuros, usar el primer horario disponible
          const match = horariosDelDia[0].match(
            /(\d{2}):(\d{2})-(\d{2}):(\d{2})/
          );
          if (match) {
            return (
              checkDate.getFullYear() +
              "-" +
              String(checkDate.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(checkDate.getDate()).padStart(2, "0") +
              "T" +
              match[1] +
              ":00:00"
            );
          }
        }
      }
    }

    // Si no se encuentra ningún horario disponible, usar mañana a las 9:00
    const defaultDate = new Date(now);
    defaultDate.setDate(defaultDate.getDate() + 1);

    return (
      defaultDate.getFullYear() +
      "-" +
      String(defaultDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(defaultDate.getDate()).padStart(2, "0") +
      "T09:00:00"
    );
  };

  const checkAvailability = async (checkCurrentTime = false) => {
    if (!medicoId) {
      setAvailabilityError("ID del médico no disponible");
      return;
    }

    if (!medico || !disponibilidad) {
      return;
    }

    if (checkingAvailability) {
      return;
    }

    try {
      setCheckingAvailability(true);

      const now = new Date();
      let fechaHoraToCheck;

      if (checkCurrentTime) {
        fechaHoraToCheck =
          now.getFullYear() +
          "-" +
          String(now.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(now.getDate()).padStart(2, "0") +
          "T" +
          String(now.getHours()).padStart(2, "0") +
          ":" +
          String(now.getMinutes()).padStart(2, "0") +
          ":" +
          String(now.getSeconds()).padStart(2, "0");
      } else {
        fechaHoraToCheck = getNextAvailableDateTime();
      }

      if (!fechaHoraToCheck) {
        setAvailabilityError("Error generando fecha para verificación");
        return;
      }

      const timezoneInfo = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: now.getTimezoneOffset(),
        timestamp: now.getTime(),
      };

      const availabilityResponse = await checkMedicoAvailability(
        medicoId,
        fechaHoraToCheck,
        timezoneInfo
      );

      if (availabilityResponse.success) {
        setIsAvailable(availabilityResponse.data.available);
        setAvailabilityChecked(true);
      } else {
        setIsAvailable(false);
        setAvailabilityChecked(true);
      }
    } catch (error) {
      setIsAvailable(false);
      setAvailabilityChecked(true);
      setAvailabilityError(
        error.response?.data?.message || error.message || "Error de conexión"
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const checkAvailabilityForTomorrow = async () => {
    if (!medicoId) return;

    try {
      setCheckingAvailability(true);

      const fechaHoraToCheck = getNextAvailableDateTime();

      const availabilityResponse = await checkMedicoAvailability(
        medicoId,
        fechaHoraToCheck,
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          offset: new Date().getTimezoneOffset(),
          timestamp: new Date().getTime(),
        }
      );

      if (availabilityResponse.success) {
        setIsAvailable(availabilityResponse.data.available);
        setAvailabilityChecked(true);
      } else {
        setIsAvailable(false);
        setAvailabilityChecked(true);
      }
    } catch (error) {
      setIsAvailable(false);
      setAvailabilityChecked(true);
      setAvailabilityError(
        error.response?.data?.message || error.message || "Error de conexión"
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const checkAvailabilityForToday = async () => {
    if (!medicoId) return;

    try {
      setCheckingAvailability(true);

      const fechaHoraToCheck = getNextAvailableDateTime();

      const availabilityResponse = await checkMedicoAvailability(
        medicoId,
        fechaHoraToCheck,
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          offset: new Date().getTimezoneOffset(),
          timestamp: new Date().getTime(),
        }
      );

      if (availabilityResponse.success) {
        setIsAvailable(availabilityResponse.data.available);
        setAvailabilityChecked(true);
      } else {
        setIsAvailable(false);
        setAvailabilityChecked(true);
      }
    } catch (error) {
      setIsAvailable(false);
      setAvailabilityChecked(true);
      setAvailabilityError(
        error.response?.data?.message || error.message || "Error de conexión"
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setAvailabilityError(null);
    setAvailabilityChecked(false);
    await loadMedicoData();
    await checkAvailability();
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

        {/* Disponibilidad del médico */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Disponibilidad</Text>
          <View style={styles.disponibilidadContainer}>
            {checkingAvailability ? (
              <Text style={[styles.disponibilidad, { color: colors.gray }]}>
                Verificando disponibilidad...
              </Text>
            ) : availabilityChecked ? (
              <Text
                style={[
                  styles.disponibilidad,
                  {
                    color: isAvailable ? colors.success : colors.error,
                  },
                ]}
              >
                {isAvailable
                  ? "✅ Disponible para citas"
                  : "❌ No disponible en este momento"}
              </Text>
            ) : availabilityError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.disponibilidad, { color: colors.error }]}>
                  ❌ Error verificando disponibilidad
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setAvailabilityError(null);
                    setAvailabilityChecked(false);
                    checkAvailability();
                  }}
                >
                  <Text
                    style={[styles.retryButtonText, { color: colors.primary }]}
                  >
                    Reintentar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.disponibilidad, { color: colors.gray }]}>
                Verificando disponibilidad...
              </Text>
            )}

            {disponibilidad && disponibilidad.horarios_atencion && (
              <Text style={styles.disponibilidadDetalle}>
                Horario de atención:{" "}
                {formatHorarios(disponibilidad.horarios_atencion)}
              </Text>
            )}

            {disponibilidad &&
              disponibilidad.horas_ocupadas &&
              disponibilidad.horas_ocupadas.length > 0 && (
                <Text style={styles.disponibilidadDetalle}>
                  Horas ocupadas hoy: {disponibilidad.horas_ocupadas.join(", ")}
                </Text>
              )}
          </View>
        </View>

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
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
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
      color: colors.text,
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
      backgroundColor: colors.card || colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
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
    errorContainer: {
      gap: 8,
      alignItems: "center",
    },
    buttonContainer: {
      gap: 8,
      width: "100%",
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "currentColor",
      alignItems: "center",
    },
    currentTimeButton: {
      backgroundColor: "currentColor",
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "600",
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
