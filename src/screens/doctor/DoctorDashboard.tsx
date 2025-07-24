import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated, Dimensions, Platform } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  FAB, 
  Chip, 
  useTheme,
  Searchbar,
  ActivityIndicator,
  IconButton,
  Surface,
  Avatar,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { Patient, PatientStatus } from '../../types';

const { width } = Dimensions.get('window');

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
  const [scrollY] = useState(new Animated.Value(0));

  // Animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const statsScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

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
        console.error('Failed to load patients:', error);
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
        return theme.colors.primary;
      case PatientStatus.OUT_OF_RANGE:
        return theme.colors.error;
      case PatientStatus.OFFLINE:
        return theme.colors.outline;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.IN_RANGE:
        return 'In Range';
      case PatientStatus.OUT_OF_RANGE:
        return 'Out of Range';
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
        return 'wifi-off';
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
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <Text style={styles.statsLabel}>Total</Text>
          <Text variant="headlineSmall" style={styles.statsValue}>{stats.total}</Text>
        </Card.Content>
      </Card>
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <Text style={styles.statsLabel}>Normal</Text>
          <Text variant="headlineSmall" style={styles.statsValue}>{stats.inRange}</Text>
        </Card.Content>
      </Card>
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <Text style={styles.statsLabel}>Alerts</Text>
          <Text variant="headlineSmall" style={styles.statsValue}>{stats.outOfRange}</Text>
        </Card.Content>
      </Card>
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <Text style={styles.statsLabel}>Offline</Text>
          <Text variant="headlineSmall" style={styles.statsValue}>{stats.offline}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
    >
      <Chip 
        selected={filterStatus === 'all'}
        onPress={() => setFilterStatus('all')}
        style={[styles.filterChip, filterStatus === 'all' && styles.activeFilterChip]}
        textStyle={filterStatus === 'all' ? styles.activeFilterText : {}}
      >
        All
      </Chip>
      <Chip 
        selected={filterStatus === PatientStatus.IN_RANGE}
        onPress={() => setFilterStatus(PatientStatus.IN_RANGE)}
        style={[styles.filterChip, filterStatus === PatientStatus.IN_RANGE && styles.activeFilterChip]}
        textStyle={filterStatus === PatientStatus.IN_RANGE ? styles.activeFilterText : {}}
      >
        Normal
      </Chip>
      <Chip 
        selected={filterStatus === PatientStatus.OUT_OF_RANGE}
        onPress={() => setFilterStatus(PatientStatus.OUT_OF_RANGE)}
        style={[styles.filterChip, filterStatus === PatientStatus.OUT_OF_RANGE && styles.activeFilterChip]}
        textStyle={filterStatus === PatientStatus.OUT_OF_RANGE ? styles.activeFilterText : {}}
      >
        Alerts
      </Chip>
      <Chip 
        selected={filterStatus === PatientStatus.OFFLINE}
        onPress={() => setFilterStatus(PatientStatus.OFFLINE)}
        style={[styles.filterChip, filterStatus === PatientStatus.OFFLINE && styles.activeFilterChip]}
        textStyle={filterStatus === PatientStatus.OFFLINE ? styles.activeFilterText : {}}
      >
        Offline
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
                icon={() => <MaterialCommunityIcons name={getStatusIcon(patient.status)} size={16} color="white" />}
                style={[styles.statusChip, { backgroundColor: getStatusColor(patient.status) }]}
                textStyle={{ color: 'white' }}
              >
                {getStatusText(patient.status)}
              </Chip>
            </View>
            <Text style={styles.patientDetails}>
              Age: {patient.age} • Height: {patient.height}cm • Weight: {patient.weight}kg
            </Text>
          </View>
        </View>
        
        {patient.vitals && (
          <View style={styles.vitalsContainer}>
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#e74c3c" />
                <Text style={styles.vitalLabel}>Heart Rate</Text>
                <Text style={styles.vitalValue}>{patient.vitals.heartRate}</Text>
              </View>
              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="water-percent" size={20} color="#3498db" />
                <Text style={styles.vitalLabel}>SpO₂</Text>
                <Text style={styles.vitalValue}>{patient.vitals.oxygenSaturation}%</Text>
              </View>
              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="lungs" size={20} color="#2ecc71" />
                <Text style={styles.vitalLabel}>Resp. Rate</Text>
                <Text style={styles.vitalValue}>{patient.vitals.respiratoryRate}</Text>
              </View>
              <View style={styles.vitalItem}>
                <MaterialCommunityIcons name="walk" size={20} color="#f39c12" />
                <Text style={styles.vitalLabel}>Steps</Text>
                <Text style={styles.vitalValue}>{patient.vitals.stepCount || 0}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <IconButton 
            icon="chart-line" 
            size={20} 
            onPress={() => navigation.navigate('PatientProfile', { patient })}
          />
          <IconButton 
            icon="sleep" 
            size={20} 
            onPress={() => navigation.navigate('AddSleepData', { patient })}
          />
          <IconButton 
            icon="emoticon-happy" 
            size={20} 
            onPress={() => navigation.navigate('AddMoodEntry', { patient })}
          />
          <IconButton 
            icon="phone" 
            size={20} 
            onPress={() => {/* TODO: Call caregiver */}}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading && patients.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText} variant="bodyLarge">Loading patients...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Gradient Header */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Avatar.Text 
                size={50} 
                label={user?.fullName?.split(' ').map(name => name[0]).join('').toUpperCase() || 'DR'}
                style={styles.doctorAvatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.welcomeTextContainer}>
                <Text variant="headlineSmall" style={styles.welcomeText}>
                  Welcome back!
                </Text>
                <Text variant="titleMedium" style={styles.doctorName}>
                  Dr. {user?.fullName?.split(' ')[0]}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSubtext}>
              {patients.length} patient{patients.length !== 1 ? 's' : ''} under your care
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            progressViewOffset={Platform.OS === 'ios' ? 180 : 120}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Stats Cards */}
        <Animated.View style={[styles.statsSection, { transform: [{ scale: statsScale }] }]}>
          {renderStatsCards()}
        </Animated.View>

        {/* Enhanced Search */}
        <Surface style={styles.searchSection} elevation={2}>
          <Searchbar
            placeholder="Search patients by name..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={theme.colors.primary}
            inputStyle={styles.searchInput}
          />
        </Surface>

        {/* Enhanced Filter Chips */}
        <View style={styles.filterSection}>
          {renderFilterChips()}
        </View>

        {/* Enhanced Patients List */}
        <View style={styles.patientsContainer}>
          {filteredPatients.length === 0 ? (
            <Surface style={styles.emptyContainer} elevation={1}>
              <MaterialCommunityIcons 
                name="account-search" 
                size={64} 
                color={theme.colors.outline} 
              />
              <Text style={styles.emptyText} variant="bodyLarge">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No patients match your search criteria' 
                  : 'No patients added yet'
                }
              </Text>
              <Text style={styles.emptySubtext} variant="bodyMedium">
                {patients.length === 0 
                  ? 'Start by adding your first patient to begin monitoring their health.'
                  : 'Try adjusting your search or filter settings.'
                }
              </Text>
              {patients.length === 0 && (
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('AddPatient')}
                  style={styles.addFirstPatientButton}
                  icon="plus"
                >
                  Add Your First Patient
                </Button>
              )}
            </Surface>
          ) : (
            filteredPatients.map(renderPatientCard)
          )}
        </View>
      </Animated.ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddPatient')}
        label={patients.length === 0 ? "Add Patient" : undefined}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  // Enhanced Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  doctorAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 16,
  },
  avatarLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  doctorName: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  // Enhanced Scroll Styles
  scrollView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 160 : 140,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Enhanced Stats Styles
  statsSection: {
    margin: 20,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statsLabel: {
    marginTop: 6,
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 12,
  },
  statsValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  // Enhanced Search Styles
  searchSection: {
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  // Enhanced Filter Styles
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    paddingVertical: 8,
    maxHeight: 50,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 20,
  },
  activeFilterChip: {
    backgroundColor: '#6200ee',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Enhanced Patient Card Styles
  patientsContainer: {
    paddingHorizontal: 20,
  },
  patientCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
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
    marginBottom: 6,
  },
  patientName: {
    fontWeight: 'bold',
    flex: 1,
    fontSize: 16,
  },
  patientDetails: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 12,
  },
  statusChip: {
    marginLeft: 12,
  },
  vitalsContainer: {
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  // Enhanced Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
  addFirstPatientButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  // Enhanced FAB
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});
