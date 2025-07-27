import AsyncStorage from '@react-native-async-storage/async-storage';

export class ConfigService {
  private static readonly MOCK_MODE_KEY = 'demcare_mock_mode';
  private static mockModeEnabled = true; // Enable by default for demo

  static async initializeMockMode(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(this.MOCK_MODE_KEY);
      // If no stored preference, default to true for demo purposes
      this.mockModeEnabled = stored !== null ? stored === 'true' : true;
      
      // Enable mock services if mock mode is enabled
      if (this.mockModeEnabled) {
        const { MockAuthService } = await import('./mockService');
        MockAuthService.enableMockMode(true);
      }
      
      console.log('Mock mode initialized:', this.mockModeEnabled);
      
      return this.mockModeEnabled;
    } catch (error) {
      console.warn('Failed to load mock mode setting:', error);
      this.mockModeEnabled = true; // Default to true for demo
      return true;
    }
  }

  static async setMockMode(enabled: boolean): Promise<void> {
    try {
      this.mockModeEnabled = enabled;
      await AsyncStorage.setItem(this.MOCK_MODE_KEY, enabled.toString());
    } catch (error) {
      console.warn('Failed to save mock mode setting:', error);
    }
  }

  static isMockModeEnabled(): boolean {
    return this.mockModeEnabled;
  }

  // For development, enable mock mode by default (already enabled)
  static enableMockModeForDemo(): void {
    this.mockModeEnabled = true;
  }
}

export default ConfigService;
