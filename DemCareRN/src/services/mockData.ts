import { User, Patient, VitalSigns, MoodEntry, SleepData, UserRole, PatientStatus, Medication, MedicationLog, DietEntry, PhysicalActivity, BathroomUse } from '../types';

// Mock Users for Demo/Testing
export const mockUsers: User[] = [
  {
    id: 'demo-doctor-1',
    fullName: 'Dr. Sarah Johnson',
    username: 'dr.sarah',
    email: 'demo.doctor@demcare.com',
    phoneNumber: '+1-555-0123',
    age: 42,
    role: UserRole.DOCTOR,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: 'demo-caregiver-1',
    fullName: 'Emily Rodriguez',
    username: 'emily.care',
    email: 'demo.caregiver@demcare.com',
    phoneNumber: '+1-555-0124',
    age: 35,
    role: UserRole.CAREGIVER,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-07-20'),
  }
];

// Mock Patients for Demo/Testing
export const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    fullName: 'Robert Thompson',
    age: 78,
    height: 175,
    weight: 80,
    caregiverContactNumber: '+1-555-0100',
    rfidMacAddress: 'AA:BB:CC:DD:EE:01',
    doctorId: 'demo-doctor-1',
    caregiverId: 'demo-caregiver-1',
    roomNumber: '101A',
    bedNumber: '1',
    medicalRecordNumber: 'MR-001',
    vitals: {
      heartRate: 82,
      oxygenSaturation: 96,
      respiratoryRate: 18,
      stepCount: 2150,
      timestamp: new Date(),
    },
    status: PatientStatus.IN_RANGE,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
    emergencyContact: {
      name: 'Mary Thompson',
      phone: '+1-555-0200',
      relationship: 'Daughter'
    },
    medicalHistory: ['Alzheimer\'s Disease', 'Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Shellfish'],
  },
  {
    id: 'patient-2',
    fullName: 'Margaret Wilson',
    age: 85,
    height: 162,
    weight: 65,
    caregiverContactNumber: '+1-555-0101',
    rfidMacAddress: 'AA:BB:CC:DD:EE:02',
    doctorId: 'demo-doctor-1',
    caregiverId: 'demo-caregiver-1',
    roomNumber: '102B',
    bedNumber: '2',
    medicalRecordNumber: 'MR-002',
    vitals: {
      heartRate: 76,
      oxygenSaturation: 94,
      respiratoryRate: 16,
      stepCount: 1850,
      timestamp: new Date(),
    },
    status: PatientStatus.OUT_OF_RANGE,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    emergencyContact: {
      name: 'James Wilson',
      phone: '+1-555-0201',
      relationship: 'Son'
    },
    medicalHistory: ['Dementia', 'Osteoporosis', 'Heart Disease'],
    allergies: ['Sulfa drugs'],
  },
  {
    id: 'patient-3',
    fullName: 'William Davis',
    age: 72,
    height: 180,
    weight: 78,
    caregiverContactNumber: '+1-555-0102',
    rfidMacAddress: 'AA:BB:CC:DD:EE:03',
    doctorId: 'demo-doctor-1',
    caregiverId: 'demo-caregiver-1',
    roomNumber: '103A',
    bedNumber: '1',
    medicalRecordNumber: 'MR-003',
    vitals: {
      heartRate: 88,
      oxygenSaturation: 98,
      respiratoryRate: 20,
      stepCount: 3200,
      timestamp: new Date(),
    },
    status: PatientStatus.IN_RANGE,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
    emergencyContact: {
      name: 'Susan Davis',
      phone: '+1-555-0202',
      relationship: 'Wife'
    },
    medicalHistory: ['Mild Cognitive Impairment', 'Arthritis'],
    allergies: [],
  },
  {
    id: 'patient-4',
    fullName: 'Dorothy Martinez',
    age: 81,
    height: 158,
    weight: 58,
    caregiverContactNumber: '+1-555-0103',
    rfidMacAddress: 'AA:BB:CC:DD:EE:04',
    doctorId: 'demo-doctor-1',
    caregiverId: 'demo-caregiver-1',
    roomNumber: '104B',
    bedNumber: '2',
    medicalRecordNumber: 'MR-004',
    vitals: {
      heartRate: 92,
      oxygenSaturation: 92,
      respiratoryRate: 22,
      stepCount: 980,
      timestamp: new Date(),
    },
    status: PatientStatus.OFFLINE,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date(),
    emergencyContact: {
      name: 'Carlos Martinez',
      phone: '+1-555-0203',
      relationship: 'Son'
    },
    medicalHistory: ['Alzheimer\'s Disease', 'Depression', 'High Cholesterol'],
    allergies: ['Latex'],
  },
  {
    id: 'patient-5',
    fullName: 'Charles Anderson',
    age: 76,
    height: 172,
    weight: 72,
    caregiverContactNumber: '+1-555-0104',
    rfidMacAddress: 'AA:BB:CC:DD:EE:05',
    doctorId: 'demo-doctor-1',
    caregiverId: 'demo-caregiver-1',
    roomNumber: '105A',
    bedNumber: '1',
    medicalRecordNumber: 'MR-005',
    vitals: {
      heartRate: 74,
      oxygenSaturation: 95,
      respiratoryRate: 17,
      stepCount: 2650,
      timestamp: new Date(),
    },
    status: PatientStatus.IN_RANGE,
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date(),
    emergencyContact: {
      name: 'Linda Anderson',
      phone: '+1-555-0204',
      relationship: 'Daughter'
    },
    medicalHistory: ['Vascular Dementia', 'Diabetes', 'Kidney Disease'],
    allergies: ['Iodine'],
  }
];

// Generate historical vital signs data
export const generateMockVitalsHistory = (patientId: string, days: number = 7): VitalSigns[] => {
  const vitals: VitalSigns[] = [];
  const baseVitals = mockPatients.find(p => p.id === patientId)?.vitals;
  
  if (!baseVitals) return [];

  for (let i = days; i >= 0; i--) {
    for (let hour = 0; hour < 24; hour += 4) { // Every 4 hours
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - i);
      timestamp.setHours(hour, 0, 0, 0);

      // Add some realistic variation
      const heartRateVariation = Math.random() * 20 - 10; // ±10 bpm
      const o2Variation = Math.random() * 6 - 3; // ±3%
      const respVariation = Math.random() * 6 - 3; // ±3
      const stepVariation = Math.random() * 1000; // Random steps

      vitals.push({
        heartRate: Math.max(50, Math.min(120, baseVitals.heartRate + heartRateVariation)),
        oxygenSaturation: Math.max(85, Math.min(100, baseVitals.oxygenSaturation + o2Variation)),
        respiratoryRate: Math.max(12, Math.min(30, baseVitals.respiratoryRate + respVariation)),
        stepCount: Math.max(0, stepVariation),
        timestamp,
      });
    }
  }

  return vitals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Mock mood entries - covers full week
export const mockMoodEntries: MoodEntry[] = [
  // Today's mood entries
  {
    id: 'mood-today-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    mood: 'happy',
    moodScore: 4,
    anxiety: 1,
    energy: 4,
    notes: 'Feeling great this morning, had a good breakfast',
    triggers: ['Food/meal']
  },
  // Yesterday
  {
    id: 'mood-yesterday-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    mood: 'neutral',
    moodScore: 3,
    anxiety: 2,
    energy: 3,
    notes: 'Average day, feeling okay',
    triggers: ['Weather']
  },
  // 2 days ago
  {
    id: 'mood-2days-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    mood: 'sad',
    moodScore: 2,
    anxiety: 4,
    energy: 2,
    notes: 'Not feeling very well, had trouble sleeping',
    triggers: ['Sleep issues', 'Pain']
  },
  // 3 days ago
  {
    id: 'mood-3days-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    mood: 'very_happy',
    moodScore: 5,
    anxiety: 1,
    energy: 5,
    notes: 'Wonderful day! Had family visit',
    triggers: ['Family visit', 'Activity']
  },
  // 4 days ago
  {
    id: 'mood-4days-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    mood: 'happy',
    moodScore: 4,
    anxiety: 2,
    energy: 4,
    notes: 'Good day overall',
    triggers: ['Activity', 'Social interaction']
  },
  // 5 days ago
  {
    id: 'mood-5days-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    mood: 'neutral',
    moodScore: 3,
    anxiety: 3,
    energy: 3,
    notes: 'Regular day, nothing special',
    triggers: ['Other']
  },
  // 6 days ago
  {
    id: 'mood-6days-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    mood: 'happy',
    moodScore: 4,
    anxiety: 1,
    energy: 4,
    notes: 'Good mood, enjoyed activities',
    triggers: ['Activity', 'Food/meal']
  },
  // Patient 2 data
  {
    id: 'mood-today-2',
    patientId: 'patient-2',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    mood: 'very_happy',
    moodScore: 5,
    anxiety: 1,
    energy: 5,
    notes: 'Excellent mood today, excited about family visit',
    triggers: ['Family visit', 'Activity']
  },
  {
    id: 'mood-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    mood: 'happy',
    moodScore: 4,
    anxiety: 2,
    energy: 3,
    notes: 'Had a good day, enjoyed visit from family',
    triggers: ['Family visit', 'Food/meal']
  },
  {
    id: 'mood-2',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    mood: 'neutral',
    moodScore: 3,
    anxiety: 3,
    energy: 2,
    notes: 'Regular day, felt tired after physical therapy',
    triggers: ['Activity', 'Medication']
  },
  {
    id: 'mood-3',
    patientId: 'patient-2',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    mood: 'sad',
    moodScore: 2,
    anxiety: 4,
    energy: 1,
    notes: 'Feeling confused and anxious today',
    triggers: ['Sleep issues', 'Weather']
  },
  {
    id: 'mood-4',
    patientId: 'patient-3',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    mood: 'very_happy',
    moodScore: 5,
    anxiety: 1,
    energy: 4,
    notes: 'Excellent day! Music therapy was wonderful',
    triggers: ['Social interaction', 'Activity']
  },
  {
    id: 'mood-5',
    patientId: 'patient-4',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    mood: 'neutral',
    moodScore: 3,
    anxiety: 3,
    energy: 3,
    notes: 'Okay day, some discomfort from medication changes',
    triggers: ['Medication', 'Pain']
  },
  {
    id: 'mood-6',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    mood: 'sad',
    moodScore: 2,
    anxiety: 4,
    energy: 2,
    notes: 'Missing home, feeling lonely',
    triggers: ['Weather', 'Sleep issues']
  },
  {
    id: 'mood-7',
    patientId: 'patient-5',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    mood: 'happy',
    moodScore: 4,
    anxiety: 2,
    energy: 3,
    notes: 'Good morning! Looking forward to group activities',
    triggers: ['Social interaction', 'Food/meal']
  }
];

// Mock sleep data - covers full week
export const mockSleepData: SleepData[] = [
  // Today's sleep data
  {
    id: 'sleep-today-1',
    patientId: 'patient-1',
    date: new Date(), // Today
    bedTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 30 * 60 * 1000),
    totalSleepHours: 7.5,
    sleepQuality: 4,
    sleepStages: {
      deep: 126, light: 252, rem: 72, awake: 30
    },
    notes: 'Good night sleep, woke up feeling rested'
  },
  // Yesterday
  {
    id: 'sleep-yesterday-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalSleepHours: 6.8,
    sleepQuality: 3,
    sleepStages: {
      deep: 108, light: 228, rem: 72, awake: 40
    },
    notes: 'Average sleep'
  },
  // 2 days ago
  {
    id: 'sleep-2days-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalSleepHours: 5.5,
    sleepQuality: 2,
    sleepStages: {
      deep: 90, light: 192, rem: 48, awake: 60
    },
    notes: 'Restless night, frequent awakenings'
  },
  // 3 days ago
  {
    id: 'sleep-3days-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    totalSleepHours: 8.2,
    sleepQuality: 5,
    sleepStages: {
      deep: 144, light: 300, rem: 66, awake: 15
    },
    notes: 'Excellent sleep quality'
  },
  // 4 days ago
  {
    id: 'sleep-4days-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    totalSleepHours: 6.5,
    sleepQuality: 3,
    sleepStages: {
      deep: 102, light: 216, rem: 72, awake: 45
    },
    notes: 'Moderate sleep'
  },
  // 5 days ago
  {
    id: 'sleep-5days-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalSleepHours: 7.8,
    sleepQuality: 4,
    sleepStages: {
      deep: 132, light: 264, rem: 78, awake: 25
    },
    notes: 'Good sleep'
  },
  // 6 days ago
  {
    id: 'sleep-6days-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 7.5 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    totalSleepHours: 7.0,
    sleepQuality: 4,
    sleepStages: {
      deep: 114, light: 240, rem: 72, awake: 35
    },
    notes: 'Solid sleep'
  },
  // Patient 2 data for today
  {
    id: 'sleep-today-2',
    patientId: 'patient-2',
    date: new Date(),
    bedTime: new Date(Date.now() - 9 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 45 * 60 * 1000),
    totalSleepHours: 8.2,
    sleepQuality: 5,
    sleepStages: {
      deep: 144, light: 300, rem: 66, awake: 15
    },
    notes: 'Excellent sleep, very refreshed'
  },
  {
    id: 'sleep-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalSleepHours: 7.5,
    sleepQuality: 4,
    sleepStages: {
      deep: 126, // 2.1 hours
      light: 252, // 4.2 hours
      rem: 72, // 1.2 hours
      awake: 30
    },
    notes: 'Good night sleep, woke up feeling rested'
  },
  {
    id: 'sleep-2',
    patientId: 'patient-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalSleepHours: 5.5,
    sleepQuality: 2,
    sleepStages: {
      deep: 90, // 1.5 hours
      light: 192, // 3.2 hours
      rem: 48, // 0.8 hours
      awake: 60
    },
    notes: 'Restless night, frequent awakenings'
  },
  {
    id: 'sleep-3',
    patientId: 'patient-2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalSleepHours: 8.5,
    sleepQuality: 5,
    sleepStages: {
      deep: 144, // 2.4 hours
      light: 300, // 5.0 hours
      rem: 66, // 1.1 hours
      awake: 15
    },
    notes: 'Excellent sleep quality, feeling refreshed'
  },
  {
    id: 'sleep-4',
    patientId: 'patient-3',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalSleepHours: 6.8,
    sleepQuality: 3,
    sleepStages: {
      deep: 102, // 1.7 hours
      light: 228, // 3.8 hours
      rem: 66, // 1.1 hours
      awake: 42
    },
    notes: 'Moderate sleep, some disruptions due to noise'
  },
  {
    id: 'sleep-5',
    patientId: 'patient-4',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 6.5 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalSleepHours: 6.0,
    sleepQuality: 2,
    sleepStages: {
      deep: 72, // 1.2 hours
      light: 216, // 3.6 hours
      rem: 48, // 0.8 hours
      awake: 84
    },
    notes: 'Poor sleep quality, anxiety affecting rest'
  },
  {
    id: 'sleep-6',
    patientId: 'patient-5',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    bedTime: new Date(Date.now() - 24 * 60 * 60 * 1000 - 8.2 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalSleepHours: 7.8,
    sleepQuality: 4,
    sleepStages: {
      deep: 132, // 2.2 hours
      light: 276, // 4.6 hours
      rem: 60, // 1.0 hours
      awake: 36
    },
    notes: 'Good sleep with minimal disruptions'
  }
];

// Demo login credentials
export const demoCredentials = {
  doctor: {
    email: 'demo.doctor@demcare.com',
    password: 'demo123',
    user: mockUsers[0]
  },
  caregiver: {
    email: 'demo.caregiver@demcare.com',
    password: 'demo123',
    user: mockUsers[1]
  }
};

// Beacon status simulation
export const mockBeaconStatus = {
  'Robert Thompson': 'IN_RANGE' as const,
  'Margaret Wilson': 'OUT_OF_RANGE' as const,
  'William Davis': 'IN_RANGE' as const,
  'Dorothy Martinez': 'UNKNOWN' as const,
  'Charles Anderson': 'IN_RANGE' as const,
};

// Mock Patient Location Data
export const mockPatientLocations = [
  {
    id: 'patient-1',
    name: 'Robert Thompson',
    rfidMac: 'AA:BB:CC:DD:EE:01',
    status: 'IN_RANGE' as const,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    currentRoom: 'Room 101A',
    coordinates: { x: 125, y: 80 },
    batteryLevel: 85,
    signalStrength: -45,
    zone: 'Patient Rooms - Wing A',
    lastMovement: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'patient-2',
    name: 'Margaret Wilson',
    rfidMac: 'AA:BB:CC:DD:EE:02',
    status: 'OUT_OF_RANGE' as const,
    lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    currentRoom: 'Unknown',
    coordinates: { x: 0, y: 0 },
    batteryLevel: 72,
    signalStrength: -85,
    zone: 'Out of Range',
    lastMovement: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'patient-3',
    name: 'William Davis',
    rfidMac: 'AA:BB:CC:DD:EE:03',
    status: 'IN_RANGE' as const,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    currentRoom: 'Dining Hall',
    coordinates: { x: 200, y: 150 },
    batteryLevel: 94,
    signalStrength: -38,
    zone: 'Common Areas',
    lastMovement: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  },
  {
    id: 'patient-4',
    name: 'Dorothy Martinez',
    rfidMac: 'AA:BB:CC:DD:EE:04',
    status: 'UNKNOWN' as const,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    currentRoom: 'Unknown',
    coordinates: { x: 0, y: 0 },
    batteryLevel: 12,
    signalStrength: -95,
    zone: 'Device Offline',
    lastMovement: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'patient-5',
    name: 'Charles Anderson',
    rfidMac: 'AA:BB:CC:DD:EE:05',
    status: 'IN_RANGE' as const,
    lastSeen: new Date(Date.now() - 30 * 1000).toISOString(),
    currentRoom: 'Physical Therapy',
    coordinates: { x: 180, y: 220 },
    batteryLevel: 89,
    signalStrength: -40,
    zone: 'Therapy Rooms',
    lastMovement: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

// Camera feeds simulation
export const mockCameraFeeds = [
  {
    id: 'camera-1',
    name: 'Room 101A - Robert Thompson',
    url: 'http://192.168.61.162:5000/video_feed',
    status: 'online',
    location: 'Room 101A'
  },
  {
    id: 'camera-2',
    name: 'Room 102B - Margaret Wilson',
    url: 'http://192.168.61.162:5001/video_feed',
    status: 'offline',
    location: 'Room 102B'
  },
  {
    id: 'camera-3',
    name: 'Common Area',
    url: 'http://192.168.61.162:5002/video_feed',
    status: 'online',
    location: 'Common Area'
  }
];

// Mock Live Monitoring Data
export const mockLiveMonitoring = {
  currentAlerts: [
    {
      id: 'alert-1',
      patientId: 'patient-2',
      patientName: 'Margaret Wilson',
      type: 'location',
      severity: 'high',
      message: 'Patient out of designated area for 45 minutes',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      acknowledged: false
    },
    {
      id: 'alert-2',
      patientId: 'patient-4',
      patientName: 'Dorothy Martinez',
      type: 'vitals',
      severity: 'medium',
      message: 'Heart rate elevated: 105 BPM',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false
    },
    {
      id: 'alert-3',
      patientId: 'patient-1',
      patientName: 'Robert Thompson',
      type: 'medication',
      severity: 'low',
      message: 'Medication due in 15 minutes',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      acknowledged: true
    }
  ],
  liveVitals: [
    {
      patientId: 'patient-1',
      patientName: 'Robert Thompson',
      heartRate: 82,
      oxygenSaturation: 96,
      respiratoryRate: 18,
      temperature: 98.6,
      bloodPressure: { systolic: 120, diastolic: 80 },
      status: 'stable',
      lastUpdate: new Date(Date.now() - 30 * 1000)
    },
    {
      patientId: 'patient-3',
      patientName: 'William Davis',
      heartRate: 75,
      oxygenSaturation: 98,
      respiratoryRate: 16,
      temperature: 98.2,
      bloodPressure: { systolic: 115, diastolic: 75 },
      status: 'stable',
      lastUpdate: new Date(Date.now() - 45 * 1000)
    },
    {
      patientId: 'patient-4',
      patientName: 'Dorothy Martinez',
      heartRate: 105,
      oxygenSaturation: 94,
      respiratoryRate: 22,
      temperature: 99.1,
      bloodPressure: { systolic: 140, diastolic: 90 },
      status: 'elevated',
      lastUpdate: new Date(Date.now() - 15 * 1000)
    }
  ],
  facilityStats: {
    totalPatients: 5,
    patientsInRange: 3,
    patientsOutOfRange: 1,
    devicesOffline: 1,
    activeAlerts: 2,
    staffOnDuty: 8,
    roomOccupancy: 85
  }
};

// Mock Medication Data
export const mockMedications: Medication[] = [
  {
    id: 'med-1',
    name: 'Donepezil',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: new Date('2024-01-01'),
    instructions: 'Take with food in the morning',
    isActive: true,
  },
  {
    id: 'med-2',
    name: 'Memantine',
    dosage: '20mg',
    frequency: 'Twice daily',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: new Date('2024-02-01'),
    instructions: 'Take with or without food',
    isActive: true,
  },
  {
    id: 'med-3',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: new Date('2024-01-15'),
    instructions: 'Take in the morning',
    isActive: true,
  }
];

// Mock Medication Logs
export const mockMedicationLogs: MedicationLog[] = [
  {
    id: 'log-1',
    patientId: 'patient-1',
    medicationId: 'med-1',
    scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actualTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    taken: true,
    administeredBy: 'Emily Rodriguez',
  },
  {
    id: 'log-2',
    patientId: 'patient-1',
    medicationId: 'med-3',
    scheduledTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    actualTime: new Date(Date.now() - 50 * 60 * 1000),
    taken: true,
    administeredBy: 'Emily Rodriguez',
  }
];

// Mock Diet Entries
export const mockDietEntries: DietEntry[] = [
  {
    id: 'diet-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    mealType: 'breakfast',
    foodItems: ['Oatmeal', 'Banana', 'Orange juice'],
    calories: 450,
    waterIntake: 250,
    appetite: 4,
    notes: 'Ate well, enjoyed the meal'
  },
  {
    id: 'diet-2',
    patientId: 'patient-2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    mealType: 'breakfast',
    foodItems: ['Scrambled eggs', 'Toast', 'Coffee'],
    calories: 380,
    waterIntake: 200,
    appetite: 5,
    notes: 'Excellent appetite'
  },
  {
    id: 'diet-3',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
    mealType: 'lunch',
    foodItems: ['Grilled chicken', 'Rice', 'Vegetables', 'Water'],
    calories: 620,
    waterIntake: 300,
    appetite: 4,
    notes: 'Good portion size, ate most of the meal'
  },
  {
    id: 'diet-4',
    patientId: 'patient-3',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    mealType: 'dinner',
    foodItems: ['Fish', 'Potatoes', 'Salad', 'Herbal tea'],
    calories: 520,
    waterIntake: 250,
    appetite: 5,
    notes: 'Loved the fish, finished everything'
  },
  {
    id: 'diet-5',
    patientId: 'patient-4',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    mealType: 'snack',
    foodItems: ['Apple', 'Yogurt'],
    calories: 180,
    waterIntake: 150,
    appetite: 3,
    notes: 'Light snack, moderate appetite'
  },
  {
    id: 'diet-6',
    patientId: 'patient-5',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    mealType: 'breakfast',
    foodItems: ['Cereal', 'Milk', 'Berries', 'Coffee'],
    calories: 340,
    waterIntake: 200,
    appetite: 4,
    notes: 'Enjoyed the fresh berries'
  },
  {
    id: 'diet-7',
    patientId: 'patient-2',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    mealType: 'lunch',
    foodItems: ['Soup', 'Sandwich', 'Fruit', 'Water'],
    calories: 480,
    waterIntake: 280,
    appetite: 3,
    notes: 'Ate slowly but finished most of it'
  }
];

// Mock Bathroom Logs Data
export const mockBathroomLogs: BathroomUse[] = [
  {
    id: 'bathroom-1',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'urination',
    urgency: 3,
    assistance: false,
    notes: 'Normal'
  },
  {
    id: 'bathroom-2',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'bowel_movement',
    urgency: 2,
    assistance: true,
    notes: 'Needed some assistance'
  },
  {
    id: 'bathroom-3',
    patientId: 'patient-2',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'urination',
    urgency: 4,
    assistance: false,
    notes: 'Urgent'
  },
  {
    id: 'bathroom-4',
    patientId: 'patient-1',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'both',
    urgency: 3,
    assistance: false,
    notes: 'Regular bathroom visit'
  },
  {
    id: 'bathroom-5',
    patientId: 'patient-3',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: 'urination',
    urgency: 2,
    assistance: true,
    notes: 'Scheduled visit'
  },
  {
    id: 'bathroom-6',
    patientId: 'patient-2',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'bowel_movement',
    urgency: 1,
    assistance: false,
    notes: 'No issues'
  }
];

// Mock Physical Activity Data
export const mockPhysicalActivities: PhysicalActivity[] = [
  {
    id: 'activity-1',
    patientId: 'patient-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'walking',
    duration: 30,
    intensity: 'low',
    distance: 800,
    calories: 120,
    notes: 'Short walk in the garden'
  },
  {
    id: 'activity-2',
    patientId: 'patient-3',
    date: new Date(),
    type: 'therapy',
    duration: 45,
    intensity: 'moderate',
    calories: 150,
    notes: 'Physical therapy session'
  },
  {
    id: 'activity-3',
    patientId: 'patient-2',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'exercise',
    duration: 20,
    intensity: 'low',
    distance: 0,
    calories: 80,
    notes: 'Chair exercises, stretching'
  },
  {
    id: 'activity-4',
    patientId: 'patient-4',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'walking',
    duration: 15,
    intensity: 'low',
    distance: 400,
    calories: 60,
    notes: 'Short hallway walk with assistance'
  },
  {
    id: 'activity-5',
    patientId: 'patient-5',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: 'other',
    duration: 60,
    intensity: 'low',
    calories: 100,
    notes: 'Group music and movement therapy'
  },
  // Additional patient-1 activities for complete 7-day coverage
  {
    id: 'activity-patient1-today',
    patientId: 'patient-1',
    date: new Date(),
    type: 'walking',
    duration: 25,
    intensity: 'low',
    distance: 600,
    calories: 100,
    notes: 'Morning walk around the facility'
  },
  {
    id: 'activity-patient1-2days',
    patientId: 'patient-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: 'therapy',
    duration: 40,
    intensity: 'moderate',
    calories: 140,
    notes: 'Occupational therapy session'
  },
  {
    id: 'activity-patient1-3days',
    patientId: 'patient-1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: 'exercise',
    duration: 35,
    intensity: 'moderate',
    calories: 120,
    notes: 'Chair exercises and stretching'
  },
  {
    id: 'activity-patient1-4days',
    patientId: 'patient-1',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    type: 'walking',
    duration: 20,
    intensity: 'low',
    distance: 500,
    calories: 80,
    notes: 'Short indoor walk'
  },
  {
    id: 'activity-patient1-5days',
    patientId: 'patient-1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: 'other',
    duration: 45,
    intensity: 'low',
    calories: 90,
    notes: 'Group activity session'
  },
  {
    id: 'activity-patient1-6days',
    patientId: 'patient-1',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    type: 'therapy',
    duration: 30,
    intensity: 'moderate',
    calories: 110,
    notes: 'Physical therapy session'
  },
  {
    id: 'activity-6',
    patientId: 'patient-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: 'therapy',
    duration: 40,
    intensity: 'moderate',
    calories: 140,
    notes: 'Occupational therapy session'
  },
  {
    id: 'activity-7',
    patientId: 'patient-3',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'walking',
    duration: 25,
    intensity: 'moderate',
    distance: 600,
    calories: 110,
    notes: 'Good pace, feeling energetic'
  },
  {
    id: 'activity-8',
    patientId: 'patient-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'other',
    duration: 30,
    intensity: 'low',
    calories: 50,
    notes: 'Arts and crafts activity'
  }
];

// Mock Analytics Data
export const mockAnalytics = {
  weeklyStats: {
    totalPatients: 6,
    activePatients: 5,
    averageHeartRate: 82,
    averageOxygenSaturation: 95,
    medicationCompliance: 92,
    incidentCount: 2,
    averageSleepHours: 7.2,
    averageSteps: 2100,
    moodScore: 4.1,
    calorieIntake: 1850
  },
  patientTrends: [
    { date: '2024-07-20', heartRate: 78, oxygenSaturation: 96, stepCount: 2200, sleepHours: 7.5, mood: 4, calories: 1900 },
    { date: '2024-07-21', heartRate: 82, oxygenSaturation: 95, stepCount: 1950, sleepHours: 6.8, mood: 3, calories: 1750 },
    { date: '2024-07-22', heartRate: 80, oxygenSaturation: 97, stepCount: 2100, sleepHours: 8.0, mood: 5, calories: 2000 },
    { date: '2024-07-23', heartRate: 85, oxygenSaturation: 94, stepCount: 1800, sleepHours: 6.5, mood: 3, calories: 1650 },
    { date: '2024-07-24', heartRate: 79, oxygenSaturation: 96, stepCount: 2350, sleepHours: 7.8, mood: 4, calories: 1950 },
    { date: '2024-07-25', heartRate: 83, oxygenSaturation: 95, stepCount: 2000, sleepHours: 7.2, mood: 4, calories: 1800 },
    { date: '2024-07-26', heartRate: 81, oxygenSaturation: 96, stepCount: 2150, sleepHours: 7.0, mood: 4, calories: 1850 }
  ],
  chartData: {
    heartRateChart: [
      { x: 0, y: 78 }, { x: 1, y: 82 }, { x: 2, y: 80 }, { x: 3, y: 85 }, 
      { x: 4, y: 79 }, { x: 5, y: 83 }, { x: 6, y: 81 }
    ],
    stepsChart: [
      { x: 0, y: 2200 }, { x: 1, y: 1950 }, { x: 2, y: 2100 }, { x: 3, y: 1800 }, 
      { x: 4, y: 2350 }, { x: 5, y: 2000 }, { x: 6, y: 2150 }
    ],
    sleepChart: [
      { x: 0, y: 7.5 }, { x: 1, y: 6.8 }, { x: 2, y: 8.0 }, { x: 3, y: 6.5 }, 
      { x: 4, y: 7.8 }, { x: 5, y: 7.2 }, { x: 6, y: 7.0 }
    ],
    moodChart: [
      { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 3 }, 
      { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }
    ]
  },
  monthlyComparison: {
    currentMonth: {
      averageHeartRate: 82,
      averageSteps: 2100,
      averageSleep: 7.2,
      averageMood: 4.1,
      medicationCompliance: 92
    },
    previousMonth: {
      averageHeartRate: 85,
      averageSteps: 1950,
      averageSleep: 6.8,
      averageMood: 3.8,
      medicationCompliance: 88
    }
  }
};

// Mock Reports Data
export const mockReports = [
  {
    id: 'report-1',
    title: 'Weekly Patient Summary',
    type: 'weekly',
    generatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    patientCount: 6,
    description: 'Comprehensive weekly summary of all patient activities and health metrics',
    data: {
      totalVitalChecks: 168,
      medicationAdherence: 92,
      incidentReports: 2,
      averageHeartRate: 82,
      averageOxygenSat: 95,
      totalSteps: 14700,
      averageSleepHours: 7.2
    }
  },
  {
    id: 'report-2',
    title: 'Medication Compliance Report',
    type: 'medication',
    generatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    patientCount: 6,
    description: 'Analysis of medication adherence and missed doses',
    data: {
      totalDoses: 84,
      missedDoses: 7,
      complianceRate: 92,
      criticalMisses: 1,
      improvementNeeded: ['Robert Thompson', 'Maria Garcia']
    }
  },
  {
    id: 'report-3',
    title: 'Sleep Quality Analysis',
    type: 'sleep',
    generatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    patientCount: 6,
    description: 'Detailed analysis of sleep patterns and quality metrics',
    data: {
      averageSleepDuration: 7.2,
      sleepQualityScore: 4.1,
      insomniaIncidents: 3,
      deepSleepPercentage: 23,
      remSleepPercentage: 18
    }
  },
  {
    id: 'report-4',
    title: 'Physical Activity Report',
    type: 'activity',
    generatedDate: new Date(),
    patientCount: 6,
    description: 'Weekly physical activity and mobility assessment',
    data: {
      totalSteps: 14700,
      activeMinutes: 180,
      fallRisk: 'Low',
      mobilityScore: 8.2,
      exerciseCompliance: 78
    }
  },
  {
    id: 'report-5',
    title: 'Mental Health & Mood Tracking',
    type: 'mood',
    generatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    patientCount: 6,
    description: 'Emotional wellbeing and mood pattern analysis',
    data: {
      averageMoodScore: 4.1,
      positiveInteractions: 32,
      concerningMoodDips: 2,
      socialEngagement: 'Good',
      anxietyLevels: 'Moderate'
    }
  }
];

export default {
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
  mockBeaconStatus,
  mockCameraFeeds,
  generateMockVitalsHistory
};
