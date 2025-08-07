import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { sendPasswordResetEmail } from '../../services/auth';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset link sent to your email.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        placeholder="Enter your email"
        style={globalStyles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Send Reset Link" onPress={handleReset} />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ForgotPasswordScreen;