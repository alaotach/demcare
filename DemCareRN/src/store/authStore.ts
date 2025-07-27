import { create } from 'zustand';
import { AuthState, User } from '../types';
import { AuthService } from '../services/auth';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => (() => void) | undefined;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      console.log('AuthStore: Attempting to sign in with:', email);
      const user = await AuthService.signIn({ email, password });
      console.log('AuthStore: Sign in successful, user:', user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('AuthStore: Sign in failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (data: any) => {
    set({ isLoading: true });
    try {
      const user = await AuthService.signUp(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await AuthService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initializeAuth: () => {
    console.log('AuthStore: initializeAuth called');
    set({ isLoading: true });
    try {
      const unsubscribe = AuthService.onAuthStateChanged((user) => {
        console.log('AuthStore: Auth state changed, user:', user?.fullName || 'null');
        set({ user, isAuthenticated: !!user, isLoading: false });
      });
      
      console.log('AuthStore: onAuthStateChanged listener set up');
      
      // Return the unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('AuthStore: Error initializing auth:', error);
      set({ isLoading: false });
    }
  }
}));
