import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  useTheme,
  HelperText,
  Surface,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signIn } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
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
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    Alert.alert('Forgot Password', 'This feature will be implemented soon.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.background]}
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
          >
            {/* Enhanced Header */}
            <View style={styles.header}>
              <Surface style={styles.logoContainer} elevation={3}>
                <MaterialCommunityIcons 
                  name="medical-bag" 
                  size={48} 
                  color={theme.colors.primary} 
                />
              </Surface>
              <Text variant="headlineLarge" style={styles.title}>
                DemCare
              </Text>
              <Text variant="titleMedium" style={styles.subtitle}>
                Patient Monitoring System
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                Secure access for healthcare professionals
              </Text>
            </View>

            {/* Enhanced Login Card */}
            <Surface style={styles.loginCard} elevation={5}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons 
                    name="login" 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="headlineSmall" style={styles.cardTitle}>
                    Welcome Back
                  </Text>
                </View>

                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  left={<TextInput.Icon icon="email" />}
                  outlineStyle={styles.inputOutline}
                />
                <HelperText type="error" visible={!!errors.email} style={styles.helperText}>
                  {errors.email}
                </HelperText>

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  outlineStyle={styles.inputOutline}
                />
                <HelperText type="error" visible={!!errors.password} style={styles.helperText}>
                  {errors.password}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  loading={loading}
                  disabled={loading}
                  icon="login"
                >
                  Sign In
                </Button>

                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  style={styles.forgotButton}
                  icon="help-circle"
                >
                  Forgot Password?
                </Button>
              </View>
            </Surface>

            {/* Enhanced Sign Up Section */}
            <Surface style={styles.signupCard} elevation={2}>
              <View style={styles.signupContainer}>
                <Text variant="bodyLarge" style={styles.signupText}>
                  New to DemCare?
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('SignUp')}
                  style={styles.signupButton}
                  contentStyle={styles.buttonContent}
                  icon="account-plus"
                >
                  Create Account
                </Button>
              </View>
            </Surface>

            {/* Footer */}
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                © 2025 DemCare. Secure Healthcare Technology
              </Text>
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
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  loginCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
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
    marginLeft: 8,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 4,
  },
  inputOutline: {
    borderRadius: 12,
  },
  helperText: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  signupCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  signupContainer: {
    alignItems: 'center',
    padding: 20,
  },
  signupText: {
    marginBottom: 16,
    fontWeight: '600',
  },
  signupButton: {
    borderRadius: 12,
    borderWidth: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    opacity: 0.7,
    color: 'white',
  },
});
