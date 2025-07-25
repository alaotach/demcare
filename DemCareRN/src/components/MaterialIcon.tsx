import React from 'react';
import { Icon } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export default function MaterialIcon({ name, size = 24, color, style }: MaterialIconProps) {
  try {
    // Try to use MaterialCommunityIcons first
    return (
      <MaterialCommunityIcons 
        name={name} 
        size={size} 
        color={color} 
        style={style}
      />
    );
  } catch (error) {
    // Fallback to React Native Paper Icon if MaterialCommunityIcons fails
    console.warn(`MaterialCommunityIcons failed for icon: ${name}, using Paper Icon fallback`);
    return (
      <Icon 
        source={name}
        size={size}
        color={color}
      />
    );
  }
}
