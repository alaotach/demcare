import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Linking,
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

export default function EnhancedSettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuthStore();
  const { 
    theme: currentTheme, 
    notifications, 
    dataSync, 
    updateTheme, 
    updateNotifications, 
    updateDataSync 
  } = useSettingsStore();

  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [signOutDialogVisible, setSignOutDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out DemCare - Advanced Patient Monitoring System',
        url: 'https://demcare.app',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'How would you like to get support?',
      [
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@demcare.com') },
        { text: 'Phone Support', onPress: () => Linking.openURL('tel:+1234567890') },
        { text: 'Live Chat', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.profileSection}>
          <Avatar.Image
            size={80}
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.fullName}&background=6200ee&color=fff` }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.fullName}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
            <Chip
              icon="account-circle"
              style={styles.roleChip}
              textStyle={{ color: '#FFFFFF' }}
            >
              {user?.role?.toUpperCase()}
            </Chip>
          </View>
          <IconButton
            icon="pencil"
            iconColor="#FFFFFF"
            size={20}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing will be available soon.')}
            style={styles.editButton}
          />
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderPreferences = () => (
    <Card style={styles.settingsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            Preferences
          </Text>
        </View>
        
        <List.Item
          title="App Theme"
          description={`Current: ${currentTheme === 'light' ? 'Light' : 'Dark'}`}
          left={(props) => <List.Icon {...props} icon="palette" />}
          right={() => (
            <Button mode="outlined" onPress={() => setThemeDialogVisible(true)}>
              Change
            </Button>
          )}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Push Notifications"
          description="Receive alerts and updates"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={updateNotifications}
            />
          )}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Data Synchronization"
          description="Sync data across devices"
          left={(props) => <List.Icon {...props} icon="sync" />}
          right={() => (
            <Switch
              value={dataSync}
              onValueChange={updateDataSync}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderDataAndPrivacy = () => (
    <Card style={styles.settingsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="shield-account" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            Data & Privacy
          </Text>
        </View>
        
        <List.Item
          title="Export Data"
          description="Download your patient data"
          left={(props) => <List.Icon {...props} icon="download" />}
          onPress={() => Alert.alert('Export Data', 'Data export will be available soon.')}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Privacy Policy"
          description="View our privacy policy"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          onPress={() => Linking.openURL('https://demcare.com/privacy')}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Data Usage"
          description="See how your data is used"
          left={(props) => <List.Icon {...props} icon="chart-pie" />}
          onPress={() => Alert.alert('Data Usage', 'Data usage analytics will be available soon.')}
        />
      </Card.Content>
    </Card>
  );

  const renderSupport = () => (
    <Card style={styles.settingsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            Support & Help
          </Text>
        </View>
        
        <List.Item
          title="Contact Support"
          description="Get help from our team"
          left={(props) => <List.Icon {...props} icon="message-text" />}
          onPress={handleSupport}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="User Guide"
          description="Learn how to use DemCare"
          left={(props) => <List.Icon {...props} icon="book-open" />}
          onPress={() => Linking.openURL('https://demcare.com/guide')}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="FAQ"
          description="Frequently asked questions"
          left={(props) => <List.Icon {...props} icon="frequently-asked-questions" />}
          onPress={() => Linking.openURL('https://demcare.com/faq')}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Report a Bug"
          description="Help us improve the app"
          left={(props) => <List.Icon {...props} icon="bug" />}
          onPress={() => Linking.openURL('mailto:bugs@demcare.com')}
        />
      </Card.Content>
    </Card>
  );

  const renderAbout = () => (
    <Card style={styles.settingsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            About DemCare
          </Text>
        </View>
        
        <List.Item
          title="Version"
          description="1.0.0 (Build 1)"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Terms of Service"
          description="View our terms of service"
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          onPress={() => Linking.openURL('https://demcare.com/terms')}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Share App"
          description="Recommend DemCare to others"
          left={(props) => <List.Icon {...props} icon="share" />}
          onPress={handleShare}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Rate App"
          description="Rate us on the App Store"
          left={(props) => <List.Icon {...props} icon="star" />}
          onPress={() => Alert.alert('Rate App', 'App store rating will be available soon.')}
        />
      </Card.Content>
    </Card>
  );

  const renderSignOutButton = () => (
    <Card style={[styles.settingsCard, styles.signOutCard]}>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderPreferences()}
        {renderDataAndPrivacy()}
        {renderSupport()}
        {renderAbout()}
        {renderSignOutButton()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Theme Selection Dialog */}
      <Portal>
        <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => updateTheme(value as 'light' | 'dark')}
              value={currentTheme}
            >
              <RadioButton.Item label="Light Theme" value="light" />
              <RadioButton.Item label="Dark Theme" value="dark" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Sign Out Confirmation Dialog */}
      <Portal>
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
    marginTop: -50,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingTop: 74,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
  roleChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  signOutCard: {
    marginTop: 20,
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
