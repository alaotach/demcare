import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions, RefreshControl, Animated, Platform } from 'react-native';
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
  Surface,
  FAB,
  Portal,
  Modal,
  ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from '../components/MaterialIcon';

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
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
    
    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Pulse animation for live indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (isConnected) {
      pulseLoop.start();
    } else {
      pulseLoop.stop();
    }
    
    return () => pulseLoop.stop();
  }, [isConnected]);

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
    setConnectionProgress(0);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    try {
      // Simulate connection steps with progress updates
      setConnectionProgress(0.2);
      showSnackbar('Establishing connection...');
      
      // Test connection to the camera
      const baseUrl = ipAddress.replace('/video', '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      setConnectionProgress(0.5);
      showSnackbar('Checking camera status...');
      
      const response = await fetch(`http://${baseUrl}/api/status`, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      setConnectionProgress(0.8);
      
      if (response.ok) {
        const status = await response.json();
        setCameraStatus(status);
        setConnectionProgress(1);
        setIsConnected(true);
        setConnectionStatus('connected');
        showSnackbar('✅ Successfully connected to camera');
        
        // Animate connection success
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        throw new Error('Camera not responding');
      }
    } catch (error) {
      setConnectionProgress(0);
      setConnectionStatus('error');
      Alert.alert(
        '🚫 Connection Failed', 
        'Unable to connect to camera. Please check:\n\n• IP address and port are correct\n• Camera server is running\n• Both devices are on same network\n• Firewall settings allow connection',
        [
          { text: 'Help', onPress: () => setShowHelp(true) },
          { text: 'Try Again', onPress: connectToCamera },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      progressAnim.setValue(0);
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
        {/* Enhanced Header with Live Animation */}
        <Surface style={styles.headerSurface} elevation={4}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
              <View style={styles.headerLeft}>
                <View style={styles.titleContainer}>
                  <MaterialIcon name="video" size={24} color="white" />
                  <Text variant="titleLarge" style={styles.headerTitle}>
                    Live Camera Feed
                  </Text>
                  <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.liveIndicatorDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </Animated.View>
                </View>
                {cameraStatus && (
                  <Animated.View style={[styles.statusContainer, { opacity: fadeAnim }]}>
                    <Chip 
                      icon="check-circle" 
                      style={styles.statusChip}
                      textStyle={styles.statusChipText}
                      mode="flat"
                    >
                      {cameraStatus.resolution} • {cameraStatus.fps}fps • Connected
                    </Chip>
                  </Animated.View>
                )}
              </View>
              <View style={styles.headerActions}>
                <Surface style={styles.actionButton} elevation={3}>
                  <IconButton
                    icon="fullscreen"
                    onPress={() => {/* Handle fullscreen */}}
                    iconColor="white"
                    size={20}
                  />
                </Surface>
                <Surface style={styles.actionButton} elevation={3}>
                  <IconButton
                    icon="refresh"
                    onPress={refreshConnection}
                    iconColor="white"
                    size={20}
                  />
                </Surface>
                <Surface style={styles.actionButton} elevation={3}>
                  <IconButton
                    icon="close"
                    onPress={disconnectCamera}
                    iconColor="white"
                    size={20}
                  />
                </Surface>
              </View>
            </Animated.View>
          </LinearGradient>
        </Surface>
        
        {/* Enhanced Video Container */}
        <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
          <Surface style={styles.videoFrame} elevation={6}>
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
                  <Surface style={styles.loadingCard} elevation={4}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading camera feed...</Text>
                    <Text style={styles.loadingSubtext}>Please wait while we connect</Text>
                  </Surface>
                </View>
              )}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <Surface style={styles.loadingCard} elevation={4}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading camera feed...</Text>
                  <Text style={styles.loadingSubtext}>Please wait while we connect</Text>
                </Surface>
              </View>
            )}
            
            {/* Video Controls Overlay */}
            <View style={styles.videoControls}>
              <Surface style={styles.controlButton} elevation={2}>
                <IconButton icon="record" iconColor="red" size={20} />
              </Surface>
              <Surface style={styles.controlButton} elevation={2}>
                <IconButton icon="camera" iconColor="white" size={20} />
              </Surface>
            </View>
          </Surface>
        </Animated.View>
        
        {/* Enhanced Footer */}
        <Surface style={styles.footer} elevation={3}>
          <Animated.View style={[styles.footerContent, { opacity: fadeAnim }]}>
            <MaterialIcon name="wifi" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.connectionText}>
              Connected to {ipAddress.split(':')[0]}
            </Text>
            <View style={styles.footerActions}>
              <Chip 
                icon="circle" 
                style={styles.liveIndicator}
                textStyle={styles.liveChipText}
                mode="flat"
              >
                STREAMING
              </Chip>
            </View>
          </Animated.View>
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
              <MaterialIcon name="camera" size={28} color={theme.colors.primary} />
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
            <MaterialIcon name="video-outline" size={24} color={theme.colors.primary} />
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
                <MaterialIcon name="bookmark-multiple" size={20} color={theme.colors.primary} />
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
            style={[styles.connectButton, loading && styles.connectButtonLoading]}
            contentStyle={styles.buttonContent}
            icon={loading ? "loading" : "video"}
            buttonColor={connectionStatus === 'error' ? theme.colors.error : theme.colors.primary}
          >
            {loading ? 'Connecting...' : 'Connect to Camera'}
          </Button>

          {/* Connection Progress */}
          {loading && (
            <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
              <ProgressBar 
                progress={connectionProgress} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.progressText}>
                {connectionProgress === 0.2 && 'Establishing connection...'}
                {connectionProgress === 0.5 && 'Checking camera status...'}
                {connectionProgress === 0.8 && 'Finalizing connection...'}
                {connectionProgress === 1 && 'Connected successfully!'}
              </Text>
            </Animated.View>
          )}

          {cameraStatus && (
            <Surface style={styles.statusCard} elevation={2}>
              <View style={styles.statusHeader}>
                <MaterialIcon name="check-circle" size={20} color="#2E7D32" />
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
            <MaterialIcon name="information" size={24} color={theme.colors.primary} />
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

      {/* Help FAB */}
      <FAB
        icon="help-circle"
        style={styles.helpFab}
        onPress={() => setShowHelp(true)}
        label="Help"
        variant="tertiary"
      />

      {/* Help Modal */}
      <Portal>
        <Modal 
          visible={showHelp} 
          onDismiss={() => setShowHelp(false)}
          contentContainerStyle={styles.helpModal}
        >
          <Surface style={styles.helpContent} elevation={4}>
            <View style={styles.helpHeader}>
              <MaterialIcon name="help-circle" size={32} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={styles.helpTitle}>
                Connection Help
              </Text>
              <IconButton
                icon="close"
                onPress={() => setShowHelp(false)}
                style={styles.helpClose}
              />
            </View>
            
            <Divider style={styles.helpDivider} />
            
            <View style={styles.helpSection}>
              <Text variant="titleMedium" style={styles.helpSectionTitle}>
                Common Issues & Solutions
              </Text>
              
              {[
                {
                  issue: "Camera not found",
                  solution: "Ensure the camera server is running and both devices are on the same network"
                },
                {
                  issue: "Connection timeout",
                  solution: "Check firewall settings and try a different IP address"
                },
                {
                  issue: "Invalid format",
                  solution: "Use format: IP:PORT/path (e.g., 192.168.1.100:5000/video)"
                },
                {
                  issue: "Stream not loading",
                  solution: "Try refreshing the connection or check camera server logs"
                }
              ].map((item, index) => (
                <View key={index} style={styles.helpItem}>
                  <MaterialIcon name="alert-circle" size={16} color={theme.colors.error} />
                  <View style={styles.helpItemContent}>
                    <Text variant="bodyMedium" style={styles.helpItemTitle}>
                      {item.issue}
                    </Text>
                    <Text variant="bodySmall" style={styles.helpItemText}>
                      {item.solution}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Button
              mode="contained"
              onPress={() => setShowHelp(false)}
              style={styles.helpCloseButton}
            >
              Got it!
            </Button>
          </Surface>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
        wrapperStyle={styles.snackbarWrapper}
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
    fontWeight: '600',
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
    fontWeight: '700',
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
  snackbarWrapper: {
    paddingHorizontal: 16,
  },
  
  // New Enhanced Styles
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 4,
  },
  liveChipText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
  },
  loadingSubtext: {
    marginTop: 8,
    opacity: 0.7,
    fontSize: 12,
    textAlign: 'center',
  },
  videoControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButtonLoading: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  progressContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  helpFab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  helpModal: {
    margin: 20,
    borderRadius: 20,
  },
  helpContent: {
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpTitle: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '600',
  },
  helpClose: {
    margin: 0,
  },
  helpDivider: {
    marginBottom: 20,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: '#333',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  helpItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  helpItemTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  helpItemText: {
    opacity: 0.7,
    lineHeight: 18,
  },
  helpCloseButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
