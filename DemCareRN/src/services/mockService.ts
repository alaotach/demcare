import { User, Patient, VitalSigns, MoodEntry, SleepData, UserRole } from '../types';
import { 
  mockUsers, 
  mockPatients, 
  mockMoodEntries, 
  mockSleepData,
  mockMedications,
  mockMedicationLogs,
  mockDietEntries,
  mockBathroomLogs,
  mockPhysicalActivities,
  mockAnalytics,
  mockReports,
  mockPatientLocations,
  mockLiveMonitoring,
  demoCredentials,
  generateMockVitalsHistory 
} from './mockData';

export class MockAuthService {
  private static currentUser: User | null = null;
  private static isEnabled = true; // Toggle for mock mode
  private static initialized = false;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
    
    // No auto-login as demo doctor; user must sign in manually in mock mode
  }

  static async signIn(email: string, password: string): Promise<User> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    // Check demo credentials
    const demoAccount = Object.values(demoCredentials).find(
      cred => cred.email === email && cred.password === password
    );

    if (demoAccount) {
      this.currentUser = demoAccount.user;
      return demoAccount.user;
    }

    // Check mock users (for development)
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'demo123') {
      this.currentUser = user;
      return user;
    }

    throw new Error('Invalid credentials');
  }

  static async signUp(userData: any): Promise<User> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    // Create a new mock user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      fullName: userData.fullName,
      username: userData.username,
      phoneNumber: userData.phoneNumber,
      age: userData.age,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  static async signOut(): Promise<void> {
    this.currentUser = null;
  }

  static async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    // Simulate auth state change
    setTimeout(() => {
      callback(this.currentUser);
    }, 100);

    // Return unsubscribe function
    return () => {};
  }
}

export class MockPatientService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getPatients(userId: string): Promise<Patient[]> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    // Find user role
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];

    if (user.role === UserRole.DOCTOR) {
      // Return patients for the doctor
      return mockPatients.filter(p => p.doctorId === userId);
    } else if (user.role === UserRole.CAREGIVER) {
      // Return patients for the caregiver
      return mockPatients.filter(p => p.caregiverId === userId);
    } else {
      // Other roles: return empty or all as needed
      return [];
    }
  }

  static async addPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    const newPatient: Patient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPatients.push(newPatient);
    return newPatient;
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    const patientIndex = mockPatients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
      throw new Error('Patient not found');
    }

    mockPatients[patientIndex] = {
      ...mockPatients[patientIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return mockPatients[patientIndex];
  }

  static async getPatient(id: string): Promise<Patient | null> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    return mockPatients.find(p => p.id === id) || null;
  }

  static async getVitalsHistory(patientId: string, limitCount: number = 100): Promise<VitalSigns[]> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    return generateMockVitalsHistory(patientId, 7).slice(0, limitCount);
  }

  static subscribeToVitals(patientId: string, callback: (vitals: VitalSigns) => void): () => void {
    if (!this.isEnabled) {
      return () => {};
    }

    // Simulate real-time vitals updates
    const interval = setInterval(() => {
      const patient = mockPatients.find(p => p.id === patientId);
      if (patient && patient.vitals) {
        // Add small random variations to simulate real-time data
        const vitals: VitalSigns = {
          heartRate: patient.vitals.heartRate + (Math.random() * 10 - 5),
          oxygenSaturation: Math.max(85, Math.min(100, patient.vitals.oxygenSaturation + (Math.random() * 4 - 2))),
          respiratoryRate: patient.vitals.respiratoryRate + (Math.random() * 4 - 2),
          stepCount: patient.vitals.stepCount + Math.floor(Math.random() * 10),
          timestamp: new Date(),
        };
        callback(vitals);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  static async addMoodEntry(moodEntry: Omit<MoodEntry, 'id'>): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    const newMoodEntry: MoodEntry = {
      ...moodEntry,
      id: `mood-${Date.now()}`,
    };

    mockMoodEntries.push(newMoodEntry);
  }

  static async getMoodEntries(patientId: string): Promise<MoodEntry[]> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    return mockMoodEntries.filter(entry => entry.patientId === patientId);
  }

  static async addSleepData(sleepData: Omit<SleepData, 'id'>): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    const newSleepData: SleepData = {
      ...sleepData,
      id: `sleep-${Date.now()}`,
    };

    mockSleepData.push(newSleepData);
  }

  static async getSleepData(patientId: string): Promise<SleepData[]> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    return mockSleepData.filter(data => data.patientId === patientId);
  }
}

// Beacon simulation service
export class MockBeaconService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async fetchBeaconStatus(): Promise<{ [patientName: string]: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNKNOWN' }> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    // Simulate some random status changes
    const statuses = ['IN_RANGE', 'OUT_OF_RANGE', 'UNKNOWN'] as const;
    const result: { [patientName: string]: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNKNOWN' } = {};

    mockPatients.forEach(patient => {
      // 70% chance IN_RANGE, 20% OUT_OF_RANGE, 10% UNKNOWN
      const rand = Math.random();
      if (rand < 0.7) {
        result[patient.fullName] = 'IN_RANGE';
      } else if (rand < 0.9) {
        result[patient.fullName] = 'OUT_OF_RANGE';
      } else {
        result[patient.fullName] = 'UNKNOWN';
      }
    });

    return result;
  }

  static async getPatientLocations(patients: Patient[]): Promise<any[]> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }

    const beaconStatus = await this.fetchBeaconStatus();

    return patients.map(patient => ({
      id: patient.id,
      name: patient.fullName,
      rfidMac: patient.rfidMacAddress,
      status: beaconStatus[patient.fullName] || 'UNKNOWN',
      lastSeen: new Date().toISOString(),
    }));
  }
}

// Mock Analytics Service
export class MockAnalyticsService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getAnalytics(): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }
    return mockAnalytics;
  }
}

// Mock Reports Service  
export class MockReportsService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getReports(): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }
    return mockReports;
  }
}

// Mock Medication Service
export class MockMedicationService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getMedications(patientId: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }
    return mockMedications;
  }

  static async getMedicationLogs(patientId: string): Promise<any> {
    if (!this.isEnabled) {
      throw new Error('Mock service is disabled');
    }
    return mockMedicationLogs.filter(log => log.patientId === patientId);
  }
}

// Demo account information display
export const getDemoAccountInfo = () => {
  return {
    doctor: {
      email: demoCredentials.doctor.email,
      password: demoCredentials.doctor.password,
      description: 'Full access to all features, patient management, analytics'
    },
    caregiver: {
      email: demoCredentials.caregiver.email,
      password: demoCredentials.caregiver.password,
      description: 'Patient monitoring, basic reporting, medication tracking'
    }
  };
};

// Mock Location Service
export class MockLocationService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getPatientLocations(): Promise<any[]> {
    if (!this.isEnabled) return [];
    return mockPatientLocations;
  }

  static async getLocationHistory(patientId: string): Promise<any[]> {
    if (!this.isEnabled) return [];
    return mockPatientLocations.filter(loc => loc.id === patientId);
  }
}

// Mock Live Monitoring Service
export class MockLiveMonitoringService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getCurrentAlerts(): Promise<any[]> {
    if (!this.isEnabled) return [];
    return mockLiveMonitoring.currentAlerts;
  }

  static async getLiveVitals(): Promise<any[]> {
    if (!this.isEnabled) return [];
    return mockLiveMonitoring.liveVitals;
  }

  static async getFacilityStats(): Promise<any> {
    if (!this.isEnabled) return {};
    return mockLiveMonitoring.facilityStats;
  }

  static async acknowledgeAlert(alertId: string): Promise<void> {
    if (!this.isEnabled) return;
    const alert = mockLiveMonitoring.currentAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
}

// Mock Sleep Service
export class MockSleepService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getSleepData(patientId?: string): Promise<any[]> {
    if (!this.isEnabled) return [];
    if (patientId) {
      return mockSleepData.filter(sleep => sleep.patientId === patientId);
    }
    return mockSleepData;
  }

  static async getSleepTrends(patientId: string, days: number = 7): Promise<any[]> {
    if (!this.isEnabled) return [];
    return mockSleepData
      .filter(sleep => sleep.patientId === patientId)
      .slice(0, days);
  }
}

// Mock Diet Service
export class MockDietService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getDietEntries(patientId?: string): Promise<any[]> {
    if (!this.isEnabled) return [];
    if (patientId) {
      return mockDietEntries.filter(entry => entry.patientId === patientId);
    }
    return mockDietEntries;
  }

  static async getNutritionSummary(patientId: string): Promise<any> {
    if (!this.isEnabled) return {};
    const entries = mockDietEntries.filter(entry => entry.patientId === patientId);
    const totalCalories = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const totalWater = entries.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0);
    const avgAppetite = entries.reduce((sum, entry) => sum + entry.appetite, 0) / entries.length;
    
    return {
      totalCalories,
      totalWater,
      averageAppetite: avgAppetite,
      mealCount: entries.length
    };
  }
}

// Mock Activity Service
export class MockActivityService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getPhysicalActivities(patientId?: string): Promise<any[]> {
    if (!this.isEnabled) return [];
    if (patientId) {
      return mockPhysicalActivities.filter(activity => activity.patientId === patientId);
    }
    return mockPhysicalActivities;
  }

  static async getActivitySummary(patientId: string): Promise<any> {
    if (!this.isEnabled) return {};
    const activities = mockPhysicalActivities.filter(activity => activity.patientId === patientId);
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalCalories = activities.reduce((sum, activity) => sum + (activity.calories || 0), 0);
    const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
    
    return {
      totalDuration,
      totalCalories,
      totalDistance,
      activityCount: activities.length,
      averageIntensity: 'moderate'
    };
  }

  static async getBathroomLogs(patientId?: string): Promise<any[]> {
    if (!this.isEnabled) return [];
    if (patientId) {
      return mockBathroomLogs.filter(log => log.patientId === patientId);
    }
    return mockBathroomLogs;
  }
}

// Mock Mood Service  
export class MockMoodService {
  private static isEnabled = true;

  static enableMockMode(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  static async getMoodEntries(patientId?: string): Promise<any[]> {
    if (!this.isEnabled) return [];
    if (patientId) {
      return mockMoodEntries.filter(entry => entry.patientId === patientId);
    }
    return mockMoodEntries;
  }

  static async getMoodTrends(patientId: string, days: number = 7): Promise<any> {
    if (!this.isEnabled) return {};
    const entries = mockMoodEntries
      .filter(entry => entry.patientId === patientId)
      .slice(0, days);
    
    const averageMood = entries.reduce((sum, entry) => sum + entry.moodScore, 0) / entries.length;
    const averageAnxiety = entries.reduce((sum, entry) => sum + entry.anxiety, 0) / entries.length;
    const averageEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length;
    
    return {
      averageMood,
      averageAnxiety,
      averageEnergy,
      entryCount: entries.length,
      trend: averageMood > 3 ? 'improving' : 'needs_attention'
    };
  }
}

export default {
  MockAuthService,
  MockPatientService,
  MockBeaconService,
  MockAnalyticsService,
  MockReportsService,
  MockMedicationService,
  MockLocationService,
  MockLiveMonitoringService,
  MockSleepService,
  MockDietService,
  MockActivityService,
  MockMoodService,
  getDemoAccountInfo
};
