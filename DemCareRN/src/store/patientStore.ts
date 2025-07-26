import { create } from 'zustand';
import { Patient, PatientState, VitalSigns, SleepData, MoodEntry, DietEntry, PhysicalActivity, BathroomUse, MedicationLog } from '../types';
import { PatientService } from '../services/patient';
import { BeaconService, PatientLocation } from '../services/beacon';

interface PatientStore extends PatientState {
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  fetchPatients: (doctorId: string) => Promise<void>;
  selectPatient: (patient: Patient | null) => void;
  updateVitals: (patientId: string, vitals: VitalSigns) => void;
  fetchVitalsHistory: (patientId: string) => Promise<void>;
  
  // Sleep data methods
  addSleepData: (sleepData: Omit<SleepData, 'id'>) => Promise<void>;
  updateSleepData: (id: string, updates: Partial<SleepData>) => Promise<void>;
  fetchSleepData: (patientId: string) => Promise<void>;
  
  // Mood tracking methods
  addMoodEntry: (moodEntry: Omit<MoodEntry, 'id'>) => Promise<void>;
  fetchMoodEntries: (patientId: string) => Promise<void>;
  
  // Diet tracking methods
  addDietEntry: (dietEntry: Omit<DietEntry, 'id'>) => Promise<void>;
  fetchDietEntries: (patientId: string) => Promise<void>;
  
  // Physical activity methods
  addPhysicalActivity: (activity: Omit<PhysicalActivity, 'id'>) => Promise<void>;
  fetchPhysicalActivities: (patientId: string) => Promise<void>;
  
  // Bathroom tracking methods
  addBathroomLog: (bathroomLog: Omit<BathroomUse, 'id'>) => Promise<void>;
  fetchBathroomLogs: (patientId: string) => Promise<void>;
  
  // Medication tracking methods
  addMedicationLog: (medicationLog: Omit<MedicationLog, 'id'>) => Promise<void>;
  fetchMedicationLogs: (patientId: string) => Promise<void>;
  
  // Location tracking methods
  patientLocations: PatientLocation[];
  locationLoading: boolean;
  updatePatientLocations: () => Promise<void>;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  
  setLoading: (loading: boolean) => void;
}

let locationTrackingInterval: NodeJS.Timeout | null = null;

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  selectedPatient: null,
  vitals: {},
  sleepData: {},
  bathroomLogs: {},
  medicationLogs: {},
  moodEntries: {},
  dietEntries: {},
  physicalActivities: {},
  isLoading: false,
  patientLocations: [],
  locationLoading: false,

  addPatient: async (patientData) => {
    set({ isLoading: true });
    try {
      const patient = await PatientService.addPatient(patientData);
      set(state => ({ 
        patients: [...state.patients, patient],
        isLoading: false 
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updatePatient: async (id: string, updates: Partial<Patient>) => {
    set({ isLoading: true });
    try {
      const updatedPatient = await PatientService.updatePatient(id, updates);
      set(state => ({
        patients: state.patients.map(p => p.id === id ? updatedPatient : p),
        selectedPatient: state.selectedPatient?.id === id ? updatedPatient : state.selectedPatient,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deletePatient: async (id: string) => {
    set({ isLoading: true });
    try {
      await PatientService.deletePatient(id);
      set(state => ({
        patients: state.patients.filter(p => p.id !== id),
        selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPatients: async (doctorId: string) => {
    set({ isLoading: true });
    try {
      const patients = await PatientService.getPatients(doctorId);
      set({ patients, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  selectPatient: (patient: Patient | null) => {
    set({ selectedPatient: patient });
  },

  updateVitals: (patientId: string, vitals: VitalSigns) => {
    set(state => ({
      patients: state.patients.map(p => 
        p.id === patientId ? { ...p, vitals } : p
      ),
      selectedPatient: state.selectedPatient?.id === patientId 
        ? { ...state.selectedPatient, vitals } 
        : state.selectedPatient,
      vitals: {
        ...state.vitals,
        [patientId]: [vitals, ...(state.vitals[patientId] || [])].slice(0, 100) // Keep last 100 readings
      }
    }));
  },

  fetchVitalsHistory: async (patientId: string) => {
    try {
      const history = await PatientService.getVitalsHistory(patientId);
      set(state => ({
        vitals: {
          ...state.vitals,
          [patientId]: history
        }
      }));
    } catch (error) {
      throw error;
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Sleep data methods
  addSleepData: async (sleepData) => {
    set({ isLoading: true });
    try {
      // TODO: Implement with PatientService
      const newSleepData = { ...sleepData, id: Date.now().toString() };
      set(state => ({
        sleepData: {
          ...state.sleepData,
          [sleepData.patientId]: [newSleepData, ...(state.sleepData[sleepData.patientId] || [])].slice(0, 100)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateSleepData: async (id: string, updates: Partial<SleepData>) => {
    // TODO: Implement
  },

  fetchSleepData: async (patientId: string) => {
    // TODO: Implement with PatientService
  },

  // Mood tracking methods
  addMoodEntry: async (moodEntry) => {
    set({ isLoading: true });
    try {
      const newMoodEntry = { ...moodEntry, id: Date.now().toString() };
      set(state => ({
        moodEntries: {
          ...state.moodEntries,
          [moodEntry.patientId]: [newMoodEntry, ...(state.moodEntries[moodEntry.patientId] || [])].slice(0, 100)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMoodEntries: async (patientId: string) => {
    // TODO: Implement
  },

  // Diet tracking methods
  addDietEntry: async (dietEntry) => {
    set({ isLoading: true });
    try {
      const newDietEntry = { ...dietEntry, id: Date.now().toString() };
      set(state => ({
        dietEntries: {
          ...state.dietEntries,
          [dietEntry.patientId]: [newDietEntry, ...(state.dietEntries[dietEntry.patientId] || [])].slice(0, 100)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchDietEntries: async (patientId: string) => {
    // TODO: Implement
  },

  // Physical activity methods
  addPhysicalActivity: async (activity) => {
    set({ isLoading: true });
    try {
      const newActivity = { ...activity, id: Date.now().toString() };
      set(state => ({
        physicalActivities: {
          ...state.physicalActivities,
          [activity.patientId]: [newActivity, ...(state.physicalActivities[activity.patientId] || [])].slice(0, 100)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPhysicalActivities: async (patientId: string) => {
    // TODO: Implement
  },

  // Bathroom tracking methods
  addBathroomLog: async (bathroomLog) => {
    set({ isLoading: true });
    try {
      const newBathroomLog = { ...bathroomLog, id: Date.now().toString() };
      set(state => ({
        bathroomLogs: {
          ...state.bathroomLogs,
          [bathroomLog.patientId]: [newBathroomLog, ...(state.bathroomLogs[bathroomLog.patientId] || [])].slice(0, 100)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchBathroomLogs: async (patientId: string) => {
    // TODO: Implement
  },

  // Medication tracking methods
  addMedicationLog: async (medicationLog) => {
    set({ isLoading: true });
    try {
      const newMedicationLog = { ...medicationLog, id: Date.now().toString() };
      set(state => ({
        medicationLogs: {
          ...state.medicationLogs,
          [medicationLog.patientId]: [newMedicationLog, ...(state.medicationLogs[medicationLog.patientId] || [])].slice(0, 100)
        },
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMedicationLogs: async (patientId: string) => {
    // TODO: Implement
  },

  // Location tracking methods
  updatePatientLocations: async () => {
    const { patients } = get();
    if (patients.length === 0) return;

    set({ locationLoading: true });
    try {
      const locations = await BeaconService.getPatientLocations(patients);
      set({ patientLocations: locations, locationLoading: false });
    } catch (error) {
      console.error('Error updating patient locations:', error);
      set({ locationLoading: false });
    }
  },

  startLocationTracking: () => {
    const { patients, updatePatientLocations } = get();
    
    if (locationTrackingInterval) {
      clearInterval(locationTrackingInterval);
    }

    if (patients.length === 0) return;

    // Initial load
    updatePatientLocations();

    // Set up auto-refresh every 2 seconds
    locationTrackingInterval = BeaconService.startAutoRefresh(
      (locations) => {
        set({ patientLocations: locations });
      },
      patients,
      2000
    );
  },

  stopLocationTracking: () => {
    if (locationTrackingInterval) {
      BeaconService.stopAutoRefresh(locationTrackingInterval);
      locationTrackingInterval = null;
    }
  },
}));
