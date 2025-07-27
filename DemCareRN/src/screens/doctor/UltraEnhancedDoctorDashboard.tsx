import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Animated, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { 
  Surface, 
  Text, 
  useTheme, 
  IconButton, 
  Chip, 
  Card,
  Button,
  FAB,
  Portal,
  Modal,
  ProgressBar,
  Searchbar,
  SegmentedButtons,
  Menu,
  Avatar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PatientStatus } from '../../types';
import MaterialIcon from '../../components/MaterialIcon';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { Patient } from '../../types';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  change?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export default function UltraEnhancedDoctorDashboard({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, fetchPatients, isLoading } = usePatientStore();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [showProfile, setShowProfile] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPatients(user?.id || '');
    initializeAnimations();
  }, []);

  const initializeAnimations = () => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for refresh icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const quickStats: QuickStat[] = [
    { 
      label: 'Total Patients', 
      value: patients.length.toString(), 
      icon: 'account-group', 
      color: '#4CAF50',
      trend: 'up',
      change: '+12%'
    },
    { 
      label: 'Critical Alerts', 
      value: '3', 
      icon: 'alert-circle', 
      color: '#F44336',
      trend: 'down',
      change: '-25%'
    },
    { 
      label: 'Active Monitoring', 
      value: '18', 
      icon: 'monitor-heart', 
      color: '#2196F3',
      trend: 'stable',
      change: '0%'
    },
    { 
      label: 'Appointments', 
      value: '7', 
      icon: 'calendar-check', 
      color: '#FF9800',
      trend: 'up',
      change: '+4'
    },
  ];

  const quickActions: QuickAction[] = [
    { label: 'Add Patient', icon: 'account-plus', color: '#4CAF50', onPress: () => navigation.navigate('AddPatient') },
    { label: 'View Reports', icon: 'chart-line', color: '#2196F3', onPress: () => {} },
    { label: 'Emergency', icon: 'ambulance', color: '#F44336', onPress: () => {} },
    { label: 'Settings', icon: 'cog', color: '#757575', onPress: () => {} },
  ];

  const filteredPatients = patients.filter(patient => {
    // Safe access with fallbacks
    const patientName = patient.fullName || '';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMode === 'all' || 
      (filterMode === 'critical' && patient.status === PatientStatus.CRITICAL) ||
      (filterMode === 'stable' && patient.status === PatientStatus.STABLE) ||
      (filterMode === 'monitoring' && patient.status === PatientStatus.WARNING);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.CRITICAL: return '#F44336';
      case PatientStatus.WARNING: return '#FF9800';
      case PatientStatus.STABLE: return '#4CAF50';
      default: return theme.colors.onSurface;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-neutral';
      default: return 'minus';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      case 'stable': return '#757575';
      default: return '#757575';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Header with Gradient */}
      <Surface style={styles.headerSurface} elevation={4}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <Avatar.Text 
                  size={48} 
                  label={user?.fullName?.charAt(0) || 'D'} 
                  style={styles.avatar}
                />
                <View style={styles.welcomeContainer}>
                  <Text variant="bodySmall" style={styles.welcomeText}>
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                  </Text>
                  <Text variant="headlineSmall" style={styles.doctorName}>
                    Dr. {user?.fullName || 'Doctor'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <Surface style={styles.headerButton} elevation={2}>
                  <IconButton
                    icon="bell"
                    iconColor="white"
                    size={24}
                    onPress={() => {}}
                  />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </Surface>
                
                <Surface style={styles.headerButton} elevation={2}>
                  <IconButton
                    icon="account-circle"
                    iconColor="white"
                    size={24}
                    onPress={() => setShowProfile(true)}
                  />
                </Surface>
              </View>
            </View>
            
            {/* Quick Stats Row */}
            <Animated.View style={[styles.statsContainer, { transform: [{ scale: scaleAnim }] }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
                {quickStats.map((stat, index) => (
                  <Surface key={index} style={styles.statCard} elevation={3}>
                    <View style={styles.statHeader}>
                      <MaterialIcon source={stat.icon} size={20} color={stat.color} />
                      <View style={[styles.trendContainer, { backgroundColor: getTrendColor(stat.trend || 'stable') + '20' }]}>
                        <MaterialIcon source={getTrendIcon(stat.trend || 'stable')} size={12} color={getTrendColor(stat.trend || 'stable')} />
                        <Text style={[styles.trendText, { color: getTrendColor(stat.trend || 'stable') }]}>
                          {stat.change}
                        </Text>
                      </View>
                    </View>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {stat.value}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      {stat.label}
                    </Text>
                  </Surface>
                ))}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </LinearGradient>
      </Surface>

      {/* Enhanced Search and Filters */}
      <Animated.View style={[styles.searchSection, { opacity: fadeAnim }]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search patients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
          />
          
          <Surface style={styles.filterButton} elevation={2}>
            <IconButton
              icon="filter-variant"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => {}}
            />
          </Surface>
        </View>
        
        <SegmentedButtons
          value={filterMode}
          onValueChange={setFilterMode}
          buttons={[
            { value: 'all', label: 'All', icon: 'account-group' },
            { value: 'critical', label: 'Critical', icon: 'alert-circle' },
            { value: 'monitoring', label: 'Monitoring', icon: 'monitor-heart' },
            { value: 'stable', label: 'Stable', icon: 'check-circle' },
          ]}
          style={styles.segmentedButtons}
        />
      </Animated.View>

      {/* Enhanced Patients List */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ProgressBar indeterminate color={theme.colors.primary} style={styles.loadingBar} />
            <Text style={styles.loadingText}>Loading patients...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.patientsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.patientsContent}
          >
            {filteredPatients.length === 0 ? (
              <View style={styles.emptyState}>
                <Surface style={styles.emptyIconContainer} elevation={2}>
                  <MaterialIcon source="account-search" size={64} color={theme.colors.outline} />
                </Surface>
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                  {searchQuery ? 'No patients found' : 'No patients yet'}
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  {searchQuery 
                    ? 'Try adjusting your search or filters' 
                    : 'Add your first patient to get started'
                  }
                </Text>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('AddPatient')}
                    style={styles.emptyButton}
                    icon="account-plus"
                  >
                    Add First Patient
                  </Button>
                )}
              </View>
            ) : (
              filteredPatients.map((patient, index) => (
                <Animated.View
                  key={patient.id}
                  style={[
                    styles.patientCardContainer,
                    {
                      transform: [{
                        translateY: slideUpAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50 + (index * 10)],
                        })
                      }]
                    }
                  ]}
                >
                  <Card
                    style={styles.patientCard}
                    onPress={() => navigation.navigate('PatientProfile', { patient })}
                    mode="elevated"
                  >
                    <Card.Content style={styles.patientCardContent}>
                      <View style={styles.patientHeader}>
                        <Avatar.Text
                          size={48}
                          label={(patient.fullName || 'Unknown').charAt(0)}
                          style={[styles.patientAvatar, { backgroundColor: getStatusColor(patient.status) }]}
                        />
                        <View style={styles.patientInfo}>
                          <Text variant="titleMedium" style={styles.patientName}>
                            {patient.fullName || 'Unknown Patient'}
                          </Text>
                          <Text variant="bodySmall" style={styles.patientDetails}>
                            Age {patient.age} • ID: {patient.medicalRecordNumber || patient.id.slice(0, 8)}
                          </Text>
                          <Chip
                            mode="flat"
                            style={[styles.statusChip, { backgroundColor: getStatusColor(patient.status) + '20' }]}
                            textStyle={[styles.statusText, { color: getStatusColor(patient.status) }]}
                            compact
                          >
                            {patient.status?.toUpperCase()}
                          </Chip>
                        </View>
                        
                        <View style={styles.patientActions}>
                          <IconButton
                            icon="chart-line"
                            iconColor={theme.colors.primary}
                            size={20}
                            onPress={() => navigation.navigate('PatientOverview', { patient })}
                          />
                          <IconButton
                            icon="video"
                            iconColor={theme.colors.secondary}
                            size={20}
                            onPress={() => navigation.navigate('CameraFeed')}
                          />
                        </View>
                      </View>
                      
                      {/* Quick Vitals Preview */}
                      <View style={styles.vitalsPreview}>
                        <View style={styles.vitalItem}>
                          <MaterialIcon source="heart" size={16} color="#F44336" />
                          <Text style={styles.vitalText}>72 BPM</Text>
                        </View>
                        <View style={styles.vitalItem}>
                          <MaterialIcon source="water-percent" size={16} color="#2196F3" />
                          <Text style={styles.vitalText}>98%</Text>
                        </View>
                        <View style={styles.vitalItem}>
                          <MaterialIcon source="thermometer" size={16} color="#FF9800" />
                          <Text style={styles.vitalText}>98.6°F</Text>
                        </View>
                        <View style={styles.vitalItem}>
                          <MaterialIcon source="walk" size={16} color="#4CAF50" />
                          <Text style={styles.vitalText}>1,234</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </Animated.View>
              ))
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* Enhanced FAB with Menu */}
      <Portal>
        <FAB.Group
          open={showQuickActions}
          visible
          icon={showQuickActions ? 'close' : 'plus'}
          actions={quickActions.map(action => ({
            icon: action.icon,
            label: action.label,
            onPress: action.onPress,
            color: action.color,
            style: { backgroundColor: action.color + '20' },
          }))}
          onStateChange={({ open }) => setShowQuickActions(open)}
          style={styles.fabGroup}
          fabStyle={[styles.fab, { backgroundColor: theme.colors.primary }]}
        />
      </Portal>

      {/* Profile Modal */}
      <Portal>
        <Modal
          visible={showProfile}
          onDismiss={() => setShowProfile(false)}
          contentContainerStyle={styles.profileModal}
        >
          <Surface style={styles.profileContent} elevation={4}>
            <Text variant="headlineSmall">Doctor Profile</Text>
            {/* Add profile content here */}
            <Button onPress={() => setShowProfile(false)}>Close</Button>
          </Surface>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeContainer: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  doctorName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F44336',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 8,
  },
  statsScrollView: {
    flexGrow: 0,
  },
  statCard: {
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    minWidth: 120,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 11,
  },
  searchSection: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
  },
  filterButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingBar: {
    width: 200,
    marginBottom: 20,
  },
  loadingText: {
    opacity: 0.7,
  },
  patientsList: {
    flex: 1,
  },
  patientsContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    padding: 24,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
  },
  patientCardContainer: {
    marginBottom: 12,
  },
  patientCard: {
    borderRadius: 16,
    elevation: 3,
  },
  patientCardContent: {
    padding: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientAvatar: {
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  patientName: {
    fontWeight: 'bold',
  },
  patientDetails: {
    opacity: 0.7,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  patientActions: {
    flexDirection: 'row',
  },
  vitalsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  vitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vitalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fabGroup: {
    paddingBottom: 20,
  },
  fab: {
    borderRadius: 16,
  },
  profileModal: {
    margin: 20,
    borderRadius: 20,
  },
  profileContent: {
    padding: 24,
    borderRadius: 20,
  },
});
