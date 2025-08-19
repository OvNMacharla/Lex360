import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Paragraph,
  HelperText,
  Surface,
  IconButton,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { registerWithEmail } from '../../store/authSlice';
import { SCREEN_NAMES, USER_ROLES } from '../../utils/constants';
import { colors } from '../../styles/colors';

const { width, height } = Dimensions.get('window');

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [step, setStep] = useState(1);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Input animations
  const fullNameScaleAnim = useRef(new Animated.Value(1)).current;
  const emailScaleAnim = useRef(new Animated.Value(1)).current;
  const passwordScaleAnim = useRef(new Animated.Value(1)).current;
  const confirmPasswordScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const roleCardAnimations = useRef([
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;

  const handleFocus = (field) => {
      if (field === 'name') {
        setNameFocused(true);
        Animated.spring(fullNameScaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
        }).start();
      } else if (field === 'email') {
        setEmailFocused(true);
        Animated.spring(emailScaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
        }).start();
      } else if (field === 'password') {
        setPasswordFocused(true);
        Animated.spring(passwordScaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
        }).start();
      } else if (field === 'confirmPassword') {
        setConfirmPasswordFocused(true);
        Animated.spring(confirmPasswordScaleAnim, {
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
        } else if (field === 'name') {
          setNameFocused(false);
          Animated.spring(fullNameScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        } else if (field === 'password') {
          setPasswordFocused(false);
          Animated.spring(passwordScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        } else if (field === 'confirmPassword') {
          setConfirmPasswordFocused(false);
          Animated.spring(confirmPasswordScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      };

  useEffect(() => {
    // Entrance animations
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
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: step / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleRoleSelect = (role, index) => {
    setFormData({ ...formData, role });
    
    // Animate selected role card
    Animated.sequence([
      Animated.timing(roleCardAnimations[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(roleCardAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };


  const handleRegister = () => {
    if (!validateStep2()) return;

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    dispatch(
      registerWithEmail({
        email: formData.email,
        password: formData.password,
        userData: {
          displayName: formData.name,
          role: formData.role,
          phoneNumber: formData.phoneNumber || '',
        },
      })
    );
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return '#FF6B6B';
      case 2: return '#FFA726';
      case 3: return '#66BB6A';
      case 4: return '#4CAF50';
      default: return '#E0E0E0';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const renderStep1 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Personal Information</Text>
        <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
      </View>

      <Animated.View
      style={[
        styles.inputAnimatedWrapper,
        { transform: [{ scale: fullNameScaleAnim }] },
      ]}
    >
        <TextInput
          label="Full Name"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          mode="outlined"
          style={[
            styles.input,
            nameFocused && styles.inputFocused,
            formErrors.name && styles.inputError
          ]}
          onFocus={() => handleFocus('name')}
          onBlur={() => handleBlur('name')}
          left={<TextInput.Icon icon="account-outline" />}
          theme={{
            colors: {
              primary: colors.primary,
              outline: nameFocused ? colors.primary : colors.border,
              background: 'white',
            }
          }}
        />
        {formErrors.name && (
          <HelperText type="error" visible={!!formErrors.name}>
            {formErrors.name}
          </HelperText>
        )}
      </Animated.View>

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
          <HelperText type="error" visible={!!formErrors.email}>
            {formErrors.email}
          </HelperText>
        )}
      </Animated.View>

      <Button
        mode="contained"
        onPress={handleNextStep}
        style={styles.nextButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Continue
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Security & Role</Text>
        <Text style={styles.stepSubtitle}>Set your password and choose your role</Text>
      </View>

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
          style={[
            styles.input,
            focusedField === 'password' && styles.inputFocused,
            formErrors.password && styles.inputError
          ]}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField('')}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          theme={{
            colors: {
              primary: colors.primary,
              outline: focusedField === 'password' ? colors.primary : colors.border,
            }
          }}
        />
        
        {formData.password && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthBar}>
              {[1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.passwordStrengthSegment,
                    {
                      backgroundColor: passwordStrength >= level 
                        ? getPasswordStrengthColor() 
                        : '#E0E0E0'
                    }
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
              {getPasswordStrengthText()}
            </Text>
          </View>
        )}
        
        {formErrors.password && (
          <HelperText type="error" visible={!!formErrors.password}>
            {formErrors.password}
          </HelperText>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.inputAnimatedWrapper,
          { transform: [{ scale: passwordScaleAnim }] },
        ]}
      >
        <TextInput
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
          mode="outlined"
          secureTextEntry={!showConfirmPassword}
          style={[
            styles.input,
            focusedField === 'confirmPassword' && styles.inputFocused,
            formErrors.confirmPassword && styles.inputError
          ]}
          onFocus={() => setFocusedField('confirmPassword')}
          onBlur={() => setFocusedField('')}
          left={<TextInput.Icon icon="lock-check-outline" />}
          right={
            <TextInput.Icon 
              icon={showConfirmPassword ? "eye-off" : "eye"} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          theme={{
            colors: {
              primary: colors.primary,
              outline: focusedField === 'confirmPassword' ? colors.primary : colors.border,
            }
          }}
        />
        {formErrors.confirmPassword && (
          <HelperText type="error" visible={!!formErrors.confirmPassword}>
            {formErrors.confirmPassword}
          </HelperText>
        )}
      </Animated.View>

      {/* Role Selection */}
      <View style={styles.roleSection}>
        <Text style={styles.roleTitle}>I am a:</Text>
        <View style={styles.roleCards}>
          <Animated.View style={{ transform: [{ scale: roleCardAnimations[0] }] }}>
            <TouchableOpacity
              onPress={() => handleRoleSelect(USER_ROLES.CLIENT, 0)}
              style={[
                styles.roleCard,
                formData.role === USER_ROLES.CLIENT && styles.roleCardSelected
              ]}
            >
              <Surface style={styles.roleIconContainer} elevation={4}>
                <Icon 
                  name="account-search" 
                  size={32} 
                  color={formData.role === USER_ROLES.CLIENT ? colors.primary : '#666'} 
                />
              </Surface>
              <Text style={[
                styles.roleCardTitle,
                formData.role === USER_ROLES.CLIENT && styles.roleCardTitleSelected
              ]}>
                Client
              </Text>
              <Text style={styles.roleCardDescription}>
                Looking for legal help
              </Text>
              {formData.role === USER_ROLES.CLIENT && (
                <Icon name="check-circle" size={20} color={colors.primary} style={styles.roleCheckIcon} />
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: roleCardAnimations[1] }] }}>
            <TouchableOpacity
              onPress={() => handleRoleSelect(USER_ROLES.LAWYER, 1)}
              style={[
                styles.roleCard,
                formData.role === USER_ROLES.LAWYER && styles.roleCardSelected
              ]}
            >
              <Surface style={styles.roleIconContainer} elevation={4}>
                <Icon 
                  name="scale-balance" 
                  size={32} 
                  color={formData.role === USER_ROLES.LAWYER ? colors.primary : '#666'} 
                />
              </Surface>
              <Text style={[
                styles.roleCardTitle,
                formData.role === USER_ROLES.LAWYER && styles.roleCardTitleSelected
              ]}>
                Lawyer
              </Text>
              <Text style={styles.roleCardDescription}>
                Providing legal services
              </Text>
              {formData.role === USER_ROLES.LAWYER && (
                <Icon name="check-circle" size={20} color={colors.primary} style={styles.roleCheckIcon} />
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: roleCardAnimations[1] }] }}>
            <TouchableOpacity
              onPress={() => handleRoleSelect(USER_ROLES.FIRM, 1)}
              style={[
                styles.roleCard,
                formData.role === USER_ROLES.FIRM && styles.roleCardSelected
              ]}
            >
              <Surface style={styles.roleIconContainer} elevation={4}>
                <Icon 
                  name="scale-balance" 
                  size={32} 
                  color={formData.role === USER_ROLES.FIRM ? colors.primary : '#666'} 
                />
              </Surface>
              <Text style={[
                styles.roleCardTitle,
                formData.role === USER_ROLES.FIRM && styles.roleCardTitleSelected
              ]}>
                Firm
              </Text>
              <Text style={styles.roleCardDescription}>
                Providing legal services
              </Text>
              {formData.role === USER_ROLES.FIRM && (
                <Icon name="check-circle" size={20} color={colors.primary} style={styles.roleCheckIcon} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Global Error */}
      {error && (
        <Surface style={styles.errorContainer} elevation={2}>
          <Text style={styles.errorText}>{error}</Text>
        </Surface>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handlePrevStep}
          style={styles.backButton}
          labelStyle={styles.backButtonLabel}
        >
          Back
        </Button>
        
        <Animated.View style={[styles.registerButtonContainer, { transform: [{ scale: buttonScale }] }]}>
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: 'transparent' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Background Shapes */}
      <View style={styles.backgroundShapes}>
        <Animated.View 
          style={[
            styles.backgroundCircle,
            styles.circle1,
            { opacity: fadeAnim }
          ]} 
        />
        <Animated.View 
          style={[
            styles.backgroundCircle,
            styles.circle2,
            { opacity: fadeAnim }
          ]} 
        />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.inner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.mainTitle}>Join Lex360</Text>
              <Text style={styles.mainSubtitle}>
                Connect with the legal community
              </Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>Step {step} of 2</Text>
            </View>

            {/* Registration Card */}
            <Animated.View style={{ transform: [{ scale: cardScale }] }}>
              <BlurView intensity={20} tint="light" style={styles.blurCard}>
                <Surface style={styles.card} elevation={12}>
                  <View style={styles.cardContent}>
                    {step === 1 ? renderStep1() : renderStep2()}
                  </View>
                </Surface>
              </BlurView>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}
                compact
                labelStyle={styles.footerButtonLabel}
              >
                Sign In
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backgroundShapes: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    left: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    bottom: 100,
    right: -80,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
    minHeight: height - 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressTrack: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  inputAnimatedWrapper: {
    marginBottom: 20,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
  },
  passwordStrengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    marginRight: 4,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleSection: {
    marginBottom: 24,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  roleCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleCard: {
    flex: 0.48,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(103, 126, 234, 0.05)',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  roleCardTitleSelected: {
    color: colors.primary,
  },
  roleCardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  roleCheckIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  nextButton: {
    borderRadius: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flex: 0.3,
    borderRadius: 12,
    borderColor: colors.primary,
  },
  backButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  registerButtonContainer: {
    flex: 0.65,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
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