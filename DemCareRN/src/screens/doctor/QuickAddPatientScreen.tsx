import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  ActivityIndicator,
  Surface,
  Chip,
  IconButton,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { usePatientStore } from '../../store/patientStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function QuickAddPatientScreen({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { addPatient } = usePatientStore();
  
  const [rfidMacAddress, setRfidMacAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Central patient database (patients added by doctors)
  const centralPatientDatabase = {
    'AA:BB:CC:DD:EE:01': {
      fullName: 'John Smith',
      age: 78,
      height: 175,
      weight: 72,
      caregiverContactNumber: '+1-555-0123',
      medicalRecordNumber: 'MR001',
      emergencyContact: {
        name: 'Mary Smith',
        phone: '+1-555-0456',
        relationship: 'Daughter'
      },
      allergies: ['Penicillin', 'Nuts'],
      medicalHistory: ['Diabetes Type 2', 'Hypertension'],
      assignedDoctor: 'Dr. Johnson',
      assignedDate: '2024-01-15'
    },
    'AA:BB:CC:DD:EE:02': {
      fullName: 'Emma Johnson',
      age: 82,
      height: 162,
      weight: 65,
      caregiverContactNumber: '+1-555-0789',
      medicalRecordNumber: 'MR002',
      emergencyContact: {
        name: 'Robert Johnson',
        phone: '+1-555-0321',
        relationship: 'Son'
      },
      allergies: ['Latex'],
      medicalHistory: ['Arthritis', 'Heart Disease'],
      assignedDoctor: 'Dr. Smith',
      assignedDate: '2024-01-20'
    },
    'AA:BB:CC:DD:EE:03': {
      fullName: 'William Davis',
      age: 75,
      height: 180,
      weight: 80,
      caregiverContactNumber: '+1-555-0147',
      medicalRecordNumber: 'MR003',
      emergencyContact: {
        name: 'Sarah Davis',
        phone: '+1-555-0258',
        relationship: 'Wife'
      },
      allergies: [],
      medicalHistory: ['Mild Cognitive Impairment'],
      assignedDoctor: 'Dr. Brown',
      assignedDate: '2024-02-01'
    }
  };

  const searchPatient = async () => {
    if (!rfidMacAddress.trim()) {
      Alert.alert('Error', 'Please enter an RFID MAC address');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const foundPatient = centralPatientDatabase[rfidMacAddress.toUpperCase() as keyof typeof centralPatientDatabase];
      
      if (foundPatient) {
        setPatientData(foundPatient);
        setSnackbarMessage('Patient found in system!');
        setSnackbarVisible(true);
      } else {
        setPatientData(null);
        Alert.alert(
          'Patient Not Found',
          'This RFID MAC address is not registered in the system. Please contact the doctor to register this patient first.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search for patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPatientToSystem = async () => {
    if (!patientData || !user?.id) return;

    setLoading(true);
    try {
      const newPatient = {
        ...patientData,
        rfidMacAddress: rfidMacAddress.toUpperCase(),
        doctorId: user.id, // Assign to current caretaker as responsible person
        status: 'OFFLINE' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addPatient(newPatient);
      
      Alert.alert(
        'Success',
        `${patientData.fullName} has been added to your patient list!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setRfidMacAddress('');
    setPatientData(null);
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            onPress={() => navigation.goBack()}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Quick Add Patient
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <Text variant="bodyMedium" style={styles.headerSubtext}>
          Add patients assigned by doctors using RFID MAC address
        </Text>
      </LinearGradient>
    </Surface>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        
        <Card style={styles.searchCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Patient RFID Lookup
            </Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>
              Enter the RFID MAC address of patient assigned by doctor
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="RFID MAC Address"
                value={rfidMacAddress}
                onChangeText={setRfidMacAddress}
                mode="outlined"
                placeholder="AA:BB:CC:DD:EE:FF"
                style={styles.input}
                left={<TextInput.Icon icon="wifi" />}
                right={
                  <TextInput.Icon 
                    icon="qrcode-scan" 
                    onPress={() => {
                      // TODO: Implement QR/Barcode scanner
                      Alert.alert('Scanner', 'QR/Barcode scanner coming soon!');
                    }}
                  />
                }
              />
              
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={searchPatient}
                  loading={loading}
                  disabled={loading || !rfidMacAddress.trim()}
                  style={styles.searchButton}
                  icon="magnify"
                >
                  Search Patient
                </Button>
                <Button
                  mode="outlined"
                  onPress={clearForm}
                  disabled={loading}
                  style={styles.clearButton}
                >
                  Clear
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {loading && (
          <Card style={styles.loadingCard}>
            <Card.Content style={styles.loadingContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Searching patient database...
              </Text>
            </Card.Content>
          </Card>
        )}

        {patientData && (
          <Card style={styles.patientCard}>
            <Card.Content>
              <View style={styles.patientHeader}>
                <MaterialCommunityIcons name="account-check" size={32} color="#4CAF50" />
                <Text variant="titleLarge" style={styles.patientName}>
                  Patient Found!
                </Text>
              </View>
              
              <View style={styles.patientInfo}>
                <Text variant="headlineSmall" style={styles.fullName}>
                  {patientData.fullName}
                </Text>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Age</Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>{patientData.age} years</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Height</Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>{patientData.height} cm</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Weight</Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>{patientData.weight} kg</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Medical Record</Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>{patientData.medicalRecordNumber}</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Emergency Contact</Text>
                  <Text variant="bodyMedium">{patientData.emergencyContact.name}</Text>
                  <Text variant="bodySmall" style={styles.contactDetails}>
                    {patientData.emergencyContact.phone} • {patientData.emergencyContact.relationship}
                  </Text>
                </View>

                {patientData.allergies.length > 0 && (
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Allergies</Text>
                    <View style={styles.chipContainer}>
                      {patientData.allergies.map((allergy: string, index: number) => (
                        <Chip key={index} style={styles.allergyChip} textStyle={{ color: '#D32F2F' }}>
                          {allergy}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Medical History</Text>
                  {patientData.medicalHistory.map((condition: string, index: number) => (
                    <Text key={index} variant="bodyMedium" style={styles.historyItem}>
                      • {condition}
                    </Text>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Assignment Info</Text>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    <Text style={styles.label}>Assigned by: </Text>
                    {patientData.assignedDoctor}
                  </Text>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    <Text style={styles.label}>Assignment Date: </Text>
                    {patientData.assignedDate}
                  </Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={addPatientToSystem}
                loading={loading}
                disabled={loading}
                style={styles.addButton}
                icon="account-plus"
              >
                Add to My Patients
              </Button>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    elevation: 4,
    marginTop: -50,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingTop: 74,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  searchCard: {
    margin: 20,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    opacity: 0.7,
    marginBottom: 20,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    flex: 2,
  },
  clearButton: {
    flex: 1,
  },
  loadingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  patientCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  patientName: {
    marginLeft: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  patientInfo: {
    marginBottom: 24,
  },
  fullName: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactDetails: {
    opacity: 0.7,
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  historyItem: {
    marginBottom: 4,
  },
  addButton: {
    paddingVertical: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
