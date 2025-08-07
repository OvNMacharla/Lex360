import React from 'react';
import { useSelector } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from '../navigation/AppNavigator';
import { CustomDarkTheme, CustomLightTheme } from '../styles/customThemes';

export default function ThemeWrapper() {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? false);
  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer theme={theme}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
