import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile,
  signInWithCredential,
  OAuthProvider,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  onboarding_completed?: boolean;
  sport?: string;
  gender?: 'boys' | 'girls';
  position?: string;
  team?: string;
  graduationYear?: number;
  highSchool?: {
    name: string;
    city: string;
    state: string;
    level: string;
  };
  strengths?: string[];
  growth?: string[];
  training_days_per_week?: number;
  nudge?: {
    time: string;
    days: string[];
    after_games_only: boolean;
  };
  motto?: string;
  analytics_consent?: boolean;
  goals?: string[];
  purpose?: string;
  focus_30d?: string[];
  club?: {
    enabled: boolean;
    name?: string;
    city?: string;
    state?: string;
    level?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: { firstName?: string; lastName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => void;
  appleSignIn: (identityToken: string, nonce?: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Actions
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ...userData,
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false,
        user: null,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, userData?: { firstName?: string; lastName?: string }) => {
    try {
      set({ isLoading: true, error: null });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name if provided
      if (userData?.firstName && userData?.lastName) {
        await updateProfile(firebaseUser, {
          displayName: `${userData.firstName} ${userData.lastName}`
        });
      }
      
      // Create user document in Firestore
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        photoURL: firebaseUser.photoURL,
        onboarding_completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), user);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false,
        user: null,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await firebaseSignOut(auth);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateUserProfile: async (userData: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { 
        ...user, 
        ...userData, 
        updatedAt: new Date() 
      };
      
      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true });
      
      set({ user: updatedUser });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initialize: () => {
    set({ isLoading: true });
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userData,
          };
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: 'Failed to load user data' 
          });
        }
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      }
    });

    return unsubscribe;
  },

  appleSignIn: async (identityToken: string, nonce?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const credential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let user: User;

      if (!userDoc.exists()) {
        // Create new user document
        user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          onboarding_completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), user);
      } else {
        // Get existing user data
        const userData = userDoc.data();
        user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          ...userData,
        };
      }

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false,
        user: null,
        isAuthenticated: false 
      });
      throw error;
    }
  },
}));
