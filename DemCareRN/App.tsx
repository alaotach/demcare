import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { 
  PaperProvider, 
  MD3DarkTheme, 
  MD3LightTheme
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

// Enhanced Theme Configuration
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    primaryContainer: '#E3F2FD',
    secondary: '#5AC8FA',
    secondaryContainer: '#E1F5FE',
    tertiary: '#34C759',
    tertiaryContainer: '#E8F5E8',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#FF3B30',
    errorContainer: '#FFEBEE',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#001D35',
    onSecondary: '#FFFFFF',
    onSurface: '#1C1C1E',
    onBackground: '#1C1C1E',
    outline: '#8E8E93',
    shadow: '#000000',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#0A84FF',
    primaryContainer: '#003258',
    secondary: '#64D2FF',
    secondaryContainer: '#004F5C',
    tertiary: '#30D158',
    tertiaryContainer: '#003A16',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    background: '#000000',
    error: '#FF453A',
    errorContainer: '#93000A',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#CCE7FF',
    onSecondary: '#FFFFFF',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    outline: '#8E8E93',
    shadow: '#000000',
  },
};

export default function App() {
  const { isLoading, initializeAuth } = useAuthStore();
  const { theme, loadSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize app settings and auth
    const initializeApp = async () => {
      await loadSettings();
      initializeAuth();
    };

    initializeApp();
  }, []);

  const paperTheme = theme === 'dark' ? customDarkTheme : customLightTheme;

  if (isLoading) {
    return (
      <PaperProvider theme={paperTheme}>
        <LoadingScreen />
      </PaperProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <StatusBar 
            barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
            translucent={Platform.OS === 'android'}
          />
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
