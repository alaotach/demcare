import { create } from 'zustand';
import { AppSettings } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface SettingsStore extends AppSettings {
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;
  updateNotifications: (enabled: boolean) => Promise<void>;
  updateDataSync: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  notifications: true,
  dataSync: true
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,

  updateTheme: async (theme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem('app_theme', theme);
      set({ theme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  },

  updateNotifications: async (notifications: boolean) => {
    try {
      await AsyncStorage.setItem('app_notifications', JSON.stringify(notifications));
      set({ notifications });
    } catch (error) {
      console.error('Failed to update notifications setting:', error);
    }
  },

  updateDataSync: async (dataSync: boolean) => {
    try {
      await AsyncStorage.setItem('app_data_sync', JSON.stringify(dataSync));
      set({ dataSync });
    } catch (error) {
      console.error('Failed to update data sync setting:', error);
    }
  },

  loadSettings: async () => {
    try {
      const [themeValue, notificationsValue, dataSyncValue] = await Promise.all([
        AsyncStorage.getItem('app_theme'),
        AsyncStorage.getItem('app_notifications'),
        AsyncStorage.getItem('app_data_sync')
      ]);

      const systemColorScheme = Appearance.getColorScheme();
      const theme = themeValue || systemColorScheme || 'light';
      const notifications = notificationsValue ? JSON.parse(notificationsValue) : true;
      const dataSync = dataSyncValue ? JSON.parse(dataSyncValue) : true;

      set({
        theme: theme as 'light' | 'dark',
        notifications,
        dataSync
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set(defaultSettings);
    }
  },

  resetSettings: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('app_theme'),
        AsyncStorage.removeItem('app_notifications'),
        AsyncStorage.removeItem('app_data_sync')
      ]);
      set(defaultSettings);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }
}));
