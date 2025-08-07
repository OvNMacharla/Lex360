import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockData = [
  { id: '1', lawyer: 'John Doe', status: 'Completed' },
  { id: '2', lawyer: 'Jane Smith', status: 'Scheduled' },
];

const MyConsultations = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Consultations</Text>
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.consultationCard}>
            <Text>Lawyer: {item.lawyer}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  consultationCard: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
});

export default MyConsultations;
