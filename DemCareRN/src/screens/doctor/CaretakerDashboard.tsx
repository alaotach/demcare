import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, RefreshControl, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { 
  Card, 
  Text, 
  useTheme, 
  ActivityIndicator,
  Searchbar,
  FAB,
  Chip,
  Badge,
  Surface,
  Divider,
  IconButton,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFallback from '../../components/IconFallback';

import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { Patient, PatientStatus } from '../../types';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface DashboardStats {
  totalPatients: number;
  testsToday: number;
  inRangeCount: number;
  alertsCount: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export default function CaretakerDashboard({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, isLoading, fetchPatients } = usePatientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'normal' | 'offline'>('all');

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      await fetchPatients(user?.id || '');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'critical' && patient.status === PatientStatus.OUT_OF_RANGE) ||
      (selectedFilter === 'normal' && patient.status === PatientStatus.IN_RANGE) ||
      (selectedFilter === 'offline' && patient.status === PatientStatus.OFFLINE);
    
    return matchesSearch && matchesFilter;
  });

  const dashboardStats: DashboardStats = {
    totalPatients: patients.length,
    testsToday: Math.floor(patients.length * 0.4), // Mock data
    inRangeCount: patients.filter(p => p.status === PatientStatus.IN_RANGE).length,
    alertsCount: patients.filter(p => p.status === PatientStatus.OUT_OF_RANGE).length,
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Add Patient (RFID)',
      icon: 'qrcode-scan',
      color: '#4CAF50',
      onPress: () => navigation.navigate('QuickAddPatient'),
    },
    {
      id: '2',
      title: 'Memory Tests',
      icon: 'brain',
      color: '#FF9800',
      onPress: () => {
        if (patients.length > 0) {
          navigation.navigate('PatientSelector', { 
            title: 'Select Patient for Memory Test',
            nextScreen: 'MemoryTest'
          });
        } else {
          Alert.alert('No Patients', 'Please add a patient first before running memory tests.');
        }
      },
    },
    {
      id: '3',
      title: 'Patient Locations',
      icon: 'map-marker-multiple',
      color: '#2196F3',
      onPress: () => navigation.navigate('Locations'),
    },
    {
      id: '4',
      title: 'Daily Reports',
      icon: 'file-document',
      color: '#9C27B0',
      onPress: () => {}, // TODO: Implement daily reports
    },
  ];

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.IN_RANGE:
        return '#4CAF50';
      case PatientStatus.OUT_OF_RANGE:
        return '#F44336';
      case PatientStatus.OFFLINE:
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.IN_RANGE:
        return 'In Range';
      case PatientStatus.OUT_OF_RANGE:
        return 'Alert';
      case PatientStatus.OFFLINE:
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface}>
      <LinearGradient
        colors={['#6200ee', '#3700b3']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Welcome back, {user?.fullName?.split(' ')[0]}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtext}>
              Caretaker Dashboard • {new Date().toLocaleDateString()}
            </Text>
          </View>
          <MaterialCommunityIcons name="account-heart" size={40} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Card style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#4CAF50' }]}>
              {dashboardStats.totalPatients}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Patients</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#FF9800' }]}>
              {dashboardStats.testsToday}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Tests Today</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#2196F3' }]}>
              {dashboardStats.inRangeCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>In Range</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#F44336' }]}>
              {dashboardStats.alertsCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Alerts</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Quick Actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionCard, { backgroundColor: action.color + '15' }]}
            onPress={action.onPress}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <MaterialCommunityIcons name={action.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text variant="bodyMedium" style={styles.quickActionText}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPatientCard = ({ item: patient }: { item: Patient }) => (
    <Card 
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientProfile', { patient })}
    >
      <Card.Content>
        <View style={styles.patientCardHeader}>
          <View style={styles.patientInfo}>
            <View style={styles.patientNameRow}>
              <Text variant="titleMedium" style={styles.patientName}>
                {patient.fullName}
              </Text>
              <Badge
                style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) }]}
                size={8}
              />
            </View>
            <Text variant="bodySmall" style={styles.patientDetails}>
              Age: {patient.age} • RFID: {patient.rfidMacAddress}
            </Text>
          </View>
          <View style={styles.patientActions}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(patient.status) + '20' }]}
              textStyle={{ color: getStatusColor(patient.status), fontSize: 12 }}
            >
              {getStatusText(patient.status)}
            </Chip>
          </View>
        </View>
        
        {/* Management Actions for Caretakers */}
        <View style={styles.managementActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MemoryTest', {
              patientId: patient.id,
              patientName: patient.fullName,
            })}
          >
            <IconFallback name="brain" size={16} color="#FF9800" />
            <Text variant="bodySmall" style={[styles.actionText, { color: '#FF9800' }]}>
              Memory Test
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddSleepData', { patient })}
          >
            <IconFallback name="sleep" size={16} color="#2196F3" />
            <Text variant="bodySmall" style={[styles.actionText, { color: '#2196F3' }]}>
              Sleep Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddMoodEntry', { patient })}
          >
            <IconFallback name="emoticon-happy" size={16} color="#4CAF50" />
            <Text variant="bodySmall" style={[styles.actionText, { color: '#4CAF50' }]}>
              Mood Entry
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MedicationManagement', {
              patientId: patient.id,
              patientName: patient.fullName,
            })}
          >
            <IconFallback name="pill" size={16} color="#FF5722" />
            <Text variant="bodySmall" style={[styles.actionText, { color: '#FF5722' }]}>
              Medications
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderStats()}
        {renderQuickActions()}
        
        <View style={styles.patientsSection}>
          <View style={styles.patientsSectionHeader}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              My Patients ({filteredPatients.length})
            </Text>
          </View>
          
          <Searchbar
            placeholder="Search patients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 16 }}
          />
          
          {filteredPatients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-heart-outline" size={64} color={theme.colors.outline} />
              <Text variant="titleMedium" style={styles.emptyText}>
                {searchQuery ? 'No patients found' : 'No patients assigned yet'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Patients will appear here once a doctor assigns them to you'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPatients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        onPress={() => navigation.navigate('QuickAddPatient')}
        label="Quick Add"
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
  headerSurface: {
    elevation: 4,
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
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    paddingVertical: 20,
  },
  statCard: {
    marginLeft: 20,
    marginRight: 8,
    minWidth: 120,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsScroll: {
    paddingTop: 16,
  },
  quickActionCard: {
    alignItems: 'center',
    padding: 16,
    marginRight: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  patientsSection: {
    paddingHorizontal: 20,
  },
  patientsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  patientCard: {
    marginBottom: 16,
    elevation: 2,
  },
  patientCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 4,
  },
  patientDetails: {
    opacity: 0.7,
    marginBottom: 4,
  },
  patientActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginLeft: 16,
  },
  memoryTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  memoryTestText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  managementActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    minWidth: 70,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  bottomPadding: {
    height: 100,
  },
});
