import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import Loader from "../../components/Loader";
import CardItem from "../../components/CardItem";
import globalStyles from "../../styles/globalStyles";

const fakeMedicos = [
  {
    id: 1,
    nombre: "Dra. Ana Torres",
    especialidad: "Cardiología",
    descripcion: "Especialista en corazón y circulación.",
  },
  {
    id: 2,
    nombre: "Dr. Luis Gómez",
    especialidad: "Pediatría",
    descripcion: "Atención médica para niños.",
  },
  {
    id: 3,
    nombre: "Dra. Marta Ruiz",
    especialidad: "Dermatología",
    descripcion: "Cuidado de la piel y tratamientos.",
  },
];

const MedicosScreen = ({ navigation }) => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMedicos(fakeMedicos);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuestros Médicos</Text>
      <FlatList
        data={medicos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CardItem
            title={item.nombre}
            subtitle={item.especialidad}
            description={item.descripcion}
            onPress={() =>
              navigation.navigate("MedicoDetailScreen", { medicoId: item.id })
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

export default MedicosScreen;
