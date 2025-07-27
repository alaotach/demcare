import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Surface, 
  Text, 
  useTheme, 
  Card,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';

interface Props {
  navigation: any;
}

export default function SimplifiedDoctorDashboard({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, fetchPatients, isLoading } = usePatientStore();

  useEffect(() => {
    console.log('SimplifiedDoctorDashboard mounted');
    console.log('User:', user);
    console.log('Patients:', patients);
    
    if (user?.id) {
      fetchPatients(user.id);
    }
  }, [user]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Surface style={styles.header} elevation={4}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Doctor Dashboard
          </Text>
          <Text variant="bodyMedium" style={styles.welcomeText}>
            Welcome back, Dr. {user?.fullName || 'Doctor'}
          </Text>
        </Surface>

        {/* Content */}
        <View style={styles.content}>
          {/* Stats Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Quick Stats
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statValue}>
                    {patients.length}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Total Patients
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statValue}>
                    3
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Critical Alerts
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineSmall" style={styles.statValue}>
                    18
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Active Monitoring
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Recent Patients */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Recent Patients
              </Text>
              {patients.length > 0 ? (
                patients.slice(0, 3).map((patient, index) => (
                  <View key={index} style={styles.patientItem}>
                    <Text variant="bodyMedium" style={styles.patientName}>
                      {patient.fullName}
                    </Text>
                    <Text variant="bodySmall" style={styles.patientAge}>
                      Age: {patient.age}
                    </Text>
                  </View>
                ))
              ) : (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No patients found. Try adding a patient first.
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Quick Actions
              </Text>
              <View style={styles.actionsRow}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('AddPatient')}
                  style={styles.actionButton}
                >
                  Add Patient
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => {}}
                  style={styles.actionButton}
                >
                  View Reports
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Test Swipe Hint */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Navigation
              </Text>
              <Text variant="bodyMedium" style={styles.hintText}>
                ← Swipe left to access Camera Feed
              </Text>
              <Text variant="bodyMedium" style={styles.hintText}>
                → Swipe right from Settings to come back here
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  patientItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  patientName: {
    fontWeight: 'bold',
  },
  patientAge: {
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  hintText: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
});
