import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  useTheme,
  Chip,
  SegmentedButtons,
  RadioButton,
  Surface,
  IconButton,
  HelperText,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import { usePatientStore } from '../../store/patientStore';
import { useAuthStore } from '../../store/authStore';
import { Patient, PatientStatus } from '../../types';

interface Props {
  navigation: any;
}

export default function EnhancedAddPatientScreen({ navigation }: Props) {
  const theme = useTheme();
  const { addPatient } = usePatientStore();
  const { user } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: new Date(),
    gender: 'male' as 'male' | 'female' | 'other',
    bloodType: 'O+',
    height: '',
    weight: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    insuranceProvider: '',
    insuranceNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    rfidMacAddress: '', // Add RFID MAC address field
  });

  // UI State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('O+');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const steps = [
    { title: 'Personal Info', icon: 'account' },
    { title: 'Medical Info', icon: 'medical-bag' },
    { title: 'Emergency', icon: 'phone-alert' },
    { title: 'Insurance', icon: 'shield-account' },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 1:
        return !!(formData.height && formData.weight);
      case 2:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone);
      case 3:
        return !!(formData.address && formData.city && formData.state && formData.zipCode);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields.');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newPatient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        age: new Date().getFullYear() - formData.dateOfBirth.getFullYear(),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        caregiverContactNumber: formData.emergencyContactPhone,
        rfidMacAddress: formData.rfidMacAddress || '', // Include RFID MAC address
        doctorId: user?.id || '',
        medicalRecordNumber: `MRN-${Date.now()}`, // Generate unique medical record number
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: 'Emergency Contact',
        },
        medicalHistory: formData.medicalConditions.split(',').map(c => c.trim()).filter(Boolean),
        medications: formData.medications.split(',').map(m => m.trim()).filter(Boolean).map((name, index) => ({
          id: `temp-${index}`,
          name,
          dosage: '',
          frequency: '',
          prescribedBy: user?.fullName || '',
          startDate: new Date(),
          instructions: '',
          isActive: true,
        })),
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
        vitals: {
          heartRate: 72,
          oxygenSaturation: 98,
          respiratoryRate: 16,
          stepCount: 0,
          timestamp: new Date(),
        },
        status: PatientStatus.OFFLINE,
      };

      await addPatient(newPatient as Patient);
      Alert.alert('Success', 'Patient added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Add New Patient
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStep ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                  },
                ]}
              >
                <Icon
                  source={step.icon}
                  size={16}
                  color={index <= currentStep ? theme.colors.primary : '#FFFFFF'}
                />
              </View>
              <Text style={[
                styles.progressLabel,
                { color: index <= currentStep ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' }
              ]}>
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    {
                      backgroundColor: index < currentStep ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderPersonalInfo = () => (
    <Card style={styles.stepCard}>
      <Card.Content>
        <View style={styles.stepHeader}>
          <Icon source="account" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.stepTitle}>Personal Information</Text>
        </View>
        
        <View style={styles.rowContainer}>
          <TextInput
            label="First Name *"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
          />
          <TextInput
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
          />
        </View>
        
        <TextInput
          label="Email Address *"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
        />
        
        <TextInput
          label="Date of Birth (YYYY-MM-DD)"
          value={formData.dateOfBirth.toISOString().split('T')[0]}
          onChangeText={(text) => {
            const [year, month, day] = text.split('-').map(Number);
            if (year && month && day) {
              setFormData({ ...formData, dateOfBirth: new Date(year, month - 1, day) });
            }
          }}
          style={styles.input}
          mode="outlined"
          placeholder="YYYY-MM-DD"
        />
        
        <Text variant="bodyLarge" style={styles.radioLabel}>Gender *</Text>
        <RadioButton.Group
          onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
          value={formData.gender}
        >
          <View style={styles.radioContainer}>
            <RadioButton.Item label="Male" value="male" />
            <RadioButton.Item label="Female" value="female" />
            <RadioButton.Item label="Other" value="other" />
          </View>
        </RadioButton.Group>
      </Card.Content>
    </Card>
  );

  const renderMedicalInfo = () => (
    <Card style={styles.stepCard}>
      <Card.Content>
        <View style={styles.stepHeader}>
          <Icon source="medical-bag" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.stepTitle}>Medical Information</Text>
        </View>
        
        <View style={styles.rowContainer}>
          <TextInput
            label="Height (cm) *"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
          />
          <TextInput
            label="Weight (kg) *"
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
          />
        </View>
        
        <Text variant="bodyLarge" style={styles.bloodTypeLabel}>Blood Type</Text>
        <View style={styles.bloodTypeContainer}>
          {bloodTypes.map((type) => (
            <Chip
              key={type}
              selected={selectedBloodType === type}
              onPress={() => setSelectedBloodType(type)}
              style={styles.bloodTypeChip}
            >
              {type}
            </Chip>
          ))}
        </View>
        
        <TextInput
          label="Medical Conditions"
          value={formData.medicalConditions}
          onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Separate multiple conditions with commas"
        />
        
        <TextInput
          label="Current Medications"
          value={formData.medications}
          onChangeText={(text) => setFormData({ ...formData, medications: text })}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Separate multiple medications with commas"
        />
        
        <TextInput
          label="Allergies"
          value={formData.allergies}
          onChangeText={(text) => setFormData({ ...formData, allergies: text })}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={2}
          placeholder="Separate multiple allergies with commas"
        />
        
        <TextInput
          label="RFID MAC Address (Optional)"
          value={formData.rfidMacAddress}
          onChangeText={(text) => setFormData({ ...formData, rfidMacAddress: text })}
          style={styles.input}
          mode="outlined"
          placeholder="e.g., AA:BB:CC:DD:EE:FF"
          left={<TextInput.Icon icon="bluetooth" />}
        />
        <HelperText type="info">
          Used for location tracking via RFID beacons
        </HelperText>
      </Card.Content>
    </Card>
  );

  const renderEmergencyContact = () => (
    <Card style={styles.stepCard}>
      <Card.Content>
        <View style={styles.stepHeader}>
          <Icon source="phone-alert" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.stepTitle}>Emergency Contact</Text>
        </View>
        
        <TextInput
          label="Emergency Contact Name *"
          value={formData.emergencyContactName}
          onChangeText={(text) => setFormData({ ...formData, emergencyContactName: text })}
          style={styles.input}
          mode="outlined"
        />
        
        <TextInput
          label="Emergency Contact Phone *"
          value={formData.emergencyContactPhone}
          onChangeText={(text) => setFormData({ ...formData, emergencyContactPhone: text })}
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
        />
        
        <Divider style={styles.divider} />
        
        <View style={styles.stepHeader}>
          <Icon source="shield-account" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.stepTitle}>Insurance Information</Text>
        </View>
        
        <TextInput
          label="Insurance Provider"
          value={formData.insuranceProvider}
          onChangeText={(text) => setFormData({ ...formData, insuranceProvider: text })}
          style={styles.input}
          mode="outlined"
        />
        
        <TextInput
          label="Insurance Number"
          value={formData.insuranceNumber}
          onChangeText={(text) => setFormData({ ...formData, insuranceNumber: text })}
          style={styles.input}
          mode="outlined"
        />
      </Card.Content>
    </Card>
  );

  const renderAddressInfo = () => (
    <Card style={styles.stepCard}>
      <Card.Content>
        <View style={styles.stepHeader}>
          <Icon source="home" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.stepTitle}>Address Information</Text>
        </View>
        
        <TextInput
          label="Street Address *"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          style={styles.input}
          mode="outlined"
        />
        
        <TextInput
          label="City *"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          style={styles.input}
          mode="outlined"
        />
        
        <View style={styles.rowContainer}>
          <TextInput
            label="State *"
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
          />
          <TextInput
            label="ZIP Code *"
            value={formData.zipCode}
            onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo();
      case 1:
        return renderMedicalInfo();
      case 2:
        return renderEmergencyContact();
      case 3:
        return renderAddressInfo();
      default:
        return renderPersonalInfo();
    }
  };

  const renderNavigation = () => (
    <Surface style={styles.navigationSurface} elevation={4}>
      <View style={styles.navigationContainer}>
        <Button
          mode="outlined"
          onPress={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigation.goBack()}
          style={styles.navButton}
          disabled={loading}
        >
          {currentStep > 0 ? 'Previous' : 'Cancel'}
        </Button>
        
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.navButton}
          loading={loading}
          disabled={!validateStep(currentStep)}
        >
          {currentStep === steps.length - 1 ? 'Add Patient' : 'Next'}
        </Button>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        {renderNavigation()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSurface: {
    borderRadius: 0,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: -1,
  },
  stepCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bloodTypeLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  bloodTypeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 20,
  },
  navigationSurface: {
    borderRadius: 0,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
