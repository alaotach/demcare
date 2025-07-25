import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme,
  FAB,
  ActivityIndicator,
  Surface,
  Avatar,
  Divider,
  IconButton,
  Badge,
  ProgressBar,
  Menu
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { Patient, PatientStatus, VitalSigns } from '../../types';
import { usePatientStore } from '../../store/patientStore';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: {
    params: {
      patient: Patient;
    };
  };
}

interface VitalCard {
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  normalRange: string;
  isNormal: boolean;
}

export default function EnhancedPatientProfileScreen({ navigation, route }: Props) {
  const { patient: initialPatient } = route.params;
  const theme = useTheme();
  const { selectedPatient, selectPatient, vitals, fetchVitalsHistory } = usePatientStore();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const patient = selectedPatient || initialPatient;

  useEffect(() => {
    selectPatient(initialPatient);
    loadVitalsHistory();
    
    // Set up header
    navigation.setOptions({
      title: patient.fullName,
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => {}} title="Edit Patient" leadingIcon="pencil" />
          <Menu.Item onPress={() => {}} title="Export Data" leadingIcon="download" />
          <Menu.Item onPress={() => {}} title="Send Report" leadingIcon="email" />
          <Divider />
          <Menu.Item onPress={() => {}} title="Archive" leadingIcon="archive" />
        </Menu>
      ),
    });
  }, [initialPatient.id, navigation, menuVisible]);

  const loadVitalsHistory = async () => {
    setLoading(true);
    try {
      await fetchVitalsHistory(initialPatient.id);
    } catch (error) {
      console.error('Failed to load vitals history:', error);
      Alert.alert('Error', 'Failed to load patient vitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVitalsHistory();
    setRefreshing(false);
  };

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

  const getVitalCards = (): VitalCard[] => {
    if (!patient.vitals) return [];

    return [
      {
        label: 'Heart Rate',
        value: patient.vitals.heartRate,
        unit: 'BPM',
        icon: 'heart',
        color: '#E91E63',
        normalRange: '60-100',
        isNormal: patient.vitals.heartRate >= 60 && patient.vitals.heartRate <= 100,
      },
      {
        label: 'Oxygen Saturation',
        value: patient.vitals.oxygenSaturation,
        unit: '%',
        icon: 'water-percent',
        color: '#2196F3',
        normalRange: '95-100',
        isNormal: patient.vitals.oxygenSaturation >= 95,
      },
      {
        label: 'Respiratory Rate',
        value: patient.vitals.respiratoryRate,
        unit: '/min',
        icon: 'lungs',
        color: '#FF9800',
        normalRange: '12-20',
        isNormal: patient.vitals.respiratoryRate >= 12 && patient.vitals.respiratoryRate <= 20,
      },
      {
        label: 'Step Count',
        value: patient.vitals.stepCount,
        unit: 'steps',
        icon: 'walk',
        color: '#4CAF50',
        normalRange: '2000+',
        isNormal: patient.vitals.stepCount >= 2000,
      },
    ];
  };

  const patientVitals = vitals[patient.id] || [];

  const getChartData = (vitalType: 'heartRate' | 'oxygenSaturation' | 'respiratoryRate') => {
    const data = patientVitals.slice(-12).reverse(); // Last 12 readings
    
    if (data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          strokeWidth: 2,
          color: () => theme.colors.primary
        }]
      };
    }

    return {
      labels: data.map((_, index) => `${data.length - index}`),
      datasets: [{
        data: data.map(vital => vital[vitalType]),
        strokeWidth: 3,
        color: () => theme.colors.primary,
      }]
    };
  };

  const renderPatientHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[getStatusColor(patient.status), getStatusColor(patient.status) + '80']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Avatar.Image
            size={80}
            source={{ uri: `https://ui-avatars.com/api/?name=${patient.fullName}&background=random` }}
            style={styles.avatar}
          />
          <View style={styles.patientInfoHeader}>
            <Text variant="headlineSmall" style={styles.patientNameHeader}>
              {patient.fullName}
            </Text>
            <View style={styles.statusRow}>
              <Chip
                style={[styles.statusChipHeader, { backgroundColor: getStatusColor(patient.status) }]}
                textStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
              >
                {getStatusText(patient.status)}
              </Chip>
              <Badge
                style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) }]}
                size={12}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text variant="bodySmall" style={styles.quickStatLabel}>Age</Text>
            <Text variant="titleMedium" style={styles.quickStatValue}>{patient.age}</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text variant="bodySmall" style={styles.quickStatLabel}>Weight</Text>
            <Text variant="titleMedium" style={styles.quickStatValue}>{patient.weight}kg</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text variant="bodySmall" style={styles.quickStatLabel}>Height</Text>
            <Text variant="titleMedium" style={styles.quickStatValue}>{patient.height}cm</Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderVitalsGrid = () => (
    <View style={styles.vitalsSection}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Current Vitals
        </Text>
        <Text variant="bodySmall" style={styles.lastUpdated}>
          Last updated: {patient.vitals?.timestamp ? new Date(patient.vitals.timestamp).toLocaleTimeString() : 'Never'}
        </Text>
      </View>
      
      <View style={styles.vitalsGrid}>
        {getVitalCards().map((vital, index) => (
          <Card key={index} style={[styles.vitalCard, { borderLeftColor: vital.color, borderLeftWidth: 4 }]}>
            <Card.Content style={styles.vitalCardContent}>
              <View style={styles.vitalHeader}>
                <MaterialCommunityIcons name={vital.icon as any} size={24} color={vital.color} />
                <Badge 
                  style={[
                    styles.vitalStatusBadge, 
                    { backgroundColor: vital.isNormal ? '#4CAF50' : '#F44336' }
                  ]}
                  size={8}
                />
              </View>
              <Text variant="titleLarge" style={[styles.vitalValue, { color: vital.color }]}>
                {vital.value}
              </Text>
              <Text variant="bodySmall" style={styles.vitalUnit}>{vital.unit}</Text>
              <Text variant="bodySmall" style={styles.vitalLabel}>{vital.label}</Text>
              <Text variant="bodySmall" style={styles.normalRange}>
                Normal: {vital.normalRange}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Vitals Trends
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['1h', '6h', '24h', '7d', '30d'].map((range) => (
          <Chip
            key={range}
            selected={selectedTimeRange === range}
            onPress={() => setSelectedTimeRange(range)}
            style={[
              styles.timeRangeChip,
              selectedTimeRange === range && { backgroundColor: theme.colors.primary }
            ]}
            textStyle={[
              selectedTimeRange === range && { color: '#FFFFFF' }
            ]}
          >
            {range}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderVitalsChart = () => {
    if (loading) {
      return (
        <Card style={styles.chartCard}>
          <Card.Content style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading vitals data...
            </Text>
          </Card.Content>
        </Card>
      );
    }

    if (patientVitals.length === 0) {
      return (
        <Card style={styles.chartCard}>
          <Card.Content style={styles.noDataContainer}>
            <MaterialCommunityIcons 
              name="chart-line-variant" 
              size={48} 
              color={theme.colors.outline} 
            />
            <Text variant="titleMedium" style={styles.noDataText}>
              No vitals data available
            </Text>
            <Text variant="bodySmall" style={styles.noDataSubtext}>
              Vitals will appear here once the patient's monitoring device is connected
            </Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>
            Heart Rate Trend
          </Text>
          <LineChart
            data={getChartData('heartRate')}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <Button
        mode="contained"
        icon="plus"
        onPress={() => navigation.navigate('AddSleepData', { patient })}
        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
        contentStyle={styles.actionButtonContent}
      >
        Add Sleep Data
      </Button>
      <Button
        mode="contained"
        icon="emoticon-happy"
        onPress={() => navigation.navigate('AddMoodEntry', { patient })}
        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
        contentStyle={styles.actionButtonContent}
      >
        Mood Check-in
      </Button>
    </View>
  );

  const renderContactInfo = () => (
    <Card style={styles.contactCard}>
      <Card.Content>
        <View style={styles.contactHeader}>
          <MaterialCommunityIcons name="contacts" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.contactTitle}>
            Emergency Contact
          </Text>
        </View>
        <Divider style={styles.contactDivider} />
        <View style={styles.contactItem}>
          <MaterialCommunityIcons name="phone" size={20} color={theme.colors.outline} />
          <Text variant="bodyMedium" style={styles.contactText}>
            {patient.caregiverContactNumber}
          </Text>
          <IconButton
            icon="phone"
            size={20}
            onPress={() => Alert.alert('Call', `Call ${patient.caregiverContactNumber}?`)}
            style={styles.contactAction}
          />
        </View>
        <View style={styles.contactItem}>
          <MaterialCommunityIcons name="wifi" size={20} color={theme.colors.outline} />
          <Text variant="bodyMedium" style={styles.contactText}>
            Device: {patient.rfidMacAddress}
          </Text>
          <IconButton
            icon="information"
            size={20}
            onPress={() => Alert.alert('Device Info', `MAC: ${patient.rfidMacAddress}`)}
            style={styles.contactAction}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderPatientHeader()}
        {renderVitalsGrid()}
        {renderTimeRangeSelector()}
        {renderVitalsChart()}
        {renderActionButtons()}
        {renderContactInfo()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="chart-timeline-variant"
        style={styles.fab}
        onPress={() => navigation.navigate('PatientOverview', { patient })}
        label="Overview"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 16,
  },
  patientInfoHeader: {
    flex: 1,
  },
  patientNameHeader: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChipHeader: {
    marginRight: 8,
  },
  statusBadge: {
    marginLeft: 4,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  quickStatValue: {
    color: 'white',
    fontWeight: 'bold',
  },
  vitalsSection: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastUpdated: {
    opacity: 0.7,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    elevation: 3,
  },
  vitalCardContent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalStatusBadge: {
    marginLeft: 8,
  },
  vitalValue: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vitalUnit: {
    opacity: 0.7,
    marginBottom: 4,
  },
  vitalLabel: {
    textAlign: 'center',
    marginBottom: 4,
  },
  normalRange: {
    opacity: 0.6,
    fontSize: 10,
    textAlign: 'center',
  },
  timeRangeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timeRangeChip: {
    marginRight: 8,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  noDataSubtext: {
    textAlign: 'center',
    opacity: 0.6,
    paddingHorizontal: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    elevation: 3,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  contactCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  contactDivider: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactAction: {
    margin: 0,
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
});
