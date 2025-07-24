import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated, Dimensions, Platform } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  Switch, 
  Button, 
  useTheme,
  Divider,
  Avatar,
  Surface,
  IconButton,
  Portal,
  Modal,
  Chip
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuthStore();
  const { 
    theme: appTheme, 
    notifications, 
    dataSync, 
    updateTheme, 
    updateNotifications, 
    updateDataSync,
    resetSettings 
  } = useSettingsStore();

  // Animation and state management
  const [scrollY] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'signOut' | 'reset' | 'help' | null>(null);

  // Dynamic header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Profile section scale animation
  const profileScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const handleSignOut = async () => {
    setModalType('signOut');
    setShowModal(true);
  };

  const handleResetSettings = () => {
    setModalType('reset');
    setShowModal(true);
  };

  const handleHelp = () => {
    setModalType('help');
    setShowModal(true);
  };

  const executeSignOut = async () => {
    setShowModal(false);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const executeReset = async () => {
    setShowModal(false);
    try {
      await resetSettings();
      Alert.alert('Success', 'Settings have been reset');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset settings');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      doctor: '#4CAF50',
      caregiver: '#2196F3',
      family_member: '#FF9800',
      physician: '#9C27B0',
      other: '#607D8B'
    };
    return colors[role as keyof typeof colors] || colors.other;
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    rightElement,
    showDivider = true 
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showDivider?: boolean;
  }) => (
    <>
      <List.Item
        title={title}
        description={description}
        left={(props) => (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={icon as any} 
              size={24} 
              color={theme.colors.primary}
            />
          </View>
        )}
        right={() => rightElement}
        onPress={onPress}
        style={styles.listItem}
        titleStyle={styles.listTitle}
        descriptionStyle={styles.listDescription}
      />
      {showDivider && <Divider style={styles.divider} />}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated Gradient Header */}
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Settings
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Customize your DemCare experience
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Profile Section */}
        <Animated.View style={[styles.profileSection, { transform: [{ scale: profileScale }] }]}>
          <Surface style={styles.profileCard} elevation={4}>
            <LinearGradient
              colors={[getRoleColor(user?.role || 'other'), `${getRoleColor(user?.role || 'other')}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}
            >
              <View style={styles.profileContent}>
                <Avatar.Text 
                  size={80} 
                  label={getInitials(user?.fullName || 'Unknown User')}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
                <View style={styles.profileInfo}>
                  <Text variant="headlineSmall" style={styles.profileName}>
                    {user?.fullName || 'Unknown User'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.profileEmail}>
                    {user?.email}
                  </Text>
                  <Chip 
                    icon="badge-account"
                    style={[styles.roleChip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                    textStyle={styles.roleChipText}
                  >
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </Chip>
                </View>
              </View>
              <Text variant="bodySmall" style={styles.phoneNumber}>
                📞 {user?.phoneNumber}
              </Text>
            </LinearGradient>
          </Surface>
        </Animated.View>

        {/* App Settings Section */}
        <Surface style={styles.sectionCard} elevation={2}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              App Settings
            </Text>
          </View>
          
          <SettingsItem
            icon="theme-light-dark"
            title="Dark Mode"
            description="Toggle between light and dark theme"
            rightElement={
              <Surface style={styles.switchContainer} elevation={1}>
                <Switch
                  value={appTheme === 'dark'}
                  onValueChange={(value) => updateTheme(value ? 'dark' : 'light')}
                  thumbColor={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primaryContainer }}
                />
              </Surface>
            }
          />
          
          <SettingsItem
            icon="bell-ring"
            title="Push Notifications"
            description="Receive alerts for patient status changes"
            rightElement={
              <Surface style={styles.switchContainer} elevation={1}>
                <Switch
                  value={notifications}
                  onValueChange={updateNotifications}
                  thumbColor={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primaryContainer }}
                />
              </Surface>
            }
          />
          
          <SettingsItem
            icon="sync"
            title="Data Sync"
            description="Automatically sync data in the background"
            rightElement={
              <Surface style={styles.switchContainer} elevation={1}>
                <Switch
                  value={dataSync}
                  onValueChange={updateDataSync}
                  thumbColor={theme.colors.primary}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primaryContainer }}
                />
              </Surface>
            }
            showDivider={false}
          />
        </Surface>

        {/* Support & Information Section */}
        <Surface style={styles.sectionCard} elevation={2}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Support & Information
            </Text>
          </View>
          
          <SettingsItem
            icon="lifebuoy"
            title="Help & Support"
            description="Get help with using the app"
            onPress={handleHelp}
            rightElement={
              <IconButton icon="chevron-right" size={20} iconColor={theme.colors.outline} />
            }
          />
          
          <SettingsItem
            icon="shield-check"
            title="Privacy Policy"
            description="Read our privacy policy"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be available soon.')}
            rightElement={
              <IconButton icon="chevron-right" size={20} iconColor={theme.colors.outline} />
            }
          />
          
          <SettingsItem
            icon="file-document-outline"
            title="Terms of Service"
            description="Read our terms of service"
            onPress={() => Alert.alert('Terms of Service', 'Terms of service will be available soon.')}
            rightElement={
              <IconButton icon="chevron-right" size={20} iconColor={theme.colors.outline} />
            }
          />
          
          <SettingsItem
            icon="information-outline"
            title="About DemCare"
            description="Version 1.0.0"
            onPress={() => Alert.alert('About DemCare', 'DemCare Patient Monitoring System\nVersion 1.0.0\n\nBuilt with ❤️ for healthcare professionals')}
            rightElement={
              <IconButton icon="chevron-right" size={20} iconColor={theme.colors.outline} />
            }
            showDivider={false}
          />
        </Surface>

        {/* Action Buttons Section */}
        <Surface style={styles.sectionCard} elevation={2}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={theme.colors.error} />
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.error }]}>
              Actions
            </Text>
          </View>
          
          <Button
            mode="outlined"
            onPress={handleResetSettings}
            style={[styles.actionButton, styles.resetButton]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: theme.colors.error }]}
            icon="restore"
          >
            Reset All Settings
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={[styles.actionButton, styles.signOutButton, { backgroundColor: theme.colors.error }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="logout"
          >
            Sign Out
          </Button>
        </Surface>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Enhanced Modal */}
      <Portal>
        <Modal 
          visible={showModal} 
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={5}>
            {modalType === 'signOut' && (
              <>
                <View style={styles.modalHeader}>
                  <MaterialCommunityIcons name="logout" size={32} color={theme.colors.error} />
                  <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.error }]}>
                    Sign Out
                  </Text>
                </View>
                <Text variant="bodyLarge" style={styles.modalDescription}>
                  Are you sure you want to sign out of your account?
                </Text>
                <View style={styles.modalActions}>
                  <Button mode="outlined" onPress={closeModal} style={styles.modalButton}>
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={executeSignOut} 
                    style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                  >
                    Sign Out
                  </Button>
                </View>
              </>
            )}

            {modalType === 'reset' && (
              <>
                <View style={styles.modalHeader}>
                  <MaterialCommunityIcons name="restore" size={32} color={theme.colors.error} />
                  <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.error }]}>
                    Reset Settings
                  </Text>
                </View>
                <Text variant="bodyLarge" style={styles.modalDescription}>
                  This will reset all settings to their default values. This action cannot be undone.
                </Text>
                <View style={styles.modalActions}>
                  <Button mode="outlined" onPress={closeModal} style={styles.modalButton}>
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={executeReset} 
                    style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                  >
                    Reset
                  </Button>
                </View>
              </>
            )}

            {modalType === 'help' && (
              <>
                <View style={styles.modalHeader}>
                  <MaterialCommunityIcons name="lifebuoy" size={32} color={theme.colors.primary} />
                  <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.primary }]}>
                    Help & Support
                  </Text>
                </View>
                <View style={styles.helpContent}>
                  <View style={styles.helpItem}>
                    <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.helpText}>support@demcare.com</Text>
                  </View>
                  <View style={styles.helpItem}>
                    <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.helpText}>+1 (555) 123-4567</Text>
                  </View>
                  <View style={styles.helpItem}>
                    <MaterialCommunityIcons name="web" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.helpText}>www.demcare.com/support</Text>
                  </View>
                </View>
                <View style={styles.modalActions}>
                  <Button mode="contained" onPress={closeModal} style={styles.modalButtonFull}>
                    Got it
                  </Button>
                </View>
              </>
            )}
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 140 : 120,
  },
  profileSection: {
    margin: 20,
    marginTop: 10,
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  roleChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  phoneNumber: {
    color: 'rgba(255,255,255,0.9)',
  },
  sectionCard: {
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  listDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  switchContainer: {
    borderRadius: 20,
    padding: 4,
  },
  divider: {
    marginLeft: 80,
    marginRight: 20,
    opacity: 0.2,
  },
  actionButton: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
  },
  resetButton: {
    borderWidth: 2,
  },
  signOutButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
  // Modal Styles
  modalContainer: {
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    maxWidth: width * 0.9,
    alignSelf: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  modalDescription: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  modalButtonFull: {
    borderRadius: 12,
  },
  helpContent: {
    marginBottom: 24,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpText: {
    marginLeft: 12,
    flex: 1,
  },
});
