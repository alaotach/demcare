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
  IconButton,
  Surface,
  ProgressBar,
  Button,
  Avatar,
  Badge,
  Divider,
  Icon
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
  activePatients: number;
  alertsCount: number;
  todayVisits: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export default function DoctorDashboard({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, isLoading, fetchPatients } = usePatientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'normal' | 'offline'>('all');

  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user?.id]);

  const loadPatients = async () => {
    if (user?.id) {
      await fetchPatients(user.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
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
    activePatients: patients.filter(p => p.status !== PatientStatus.OFFLINE).length,
    alertsCount: patients.filter(p => p.status === PatientStatus.OUT_OF_RANGE).length,
    todayVisits: Math.floor(patients.length * 0.3), // Mock data
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Add Patient',
      icon: 'account-plus',
      color: '#4CAF50',
      onPress: () => navigation.navigate('AddPatient'),
    },
    {
      id: '2',
      title: 'View Reports',
      icon: 'chart-line',
      color: '#2196F3',
      onPress: () => {}, // TODO: Implement reports
    },
    {
      id: '3',
      title: 'Alerts',
      icon: 'bell-alert',
      color: '#FF5722',
      onPress: () => {}, // TODO: Implement alerts
    },
    {
      id: '4',
      title: 'Schedule',
      icon: 'calendar-clock',
      color: '#9C27B0',
      onPress: () => {}, // TODO: Implement schedule
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
        return 'Normal';
      case PatientStatus.OUT_OF_RANGE:
        return 'Alert';
      case PatientStatus.OFFLINE:
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Welcome back, Dr. {user?.fullName?.split(' ')[0]}
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
          <Avatar.Image
            size={50}
            source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' }}
            style={styles.avatar}
          />
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Today's Overview
      </Text>
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="account-group" size={24} color="#1976D2" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#1976D2' }]}>
              {dashboardStats.totalPatients}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total Patients</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="heart-pulse" size={24} color="#388E3C" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#388E3C' }]}>
              {dashboardStats.activePatients}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Active</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="alert-circle" size={24} color="#D32F2F" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#D32F2F' }]}>
              {dashboardStats.alertsCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Alerts</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="calendar-check" size={24} color="#7B1FA2" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#7B1FA2' }]}>
              {dashboardStats.todayVisits}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Visits</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Quick Actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        {quickActions.map((action) => (
          <TouchableOpacity key={action.id} onPress={action.onPress}>
            <Card style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.quickActionContent}>
                <Surface style={[styles.quickActionIcon, { backgroundColor: action.color }]} elevation={2}>
                  <IconFallback name={action.icon} size={24} color="#FFFFFF" />
                </Surface>
                <Text variant="bodyMedium" style={styles.quickActionText}>
                  {action.title}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All Patients', count: patients.length },
          { key: 'critical', label: 'Critical', count: dashboardStats.alertsCount },
          { key: 'normal', label: 'Normal', count: patients.filter(p => p.status === PatientStatus.IN_RANGE).length },
          { key: 'offline', label: 'Offline', count: patients.filter(p => p.status === PatientStatus.OFFLINE).length },
        ].map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && { backgroundColor: theme.colors.primary }
            ]}
            textStyle={[
              selectedFilter === filter.key && { color: '#FFFFFF' }
            ]}
          >
            {filter.label} ({filter.count})
          </Chip>
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
              Age: {patient.age} • Weight: {patient.weight}kg • Height: {patient.height}cm
            </Text>
            <Text variant="bodySmall" style={styles.caregiverContact}>
              Emergency: {patient.caregiverContactNumber}
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
        
        {patient.vitals && (
          <View style={styles.vitalsPreview}>
            <Divider style={styles.divider} />
            <View style={styles.vitalsRow}>
              <View style={styles.vitalItem}>
                <IconFallback name="heart" size={16} color="#E91E63" />
                <Text variant="bodySmall" style={styles.vitalText}>
                  {patient.vitals.heartRate} BPM
                </Text>
              </View>
              <View style={styles.vitalItem}>
                <IconFallback name="water-percent" size={16} color="#2196F3" />
                <Text variant="bodySmall" style={styles.vitalText}>
                  {patient.vitals.oxygenSaturation}% SpO₂
                </Text>
              </View>
              <View style={styles.vitalItem}>
                <IconFallback name="walk" size={16} color="#4CAF50" />
                <Text variant="bodySmall" style={styles.vitalText}>
                  {patient.vitals.stepCount} steps
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading && patients.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <IconFallback name="loading" size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text variant="titleMedium" style={styles.loadingText}>
            Loading patients...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStats()}
        {renderQuickActions()}
        
        <View style={styles.patientsSection}>
          <View style={styles.patientsSectionHeader}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Patient List ({filteredPatients.length})
            </Text>
            <IconButton
              icon="filter-variant"
              size={20}
              onPress={() => {}} // TODO: Implement advanced filters
            />
          </View>
          
          <Searchbar
            placeholder="Search patients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 16 }}
          />
          
          {renderFilters()}
          
          {filteredPatients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconFallback name="account-search" size={64} color={theme.colors.outline} style={{ marginBottom: 16 }} />
              <Text variant="titleMedium" style={styles.emptyText}>
                {searchQuery ? 'No patients match your search' : 'No patients added yet'}
              </Text>
              {!searchQuery && (
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('AddPatient')}
                  style={styles.addFirstPatientButton}
                >
                  Add Your First Patient
                </Button>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredPatients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.patientsList}
            />
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
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
  headerSurface: {
    borderRadius: 0,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    marginVertical: 8,
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
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  quickActionCard: {
    marginRight: 12,
    minWidth: 100,
    elevation: 2,
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
    fontSize: 12,
  },
  patientsSection: {
    paddingHorizontal: 20,
  },
  patientsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 16,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  patientsList: {
    paddingBottom: 20,
  },
  patientCard: {
    marginBottom: 12,
    elevation: 3,
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
    marginLeft: 4,
  },
  patientDetails: {
    opacity: 0.7,
    marginBottom: 2,
  },
  caregiverContact: {
    opacity: 0.7,
    fontSize: 12,
  },
  patientActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginLeft: 16,
  },
  vitalsPreview: {
    marginTop: 12,
  },
  divider: {
    marginBottom: 12,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalText: {
    marginLeft: 4,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  addFirstPatientButton: {
    marginTop: 16,
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    opacity: 0.7,
  },
});
