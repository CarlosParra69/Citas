import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../utils/colors';

const GenderSelector = ({ value, onValueChange, error }) => {
  const genders = [
    { key: 'M', label: 'Masculino' },
    { key: 'F', label: 'Femenino' },
    { key: 'Otro', label: 'Otro' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Género</Text>
      <View style={styles.optionsContainer}>
        {genders.map((gender) => (
          <TouchableOpacity
            key={gender.key}
            style={[
              styles.option,
              value === gender.key && styles.selectedOption
            ]}
            onPress={() => onValueChange(gender.key)}
          >
            <Text style={[
              styles.optionText,
              value === gender.key && styles.selectedOptionText
            ]}>
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});

export default GenderSelector;