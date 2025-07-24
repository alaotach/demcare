import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, onValue, off, push, set } from 'firebase/database';
import { firestore, database } from './firebase';
import { Patient, VitalSigns, PatientStatus } from '../types';

export class PatientService {
  static async addPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      const docRef = await addDoc(collection(firestore, 'patients'), {
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: PatientStatus.OFFLINE
      });

      const patient: Patient = {
        id: docRef.id,
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: PatientStatus.OFFLINE
      };

      return patient;
    } catch (error) {
      throw new Error(`Failed to add patient: ${error}`);
    }
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const patientRef = doc(firestore, 'patients', id);
      await updateDoc(patientRef, {
        ...updates,
        updatedAt: new Date()
      });

      const updatedDoc = await getDoc(patientRef);
      if (!updatedDoc.exists()) {
        throw new Error('Patient not found after update');
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)
      } as Patient;
    } catch (error) {
      throw new Error(`Failed to update patient: ${error}`);
    }
  }

  static async deletePatient(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, 'patients', id));
    } catch (error) {
      throw new Error(`Failed to delete patient: ${error}`);
    }
  }

  static async getPatients(doctorId: string): Promise<Patient[]> {
    try {
      const q = query(
        collection(firestore, 'patients'),
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const patients: Patient[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)
        } as Patient);
      });

      return patients;
    } catch (error) {
      throw new Error(`Failed to fetch patients: ${error}`);
    }
  }

  static async getPatient(id: string): Promise<Patient | null> {
    try {
      const docSnap = await getDoc(doc(firestore, 'patients', id));
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)
      } as Patient;
    } catch (error) {
      throw new Error(`Failed to fetch patient: ${error}`);
    }
  }

  static async getVitalsHistory(patientId: string, limitCount: number = 100): Promise<VitalSigns[]> {
    try {
      // This would typically fetch from Firestore or Realtime Database
      // For now, returning empty array - implement based on your data structure
      return [];
    } catch (error) {
      throw new Error(`Failed to fetch vitals history: ${error}`);
    }
  }

  static subscribeToVitals(patientId: string, callback: (vitals: VitalSigns) => void): () => void {
    const vitalsRef = ref(database, `vitals/${patientId}/current`);
    
    const unsubscribe = onValue(vitalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vitals: VitalSigns = {
          ...data,
          timestamp: new Date(data.timestamp)
        };
        callback(vitals);
      }
    });

    return () => off(vitalsRef, 'value', unsubscribe);
  }

  static async updateVitals(patientId: string, vitals: VitalSigns): Promise<void> {
    try {
      const vitalsRef = ref(database, `vitals/${patientId}`);
      
      // Update current vitals
      await set(ref(database, `vitals/${patientId}/current`), {
        ...vitals,
        timestamp: vitals.timestamp.toISOString()
      });

      // Add to history
      const historyRef = ref(database, `vitals/${patientId}/history`);
      await push(historyRef, {
        ...vitals,
        timestamp: vitals.timestamp.toISOString()
      });

      // Update patient status based on vitals
      const status = this.determinePatientStatus(vitals);
      await updateDoc(doc(firestore, 'patients', patientId), {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to update vitals: ${error}`);
    }
  }

  private static determinePatientStatus(vitals: VitalSigns): PatientStatus {
    // Define normal ranges
    const normalRanges = {
      heartRate: { min: 60, max: 100 },
      oxygenSaturation: { min: 95, max: 100 },
      respiratoryRate: { min: 12, max: 20 }
    };

    const isInRange = (
      vitals.heartRate >= normalRanges.heartRate.min &&
      vitals.heartRate <= normalRanges.heartRate.max &&
      vitals.oxygenSaturation >= normalRanges.oxygenSaturation.min &&
      vitals.oxygenSaturation <= normalRanges.oxygenSaturation.max &&
      vitals.respiratoryRate >= normalRanges.respiratoryRate.min &&
      vitals.respiratoryRate <= normalRanges.respiratoryRate.max
    );

    return isInRange ? PatientStatus.IN_RANGE : PatientStatus.OUT_OF_RANGE;
  }
}
