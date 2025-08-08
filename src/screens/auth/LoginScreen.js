import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  IconButton,
  HelperText,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { SCREEN_NAMES } from '../../utils/constants';
import { colors } from '../../styles/colors';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Input animations
  const emailScaleAnim = useRef(new Animated.Value(1)).current;
  const passwordScaleAnim = useRef(new Animated.Value(1)).current;

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const handleFocus = (field) => {
    if (field === 'email') {
      setEmailFocused(true);
      Animated.spring(emailScaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
      }).start();
    } else {
      setPasswordFocused(true);
      Animated.spring(passwordScaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      setEmailFocused(false);
      Animated.spring(emailScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      setPasswordFocused(false);
      Animated.spring(passwordScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    dispatch(loginStart());

    setTimeout(() => {
      if (formData.email === 'a@a.com' && formData.password === 'Password') {
        dispatch(
          loginSuccess({
            user: {
              id: '1',
              email: formData.email,
              role: 'client',
              name: 'Test User',
            },
            token: 'fake-jwt-token',
          })
        );
      } else {
        dispatch(loginFailure('Invalid credentials. Please try again.'));
      }
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <Surface style={styles.logoContainer} elevation={8}>
                  <Image
                    source={require('../../../assets/images/law.webp')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </Surface>
              </Animated.View>

              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeSubtitle}>Sign in to continue to Lex360</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: cardScale }] }}>
                <BlurView intensity={20} tint="light" style={styles.blurCard}>
                  <Surface style={styles.card} elevation={12}>
                    <View style={styles.cardContent}>
                      {/* Email Input */}
                      <Animated.View
                        style={[
                          styles.inputAnimatedWrapper,
                          { transform: [{ scale: emailScaleAnim }] },
                        ]}
                      >
                        <TextInput
                          label="Email Address"
                          value={formData.email}
                          onChangeText={(text) => handleInputChange('email', text)}
                          mode="outlined"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onFocus={() => handleFocus('email')}
                          onBlur={() => handleBlur('email')}
                          left={<TextInput.Icon icon="email-outline" />}
                          style={[
                            styles.input,
                            emailFocused && styles.inputFocused,
                            formErrors.email && styles.inputError
                          ]}
                          theme={{
                            colors: {
                              primary: colors.primary,
                              outline: emailFocused ? colors.primary : colors.border,
                              background: 'white',
                            },
                          }}
                        />
                        {formErrors.email && (
                          <HelperText type="error" visible>
                            {formErrors.email}
                          </HelperText>
                        )}
                      </Animated.View>

                      {/* Password Input */}
                      <Animated.View
                        style={[
                          styles.inputAnimatedWrapper,
                          { transform: [{ scale: passwordScaleAnim }] },
                        ]}
                      >
                        <TextInput
                          label="Password"
                          value={formData.password}
                          onChangeText={(text) => handleInputChange('password', text)}
                          mode="outlined"
                          secureTextEntry={!showPassword}
                          onFocus={() => handleFocus('password')}
                          onBlur={() => handleBlur('password')}
                          left={<TextInput.Icon icon="lock-outline" />}
                          right={
                            <TextInput.Icon
                              icon={showPassword ? 'eye-off' : 'eye'}
                              onPress={() => setShowPassword(!showPassword)}
                            />
                          }
                          style={styles.input}
                          theme={{
                            colors: {
                              primary: colors.primary,
                              outline: passwordFocused ? colors.primary : colors.border,
                              background: 'white',
                            },
                          }}
                        />
                        {formErrors.password && (
                          <HelperText type="error" visible>
                            {formErrors.password}
                          </HelperText>
                        )}
                      </Animated.View>

                      {/* Error */}
                      {error && (
                        <Surface style={styles.errorContainer} elevation={2}>
                          <Text style={styles.errorText}>{error}</Text>
                        </Surface>
                      )}

                      {/* Forgot Password */}
                      <TouchableWithoutFeedback onPress={() => {}}>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                      </TouchableWithoutFeedback>

                      {/* Login Button */}
                      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <Button
                          mode="contained"
                          onPress={handleLogin}
                          loading={loading}
                          disabled={loading}
                          style={styles.button}
                          contentStyle={styles.buttonContent}
                          labelStyle={styles.buttonLabel}
                        >
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </Animated.View>

                      {/* Divider */}
                      <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                      </View>

                      {/* Social Buttons */}
                      <View style={styles.socialContainer}>
                        <IconButton icon="google" style={styles.socialButton} onPress={() => {}} />
                        <IconButton icon="linkedin" style={styles.socialButton} onPress={() => {}} />
                        <IconButton icon="apple" style={styles.socialButton} onPress={() => {}} />
                      </View>
                    </View>
                  </Surface>
                </BlurView>
              </Animated.View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>New to Lex360? </Text>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate(SCREEN_NAMES.REGISTER)}
                  labelStyle={styles.footerButtonLabel}
                  compact
                >
                  Create Account
                </Button>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
    minHeight: height - 100,
  },
  inputAnimatedWrapper: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
  },
  logoContainer: {
    alignSelf: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  logo: {
    width: 120,
    height: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 24,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    color: '#D63031',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    textAlign: 'right',
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    marginHorizontal: 8,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  footerButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
