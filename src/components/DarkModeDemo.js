import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../utils/themeColors";
import { useDarkModeColors } from "../utils/darkModeUtils";

const DarkModeDemo = () => {
  const colors = useThemeColors();
  const darkColors = useDarkModeColors();

  const demoCards = [
    {
      title: "🎨 Colores Principales",
      items: [
        {
          name: "Primary",
          color: colors.primary,
          text: "Elementos principales",
        },
        {
          name: "Secondary",
          color: colors.secondary,
          text: "Elementos secundarios",
        },
        {
          name: "Success",
          color: colors.success,
          text: "Operaciones exitosas",
        },
        { name: "Danger", color: colors.danger, text: "Errores y alertas" },
      ],
    },
    {
      title: "🌑 Fondos y Superficies",
      items: [
        {
          name: "Background",
          color: colors.background,
          text: "Fondo de la aplicación",
        },
        {
          name: "Surface",
          color: colors.surface,
          text: "Tarjetas y superficies",
        },
        { name: "Card", color: colors.card, text: "Contenido de tarjetas" },
        { name: "Input", color: colors.input, text: "Campos de entrada" },
      ],
    },
    {
      title: "📝 Texto y Bordes",
      items: [
        { name: "Text", color: colors.text, text: "Texto principal" },
        {
          name: "Text Secondary",
          color: colors.textSecondary,
          text: "Texto secundario",
        },
        { name: "Border", color: colors.border, text: "Líneas y bordes" },
        {
          name: "Light Gray",
          color: colors.lightGray,
          text: "Elementos sutiles",
        },
      ],
    },
  ];

  const renderColorItem = (item) => (
    <View
      key={item.name}
      style={[styles.colorItem, { borderColor: colors.border }]}
    >
      <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
      <View style={styles.colorInfo}>
        <Text style={[styles.colorName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.colorValue, { color: colors.textSecondary }]}>
          {item.color.toUpperCase()}
        </Text>
        <Text
          style={[styles.colorDescription, { color: colors.textSecondary }]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  const renderDemoCard = (card) => (
    <View
      key={card.title}
      style={[styles.demoCard, { backgroundColor: colors.surface }]}
    >
      <Text style={[styles.cardTitle, { color: colors.primary }]}>
        {card.title}
      </Text>
      {card.items.map(renderColorItem)}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.mainTitle, { color: colors.text }]}>
        🌑 Demostración del Modo Oscuro
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Paleta completamente oscura con negros y grises - sin colores naranjas
      </Text>

      {demoCards.map(renderDemoCard)}

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.infoTitleContainer}>
          <Ionicons
            name="bulb"
            size={20}
            color={colors.primary}
            style={styles.bulbIcon}
          />
          <Text style={[styles.infoTitle, { color: colors.primary }]}>
            Características del Nuevo Modo Oscuro
          </Text>
        </View>
        <Text style={[styles.infoText, { color: colors.text }]}>
          • Paleta completamente negra y gris oscura{"\n"}• Sin colores naranjas
          en modo oscuro{"\n"}• Máximo contraste para vista reducida
          {"\n"}• Sombras profundas para mejor percepción{"\n"}• Ambiente
          profesional y elegante
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  demoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 16,
    fontWeight: "500",
  },
  colorValue: {
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 2,
  },
  colorDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  infoTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  bulbIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default DarkModeDemo;
