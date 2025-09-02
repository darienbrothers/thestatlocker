import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import * as AppleAuthentication from 'expo-apple-authentication';

export interface User {
  id: string;
  uid: string; // Firebase UID
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  graduationYear?: number | null;
  profilePicture?: string | null;
  photoURL?: string | null; // Firebase photoURL
  
  // High School Info
  highSchool?: {
    name?: string | null;
    city?: string | null;
    state?: string | null;
    coach?: string | null;
    coachEmail?: string | null;
    jerseyNumber?: string | null;
  };
  
  // Club Info
  club?: {
    name?: string | null;
    city?: string | null;
    state?: string | null;
    coach?: string | null;
    coachEmail?: string | null;
    jerseyNumber?: string | null;
  };
  
  // Onboarding
  hasCompletedOnboarding?: boolean;
  onboardingType?: 'quick' | 'extended';
  
  // Profile completion tracking
  profileCompletion?: {
    basicInfo: boolean;
    schoolInfo: boolean;
    clubInfo: boolean;
    goals: boolean;
    strengths: boolean;
  };
  
  // Goals and aspirations
  goals?: {
    collegeInterest?: boolean;
    dreamSchools?: string[];
    currentGPA?: number | null;
    targetGPA?: number | null;
    improvementAreas?: string[];
  };
  
  // Extended onboarding data
  strengths?: string[];
  weaknesses?: string[];
  trainingDays?: number | null;
  experience?: string | null;
  
  // Timestamps
  createdAt?: any;
  updatedAt?: any;
}

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  fetchUser: (uid: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,

  signUp: async (email: string, password: string, userData = {}) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        hasCompletedOnboarding: false,
        profileCompletion: {
          basicInfo: false,
          schoolInfo: false,
          clubInfo: false,
          goals: false,
          strengths: false,
        },
        ...userData,
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      set({ user: newUser, firebaseUser, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await get().fetchUser(firebaseUser.uid);
      set({ firebaseUser, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signInWithApple: async () => {
    set({ loading: true, error: null });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, email, fullName } = credential;
      
      if (identityToken) {
        const provider = new OAuthProvider('apple.com');
        const authCredential = provider.credential({
          idToken: identityToken,
        });

        const userCredential = await signInWithCredential(auth, authCredential);
        const firebaseUser = userCredential.user;
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Create new user document
          const newUser: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: email || firebaseUser.email!,
            firstName: fullName?.givenName || null,
            lastName: fullName?.familyName || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            hasCompletedOnboarding: false,
            profileCompletion: {
              basicInfo: false,
              schoolInfo: false,
              clubInfo: false,
              goals: false,
              strengths: false,
            },
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          set({ user: newUser, firebaseUser, loading: false });
        } else {
          await get().fetchUser(firebaseUser.uid);
          set({ firebaseUser, loading: false });
        }
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        set({ loading: false });
        return;
      }
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, firebaseUser: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUser: async (userData: Partial<User>) => {
    const { user, firebaseUser } = get();
    if (!user || !firebaseUser) {
      throw new Error('No authenticated user');
    }

    set({ loading: true, error: null });
    try {
      const updatedData = {
        ...userData,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(doc(db, 'users', firebaseUser.uid), updatedData);
      
      const updatedUser = { ...user, ...userData };
      set({ user: updatedUser, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUser: async (uid: string) => {
    console.log('AuthStore - fetchUser called with UID:', uid);
    set({ loading: true, error: null });
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('AuthStore - User data retrieved from Firestore:', JSON.stringify(userData, null, 2));
        set({ user: userData, loading: false });
      } else {
        console.log('AuthStore - No user document found for UID:', uid);
        set({ user: null, loading: false });
      }
    } catch (error: any) {
      console.error('AuthStore - Error fetching user:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await get().fetchUser(firebaseUser.uid);
          set({ firebaseUser });
        } catch (error) {
          console.error('Error fetching user data:', error);
          set({ firebaseUser, user: null });
        }
      } else {
        set({ firebaseUser: null, user: null });
      }
    });

    return unsubscribe;
  },
}));
