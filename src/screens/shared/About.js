import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Paragraph, Title } from 'react-native-paper';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text>About Lex360</Text>
      <Paragraph style={styles.paragraph}>
        Lex360 is a legal-tech platform designed to connect clients with experienced lawyers and legal AI tools.
      </Paragraph>
      <Text style={styles.version}>Version 1.0.0</Text>
      <Text style={styles.copyright}>© 2025 Lex360 Inc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  paragraph: {
    marginVertical: 16,
    lineHeight: 22,
  },
  version: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
});
