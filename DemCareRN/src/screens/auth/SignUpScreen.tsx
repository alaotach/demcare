import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, Platform, KeyboardAvoidingView, StatusBar, Animated, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');
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
  Divider,
  ProgressBar,
  Badge
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface Props {
  navigation: any;
}

export default function SignUpScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signUp } = useAuthStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  
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
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Calculate form completion progress
  const getFormProgress = () => {
    const fields = ['fullName', 'username', 'email', 'phoneNumber', 'age', 'password', 'confirmPassword'];
    const filledFields = fields.filter(field => formData[field as keyof typeof formData].toString().trim() !== '');
    const termsProgress = acceptTerms ? 1 : 0;
    return (filledFields.length + termsProgress) / (fields.length + 1);
  };

  // Animation effects
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Configure status bar after animations start
    setTimeout(() => {
      StatusBar.setHidden(true, 'fade');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(true);
      }
    }, 100);

    return () => {
      rotateAnimation.stop();
      // Restore status bar when component unmounts
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const roleOptions = [
    { label: 'Doctor', value: UserRole.DOCTOR, icon: 'doctor', color: '#2E7D32' },
    { label: 'Caregiver', value: UserRole.CAREGIVER, icon: 'account-heart', color: '#E91E63' },
    { label: 'Family Member', value: UserRole.FAMILY_MEMBER, icon: 'account-group', color: '#FF9800' },
    { label: 'Physician', value: UserRole.PHYSICIAN, icon: 'stethoscope', color: '#3F51B5' },
    { label: 'Other', value: UserRole.OTHER, icon: 'account', color: '#9E9E9E' }
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return '#F44336';
      case 2: return '#FF9800';
      case 3: return '#FFC107';
      case 4: return '#8BC34A';
      case 5: return '#4CAF50';
      default: return '#F44336';
    }
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return 'Very Weak';
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
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar hidden={true} backgroundColor="transparent" translucent={true} />
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
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Enhanced Header with Animation */}
              <Animated.View 
                style={[
                  styles.headerSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Animated.View
                  style={[
                    styles.logoGradient,
                    { transform: [{ rotate: logoRotationInterpolate }] }
                  ]}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#2196F3', '#9C27B0']}
                    style={styles.logoGradientInner}
                  >
                    <MaterialCommunityIcons name="medical-bag" size={26} color="white" />
                  </LinearGradient>
                </Animated.View>
                
                <Text variant="headlineMedium" style={styles.titleText}>
                  Join DemCare
                </Text>
                <Text variant="bodyMedium" style={styles.subtitleText}>
                  Your healthcare journey starts here
                </Text>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <Text variant="bodySmall" style={styles.progressText}>
                    Profile Completion: {Math.round(getFormProgress() * 100)}%
                  </Text>
                  <ProgressBar 
                    progress={getFormProgress()} 
                    color="rgba(255,255,255,0.9)"
                    style={styles.progressBar}
                  />
                </View>
              </Animated.View>

              {/* Content Section with Animation */}
              <Animated.View 
                style={[
                  styles.contentSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {/* Enhanced Form Card */}
                <Card style={styles.mainCard} elevation={5}>
                  <Card.Content style={styles.cardContent}>
                  {/* Personal Information Section */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="account-circle" size={22} color={theme.colors.primary} />
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Personal Information
                      </Text>
                      <Badge size={18} style={[styles.sectionBadge, { backgroundColor: theme.colors.primary }]}>1</Badge>
                    </View>

                    <TextInput
                      label="Full Name"
                      value={formData.fullName}
                      onChangeText={(value) => updateFormData('fullName', value)}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      mode="outlined"
                      style={[styles.input, focusedField === 'fullName' && styles.inputFocused]}
                      error={!!errors.fullName}
                      left={<TextInput.Icon icon="account" />}
                      right={formData.fullName.trim() && <TextInput.Icon icon="check" />}
                      outlineStyle={styles.inputOutline}
                      activeOutlineColor={theme.colors.primary}
                    />
                    {errors.fullName && (
                      <HelperText type="error" style={styles.helperText}>
                        {errors.fullName}
                      </HelperText>
                    )}

                    <View style={styles.rowContainer}>
                      <View style={styles.halfWidth}>
                        <TextInput
                          label="Username"
                          value={formData.username}
                          onChangeText={(value) => updateFormData('username', value)}
                          onFocus={() => setFocusedField('username')}
                          onBlur={() => setFocusedField(null)}
                          mode="outlined"
                          style={[styles.input, focusedField === 'username' && styles.inputFocused]}
                          autoCapitalize="none"
                          error={!!errors.username}
                          left={<TextInput.Icon icon="at" />}
                          right={formData.username.trim() && formData.username.length >= 3 && <TextInput.Icon icon="check" />}
                          outlineStyle={styles.inputOutline}
                          activeOutlineColor={theme.colors.primary}
                        />
                        {errors.username && (
                          <HelperText type="error" style={styles.helperText}>
                            {errors.username}
                          </HelperText>
                        )}
                      </View>

                      <View style={styles.halfWidth}>
                        <TextInput
                          label="Age"
                          value={formData.age}
                          onChangeText={(value) => updateFormData('age', value)}
                          onFocus={() => setFocusedField('age')}
                          onBlur={() => setFocusedField(null)}
                          mode="outlined"
                          style={[styles.input, focusedField === 'age' && styles.inputFocused]}
                          keyboardType="numeric"
                          error={!!errors.age}
                          left={<TextInput.Icon icon="calendar" />}
                          right={formData.age.trim() && !isNaN(Number(formData.age)) && Number(formData.age) > 0 && <TextInput.Icon icon="check" />}
                          outlineStyle={styles.inputOutline}
                          activeOutlineColor={theme.colors.primary}
                        />
                        {errors.age && (
                          <HelperText type="error" style={styles.helperText}>
                            {errors.age}
                          </HelperText>
                        )}
                      </View>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  {/* Contact Information Section */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="contacts" size={22} color={theme.colors.primary} />
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Contact Information
                      </Text>
                      <Badge size={18} style={[styles.sectionBadge, { backgroundColor: theme.colors.primary }]}>2</Badge>
                    </View>

                    <TextInput
                      label="Email Address"
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      mode="outlined"
                      style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={!!errors.email}
                      left={<TextInput.Icon icon="email" />}
                      right={formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email) && <TextInput.Icon icon="check" />}
                      outlineStyle={styles.inputOutline}
                      activeOutlineColor={theme.colors.primary}
                    />
                    {errors.email && (
                      <HelperText type="error" style={styles.helperText}>
                        {errors.email}
                      </HelperText>
                    )}

                    <TextInput
                      label="Phone Number"
                      value={formData.phoneNumber}
                      onChangeText={(value) => updateFormData('phoneNumber', value)}
                      onFocus={() => setFocusedField('phoneNumber')}
                      onBlur={() => setFocusedField(null)}
                      mode="outlined"
                      style={[styles.input, focusedField === 'phoneNumber' && styles.inputFocused]}
                      keyboardType="phone-pad"
                      error={!!errors.phoneNumber}
                      left={<TextInput.Icon icon="phone" />}
                      right={formData.phoneNumber.trim() && <TextInput.Icon icon="check" />}
                      outlineStyle={styles.inputOutline}
                      activeOutlineColor={theme.colors.primary}
                    />
                    {errors.phoneNumber && (
                      <HelperText type="error" style={styles.helperText}>
                        {errors.phoneNumber}
                      </HelperText>
                    )}
                  </View>

                  <Divider style={styles.divider} />

                  {/* Enhanced Role Selection Section */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="account-group" size={22} color={theme.colors.primary} />
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Role Selection
                      </Text>
                      <Badge size={18} style={[styles.sectionBadge, { backgroundColor: theme.colors.primary }]}>3</Badge>
                    </View>

                    <Menu
                      visible={showRoleMenu}
                      onDismiss={() => setShowRoleMenu(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setShowRoleMenu(true)}
                          style={[styles.roleButton, { borderColor: theme.colors.primary }]}
                          icon="chevron-down"
                          contentStyle={styles.roleButtonContent}
                        >
                          {roleOptions.find(r => r.value === formData.role)?.label || 'Select Role'}
                        </Button>
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
                          leadingIcon={option.icon}
                          titleStyle={{ color: option.color }}
                        />
                      ))}
                    </Menu>

                    <View style={styles.selectedRoleChip}>
                      <Chip 
                        icon={roleOptions.find(r => r.value === formData.role)?.icon || 'account'}
                        style={[styles.roleChip, { backgroundColor: roleOptions.find(r => r.value === formData.role)?.color + '20' }]}
                        textStyle={{ color: roleOptions.find(r => r.value === formData.role)?.color }}
                      >
                        {roleOptions.find(r => r.value === formData.role)?.label}
                      </Chip>
                    </View>

                    <Text variant="bodySmall" style={styles.roleDescription}>
                      Choose your role in the DemCare platform
                    </Text>
                  </View>

                  <Divider style={styles.divider} />

                  {/* Enhanced Security Section */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="shield-account" size={22} color={theme.colors.primary} />
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Security
                      </Text>
                      <Badge size={18} style={[styles.sectionBadge, { backgroundColor: theme.colors.primary }]}>4</Badge>
                    </View>

                    <TextInput
                      label="Password"
                      value={formData.password}
                      onChangeText={(value) => updateFormData('password', value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      mode="outlined"
                      style={[styles.input, focusedField === 'password' && styles.inputFocused]}
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
                      activeOutlineColor={theme.colors.primary}
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <View style={styles.passwordStrengthContainer}>
                        <View style={styles.passwordStrengthRow}>
                          <Text variant="bodySmall" style={styles.passwordStrengthLabel}>
                            Password Strength:
                          </Text>
                          <Text 
                            variant="bodySmall" 
                            style={[
                              styles.passwordStrengthText,
                              { color: getPasswordStrengthColor(getPasswordStrength(formData.password)) }
                            ]}
                          >
                            {getPasswordStrengthText(getPasswordStrength(formData.password))}
                          </Text>
                        </View>
                        <ProgressBar 
                          progress={getPasswordStrength(formData.password) / 5} 
                          color={getPasswordStrengthColor(getPasswordStrength(formData.password))}
                          style={styles.passwordStrengthBar}
                        />
                      </View>
                    )}
                    
                    {errors.password && (
                      <HelperText type="error" style={styles.helperText}>
                        {errors.password}
                      </HelperText>
                    )}

                    <TextInput
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateFormData('confirmPassword', value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      mode="outlined"
                      style={[styles.input, focusedField === 'confirmPassword' && styles.inputFocused]}
                      secureTextEntry={!showConfirmPassword}
                      error={!!errors.confirmPassword}
                      left={<TextInput.Icon icon="lock-check" />}
                      right={
                        <>
                          {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <TextInput.Icon icon="check" />
                          )}
                          <TextInput.Icon
                            icon={showConfirmPassword ? "eye-off" : "eye"}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </>
                      }
                      outlineStyle={styles.inputOutline}
                      activeOutlineColor={theme.colors.primary}
                    />
                    {errors.confirmPassword && (
                      <HelperText type="error" style={styles.helperText}>
                        {errors.confirmPassword}
                      </HelperText>
                    )}

                    <Surface style={styles.termsContainer} elevation={2}>
                      <View style={styles.checkboxContainer}>
                        <Checkbox
                          status={acceptTerms ? 'checked' : 'unchecked'}
                          onPress={() => setAcceptTerms(!acceptTerms)}
                        />
                        <Text variant="bodyMedium" style={styles.checkboxText}>
                          I accept the{' '}
                          <Text style={styles.linkText}>Terms & Conditions</Text>
                          {' '}and{' '}
                          <Text style={styles.linkText}>Privacy Policy</Text>
                        </Text>
                      </View>
                    </Surface>
                    {errors.terms && (
                      <HelperText type="error" style={styles.helperText}>
                        {errors.terms}
                      </HelperText>
                    )}
                  </View>

                  {/* Enhanced Action Buttons */}
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      onPress={handleSignUp}
                      style={[styles.signUpButton, { backgroundColor: theme.colors.primary }]}
                      contentStyle={styles.buttonContent}
                      loading={loading}
                      disabled={loading || getFormProgress() < 1}
                      icon="account-plus"
                      labelStyle={styles.buttonLabel}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    
                    {getFormProgress() < 1 && (
                      <Text variant="bodySmall" style={styles.buttonHint}>
                        Complete all fields to enable registration
                      </Text>
                    )}
                  </View>
                  </Card.Content>
                </Card>

                {/* Enhanced Footer with Animation */}
                <Animated.View style={[styles.footerSection, { opacity: fadeAnim }]}>
                  <View style={styles.loginContainer}>
                    <Text variant="bodyMedium" style={styles.loginPromptText}>
                      Already have an account?{' '}
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => navigation.navigate('Login')}
                      style={styles.loginLinkButton}
                      labelStyle={styles.loginLinkText}
                    >
                      Sign In
                    </Button>
                  </View>

                  {/* Enhanced Footer */}
                  <View style={styles.footer}>
                    <View style={styles.securityIndicators}>
                      <MaterialCommunityIcons name="shield-check" size={14} color="rgba(255,255,255,0.9)" />
                      <Text variant="bodySmall" style={styles.securityText}>
                        Secure Registration
                      </Text>
                      <MaterialCommunityIcons name="certificate" size={14} color="rgba(255,255,255,0.9)" />
                      <Text variant="bodySmall" style={styles.securityText}>
                        HIPAA Compliant
                      </Text>
                      <MaterialCommunityIcons name="lock" size={14} color="rgba(255,255,255,0.9)" />
                      <Text variant="bodySmall" style={styles.securityText}>
                        256-bit SSL
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            </ScrollView>
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
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Responsive Header Section
  headerSection: {
    minHeight: height * 0.15,
    maxHeight: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + height * 0.02 : height * 0.025,
    paddingBottom: height * 0.008,
    marginBottom: height * 0.01,
  },
  logoGradient: {
    width: Math.min(width * 0.15, 70),
    height: Math.min(width * 0.15, 70),
    borderRadius: Math.min(width * 0.075, 35),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.012,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoGradientInner: {
    width: Math.min(width * 0.15, 70),
    height: Math.min(width * 0.15, 70),
    borderRadius: Math.min(width * 0.075, 35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: Math.min(width * 0.1, 45),
    height: Math.min(width * 0.1, 45),
  },
  titleText: {
    fontSize: Math.min(width * 0.06, 26),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
    marginBottom: height * 0.005,
  },
  subtitleText: {
    fontSize: Math.min(width * 0.04, 16),
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginTop: height * 0.005,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontWeight: '500',
  },
  progressContainer: {
    width: '90%',
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.02,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: height * 0.008,
    fontWeight: '600',
    fontSize: Math.min(width * 0.03, 13),
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    height: height * 0.008,
    borderRadius: height * 0.004,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Responsive Content Section
  contentSection: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.01,
    justifyContent: 'flex-start',
  },
  mainCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: height * 0.02,
  },
  cardContent: {
    padding: Math.min(width * 0.06, 28),
  },
  sectionContainer: {
    marginBottom: height * 0.02,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
    paddingBottom: height * 0.008,
  },
  sectionTitle: {
    marginLeft: width * 0.025,
    flex: 1,
    fontWeight: '700',
    color: '#1a1a1a',
    fontSize: Math.min(width * 0.04, 16),
  },
  sectionBadge: {
    marginLeft: 'auto',
  },
  divider: {
    marginVertical: height * 0.02,
    backgroundColor: '#E1E5E9',
    height: 1,
  },
  input: {
    marginBottom: height * 0.012,
    backgroundColor: '#FAFBFC',
    fontSize: Math.min(width * 0.04, 16),
  },
  inputFocused: {
    backgroundColor: '#F0F9FF',
    transform: [{ scale: 1.01 }],
  },
  inputOutline: {
    borderRadius: 16,
    borderWidth: 1.5,
  },
  helperText: {
    marginBottom: height * 0.012,
    marginLeft: width * 0.01,
    fontSize: Math.min(width * 0.03, 12),
  },
  rowContainer: {
    flexDirection: 'row',
    gap: width * 0.03,
  },
  halfWidth: {
    flex: 1,
  },
  roleButton: {
    borderRadius: 16,
    marginBottom: height * 0.012,
    borderWidth: 2,
    minHeight: height * 0.06,
  },
  roleButtonContent: {
    paddingVertical: height * 0.012,
    minHeight: height * 0.05,
  },
  selectedRoleChip: {
    alignItems: 'flex-start',
    marginBottom: height * 0.008,
  },
  roleChip: {
    borderRadius: 20,
  },
  roleDescription: {
    color: '#6B7280',
    fontSize: Math.min(width * 0.03, 13),
    fontStyle: 'italic',
    textAlign: 'center',
  },
  termsContainer: {
    marginTop: height * 0.015,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: width * 0.04,
  },
  checkboxText: {
    flex: 1,
    marginLeft: width * 0.03,
    color: '#374151',
    fontSize: Math.min(width * 0.035, 14),
    lineHeight: height * 0.025,
  },
  linkText: {
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  passwordStrengthContainer: {
    marginTop: height * 0.008,
    marginBottom: height * 0.012,
  },
  passwordStrengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.006,
  },
  passwordStrengthLabel: {
    color: '#6B7280',
    fontSize: Math.min(width * 0.03, 12),
  },
  passwordStrengthText: {
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
  },
  passwordStrengthBar: {
    height: height * 0.005,
    borderRadius: height * 0.0025,
    backgroundColor: '#F3F4F6',
  },
  buttonContainer: {
    marginTop: height * 0.024,
  },
  signUpButton: {
    borderRadius: 16,
    paddingVertical: height * 0.008,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    minHeight: height * 0.06,
  },
  buttonContent: {
    paddingVertical: height * 0.015,
    minHeight: height * 0.05,
  },
  buttonLabel: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonHint: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: height * 0.012,
    fontStyle: 'italic',
    fontSize: Math.min(width * 0.03, 12),
  },
  // Responsive Footer Section
  footerSection: {
    minHeight: height * 0.08,
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.01,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.015,
    marginBottom: height * 0.012,
    flexWrap: 'wrap',
  },
  loginPromptText: {
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '500',
  },
  loginLinkButton: {
    marginLeft: -width * 0.005,
  },
  loginLinkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: Math.min(width * 0.038, 15),
  },
  footer: {
    alignItems: 'center',
  },
  securityIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Math.min(width * 0.028, 11),
    marginLeft: width * 0.01,
    marginRight: width * 0.015,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600',
  },
});
