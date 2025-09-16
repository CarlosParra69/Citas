import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import globalStyles from "../../styles/globalStyles";
import CardItem from "../../components/CardItem";

const fakePacientes = [
  {
    id: 1,
    nombre: "Carlos Parra",
    edad: 34,
    historial: "Sin antecedentes graves.",
  },
  {
    id: 2,
    nombre: "Lucía Méndez",
    edad: 28,
    historial: "Alergia a penicilina.",
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    edad: 45,
    historial: "Hipertensión controlada.",
  },
];

const PacientesScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPacientes(fakePacientes);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <Text style={globalStyles.text}>Cargando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes</Text>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CardItem
            title={item.nombre}
            subtitle={`Edad: ${item.edad}`}
            description={item.historial}
            onPress={() =>
              navigation.navigate("PacienteDetailScreen", {
                pacienteId: item.id,
              })
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

export default PacientesScreen;
