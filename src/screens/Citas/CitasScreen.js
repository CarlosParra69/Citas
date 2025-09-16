import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import Loader from "../../components/Loader";
import ButtonPrimary from "../../components/ButtonPrimary";
import CardItem from "../../components/CardItem";
import { formatDate } from "../../utils/formatDate";
import globalStyles from "../../styles/globalStyles";

const fakeCitas = [
  {
    id: 1,
    medico: { nombre: "Dra. Ana Torres" },
    fecha: "2025-09-16T09:00:00",
    estado: "Confirmada",
  },
  {
    id: 2,
    medico: { nombre: "Dr. Luis Gómez" },
    fecha: "2025-09-17T11:30:00",
    estado: "Pendiente",
  },
  {
    id: 3,
    medico: { nombre: "Dra. Marta Ruiz" },
    fecha: "2025-09-18T15:00:00",
    estado: "Cancelada",
  },
];

const CitasScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCitas(fakeCitas);
      setLoading(false);
    }, 800);
  }, []);

  const renderCita = (cita) => (
    <CardItem
      key={cita.id}
      title={`Dr. ${cita.medico.nombre}`}
      subtitle={formatDate(cita.fecha)}
      description={cita.estado}
      onPress={() =>
        navigation.navigate("DetalleCitaScreen", { citaId: cita.id })
      }
    />
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Citas Médicas</Text>
      <ButtonPrimary
        title="Nueva Cita"
        onPress={() => navigation.navigate("CrearCitaScreen")}
      />
      <ScrollView style={styles.citasList}>{citas.map(renderCita)}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 16,
    textAlign: "center",
  },
  citasList: {
    marginTop: 16,
  },
});

export default CitasScreen;
