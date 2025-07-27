import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  Pressable,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Surface,
  useTheme,
  Button,
  Chip,
  SegmentedButtons,
  Searchbar,
  Avatar,
  Badge,
  Divider,
  IconButton,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import IconFallback from '../../components/IconFallback';
import { usePatientStore } from '../../store/patientStore';
import { useAuthStore } from '../../store/authStore';
import { Patient, PatientStatus } from '../../types';
import { mockAnalytics } from '../../services/mockData';
import { ConfigService } from '../../services/config';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface PatientAnalytics {
  id: string;
  title: string;
  description: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  isGood: boolean; // Whether the trend direction is positive for health
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface PatientMetrics {
  avgHeartRate: number;
  avgSpO2: number;
  dailySteps: number;
  sleepHours: number;
  alertsCount: number;
  medicationCompliance: number;
  lastVitalCheck: Date;
}

export default function AnalyticsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vitals' | 'activity' | 'alerts'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);

  useEffect(() => {
    if (user?.id && patients.length === 0) {
      fetchPatients(user.id);
    }
    // Auto-select first patient if none selected
    if (patients.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);
    }
  }, [user?.id, patients]);

  // Generate mock analytics data for selected patient
  const generatePatientMetrics = (patient: Patient): PatientMetrics => {
    const baseMetrics = {
      avgHeartRate: patient.vitals?.heartRate || 75,
      avgSpO2: patient.vitals?.oxygenSaturation || 97,
      dailySteps: patient.vitals?.stepCount || 5000,
      sleepHours: 7.5,
      alertsCount: patient.status === PatientStatus.OUT_OF_RANGE ? 3 : 0,
      medicationCompliance: 85,
      lastVitalCheck: new Date(),
    };
    return baseMetrics;
  };

  const getPatientAnalytics = (patient: Patient): PatientAnalytics[] => {
    // Use our comprehensive mock analytics data
    const isMockMode = ConfigService.isMockModeEnabled();
    const mockData = isMockMode ? mockAnalytics.weeklyStats : null;
    const fallbackMetrics = !isMockMode ? generatePatientMetrics(patient) : null;
    
    const heartRate = mockData?.averageHeartRate || fallbackMetrics?.avgHeartRate || 82;
    const oxygenSat = mockData?.averageOxygenSaturation || fallbackMetrics?.avgSpO2 || 95;
    const steps = mockData?.averageSteps || fallbackMetrics?.dailySteps || 2100;
    const sleepHours = mockData?.averageSleepHours || fallbackMetrics?.sleepHours || 7.2;
    const incidents = mockData?.incidentCount || fallbackMetrics?.alertsCount || 0;
    
    return [
      {
        id: '1',
        title: 'Heart Rate',
        description: `${selectedPeriod} average for ${patient.fullName}`,
        value: `${heartRate} BPM`,
        change: '+2.3%',
        trend: 'up',
        icon: 'heart',
        color: '#E91E63',
        isGood: heartRate >= 60 && heartRate <= 100,
      },
      {
        id: '2',
        title: 'SpO₂ Level',
        description: 'Oxygen saturation average',
        value: `${oxygenSat}%`,
        change: '+0.8%',
        trend: 'up',
        icon: 'water-percent',
        color: '#2196F3',
        isGood: oxygenSat >= 95,
      },
      {
        id: '3',
        title: 'Daily Steps',
        description: 'Activity level tracking',
        value: steps.toLocaleString(),
        change: patient.status === PatientStatus.IN_RANGE ? '+12.4%' : '-5.2%',
        trend: patient.status === PatientStatus.IN_RANGE ? 'up' : 'down',
        icon: 'walk',
        color: '#4CAF50',
        isGood: steps >= 1000,
      },
      {
        id: '4',
        title: 'Sleep Quality',
        description: 'Average sleep duration',
        value: `${sleepHours}h`,
        change: '+0.5h',
        trend: 'up',
        icon: 'sleep',
        color: '#673AB7',
        isGood: sleepHours >= 6,
      },
      {
        id: '5',
        title: 'Alert Count',
        description: `Critical alerts this ${selectedPeriod}`,
        value: incidents.toString(),
        change: incidents === 0 ? '-100%' : '+25%',
        trend: incidents === 0 ? 'down' : 'up',
        icon: 'alert-circle',
        color: '#FF5722',
        isGood: incidents === 0,
      },
      {
        id: '6',
        title: 'Medication',
        description: 'Compliance rate',
        value: `${mockData?.medicationCompliance || fallbackMetrics?.medicationCompliance || 92}%`,
        change: '+5.2%',
        trend: 'up',
        icon: 'pill',
        color: '#607D8B',
        isGood: (mockData?.medicationCompliance || fallbackMetrics?.medicationCompliance || 92) >= 80,
      },
    ];
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentAnalytics = selectedPatient ? getPatientAnalytics(selectedPatient) : [];
  
  const filteredCards = currentAnalytics.filter(card => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'vitals') return ['heart', 'water-percent'].includes(card.icon);
    if (selectedCategory === 'activity') return ['walk', 'sleep'].includes(card.icon);
    if (selectedCategory === 'alerts') return ['alert-circle', 'pill'].includes(card.icon);
    return true;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-neutral';
      default: return 'trending-neutral';
    }
  };

  const getTrendColor = (trend: string, isGood: boolean) => {
    if (trend === 'stable') return '#9E9E9E';
    
    // For health metrics, "up" might be good or bad depending on the metric
    if (trend === 'up') {
      return isGood ? '#4CAF50' : '#F44336';
    } else {
      return isGood ? '#F44336' : '#4CAF50';
    }
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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <View style={styles.backButtonContainer}>
                <IconFallback source="arrow-left" size={24} color="#FFFFFF" />
              </View>
            </Pressable>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                Analytics
              </Text>
              <Text style={styles.headerSubtitle}>
                {selectedPatient ? `${selectedPatient.fullName}'s Health Data` : 'Patient Health Insights'}
              </Text>
            </View>
            <View style={styles.headerActionContainer}>
              <View style={styles.headerIconContainer}>
                <IconFallback source="chart-donut" size={24} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderPatientSelector = () => (
    <View style={styles.patientSelectorContainer}>
      {selectedPatient ? (
        <View style={styles.selectedPatientContainer}>
          <View style={styles.patientCardHeader}>
            <Text style={styles.patientCardTitle}>Selected Patient</Text>
            <Pressable onPress={() => setShowPatientList(true)} style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change</Text>
            </Pressable>
          </View>
          
          <Pressable
            onPress={() => setShowPatientList(true)}
            style={({ pressed }) => [
              styles.selectedPatientCard,
              { 
                opacity: pressed ? 0.95 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }]
              }
            ]}
          >
            <LinearGradient
              colors={[getStatusColor(selectedPatient.status), getStatusColor(selectedPatient.status) + 'CC']}
              style={styles.patientCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.selectedPatientCardContent}>
                <Avatar.Text 
                  size={56} 
                  label={selectedPatient.fullName.split(' ').map(n => n[0]).join('')}
                  style={styles.patientAvatar}
                  labelStyle={styles.patientAvatarLabel}
                />
                <View style={styles.selectedPatientInfo}>
                  <Text style={styles.selectedPatientName}>
                    {selectedPatient.fullName}
                  </Text>
                  <View style={styles.patientMetaContainer}>
                    <View style={styles.patientStatusBadge}>
                      <Text style={styles.patientStatusText}>
                        {getStatusText(selectedPatient.status)}
                      </Text>
                    </View>
                    <Text style={styles.patientMetaText}>
                      {selectedPatient.age} years • Room {selectedPatient.roomNumber || 'N/A'}
                    </Text>
                  </View>
                  {selectedPatient.vitals && (
                    <View style={styles.patientVitalsContainer}>
                      <View style={styles.vitalIndicator}>
                        <IconFallback source="heart" size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.vitalText}>{selectedPatient.vitals.heartRate}</Text>
                      </View>
                      <View style={styles.vitalIndicator}>
                        <IconFallback source="water-percent" size={16} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.vitalText}>{selectedPatient.vitals.oxygenSaturation}%</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.expandIndicator}>
                  <IconFallback source="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <View style={styles.noPatientContainer}>
          <View style={styles.noPatientCard}>
            <View style={styles.noPatientIconContainer}>
              <IconFallback source="account-search" size={48} color="#667eea" />
            </View>
            <Text style={styles.noPatientTitle}>No Patient Selected</Text>
            <Text style={styles.noPatientDescription}>
              Select a patient to view their detailed analytics and health insights
            </Text>
            <Pressable
              onPress={() => setShowPatientList(true)}
              style={({ pressed }) => [
                styles.selectPatientBtn,
                { opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.selectPatientBtnGradient}
              >
                <Text style={styles.selectPatientBtnText}>Select Patient</Text>
                <IconFallback source="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  const renderModalPatientItem = ({ item: patient }: { item: Patient }) => (
    <Pressable
      onPress={() => {
        setSelectedPatient(patient);
        setShowPatientList(false);
        setSearchQuery('');
      }}
      style={({ pressed }) => [
        styles.modalPatientCard,
        selectedPatient?.id === patient.id && styles.modalSelectedPatientCard,
        {
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }]
        }
      ]}
    >
      <View style={styles.modalPatientCardContent}>
        <View style={styles.modalPatientAvatarSection}>
          <Avatar.Text 
            size={64} 
            label={patient.fullName.split(' ').map(n => n[0]).join('')}
            style={{ backgroundColor: getStatusColor(patient.status) }}
            labelStyle={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF' }}
          />
          <Surface 
            style={[styles.modalPatientStatusIndicator, { backgroundColor: getStatusColor(patient.status) }]} 
            elevation={4}
          >
            <IconFallback 
              source={patient.status === PatientStatus.IN_RANGE ? "check" : 
                    patient.status === PatientStatus.OUT_OF_RANGE ? "alert" : "wifi-off"} 
              size={12} 
              color="#FFFFFF" 
            />
          </Surface>
        </View>
        
        <View style={styles.modalPatientInfoSection}>
          <View style={styles.modalPatientHeader}>
            <Text variant="titleLarge" style={styles.modalPatientCardName}>
              {patient.fullName}
            </Text>
            {selectedPatient?.id === patient.id && (
              <Surface style={styles.modalSelectedBadge} elevation={2}>
                <IconFallback source="check" size={16} color="#4CAF50" />
              </Surface>
            )}
          </View>
          
          <View style={styles.modalPatientMetaRow}>
            <Chip 
              style={[styles.modalStatusChip, { backgroundColor: getStatusColor(patient.status) + '20' }]}
              textStyle={{ 
                color: getStatusColor(patient.status), 
                fontSize: 11, 
                fontWeight: '700',
                textTransform: 'uppercase'
              }}
              compact
            >
              {getStatusText(patient.status)}
            </Chip>
            <Text variant="bodyMedium" style={styles.modalPatientBasicInfo}>
              {patient.age} years • Room {patient.roomNumber || 'N/A'}
            </Text>
          </View>
          
          {patient.vitals && (
            <View style={styles.modalPatientVitalsRow}>
              <View style={[styles.modalVitalChip, { backgroundColor: '#E91E63' + '15' }]}>
                <IconFallback source="heart" size={16} color="#E91E63" />
                <Text style={[styles.modalVitalChipText, { color: '#E91E63' }]}>{patient.vitals.heartRate}</Text>
                <Text style={[styles.modalVitalChipUnit, { color: '#E91E63' }]}>BPM</Text>
              </View>
              <View style={[styles.modalVitalChip, { backgroundColor: '#2196F3' + '15' }]}>
                <IconFallback source="water-percent" size={16} color="#2196F3" />
                <Text style={[styles.modalVitalChipText, { color: '#2196F3' }]}>{patient.vitals.oxygenSaturation}</Text>
                <Text style={[styles.modalVitalChipUnit, { color: '#2196F3' }]}>%</Text>
              </View>
              <View style={[styles.modalVitalChip, { backgroundColor: '#4CAF50' + '15' }]}>
                <IconFallback source="walk" size={16} color="#4CAF50" />
                <Text style={[styles.modalVitalChipText, { color: '#4CAF50' }]}>{patient.vitals.stepCount}</Text>
                <Text style={[styles.modalVitalChipUnit, { color: '#4CAF50' }]}>steps</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      <SegmentedButtons
        value={selectedPeriod}
        onValueChange={setSelectedPeriod}
        buttons={[
          { value: 'day', label: 'Today' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
        style={styles.segmentedButtons}
      />
    </View>
  );

  const renderCategoryFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All Metrics', count: currentAnalytics.length },
          { key: 'vitals', label: 'Vital Signs', count: 2 },
          { key: 'activity', label: 'Activity', count: 2 },
          { key: 'alerts', label: 'Alerts & Meds', count: 2 },
        ].map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedCategory === filter.key}
            onPress={() => setSelectedCategory(filter.key as any)}
            style={[
              styles.filterChip,
              selectedCategory === filter.key && { backgroundColor: theme.colors.primary }
            ]}
            textStyle={{
              color: selectedCategory === filter.key ? '#FFFFFF' : theme.colors.onSurface,
              fontWeight: '600'
            }}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnalyticsCard = (card: PatientAnalytics) => (
    <Card key={card.id} style={styles.analyticsCard} elevation={4}>
      <Card.Content style={styles.analyticsCardContent}>
        <View style={styles.cardHeader}>
          <Surface 
            style={[styles.cardIcon, { backgroundColor: card.color }]} 
            elevation={2}
          >
            <IconFallback source={card.icon as any} size={24} color="#FFFFFF" />
          </Surface>
          <View style={styles.trendContainer}>
            <IconFallback 
              source={getTrendIcon(card.trend) as any} 
              size={16} 
              color={getTrendColor(card.trend, card.isGood)} 
            />
            <Text 
              variant="bodySmall" 
              style={[styles.trendText, { color: getTrendColor(card.trend, card.isGood) }]}
            >
              {card.change}
            </Text>
          </View>
        </View>
        
        <Text variant="titleLarge" style={styles.cardValue}>
          {card.value}
        </Text>
        
        <Text variant="titleMedium" style={styles.cardTitle}>
          {card.title}
        </Text>
        
        <Text variant="bodySmall" style={styles.cardDescription}>
          {card.description}
        </Text>
      </Card.Content>
    </Card>
  );

  const getVitalTrendsData = (): ChartData[] => {
    if (!selectedPatient) {
      return [
        { label: 'Normal', value: 85, color: '#4CAF50' },
        { label: 'Warning', value: 10, color: '#FF9800' },
        { label: 'Critical', value: 5, color: '#F44336' },
      ];
    }

    // Generate data based on patient status
    if (selectedPatient.status === PatientStatus.IN_RANGE) {
      return [
        { label: 'Normal', value: 90, color: '#4CAF50' },
        { label: 'Warning', value: 8, color: '#FF9800' },
        { label: 'Critical', value: 2, color: '#F44336' },
      ];
    } else if (selectedPatient.status === PatientStatus.OUT_OF_RANGE) {
      return [
        { label: 'Normal', value: 60, color: '#4CAF50' },
        { label: 'Warning', value: 25, color: '#FF9800' },
        { label: 'Critical', value: 15, color: '#F44336' },
      ];
    } else {
      return [
        { label: 'Normal', value: 0, color: '#4CAF50' },
        { label: 'Warning', value: 0, color: '#FF9800' },
        { label: 'Offline', value: 100, color: '#9E9E9E' },
      ];
    }
  };

  const renderVitalTrendsChart = () => {
    const vitalTrendsData = getVitalTrendsData();
    
    return (
      <Card style={styles.chartCard} elevation={4}>
        <Card.Content style={styles.chartCardContent}>
          <Text variant="titleMedium" style={styles.chartTitle}>
            Vital Signs Distribution
          </Text>
          <Text variant="bodySmall" style={styles.chartSubtitle}>
            {selectedPatient?.fullName}'s status breakdown for this {selectedPeriod}
          </Text>
          
          <View style={styles.chartContainer}>
            <View style={styles.pieChart}>
              {vitalTrendsData.map((item: ChartData, index: number) => {
                const total = vitalTrendsData.reduce((sum: number, data: ChartData) => sum + data.value, 0);
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                
                return (
                  <View key={index} style={styles.chartItem}>
                    <View style={styles.chartLegendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text variant="bodyMedium" style={styles.legendLabel}>
                        {item.label}
                      </Text>
                    </View>
                    <Text variant="titleMedium" style={[styles.chartValue, { color: item.color }]}>
                      {percentage}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderQuickInsights = () => {
    if (!selectedPatient) {
      return null;
    }

    const metrics = generatePatientMetrics(selectedPatient);
    const insights = [
      {
        color: selectedPatient.status === PatientStatus.IN_RANGE ? '#4CAF50' : '#F44336',
        text: selectedPatient.status === PatientStatus.IN_RANGE 
          ? `${selectedPatient.fullName} is maintaining stable vital signs`
          : `${selectedPatient.fullName} requires immediate attention for irregular vitals`
      },
      {
        color: metrics.dailySteps >= 3000 ? '#4CAF50' : '#FF9800',
        text: metrics.dailySteps >= 3000 
          ? `Daily activity goal achieved with ${metrics.dailySteps.toLocaleString()} steps`
          : `Activity level below target - encourage more movement`
      },
      {
        color: metrics.alertsCount === 0 ? '#4CAF50' : '#F44336',
        text: metrics.alertsCount === 0 
          ? `No critical alerts this ${selectedPeriod} - excellent progress`
          : `${metrics.alertsCount} alerts this ${selectedPeriod} - monitor closely`
      },
      {
        color: metrics.medicationCompliance >= 80 ? '#4CAF50' : '#FF9800',
        text: `Medication compliance at ${metrics.medicationCompliance}% - ${metrics.medicationCompliance >= 80 ? 'good adherence' : 'needs improvement'}`
      }
    ];

    return (
      <Card style={styles.insightsCard} elevation={4}>
        <Card.Content style={styles.insightsCardContent}>
          <View style={styles.insightsHeader}>
            <IconFallback source="lightbulb" size={24} color="#FF9800" />
            <Text variant="titleMedium" style={styles.insightsTitle}>
              Patient Insights
            </Text>
          </View>
          
          <View style={styles.insightsList}>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={[styles.insightDot, { backgroundColor: insight.color }]} />
                <Text variant="bodyMedium" style={styles.insightText}>
                  {insight.text}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        {renderPatientSelector()}
        
        {selectedPatient ? (
          <>
            {renderPeriodSelector()}
            {renderCategoryFilters()}
            
            <View style={styles.analyticsContainer}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                {selectedPatient.fullName}'s Metrics ({filteredCards.length})
              </Text>
              
              <View style={styles.analyticsGrid}>
                {filteredCards.map(renderAnalyticsCard)}
              </View>
            </View>
            
            {renderVitalTrendsChart()}
            {renderQuickInsights()}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Surface style={styles.emptyIconContainer} elevation={4}>
              <IconFallback source="account-search" size={48} color={theme.colors.primary} />
            </Surface>
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
              No Patient Selected
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Please select a patient to view their analytics and insights
            </Text>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Patient Selection Modal */}
      <Modal
        visible={showPatientList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPatientList(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
          
          {/* Modal Header */}
          <Surface style={styles.modalHeader} elevation={2}>
            <View style={styles.modalHeaderContent}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Select Patient
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPatientList(false)}
                style={styles.modalCloseButton}
              />
            </View>
          </Surface>

          {/* Search Bar */}
          <View style={styles.modalSearchContainer}>
            <Searchbar
              placeholder="Search patients by name..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.modalSearchBar}
              inputStyle={{ fontSize: 16 }}
              iconColor={theme.colors.primary}
            />
          </View>

          {/* Patient Count */}
          <View style={styles.modalPatientCount}>
            <Text variant="bodyMedium" style={[styles.patientCountText, { color: theme.colors.onSurfaceVariant }]}>
              {filteredPatients.length} of {patients.length} patients
            </Text>
          </View>

          {/* Patient List */}
          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => item.id}
            renderItem={renderModalPatientItem}
            style={styles.modalPatientFlatList}
            contentContainerStyle={styles.modalPatientListContainer}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Enhanced Header Styles
  headerContainer: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  headerActionContainer: {
    marginLeft: 16,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Enhanced Patient Selector Styles
  patientSelectorContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 8,
  },
  selectedPatientContainer: {
    marginBottom: 8,
  },
  patientCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.3,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#667eea',
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedPatientCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  patientCardGradient: {
    padding: 24,
  },
  selectedPatientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  patientAvatarLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedPatientInfo: {
    flex: 1,
    marginLeft: 20,
  },
  selectedPatientName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  patientMetaContainer: {
    marginBottom: 12,
  },
  patientStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  patientStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  patientMetaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  patientVitalsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  vitalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  vitalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  expandIndicator: {
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // No Patient Selected Styles
  noPatientContainer: {
    alignItems: 'center',
  },
  noPatientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: '100%',
  },
  noPatientIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noPatientTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  noPatientDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  selectPatientBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectPatientBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  selectPatientBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Period and Filter Styles
  periodContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filterChip: {
    marginRight: 12,
    marginBottom: 8,
  },
  // Analytics Container Styles
  analyticsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 16,
    fontSize: 20,
    color: '#1e293b',
    letterSpacing: 0.3,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: (width - 72) / 2,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  analyticsCardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    marginLeft: 4,
    fontWeight: '700',
    fontSize: 12,
  },
  cardValue: {
    fontWeight: '800',
    marginBottom: 8,
    fontSize: 24,
    color: '#1e293b',
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 16,
    color: '#374151',
  },
  cardDescription: {
    opacity: 0.7,
    lineHeight: 16,
    fontSize: 13,
    color: '#64748b',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
  },
  chartCardContent: {
    padding: 20,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartSubtitle: {
    opacity: 0.7,
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    width: '100%',
  },
  chartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendLabel: {
    fontWeight: '500',
  },
  chartValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
  },
  insightsCardContent: {
    padding: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f0f4ff',
  },
  emptyTitle: {
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 24,
    color: '#1e293b',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    color: '#64748b',
  },
  // Modal Styles - Enhanced Design
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 24,
    color: '#1e293b',
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    margin: 0,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  modalSearchContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalSearchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  modalPatientCount: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  patientCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalPatientFlatList: {
    flex: 1,
  },
  modalPatientListContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  // Enhanced Modal Patient Card Styles
  modalPatientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    // elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalSelectedPatientCard: {
    backgroundColor: '#667eea' + '08',
    borderColor: '#667eea',
    borderWidth: 2,
    // elevation: 8,
    shadowOpacity: 0.15,
  },
  modalPatientCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
  },
  modalPatientAvatarSection: {
    position: 'relative',
    alignItems: 'center',
  },
  modalPatientStatusIndicator: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalPatientInfoSection: {
    flex: 1,
    marginLeft: 20,
  },
  modalPatientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalPatientCardName: {
    fontWeight: '800',
    fontSize: 20,
    marginBottom: 2,
    flex: 1,
    lineHeight: 24,
    color: '#1e293b',
  },
  modalSelectedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginLeft: 12,
  },
  modalPatientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalStatusChip: {
    borderRadius: 16,
    height: 32,
    elevation: 2,
  },
  modalPatientBasicInfo: {
    fontSize: 15,
    opacity: 0.8,
    flex: 1,
    fontWeight: '600',
    color: '#374151',
  },
  modalPatientVitalsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  modalVitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    minWidth: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalVitalChipText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalVitalChipUnit: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  modalSelectedCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50' + '15',
    marginLeft: 16,
  },
});
