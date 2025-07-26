import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  RefreshControl 
} from 'react-native';
import { 
  Text, 
  Card, 
  ActivityIndicator, 
  useTheme,
  Surface,
  Chip,
  Badge,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { Patient, PatientStatus } from '../../types';
import { usePatientStore } from '../../store/patientStore';
import { useAuthStore } from '../../store/authStore';

interface Props {
  navigation: any;
  route: {
    params: {
      title: string;
      nextScreen: string;
    };
  };
}

export default function PatientSelectorScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { patients, isLoading, fetchPatients } = usePatientStore();
  const [refreshing, setRefreshing] = useState(false);

  const { title, nextScreen } = route.params;

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

  const handlePatientSelect = (patient: Patient) => {
    navigation.navigate(nextScreen, {
      patientId: patient.id,
      patientName: patient.fullName,
    });
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <MaterialCommunityIcons name="account-multiple" size={32} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              {title}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Select a patient to continue
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderPatientCard = ({ item: patient }: { item: Patient }) => (
    <Card 
      style={styles.patientCard}
      onPress={() => handlePatientSelect(patient)}
    >
      <Card.Content>
        <View style={styles.patientCardContent}>
          <View style={styles.patientInfo}>
            <View style={styles.patientNameRow}>
              <Text variant="titleMedium" style={styles.patientName}>
                {patient.fullName}
              </Text>
              <Badge
                style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) }]}
                size={8}
              />
            </View>
            <Text variant="bodySmall" style={styles.patientDetails}>
              Age: {patient.age} • RFID: {patient.rfidMacAddress}
            </Text>
            <Text variant="bodySmall" style={styles.patientContact}>
              Contact: {patient.caregiverContactNumber}
            </Text>
          </View>
          <View style={styles.patientStatus}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(patient.status) + '20' }]}
              textStyle={{ color: getStatusColor(patient.status), fontSize: 12 }}
            >
              {getStatusText(patient.status)}
            </Chip>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.outline}
              style={styles.chevron}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>Loading patients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      {patients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-off" size={64} color={theme.colors.outline} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Patients Found
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Add patients to your dashboard to continue
          </Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatientCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingTop: 74,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  patientCard: {
    marginBottom: 12,
    elevation: 2,
  },
  patientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 4,
  },
  patientDetails: {
    opacity: 0.7,
    marginBottom: 4,
  },
  patientContact: {
    opacity: 0.7,
  },
  patientStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 8,
  },
  chevron: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
