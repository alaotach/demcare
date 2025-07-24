import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { 
  Card, 
  Text, 
  useTheme, 
  Button,
  Chip,
  IconButton,
  ProgressBar,
  Surface,
  Divider,
  Avatar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePatientStore } from '../../store/patientStore';
import { Patient, SleepData, MoodEntry, DietEntry, PhysicalActivity } from '../../types';

interface Props {
  navigation: any;
  route: {
    params: {
      patient: Patient;
    };
  };
}

export default function PatientOverviewScreen({ navigation, route }: Props) {
  const { patient } = route.params;
  const theme = useTheme();
  const { 
    selectedPatient, 
    selectPatient, 
    sleepData, 
    moodEntries, 
    dietEntries, 
    physicalActivities,
    bathroomLogs 
  } = usePatientStore();
  
  const [selectedView, setSelectedView] = useState<'today' | 'week' | 'month'>('today');
  const [activeTab, setActiveTab] = useState<'overview' | 'sleep' | 'mood' | 'diet' | 'activity'>('overview');

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  useEffect(() => {
    selectPatient(patient);
  }, [patient.id]);

  const patientSleepData = sleepData[patient.id] || [];
  const patientMoodData = moodEntries[patient.id] || [];
  const patientDietData = dietEntries[patient.id] || [];
  const patientActivityData = physicalActivities[patient.id] || [];
  const patientBathroomData = bathroomLogs[patient.id] || [];

  // Chart configurations
  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  // Get weekly sleep chart data
  const getSleepChartData = () => {
    const last7Days = patientSleepData.slice(0, 7).reverse();
    return {
      labels: last7Days.map(day => new Date(day.date).toLocaleDateString('en', { weekday: 'short' })),
      datasets: [{
        data: last7Days.map(day => day.totalSleepHours),
        strokeWidth: 2
      }]
    };
  };

  // Get mood chart data
  const getMoodChartData = () => {
    const last7Days = patientMoodData.slice(0, 7).reverse();
    return {
      labels: last7Days.map(entry => new Date(entry.timestamp).toLocaleDateString('en', { weekday: 'short' })),
      datasets: [{
        data: last7Days.map(entry => entry.moodScore),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`
      }]
    };
  };

  // Get activity chart data
  const getActivityChartData = () => {
    const last7Days = patientActivityData.slice(0, 7).reverse();
    return {
      labels: last7Days.map(activity => new Date(activity.date).toLocaleDateString('en', { weekday: 'short' })),
      datasets: [{
        data: last7Days.map(activity => activity.duration),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`
      }]
    };
  };

  // Calculate today's summary
  const getTodaySummary = () => {
    const today = new Date().toDateString();
    const todaySleep = patientSleepData.find(s => new Date(s.date).toDateString() === today);
    const todayMood = patientMoodData.filter(m => new Date(m.timestamp).toDateString() === today);
    const todayDiet = patientDietData.filter(d => new Date(d.timestamp).toDateString() === today);
    const todayActivity = patientActivityData.filter(a => new Date(a.date).toDateString() === today);
    const todayBathroom = patientBathroomData.filter(b => new Date(b.timestamp).toDateString() === today);

    return {
      sleep: todaySleep,
      avgMood: todayMood.length > 0 ? todayMood.reduce((acc, m) => acc + m.moodScore, 0) / todayMood.length : 0,
      totalMeals: todayDiet.length,
      totalWater: todayDiet.reduce((acc, d) => acc + d.waterIntake, 0),
      totalActivity: todayActivity.reduce((acc, a) => acc + a.duration, 0),
      bathroomVisits: todayBathroom.length
    };
  };

  const todaySummary = getTodaySummary();

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Today's Summary Cards */}
      <View style={styles.summaryGrid}>
        <Card style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons name="sleep" size={32} color="#1976D2" />
            <Text variant="bodySmall" style={styles.summaryLabel}>Sleep</Text>
            <Text variant="titleMedium" style={[styles.summaryValue, { color: '#1976D2' }]}>
              {todaySummary.sleep ? `${todaySummary.sleep.totalSleepHours}h` : 'No data'}
            </Text>
            {todaySummary.sleep && (
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <MaterialCommunityIcons 
                    key={star}
                    name={star <= todaySummary.sleep!.sleepQuality ? "star" : "star-outline"}
                    size={12}
                    color="#FFD700"
                  />
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons name="emoticon-happy" size={32} color="#F57C00" />
            <Text variant="bodySmall" style={styles.summaryLabel}>Mood</Text>
            <Text variant="titleMedium" style={[styles.summaryValue, { color: '#F57C00' }]}>
              {todaySummary.avgMood > 0 ? todaySummary.avgMood.toFixed(1) : 'No data'}
            </Text>
            {todaySummary.avgMood > 0 && (
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <MaterialCommunityIcons 
                    key={star}
                    name={star <= Math.round(todaySummary.avgMood) ? "star" : "star-outline"}
                    size={12}
                    color="#FFD700"
                  />
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#E8F5E8' }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons name="food-apple" size={32} color="#388E3C" />
            <Text variant="bodySmall" style={styles.summaryLabel}>Meals</Text>
            <Text variant="titleMedium" style={[styles.summaryValue, { color: '#388E3C' }]}>
              {todaySummary.totalMeals}
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtext}>
              {todaySummary.totalWater}ml water
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#F3E5F5' }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons name="walk" size={32} color="#7B1FA2" />
            <Text variant="bodySmall" style={styles.summaryLabel}>Activity</Text>
            <Text variant="titleMedium" style={[styles.summaryValue, { color: '#7B1FA2' }]}>
              {todaySummary.totalActivity}min
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtext}>
              Physical activity
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#FFF8E1' }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons name="toilet" size={32} color="#F9A825" />
            <Text variant="bodySmall" style={styles.summaryLabel}>Bathroom</Text>
            <Text variant="titleMedium" style={[styles.summaryValue, { color: '#F9A825' }]}>
              {todaySummary.bathroomVisits}
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtext}>
              visits today
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons name="heart-pulse" size={32} color="#D32F2F" />
            <Text variant="bodySmall" style={styles.summaryLabel}>Vitals</Text>
            <Text variant="titleMedium" style={[styles.summaryValue, { color: '#D32F2F' }]}>
              {patient.vitals?.heartRate || '--'}
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtext}>
              BPM
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Weekly Overview Charts */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>Weekly Sleep Pattern</Text>
          {patientSleepData.length > 0 ? (
            <LineChart
              data={getSleepChartData()}
              width={chartWidth - 32}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          ) : (
            <Text style={styles.noDataText}>No sleep data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>Weekly Mood Tracking</Text>
          {patientMoodData.length > 0 ? (
            <LineChart
              data={getMoodChartData()}
              width={chartWidth - 32}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`
              }}
              style={styles.chart}
              bezier
            />
          ) : (
            <Text style={styles.noDataText}>No mood data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>Weekly Physical Activity</Text>
          {patientActivityData.length > 0 ? (
            <BarChart
              data={getActivityChartData()}
              width={chartWidth - 32}
              height={200}
              yAxisLabel=""
              yAxisSuffix="min"
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`
              }}
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>No activity data available</Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderSleepTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Sleep Overview</Text>
            <Button 
              mode="outlined" 
              compact
              onPress={() => navigation.navigate('AddSleepData', { patient })}
            >
              Add Entry
            </Button>
          </View>
          
          {todaySummary.sleep ? (
            <View style={styles.sleepDetailsContainer}>
              <View style={styles.sleepDetailRow}>
                <Text variant="bodyMedium">Bedtime:</Text>
                <Text variant="bodyMedium">
                  {new Date(todaySummary.sleep.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.sleepDetailRow}>
                <Text variant="bodyMedium">Wake time:</Text>
                <Text variant="bodyMedium">
                  {new Date(todaySummary.sleep.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.sleepDetailRow}>
                <Text variant="bodyMedium">Total sleep:</Text>
                <Text variant="bodyMedium">{todaySummary.sleep.totalSleepHours} hours</Text>
              </View>
              <View style={styles.sleepDetailRow}>
                <Text variant="bodyMedium">Quality:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <MaterialCommunityIcons 
                      key={star}
                      name={star <= todaySummary.sleep!.sleepQuality ? "star" : "star-outline"}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>No sleep data for today</Text>
          )}
        </Card.Content>
      </Card>

      {/* Sleep Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>7-Day Sleep Pattern</Text>
          {patientSleepData.length > 0 ? (
            <LineChart
              data={getSleepChartData()}
              width={chartWidth - 32}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          ) : (
            <Text style={styles.noDataText}>No sleep data available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Recent Sleep Entries */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recent Sleep Entries</Text>
          {patientSleepData.slice(0, 5).map((sleep, index) => (
            <View key={sleep.id} style={styles.entryItem}>
              <View style={styles.entryHeader}>
                <Text variant="bodyMedium" style={styles.entryDate}>
                  {new Date(sleep.date).toLocaleDateString()}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <MaterialCommunityIcons 
                      key={star}
                      name={star <= sleep.sleepQuality ? "star" : "star-outline"}
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text variant="bodySmall" style={styles.entryDetails}>
                {sleep.totalSleepHours}h sleep • 
                Bed: {new Date(sleep.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                Wake: {new Date(sleep.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {sleep.notes && (
                <Text variant="bodySmall" style={styles.entryNotes}>{sleep.notes}</Text>
              )}
              {index < patientSleepData.slice(0, 5).length - 1 && <Divider style={styles.entryDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {patient.fullName}
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Age {patient.age} • Patient Overview
          </Text>
        </View>
        <IconButton
          icon="cog"
          onPress={() => navigation.navigate('PatientSettings', { patient })}
        />
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'view-dashboard' },
          { key: 'sleep', label: 'Sleep', icon: 'sleep' },
          { key: 'mood', label: 'Mood', icon: 'emoticon-happy' },
          { key: 'diet', label: 'Diet', icon: 'food-apple' },
          { key: 'activity', label: 'Activity', icon: 'walk' }
        ].map(tab => (
          <Chip
            key={tab.key}
            selected={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={[styles.tabChip, activeTab === tab.key && styles.activeTabChip]}
            textStyle={activeTab === tab.key && styles.activeTabText}
            icon={tab.icon}
          >
            {tab.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sleep' && renderSleepTab()}
        {/* Add other tabs as needed */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSubtitle: {
    opacity: 0.7,
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 50,
  },
  tabChip: {
    marginRight: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  activeTabChip: {
    backgroundColor: '#6200ee',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  summaryCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryLabel: {
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  chartCard: {
    marginVertical: 8,
    elevation: 2,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  sleepDetailsContainer: {
    marginTop: 8,
  },
  sleepDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  entryItem: {
    paddingVertical: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryDate: {
    fontWeight: 'bold',
  },
  entryDetails: {
    opacity: 0.7,
    marginBottom: 4,
  },
  entryNotes: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  entryDivider: {
    marginTop: 12,
  },
  bottomPadding: {
    height: 80,
  },
});
