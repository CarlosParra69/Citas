import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../utils/colors';

const ButtonPrimary = ({ onPress, title, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: colors.gray,
    opacity: 0.7,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonPrimary;
