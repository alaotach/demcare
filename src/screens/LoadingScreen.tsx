import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer, theme.colors.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }
            ]}
          >
            <View style={styles.logoBackground}>
              <MaterialCommunityIcons 
                name="medical-bag" 
                size={64} 
                color="white" 
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text 
              style={[styles.text, { color: 'white' }]} 
              variant="headlineLarge"
            >
              DemCare
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              {
                opacity: opacityAnim,
              }
            ]}
          >
            <Text 
              style={[styles.subText, { color: 'rgba(255,255,255,0.8)' }]} 
              variant="titleMedium"
            >
              Patient Monitoring System
            </Text>
          </Animated.View>

          <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <MaterialCommunityIcons 
                name="loading" 
                size={32} 
                color="rgba(255,255,255,0.9)" 
              />
            </Animated.View>
            <Text variant="bodyLarge" style={styles.loadingText}>
              Loading...
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    marginTop: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginLeft: 12,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
});
