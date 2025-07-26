import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  List,
  useTheme,
  Divider,
  Button,
  Chip,
  Surface,
  IconButton,
  Dialog,
  Portal,
  RadioButton,
  Slider,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  frequency?: 'immediate' | 'hourly' | 'daily';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  sound?: boolean;
  vibration?: boolean;
  category: 'patient' | 'system' | 'social' | 'medical';
}

interface Props {
  onClose: () => void;
  visible: boolean;
}

export default function NotificationSettingsDialog({ onClose, visible }: Props) {
  const theme = useTheme();
  
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'vital_alerts',
      title: 'Vital Signs Alerts',
      description: 'Critical changes in patient vital signs',
      icon: 'heart-pulse',
      enabled: true,
      frequency: 'immediate',
      priority: 'critical',
      sound: true,
      vibration: true,
      category: 'medical',
    },
    {
      id: 'medication_reminders',
      title: 'Medication Reminders',
      description: 'Patient medication schedules and missed doses',
      icon: 'pill',
      enabled: true,
      frequency: 'immediate',
      priority: 'high',
      sound: true,
      vibration: false,
      category: 'medical',
    },
    {
      id: 'patient_movements',
      title: 'Patient Movement',
      description: 'Patient location changes and wandering alerts',
      icon: 'walk',
      enabled: true,
      frequency: 'immediate',
      priority: 'medium',
      sound: false,
      vibration: true,
      category: 'patient',
    },
    {
      id: 'fall_detection',
      title: 'Fall Detection',
      description: 'Immediate alerts for potential falls',
      icon: 'alert-circle',
      enabled: true,
      frequency: 'immediate',
      priority: 'critical',
      sound: true,
      vibration: true,
      category: 'medical',
    },
    {
      id: 'mood_updates',
      title: 'Mood Updates',
      description: 'Daily mood entries and significant changes',
      icon: 'emoticon-happy',
      enabled: false,
      frequency: 'daily',
      priority: 'low',
      sound: false,
      vibration: false,
      category: 'patient',
    },
    {
      id: 'sleep_patterns',
      title: 'Sleep Pattern Changes',
      description: 'Unusual sleep patterns or disturbances',
      icon: 'sleep',
      enabled: true,
      frequency: 'daily',
      priority: 'medium',
      sound: false,
      vibration: false,
      category: 'patient',
    },
    {
      id: 'system_updates',
      title: 'System Updates',
      description: 'App updates and maintenance notifications',
      icon: 'update',
      enabled: true,
      frequency: 'daily',
      priority: 'low',
      sound: false,
      vibration: false,
      category: 'system',
    },
    {
      id: 'data_sync',
      title: 'Data Sync Status',
      description: 'Sync failures and data backup notifications',
      icon: 'sync-alert',
      enabled: false,
      frequency: 'hourly',
      priority: 'medium',
      sound: false,
      vibration: false,
      category: 'system',
    },
  ]);

  const [quietHoursStart, setQuietHoursStart] = useState(22); // 10 PM
  const [quietHoursEnd, setQuietHoursEnd] = useState(7); // 7 AM
  const [enableQuietHours, setEnableQuietHours] = useState(true);
  const [globalNotifications, setGlobalNotifications] = useState(true);

  const updatePreference = (id: string, updates: Partial<NotificationPreference>) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, ...updates } : pref
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return 'medical-bag';
      case 'patient': return 'account';
      case 'system': return 'cog';
      case 'social': return 'account-group';
      default: return 'bell';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return theme.colors.error;
      case 'patient': return theme.colors.primary;
      case 'system': return theme.colors.outline;
      case 'social': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF1744';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return theme.colors.primary;
    }
  };

  const categorizedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const renderGlobalSettings = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="bell-cog" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Global Settings
          </Text>
        </View>
        
        <List.Item
          title="Enable All Notifications"
          description="Master switch for all notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={globalNotifications}
              onValueChange={setGlobalNotifications}
              thumbColor={theme.colors.primary}
            />
          )}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Quiet Hours"
          description={enableQuietHours ? `${formatTime(quietHoursStart)} - ${formatTime(quietHoursEnd)}` : 'Disabled'}
          left={(props) => <List.Icon {...props} icon="sleep" />}
          right={() => (
            <Switch
              value={enableQuietHours}
              onValueChange={setEnableQuietHours}
              thumbColor={theme.colors.primary}
            />
          )}
        />
        
        {enableQuietHours && (
          <View style={styles.quietHoursContainer}>
            <Text variant="bodyMedium" style={styles.sliderLabel}>
              Start: {formatTime(quietHoursStart)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={23}
              step={1}
              value={quietHoursStart}
              onValueChange={setQuietHoursStart}
              thumbColor={theme.colors.primary}
              minimumTrackTintColor={theme.colors.primary}
            />
            
            <Text variant="bodyMedium" style={styles.sliderLabel}>
              End: {formatTime(quietHoursEnd)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={23}
              step={1}
              value={quietHoursEnd}
              onValueChange={setQuietHoursEnd}
              thumbColor={theme.colors.primary}
              minimumTrackTintColor={theme.colors.primary}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderPreferenceItem = (preference: NotificationPreference) => (
    <View key={preference.id} style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <View style={styles.preferenceLeft}>
          <Surface style={styles.preferenceIcon} elevation={1}>
            <MaterialCommunityIcons 
              name={preference.icon} 
              size={20} 
              color={getCategoryColor(preference.category)} 
            />
          </Surface>
          <View style={styles.preferenceText}>
            <View style={styles.preferenceTitleRow}>
              <Text variant="bodyLarge" style={styles.preferenceTitle}>
                {preference.title}
              </Text>
              <Chip
                style={[styles.priorityChip, { backgroundColor: getPriorityColor(preference.priority!) + '20' }]}
                textStyle={[styles.priorityText, { color: getPriorityColor(preference.priority!) }]}
              >
                {preference.priority?.toUpperCase()}
              </Chip>
            </View>
            <Text variant="bodySmall" style={styles.preferenceDescription}>
              {preference.description}
            </Text>
          </View>
        </View>
        <Switch
          value={preference.enabled && globalNotifications}
          onValueChange={(value) => updatePreference(preference.id, { enabled: value })}
          disabled={!globalNotifications}
          thumbColor={theme.colors.primary}
        />
      </View>
      
      {preference.enabled && globalNotifications && (
        <View style={styles.preferenceDetails}>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>Frequency:</Text>
            <Chip style={styles.detailChip}>
              {preference.frequency?.toUpperCase()}
            </Chip>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.soundVibrationRow}>
              <View style={styles.soundVibrationItem}>
                <MaterialCommunityIcons 
                  name={preference.sound ? "volume-high" : "volume-off"} 
                  size={16} 
                  color={preference.sound ? theme.colors.primary : theme.colors.outline} 
                />
                <Text variant="bodySmall" style={styles.soundVibrationText}>Sound</Text>
                <Switch
                  value={preference.sound}
                  onValueChange={(value) => updatePreference(preference.id, { sound: value })}
                  style={styles.miniSwitch}
                />
              </View>
              
              <View style={styles.soundVibrationItem}>
                <MaterialCommunityIcons 
                  name={preference.vibration ? "vibrate" : "vibrate-off"} 
                  size={16} 
                  color={preference.vibration ? theme.colors.primary : theme.colors.outline} 
                />
                <Text variant="bodySmall" style={styles.soundVibrationText}>Vibration</Text>
                <Switch
                  value={preference.vibration}
                  onValueChange={(value) => updatePreference(preference.id, { vibration: value })}
                  style={styles.miniSwitch}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderCategory = (category: string, categoryPreferences: NotificationPreference[]) => (
    <Card key={category} style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <Surface style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) + '20' }]} elevation={1}>
            <MaterialCommunityIcons 
              name={getCategoryIcon(category)} 
              size={24} 
              color={getCategoryColor(category)} 
            />
          </Surface>
          <Text variant="titleMedium" style={styles.categoryTitle}>
            {category.charAt(0).toUpperCase() + category.slice(1)} Notifications
          </Text>
        </View>
        
        {categoryPreferences.map((preference, index) => (
          <View key={preference.id}>
            {renderPreferenceItem(preference)}
            {index < categoryPreferences.length - 1 && (
              <Divider style={styles.divider} />
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>Notification Settings</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderGlobalSettings()}
            
            {Object.entries(categorizedPreferences).map(([category, categoryPreferences]) =>
              renderCategory(category, categoryPreferences)
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onClose}>Close</Button>
          <Button 
            mode="contained" 
            onPress={() => {
              Alert.alert('Settings Saved', 'Your notification preferences have been updated.');
              onClose();
            }}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  quietHoursContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sliderLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  slider: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontWeight: 'bold',
  },
  preferenceItem: {
    paddingVertical: 8,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  preferenceTitle: {
    fontWeight: '600',
    flex: 1,
  },
  preferenceDescription: {
    opacity: 0.7,
    lineHeight: 16,
  },
  priorityChip: {
    height: 20,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  preferenceDetails: {
    marginLeft: 44,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 70,
  },
  detailChip: {
    height: 24,
  },
  soundVibrationRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  soundVibrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundVibrationText: {
    marginLeft: 6,
    marginRight: 8,
    flex: 1,
  },
  miniSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});
