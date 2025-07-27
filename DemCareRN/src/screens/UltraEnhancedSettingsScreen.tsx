import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Linking,
  Dimensions,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  List,
  useTheme,
  Divider,
  Button,
  Surface,
  Avatar,
  IconButton,
  Dialog,
  Portal,
  RadioButton,
  Chip,
  ProgressBar,
  Badge,
  Searchbar,
  Menu,
  Tooltip,
  TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import NotificationSettingsDialog from '../components/NotificationSettingsDialog';
import StorageManagementDialog from '../components/StorageManagementDialog';

const { width, height } = Dimensions.get('window');

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  items: SettingItem[];
  color?: string;
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'switch' | 'button' | 'navigation' | 'slider' | 'dropdown';
  value?: any;
  options?: { label: string; value: any }[];
  onPress?: () => void;
  onChange?: (value: any) => void;
  badge?: string;
  disabled?: boolean;
  premium?: boolean;
}

interface Props {
  navigation?: any;
}

export default function UltraEnhancedSettingsScreen({ navigation }: Props = {}) {
  const theme = useTheme();
  const { user, signOut } = useAuthStore();
  const { 
    theme: currentTheme, 
    notifications, 
    dataSync, 
    updateTheme, 
    updateNotifications, 
    updateDataSync,
    resetSettings 
  } = useSettingsStore();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['preferences', 'account']);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoLock, setAutoLock] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [dataUsage, setDataUsage] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);

  // Dialog states
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [signOutDialogVisible, setSignOutDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [notificationDialogVisible, setNotificationDialogVisible] = useState(false);
  const [storageDialogVisible, setStorageDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Premium features mock - for demo purposes, assume doctors have premium features
  const [isPremium] = useState(user?.role === 'doctor' || user?.role === 'physician');

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      // Mock data loading
      setDataUsage(Math.random() * 500);
      setStorageUsed(Math.random() * 100);
    } catch (error) {
      console.error('Error loading storage data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStorageData();
    setRefreshing(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
      setSignOutDialogVisible(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Your data has been exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    } finally {
      setLoading(false);
      setExportDialogVisible(false);
    }
  };

  const handleResetSettings = async () => {
    setLoading(true);
    try {
      await resetSettings();
      Alert.alert('Success', 'Settings have been reset to defaults.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset settings.');
    } finally {
      setLoading(false);
      setResetDialogVisible(false);
    }
  };

  const settingSections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'account-circle',
      color: theme.colors.primary,
      items: [
        {
          id: 'edit_profile',
          title: 'Edit Profile',
          description: 'Update your personal information',
          icon: 'account-edit',
          type: 'navigation',
          onPress: () => Alert.alert('Edit Profile', 'Profile editing screen will open here'),
        },
        {
          id: 'change_password',
          title: 'Change Password',
          description: 'Update your account password',
          icon: 'lock-reset',
          type: 'navigation',
          onPress: () => Alert.alert('Change Password', 'Password change screen will open here'),
        },
        {
          id: 'biometric',
          title: 'Biometric Authentication',
          description: 'Use fingerprint or face ID to unlock',
          icon: 'fingerprint',
          type: 'switch',
          value: biometric,
          onChange: setBiometric,
          premium: true,
        },
        {
          id: 'auto_lock',
          title: 'Auto Lock',
          description: 'Automatically lock app when inactive',
          icon: 'lock-clock',
          type: 'switch',
          value: autoLock,
          onChange: setAutoLock,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'cog',
      color: theme.colors.secondary,
      items: [
        {
          id: 'theme',
          title: 'App Theme',
          description: `Current: ${currentTheme === 'light' ? 'Light' : 'Dark'}`,
          icon: 'palette',
          type: 'button',
          onPress: () => setThemeDialogVisible(true),
        },
        {
          id: 'language',
          title: 'Language',
          description: 'English (US)',
          icon: 'translate',
          type: 'button',
          onPress: () => setLanguageDialogVisible(true),
        },
        {
          id: 'notifications',
          title: 'Push Notifications',
          description: 'Receive alerts and updates',
          icon: 'bell',
          type: 'button',
          value: notifications,
          onChange: updateNotifications,
          onPress: () => setNotificationDialogVisible(true),
          badge: notifications ? 'ON' : 'OFF',
        },
        {
          id: 'data_sync',
          title: 'Data Synchronization',
          description: 'Sync data across devices',
          icon: 'sync',
          type: 'switch',
          value: dataSync,
          onChange: updateDataSync,
        },
      ],
    },
    {
      id: 'data_privacy',
      title: 'Data & Privacy',
      icon: 'shield-account',
      color: theme.colors.tertiary,
      items: [
        {
          id: 'export_data',
          title: 'Export Data',
          description: 'Download your patient data',
          icon: 'download',
          type: 'button',
          onPress: () => setExportDialogVisible(true),
        },
        {
          id: 'data_usage',
          title: 'Data Usage',
          description: `${dataUsage.toFixed(1)} MB used this month`,
          icon: 'chart-line',
          type: 'navigation',
          onPress: () => Alert.alert('Data Usage', 'Data usage analytics will be available soon.'),
        },
        {
          id: 'storage',
          title: 'Storage',
          description: `${storageUsed.toFixed(1)}% of 1GB used`,
          icon: 'harddisk',
          type: 'button',
          onPress: () => setStorageDialogVisible(true),
        },
        {
          id: 'privacy_policy',
          title: 'Privacy Policy',
          description: 'View our privacy policy',
          icon: 'file-document',
          type: 'navigation',
          onPress: () => Linking.openURL('https://demcare.com/privacy'),
        },
      ],
    },
    {
      id: 'support',
      title: 'Support & Help',
      icon: 'help-circle',
      color: theme.colors.error,
      items: [
        {
          id: 'contact_support',
          title: 'Contact Support',
          description: '24/7 support available',
          icon: 'message-text',
          type: 'navigation',
          onPress: () => Alert.alert(
            'Contact Support',
            'Choose your preferred contact method',
            [
              { text: 'Email', onPress: () => Linking.openURL('mailto:support@demcare.com') },
              { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') },
              { text: 'Live Chat', onPress: () => {} },
              { text: 'Cancel', style: 'cancel' },
            ]
          ),
          premium: true,
        },
        {
          id: 'user_guide',
          title: 'User Guide',
          description: 'Learn how to use DemCare',
          icon: 'book-open',
          type: 'navigation',
          onPress: () => Linking.openURL('https://demcare.com/guide'),
        },
        {
          id: 'faq',
          title: 'FAQ',
          description: 'Frequently asked questions',
          icon: 'frequently-asked-questions',
          type: 'navigation',
          onPress: () => Linking.openURL('https://demcare.com/faq'),
        },
        {
          id: 'report_bug',
          title: 'Report a Bug',
          description: 'Help us improve the app',
          icon: 'bug',
          type: 'navigation',
          onPress: () => Linking.openURL('mailto:bugs@demcare.com'),
        },
      ],
    },
    {
      id: 'about',
      title: 'About DemCare',
      icon: 'information',
      color: theme.colors.outline,
      items: [
        {
          id: 'version',
          title: 'Version',
          description: '2.1.0 (Build 121)',
          icon: 'information-outline',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'whats_new',
          title: "What's New",
          description: 'See the latest features',
          icon: 'new-box',
          type: 'navigation',
          onPress: () => Alert.alert("What's New", 'Latest features and improvements will be shown here.'),
          badge: 'NEW',
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          description: 'View our terms of service',
          icon: 'file-document-outline',
          type: 'navigation',
          onPress: () => Linking.openURL('https://demcare.com/terms'),
        },
        {
          id: 'share',
          title: 'Share App',
          description: 'Recommend DemCare to others',
          icon: 'share',
          type: 'navigation',
          onPress: async () => {
            try {
              await Share.share({
                message: 'Check out DemCare - Advanced Patient Monitoring System',
                url: 'https://demcare.app',
              });
            } catch (error) {
              console.error('Error sharing:', error);
            }
          },
        },
        {
          id: 'rate',
          title: 'Rate App',
          description: 'Rate us on the App Store',
          icon: 'star',
          type: 'navigation',
          onPress: () => Alert.alert('Rate App', 'App store rating will be available soon.'),
        },
      ],
    },
  ];

  const filteredSections = settingSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.profileSection, { opacity: headerOpacity }]}>
          {navigation && (
            <IconButton
              icon="arrow-left"
              iconColor="#FFFFFF"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
          )}
          <Avatar.Image
            size={80}
            source={{ uri: `https://ui-avatars.com/api/?source=${user?.fullName}&background=6200ee&color=fff` }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.fullName}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
            <View style={styles.badgeContainer}>
              <Chip
                icon="account-circle"
                style={styles.roleChip}
                textStyle={{ color: '#FFFFFF' }}
              >
                {user?.role?.toUpperCase()}
              </Chip>
              {isPremium && (
                <Chip
                  icon="crown"
                  style={styles.premiumChip}
                  textStyle={{ color: '#FFD700' }}
                >
                  PREMIUM
                </Chip>
              )}
            </View>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                iconColor="#FFFFFF"
                size={24}
                onPress={() => setMenuVisible(true)}
                style={styles.menuButton}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Edit Profile', 'Profile editing will be available soon.');
              }} 
              title="Edit Profile" 
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                setResetDialogVisible(true);
              }} 
              title="Reset Settings" 
              leadingIcon="restore"
            />
          </Menu>
        </Animated.View>
      </LinearGradient>
    </Surface>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search settings..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={theme.colors.primary}
      />
    </View>
  );

  const renderSettingItem = (item: SettingItem) => {
    const isDisabled = item.disabled || (item.premium && !isPremium);
    
    return (
      <TouchableRipple
        key={item.id}
        onPress={item.onPress}
        disabled={isDisabled}
        style={[styles.settingItem, isDisabled && styles.disabledItem]}
      >
        <View style={styles.settingItemContent}>
          <View style={styles.settingItemLeft}>
            <Surface style={styles.iconContainer} elevation={1}>
              <Icon
                source={item.icon} 
                size={20} 
                color={isDisabled ? theme.colors.outline : theme.colors.primary} 
              />
            </Surface>
            <View style={styles.settingItemText}>
              <View style={styles.titleRow}>
                <Text 
                  variant="bodyLarge" 
                  style={[
                    styles.settingTitle,
                    isDisabled && { color: theme.colors.outline }
                  ]}
                >
                  {item.title}
                </Text>
                {item.badge && (
                  <Badge style={styles.badge}>{item.badge}</Badge>
                )}
                {item.premium && !isPremium && (
                  <Chip
                    icon="crown"
                    style={styles.premiumTag}
                    textStyle={styles.premiumTagText}
                  >
                    PRO
                  </Chip>
                )}
              </View>
              <Text 
                variant="bodySmall" 
                style={[
                  styles.settingDescription,
                  isDisabled && { color: theme.colors.outline }
                ]}
              >
                {item.description}
              </Text>
            </View>
          </View>
          <View style={styles.settingItemRight}>
            {item.type === 'switch' && (
              <Switch
                value={item.value}
                onValueChange={item.onChange}
                disabled={isDisabled}
                thumbColor={theme.colors.primary}
                trackColor={{ 
                  false: theme.colors.outline, 
                  true: theme.colors.primaryContainer 
                }}
              />
            )}
            {item.type === 'navigation' && (
              <IconButton 
                icon="chevron-right" 
                size={20} 
                iconColor={theme.colors.outline}
                disabled={isDisabled}
              />
            )}
            {item.type === 'button' && (
              <Button 
                mode="outlined" 
                onPress={item.onPress}
                disabled={isDisabled}
                style={styles.actionButton}
              >
                Change
              </Button>
            )}
          </View>
        </View>
      </TouchableRipple>
    );
  };

  const renderSection = (section: SettingSection) => {
    const isExpanded = expandedSections.includes(section.id);
    
    return (
      <Card key={section.id} style={styles.sectionCard}>
        <TouchableRipple onPress={() => toggleSection(section.id)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Surface style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]} elevation={1}>
                <Icon
                  source={section.icon} 
                  size={24} 
                  color={section.color} 
                />
              </Surface>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                {section.title}
              </Text>
            </View>
            <IconButton
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              iconColor={theme.colors.outline}
            />
          </View>
        </TouchableRipple>
        {isExpanded && (
          <Card.Content style={styles.sectionContent}>
            {section.items.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < section.items.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))}
          </Card.Content>
        )}
      </Card>
    );
  };

  const renderSignOutSection = () => (
    <Card style={[styles.sectionCard, styles.signOutCard]}>
      <Card.Content>
        <Button
          mode="contained"
          icon="logout"
          onPress={() => setSignOutDialogVisible(true)}
          style={[styles.signOutButton, { backgroundColor: theme.colors.error }]}
          contentStyle={styles.signOutButtonContent}
          labelStyle={{ color: '#FFFFFF' }}
        >
          Sign Out
        </Button>
      </Card.Content>
    </Card>
  );

  const renderDialogs = () => (
    <Portal>
      {/* Theme Selection Dialog */}
      <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)}>
        <Dialog.Title>Choose Theme</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={(value) => updateTheme(value as 'light' | 'dark')}
            value={currentTheme}
          >
            <RadioButton.Item label="Light Theme" value="light" />
            <RadioButton.Item label="Dark Theme" value="dark" />
            <RadioButton.Item label="System Default" value="system" />
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setThemeDialogVisible(false)}>Done</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Language Selection Dialog */}
      <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
        <Dialog.Title>Choose Language</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={setSelectedLanguage}
            value={selectedLanguage}
          >
            <RadioButton.Item label="English (US)" value="en" />
            <RadioButton.Item label="Spanish" value="es" />
            <RadioButton.Item label="French" value="fr" />
            <RadioButton.Item label="German" value="de" />
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLanguageDialogVisible(false)}>Cancel</Button>
          <Button onPress={() => {
            setLanguageDialogVisible(false);
            Alert.alert('Language Changed', 'Language will be updated after app restart.');
          }}>Apply</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog visible={exportDialogVisible} onDismiss={() => setExportDialogVisible(false)}>
        <Dialog.Title>Export Data</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            This will export all your patient data, settings, and preferences to a secure file.
          </Text>
          {loading && <ProgressBar indeterminate style={{ marginBottom: 16 }} />}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setExportDialogVisible(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={handleExportData} loading={loading}>
            Export
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
        <Dialog.Title>Reset Settings</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            This will reset all settings to their default values. This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
          <Button onPress={handleResetSettings} loading={loading}>
            Reset
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Sign Out Confirmation Dialog */}
      <Dialog visible={signOutDialogVisible} onDismiss={() => setSignOutDialogVisible(false)}>
        <Dialog.Title>Sign Out</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you want to sign out? You'll need to sign in again to access your account.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setSignOutDialogVisible(false)}>Cancel</Button>
          <Button onPress={handleSignOut} loading={loading}>
            Sign Out
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderHeader()}
        {renderSearchBar()}
        
        {filteredSections.map(renderSection)}
        {renderSignOutSection()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderDialogs()}
      
      {/* Notification Settings Dialog */}
      <NotificationSettingsDialog
        visible={notificationDialogVisible}
        onClose={() => setNotificationDialogVisible(false)}
      />
      
      {/* Storage Management Dialog */}
      <StorageManagementDialog
        visible={storageDialogVisible}
        onClose={() => setStorageDialogVisible(false)}
      />
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumChip: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 3,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  sectionContent: {
    paddingTop: 0,
  },
  settingItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontWeight: '600',
    flex: 1,
  },
  settingDescription: {
    opacity: 0.7,
    lineHeight: 16,
  },
  settingItemRight: {
    marginLeft: 12,
  },
  badge: {
    marginLeft: 8,
  },
  premiumTag: {
    marginLeft: 8,
    backgroundColor: '#FFD700',
    height: 20,
  },
  premiumTagText: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
  },
  actionButton: {
    minWidth: 80,
  },
  divider: {
    marginVertical: 8,
    marginLeft: 44,
  },
  signOutCard: {
    marginTop: 20,
    marginBottom: 20,
  },
  signOutButton: {
    borderRadius: 12,
  },
  signOutButtonContent: {
    paddingVertical: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
