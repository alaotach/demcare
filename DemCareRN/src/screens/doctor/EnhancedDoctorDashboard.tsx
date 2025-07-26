import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, RefreshControl, Dimensions, TouchableOpacity, FlatList, Pressable, Animated, Vibration } from 'react-native';
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

// Quick Action Button Component with Animations
interface QuickActionButtonProps {
  action: QuickAction;
  theme: any;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, theme }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Light haptic feedback with safety check
    try {
      Vibration.vibrate(30);
    } catch (error) {
      console.log('Vibration not available:', error);
    }
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={action.onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.quickActionTouchable}
    >
      <Animated.View
        style={[
          styles.quickActionAnimatedContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Card style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} elevation={3}>
          <Card.Content style={styles.quickActionContent}>
            <Surface style={[styles.quickActionIcon, { backgroundColor: action.color }]} elevation={2}>
              <IconFallback name={action.icon} size={20} color="#FFFFFF" />
            </Surface>
            <Text variant="bodySmall" style={styles.quickActionText} numberOfLines={2}>
              {action.title}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    </Pressable>
  );
};

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
      onPress: () => navigation.navigate('Reports'),
    },
    {
      id: '3',
      title: 'Patient Location',
      icon: 'map-marker-multiple',
      color: '#FF9800',
      onPress: () => navigation.navigate('Locations'),
    },
    {
      id: '4',
      title: 'Live Monitoring',
      icon: 'monitor-dashboard',
      color: '#4CAF50',
      onPress: () => navigation.navigate('LiveMonitoring'),
    },
    {
      id: '5',
      title: 'Analytics',
      icon: 'google-analytics',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      id: '6',
      title: 'Subscription',
      icon: 'crown',
      color: '#FF6F00',
      onPress: () => navigation.navigate('Subscription'),
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
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <Surface style={styles.avatarContainer} elevation={3}>
            <Avatar.Image
              size={54}
              source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' }}
              style={styles.avatar}
            />
          </Surface>
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
        <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]} elevation={4}>
          <Card.Content style={styles.statContent}>
            <Surface style={[styles.statIconContainer, { backgroundColor: '#1976D2' }]} elevation={2}>
              <IconFallback name="account-group" size={22} color="#FFFFFF" />
            </Surface>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#1976D2' }]}>
              {dashboardStats.totalPatients}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Patients</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#E8F5E8' }]} elevation={4}>
          <Card.Content style={styles.statContent}>
            <Surface style={[styles.statIconContainer, { backgroundColor: '#388E3C' }]} elevation={2}>
              <IconFallback name="heart-pulse" size={22} color="#FFFFFF" />
            </Surface>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#388E3C' }]}>
              {dashboardStats.activePatients}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Active</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#FFEBEE' }]} elevation={4}>
          <Card.Content style={styles.statContent}>
            <Surface style={[styles.statIconContainer, { backgroundColor: '#D32F2F' }]} elevation={2}>
              <IconFallback name="alert-circle" size={22} color="#FFFFFF" />
            </Surface>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#D32F2F' }]}>
              {dashboardStats.alertsCount}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Alerts</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#F3E5F5' }]} elevation={4}>
          <Card.Content style={styles.statContent}>
            <Surface style={[styles.statIconContainer, { backgroundColor: '#7B1FA2' }]} elevation={2}>
              <IconFallback name="calendar-check" size={22} color="#FFFFFF" />
            </Surface>
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#7B1FA2' }]}>
              {dashboardStats.todayVisits}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Visits</Text>
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
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <QuickActionButton 
            key={action.id} 
            action={action} 
            theme={theme}
          />
        ))}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
        {[
          { key: 'all', label: 'All Patients', count: patients.length, color: theme.colors.primary },
          { key: 'critical', label: 'Critical', count: dashboardStats.alertsCount, color: '#F44336' },
          { key: 'normal', label: 'Normal', count: patients.filter(p => p.status === PatientStatus.IN_RANGE).length, color: '#4CAF50' },
          { key: 'offline', label: 'Offline', count: patients.filter(p => p.status === PatientStatus.OFFLINE).length, color: '#9E9E9E' },
        ].map((filter) => (
          <Pressable
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            style={({ pressed }) => [
              styles.filterChip,
              selectedFilter === filter.key && { 
                backgroundColor: filter.color,
                borderColor: filter.color 
              },
              {
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              }
            ]}
          >
            <Text style={[
              styles.filterChipText,
              { 
                color: selectedFilter === filter.key ? '#FFFFFF' : filter.color, 
                fontWeight: '600' 
              }
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderPatientCard = ({ item: patient }: { item: Patient }) => (
    <Pressable
      onPress={() => navigation.navigate('PatientOverview', { patient })}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Card 
        style={[styles.patientCard, { shadowColor: theme.colors.shadow }]}
        elevation={5}
      >
        <Card.Content style={styles.patientCardContent}>
          <View style={styles.patientCardHeader}>
            <View style={styles.patientInfo}>
              <View style={styles.patientNameRow}>
                <Text variant="titleLarge" style={styles.patientName}>
                  {patient.fullName}
                </Text>
                <Surface 
                  style={[styles.statusIndicator, { backgroundColor: getStatusColor(patient.status) }]} 
                  elevation={2}
                >
                  <IconFallback 
                    name={patient.status === PatientStatus.IN_RANGE ? "check" : 
                          patient.status === PatientStatus.OUT_OF_RANGE ? "alert" : "wifi-off"} 
                    size={12} 
                    color="#FFFFFF" 
                  />
                </Surface>
              </View>
              <View style={styles.patientDetailsRow}>
                <View style={styles.detailItem}>
                  <IconFallback name="account" size={14} color={theme.colors.outline} />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {patient.age} years
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <IconFallback name="weight-kilogram" size={14} color={theme.colors.outline} />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {patient.weight}kg
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <IconFallback name="human-male-height" size={14} color={theme.colors.outline} />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {patient.height}cm
                  </Text>
                </View>
              </View>
              <View style={styles.emergencyContact}>
                <IconFallback name="phone" size={14} color="#E91E63" />
                <Text variant="bodySmall" style={[styles.caregiverContact, { color: '#E91E63' }]}>
                  Emergency: {patient.caregiverContactNumber}
                </Text>
              </View>
            </View>
            <View style={styles.patientActions}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(patient.status) + '15' }]}
                textStyle={{ color: getStatusColor(patient.status), fontSize: 13, fontWeight: '600' }}
                mode="outlined"
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
                  <Surface style={[styles.vitalIconContainer, { backgroundColor: '#E91E6320' }]} elevation={1}>
                    <IconFallback name="heart" size={18} color="#E91E63" />
                  </Surface>
                  <View style={styles.vitalTextContainer}>
                    <Text variant="bodySmall" style={styles.vitalValue}>
                      {patient.vitals.heartRate}
                    </Text>
                    <Text variant="labelSmall" style={styles.vitalUnit}>
                      BPM
                    </Text>
                  </View>
                </View>
                <View style={styles.vitalItem}>
                  <Surface style={[styles.vitalIconContainer, { backgroundColor: '#2196F320' }]} elevation={1}>
                    <IconFallback name="water-percent" size={18} color="#2196F3" />
                  </Surface>
                  <View style={styles.vitalTextContainer}>
                    <Text variant="bodySmall" style={styles.vitalValue}>
                      {patient.vitals.oxygenSaturation}%
                    </Text>
                    <Text variant="labelSmall" style={styles.vitalUnit}>
                      SpO₂
                    </Text>
                  </View>
                </View>
                <View style={styles.vitalItem}>
                  <Surface style={[styles.vitalIconContainer, { backgroundColor: '#4CAF5020' }]} elevation={1}>
                    <IconFallback name="walk" size={18} color="#4CAF50" />
                  </Surface>
                  <View style={styles.vitalTextContainer}>
                    <Text variant="bodySmall" style={styles.vitalValue}>
                      {patient.vitals.stepCount}
                    </Text>
                    <Text variant="labelSmall" style={styles.vitalUnit}>
                      steps
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );

  if (isLoading && patients.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Surface style={[styles.loadingIconContainer, { backgroundColor: theme.colors.primaryContainer }]} elevation={4}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Surface>
          <Text variant="titleMedium" style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading your patients...
          </Text>
          <Text variant="bodySmall" style={[styles.loadingSubtext, { color: theme.colors.onSurfaceVariant }]}>
            Please wait while we fetch the latest data
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
            placeholder="Search patients by name..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
            inputStyle={{ fontSize: 16 }}
            iconColor={theme.colors.primary}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            elevation={3}
          />
          
          {renderFilters()}
          
          {filteredPatients.length === 0 ? (
            <Surface style={[styles.emptyContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={2}>
              <Surface style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primaryContainer }]} elevation={3}>
                <IconFallback name="account-search" size={48} color={theme.colors.primary} />
              </Surface>
              <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
                {searchQuery ? 'No patients match your search' : 'No patients added yet'}
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {searchQuery 
                  ? 'Try adjusting your search terms or filters' 
                  : 'Start building your patient database by adding your first patient'
                }
              </Text>
              {!searchQuery && (
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('AddPatient')}
                  style={styles.addFirstPatientButton}
                  contentStyle={styles.addFirstPatientButtonContent}
                  labelStyle={styles.addFirstPatientButtonLabel}
                >
                  Add Your First Patient
                </Button>
              )}
            </Surface>
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

      <Pressable
        onPress={() => navigation.navigate('AddPatient')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={styles.fabContent}>
          <IconFallback name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.fabLabel}>Add Patient</Text>
        </View>
      </Pressable>
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
    paddingVertical: 24,
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
  avatarContainer: {
    borderRadius: 30,
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  quickActionTouchable: {
    width: (width - 64) / 3, // 3 columns with proper spacing
    marginBottom: 12,
    minHeight: 100, // Ensure consistent height
  },
  quickActionAnimatedContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 4,
    borderRadius: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    height: '100%', // Take full height of container
  },
  quickActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 88, // Consistent minimum height
    flex: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
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
    borderRadius: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingBottom: 4,
  },
  filterChip: {
    marginRight: 12,
    marginBottom: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  patientsList: {
    paddingBottom: 20,
  },
  patientCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  patientCardContent: {
    padding: 20,
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
    marginBottom: 12,
  },
  patientName: {
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 18,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 13,
    opacity: 0.8,
    fontWeight: '500',
  },
  emergencyContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caregiverContact: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  patientActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginLeft: 16,
    borderRadius: 16,
  },
  vitalsPreview: {
    marginTop: 16,
  },
  divider: {
    marginBottom: 16,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vitalItem: {
    alignItems: 'center',
  },
  vitalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalTextContainer: {
    alignItems: 'center',
  },
  vitalValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  vitalUnit: {
    opacity: 0.7,
    fontSize: 11,
    marginTop: 2,
  },
  vitalText: {
    marginLeft: 4,
    fontSize: 12,
  },
  bottomPadding: {
    height: 120,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstPatientButton: {
    borderRadius: 12,
  },
  addFirstPatientButtonContent: {
    paddingVertical: 8,
  },
  addFirstPatientButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
