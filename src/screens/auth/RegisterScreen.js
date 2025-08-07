import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph,
  HelperText,
  RadioButton
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { SCREEN_NAMES, USER_ROLES } from '../../utils/constants';
import { colors } from '../../styles/colors';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.CLIENT
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      dispatch(loginFailure('Please fill in all fields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      dispatch(loginFailure('Passwords do not match'));
      return;
    }

    dispatch(loginStart());
    
    try {
      // Simulate API call - replace with actual API call later
      setTimeout(() => {
        dispatch(loginSuccess({
          user: {
            id: Date.now().toString(),
            email: formData.email,
            role: formData.role,
            name: formData.name
          },
          token: 'fake-jwt-token-new-user'
        }));
      }, 1000);
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Create Account</Text>
            <Paragraph style={styles.subtitle}>
              Join Lex360 community
            </Paragraph>

            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
            />

            <Text style={styles.roleLabel}>I am a:</Text>
            <RadioButton.Group 
              onValueChange={value => setFormData({ ...formData, role: value })} 
              value={formData.role}
            >
              <View style={styles.radioContainer}>
                <RadioButton value={USER_ROLES.CLIENT} />
                <Text style={styles.radioLabel}>Client (Looking for legal help)</Text>
              </View>
              <View style={styles.radioContainer}>
                <RadioButton value={USER_ROLES.LAWYER} />
                <Text style={styles.radioLabel}>Lawyer (Providing legal services)</Text>
              </View>
            </RadioButton.Group>

            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <View style={styles.loginContainer}>
              <Text>Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}
                compact
              >
                Sign In
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.textSecondary,
  },
  input: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});