import React from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { FirebaseProvider } from './src/contexts/FirebaseContext';

function MainApp() {
  // Use Redux to get current theme state
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // Choose light or dark theme
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          hidden={false}
          backgroundColor="transparent"
          translucent={false} // set to true if you want content behind it
        />
        <NavigationContainer theme={theme}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <FirebaseProvider>
      <MainApp />
      </FirebaseProvider>
    </ReduxProvider>
  );
}
