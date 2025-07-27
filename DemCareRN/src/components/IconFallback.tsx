import React from 'react';
import { Icon } from 'react-native-paper';

interface IconFallbackProps {
  name?: string;
  source?: string;
  size?: number;
  color?: string;
  style?: any;
}

// Comprehensive map of icon names to React Native Paper / Material Design icon names
const iconMap: { [key: string]: string } = {
  // Patient Location
  'patient-location': 'map-marker',
  'location': 'map-marker',
  'map': 'map-marker',
  'gps': 'crosshairs-gps',
  // Live Monitoring
  'live-monitoring': 'pulse',
  'monitor': 'pulse',
  'monitoring': 'pulse',
  'heart-pulse': 'heart-pulse',
  // Analytics
  'analytics': 'chart-line',
  'chart': 'chart-line',
  'chart-line': 'chart-line',
  'chart-bar': 'chart-bar',
  // Subscription
  'subscription': 'star',
  'star': 'star',
  'account-star': 'account-star',
  'premium': 'star',
  // Out of Range
  'out-of-range': 'alert',
  'alert': 'alert',
  'alert-circle': 'alert-circle-outline',
  'warning': 'alert',
  // Dashboard icons
  'account-group': 'account-group',
  'heart': 'heart',
  // 'heart-pulse': 'heart',  // Duplicate, keep the new mapping above
  // 'alert-circle': 'alert-circle', // Duplicate, keep the new mapping above
  'calendar-check': 'calendar-check',
  'account-plus': 'account-plus',
  // 'chart-line': 'chart-line', // Duplicate, keep the new mapping above
  'bell-alert': 'bell-alert',
  'calendar-clock': 'calendar-clock',
  'loading': 'loading',
  'account-search': 'account-search',
  'filter-variant': 'filter-variant',
  'plus': 'plus',
  'check-circle': 'check-circle',
  'circle-outline': 'circle-outline',
  
  // Vitals & Health icons
  'water-percent': 'water',  // Map to simpler 'water' since 'water-percent' may not exist
  'walk': 'walk',
  'lungs': 'lungs',
  'thermometer': 'thermometer',
  'scale-bathroom': 'scale-bathroom',
  'sleep': 'sleep',
  'mood-happy': 'emoticon-happy',
  'mood-sad': 'emoticon-sad',
  'emoticon-happy': 'emoticon-happy',
  'emoticon-sad': 'emoticon-sad',
  'emoticon-neutral': 'emoticon-neutral',
  'medication': 'pill',
  'pill': 'pill',
  'clipboard-list': 'clipboard-list',
  
  // Additional dashboard and UI icons
  'weight-kilogram': 'scale-bathroom',  // Map to simpler scale icon
  'human-male-height': 'human-male',  // Map to simpler human icon
  'map-marker': 'map-marker',
  'lightbulb': 'lightbulb',
  'alert-octagon': 'alert-octagon',
  'chart-donut': 'chart-pie',  // Map to supported chart icon
  'file-chart': 'chart-line',  // Map to line chart
  'clock-outline': 'clock-outline',
  'bell-cog': 'bell',  // Map to simpler bell icon
  'harddisk': 'harddisk',
  'brain': 'head-outline',  // Map to head outline for brain
  'run': 'run-fast',  // Map to run-fast
  'food-apple': 'food',  // Map to generic food icon
  
  // Camera & Media icons
  'camera': 'camera',
  'camera-off': 'camera-off',
  'camera-outline': 'camera-outline',
  'video': 'video',
  'video-outline': 'video-outline',
  'video-off': 'video-off',
  'refresh': 'refresh',
  'fullscreen': 'fullscreen',
  'fullscreen-exit': 'fullscreen-exit',
  'record': 'record',
  'record-circle': 'record-circle',
  'play': 'play',
  'pause': 'pause',
  'stop': 'stop',
  
  // Navigation & UI icons
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  'close': 'close',
  'check': 'check',
  'menu': 'menu',
  'dots-vertical': 'dots-vertical',
  'dots-horizontal': 'dots-horizontal',
  'home': 'home',
  'home-outline': 'home-outline',
  
  // Connectivity & Status icons
  'wifi': 'wifi',
  'wifi-off': 'wifi-off',
  'bluetooth': 'bluetooth',
  'cellular': 'signal-cellular-3',
  'battery': 'battery',
  'signal': 'signal',
  'sync': 'sync',
  'cloud': 'cloud',
  'download': 'download',
  'upload': 'upload',
  'circle': 'circle',
  
  // Settings & Configuration icons
  'cog': 'cog',
  'cogs': 'cogs',
  'settings': 'cog',
  'palette': 'palette',
  'theme': 'palette',
  'bell': 'bell',
  'bell-outline': 'bell-outline',
  'shield-account': 'shield-account',
  'security': 'security',
  'lock': 'lock',
  'lock-open': 'lock-open',
  
  // File & Document icons
  'file-document': 'file-document',
  'file-document-outline': 'file-document-outline',
  'folder': 'folder',
  'folder-outline': 'folder-outline',
  'file-pdf': 'file-pdf-box',
  'file-image': 'file-image',
  
  // Communication & Social icons
  'message-text': 'message-text',
  'message-outline': 'message-outline',
  'email': 'email',
  'email-outline': 'email-outline',
  'phone': 'phone',
  'phone-outline': 'phone-outline',
  'share': 'share',
  'share-variant': 'share-variant',
  
  // Data & Analytics icons
  'chart-pie': 'chart-pie',
  // 'chart-bar': 'chart-bar', // Duplicate, keep the new mapping above
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',
  // 'analytics': 'chart-line', // Duplicate, keep the new mapping above
  'statistics': 'chart-bar',
  
  // User & Profile icons
  'account': 'account',
  'account-outline': 'account-outline',
  'account-circle': 'account-circle',
  'account-multiple': 'account-multiple',
  'doctor': 'doctor',
  'nurse': 'account-heart',
  'patient': 'account-injury',
  'family': 'account-group',
  
  // Actions & Operations icons
  'pencil': 'pencil',
  'pencil-outline': 'pencil-outline',
  'delete': 'delete',
  'delete-outline': 'delete-outline',
  'edit': 'pencil',
  'save': 'content-save',
  'copy': 'content-copy',
  'cut': 'content-cut',
  'paste': 'content-paste',
  
  // Bookmarks & Favorites icons
  // 'star': 'star', // Duplicate, keep the new mapping above
  'star-outline': 'star-outline',
  'bookmark': 'bookmark',
  'bookmark-outline': 'bookmark-outline',
  'bookmark-multiple': 'bookmark-multiple',
  'favorite': 'heart',
  'favorite-outline': 'heart-outline',
  
  // Information & Help icons
  'information': 'information',
  'information-outline': 'information-outline',
  'help-circle': 'help-circle',
  'help-circle-outline': 'help-circle-outline',
  'frequently-asked-questions': 'help-circle',
  'question': 'help-circle',
  'bug': 'bug',
  'book-open': 'book-open',
  'book': 'book',
  
  // System & App icons
  'logout': 'logout',
  'login': 'login',
  'power': 'power',
  'restart': 'restart',
  'update': 'update',
  'version': 'information-variant',
  'privacy': 'shield-account',
  'terms': 'file-document',
  'about': 'information',
  
  // Time & Calendar icons
  'clock': 'clock',
  'calendar': 'calendar',
  'calendar-outline': 'calendar-outline',
  'calendar-today': 'calendar-today',
  'schedule': 'timetable',
  'timer': 'timer',
  'alarm': 'alarm',
  
  // Emergency & Medical icons
  'hospital': 'hospital-box',
  'ambulance': 'ambulance',
  'medical-bag': 'medical-bag',
  'first-aid': 'medical-bag',
  'emergency': 'alert-circle',
  'urgent': 'alert',
  // 'warning': 'alert-triangle', // Duplicate, keep the new mapping above
  'danger': 'alert-octagon',
  
  // Subscription & Payment icons
  'credit-card': 'credit-card',
  'payment': 'credit-card',
  'enterprise': 'domain',
  'free': 'gift',
  'pricing': 'currency-usd',
  
  // Default fallback
  'default': 'circle-outline'
};

export default function IconFallback({ name, source, size = 24, color, style }: IconFallbackProps) {
  // Accept both name and source, prefer name if both provided
  const iconKey = name || source || 'default';
  // Try direct, then lowercase, then fallback
  const iconName = iconMap[iconKey] || iconMap[iconKey.toLowerCase?.()] || iconKey || iconMap['default'];
  return (
    <Icon 
      source={iconName}
      size={size}
      color={color}
    />
  );
}
