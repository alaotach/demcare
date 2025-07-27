import React from 'react';
import { Icon } from 'react-native-paper';
import { Text } from 'react-native';

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Map complex icon names to simple ones that React Native Paper supports
const iconMapping: { [key: string]: string } = {
  // Navigation icons
  'view-dashboard': 'grid',
  'account-heart': 'heart',
  'account-heart-outline': 'heart-outline',
  'camera-outline': 'camera',
  'cog-outline': 'cog',
  'crown-outline': 'star-outline',
  'crown': 'star',
  
  // Dashboard stats icons
  'account-group': 'account-group',
  'check-circle': 'check-circle',
  'alert-circle': 'alert-circle',
  'circle-outline': 'circle-outline',
  'heart-pulse': 'heart',
  'water-percent': 'water',
  'lungs': 'lungs',
  'walk': 'walk',
  
  // Quick actions icons
  'account-plus': 'account-plus',
  'chart-line': 'chart-line',
  'calendar-check': 'calendar-check',
  'plus': 'plus',
  'bell-ring': 'bell',
  'bell': 'bell',
  
  // Vital signs icons
  'water': 'water',
  'emoticon-cry': 'emoticon-sad',
  'emoticon-sad': 'emoticon-sad',
  'emoticon-neutral': 'emoticon-neutral',
  'emoticon-happy': 'emoticon-happy',
  'emoticon-excited': 'emoticon-happy',
  
  // Medical and other icons
  'shield-check': 'shield',
  'certificate': 'certificate',
  'medical-bag': 'medical-bag',
  'account-check': 'check',
  'sleep': 'sleep',
  'information': 'information',
  'contacts': 'contacts',
  'phone': 'phone',
  'wifi': 'wifi',
  'account': 'account',
  'home': 'home',
  'video': 'video',
  'help-circle': 'help-circle',
  'calendar': 'calendar',
  'circle': 'circle',
  'close-circle': 'close-circle',
  'bluetooth': 'bluetooth',
  
  // Common fallbacks
  'default': 'circle'
};

export default function MaterialIcon({ name, size = 24, color, style }: MaterialIconProps) {
  // Map the icon name to a supported one
  const mappedName = iconMapping[name] || name;
  
  return (
    <Icon 
      source={mappedName}
      size={size}
      color={color}
    />
  );
}
