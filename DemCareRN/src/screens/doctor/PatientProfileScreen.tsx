import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  useTheme,
  FAB,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Patient, PatientStatus, VitalSigns } from '../../types';
import { usePatientStore } from '../../store/patientStore';

interface Props {
  navigation: any;
  route: {
    params: {
      patient: Patient;
    };
  };
}

export default function PatientProfileScreen({ navigation, route }: Props) {
  const { patient: initialPatient } = route.params;
  const theme = useTheme();
  const { selectedPatient, selectPatient, vitals, fetchVitalsHistory } = usePatientStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const patient = selectedPatient || initialPatient;

  useEffect(() => {
    selectPatient(initialPatient);
    loadVitalsHistory();
  }, [initialPatient.id]);

  const loadVitalsHistory = async () => {
    setLoading(true);
    try {
      await fetchVitalsHistory(initialPatient.id);
    } catch (error) {
      console.error('Failed to load vitals history:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const patientVitals = vitals[patient.id] || [];
  const screenWidth = Dimensions.get('window').width;

  // Prepare chart data
  const getChartData = (vitalType: 'heartRate' | 'oxygenSaturation' | 'respiratoryRate') => {
    const data = patientVitals.slice(0, 10).reverse(); // Last 10 readings
    
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
      labels: data.map((_, index) => `${index + 1}`),
      datasets: [{
        data: data.map(vital => vital[vitalType]),
        strokeWidth: 2,
        color: () => theme.colors.primary
      }]
    };
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Patient Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.patientInfo}>
                <Text variant="headlineSmall" style={styles.patientName}>
                  {patient.fullName}
                </Text>
                <Text variant="bodyMedium" style={styles.patientDetails}>
                  Age: {patient.age} • Height: {patient.height}cm • Weight: {patient.weight}kg
                </Text>
                <Text variant="bodyMedium" style={styles.caregiverContact}>
                  Caregiver: {patient.caregiverContactNumber}
                </Text>
              </View>
              <Chip 
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(patient.status) }]}
                textStyle={{ color: getStatusColor(patient.status) }}
              >
                {getStatusText(patient.status)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Current Vitals Card */}
        {patient.vitals && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Current Vitals
              </Text>
              <View style={styles.vitalsGrid}>
                <View style={styles.vitalCard}>
                  <Text variant="bodySmall" style={styles.vitalLabel}>Heart Rate</Text>
                  <Text variant="headlineSmall" style={styles.vitalValue}>
                    {patient.vitals.heartRate}
                  </Text>
                  <Text variant="bodySmall" style={styles.vitalUnit}>bpm</Text>
                </View>
                <View style={styles.vitalCard}>
                  <Text variant="bodySmall" style={styles.vitalLabel}>Oxygen Saturation</Text>
                  <Text variant="headlineSmall" style={styles.vitalValue}>
                    {patient.vitals.oxygenSaturation}
                  </Text>
                  <Text variant="bodySmall" style={styles.vitalUnit}>%</Text>
                </View>
                <View style={styles.vitalCard}>
                  <Text variant="bodySmall" style={styles.vitalLabel}>Respiratory Rate</Text>
                  <Text variant="headlineSmall" style={styles.vitalValue}>
                    {patient.vitals.respiratoryRate}
                  </Text>
                  <Text variant="bodySmall" style={styles.vitalUnit}>breaths/min</Text>
                </View>
                <View style={styles.vitalCard}>
                  <Text variant="bodySmall" style={styles.vitalLabel}>Step Count</Text>
                  <Text variant="headlineSmall" style={styles.vitalValue}>
                    {patient.vitals.stepCount}
                  </Text>
                  <Text variant="bodySmall" style={styles.vitalUnit}>steps</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Charts */}
        {patientVitals.length > 0 && (
          <>
            {/* Heart Rate Chart */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.chartTitle}>
                  Heart Rate Trend
                </Text>
                <LineChart
                  data={getChartData('heartRate')}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>

            {/* Oxygen Saturation Chart */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.chartTitle}>
                  Oxygen Saturation Trend
                </Text>
                <LineChart
                  data={getChartData('oxygenSaturation')}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>

            {/* Respiratory Rate Chart */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.chartTitle}>
                  Respiratory Rate Trend
                </Text>
                <LineChart
                  data={getChartData('respiratoryRate')}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          </>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} size="large" />
            <Text style={styles.loadingText}>Loading vitals history...</Text>
          </View>
        )}

        {patientVitals.length === 0 && !loading && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.noDataText}>
                No vitals data available for this patient yet.
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="pencil"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsEditing(true)}
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patientDetails: {
    opacity: 0.7,
    marginBottom: 4,
  },
  caregiverContact: {
    opacity: 0.7,
  },
  statusChip: {
    marginLeft: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  vitalLabel: {
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
  vitalValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  vitalUnit: {
    opacity: 0.7,
    marginTop: 2,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  noDataText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 20,
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
