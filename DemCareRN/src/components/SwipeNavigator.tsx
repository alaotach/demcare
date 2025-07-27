import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  PanResponder,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeNavigatorProps {
  children: React.ReactNode[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  swipeThreshold?: number;
  animationDuration?: number;
}

const SwipeNavigator: React.FC<SwipeNavigatorProps> = ({
  children,
  initialIndex = 0,
  onIndexChange,
  swipeThreshold = SCREEN_WIDTH * 0.25,
  animationDuration = 300,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useRef(new Animated.Value(-currentIndex * SCREEN_WIDTH)).current;
  const isAnimating = useRef(false);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  const animateToIndex = (index: number, duration = animationDuration) => {
    if (isAnimating.current || index < 0 || index >= children.length) return;
    
    isAnimating.current = true;
    const toValue = -index * SCREEN_WIDTH;
    
    Animated.timing(translateX, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
    
    setCurrentIndex(index);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(-currentIndex * SCREEN_WIDTH);
        translateX.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: translateX }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();
        
        const { dx, vx } = gestureState;
        let newIndex = currentIndex;
        
        // High velocity swipe
        if (Math.abs(vx) > 0.5) {
          if (vx > 0 && currentIndex > 0) {
            newIndex = currentIndex - 1; // Swipe right (go to previous)
          } else if (vx < 0 && currentIndex < children.length - 1) {
            newIndex = currentIndex + 1; // Swipe left (go to next)
          }
        }
        // Distance-based swipe
        else if (Math.abs(dx) > swipeThreshold) {
          if (dx > 0 && currentIndex > 0) {
            newIndex = currentIndex - 1; // Swipe right (go to previous)
          } else if (dx < 0 && currentIndex < children.length - 1) {
            newIndex = currentIndex + 1; // Swipe left (go to next)
          }
        }
        
        // Reset translateX and animate to new index
        translateX.setValue(-currentIndex * SCREEN_WIDTH);
        animateToIndex(newIndex);
      },
    })
  ).current;

  const renderScreen = (child: React.ReactNode, index: number) => (
    <View
      key={index}
      style={[
        styles.screen,
        {
          transform: [{ translateX: index * SCREEN_WIDTH }],
        },
      ]}
    >
      {child}
    </View>
  );

  const renderIndicators = () => (
    <View style={[styles.indicators, { bottom: insets.bottom + 20 }]}>
      {children.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.indicator,
            {
              backgroundColor: index === currentIndex 
                ? theme.colors.primary 
                : theme.colors.outline,
              opacity: index === currentIndex ? 1 : 0.5,
              transform: [
                {
                  scale: index === currentIndex ? 1.2 : 1,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      <Animated.View
        style={[
          styles.screensContainer,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children.map((child, index) => renderScreen(child, index))}
      </Animated.View>
      
      {children.length > 1 && renderIndicators()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screensContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 10, // Accommodate multiple screens
  },
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  indicators: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
    zIndex: 1000,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default SwipeNavigator;
