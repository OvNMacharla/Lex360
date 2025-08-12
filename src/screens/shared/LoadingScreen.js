import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

const LoadingScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }
    ]}>
      <ActivityIndicator 
        size="large" 
        color={isDarkMode ? '#ffffff' : '#6200ea'} 
      />
      <Text 
        style={[
          styles.loadingText,
          { color: isDarkMode ? '#ffffff' : '#000000' }
        ]}
      >
        Loading Lex360...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingScreen;