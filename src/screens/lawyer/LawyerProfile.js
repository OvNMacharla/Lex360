import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { globalStyles } from '../../styles/globalStyles';

const LawyerProfile = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <View style={globalStyles.container}>
      <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.specialization}>{user?.specialization}</Text>
      <Text style={styles.bio}>{user?.bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  specialization: {
    fontSize: 16,
    color: 'gray',
  },
  bio: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default LawyerProfile;
