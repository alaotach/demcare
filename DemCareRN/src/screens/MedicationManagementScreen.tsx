import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  Surface,
  IconButton,
  Chip,
  Divider,
  Menu,
  RadioButton,
  Switch,
  Badge,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcon from '../components/MaterialIcon';

const { width } = Dimensions.get('window');

interface MedicationManagementProps {
  navigation: any;
  route: {
    params: {
      patientId: string;
      patientName: string;
    };
  };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  isActive: boolean;
  reminders: MedicationReminder[];
  sideEffects?: string[];
  notes?: string;
}

interface MedicationReminder {
  id: string;
  time: Date;
  taken: boolean;
  skipped: boolean;
  notes?: string;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  takenAt: Date;
  dosageTaken: string;
  takenBy: string; // Patient, Nurse, etc.
  notes?: string;
  sideEffectsReported?: string[];
}

export default function MedicationManagementScreen({ navigation, route }: MedicationManagementProps) {
  const theme = useTheme();
  const { patientId, patientName } = route.params;
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history' | 'schedule'>('active');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    prescribedBy: '',
    startDate: new Date(),
    endDate: null as Date | null,
    notes: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

  useEffect(() => {
    loadMedications();
    loadMedicationLogs();
  }, []);

  const loadMedications = () => {
    // In a real app, this would fetch from Firebase
    const sampleMedications: Medication[] = [
      {
        id: '1',
        name: 'Aricept (Donepezil)',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take with food in the evening',
        startDate: new Date('2024-01-01'),
        prescribedBy: 'Dr. Smith',
        isActive: true,
        reminders: [
          {
            id: 'r1',
            time: new Date('2024-01-15T20:00:00'),
            taken: true,
            skipped: false,
          },
        ],
        sideEffects: ['Nausea', 'Diarrhea'],
        notes: 'Monitor for gastrointestinal side effects',
      },
      {
        id: '2',
        name: 'Memantine',
        dosage: '20mg',
        frequency: 'Twice daily',
        instructions: 'Take with or without food',
        startDate: new Date('2024-01-05'),
        prescribedBy: 'Dr. Johnson',
        isActive: true,
        reminders: [],
        notes: 'Start with 5mg and increase gradually',
      },
    ];
    setMedications(sampleMedications);
  };

  const loadMedicationLogs = () => {
    // Sample medication logs
    const sampleLogs: MedicationLog[] = [
      {
        id: 'log1',
        medicationId: '1',
        medicationName: 'Aricept (Donepezil)',
        takenAt: new Date('2024-01-15T20:00:00'),
        dosageTaken: '10mg',
        takenBy: 'Patient',
        notes: 'Taken with dinner',
      },
      {
        id: 'log2',
        medicationId: '2',
        medicationName: 'Memantine',
        takenAt: new Date('2024-01-15T08:00:00'),
        dosageTaken: '10mg',
        takenBy: 'Nurse',
        notes: 'Morning dose administered',
      },
    ];
    setMedicationLogs(sampleLogs);
  };

  const addMedication = () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      instructions: formData.instructions,
      startDate: formData.startDate,
      endDate: formData.endDate,
      prescribedBy: formData.prescribedBy,
      isActive: true,
      reminders: [],
      notes: formData.notes,
    };

    setMedications(prev => [...prev, newMedication]);
    setShowAddForm(false);
    resetForm();
    Alert.alert('Success', 'Medication added successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      prescribedBy: '',
      startDate: new Date(),
      endDate: null,
      notes: '',
    });
  };

  const toggleMedicationStatus = (medicationId: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === medicationId ? { ...med, isActive: !med.isActive } : med
      )
    );
  };

  const logMedicationTaken = (medication: Medication) => {
    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicationId: medication.id,
      medicationName: medication.name,
      takenAt: new Date(),
      dosageTaken: medication.dosage,
      takenBy: 'Caregiver',
      notes: 'Administered as scheduled',
    };

    setMedicationLogs(prev => [newLog, ...prev]);
    Alert.alert('Success', `${medication.name} marked as taken`);
  };

  const renderMedicationCard = (medication: Medication) => (
    <Card key={medication.id} style={styles.medicationCard} mode="outlined">
      <Card.Content>
        <View style={styles.medicationHeader}>
          <View style={styles.medicationInfo}>
            <Text variant="titleMedium" style={styles.medicationName}>
              {medication.name}
            </Text>
            <Text variant="bodyMedium" style={styles.medicationDosage}>
              {medication.dosage} • {medication.frequency}
            </Text>
          </View>
          <View style={styles.medicationActions}>
            <Badge
              style={[
                styles.statusBadge,
                { backgroundColor: medication.isActive ? '#4CAF50' : '#FF9800' }
              ]}
            >
              {medication.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </View>
        </View>

        <Divider style={styles.medicationDivider} />

        <View style={styles.medicationDetails}>
          <View style={styles.detailRow}>
            <MaterialIcon name="doctor" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.detailText}>
              Prescribed by: {medication.prescribedBy}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcon name="calendar" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.detailText}>
              Started: {medication.startDate.toLocaleDateString()}
            </Text>
          </View>

          {medication.instructions && (
            <View style={styles.detailRow}>
              <MaterialIcon name="information" size={16} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.detailText}>
                {medication.instructions}
              </Text>
            </View>
          )}

          {medication.sideEffects && medication.sideEffects.length > 0 && (
            <View style={styles.sideEffectsContainer}>
              <Text variant="bodySmall" style={styles.sideEffectsTitle}>
                Side Effects:
              </Text>
              <View style={styles.sideEffectsChips}>
                {medication.sideEffects.map((effect, index) => (
                  <Chip
                    key={index}
                    style={styles.sideEffectChip}
                    textStyle={styles.sideEffectChipText}
                    icon="alert-circle"
                    mode="outlined"
                  >
                    {effect}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.medicationButtonRow}>
          <Button
            mode="contained"
            onPress={() => logMedicationTaken(medication)}
            style={styles.medicationButton}
            icon="check"
            disabled={!medication.isActive}
          >
            Mark Taken
          </Button>
          <Button
            mode="outlined"
            onPress={() => toggleMedicationStatus(medication.id)}
            style={styles.medicationButton}
            icon={medication.isActive ? 'pause' : 'play'}
          >
            {medication.isActive ? 'Pause' : 'Resume'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMedicationLog = (log: MedicationLog) => (
    <Card key={log.id} style={styles.logCard} mode="outlined">
      <Card.Content>
        <View style={styles.logHeader}>
          <View style={styles.logInfo}>
            <Text variant="titleSmall" style={styles.logMedicationName}>
              {log.medicationName}
            </Text>
            <Text variant="bodySmall" style={styles.logTime}>
              {log.takenAt.toLocaleDateString()} at {log.takenAt.toLocaleTimeString()}
            </Text>
          </View>
          <Chip
            style={styles.logStatusChip}
            textStyle={styles.logStatusText}
            icon="check-circle"
            mode="flat"
          >
            Taken
          </Chip>
        </View>

        <View style={styles.logDetails}>
          <Text variant="bodySmall" style={styles.logDetail}>
            Dosage: {log.dosageTaken}
          </Text>
          <Text variant="bodySmall" style={styles.logDetail}>
            Administered by: {log.takenBy}
          </Text>
          {log.notes && (
            <Text variant="bodySmall" style={styles.logDetail}>
              Notes: {log.notes}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAddMedicationForm = () => (
    <Card style={styles.addForm} mode="outlined">
      <Card.Content>
        <View style={styles.addFormHeader}>
          <Text variant="titleLarge" style={styles.addFormTitle}>
            Add New Medication
          </Text>
          <IconButton
            icon="close"
            onPress={() => setShowAddForm(false)}
          />
        </View>

        <Divider style={styles.addFormDivider} />

        <TextInput
          label="Medication Name *"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          mode="outlined"
          style={styles.formInput}
          placeholder="e.g., Aricept, Memantine"
        />

        <View style={styles.formRow}>
          <TextInput
            label="Dosage *"
            value={formData.dosage}
            onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
            mode="outlined"
            style={[styles.formInput, styles.halfWidth]}
            placeholder="e.g., 10mg"
          />
          <TextInput
            label="Frequency *"
            value={formData.frequency}
            onChangeText={(text) => setFormData(prev => ({ ...prev, frequency: text }))}
            mode="outlined"
            style={[styles.formInput, styles.halfWidth]}
            placeholder="e.g., Once daily"
          />
        </View>

        <TextInput
          label="Instructions"
          value={formData.instructions}
          onChangeText={(text) => setFormData(prev => ({ ...prev, instructions: text }))}
          mode="outlined"
          style={styles.formInput}
          placeholder="e.g., Take with food"
          multiline
          numberOfLines={2}
        />

        <TextInput
          label="Prescribed By"
          value={formData.prescribedBy}
          onChangeText={(text) => setFormData(prev => ({ ...prev, prescribedBy: text }))}
          mode="outlined"
          style={styles.formInput}
          placeholder="e.g., Dr. Smith"
        />

        <TextInput
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
          mode="outlined"
          style={styles.formInput}
          placeholder="Additional notes..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.formButtonRow}>
          <Button
            mode="outlined"
            onPress={() => setShowAddForm(false)}
            style={styles.formButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={addMedication}
            style={styles.formButton}
            icon="plus"
          >
            Add Medication
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const activeMedications = medications.filter(med => med.isActive);
  const inactiveMedications = medications.filter(med => !med.isActive);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
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
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerText}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                Medications
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {patientName}
              </Text>
            </View>
            <IconButton
              icon="plus"
              iconColor="white"
              onPress={() => setShowAddForm(true)}
            />
          </View>
        </LinearGradient>
      </Surface>

      {/* Tab Navigation */}
      <Surface style={styles.tabContainer} elevation={2}>
        <View style={styles.tabRow}>
          {[
            { key: 'active', label: 'Active', icon: 'pill' },
            { key: 'history', label: 'History', icon: 'history' },
            { key: 'schedule', label: 'Schedule', icon: 'clock' },
          ].map((tab) => (
            <Button
              key={tab.key}
              mode={selectedTab === tab.key ? 'contained' : 'outlined'}
              onPress={() => setSelectedTab(tab.key as any)}
              style={styles.tabButton}
              icon={tab.icon}
            >
              {tab.label}
            </Button>
          ))}
        </View>
      </Surface>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {showAddForm && renderAddMedicationForm()}

        {selectedTab === 'active' && (
          <View style={styles.tabContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Active Medications ({activeMedications.length})
            </Text>
            {activeMedications.map(renderMedicationCard)}
            
            {inactiveMedications.length > 0 && (
              <>
                <Text variant="titleMedium" style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
                  Inactive Medications ({inactiveMedications.length})
                </Text>
                {inactiveMedications.map(renderMedicationCard)}
              </>
            )}
          </View>
        )}

        {selectedTab === 'history' && (
          <View style={styles.tabContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Medication History ({medicationLogs.length} entries)
            </Text>
            {medicationLogs.map(renderMedicationLog)}
          </View>
        )}

        {selectedTab === 'schedule' && (
          <View style={styles.tabContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Today's Schedule
            </Text>
            <Card style={styles.scheduleCard} mode="outlined">
              <Card.Content>
                <Text variant="bodyMedium" style={styles.scheduleText}>
                  Schedule feature coming soon...
                </Text>
                <Text variant="bodySmall" style={styles.scheduleSubtext}>
                  This will show today's medication schedule with reminders.
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderRadius: 0,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  tabContainer: {
    padding: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitleSpaced: {
    marginTop: 24,
  },
  medicationCard: {
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationDosage: {
    opacity: 0.7,
  },
  medicationActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
  },
  medicationDivider: {
    marginBottom: 12,
  },
  medicationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    flex: 1,
  },
  sideEffectsContainer: {
    marginTop: 8,
  },
  sideEffectsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  sideEffectsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sideEffectChip: {
    height: 28,
  },
  sideEffectChipText: {
    fontSize: 12,
  },
  medicationButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  medicationButton: {
    flex: 1,
  },
  logCard: {
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logInfo: {
    flex: 1,
  },
  logMedicationName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  logTime: {
    opacity: 0.7,
  },
  logStatusChip: {
    backgroundColor: '#E8F5E8',
  },
  logStatusText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  logDetails: {
    marginTop: 8,
  },
  logDetail: {
    marginBottom: 4,
    opacity: 0.8,
  },
  addForm: {
    marginBottom: 20,
  },
  addFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addFormTitle: {
    fontWeight: '600',
  },
  addFormDivider: {
    marginBottom: 16,
  },
  formInput: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
  },
  scheduleCard: {
    padding: 20,
    alignItems: 'center',
  },
  scheduleText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  scheduleSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
