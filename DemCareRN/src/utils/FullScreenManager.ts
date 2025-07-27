import { StatusBar, Platform } from 'react-native';

export class FullScreenManager {
  private static isFullScreenEnabled = false;

  /**
   * Enable full screen mode app-wide
   */
  static enableFullScreen() {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(true, 'fade');
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    } else if (Platform.OS === 'ios') {
      StatusBar.setHidden(true, 'fade');
    }
    this.isFullScreenEnabled = true;
  }

  /**
   * Disable full screen mode
   */
  static disableFullScreen() {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(false, 'fade');
      StatusBar.setBackgroundColor('#000000', true);
      StatusBar.setTranslucent(false);
    } else if (Platform.OS === 'ios') {
      StatusBar.setHidden(false, 'fade');
    }
    this.isFullScreenEnabled = false;
  }

  /**
   * Check if full screen is currently enabled
   */
  static isEnabled(): boolean {
    return this.isFullScreenEnabled;
  }

  /**
   * Set status bar style while maintaining full screen
   */
  static setStatusBarStyle(style: 'default' | 'light-content' | 'dark-content') {
    if (!this.isFullScreenEnabled) {
      StatusBar.setBarStyle(style, true);
    }
  }
}
