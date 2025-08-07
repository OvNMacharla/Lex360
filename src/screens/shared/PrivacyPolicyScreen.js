import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: 'https://yourdomain.com/privacy-policy' }} 
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
