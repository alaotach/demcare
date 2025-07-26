import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  useTheme,
  Chip,
  IconButton,
  Button,
  FAB,
  Modal,
  Portal,
  TextInput,
  Snackbar,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { usePatientStore } from '../../store/patientStore';
import { BeaconService } from '../../services/beacon';
import { Patient, PatientStatus, RootStackParamList } from '../../types';

type GeneralScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function GeneralScreen() {
  const theme = useTheme();
  const navigation = useNavigation<GeneralScreenNavigationProp>();
  const { patients, deletePatient, updatePatient } = usePatientStore();
  const [patientLocations, setPatientLocations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadPatientData();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      loadPatientData();
    }, 3000);

    return () => clearInterval(interval);
  }, [patients]);

  const loadPatientData = async () => {
    try {
      const locations = await BeaconService.getPatientLocations(patients);
      setPatientLocations(locations);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientData();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return 'check-circle';
      case 'OUT_OF_RANGE':
        return 'alert-circle';
      case 'OFFLINE':
      case 'UNKNOWN':
        return 'wifi-off';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return theme.colors.primary;
      case 'OUT_OF_RANGE':
        return theme.colors.error;
      case 'OFFLINE':
      case 'UNKNOWN':
        return theme.colors.outline;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return 'In Range';
      case 'OUT_OF_RANGE':
        return 'Out of Range';
      case 'OFFLINE':
        return 'Offline';
      case 'UNKNOWN':
        return 'Unknown';
      default:
        return 'Unknown';
    }
  };

  const handlePatientPress = (patient: Patient) => {
    navigation.navigate('PatientProfile', { patient });
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId);
      setSnackbarMessage('Patient deleted successfully');
      setSnackbarVisible(true);
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setSnackbarMessage('Failed to delete patient');
      setSnackbarVisible(true);
    }
  };

  const showDeleteConfirmation = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalVisible(true);
  };

  const addNewPatient = () => {
    navigation.navigate('AddPatient');
  };

  const getPatientStatus = (patientId: string): string => {
    const location = patientLocations.find(loc => loc.id === patientId);
    return location?.status || 'UNKNOWN';
  };

  const getPatientStats = () => {
    const totalPatients = patients.length;
    const inRange = patientLocations.filter(loc => loc.status === 'IN_RANGE').length;
    const outOfRange = patientLocations.filter(loc => loc.status === 'OUT_OF_RANGE').length;
    const unknown = totalPatients - inRange - outOfRange;

    return { totalPatients, inRange, outOfRange, unknown };
  };

  const stats = getPatientStats();

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="view-dashboard" size={32} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              General Overview
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Patient management dashboard
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              iconColor="#FFFFFF"
              size={24}
              onPress={loadPatientData}
            />
            <IconButton
              icon="plus"
              iconColor="#FFFFFF"
              size={24}
              onPress={addNewPatient}
            />
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Overview */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statsTitle}>
              Patient Statistics
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {stats.totalPatients}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Patients
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text 
                  variant="headlineSmall" 
                  style={[styles.statNumber, { color: theme.colors.primary }]}
                >
                  {stats.inRange}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  In Range
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text 
                  variant="headlineSmall" 
                  style={[styles.statNumber, { color: theme.colors.error }]}
                >
                  {stats.outOfRange}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Out of Range
                </Text>
              </View>
            </View>
            
            <View style={styles.statusChips}>
              <Chip 
                icon="check-circle"
                textStyle={{ color: theme.colors.primary }}
                style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
              >
                Active: {stats.inRange}
              </Chip>
              <Chip 
                icon="alert-circle"
                textStyle={{ color: theme.colors.error }}
                style={[styles.chip, { backgroundColor: theme.colors.errorContainer }]}
              >
                Alert: {stats.outOfRange}
              </Chip>
              <Chip 
                icon="wifi-off"
                textStyle={{ color: theme.colors.outline }}
                style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                Unknown: {stats.unknown}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Patient List */}
        <Card style={styles.patientsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.patientsTitle}>
              Patients ({patients.length})
            </Text>
            
            {patients.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No patients added yet
                </Text>
                <Text variant="bodySmall" style={styles.emptySubtext}>
                  Tap the + button to add your first patient
                </Text>
                <Button 
                  mode="contained" 
                  onPress={addNewPatient}
                  style={styles.addButton}
                >
                  Add Patient
                </Button>
              </View>
            ) : (
              patients.map((patient, index) => {
                const status = getPatientStatus(patient.id);
                return (
                  <List.Item
                    key={patient.id}
                    title={patient.fullName}
                    description={`Age: ${patient.age} | Status: ${getStatusLabel(status)}`}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={getStatusIcon(status)}
                        color={getStatusColor(status)}
                      />
                    )}
                    right={(props) => (
                      <View style={styles.actionButtons}>
                        <IconButton
                          icon="eye"
                          size={20}
                          onPress={() => handlePatientPress(patient)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          iconColor={theme.colors.error}
                          onPress={() => showDeleteConfirmation(patient)}
                        />
                      </View>
                    )}
                    onPress={() => handlePatientPress(patient)}
                    style={styles.patientItem}
                  />
                );
              })
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.actionsTitle}>
              Quick Actions
            </Text>
            
            <View style={styles.actionGrid}>
              <Button 
                mode="contained-tonal" 
                onPress={() => navigation.navigate('Locations')}
                style={styles.actionButton}
                icon="map-marker"
              >
                View Locations
              </Button>
              <Button 
                mode="contained-tonal" 
                onPress={addNewPatient}
                style={styles.actionButton}
                icon="account-plus"
              >
                Add Patient
              </Button>
              <Button 
                mode="contained-tonal" 
                onPress={() => navigation.navigate('DoctorTabs')}
                style={styles.actionButton}
                icon="cog"
              >
                Settings
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Delete Patient
          </Text>
          <Text variant="bodyMedium" style={styles.modalText}>
            Are you sure you want to delete {selectedPatient?.fullName}? This action cannot be undone.
          </Text>
          <View style={styles.modalActions}>
            <Button onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={() => selectedPatient && handleDeletePatient(selectedPatient.id)}
              buttonColor={theme.colors.error}
            >
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>

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
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  patientsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  patientsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patientItem: {
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  actionsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    marginBottom: 8,
    minWidth: 100,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
