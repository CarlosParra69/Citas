import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useRoleBasedData } from "../../hooks/useRoleBasedData";
import SuperadminDashboard from "../Dashboard/SuperadminDashboard";
import MedicoDashboard from "../Dashboard/MedicoDashboard";
import PacienteDashboard from "../Dashboard/PacienteDashboard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useThemeColors } from "../../utils/themeColors";
import { useGlobalStyles } from "../../styles/globalStyles";

const DashboardScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const globalStyles = useGlobalStyles();
  const styles = createStyles(colors);
  const {
    dashboardData,
    loading,
    refreshData,
    userRole,
    isSuperadmin,
    isMedico,
    isPaciente,
  } = useRoleBasedData();

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  const renderRoleBasedDashboard = () => {
    if (isSuperadmin) {
      return (
        <SuperadminDashboard
          dashboardData={dashboardData}
          navigation={navigation}
        />
      );
    }

    if (isMedico) {
      return (
        <MedicoDashboard
          dashboardData={dashboardData}
          navigation={navigation}
        />
      );
    }

    if (isPaciente) {
      return (
        <PacienteDashboard
          dashboardData={dashboardData}
          navigation={navigation}
        />
      );
    }

    // Fallback para usuarios sin rol definido
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudo determinar el tipo de usuario
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refreshData} />
        }
      >
        {renderRoleBasedDashboard()}
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

export default DashboardScreen;
