import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  StatusBar,
  Platform 
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const dotsAnim1 = useRef(new Animated.Value(0)).current;
  const dotsAnim2 = useRef(new Animated.Value(0)).current;
  const dotsAnim3 = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Minimum loading screen time in ms
  const MIN_LOADING_TIME = 1500;

  useEffect(() => {
    const start = Date.now();
    // Initial entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Continuous pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots animation
    const createDotAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dotsAnim1, 0),
      createDotAnimation(dotsAnim2, 200),
      createDotAnimation(dotsAnim3, 400),
    ]).start();

    // Progress bar animation
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();

    // Rotation animation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Enforce minimum loading time for smoother experience
    return () => {
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_TIME) {
        const remaining = MIN_LOADING_TIME - elapsed;
        const now = Date.now();
        while (Date.now() - now < remaining) {
          // Busy wait (not ideal, but React Native doesn't support blocking UI thread)
        }
      }
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      <View style={styles.container}>
        <LinearGradient
          colors={[
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#f5576c',
            '#4facfe',
            '#00f2fe'
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
        >
          {/* Animated Background Elements */}
          <Animated.View 
            style={[
              styles.backgroundCircle1,
              { transform: [{ rotate }] }
            ]}
          />
          <Animated.View 
            style={[
              styles.backgroundCircle2,
              { transform: [{ rotate: rotate }] }
            ]}
          />

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideUpAnim }
                ]
              }
            ]}
          >
            {/* Logo Container */}
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={styles.logoBackground}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.logoGradient}
                >
                  <Icon
                    source="medical-bag" 
                    size={72} 
                    color="white" 
                  />
                </LinearGradient>
              </View>
              
              {/* Decorative Ring */}
              <Animated.View 
                style={[
                  styles.decorativeRing,
                  { transform: [{ rotate }] }
                ]}
              />
            </Animated.View>

            {/* App Title */}
            <Animated.View
              style={[
                styles.titleContainer,
                { opacity: opacityAnim }
              ]}
            >
              <Text 
                style={styles.title} 
                variant="displaySmall"
              >
                DemCare
              </Text>
              <View style={styles.titleUnderline} />
            </Animated.View>

            {/* Subtitle */}
            <Animated.View
              style={[
                styles.subtitleContainer,
                { opacity: opacityAnim }
              ]}
            >
              <Text 
                style={styles.subtitle} 
                variant="titleLarge"
              >
                Patient Monitoring System
              </Text>
              <Text 
                style={styles.tagline} 
                variant="bodyLarge"
              >
                Caring Through Technology
              </Text>
            </Animated.View>

            {/* Loading Section */}
            <Animated.View 
              style={[
                styles.loadingSection,
                { opacity: opacityAnim }
              ]}
            >
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { width: progressWidth }
                    ]}
                  />
                </View>
              </View>

              {/* Loading Text with Animated Dots */}
              <View style={styles.loadingTextContainer}>
                <Text style={styles.loadingText}>Loading</Text>
                <View style={styles.dotsContainer}>
                  <Animated.Text 
                    style={[
                      styles.dot,
                      { opacity: dotsAnim1 }
                    ]}
                  >
                    •
                  </Animated.Text>
                  <Animated.Text 
                    style={[
                      styles.dot,
                      { opacity: dotsAnim2 }
                    ]}
                  >
                    •
                  </Animated.Text>
                  <Animated.Text 
                    style={[
                      styles.dot,
                      { opacity: dotsAnim3 }
                    ]}
                  >
                    •
                  </Animated.Text>
                </View>
              </View>

              {/* Status Text */}
              <Text style={styles.statusText}>
                Initializing secure connection...
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Bottom Branding */}
          <Animated.View 
            style={[
              styles.bottomBranding,
              { opacity: opacityAnim }
            ]}
          >
            <Icon
              source="shield-check" 
              size={16} 
              color="rgba(255,255,255,0.8)" 
            />
            <Text style={styles.brandingText}>
              Secure • Reliable • Professional
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    fontSize: 42,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
    marginTop: 8,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  loadingSection: {
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 3,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  dot: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    marginHorizontal: 2,
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bottomBranding: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 8,
    letterSpacing: 1,
    fontWeight: '500',
  },
});
