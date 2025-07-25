export enum UserRole {
  DOCTOR = 'doctor',
  CAREGIVER = 'caregiver',
  FAMILY_MEMBER = 'family_member',
  PHYSICIAN = 'physician',
  OTHER = 'other'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  age: number;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  caregiverContactNumber: string;
  rfidMacAddress: string;
  doctorId: string;
  createdAt: Date;
  updatedAt: Date;
  vitals?: VitalSigns;
  status: PatientStatus;
  medications?: Medication[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
}

export interface VitalSigns {
  heartRate: number;
  oxygenSaturation: number; // SpO₂
  respiratoryRate: number;
  stepCount: number;
  timestamp: Date;
}

export interface SleepData {
  id: string;
  patientId: string;
  date: Date;
  bedTime: Date;
  wakeTime: Date;
  totalSleepHours: number;
  sleepQuality: number; // 1-5 stars
  sleepStages: {
    deep: number; // minutes
    light: number; // minutes
    rem: number; // minutes
    awake: number; // minutes
  };
  notes?: string;
}

export interface BathroomUse {
  id: string;
  patientId: string;
  timestamp: Date;
  type: 'urination' | 'bowel_movement' | 'both';
  urgency: number; // 1-5 scale
  assistance: boolean;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
  instructions: string;
  isActive: boolean;
}

export interface MedicationLog {
  id: string;
  patientId: string;
  medicationId: string;
  scheduledTime: Date;
  actualTime?: Date;
  taken: boolean;
  notes?: string;
  administeredBy?: string;
}

export interface MoodEntry {
  id: string;
  patientId: string;
  timestamp: Date;
  mood: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  moodScore: number; // 1-5
  anxiety: number; // 1-5
  energy: number; // 1-5
  notes?: string;
  triggers?: string[];
}

export interface DietEntry {
  id: string;
  patientId: string;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: string[];
  calories?: number;
  waterIntake: number; // ml
  appetite: number; // 1-5
  notes?: string;
}

export interface PhysicalActivity {
  id: string;
  patientId: string;
  date: Date;
  type: 'walking' | 'exercise' | 'therapy' | 'other';
  duration: number; // minutes
  intensity: 'low' | 'moderate' | 'high';
  distance?: number; // meters for walking
  calories?: number;
  notes?: string;
}

export enum PatientStatus {
  IN_RANGE = 'in_range',
  OUT_OF_RANGE = 'out_of_range',
  OFFLINE = 'offline'
}

export interface VitalRange {
  heartRate: { min: number; max: number };
  oxygenSaturation: { min: number; max: number };
  respiratoryRate: { min: number; max: number };
}

export interface CameraFeed {
  id: string;
  patientId: string;
  ipAddress: string;
  isActive: boolean;
  lastUpdated: Date;
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface SubscriptionFeature {
  name: string;
  free: boolean;
  premium: boolean;
  enterprise: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  vitals: Record<string, VitalSigns[]>;
  sleepData: Record<string, SleepData[]>;
  bathroomLogs: Record<string, BathroomUse[]>;
  medicationLogs: Record<string, MedicationLog[]>;
  moodEntries: Record<string, MoodEntry[]>;
  dietEntries: Record<string, DietEntry[]>;
  physicalActivities: Record<string, PhysicalActivity[]>;
  isLoading: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  dataSync: boolean;
}

// Navigation parameter types
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  DoctorTabs: undefined;
  AddPatient: undefined;
  PatientProfile: { patient: Patient };
  PatientOverview: { patient: Patient };
  AddSleepData: { patient: Patient };
  AddMoodEntry: { patient: Patient };
  AddDietEntry: { patient: Patient };
  AddPhysicalActivity: { patient: Patient };
  AddBathroomLog: { patient: Patient };
  AddMedicationLog: { patient: Patient };
};
