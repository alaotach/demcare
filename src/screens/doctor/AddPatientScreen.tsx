import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  useTheme,
  HelperText,
  Surface,
  IconButton,
  Chip,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function AddPatientScreen({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { addPatient } = usePatientStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    height: '',
    weight: '',
    caregiverContactNumber: '',
    rfidMacAddress: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Patient name is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.height.trim()) {
      newErrors.height = 'Height is required';
    } else if (isNaN(Number(formData.height)) || Number(formData.height) < 30 || Number(formData.height) > 300) {
      newErrors.height = 'Please enter a valid height in cm';
    }

    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) < 1 || Number(formData.weight) > 500) {
      newErrors.weight = 'Please enter a valid weight in kg';
    }

    if (!formData.caregiverContactNumber.trim()) {
      newErrors.caregiverContactNumber = 'Caregiver contact is required';
    }

    if (!formData.rfidMacAddress.trim()) {
      newErrors.rfidMacAddress = 'RFID MAC Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      await addPatient({
        fullName: formData.fullName.trim(),
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        caregiverContactNumber: formData.caregiverContactNumber.trim(),
        rfidMacAddress: formData.rfidMacAddress.trim(),
        doctorId: user.id,
        status: 'offline' as any // Will be set properly in the service
      });

      Alert.alert(
        'Success', 
        'Patient added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = () => {
    // TODO: Implement QR scanner
    Alert.alert('QR Scanner', 'QR scanning feature will be implemented soon.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Header */}
      <Surface style={styles.headerSurface} elevation={2}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <View style={styles.headerTextContainer}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Add New Patient
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Register a new patient for monitoring
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Patient Information Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialDesignIcons name="account" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Patient Information
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

              <View style={styles.halfWidth}>
                <TextInput
                  label="Height (cm)"
                  value={formData.height}
                  onChangeText={(value) => updateFormData('height', value)}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  error={!!errors.height}
                  left={<TextInput.Icon icon="human-male-height" />}
                  outlineStyle={styles.inputOutline}
                />
                <HelperText type="error" visible={!!errors.height} style={styles.helperText}>
                  {errors.height}
                </HelperText>
              </View>
            </View>

            <TextInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(value) => updateFormData('weight', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.weight}
              left={<TextInput.Icon icon="scale" />}
              outlineStyle={styles.inputOutline}
            />
            <HelperText type="error" visible={!!errors.weight} style={styles.helperText}>
              {errors.weight}
            </HelperText>
          </Surface>

          {/* Contact Information Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialDesignIcons name="phone" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Contact Information
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />

            <TextInput
              label="Caregiver Contact Number"
              value={formData.caregiverContactNumber}
              onChangeText={(value) => updateFormData('caregiverContactNumber', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.caregiverContactNumber}
              left={<TextInput.Icon icon="phone" />}
              outlineStyle={styles.inputOutline}
            />
            <HelperText type="error" visible={!!errors.caregiverContactNumber} style={styles.helperText}>
              {errors.caregiverContactNumber}
            </HelperText>
          </Surface>

          {/* Device Information Section */}
          <Surface style={styles.sectionCard} elevation={3}>
            <View style={styles.sectionHeader}>
              <MaterialDesignIcons name="bluetooth" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Device Information
              </Text>
            </View>
            <Divider style={styles.sectionDivider} />

            <View style={styles.macAddressContainer}>
              <TextInput
                label="RFID/Device MAC Address"
                value={formData.rfidMacAddress}
                onChangeText={(value) => updateFormData('rfidMacAddress', value)}
                mode="outlined"
                style={styles.macInput}
                autoCapitalize="characters"
                error={!!errors.rfidMacAddress}
                left={<TextInput.Icon icon="wifi" />}
                outlineStyle={styles.inputOutline}
                placeholder="XX:XX:XX:XX:XX:XX"
              />
              <Surface style={styles.qrButtonContainer} elevation={2}>
                <IconButton
                  icon="qrcode-scan"
                  size={24}
                  iconColor={theme.colors.primary}
                  onPress={handleQRScan}
                  style={styles.qrButton}
                />
              </Surface>
            </View>
            <HelperText type="error" visible={!!errors.rfidMacAddress} style={styles.helperText}>
              {errors.rfidMacAddress}
            </HelperText>

            <Chip 
              icon="information" 
              style={styles.infoChip}
              textStyle={styles.infoChipText}
            >
              Scan the QR code on the patient's monitoring device
            </Chip>
          </Surface>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
              icon="close"
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              loading={loading}
              disabled={loading}
              icon="plus"
            >
              Add Patient
            </Button>
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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSurface: {
    borderRadius: 0,
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
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
  macAddressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  macInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  qrButtonContainer: {
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
  },
  qrButton: {
    margin: 0,
  },
  infoChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  infoChipText: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
