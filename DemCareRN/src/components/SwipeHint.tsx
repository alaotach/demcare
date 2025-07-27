import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Portal,
  Modal,
} from 'react-native-paper';
import MaterialIcon from './MaterialIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeHintProps {
  visible: boolean;
  onDismiss: () => void;
  currentIndex: number;
  totalScreens: number;
}

export default function SwipeHint({ visible, onDismiss, currentIndex, totalScreens }: SwipeHintProps) {
  const theme = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, onDismiss]);

  const getScreenName = (index: number) => {
    const names = ['Dashboard', 'Camera Feed', 'Settings'];
    return names[index] || 'Screen';
  };

  const getHintText = () => {
    if (currentIndex === 0) {
      return 'Swipe left to access Camera Feed';
    } else if (currentIndex === totalScreens - 1) {
      return 'Swipe right to go back to Dashboard';
    } else {
      return 'Swipe left or right to navigate';
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} dismissable>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Surface style={[styles.hintCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <IconButton
              icon="close"
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
              style={styles.closeButton}
              onPress={onDismiss}
            />
            
            <View style={styles.content}>
              <MaterialIcon 
                source="gesture-swipe-horizontal" 
                size={32} 
                color={theme.colors.primary}
                style={styles.icon}
              />
              
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
                Swipe Navigation
              </Text>
              
              <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                {getHintText()}
              </Text>
              
              <View style={styles.indicatorContainer}>
                {Array.from({ length: totalScreens }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: index === currentIndex 
                          ? theme.colors.primary 
                          : theme.colors.outline,
                        opacity: index === currentIndex ? 1 : 0.3,
                      },
                    ]}
                  />
                ))}
              </View>
              
              <Text variant="bodySmall" style={[styles.currentScreen, { color: theme.colors.primary }]}>
                {getScreenName(currentIndex)}
              </Text>
            </View>
          </Surface>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  hintCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: 8,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  currentScreen: {
    fontWeight: '600',
    fontSize: 12,
  },
});
