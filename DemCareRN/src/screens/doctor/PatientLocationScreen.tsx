import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, FlatList, RefreshControl, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  useTheme, 
  ActivityIndicator, 
  IconButton, 
  Chip, 
  Surface, 
  TextInput, 
  Button,
  Portal,
  Modal,
  Divider,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-paper';
import { usePatientStore } from '../../store/patientStore';
import { BeaconService, PatientLocation } from '../../services/beacon';
import MaterialIcon from '../../components/MaterialIcon';
import { ConfigService } from '../../services/config';
import { mockPatientLocations } from '../../services/mockData';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function PatientLocationScreen({ navigation }: Props) {
  const theme = useTheme();
  const { patients } = usePatientStore();
  
  const [patientLocations, setPatientLocations] = useState<PatientLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverIp, setServerIp] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeScreen();
    return () => {
      if (autoRefreshInterval.current) {
        BeaconService.stopAutoRefresh(autoRefreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Restart auto-refresh when patients change
    if (patients.length > 0) {
      startAutoRefresh();
    }
  }, [patients]);

  const initializeScreen = async () => {
    try {
      const currentIp = await BeaconService.getServerIp();
      setServerIp(currentIp);
      
      await loadPatientLocations();
      await testServerConnection();
      startAutoRefresh();
    } catch (error) {
      console.error('Error initializing screen:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientLocations = async () => {
    try {
      if (ConfigService.isMockModeEnabled()) {
        // Use comprehensive mock patient location data
        setPatientLocations(mockPatientLocations);
        setConnectionStatus('connected');
      } else {
        const locations = await BeaconService.getPatientLocations(patients);
        setPatientLocations(locations);
      }
    } catch (error) {
      console.error('Error loading patient locations:', error);
      Alert.alert('Error', 'Failed to load patient locations');
    }
  };

  const testServerConnection = async () => {
    setConnectionStatus('testing');
    const isConnected = await BeaconService.testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  const startAutoRefresh = () => {
    if (autoRefreshInterval.current) {
      BeaconService.stopAutoRefresh(autoRefreshInterval.current);
    }

    if (ConfigService.isMockModeEnabled()) {
      // In mock mode, just simulate periodic updates
      autoRefreshInterval.current = setInterval(() => {
        setPatientLocations([...mockPatientLocations]); // Force re-render with fresh array
        setConnectionStatus('connected');
      }, 2000);
    } else {
      autoRefreshInterval.current = BeaconService.startAutoRefresh(
        (locations) => {
          setPatientLocations(locations);
          setConnectionStatus('connected');
        },
        patients,
        2000 // Refresh every 2 seconds
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientLocations();
    await testServerConnection();
    setRefreshing(false);
  };

  const handleServerIpSave = async () => {
    try {
      setConnectionStatus('testing');
      const isConnected = await BeaconService.testConnection(serverIp);
      
      if (isConnected) {
        await BeaconService.setServerIp(serverIp);
        setConnectionStatus('connected');
        setShowServerSettings(false);
        Alert.alert('Success', 'Server IP updated successfully');
        startAutoRefresh();
      } else {
        setConnectionStatus('disconnected');
        Alert.alert('Connection Failed', 'Unable to connect to the beacon server. Please check the IP address and ensure the server is running.');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      Alert.alert('Error', 'Failed to update server IP');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return '#4CAF50';
      case 'OUT_OF_RANGE':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return 'check-circle';
      case 'OUT_OF_RANGE':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_RANGE':
        return 'In Range';
      case 'OUT_OF_RANGE':
        return 'Out of Range';
      default:
        return 'Unknown';
    }
  };

  const renderPatientLocationCard = ({ item }: { item: PatientLocation }) => (
    <Card style={styles.patientCard} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <Text variant="titleMedium" style={styles.patientName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.rfidText}>
              RFID: {item.rfidMac || 'Not configured'}
            </Text>
          </View>
          <Chip
            icon={getStatusIcon(item.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
            mode="flat"
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.lastSeenContainer}>
            <MaterialIcon source="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={styles.lastSeenText}>
              Last seen: {new Date(item.lastSeen).toLocaleString()}
            </Text>
          </View>
          <IconButton
            icon="account-details"
            size={20}
            onPress={() => {
              const patient = patients.find(p => p.id === item.id);
              if (patient) {
                navigation.navigate('PatientProfile', { patient });
              }
            }}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcon source="account-search" size={64} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Patients Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Add patients to start monitoring their locations
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddPatient')}
        style={styles.addPatientButton}
        icon="plus"
      >
        Add Patient
      </Button>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading patient locations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
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
            <Icon source="map-marker-multiple" size={32} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Patient Locations
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Real-time RFID tracking
              </Text>
            </View>
            <Chip
              icon={
                connectionStatus === 'connected' ? 'wifi' : connectionStatus === 'connecting' ? 'wifi-settings' : 'wifi-off'
              }
              textStyle={{ 
                color: connectionStatus === 'connected' ? '#4CAF50' : '#F44336',
                fontSize: 10,
                fontWeight: 'bold'
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: connectionStatus === 'connected' ? '#4CAF50' : '#F44336',
                borderWidth: 1,
              }}
            >
              {connectionStatus.toUpperCase()}
            </Chip>
          </View>
        </LinearGradient>
      </Surface>

      {/* Patient Locations List */}
      <FlatList
        data={patientLocations}
        renderItem={renderPatientLocationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Server Settings Modal */}
      <Portal>
        <Modal
          visible={showServerSettings}
          onDismiss={() => setShowServerSettings(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <MaterialIcon source="server" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.modalTitle}>
                Beacon Server Settings
              </Text>
              <IconButton
                icon="close"
                onPress={() => setShowServerSettings(false)}
                style={styles.modalClose}
              />
            </View>

            <Divider style={styles.modalDivider} />

            <View style={styles.modalBody}>
              <Text variant="bodyMedium" style={styles.modalDescription}>
                Configure the IP address of your Raspberry Pi beacon server
              </Text>

              <TextInput
                label="Server IP Address"
                value={serverIp}
                onChangeText={setServerIp}
                mode="outlined"
                style={styles.serverInput}
                placeholder="192.168.1.100"
                left={<TextInput.Icon icon="server-network" />}
              />

              <List.Section>
                <List.Subheader>Connection Info</List.Subheader>
                <List.Item
                  title="Port"
                  description="5000"
                  left={props => <List.Icon {...props} icon="ethernet" />}
                />
                <List.Item
                  title="Endpoint"
                  description="/get_status"
                  left={props => <List.Icon {...props} icon="api" />}
                />
                <List.Item
                  title="Status"
                  description={
                    connectionStatus === 'connected' ? 'Connected' :
                    connectionStatus === 'testing' ? 'Testing connection...' : 'Disconnected'
                  }
                  left={props => <List.Icon {...props} icon={
                    connectionStatus === 'connected' ? 'check-circle' :
                    connectionStatus === 'testing' ? 'loading' : 'alert-circle'
                  } />}
                />
              </List.Section>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowServerSettings(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleServerIpSave}
                style={styles.modalButton}
                loading={connectionStatus === 'testing'}
                disabled={connectionStatus === 'testing'}
              >
                Save & Test
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  headerSurface: {
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
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
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  connectionChip: {
    marginRight: 8,
  },
  connectionChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  patientCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  rfidText: {
    opacity: 0.7,
  },
  statusChip: {
    marginLeft: 12,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSeenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lastSeenText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  addPatientButton: {
    marginTop: 8,
  },
  modalContainer: {
    margin: 20,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '600',
  },
  modalClose: {
    margin: 0,
  },
  modalDivider: {
    marginHorizontal: 20,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    marginBottom: 20,
    opacity: 0.7,
    textAlign: 'center',
  },
  serverInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    minWidth: 80,
  },
});
