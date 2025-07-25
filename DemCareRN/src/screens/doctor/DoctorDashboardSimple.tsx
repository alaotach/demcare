import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  FAB, 
  useTheme,
  Searchbar,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { Patient, PatientStatus } from '../../types';

interface Props {
  navigation: any;
}

export default function DoctorDashboard({ navigation }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, isLoading, fetchPatients } = usePatientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPatientCard = (patient: Patient) => (
    <Card 
      key={patient.id} 
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientProfile', { patient })}
    >
      <Card.Content>
        <Text variant="titleMedium" style={styles.patientName}>
          {patient.fullName}
        </Text>
        <Text style={styles.patientAge}>
          Age: {patient.age}
        </Text>
      </Card.Content>
    </Card>
  );

  if (isLoading && patients.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.welcomeText}>
          Welcome, Dr. {user?.fullName?.split(' ')[0]}
        </Text>
        <Text style={styles.headerSubtext}>
          {patients.length} patient{patients.length !== 1 ? 's' : ''} under your care
        </Text>
      </View>

      <Searchbar
        placeholder="Search patients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.patientsContainer}>
          {filteredPatients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No patients found' 
                  : 'No patients added yet. Start by adding your first patient.'
                }
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
            filteredPatients.map(renderPatientCard)
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddPatient')}
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
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontWeight: 'bold',
  },
  headerSubtext: {
    opacity: 0.7,
    marginTop: 4,
  },
  searchbar: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  patientsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  patientCard: {
    marginBottom: 16,
    elevation: 2,
  },
  patientName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  patientAge: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  addFirstPatientButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
