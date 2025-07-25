import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

export default function App() {
  const { isLoading, initializeAuth } = useAuthStore();
  const { theme, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    initializeAuth();
  }, []);

  const paperTheme = theme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
