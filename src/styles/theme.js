// src/styles/theme.js
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1E40AF',
    secondary: '#3B82F6',
    background: '#F9FAFB',
    text: '#1F2937',
    surface: '#ffffff',
    error: '#EF4444',
  },
};
