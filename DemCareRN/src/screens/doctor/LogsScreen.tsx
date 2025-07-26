import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  useTheme,
  Chip,
  IconButton,
  Snackbar,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { usePatientStore } from '../../store/patientStore';
import { BeaconService } from '../../services/beacon';
import { PatientStatus } from '../../types';

export default function LogsScreen() {
  const theme = useTheme();
  const { patients } = usePatientStore();
  const [beaconStatus, setBeaconStatus] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchBeaconStatus();
    
    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      fetchBeaconStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [patients]);

  const fetchBeaconStatus = async () => {
    try {
      const locations = await BeaconService.getPatientLocations(patients);
      const updatedStatus: Record<string, string> = {};

      // Convert PatientLocation array to status record
      locations.forEach(location => {
        updatedStatus[location.name] = location.status;
      });

      // Also fetch raw beacon status for unknown devices
      try {
        const rawStatus = await BeaconService.fetchBeaconStatus();
        
        // Handle unknown devices
        Object.entries(rawStatus).forEach(([key, deviceStatus]) => {
          const matchedPatient = patients.find(p => 
            p.fullName === key || p.rfidMacAddress === key
          );
          if (!matchedPatient && !key.includes('Unknown Device')) {
            updatedStatus[`Unknown Device (${key})`] = deviceStatus;
          }
        });
      } catch (error) {
        console.log('Could not fetch raw beacon status:', error);
      }

      setBeaconStatus(updatedStatus);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching beacon status:', error);
      setSnackbarMessage('Failed to fetch beacon status');
      setSnackbarVisible(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBeaconStatus();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return 'check-circle';
      case 'OUT_OF_RANGE':
        return 'alert-circle';
      case 'OFFLINE':
        return 'wifi-off';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return theme.colors.primary;
      case 'OUT_OF_RANGE':
        return theme.colors.error;
      case 'OFFLINE':
        return theme.colors.outline;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return 'In Range';
      case 'OUT_OF_RANGE':
        return 'Out of Range';
      case 'OFFLINE':
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
      >
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="file-document-multiple" size={32} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Patient Logs
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Real-time patient monitoring
            </Text>
          </View>
          <IconButton
            icon="refresh"
            iconColor="#FFFFFF"
            size={24}
            onPress={fetchBeaconStatus}
          />
        </View>
      </LinearGradient>
    </Surface>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}

        {/* Status Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Status Summary
            </Text>
            {lastUpdated && (
              <Text variant="bodySmall" style={styles.lastUpdated}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
            
            <View style={styles.statusChips}>
              <Chip 
                icon="check-circle"
                textStyle={{ color: theme.colors.primary }}
                style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
              >
                In Range: {Object.values(beaconStatus).filter(s => s === 'IN_RANGE').length}
              </Chip>
              <Chip 
                icon="alert-circle"
                textStyle={{ color: theme.colors.error }}
                style={[styles.chip, { backgroundColor: theme.colors.errorContainer }]}
              >
                Out of Range: {Object.values(beaconStatus).filter(s => s === 'OUT_OF_RANGE').length}
              </Chip>
              <Chip 
                icon="wifi-off"
                textStyle={{ color: theme.colors.outline }}
                style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                Offline: {Object.values(beaconStatus).filter(s => s === 'OFFLINE').length}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Patient Status List */}
        <Card style={styles.listCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.listTitle}>
              Patient Status
            </Text>
            
            {Object.entries(beaconStatus).length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No beacon data available
                </Text>
                <Text variant="bodySmall" style={styles.emptySubtext}>
                  Make sure patients have RFID devices assigned
                </Text>
              </View>
            ) : (
              Object.entries(beaconStatus).map(([patientName, status], index) => (
                <List.Item
                  key={index}
                  title={patientName}
                  description={`Status: ${getStatusLabel(status)}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={getStatusIcon(status)}
                      color={getStatusColor(status)}
                    />
                  )}
                  right={(props) => (
                    <View style={styles.statusContainer}>
                      <Chip
                        mode="outlined"
                        textStyle={{ 
                          color: getStatusColor(status),
                          fontSize: 12
                        }}
                        style={[
                          styles.statusChip,
                          { borderColor: getStatusColor(status) }
                        ]}
                      >
                        {getStatusLabel(status)}
                      </Chip>
                    </View>
                  )}
                  style={styles.listItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Patient Count Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              Patient Information
            </Text>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">Total Patients: {patients.length}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">
                Patients with RFID: {patients.filter(p => p.rfidMacAddress).length}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium">
                Active Monitoring: {Object.keys(beaconStatus).length}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
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
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    elevation: 2,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    opacity: 0.7,
    marginBottom: 12,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  listCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  listTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  statusContainer: {
    justifyContent: 'center',
  },
  statusChip: {
    height: 28,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
