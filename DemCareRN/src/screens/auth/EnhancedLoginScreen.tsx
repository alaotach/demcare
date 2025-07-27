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
  StatusBar,
  Keyboard,
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
import { Icon } from 'react-native-paper';
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const logoScale = useState(new Animated.Value(0.8))[0];
  const logoOpacity = useState(new Animated.Value(0))[0];
  const formTranslateY = useState(new Animated.Value(50))[0];
  const formOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Hide status bar for full screen experience
    StatusBar.setHidden(true, 'fade');
    
    // Keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    
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

    // Cleanup: Show status bar when component unmounts
    return () => {
      StatusBar.setHidden(false, 'fade');
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
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

  const handleQuickLogin = async (role: string) => {
    // Quick login for demo purposes
    const demoCredentials = {
      doctor: { email: 'demo.doctor@demcare.com', password: 'demo123' },
      caregiver: { email: 'demo.caregiver@demcare.com', password: 'demo123' },
    };

    const creds = demoCredentials[role as keyof typeof demoCredentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setErrors({});
      setLoading(true);
      try {
        await signIn(creds.email, creds.password);
      } catch (error) {
        Alert.alert(
          'Login Failed',
          error instanceof Error ? error.message : 'Unable to sign in. Please check your credentials and try again.'
        );
      } finally {
        setLoading(false);
      }
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
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar hidden={true} />
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
          <View style={styles.contentContainer}>
            {/* Top Section - Header */}
            <View style={styles.topSection}>
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
                    <Icon source="medical-bag" size={24} color="white" />
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
            </View>

            {/* Middle Section - Quick Login + Form */}
            <View style={styles.middleSection}>
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
                    style={[styles.quickLoginChip, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                    textStyle={{ color: 'white', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
                  >
                    Doctor Demo
                  </Chip>
                  <Chip
                    icon="account-heart"
                    mode="outlined"
                    onPress={() => handleQuickLogin('caregiver')}
                    style={[styles.quickLoginChip, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                    textStyle={{ color: 'white', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
                  >
                    Caregiver Demo
                  </Chip>
                </View>
              </Animated.View>

              {/* Demo Accounts Access Button */}
              <Animated.View
                style={[
                  styles.demoAccountsContainer,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}
              >
                <Button
                  mode="contained-tonal"
                  onPress={() => navigation.navigate('DemoAccounts')}
                  style={styles.demoAccountsButton}
                  contentStyle={styles.demoAccountsButtonContent}
                  labelStyle={styles.demoAccountsButtonLabel}
                  icon="account-multiple"
                >
                  View All Demo Accounts
                </Button>
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
                      <Icon
                        source="shield-account"
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

              {/* Sign Up Link - Below login card */}
              <Animated.View
                style={[
                  styles.signupContainer,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}
              >
                <View style={styles.signupLinkContainer}>
                  <Text variant="bodyMedium" style={styles.signupPromptText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('SignUp')}
                    style={styles.signupLinkButton}
                  >
                    <Text variant="bodyMedium" style={styles.signupLinkText}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>

            {/* Bottom Section - Simple Footer */}
            {!keyboardVisible && (
              <View style={styles.bottomSection}>
                {/* Footer - Compact */}
                <View style={styles.footer}>
                  <View style={styles.securityIndicators}>
                    <Icon source="shield-check" size={12} color="rgba(255,255,255,0.95)" />
                    <Text variant="bodySmall" style={styles.securityText}>
                      Enterprise Security
                    </Text>
                    <Icon source="certificate" size={12} color="rgba(255,255,255,0.95)" />
                    <Text variant="bodySmall" style={styles.securityText}>
                      HIPAA Compliant
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
    </LinearGradient>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: Math.min(width * 0.04, 18),
    paddingTop: height * 0.005,
    paddingBottom: height * 0.01,
    justifyContent: 'space-between',
  },
  // Responsive Section Heights
  topSection: {
    flex: 0.18,
    justifyContent: 'center',
    minHeight: height * 0.15,
    maxHeight: height * 0.2,
    marginBottom: height * 0.01,
  },
  middleSection: {
    flex: 0.82,
    justifyContent: 'flex-start',
    paddingVertical: height * 0.005,
    paddingBottom: height * 0.08,
  },
  bottomSection: {
    flex: 0.07,
    justifyContent: 'flex-end',
    minHeight: height * 0.04,
    maxHeight: height * 0.06,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: height * 0.005,
  },
  // Enhanced Header with Responsive Design
  header: {
    alignItems: 'center',
    marginBottom: height * 0.005,
    paddingHorizontal: width * 0.02,
  },
  logoContainer: {
    width: Math.min(width * 0.12, 55),
    height: Math.min(width * 0.12, 55),
    borderRadius: Math.min(width * 0.06, 27.5),
    overflow: 'hidden',
    marginBottom: height * 0.008,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    marginBottom: height * 0.002,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontSize: Math.min(width * 0.055, 24),
    letterSpacing: 0.8,
  },
  subtitle: {
    color: 'white',
    marginBottom: height * 0.002,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontSize: Math.min(width * 0.032, 13),
    fontWeight: '600',
  },
  description: {
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: width * 0.03,
    lineHeight: height * 0.018,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontSize: Math.min(width * 0.028, 11),
    fontWeight: '500',
  },
  // Enhanced Quick Login Section
  quickLoginContainer: {
    marginBottom: height * 0.01,
    alignItems: 'center',
  },
  quickLoginTitle: {
    color: 'white',
    marginBottom: height * 0.006,
    textAlign: 'center',
    fontSize: Math.min(width * 0.028, 11),
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    gap: width * 0.03,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickLoginChip: {
    elevation: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5,
    minHeight: height * 0.04,
    paddingHorizontal: width * 0.03,
  },
  // Enhanced Form Container
  formContainer: {
    marginBottom: height * 0.008,
  },
  loginCard: {
    borderRadius: 24,
    marginBottom: height * 0.01,
    overflow: 'hidden',
    elevation: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    padding: Math.min(width * 0.05, 22),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
    paddingBottom: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cardTitle: {
    marginLeft: width * 0.03,
    fontWeight: '800',
    fontSize: Math.min(width * 0.05, 20),
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: height * 0.008,
    backgroundColor: '#FAFBFC',
    fontSize: Math.min(width * 0.04, 16),
  },
  inputOutline: {
    borderRadius: 16,
    borderWidth: 2,
  },
  helperText: {
    marginBottom: height * 0.012,
    fontSize: Math.min(width * 0.032, 13),
    marginLeft: width * 0.01,
  },
  buttonContent: {
    paddingVertical: height * 0.015,
    minHeight: height * 0.055,
  },
  loginButton: {
    marginTop: height * 0.02,
    marginBottom: height * 0.012,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    minHeight: height * 0.06,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: height * 0.005,
    paddingVertical: height * 0.008,
  },
  // Enhanced Signup Section
  signupContainer: {
    alignItems: 'center',
    marginTop: height * 0.015,
    marginBottom: height * 0.01,
  },
  signupLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexWrap: 'wrap',
  },
  signupPromptText: {
    color: 'white',
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  signupLinkButton: {
    paddingVertical: height * 0.005,
    paddingHorizontal: width * 0.02,
    marginLeft: width * 0.01,
  },
  signupLinkText: {
    color: 'white',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '800',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  // Enhanced Footer
  footer: {
    alignItems: 'center',
    paddingVertical: height * 0.005,
  },
  securityIndicators: {
    flexDirection: 'row',
    gap: width * 0.012,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    paddingVertical: height * 0.005,
    paddingHorizontal: width * 0.04,
  },
  securityText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: Math.min(width * 0.025, 10),
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginLeft: width * 0.003,
    marginRight: width * 0.008,
  },
  // Demo Accounts Button
  demoAccountsContainer: {
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.08,
  },
  demoAccountsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoAccountsButtonContent: {
    paddingVertical: height * 0.006,
  },
  demoAccountsButtonLabel: {
    color: 'white',
    fontSize: Math.min(width * 0.036, 14),
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
