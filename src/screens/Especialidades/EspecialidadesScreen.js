import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import Loader from "../../components/Loader";
import CardItem from "../../components/CardItem";
import globalStyles from "../../styles/globalStyles";

const fakeEspecialidades = [
  {
    id: 1,
    nombre: "Cardiología",
    descripcion: "Tratamiento de enfermedades del corazón.",
  },
  { id: 2, nombre: "Pediatría", descripcion: "Salud y bienestar infantil." },
  { id: 3, nombre: "Dermatología", descripcion: "Cuidado de la piel." },
];

const EspecialidadesScreen = ({ navigation }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setEspecialidades(fakeEspecialidades);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especialidades Médicas</Text>
      <FlatList
        data={especialidades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CardItem
            title={item.nombre}
            description={item.descripcion}
            onPress={() =>
              navigation.navigate("MedicosScreen", { especialidadId: item.id })
            }
          />
        )}
      />
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
});

export default EspecialidadesScreen;
