import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

export const FloatingActionButton = ({ icon, onPress, color = colors.primary }) => (
  <TouchableOpacity 
    style={[styles.fab, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <MaterialCommunityIcons name={icon} size={24} color="white" />
  </TouchableOpacity>
);

export const IconButton = ({ title, icon, onPress, variant = 'outlined', color = colors.primary }) => (
  <Button
    mode={variant}
    onPress={onPress}
    icon={icon}
    style={[styles.iconButton, { borderColor: variant === 'outlined' ? color : 'transparent' }]}
    buttonColor={variant === 'contained' ? color : 'transparent'}
    textColor={variant === 'contained' ? 'white' : color}
    contentStyle={styles.iconButtonContent}
  >
    {title}
  </Button>
);

export const ChipButton = ({ title, selected, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.chipButton, selected && styles.chipButtonSelected]}
    onPress={onPress}
  >
    {icon && (
      <MaterialCommunityIcons 
        name={icon} 
        size={16} 
        color={selected ? 'white' : colors.primary}
        style={styles.chipIcon}
      />
    )}
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconButton: {
    borderRadius: 8,
    borderWidth: 1,
  },
  iconButtonContent: {
    paddingVertical: 8,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
    marginBottom: 8,
  },
  chipButtonSelected: {
    backgroundColor: colors.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    color: colors.primary,
  },
  chipTextSelected: {
    color: 'white',
  },
});
