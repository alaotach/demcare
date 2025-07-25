import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Switch,
  Chip,
  Surface,
  IconButton,
  FAB,
  Dialog,
  Portal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';

import { usePatientStore } from '../store/patientStore';

const { width } = Dimensions.get('window');

interface CameraStream {
  id: string;
  patientId: string;
  patientName: string;
  ipAddress: string;
  isActive: boolean;
  lastUpdated: Date;
  status: 'online' | 'offline' | 'error';
}

export default function EnhancedCameraFeedScreen() {
  const theme = useTheme();
  const { patients } = usePatientStore();

  const [cameraStreams, setCameraStreams] = useState<CameraStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<CameraStream | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [addCameraDialogVisible, setAddCameraDialogVisible] = useState(false);
  const [newCameraData, setNewCameraData] = useState({
    patientId: '',
    ipAddress: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadCameraStreams();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        checkCameraStatuses();
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadCameraStreams = () => {
    // Simulate loading camera streams
    const mockStreams: CameraStream[] = patients.map((patient, index) => ({
      id: `cam-${patient.id}`,
      patientId: patient.id,
      patientName: patient.fullName,
      ipAddress: `192.168.1.${100 + index}:8080`,
      isActive: Math.random() > 0.3,
      lastUpdated: new Date(),
      status: Math.random() > 0.2 ? 'online' : 'offline',
    }));
    
    setCameraStreams(mockStreams);
  };

  const checkCameraStatuses = () => {
    setCameraStreams(streams => 
      streams.map(stream => ({
        ...stream,
        status: Math.random() > 0.2 ? 'online' : 'offline',
        lastUpdated: new Date(),
      }))
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadCameraStreams();
    setRefreshing(false);
  };

  const toggleCameraStream = (streamId: string) => {
    setCameraStreams(streams =>
      streams.map(stream =>
        stream.id === streamId
          ? { ...stream, isActive: !stream.isActive }
          : stream
      )
    );
  };

  const addNewCamera = () => {
    if (!newCameraData.patientId || !newCameraData.ipAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const patient = patients.find(p => p.id === newCameraData.patientId);
    if (!patient) {
      Alert.alert('Error', 'Patient not found');
      return;
    }

    const newStream: CameraStream = {
      id: `cam-${Date.now()}`,
      patientId: newCameraData.patientId,
      patientName: patient.fullName,
      ipAddress: newCameraData.ipAddress,
      isActive: true,
      lastUpdated: new Date(),
      status: 'online',
    };

    setCameraStreams(streams => [...streams, newStream]);
    setNewCameraData({ patientId: '', ipAddress: '' });
    setAddCameraDialogVisible(false);
    Alert.alert('Success', 'Camera stream added successfully');
  };

  const removeCamera = (streamId: string) => {
    Alert.alert(
      'Remove Camera',
      'Are you sure you want to remove this camera stream?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCameraStreams(streams => streams.filter(s => s.id !== streamId));
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="camera" size={28} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Camera Feeds
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {cameraStreams.filter(s => s.status === 'online').length} of {cameraStreams.length} cameras online
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              iconColor="#FFFFFF"
              size={24}
              onPress={handleRefresh}
            />
            <View style={styles.autoRefreshContainer}>
              <Text style={styles.autoRefreshLabel}>Auto</Text>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                thumbColor="#FFFFFF"
                trackColor={{ true: 'rgba(255, 255, 255, 0.3)', false: 'rgba(255, 255, 255, 0.1)' }}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderCameraGrid = () => {
    if (selectedStream && isFullScreen) {
      return renderFullScreenCamera();
    }

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {cameraStreams.map((stream) => renderCameraCard(stream))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  const renderCameraCard = (stream: CameraStream) => (
    <Card key={stream.id} style={styles.cameraCard}>
      <Card.Content style={styles.cameraCardContent}>
        <View style={styles.cameraHeader}>
          <Text variant="titleMedium" style={styles.patientName}>
            {stream.patientName}
          </Text>
          <View style={styles.cameraActions}>
            <Chip
              icon="circle"
              textStyle={{ fontSize: 12 }}
              style={[
                styles.statusChip,
                {
                  backgroundColor: stream.status === 'online' 
                    ? theme.colors.primaryContainer 
                    : stream.status === 'offline'
                    ? theme.colors.errorContainer
                    : theme.colors.surfaceVariant,
                },
              ]}
            >
              {stream.status.toUpperCase()}
            </Chip>
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                Alert.alert(
                  'Camera Options',
                  'Choose an action',
                  [
                    { text: 'Settings', onPress: () => {} },
                    { text: 'Remove', onPress: () => removeCamera(stream.id) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            />
          </View>
        </View>

        <View style={styles.cameraContainer}>
          {stream.status === 'online' && stream.isActive ? (
            <WebView
              source={{ uri: `http://${stream.ipAddress}/video_feed` }}
              style={styles.cameraView}
              onError={() => {
                setCameraStreams(streams =>
                  streams.map(s =>
                    s.id === stream.id ? { ...s, status: 'error' } : s
                  )
                );
              }}
            />
          ) : (
            <View style={[styles.cameraView, styles.offlineView]}>
              <MaterialCommunityIcons
                name={stream.status === 'offline' ? 'camera-off' : 'alert-circle'}
                size={48}
                color={theme.colors.outline}
              />
              <Text variant="bodyMedium" style={styles.offlineText}>
                {stream.status === 'offline' ? 'Camera Offline' : 'Connection Error'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cameraFooter}>
          <Text variant="bodySmall" style={styles.ipAddress}>
            {stream.ipAddress}
          </Text>
          <View style={styles.cameraControls}>
            <IconButton
              icon={isFullScreen ? 'fullscreen-exit' : 'fullscreen'}
              size={20}
              disabled={stream.status !== 'online' || !stream.isActive}
              onPress={() => {
                setSelectedStream(stream);
                setIsFullScreen(true);
              }}
            />
            <Switch
              value={stream.isActive}
              onValueChange={() => toggleCameraStream(stream.id)}
              disabled={stream.status !== 'online'}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFullScreenCamera = () => {
    if (!selectedStream) return null;

    return (
      <View style={styles.fullScreenContainer}>
        <Surface style={styles.fullScreenHeader} elevation={4}>
          <View style={styles.fullScreenHeaderContent}>
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              size={24}
              onPress={() => {
                setIsFullScreen(false);
                setSelectedStream(null);
              }}
            />
            <Text variant="titleLarge" style={styles.fullScreenTitle}>
              {selectedStream.patientName}
            </Text>
            <Chip
              icon="circle"
              style={[
                styles.statusChip,
                {
                  backgroundColor: selectedStream.status === 'online' 
                    ? theme.colors.primaryContainer 
                    : theme.colors.errorContainer,
                },
              ]}
            >
              {selectedStream.status.toUpperCase()}
            </Chip>
          </View>
        </Surface>

        <View style={styles.fullScreenVideoContainer}>
          {selectedStream.status === 'online' && selectedStream.isActive ? (
            <WebView
              source={{ uri: `http://${selectedStream.ipAddress}/video_feed` }}
              style={styles.fullScreenVideo}
              onError={() => {
                Alert.alert('Connection Error', 'Failed to load camera feed');
                setIsFullScreen(false);
                setSelectedStream(null);
              }}
            />
          ) : (
            <View style={[styles.fullScreenVideo, styles.offlineView]}>
              <MaterialCommunityIcons
                name="camera-off"
                size={80}
                color={theme.colors.outline}
              />
              <Text variant="headlineSmall" style={styles.offlineText}>
                Camera Offline
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderCameraGrid()}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddCameraDialogVisible(true)}
      />

      {/* Add Camera Dialog */}
      <Portal>
        <Dialog visible={addCameraDialogVisible} onDismiss={() => setAddCameraDialogVisible(false)}>
          <Dialog.Title>Add Camera Stream</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Select a patient and enter the camera IP address
            </Text>
            
            <TextInput
              label="Patient"
              value={patients.find(p => p.id === newCameraData.patientId)?.fullName || ''}
              onPress={() => {
                Alert.alert(
                  'Select Patient',
                  'Choose a patient for this camera',
                  patients.map(patient => ({
                    text: patient.fullName,
                    onPress: () => setNewCameraData(prev => ({ ...prev, patientId: patient.id })),
                  }))
                );
              }}
              mode="outlined"
              style={{ marginBottom: 16 }}
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
            />
            
            <TextInput
              label="IP Address"
              value={newCameraData.ipAddress}
              onChangeText={(text) => setNewCameraData(prev => ({ ...prev, ipAddress: text }))}
              mode="outlined"
              placeholder="192.168.1.100:8080"
              style={{ marginBottom: 8 }}
            />
            <HelperText type="info">
              Enter the camera's IP address and port (e.g., 192.168.1.100:8080)
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddCameraDialogVisible(false)}>Cancel</Button>
            <Button onPress={addNewCamera}>Add Camera</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  autoRefreshLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginRight: 4,
  },
  gridContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cameraCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    elevation: 3,
  },
  cameraCardContent: {
    padding: 12,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    flex: 1,
    fontWeight: 'bold',
  },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: 8,
  },
  cameraContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cameraView: {
    height: 120,
    backgroundColor: '#000',
  },
  offlineView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  offlineText: {
    marginTop: 8,
    textAlign: 'center',
  },
  cameraFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ipAddress: {
    flex: 1,
    opacity: 0.7,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenHeader: {
    borderRadius: 0,
  },
  fullScreenHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullScreenTitle: {
    flex: 1,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  fullScreenVideoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenVideo: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  bottomPadding: {
    height: 80,
  },
});
