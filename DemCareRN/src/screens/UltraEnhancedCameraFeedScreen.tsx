import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Dimensions, 
  RefreshControl, 
  Animated, 
  Platform,
  StatusBar,
  TouchableOpacity,
  BackHandler
} from 'react-native';
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
  ProgressBar,
  Badge,
  SegmentedButtons
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from '../components/MaterialIcon';

const { width, height } = Dimensions.get('window');

interface CameraPreset {
  name: string;
  url: string;
  description: string;
  icon: string;
  category: 'local' | 'network' | 'cloud';
}

interface ConnectionState {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  progress: number;
  message: string;
  timestamp?: number;
}

export default function UltraEnhancedCameraFeedScreen() {
  const theme = useTheme();
  const [ipAddress, setIpAddress] = useState('');
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'idle',
    progress: 0,
    message: 'Ready to connect'
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cameraStatus, setCameraStatus] = useState<any>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('local');
  const [cameraQuality, setCameraQuality] = useState('medium');
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Advanced Animations
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const connectButtonScale = useRef(new Animated.Value(1)).current;
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Enhanced Camera Presets
  const cameraPresets: CameraPreset[] = [
    {
      name: 'DemCare Smart Camera',
      url: '192.168.1.100:5000/video',
      description: 'AI-powered patient monitoring camera',
      icon: 'robot',
      category: 'local'
    },
    {
      name: 'Bedside Monitor',
      url: '192.168.1.101:8080/video',
      description: 'Primary bedside monitoring station',
      icon: 'bed',
      category: 'local'
    },
    {
      name: 'Room Overview',
      url: '192.168.1.102:554/stream',
      description: 'Wide-angle room surveillance',
      icon: 'panorama-wide-angle',
      category: 'network'
    },
    {
      name: 'Emergency Backup',
      url: 'rtsp://backup.demcare.com/stream',
      description: 'Cloud-based backup camera',
      icon: 'cloud-upload',
      category: 'cloud'
    }
  ];

  useEffect(() => {
    initializeAnimations();
    detectSmartCameras();
    setupBackHandler();
    
    return () => {
      // BackHandler cleanup is handled in setupBackHandler
    };
  }, []);

  const initializeAnimations = () => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particle animation
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const setupBackHandler = () => {
    const backAction = () => {
      if (fullscreen) {
        setFullscreen(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  };

  const handleBackPress = () => {
    if (fullscreen) {
      setFullscreen(false);
      return true;
    }
    return false;
  };

  const detectSmartCameras = async () => {
    try {
      // Simulate smart camera detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Auto-select first available camera if none selected
      if (!ipAddress && cameraPresets.length > 0) {
        setIpAddress(cameraPresets[0].url);
        showSnackbar(`🎯 Auto-detected: ${cameraPresets[0].name}`);
      }
    } catch (error) {
      console.log('Auto-detection failed:', error);
    }
  };

  const connectToCamera = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('⚠️ Missing URL', 'Please enter a camera URL or select a preset');
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(connectButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(connectButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setConnectionState({
      status: 'connecting',
      progress: 0,
      message: 'Establishing secure connection...'
    });

    // Animated progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    try {
      // Simulate connection phases
      const phases = [
        { progress: 0.2, message: 'Resolving camera address...' },
        { progress: 0.4, message: 'Authenticating device...' },
        { progress: 0.6, message: 'Negotiating video stream...' },
        { progress: 0.8, message: 'Optimizing quality settings...' },
        { progress: 1.0, message: 'Connection established!' }
      ];

      for (const phase of phases) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setConnectionState(prev => ({
          ...prev,
          progress: phase.progress,
          message: phase.message
        }));
      }

      // Mock camera status
      const mockStatus = {
        resolution: '1920x1080',
        fps: '30',
        quality: cameraQuality,
        codec: 'H.264',
        bitrate: '2.5 Mbps',
        latency: '120ms'
      };

      setCameraStatus(mockStatus);
      setConnectionState({
        status: 'connected',
        progress: 1,
        message: 'Live feed active',
        timestamp: Date.now()
      });

      // Fade in video
      Animated.timing(videoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      showSnackbar('🎥 Camera connected successfully!');
      
    } catch (error) {
      setConnectionState({
        status: 'error',
        progress: 0,
        message: 'Connection failed'
      });
      
      Alert.alert(
        '🚫 Connection Failed', 
        'Unable to connect to camera. Please check your settings and try again.',
        [
          { text: 'Help', onPress: () => setShowHelp(true) },
          { text: 'Settings', onPress: () => setShowSettings(true) },
          { text: 'Retry', onPress: connectToCamera },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      progressAnim.setValue(0);
    }
  };

  const disconnectCamera = () => {
    setConnectionState({
      status: 'idle',
      progress: 0,
      message: 'Ready to connect'
    });
    setCameraStatus(null);
    
    Animated.timing(videoOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    showSnackbar('📴 Camera disconnected');
  };

  const selectPreset = (preset: CameraPreset) => {
    setIpAddress(preset.url);
    setShowPresets(false);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    showSnackbar(`🎯 Selected: ${preset.name}`);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    
    Animated.timing(headerOpacity, {
      toValue: fullscreen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getCameraUrl = () => {
    const cleanUrl = ipAddress.replace('/video', '');
    const baseUrl = cleanUrl.startsWith('http') ? cleanUrl : `http://${cleanUrl}`;
    return `${baseUrl}/mobile?quality=${cameraQuality}`;
  };

  // Connected View (Full Screen Video)
  if (connectionState.status === 'connected') {
    return (
      <>
        <StatusBar 
          hidden={fullscreen}
          barStyle="light-content" 
          backgroundColor="black"
        />
        <View style={[styles.videoContainer, fullscreen && styles.fullscreenVideo]}>
          {/* Video Feed */}
          <Animated.View style={[styles.videoWrapper, { opacity: videoOpacity }]}>
            <WebView
              source={{ uri: getCameraUrl() }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              onError={() => {
                Alert.alert('Video Error', 'Failed to load video stream');
                disconnectCamera();
              }}
            />
          </Animated.View>

          {/* Enhanced Header Overlay */}
          {!fullscreen && (
            <Animated.View 
              style={[
                styles.videoHeaderOverlay,
                { opacity: headerOpacity }
              ]}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
                style={styles.headerGradient}
              >
                <View style={styles.videoHeader}>
                  <View style={styles.videoHeaderLeft}>
                    <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
                      <View style={styles.liveIndicator} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </Animated.View>
                    
                    <View style={styles.cameraInfo}>
                      <Text style={styles.cameraTitle}>DemCare Monitor</Text>
                      <Text style={styles.cameraDetails}>
                        {cameraStatus?.resolution} • {cameraStatus?.fps}fps • {cameraStatus?.latency}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.videoHeaderRight}>
                    <IconButton
                      icon="fullscreen"
                      iconColor="white"
                      size={24}
                      onPress={toggleFullscreen}
                      style={styles.headerButton}
                    />
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      onPress={disconnectCamera}
                      style={styles.headerButton}
                    />
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Video Controls Overlay */}
          <View style={styles.videoControlsOverlay}>
            <Surface style={styles.controlsContainer} elevation={4}>
              <View style={styles.controlsRow}>
                <IconButton
                  icon="record"
                  iconColor={theme.colors.error}
                  size={28}
                  onPress={() => showSnackbar('🔴 Recording started')}
                />
                <IconButton
                  icon="camera"
                  iconColor={theme.colors.primary}
                  size={28}
                  onPress={() => showSnackbar('📸 Screenshot saved')}
                />
                <IconButton
                  icon="volume-high"
                  iconColor={theme.colors.primary}
                  size={28}
                  onPress={() => showSnackbar('🔊 Audio enabled')}
                />
                <IconButton
                  icon="settings"
                  iconColor={theme.colors.primary}
                  size={28}
                  onPress={() => setShowSettings(true)}
                />
              </View>
            </Surface>
          </View>

          {/* Quality Indicator */}
          <View style={styles.qualityIndicator}>
            <Surface style={styles.qualityBadge} elevation={4}>
              <MaterialIcon source="high-definition-box" size={16} color={theme.colors.primary} />
              <Text style={styles.qualityText}>HD</Text>
            </Surface>
          </View>
        </View>
      </>
    );
  }

  // Setup View
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Ultra-Enhanced Header */}
        <Animated.View style={[styles.ultraHeader, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={[
              theme.colors.primary,
              theme.colors.primaryContainer,
              theme.colors.secondaryContainer
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Animated Particles Background */}
            <Animated.View 
              style={[
                styles.particlesContainer,
                { 
                  opacity: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8]
                  })
                }
              ]}
            >
              {[...Array(6)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.particle,
                    {
                      left: `${(i * 20) + 10}%`,
                      transform: [{
                        translateY: particleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20]
                        })
                      }]
                    }
                  ]}
                />
              ))}
            </Animated.View>

            <View style={styles.headerContent}>
              <Surface style={styles.logoContainer} elevation={4}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.logoGradient}
                >
                  <MaterialIcon source="video" size={32} color="white" />
                </LinearGradient>
              </Surface>

              <View style={styles.titleSection}>
                <Text variant="headlineMedium" style={styles.headerTitle}>
                  Smart Camera Hub
                </Text>
                <Text variant="bodyLarge" style={styles.headerSubtitle}>
                  AI-Powered Patient Monitoring
                </Text>
              </View>

              <View style={styles.connectionBadgeContainer}>
                <Animated.View 
                  style={[
                    styles.connectionBadge,
                    connectionState.status === 'connected' ? {
                      backgroundColor: theme.colors.primary
                    } : {}
                  ]}
                >
                  <MaterialIcon 
                    source={
                      connectionState.status === 'connected' ? 'wifi' :
                      connectionState.status === 'connecting' ? 'wifi-sync' :
                      connectionState.status === 'error' ? 'wifi-off' : 'wifi-strength-outline'
                    } 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.connectionBadgeText}>
                    {connectionState.message}
                  </Text>
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Connection Progress */}
          {connectionState.status === 'connecting' && (
            <Surface style={styles.progressCard} elevation={4}>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.progressTitle}>
                  Connecting to Camera
                </Text>
              </View>
              
              <ProgressBar 
                progress={connectionState.progress} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              
              <Text variant="bodyMedium" style={styles.progressMessage}>
                {connectionState.message}
              </Text>
            </Surface>
          )}

          {/* Enhanced Connection Section */}
          <Surface style={styles.connectionCard} elevation={4}>
            <LinearGradient
              colors={[theme.colors.surface, theme.colors.surfaceVariant]}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <MaterialIcon source="router-wireless" size={28} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Camera Connection
                </Text>
                <Badge 
                  style={styles.betaBadge}
                  size={20}
                >
                  AI
                </Badge>
              </View>
              
              <Divider style={styles.cardDivider} />

              <Text variant="bodyLarge" style={styles.cardDescription}>
                Connect to your intelligent monitoring camera for real-time patient surveillance with AI-powered analytics
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Smart Camera URL"
                  value={ipAddress}
                  onChangeText={setIpAddress}
                  placeholder="192.168.1.100:5000/video"
                  mode="outlined"
                  style={styles.urlInput}
                  left={<TextInput.Icon icon="video-outline" />}
                  right={<TextInput.Icon icon="qrcode-scan" onPress={() => showSnackbar('📱 QR Scanner coming soon')} />}
                  error={connectionState.status === 'error'}
                  outlineStyle={styles.inputOutline}
                />
              </View>

              {/* Preset Categories */}
              <View style={styles.presetCategoriesContainer}>
                <SegmentedButtons
                  value={selectedPresetCategory}
                  onValueChange={setSelectedPresetCategory}
                  buttons={[
                    { value: 'local', label: 'Local', icon: 'home' },
                    { value: 'network', label: 'Network', icon: 'lan' },
                    { value: 'cloud', label: 'Cloud', icon: 'cloud' }
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              {/* Quick Presets */}
              <View style={styles.presetsContainer}>
                <TouchableOpacity 
                  onPress={() => setShowPresets(!showPresets)}
                  style={styles.presetsToggle}
                >
                  <MaterialIcon 
                    source="bookmark-multiple" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="titleMedium" style={styles.presetsToggleText}>
                    Quick Connect Presets
                  </Text>
                  <MaterialIcon 
                    source={showPresets ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>

                {showPresets && (
                  <Animated.View style={[styles.presetsGrid, { opacity: slideAnim }]}>
                    {cameraPresets
                      .filter(preset => preset.category === selectedPresetCategory)
                      .map((preset, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.presetCard}
                          onPress={() => selectPreset(preset)}
                        >
                          <Surface style={styles.presetSurface} elevation={2}>
                            <MaterialIcon 
                              source={preset.icon} 
                              size={24} 
                              color={theme.colors.primary} 
                            />
                            <Text variant="labelLarge" style={styles.presetName}>
                              {preset.name}
                            </Text>
                            <Text variant="bodySmall" style={styles.presetDescription}>
                              {preset.description}
                            </Text>
                          </Surface>
                        </TouchableOpacity>
                      ))}
                  </Animated.View>
                )}
              </View>

              {/* Enhanced Connect Button */}
              <Animated.View style={[styles.connectButtonContainer, { transform: [{ scale: connectButtonScale }] }]}>
                <Button
                  mode="contained"
                  onPress={connectToCamera}
                  loading={connectionState.status === 'connecting'}
                  disabled={connectionState.status === 'connecting'}
                  style={styles.connectButton}
                  contentStyle={styles.connectButtonContent}
                  labelStyle={styles.connectButtonLabel}
                  icon="video"
                >
                  {connectionState.status === 'connecting' ? 'Connecting...' : 'Connect to Camera'}
                </Button>
              </Animated.View>
            </LinearGradient>
          </Surface>
        </ScrollView>

        {/* Enhanced FAB with Menu */}
        <Portal>
          <FAB.Group
            open={showSettings}
            visible={true}
            icon={showSettings ? 'close' : 'cog'}
            actions={[
              {
                icon: 'help-circle',
                label: 'Help & Support',
                onPress: () => setShowHelp(true),
              },
              {
                icon: 'tune',
                label: 'Camera Settings',
                onPress: () => setShowSettings(true),
              },
              {
                icon: 'refresh',
                label: 'Auto-Detect',
                onPress: detectSmartCameras,
              },
            ]}
            onStateChange={({ open }) => setShowSettings(open)}
            style={styles.fabGroup}
          />
        </Portal>

        {/* Enhanced Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ultraHeader: {
    height: 200,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'relative',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    top: '50%',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  connectionBadgeContainer: {
    marginLeft: 12,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  connectionBadgeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  progressCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    marginLeft: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressMessage: {
    opacity: 0.7,
    textAlign: 'center',
  },
  connectionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardGradient: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  betaBadge: {
    backgroundColor: '#FF6B35',
  },
  cardDivider: {
    marginVertical: 16,
  },
  cardDescription: {
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  urlInput: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderWidth: 2,
  },
  presetCategoriesContainer: {
    marginBottom: 20,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  presetsContainer: {
    marginBottom: 24,
  },
  presetsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  presetsToggleText: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  presetCard: {
    width: (width - 80) / 2,
    marginBottom: 12,
  },
  presetSurface: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  presetName: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  presetDescription: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
  connectButtonContainer: {
    marginTop: 8,
  },
  connectButton: {
    borderRadius: 16,
    elevation: 4,
  },
  connectButtonContent: {
    paddingVertical: 8,
  },
  connectButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fabGroup: {
    paddingBottom: 100,
  },
  snackbar: {
    marginBottom: 80,
  },
  // Video Screen Styles
  videoContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  videoWrapper: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 10,
  },
  videoHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  videoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraInfo: {
    flex: 1,
  },
  cameraTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraDetails: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  videoHeaderRight: {
    flexDirection: 'row',
  },
  headerButton: {
    margin: 0,
  },
  videoControlsOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  controlsContainer: {
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  qualityIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    right: 20,
    zIndex: 10,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  qualityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
