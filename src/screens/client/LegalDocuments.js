// src/screens/client/LegalDocuments.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LegalDocuments = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Legal Documents</Text>
      <Text>Your uploaded legal documents will appear here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});

export default LegalDocuments;
