import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  TextInput,
  Surface,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { Icon } from 'react-native-paper';
import MaterialIcon from '../components/MaterialIcon';

const { width, height } = Dimensions.get('window');

interface LiveFeedScreenProps {
  navigation: any;
}

export default function LiveFeedScreen({ navigation }: LiveFeedScreenProps) {
  const theme = useTheme();
  
  const [cameraIp, setCameraIp] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showIpInput, setShowIpInput] = useState(true);

  useEffect(() => {
    loadSavedCameraIp();
  }, []);

  const loadSavedCameraIp = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('camera_ip');
      if (savedIp) {
        setCameraIp(savedIp);
        setStreamUrl(generateStreamUrl(savedIp));
        setShowIpInput(false);
      }
    } catch (error) {
      console.error('Error loading camera IP:', error);
    }
  };

  const generateStreamUrl = (ip: string): string => {
    // For RTSP stream, we'll use a web-based player since React Native doesn't have native RTSP support
    // This creates an HTML page with an HLS or WebRTC player
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta source="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              font-family: Arial, sans-serif;
            }
            .player-container {
              width: 100%;
              height: 100%;
              position: relative;
            }
            .video-player {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .loading {
              color: white;
              text-align: center;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .error {
              color: #ff6b6b;
              text-align: center;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          </style>
        </head>
        <body>
          <div class="player-container">
            <div class="loading" id="loading">
              <div>Connecting to camera...</div>
              <div>IP: ${ip}</div>
              <div>Stream: rtsp://${ip}:8554/live</div>
            </div>
            <div class="error" id="error" style="display: none;">
              <div>Unable to connect to camera</div>
              <div>Please check the IP address and try again</div>
            </div>
            <!-- For demonstration, we'll show a placeholder -->
            <img 
              id="placeholder" 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2FtZXJhIEZlZWQ8L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UlRTUDovLyR7aXB9Ojg1NTQvbGl2ZTwvdGV4dD4KPC9zdmc+"
              style="width: 100%; height: 100%; object-fit: contain;"
            />
          </div>
          
          <script>
            // Simulate connection attempt
            setTimeout(() => {
              document.getElementById('loading').style.display = 'none';
              // For demo purposes, show the placeholder
              // In a real implementation, you would integrate with a proper streaming solution
            }, 2000);
          </script>
        </body>
      </html>
    `;
  };

  const saveCameraIp = async () => {
    if (!cameraIp.trim()) {
      Alert.alert('Error', 'Please enter a valid IP address');
      return;
    }

    try {
      setIsLoading(true);
      await AsyncStorage.setItem('camera_ip', cameraIp.trim());
      setStreamUrl(generateStreamUrl(cameraIp.trim()));
      setShowIpInput(false);
      setIsConnected(true);
      Alert.alert('Success', 'Camera IP saved successfully');
    } catch (error) {
      console.error('Error saving camera IP:', error);
      Alert.alert('Error', 'Failed to save camera IP');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!cameraIp.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    setIsLoading(true);
    
    // Simulate connection test
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Connection Test',
        `Testing connection to ${cameraIp}:8554\n\nNote: In a real implementation, this would test the actual RTSP connection.`,
        [
          { text: 'OK', onPress: () => {} }
        ]
      );
    }, 2000);
  };

  const changeCameraIp = () => {
    setShowIpInput(true);
    setIsConnected(false);
    setStreamUrl('');
  };

  const renderCameraInput = () => (
    <Card style={styles.inputCard} mode="outlined">
      <Card.Content>
        <View style={styles.inputHeader}>
          <MaterialIcon source="camera" size={32} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.inputTitle}>
            Camera Configuration
          </Text>
        </View>

        <Text variant="bodyMedium" style={styles.inputDescription}>
          Enter the IP address of your Raspberry Pi camera to start streaming.
        </Text>

        <TextInput
          label="Raspberry Pi IP Address"
          value={cameraIp}
          onChangeText={setCameraIp}
          mode="outlined"
          style={styles.ipInput}
          placeholder="192.168.1.100"
          keyboardType="numeric"
          right={<TextInput.Icon icon="camera" />}
        />

        <View style={styles.inputButtons}>
          <Button
            mode="outlined"
            onPress={testConnection}
            style={styles.testButton}
            loading={isLoading}
            disabled={!cameraIp.trim() || isLoading}
            icon="wifi"
          >
            Test Connection
          </Button>
          
          <Button
            mode="contained"
            onPress={saveCameraIp}
            style={styles.connectButton}
            loading={isLoading}
            disabled={!cameraIp.trim() || isLoading}
            icon="check"
          >
            Connect
          </Button>
        </View>

        <View style={styles.infoSection}>
          <Text variant="bodySmall" style={styles.infoTitle}>
            Expected Stream Format:
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            RTSP: rtsp://[IP]:8554/live
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            HTTP: http://[IP]:8080/stream.mjpg
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderVideoPlayer = () => (
    <Card style={styles.videoCard} mode="outlined">
      <Card.Content style={styles.videoContent}>
        <View style={styles.videoHeader}>
          <View style={styles.videoInfo}>
            <Text variant="titleMedium" style={styles.videoTitle}>
              Live Camera Feed
            </Text>
            <Text variant="bodySmall" style={styles.videoUrl}>
              {cameraIp}:8554
            </Text>
          </View>
          <IconButton
            icon="cog"
            onPress={changeCameraIp}
          />
        </View>

        <View style={styles.videoContainer}>
          <WebView
            source={{ html: streamUrl }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading camera feed...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
            }}
            onLoadEnd={() => {
              setIsLoading(false);
              setIsConnected(true);
            }}
          />
        </View>

        <View style={styles.videoControls}>
          <Button
            mode="outlined"
            onPress={() => setStreamUrl(generateStreamUrl(cameraIp))}
            icon="refresh"
            style={styles.controlButton}
          >
            Refresh
          </Button>
          
          <Button
            mode="outlined"
            onPress={changeCameraIp}
            icon="cog"
            style={styles.controlButton}
          >
            Settings
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

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
            <Icon source="video" size={32} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Live Camera Feed
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {isConnected ? `Connected to ${cameraIp}` : 'Not connected'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>

      {/* Content */}
      <View style={styles.content}>
        {showIpInput ? renderCameraInput() : renderVideoPlayer()}
      </View>
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
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputCard: {
    flex: 1,
    justifyContent: 'center',
  },
  inputHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inputTitle: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  ipInput: {
    marginBottom: 24,
  },
  inputButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    flex: 1,
  },
  connectButton: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    opacity: 0.7,
    marginBottom: 4,
  },
  videoCard: {
    flex: 1,
  },
  videoContent: {
    flex: 1,
    padding: 0,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  videoUrl: {
    opacity: 0.7,
  },
  videoContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
  },
  videoControls: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  controlButton: {
    flex: 1,
  },
});
