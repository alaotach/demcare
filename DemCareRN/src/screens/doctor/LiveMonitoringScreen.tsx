import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Surface,
  useTheme,
  Button,
  Chip,
  Badge,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import IconFallback from '../../components/IconFallback';
import { mockLiveMonitoring } from '../../services/mockData';
import { ConfigService } from '../../services/config';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface LivePatient {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'critical';
  heartRate: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  stepCount: number;
  lastUpdate: Date;
  location: string;
}

interface VitalSign {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
  color: string;
}

export default function LiveMonitoringScreen({ navigation }: Props) {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to navigate to patient overview with serialized data
  const navigateToPatientOverview = (patient: any) => {
    const serializedPatient = {
      ...patient,
      lastUpdate: patient.lastUpdate instanceof Date 
        ? patient.lastUpdate.toISOString() 
        : patient.lastUpdate
    };
    navigation.navigate('PatientOverview', { patient: serializedPatient });
  };

  // Use comprehensive mock live monitoring data
  const getLivePatients = (): LivePatient[] => {
    if (ConfigService.isMockModeEnabled() && mockLiveMonitoring.liveVitals) {
      return mockLiveMonitoring.liveVitals.map(vital => ({
        id: vital.patientId,
        name: vital.patientName,
        status: vital.status === 'stable' ? 'normal' : vital.status === 'elevated' ? 'warning' : 'critical',
        heartRate: vital.heartRate,
        oxygenSaturation: vital.oxygenSaturation,
        respiratoryRate: vital.respiratoryRate,
        stepCount: Math.floor(Math.random() * 5000) + 1000, // Random steps for demo
        lastUpdate: vital.lastUpdate,
        location: `Room ${Math.floor(Math.random() * 300) + 100}`,
      }));
    }
    
    return [
      {
        id: '1',
        name: 'John Smith',
        status: 'normal',
        heartRate: 72,
        oxygenSaturation: 98,
        respiratoryRate: 16,
        stepCount: 4820,
        lastUpdate: new Date(),
        location: 'Room 101',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        status: 'warning',
        heartRate: 95,
        oxygenSaturation: 94,
        respiratoryRate: 22,
        stepCount: 2340,
        lastUpdate: new Date(Date.now() - 30000),
        location: 'Room 203',
      },
      {
        id: '3',
        name: 'Michael Brown',
        status: 'critical',
        heartRate: 110,
        oxygenSaturation: 89,
        respiratoryRate: 28,
        stepCount: 890,
        lastUpdate: new Date(Date.now() - 60000),
        location: 'ICU Ward',
      },
      {
        id: '4',
        name: 'Emily Davis',
        status: 'normal',
        heartRate: 68,
        oxygenSaturation: 99,
        respiratoryRate: 14,
        stepCount: 6750,
        lastUpdate: new Date(Date.now() - 15000),
        location: 'Room 305',
      },
    ];
  };

  const [livePatients] = useState<LivePatient[]>(getLivePatients());

  const filteredPatients = livePatients.filter(patient => 
    selectedFilter === 'all' || patient.status === selectedFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getVitalStatus = (vital: string, value: number): 'normal' | 'warning' | 'critical' => {
    switch (vital) {
      case 'heartRate':
        if (value < 60 || value > 100) return value < 50 || value > 120 ? 'critical' : 'warning';
        return 'normal';
      case 'oxygenSaturation':
        if (value < 95) return value < 90 ? 'critical' : 'warning';
        return 'normal';
      case 'respiratoryRate':
        if (value < 12 || value > 20) return value < 8 || value > 25 ? 'critical' : 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              textColor="#FFFFFF"
              style={styles.backButton}
              labelStyle={{ fontSize: 16 }}
            >
              <IconFallback source="arrow-left" size={20} color="#FFFFFF" />
            </Button>
            <View style={styles.headerTextContainer}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Live Monitoring
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Real-time patient vital signs
              </Text>
            </View>
            <Surface style={styles.liveIndicator} elevation={2}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </Surface>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Surface>
  );

  const renderOverviewStats = () => (
    <View style={styles.overviewContainer}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        System Overview
      </Text>
      <View style={styles.statsRow}>
        <Card style={[styles.overviewCard, { backgroundColor: '#E8F5E8' }]} elevation={3}>
          <Card.Content style={styles.overviewContent}>
            <IconFallback source="check-circle" size={24} color="#4CAF50" />
            <Text variant="headlineSmall" style={[styles.overviewNumber, { color: '#4CAF50' }]}>
              {livePatients.filter(p => p.status === 'normal').length}
            </Text>
            <Text variant="bodySmall" style={styles.overviewLabel}>Normal</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.overviewCard, { backgroundColor: '#FFF3E0' }]} elevation={3}>
          <Card.Content style={styles.overviewContent}>
            <IconFallback source="alert-circle" size={24} color="#FF9800" />
            <Text variant="headlineSmall" style={[styles.overviewNumber, { color: '#FF9800' }]}>
              {livePatients.filter(p => p.status === 'warning').length}
            </Text>
            <Text variant="bodySmall" style={styles.overviewLabel}>Warning</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.overviewCard, { backgroundColor: '#FFEBEE' }]} elevation={3}>
          <Card.Content style={styles.overviewContent}>
            <IconFallback source="alert-octagon" size={24} color="#F44336" />
            <Text variant="headlineSmall" style={[styles.overviewNumber, { color: '#F44336' }]}>
              {livePatients.filter(p => p.status === 'critical').length}
            </Text>
            <Text variant="bodySmall" style={styles.overviewLabel}>Critical</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All Patients', count: livePatients.length, color: theme.colors.primary },
          { key: 'normal', label: 'Normal', count: livePatients.filter(p => p.status === 'normal').length, color: '#4CAF50' },
          { key: 'warning', label: 'Warning', count: livePatients.filter(p => p.status === 'warning').length, color: '#FF9800' },
          { key: 'critical', label: 'Critical', count: livePatients.filter(p => p.status === 'critical').length, color: '#F44336' },
        ].map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && { backgroundColor: filter.color }
            ]}
            textStyle={{
              color: selectedFilter === filter.key ? '#FFFFFF' : filter.color,
              fontWeight: '600'
            }}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderPatientCard = ({ item: patient }: { item: LivePatient }) => {
    const vitals: VitalSign[] = [
      {
        label: 'Heart Rate',
        value: patient.heartRate.toString(),
        unit: 'BPM',
        status: getVitalStatus('heartRate', patient.heartRate),
        icon: 'heart',
        color: '#E91E63',
      },
      {
        label: 'SpO₂',
        value: patient.oxygenSaturation.toString(),
        unit: '%',
        status: getVitalStatus('oxygenSaturation', patient.oxygenSaturation),
        icon: 'water-percent',
        color: '#2196F3',
      },
      {
        label: 'Respiratory',
        value: patient.respiratoryRate.toString(),
        unit: '/min',
        status: getVitalStatus('respiratoryRate', patient.respiratoryRate),
        icon: 'lungs',
        color: '#4CAF50',
      },
      {
        label: 'Steps',
        value: patient.stepCount.toLocaleString(),
        unit: 'today',
        status: 'normal',
        icon: 'walk',
        color: '#9C27B0',
      },
    ];

    const timeSinceUpdate = Math.floor((Date.now() - patient.lastUpdate.getTime()) / 1000);

    return (
      <Card style={[styles.patientCard, { borderLeftColor: getStatusColor(patient.status), borderLeftWidth: 4 }]} elevation={4}>
        <Card.Content style={styles.patientCardContent}>
          <View style={styles.patientHeader}>
            <View style={styles.patientInfo}>
              <Text variant="titleLarge" style={styles.patientName}>
                {patient.name}
              </Text>
              <View style={styles.patientMeta}>
                <IconFallback source="map-marker" size={14} color={theme.colors.outline} />
                <Text variant="bodySmall" style={[styles.locationText, { color: theme.colors.outline }]}>
                  {patient.location}
                </Text>
                <Text variant="bodySmall" style={[styles.updateTime, { color: theme.colors.outline }]}>
                  • {timeSinceUpdate < 60 ? `${timeSinceUpdate}s` : `${Math.floor(timeSinceUpdate / 60)}m`} ago
                </Text>
              </View>
            </View>
            <Badge
              style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) }]}
              size={24}
            >
              {patient.status.toUpperCase()}
            </Badge>
          </View>

          <View style={styles.vitalsGrid}>
            {vitals.map((vital, index) => (
              <View key={index} style={styles.vitalItem}>
                <Surface 
                  style={[
                    styles.vitalIcon, 
                    { backgroundColor: vital.color + '20' },
                    vital.status !== 'normal' && { backgroundColor: getStatusColor(vital.status) + '20' }
                  ]} 
                  elevation={1}
                >
                  <IconFallback 
                    source={vital.icon as any} 
                    size={18} 
                    color={vital.status !== 'normal' ? getStatusColor(vital.status) : vital.color} 
                  />
                </Surface>
                <Text variant="bodySmall" style={styles.vitalLabel}>
                  {vital.label}
                </Text>
                <Text 
                  variant="titleSmall" 
                  style={[
                    styles.vitalValue,
                    { color: vital.status !== 'normal' ? getStatusColor(vital.status) : theme.colors.onSurface }
                  ]}
                >
                  {vital.value}
                </Text>
                <Text variant="labelSmall" style={styles.vitalUnit}>
                  {vital.unit}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.patientActions}>
            <Button
              mode="outlined"
              onPress={() => navigateToPatientOverview({ id: patient.id, fullName: patient.name })}
              style={styles.viewButton}
              textColor={theme.colors.primary}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CameraFeed')}
              style={[styles.cameraButton, { backgroundColor: getStatusColor(patient.status) }]}
            >
              Live Feed
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRecentAlerts = () => {
    const alerts = ConfigService.isMockModeEnabled() && mockLiveMonitoring.currentAlerts 
      ? mockLiveMonitoring.currentAlerts.slice(0, 3) // Show only recent 3 alerts
      : [];

    if (alerts.length === 0) return null;

    return (
      <View style={styles.overviewContainer}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Recent Alerts
        </Text>
        {alerts.map((alert: any, index: number) => (
          <Card key={index} style={[styles.overviewCard, { 
            backgroundColor: alert.severity === 'critical' ? '#FFEBEE' : 
                            alert.severity === 'warning' ? '#FFF3E0' : '#E3F2FD',
            marginBottom: 8
          }]} elevation={2}>
            <Card.Content style={styles.overviewContent}>
              <View style={styles.patientHeader}>
                <IconFallback 
                  source={alert.severity === 'critical' ? 'alert-octagon' : 
                        alert.severity === 'warning' ? 'alert-circle' : 'information'} 
                  size={20} 
                  color={alert.severity === 'critical' ? '#F44336' : 
                         alert.severity === 'warning' ? '#FF9800' : '#2196F3'} 
                />
                <Text variant="bodyMedium" style={[styles.patientName, { 
                  color: alert.severity === 'critical' ? '#F44336' : 
                         alert.severity === 'warning' ? '#FF9800' : '#2196F3',
                  flex: 1,
                  marginLeft: 8
                }]}>
                  {alert.message}
                </Text>
              </View>
              <Text variant="bodySmall" style={[styles.patientMeta, { color: theme.colors.onSurfaceVariant }]}>
                {alert.patientName} • {new Date(alert.timestamp).toLocaleTimeString()}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderOverviewStats()}
        {renderFilters()}
        {renderRecentAlerts()}
        
        <View style={styles.patientsContainer}>
          <View style={styles.patientsHeader}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Live Patient Monitoring ({filteredPatients.length})
            </Text>
            <Button
              mode="text"
              onPress={onRefresh}
              disabled={isRefreshing}
              textColor={theme.colors.primary}
            >
              {isRefreshing ? <ActivityIndicator size="small" /> : <IconFallback source="refresh" size={20} />}
            </Button>
          </View>
          
          <FlatList
            data={filteredPatients}
            renderItem={renderPatientCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.patientsList}
          />
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  overviewContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  overviewNumber: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  overviewLabel: {
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    marginRight: 12,
    marginBottom: 8,
  },
  patientsContainer: {
    paddingHorizontal: 20,
  },
  patientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientsList: {
    paddingBottom: 20,
  },
  patientCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  patientCardContent: {
    padding: 20,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 13,
  },
  updateTime: {
    marginLeft: 8,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vitalItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalLabel: {
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 4,
  },
  vitalValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vitalUnit: {
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  cameraButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
