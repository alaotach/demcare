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
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                  colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
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
              <Text variant="bodySmall" style={styles.quickLoginTitle}>
                Quick Demo Access:
              </Text>
              <View style={styles.quickLoginButtons}>
                <Chip
                  icon="doctor"
                  onPress={() => handleQuickLogin('doctor')}
                  style={[styles.quickLoginChip, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  Doctor Login
                </Chip>
                <Chip
                  icon="account-heart"
                  onPress={() => handleQuickLogin('caregiver')}
                  style={[styles.quickLoginChip, { backgroundColor: theme.colors.secondaryContainer }]}
                >
                  Caregiver Login
                </Chip>
              </View>
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              style={[
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <Card style={styles.loginCard} elevation={5}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="login" size={24} color={theme.colors.primary} />
                    <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
                      Sign In
                    </Text>
                  </View>

                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    left={<TextInput.Icon icon="email" />}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    error={!!errors.email}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.email} style={styles.helperText}>
                    {errors.email}
                  </HelperText>

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    error={!!errors.password}
                    disabled={loading}
                  />
                  <HelperText type="error" visible={!!errors.password} style={styles.helperText}>
                    {errors.password}
                  </HelperText>

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    style={styles.forgotButton}
                    disabled={loading}
                  >
                    Forgot Password?
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Sign Up Section */}
            <Animated.View
              style={[
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <Card style={styles.signupCard} elevation={4}>
                <Card.Content style={styles.signupContainer}>
                  <Text variant="titleMedium" style={[styles.signupText, { color: theme.colors.onSurface }]}>
                    New to DemCare?
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('SignUp')}
                    style={[styles.signupButton, { borderColor: theme.colors.primary }]}
                    disabled={loading}
                  >
                    Create Account
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                © 2024 DemCare. Secure & HIPAA Compliant
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
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  quickLoginContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  quickLoginTitle: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickLoginButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLoginChip: {
    elevation: 2,
  },
  loginCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  cardContent: {
    padding: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
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
    borderRadius: 16,
  },
  helperText: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  signupCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 5,
  },
  signupContainer: {
    alignItems: 'center',
    padding: 24,
  },
  signupText: {
    marginBottom: 16,
    fontWeight: '600',
    color: 'white',
  },
  signupButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    opacity: 0.7,
    color: 'white',
    marginBottom: 8,
  },
  securityIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
});
