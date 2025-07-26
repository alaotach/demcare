import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  useTheme,
  HelperText,
  Surface,
  IconButton,
  Divider,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function EnhancedLoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signIn } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Animation values
  const logoScale = useState(new Animated.Value(0.8))[0];
  const logoOpacity = useState(new Animated.Value(0))[0];
  const formTranslateY = useState(new Animated.Value(50))[0];
  const formOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Unable to sign in. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: string) => {
    // Quick login for demo purposes
    const demoCredentials = {
      doctor: { email: 'doctor@demcare.com', password: 'doctor123' },
      caregiver: { email: 'caregiver@demcare.com', password: 'caregiver123' },
    };

    const creds = demoCredentials[role as keyof typeof demoCredentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first.');
      return;
    }
    // TODO: Implement forgot password
    Alert.alert(
      'Password Reset',
      `A password reset link will be sent to ${email}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[
          theme.colors.primary,
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.background,
        ]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header Section */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <Surface style={styles.logoContainer} elevation={5}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryContainer]}
                  style={styles.logoGradient}
                >
                  <MaterialCommunityIcons name="medical-bag" size={40} color="white" />
                </LinearGradient>
              </Surface>
              <Text variant="headlineLarge" style={styles.title}>
                DemCare
              </Text>
              <Text variant="titleMedium" style={styles.subtitle}>
                Patient Monitoring System
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                Secure access to comprehensive patient care and monitoring tools
              </Text>
            </Animated.View>

            {/* Quick Login Demo Buttons */}
            <Animated.View
              style={[
                styles.quickLoginContainer,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <Text variant="bodyMedium" style={styles.quickLoginTitle}>
                Quick Demo Access
              </Text>
              <View style={styles.quickLoginButtons}>
                <Chip
                  icon="doctor"
                  mode="outlined"
                  onPress={() => handleQuickLogin('doctor')}
                  style={[styles.quickLoginChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  textStyle={{ color: 'white', fontWeight: '600' }}
                >
                  Doctor Demo
                </Chip>
                <Chip
                  icon="account-heart"
                  mode="outlined"
                  onPress={() => handleQuickLogin('caregiver')}
                  style={[styles.quickLoginChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  textStyle={{ color: 'white', fontWeight: '600' }}
                >
                  Caregiver Demo
                </Chip>
              </View>
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <Card style={styles.loginCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name="shield-account"
                      size={28}
                      color={theme.colors.primary}
                    />
                    <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                      Secure Login
                    </Text>
                  </View>

                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    left={<TextInput.Icon icon="email" />}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <HelperText type="error" style={styles.helperText}>
                      {errors.email}
                    </HelperText>
                  )}

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    error={!!errors.password}
                  />
                  {errors.password && (
                    <HelperText type="error" style={styles.helperText}>
                      {errors.password}
                    </HelperText>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={{ fontSize: 16, fontWeight: '600' }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    style={styles.forgotButton}
                    labelStyle={{ color: theme.colors.primary, fontWeight: '600' }}
                  >
                    Forgot Password?
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Sign Up Section */}
            <Animated.View
              style={[
                styles.signupContainer,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <Card style={styles.signupCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.signupGradient}
                >
                  <Card.Content style={styles.signupCardContent}>
                    <View style={styles.signupHeader}>
                      <MaterialCommunityIcons 
                        name="account-plus-outline" 
                        size={20} 
                        color="white" 
                      />
                      <Text variant="titleMedium" style={styles.signupText}>
                        New to DemCare?
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.signupDescription}>
                      Join healthcare professionals worldwide
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('SignUp')}
                      style={styles.signupButton}
                      contentStyle={styles.signupButtonContent}
                      labelStyle={styles.signupButtonLabel}
                    >
                      Create Free Account
                    </Button>
                    
                    <View style={styles.benefitsContainer}>
                      <View style={styles.benefitRow}>
                        <View style={styles.benefitItem}>
                          <MaterialCommunityIcons name="check" size={14} color="#4CAF50" />
                          <Text style={styles.benefitText}>Free</Text>
                        </View>
                        <View style={styles.benefitItem}>
                          <MaterialCommunityIcons name="check" size={14} color="#4CAF50" />
                          <Text style={styles.benefitText}>No Card</Text>
                        </View>
                        <View style={styles.benefitItem}>
                          <MaterialCommunityIcons name="check" size={14} color="#4CAF50" />
                          <Text style={styles.benefitText}>2 Min Setup</Text>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                Powered by Advanced Healthcare Technology
              </Text>
              <View style={styles.securityIndicators}>
                <MaterialCommunityIcons name="shield-check" size={16} color="rgba(255,255,255,0.7)" />
                <MaterialCommunityIcons name="lock" size={16} color="rgba(255,255,255,0.7)" />
                <MaterialCommunityIcons name="certificate" size={16} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 1.2, // Fixed height to prevent gradient shifting
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    justifyContent: 'center',
    minHeight: height - 100, // Ensure minimum height
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  quickLoginContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  quickLoginTitle: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  quickLoginButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLoginChip: {
    elevation: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  formContainer: {
    marginBottom: 16,
  },
  loginCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  helperText: {
    marginBottom: 12,
    fontSize: 12,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 4,
  },
  signupContainer: {
    marginBottom: 16,
  },
  signupCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  signupGradient: {
    borderRadius: 16,
  },
  signupCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  signupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  signupText: {
    marginLeft: 6,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  signupDescription: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  signupButton: {
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  signupButtonContent: {
    paddingVertical: 8,
  },
  signupButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  benefitsContainer: {
    width: '100%',
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  benefitText: {
    marginLeft: 4,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  footerText: {
    opacity: 0.7,
    color: 'white',
    marginBottom: 8,
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  securityIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
});
