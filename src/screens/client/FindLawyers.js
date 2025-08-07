import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { getLawyers } from '../../services/lawyer';

const FindLawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchLawyers = async () => {
      const data = await getLawyers(query);
      setLawyers(data);
    };
    fetchLawyers();
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search lawyers..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <FlatList
        data={lawyers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.lawyerCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.spec}>{item.specialization}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  search: { padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  lawyerCard: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 18 },
  spec: { fontSize: 14, color: 'gray' },
});

export default FindLawyers;
