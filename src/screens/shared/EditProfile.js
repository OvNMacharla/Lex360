// src/screens/shared/EditProfile.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { updateProfile } from '../../store/authSlice'; // Ensure you have this action defined
import { colors } from '../../styles/colors';

export default function EditProfile() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [error, setError] = useState('');

    const handleSave = () => {
    if (!name || !email || !phone) {
        setError('All fields are required');
        return;
    }

    setError('');
    const updatedUser = { ...user, name, email, phone };
    dispatch(updateProfile(updatedUser));
    navigation.goBack();
    };
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
      />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save Changes
      </Button>
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.primary,
  },
});