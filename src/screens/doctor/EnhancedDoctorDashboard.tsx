import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, RefreshControl, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  useTheme, 
  ActivityIndicator,
  Searchbar,
  FAB,
  Chip,
  IconButton,
  Surface,
  ProgressBar,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { Patient, PatientStatus } from '../../types';

interface Props {
  navigation: any;
}

export default function DoctorDashboard({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, isLoading, fetchPatients } = usePatientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'all'>('all');

  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user?.id]);

  const loadPatients = async () => {
    if (user?.id) {
      try {
        await fetchPatients(user.id);
      } catch (error) {
        Alert.alert('Error', 'Failed to load patients');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.IN_RANGE:
        return '#4CAF50';
      case PatientStatus.OUT_OF_RANGE:
        return '#FF9800';
      case PatientStatus.OFFLINE:
        return '#9E9E9E';
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.IN_RANGE:
        return 'Normal';
      case PatientStatus.OUT_OF_RANGE:
        return 'Alert';
      case PatientStatus.OFFLINE:
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.IN_RANGE:
        return 'check-circle';
      case PatientStatus.OUT_OF_RANGE:
        return 'alert-circle';
      case PatientStatus.OFFLINE:
        return 'circle-outline';
      default:
        return 'help-circle';
    }
  };

  const getDashboardStats = () => {
    const total = patients.length;
    const inRange = patients.filter(p => p.status === PatientStatus.IN_RANGE).length;
    const outOfRange = patients.filter(p => p.status === PatientStatus.OUT_OF_RANGE).length;
    const offline = patients.filter(p => p.status === PatientStatus.OFFLINE).length;
    
    return { total, inRange, outOfRange, offline };
  };

  const stats = getDashboardStats();

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Card style={[styles.statsCard, { backgroundColor: '#E8F5E8' }]}>
        <Card.Content style={styles.statsContent}>
          <MaterialCommunityIcons name="account-group" size={24} color="#2E7D32" />
          <Text variant="bodySmall" style={styles.statsLabel}>Total Patients</Text>
          <Text variant="titleLarge" style={[styles.statsValue, { color: '#2E7D32' }]}>
            {stats.total}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statsCard, { backgroundColor: '#E8F5E8' }]}>
        <Card.Content style={styles.statsContent}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
          <Text variant="bodySmall" style={styles.statsLabel}>Normal</Text>
          <Text variant="titleLarge" style={[styles.statsValue, { color: '#4CAF50' }]}>
            {stats.inRange}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statsCard, { backgroundColor: '#FFF3E0' }]}>
        <Card.Content style={styles.statsContent}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#FF9800" />
          <Text variant="bodySmall" style={styles.statsLabel}>Alerts</Text>
          <Text variant="titleLarge" style={[styles.statsValue, { color: '#FF9800' }]}>
            {stats.outOfRange}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statsCard, { backgroundColor: '#F5F5F5' }]}>
        <Card.Content style={styles.statsContent}>
          <MaterialCommunityIcons name="circle-outline" size={24} color="#9E9E9E" />
          <Text variant="bodySmall" style={styles.statsLabel}>Offline</Text>
          <Text variant="titleLarge" style={[styles.statsValue, { color: '#9E9E9E' }]}>
            {stats.offline}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      <Chip
        selected={filterStatus === 'all'}
        onPress={() => setFilterStatus('all')}
        style={[styles.filterChip, filterStatus === 'all' && styles.activeFilterChip]}
        textStyle={filterStatus === 'all' && styles.activeFilterText}
      >
        All ({patients.length})
      </Chip>
      <Chip
        selected={filterStatus === PatientStatus.IN_RANGE}
        onPress={() => setFilterStatus(PatientStatus.IN_RANGE)}
        style={[styles.filterChip, filterStatus === PatientStatus.IN_RANGE && styles.activeFilterChip]}
        textStyle={filterStatus === PatientStatus.IN_RANGE && styles.activeFilterText}
        icon="check-circle"
      >
        Normal ({stats.inRange})
      </Chip>
      <Chip
        selected={filterStatus === PatientStatus.OUT_OF_RANGE}
        onPress={() => setFilterStatus(PatientStatus.OUT_OF_RANGE)}
        style={[styles.filterChip, filterStatus === PatientStatus.OUT_OF_RANGE && styles.activeFilterChip]}
        textStyle={filterStatus === PatientStatus.OUT_OF_RANGE && styles.activeFilterText}
        icon="alert-circle"
      >
        Alerts ({stats.outOfRange})
      </Chip>
      <Chip
        selected={filterStatus === PatientStatus.OFFLINE}
        onPress={() => setFilterStatus(PatientStatus.OFFLINE)}
        style={[styles.filterChip, filterStatus === PatientStatus.OFFLINE && styles.activeFilterChip]}
        textStyle={filterStatus === PatientStatus.OFFLINE && styles.activeFilterText}
        icon="circle-outline"
      >
        Offline ({stats.offline})
      </Chip>
    </ScrollView>
  );

  const renderPatientCard = (patient: Patient) => (
    <Card 
      key={patient.id} 
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientOverview', { patient })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <View style={styles.patientNameRow}>
              <Text variant="titleMedium" style={styles.patientName}>
                {patient.fullName}
              </Text>
              <Chip 
                icon={getStatusIcon(patient.status)}
                style={[styles.statusChip, { backgroundColor: getStatusColor(patient.status) + '20' }]}
                textStyle={{ color: getStatusColor(patient.status), fontSize: 12, fontWeight: 'bold' }}
              >
                {getStatusText(patient.status)}
              </Chip>
            </View>
            <Text variant="bodySmall" style={styles.patientDetails}>
              Age {patient.age} • Height: {patient.height}cm • Weight: {patient.weight}kg
            </Text>
          </View>
        </View>

        {patient.vitals && (
          <View style={styles.vitalsContainer}>
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="heart" size={16} color="#E91E63" />
                <Text variant="bodySmall" style={styles.vitalLabel}>Heart Rate</Text>
                <Text variant="bodyMedium" style={[styles.vitalValue, { color: '#E91E63' }]}>
                  {patient.vitals.heartRate} BPM
                </Text>
              </View>

              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="water" size={16} color="#2196F3" />
                <Text variant="bodySmall" style={styles.vitalLabel}>SpO₂</Text>
                <Text variant="bodyMedium" style={[styles.vitalValue, { color: '#2196F3' }]}>
                  {patient.vitals.oxygenSaturation}%
                </Text>
              </View>

              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="lungs" size={16} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.vitalLabel}>Resp. Rate</Text>
                <Text variant="bodyMedium" style={[styles.vitalValue, { color: '#4CAF50' }]}>
                  {patient.vitals.respiratoryRate}/min
                </Text>
              </View>

              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="walk" size={16} color="#FF9800" />
                <Text variant="bodySmall" style={styles.vitalLabel}>Steps</Text>
                <Text variant="bodyMedium" style={[styles.vitalValue, { color: '#FF9800' }]}>
                  {patient.vitals.stepCount}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <IconButton
            icon="chart-line"
            size={20}
            onPress={() => navigation.navigate('PatientOverview', { patient })}
          />
          <IconButton
            icon="camera"
            size={20}
            onPress={() => navigation.navigate('Camera')}
          />
          <IconButton
            icon="medication"
            size={20}
            onPress={() => navigation.navigate('AddMoodEntry', { patient })}
          />
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => navigation.navigate('PatientProfile', { patient })}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading && patients.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading patients...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.welcomeText}>
          Welcome back, Dr. {user?.fullName?.split(' ')[0] || 'Doctor'}! 👨‍⚕️
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtext}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Search */}
      <Searchbar
        placeholder="Search patients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        icon="account-search"
      />

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Patients List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.patientsContainer}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map(renderPatientCard)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="account-plus" 
                size={64} 
                color={theme.colors.outline} 
              />
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'No patients match your search criteria' 
                  : 'No patients yet. Add your first patient to get started!'
                }
              </Text>
              {!searchQuery && filterStatus === 'all' && (
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('AddPatient')}
                  style={styles.addFirstPatientButton}
                  icon="plus"
                >
                  Add First Patient
                </Button>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddPatient')}
        label="Add Patient"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontWeight: 'bold',
  },
  headerSubtext: {
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statsLabel: {
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  statsValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  searchbar: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    maxHeight: 40,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  activeFilterChip: {
    backgroundColor: '#6200ee',
  },
  activeFilterText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  patientsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  patientCard: {
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontWeight: 'bold',
    flex: 1,
  },
  patientDetails: {
    opacity: 0.7,
  },
  statusChip: {
    marginLeft: 12,
  },
  vitalsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitalLabel: {
    opacity: 0.7,
    marginTop: 2,
    textAlign: 'center',
    fontSize: 10,
  },
  vitalValue: {
    fontWeight: 'bold',
    marginTop: 2,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
    marginTop: 16,
  },
  addFirstPatientButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
