import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavLightTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';

export const CustomLightTheme = {
  ...MD3LightTheme,
  ...NavLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavLightTheme.colors,
    primary: '#3f51b5',
    accent: '#ff4081',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#212121',
    placeholder: '#888',
    notification: '#f50057',
    card: '#f8f8f8',
  },
  // ...existing code...
};

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  ...NavDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavDarkTheme.colors,
    primary: '#bb86fc',
    accent: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    placeholder: '#ccc',
    notification: '#cf6679',
    card: '#2c2c2c',
  },
  // ...existing code...
};
