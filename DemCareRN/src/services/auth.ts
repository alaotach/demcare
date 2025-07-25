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
    try {
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
      throw new Error(`Sign in failed: ${error}`);
    }
  }

  static async signOut(): Promise<void> {
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
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
