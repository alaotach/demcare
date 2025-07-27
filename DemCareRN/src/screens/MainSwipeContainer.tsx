import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwipeNavigator from '../components/SwipeNavigator';
import SwipeHint from '../components/SwipeHint';
import UltraEnhancedDoctorDashboard from './doctor/UltraEnhancedDoctorDashboard';
import CameraFeedScreen from './CameraFeedScreen';
import UltraEnhancedSettingsScreen from './UltraEnhancedSettingsScreen';

interface MainSwipeContainerProps {
  navigation: any;
  route: any;
}

export default function MainSwipeContainer({ navigation, route }: MainSwipeContainerProps) {
  const theme = useTheme();
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenSwipeHint = await AsyncStorage.getItem('hasSeenSwipeHint');
      if (!hasSeenSwipeHint) {
        setTimeout(() => {
          setShowSwipeHint(true);
        }, 1000); // Show hint after 1 second
      }
    } catch (error) {
      console.log('Error checking first time:', error);
    }
  };

  const handleDismissHint = async () => {
    setShowSwipeHint(false);
    try {
      await AsyncStorage.setItem('hasSeenSwipeHint', 'true');
    } catch (error) {
      console.log('Error saving hint preference:', error);
    }
  };

  const handleIndexChange = (index: number) => {
    setCurrentScreenIndex(index);
    
    // Update navigation title based on current screen
    const titles = ['Dashboard', 'Camera Feed', 'Settings'];
    navigation.setOptions({
      title: titles[index] || 'DemCare',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SwipeNavigator 
        initialIndex={0}
        onIndexChange={handleIndexChange}
        swipeThreshold={100}
        animationDuration={250}
      >
        {/* Screen 0: Doctor Dashboard */}
        <UltraEnhancedDoctorDashboard navigation={navigation} />
        
        {/* Screen 1: Camera Feed */}
        <CameraFeedScreen />
        
        {/* Screen 2: Settings */}
        <UltraEnhancedSettingsScreen />
      </SwipeNavigator>

      <SwipeHint
        visible={showSwipeHint}
        onDismiss={handleDismissHint}
        currentIndex={currentScreenIndex}
        totalScreens={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
