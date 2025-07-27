import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Surface,
  Chip,
  useTheme,
  Divider,
  List,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from '../components/MaterialIcon';
import { getDemoAccountInfo, MockAuthService } from '../services/mockService';
import { ConfigService } from '../services/config';
import { useAuthStore } from '../store/authStore';

interface Props {
  navigation: any;
  onClose?: () => void;
}

export default function DemoAccountsScreen({ navigation, onClose }: Props) {
  const theme = useTheme();
  const { signIn } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mockModeEnabled, setMockModeEnabled] = useState(true);

  const demoAccounts = getDemoAccountInfo();

  const handleMockModeToggle = async (enabled: boolean) => {
    setMockModeEnabled(enabled);
    await ConfigService.setMockMode(enabled);
  };

  useEffect(() => {
    // Initialize mock mode state from config
    const initializeMockMode = async () => {
      const isEnabled = ConfigService.isMockModeEnabled();
      setMockModeEnabled(isEnabled);
    };
    initializeMockMode();
  }, []);

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setLoading(true);
    try {
      // Enable mock mode for demo accounts
      await ConfigService.setMockMode(true);
      
      // Use the regular auth flow which will now use mock service
      await signIn(email, password);
      
      Alert.alert('Demo Login Successful', `Logged in as ${role}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Unable to sign in with demo account'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDemoAccount = (key: string, account: any) => {
    const roleInfo = {
      doctor: {
        icon: 'doctor',
        color: '#4CAF50',
        title: 'Doctor Account',
        features: [
          'Full patient management',
          'Analytics and reports',
          'Prescription management',
          'All system features'
        ]
      },
      caregiver: {
        icon: 'account-heart',
        color: '#2196F3',
        title: 'Caregiver Account',
        features: [
          'Patient monitoring',
          'Medication tracking',
          'Basic reporting',
          'Care coordination'
        ]
      }
    };

    const info = roleInfo[key as keyof typeof roleInfo];

    return (
      <Card key={key} style={styles.accountCard} elevation={3}>
        <Card.Content>
          <View style={styles.accountHeader}>
            <Surface
              style={[styles.iconContainer, { backgroundColor: info.color + '20' }]}
              elevation={1}
            >
              <MaterialIcon
                source={info.icon}
                size={32}
                color={info.color}
              />
            </Surface>
            <View style={styles.accountInfo}>
              <Text variant="titleMedium" style={styles.accountTitle}>
                {info.title}
              </Text>
              <Text variant="bodySmall" style={styles.accountDescription}>
                {account.description}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.credentialsContainer}>
            <Text variant="bodySmall" style={styles.credentialLabel}>
              Email:
            </Text>
            <Text variant="bodyMedium" style={styles.credentialValue}>
              {account.email}
            </Text>
            <Text variant="bodySmall" style={styles.credentialLabel}>
              Password:
            </Text>
            <Text variant="bodyMedium" style={styles.credentialValue}>
              {account.password}
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text variant="bodySmall" style={styles.featuresTitle}>
              Available Features:
            </Text>
            {info.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcon source="check-circle" size={16} color={info.color} />
                <Text variant="bodySmall" style={styles.featureText}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={() => handleDemoLogin(account.email, account.password, info.title)}
            loading={loading}
            disabled={loading}
            style={[styles.loginButton, { backgroundColor: info.color }]}
            labelStyle={{ color: 'white' }}
            icon="login"
          >
            Login as {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.header} elevation={4}>
          <View style={styles.headerContent}>
            <MaterialIcon source="test-tube" size={32} color={theme.colors.primary} />
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Demo Accounts
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Test the app with pre-configured accounts and sample data
              </Text>
            </View>
          </View>
        </Surface>

        <View style={styles.content}>
          {/* Mock Mode Toggle */}
          <Card style={styles.settingsCard} elevation={2}>
            <Card.Content>
              <List.Item
                title="Mock Mode"
                description="Use simulated data instead of real Firebase"
                left={(props) => (
                  <MaterialIcon source="database" size={24} color={theme.colors.primary} />
                )}
                right={() => (
                  <Switch
                    value={mockModeEnabled}
                    onValueChange={handleMockModeToggle}
                    thumbColor={theme.colors.primary}
                  />
                )}
              />
            </Card.Content>
          </Card>

          {/* Demo Data Info */}
          <Card style={styles.infoCard} elevation={2}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.infoTitle}>
                Demo Data Includes:
              </Text>
              <View style={styles.infoGrid}>
                <Chip icon="account-group" style={styles.infoChip}>
                  5 Sample Patients
                </Chip>
                <Chip icon="heart-pulse" style={styles.infoChip}>
                  Live Vitals Data
                </Chip>
                <Chip icon="chart-line" style={styles.infoChip}>
                  Historical Analytics
                </Chip>
                <Chip icon="sleep" style={styles.infoChip}>
                  Sleep Tracking
                </Chip>
                <Chip icon="emoticon-happy" style={styles.infoChip}>
                  Mood Entries
                </Chip>
                <Chip icon="camera" style={styles.infoChip}>
                  Camera Feeds
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* Demo Accounts */}
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Available Demo Accounts
          </Text>

          {Object.entries(demoAccounts).map(([key, account]) =>
            renderDemoAccount(key, account)
          )}

          {/* Back to Login */}
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back to Login
          </Button>
        </View>
      </ScrollView>
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
  header: {
    padding: 20,
    marginBottom: 16,
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  settingsCard: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  accountCard: {
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accountDescription: {
    opacity: 0.7,
  },
  divider: {
    marginBottom: 16,
  },
  credentialsContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  credentialLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  credentialValue: {
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    marginLeft: 8,
    opacity: 0.8,
  },
  loginButton: {
    borderRadius: 8,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});
