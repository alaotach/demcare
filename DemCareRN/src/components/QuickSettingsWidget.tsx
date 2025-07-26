import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  IconButton,
  useTheme,
  Surface,
  TouchableRipple,
  Chip,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useSettingsStore } from '../store/settingsStore';

const { width } = Dimensions.get('window');

interface Props {
  onOpenFullSettings: () => void;
}

export default function QuickSettingsWidget({ onOpenFullSettings }: Props) {
  const theme = useTheme();
  const { 
    theme: currentTheme, 
    notifications, 
    dataSync, 
    updateTheme, 
    updateNotifications, 
    updateDataSync 
  } = useSettingsStore();

  const [expanded, setExpanded] = useState(false);

  const quickSettings = [
    {
      id: 'theme',
      title: 'Dark Mode',
      icon: 'theme-light-dark',
      value: currentTheme === 'dark',
      onChange: (value: boolean) => updateTheme(value ? 'dark' : 'light'),
      color: theme.colors.primary,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell',
      value: notifications,
      onChange: updateNotifications,
      color: theme.colors.secondary,
    },
    {
      id: 'sync',
      title: 'Auto Sync',
      icon: 'sync',
      value: dataSync,
      onChange: updateDataSync,
      color: theme.colors.tertiary,
    },
  ];

  const renderQuickSetting = (setting: any) => (
    <View key={setting.id} style={styles.quickSettingItem}>
      <View style={styles.quickSettingLeft}>
        <Surface 
          style={[styles.quickSettingIcon, { backgroundColor: setting.color + '20' }]} 
          elevation={1}
        >
          <MaterialCommunityIcons 
            name={setting.icon} 
            size={20} 
            color={setting.color} 
          />
        </Surface>
        <Text variant="bodyMedium" style={styles.quickSettingTitle}>
          {setting.title}
        </Text>
      </View>
      <Switch
        value={setting.value}
        onValueChange={setting.onChange}
        thumbColor={setting.color}
        trackColor={{ 
          false: theme.colors.outline, 
          true: setting.color + '40' 
        }}
      />
    </View>
  );

  return (
    <Card style={styles.container} elevation={3}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceVariant]}
        style={styles.gradient}
      >
        <TouchableRipple onPress={() => setExpanded(!expanded)} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.headerTitle}>
                Quick Settings
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Chip 
                style={styles.statusChip}
                textStyle={styles.statusChipText}
              >
                {quickSettings.filter(s => s.value).length}/{quickSettings.length}
              </Chip>
              <IconButton
                icon={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                iconColor={theme.colors.outline}
              />
            </View>
          </View>
        </TouchableRipple>

        {expanded && (
          <View style={styles.content}>
            {quickSettings.map(renderQuickSetting)}
            
            <View style={styles.actions}>
              <TouchableRipple onPress={onOpenFullSettings} style={styles.fullSettingsButton}>
                <View style={styles.fullSettingsContent}>
                  <MaterialCommunityIcons name="cog-outline" size={18} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={[styles.fullSettingsText, { color: theme.colors.primary }]}>
                    All Settings
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.primary} />
                </View>
              </TouchableRipple>
            </View>
          </View>
        )}
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 12,
  },
  header: {
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  quickSettingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickSettingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickSettingTitle: {
    fontWeight: '600',
  },
  actions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  fullSettingsButton: {
    borderRadius: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
  },
  fullSettingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fullSettingsText: {
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '600',
  },
});
