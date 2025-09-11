import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithCredential,
  OAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
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

  // Onboarding data
  sport?: string | null;
  height?: string | null;
  gender?: string | null;
  gpa?: string | null;
  level?: string | null;
  jerseyNumber?: string | null;

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
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  signUp: (
    email: string,
    password: string,
    userData?: Partial<User>,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  fetchUser: (uid: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
  initialize: () => void;
  createUserWithOnboardingData: (onboardingData: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isLoading: false,

  signUp: async (email: string, password: string, userData = {}) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
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
      set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        loading: false,
      });
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
        console.log(
          'AuthStore - User data retrieved from Firestore:',
          JSON.stringify(userData, null, 2),
        );
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
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      set({ isLoading: true });
      if (firebaseUser) {
        try {
          await get().fetchUser(firebaseUser.uid);
          set({ firebaseUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Error fetching user data:', error);
          set({
            firebaseUser,
            user: null,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        set({
          firebaseUser: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return unsubscribe;
  },

  initialize: () => {
    return get().initializeAuth();
  },

  createUserWithOnboardingData: async (onboardingData: any) => {
    set({ loading: true, error: null });
    try {
      const { email, password, ...userData } = onboardingData;

      // Check if user already exists
      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        firebaseUser = userCredential.user;
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          // Sign in existing user instead
          const signInCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password,
          );
          firebaseUser = signInCredential.user;

          // Check if user document exists
          const existingUserDoc = await getDoc(
            doc(db, 'users', firebaseUser.uid),
          );
          if (existingUserDoc.exists()) {
            const existingUser = existingUserDoc.data() as User;
            set({
              user: existingUser,
              firebaseUser,
              isAuthenticated: true,
              loading: false,
            });
            return;
          }
        } else {
          throw error;
        }
      }

      // Create complete user document with onboarding data
      const newUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: userData.profileImage,
        photoURL: userData.profileImage,
        position: userData.position,
        graduationYear: userData.graduationYear,
        sport: userData.sport || 'lacrosse',
        height: userData.height,
        gender: userData.gender,
        gpa: userData.gpa,
        level: userData.level,
        jerseyNumber: userData.jerseyNumber,

        // High School Info
        highSchool: {
          name: userData.schoolName || null,
          city: userData.city || null,
          state: userData.state || null,
          coach: null,
          coachEmail: null,
          jerseyNumber: userData.jerseyNumber || null,
        },

        // Club Info (if enabled)
        club: userData.clubEnabled
          ? {
              name: userData.clubOrgName || null,
              city: userData.clubCity || null,
              state: userData.clubState || null,
              coach: null,
              coachEmail: null,
              jerseyNumber: null,
            }
          : {
              name: null,
              city: null,
              state: null,
              coach: null,
              coachEmail: null,
              jerseyNumber: null,
            },

        // Goals and onboarding completion
        goals: {
          collegeInterest: userData.goals?.collegeInterest || false,
          dreamSchools: userData.goals?.dreamSchools || [],
          currentGPA: userData.gpa ? parseFloat(userData.gpa) : null,
          targetGPA: userData.goals?.targetGPA || null,
          improvementAreas: userData.goals?.improvementAreas || userData.selectedGoals || [],
        },
        hasCompletedOnboarding: true,
        onboardingType: 'extended',

        // Profile completion tracking
        profileCompletion: {
          basicInfo: true,
          schoolInfo: true,
          clubInfo: userData.clubEnabled || false,
          goals: true,
        },

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      // Update store state
      set({
        user: newUser,
        firebaseUser,
        isAuthenticated: true,
        loading: false,
      });

      // Force a refresh of user data to ensure it's properly loaded
      await get().fetchUser(firebaseUser.uid);

      console.log('User created successfully with onboarding data:', newUser);
    } catch (error: any) {
      console.error('Error creating user with onboarding data:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
