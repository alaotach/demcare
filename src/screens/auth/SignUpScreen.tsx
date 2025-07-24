import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  useTheme,
  HelperText,
  Menu,
  Checkbox,
  Surface,
  IconButton,
  Chip,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface Props {
  navigation: any;
}

export default function SignUpScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signUp } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    age: '',
    password: '',
    confirmPassword: '',
    role: UserRole.DOCTOR
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    { label: 'Doctor', value: UserRole.DOCTOR },
    { label: 'Caregiver', value: UserRole.CAREGIVER },
    { label: 'Family Member', value: UserRole.FAMILY_MEMBER },
    { label: 'Physician', value: UserRole.PHYSICIAN },
    { label: 'Other', value: UserRole.OTHER }
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        age: Number(formData.age),
        password: formData.password,
        role: formData.role
      });
    } catch (error) {
      Alert.alert('Sign Up Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Surface style={styles.logoContainer} elevation={3}>
            <MaterialCommunityIcons 
              name="medical-bag" 
              size={32} 
              color={theme.colors.primary} 
            />
          </Surface>
          <Text variant="headlineLarge" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join the DemCare community
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-circle" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Personal Information
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />

            <TextInput
              label="Full Name"
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.fullName}
              left={<TextInput.Icon icon="account" />}
              outlineStyle={styles.inputOutline}
            />
            <HelperText type="error" visible={!!errors.fullName} style={styles.helperText}>
              {errors.fullName}
            </HelperText>

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Username"
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                  error={!!errors.username}
                  left={<TextInput.Icon icon="at" />}
                  outlineStyle={styles.inputOutline}
                />
                <HelperText type="error" visible={!!errors.username} style={styles.helperText}>
                  {errors.username}
                </HelperText>
              </View>

              <View style={styles.halfWidth}>
                <TextInput
                  label="Age"
                  value={formData.age}
                  onChangeText={(value) => updateFormData('age', value)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  error={!!errors.age}
                  left={<TextInput.Icon icon="calendar" />}
                  outlineStyle={styles.inputOutline}
                />
                <HelperText type="error" visible={!!errors.age} style={styles.helperText}>
                  {errors.age}
                </HelperText>
              </View>
            </View>
          </Surface>

          {/* Contact Information Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="contacts" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Contact Information
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
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
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.phoneNumber}
              left={<TextInput.Icon icon="phone" />}
              outlineStyle={styles.inputOutline}
            />
            <HelperText type="error" visible={!!errors.phoneNumber} style={styles.helperText}>
              {errors.phoneNumber}
            </HelperText>
          </Surface>

          {/* Role Selection Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Role Selection
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />

            <Menu
              visible={showRoleMenu}
              onDismiss={() => setShowRoleMenu(false)}
              anchor={
                <Surface style={styles.roleSelector} elevation={2}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowRoleMenu(true)}
                    style={styles.roleButton}
                    icon="chevron-down"
                    contentStyle={styles.roleButtonContent}
                  >
                    {roleOptions.find(r => r.value === formData.role)?.label || 'Select Role'}
                  </Button>
                </Surface>
              }
            >
              {roleOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    updateFormData('role', option.value);
                    setShowRoleMenu(false);
                  }}
                  title={option.label}
                  leadingIcon={option.value === UserRole.DOCTOR ? 'doctor' : 
                              option.value === UserRole.CAREGIVER ? 'account-heart' :
                              option.value === UserRole.PHYSICIAN ? 'stethoscope' : 'account'}
                />
              ))}
            </Menu>

            <Chip 
              icon="information" 
              style={styles.infoChip}
              textStyle={styles.infoChipText}
            >
              Choose your role in the DemCare platform
            </Chip>
          </Surface>

          {/* Security Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="shield-account" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Security
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
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

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              error={!!errors.confirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              outlineStyle={styles.inputOutline}
            />
            <HelperText type="error" visible={!!errors.confirmPassword} style={styles.helperText}>
              {errors.confirmPassword}
            </HelperText>

            <Surface style={styles.termsContainer} elevation={1}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={acceptTerms ? 'checked' : 'unchecked'}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                />
                <Text variant="bodyMedium" style={styles.checkboxText}>
                  I accept the Terms & Conditions and Privacy Policy
                </Text>
              </View>
            </Surface>
            <HelperText type="error" visible={!!errors.terms} style={styles.helperText}>
              {errors.terms}
            </HelperText>
          </Surface>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSignUp}
              style={styles.signUpButton}
              contentStyle={styles.buttonContent}
              loading={loading}
              disabled={loading}
              icon="account-plus"
            >
              Create Account
            </Button>

            <View style={styles.loginContainer}>
              <Text variant="bodyMedium" style={styles.loginText}>
                Already have an account? 
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
                labelStyle={styles.loginButtonLabel}
              >
                Sign In
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    paddingTop: 48,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 12,
    fontWeight: '600',
  },
  sectionDivider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 12,
  },
  helperText: {
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  roleSelector: {
    borderRadius: 12,
    marginBottom: 4,
    elevation: 1,
  },
  roleButton: {
    borderRadius: 12,
  },
  roleButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 8,
  },
  infoChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  infoChipText: {
    fontSize: 12,
  },
  termsContainer: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  signUpButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  loginButton: {
    marginLeft: -8,
  },
  loginButtonLabel: {
    fontWeight: '600',
  },
});
