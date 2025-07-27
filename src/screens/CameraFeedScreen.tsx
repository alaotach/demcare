import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions, RefreshControl, Animated } from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Text, 
  useTheme, 
  ActivityIndicator,
  IconButton,
  Chip,
  Snackbar,
  List,
  Divider,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

interface CameraPreset {
  name: string;
  url: string;
  description: string;
}

export default function CameraFeedScreen() {
  const theme = useTheme();
  const [ipAddress, setIpAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cameraStatus, setCameraStatus] = useState<any>(null);
  const [showPresets, setShowPresets] = useState(false);

  // Predefined camera presets
  const cameraPresets: CameraPreset[] = [
    {
      name: 'DemCare Camera Server',
      url: '192.168.1.100:5000/video',
      description: 'Local laptop camera via Python server'
    },
    {
      name: 'IP Camera (Port 8080)',
      url: '192.168.1.100:8080/video',
      description: 'Standard IP camera stream'
    },
    {
      name: 'RTSP Camera',
      url: '192.168.1.100:554/stream',
      description: 'RTSP video stream'
    }
  ];

  useEffect(() => {
    // Auto-detect local camera server
    detectLocalCameraServer();
  }, []);

  const detectLocalCameraServer = async () => {
    // Try to detect DemCare camera server on local network
    const commonIPs = ['192.168.1.', '192.168.0.', '10.0.0.'];
    
    for (let subnet of commonIPs) {
      for (let i = 100; i <= 110; i++) {
        const testIP = `${subnet}${i}`;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          
          const response = await fetch(`http://${testIP}:5000/api/status`, { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const status = await response.json();
            setCameraStatus(status);
            setIpAddress(`${testIP}:5000/video`);
            showSnackbar(`Camera server detected at ${testIP}:5000`);
            break;
          }
        } catch (error) {
          // Continue searching
        }
      }
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const validateIpAddress = (ip: string): boolean => {
    // Basic validation for IP:PORT/path format
    const pattern = /^(\d{1,3}\.){3}\d{1,3}:\d+\/\w+$/;
    return pattern.test(ip) || ip.includes('localhost') || ip.includes('127.0.0.1');
  };

  const connectToCamera = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Error', 'Please enter a valid camera URL');
      return;
    }

    if (!validateIpAddress(ipAddress)) {
      Alert.alert('Invalid Format', 'Please use format: IP:PORT/path\nExample: 192.168.1.100:5000/video');
      return;
    }

    setLoading(true);
    setConnectionStatus('connecting');

    try {
      // Test connection to the camera
      const baseUrl = ipAddress.replace('/video', '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://${baseUrl}/api/status`, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const status = await response.json();
        setCameraStatus(status);
        setIsConnected(true);
        setConnectionStatus('connected');
        showSnackbar('Successfully connected to camera');
      } else {
        throw new Error('Camera not responding');
      }
    } catch (error) {
      setConnectionStatus('error');
      Alert.alert('Connection Failed', 'Unable to connect to camera. Please check:\n• IP address and port\n• Camera server is running\n• Both devices are on same network');
    } finally {
      setLoading(false);
    }
  };

  const disconnectCamera = () => {
    setIsConnected(false);
    setConnectionStatus('idle');
    setCameraStatus(null);
    showSnackbar('Disconnected from camera');
  };

  const getCameraUrl = () => {
    // Remove /video suffix if present and add /mobile
    const cleanUrl = ipAddress.replace('/video', '');
    const baseUrl = cleanUrl.startsWith('http') ? cleanUrl : `http://${cleanUrl}`;
    return `${baseUrl}/mobile`; // Use mobile-optimized endpoint
  };

  const refreshConnection = () => {
    if (isConnected) {
      disconnectCamera();
      setTimeout(() => connectToCamera(), 500);
    }
  };

  const selectPreset = (preset: CameraPreset) => {
    setIpAddress(preset.url);
    setShowPresets(false);
    showSnackbar(`Selected: ${preset.name}`);
  };

  if (isConnected) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Enhanced Header */}
        <Surface style={styles.headerSurface} elevation={3}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.titleContainer}>
                  <MaterialDesignIcons name="video" size={24} color="white" />
                  <Text variant="titleLarge" style={styles.headerTitle}>
                    Live Camera Feed
                  </Text>
                </View>
                {cameraStatus && (
                  <View style={styles.statusContainer}>
                    <Chip 
                      icon="check-circle" 
                      style={styles.statusChip}
                      textStyle={styles.statusChipText}
                      mode="flat"
                    >
                      {cameraStatus.resolution} • {cameraStatus.fps}fps
                    </Chip>
                  </View>
                )}
              </View>
              <View style={styles.headerActions}>
                <Surface style={styles.actionButton} elevation={2}>
                  <IconButton
                    icon="refresh"
                    onPress={refreshConnection}
                    iconColor="white"
                    size={20}
                  />
                </Surface>
                <Surface style={styles.actionButton} elevation={2}>
                  <IconButton
                    icon="close"
                    onPress={disconnectCamera}
                    iconColor="white"
                    size={20}
                  />
                </Surface>
              </View>
            </View>
          </LinearGradient>
        </Surface>
        
        <View style={styles.videoContainer}>
          <Surface style={styles.videoFrame} elevation={4}>
            <WebView
              source={{ uri: getCameraUrl() }}
              style={styles.webview}
              onError={(error) => {
                console.error('WebView error:', error);
                Alert.alert('Stream Error', 'Failed to load camera stream');
              }}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingOverlay}>
                  <Surface style={styles.loadingCard} elevation={3}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading camera feed...</Text>
                  </Surface>
                </View>
              )}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <Surface style={styles.loadingCard} elevation={3}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading camera feed...</Text>
                </Surface>
              </View>
            )}
          </Surface>
        </View>
        
        <Surface style={styles.footer} elevation={2}>
          <View style={styles.footerContent}>
            <MaterialDesignIcons name="wifi" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.connectionText}>
              Connected to {ipAddress.split(':')[0]}
            </Text>
            <Chip 
              icon="circle" 
              style={styles.liveIndicator}
              textStyle={styles.liveText}
              mode="flat"
            >
              LIVE
            </Chip>
          </View>
        </Surface>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Header */}
      <Surface style={styles.headerSurface} elevation={3}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Surface style={styles.logoContainer} elevation={2}>
              <MaterialDesignIcons name="camera" size={28} color={theme.colors.primary} />
            </Surface>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Camera Setup
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Connect to your monitoring camera
            </Text>
          </View>
        </LinearGradient>
      </Surface>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={detectLocalCameraServer}
          />
        }
      >
        {/* Connection Section */}
        <Surface style={styles.sectionCard} elevation={3}>
          <View style={styles.sectionHeader}>
            <MaterialDesignIcons name="video-outline" size={24} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Camera Connection
            </Text>
          </View>
          <Divider style={styles.sectionDivider} />

          <Text variant="bodyMedium" style={styles.description}>
            Enter your camera's IP address and port to start live monitoring
          </Text>

          <TextInput
            label="Camera URL (IP:PORT/path)"
            value={ipAddress}
            onChangeText={setIpAddress}
            placeholder="192.168.1.100:5000/video"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="camera" />}
            error={connectionStatus === 'error'}
            outlineStyle={styles.inputOutline}
          />

          <View style={styles.presetsContainer}>
            <Button
              mode="text"
              onPress={() => setShowPresets(!showPresets)}
              icon={showPresets ? "chevron-up" : "chevron-down"}
              style={styles.presetsButton}
            >
              Quick Connection Presets
            </Button>
          </View>

          {showPresets && (
            <Surface style={styles.presetsCard} elevation={2}>
              <View style={styles.presetsHeader}>
                <MaterialDesignIcons name="bookmark-multiple" size={20} color={theme.colors.primary} />
                <Text variant="titleSmall" style={styles.presetsTitle}>
                  Common Camera Configurations
                </Text>
              </View>
              <Divider style={styles.presetsDivider} />
              {cameraPresets.map((preset, index) => (
                <React.Fragment key={index}>
                  <List.Item
                    title={preset.name}
                    description={`${preset.url}\n${preset.description}`}
                    left={(props) => <List.Icon {...props} icon="camera-outline" />}
                    onPress={() => selectPreset(preset)}
                    style={styles.presetItem}
                    titleStyle={styles.presetTitle}
                    descriptionStyle={styles.presetDescription}
                  />
                  {index < cameraPresets.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Surface>
          )}

          <Button
            mode="contained"
            onPress={connectToCamera}
            loading={loading}
            disabled={loading || !ipAddress.trim()}
            style={styles.connectButton}
            contentStyle={styles.buttonContent}
            icon="video"
          >
            {loading ? 'Connecting...' : 'Connect to Camera'}
          </Button>

          {cameraStatus && (
            <Surface style={styles.statusCard} elevation={2}>
              <View style={styles.statusHeader}>
                <MaterialDesignIcons name="check-circle" size={20} color="#2E7D32" />
                <Text variant="titleSmall" style={styles.statusTitle}>
                  Camera Detected
                </Text>
              </View>
              <View style={styles.statusContent}>
                <View style={styles.statusRow}>
                  <Text variant="bodySmall" style={styles.statusLabel}>Resolution:</Text>
                  <Chip style={styles.statusValue} mode="outlined">{cameraStatus.resolution}</Chip>
                </View>
                <View style={styles.statusRow}>
                  <Text variant="bodySmall" style={styles.statusLabel}>Frame Rate:</Text>
                  <Chip style={styles.statusValue} mode="outlined">{cameraStatus.fps} fps</Chip>
                </View>
                <View style={styles.statusRow}>
                  <Text variant="bodySmall" style={styles.statusLabel}>Status:</Text>
                  <Chip style={styles.statusValue} mode="outlined">{cameraStatus.status}</Chip>
                </View>
              </View>
            </Surface>
          )}
        </Surface>

        {/* Instructions Section */}
        <Surface style={styles.sectionCard} elevation={3}>
          <View style={styles.sectionHeader}>
            <MaterialDesignIcons name="information" size={24} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Setup Instructions
            </Text>
          </View>
          <Divider style={styles.sectionDivider} />

          <View style={styles.instructionsList}>
            {[
              'Start the DemCare camera server on your laptop',
              'Note the IP address shown in the terminal',
              'Enter the full URL (e.g., 192.168.1.100:5000/video)',
              'Ensure both devices are on the same network',
              'Tap "Connect to Camera" to start streaming'
            ].map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Surface style={styles.stepNumber} elevation={1}>
                  <Text variant="labelMedium" style={styles.stepText}>
                    {index + 1}
                  </Text>
                </Surface>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  {instruction}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
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
  // Enhanced Header Styles
  headerSurface: {
    borderRadius: 0,
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  // Connected View Styles
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 20,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoContainer: {
    flex: 1,
    margin: 16,
  },
  videoFrame: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1,
  },
  loadingCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    elevation: 2,
    borderRadius: 0,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  connectionText: {
    marginLeft: 8,
    marginRight: 12,
    fontWeight: '500',
  },
  liveIndicator: {
    backgroundColor: '#4CAF50',
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Setup View Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 12,
    fontWeight: '600',
  },
  sectionDivider: {
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 12,
  },
  presetsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  presetsButton: {
    borderRadius: 20,
  },
  presetsCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    paddingVertical: 8,
  },
  presetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  presetsTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  presetsDivider: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  presetItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  presetTitle: {
    fontWeight: '500',
  },
  presetDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  connectButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  statusCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    marginLeft: 8,
    color: '#2E7D32',
    fontWeight: '600',
  },
  statusContent: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontWeight: '500',
    color: '#2E7D32',
  },
  statusValue: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  snackbar: {
    borderRadius: 12,
  },
});
