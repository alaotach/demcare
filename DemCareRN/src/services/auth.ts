import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { User, UserRole } from '../types';
import ConfigService from './config';
import { MockAuthService } from './mockService';

export interface SignUpData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  age: number;
  password: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  static async signUp(data: SignUpData): Promise<User> {
    // Check if mock mode is enabled
    if (ConfigService.isMockModeEnabled()) {
      return MockAuthService.signUp(data);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user: User = {
        id: userCredential.user.uid,
        email: data.email,
        fullName: data.fullName,
        username: data.username,
        phoneNumber: data.phoneNumber,
        age: data.age,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save user data to Firestore
      await setDoc(doc(firestore, 'users', user.id), user);

      return user;
    } catch (error) {
      throw new Error(`Sign up failed: ${error}`);
    }
  }

  static async signIn(data: SignInData): Promise<User> {
    // Check if mock mode is enabled
    if (ConfigService.isMockModeEnabled()) {
      return MockAuthService.signIn(data.email, data.password);
    }

    try {
      // Handle demo credentials without Firebase authentication
      if (data.email === 'doctor@demcare.com' && data.password === 'doctor123') {
        return {
          id: 'demo-doctor-1', // Changed to match mock data
          email: 'doctor@demcare.com',
          fullName: 'Dr. Sarah Johnson',
          username: 'dr_sarah',
          phoneNumber: '+1 (555) 123-4567',
          age: 35,
          role: UserRole.DOCTOR,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      if (data.email === 'caregiver@demcare.com' && data.password === 'caregiver123') {
        return {
          id: 'demo-caregiver-1', // Changed to match mock data
          email: 'caregiver@demcare.com',
          fullName: 'Maria Rodriguez',
          username: 'maria_care',
          phoneNumber: '+1 (555) 987-6543',
          age: 28,
          role: UserRole.CAREGIVER,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Get user data from Firestore
      const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt)
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('User data not found')) {
        throw error;
      }
      throw new Error(`Sign in failed: ${error}`);
    }
  }

  static async signOut(): Promise<void> {
    // Check if mock mode is enabled
    if (ConfigService.isMockModeEnabled()) {
      return MockAuthService.signOut();
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error(`Sign out failed: ${error}`);
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(`Password reset failed: ${error}`);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    // Check if mock mode is enabled
    if (ConfigService.isMockModeEnabled()) {
      return MockAuthService.getCurrentUser();
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) return null;

      const userData = userDoc.data() as User;
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt)
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    // Check if mock mode is enabled
    if (ConfigService.isMockModeEnabled()) {
      return MockAuthService.onAuthStateChanged(callback);
    }

    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check if this is a demo user
        if (firebaseUser.uid === 'demo-doctor-1' || firebaseUser.uid === 'demo-caregiver-1') {
          // For demo users, we don't call getCurrentUser since they're not in Firestore
          callback(null);
          return;
        }
        
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
