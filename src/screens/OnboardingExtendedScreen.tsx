import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  AppState,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, Position, HighSchool, Club } from '../types';
import { theme } from '@shared/theme';
import { useGamificationStore } from '../stores/gamificationStore';

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const ONBOARDING_STORAGE_KEY = '@StatLocker:OnboardingData';

const gradYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);
const genders = ['boys', 'girls'] as const;
const levels = ['Varsity', 'JV', 'Freshman'] as const;

const strengthsOptions = [
  'Speed', 'Agility', 'Stick Skills', 'Vision', 'Leadership', 'Defense', 'Shooting', 
  'Passing', 'Dodging', 'Ground Balls', 'Faceoffs', 'Clearing', 'Riding'
];

export default function OnboardingScreen({ navigation, route }: any) {
  const { addXP } = useGamificationStore();
  const [dataLoaded, setDataLoaded] = useState(false);
  const totalSteps = 7;
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // Form state with proper initialization
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<'boys' | 'girls'>('boys');
  const [position, setPosition] = useState<Position | ''>('');
  const [gradYear, setGradYear] = useState<number | null>(null);
  const [highSchool, setHighSchool] = useState<HighSchool>({
    name: '',
    city: '',
    state: '',
    level: 'Varsity',
  });
  const [club, setClub] = useState<Club>({
    enabled: false,
    org_name: '',
    team_name: '',
    city: '',
    state: '',
  });
  const [strengths, setStrengths] = useState<string[]>([]);
  const [growthAreas, setGrowthAreas] = useState<string[]>([]);
  const [trainingFrequency, setTrainingFrequency] = useState<number | null>(null);
  const [motto, setMotto] = useState('');
  const [profileSummary, setProfileSummary] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState(route.params?.email || '');

  // Load saved onboarding data on component mount
  useEffect(() => {
    loadOnboardingData();
  }, []);

  // Save data whenever any form field changes
  useEffect(() => {
    if (dataLoaded) {
      saveOnboardingData();
    }
  }, [
    currentStep, firstName, gender, position, gradYear, highSchool, club,
    strengths, growthAreas, trainingFrequency, motto, profileSummary, height, weight, password, confirmPassword, userEmail, dataLoaded
  ]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  // Handle app state changes (backgrounding)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        saveOnboardingData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Restore all form state
        setCurrentStep(data.currentStep || 1);
        setFirstName(data.firstName || '');
        setGender(data.gender || 'boys');
        setPosition(data.position || '');
        setGradYear(data.gradYear);
        setHighSchool(data.highSchool || {
          name: '',
          city: '',
          state: '',
          level: 'Varsity',
        });
        setClub(data.club || {
          enabled: false,
          org_name: '',
          team_name: '',
          city: '',
          state: '',
        });
        setStrengths(data.strengths || []);
        setGrowthAreas(data.growthAreas || []);
        setTrainingFrequency(data.trainingFrequency);
        setMotto(data.motto || '');
        setProfileSummary(data.profileSummary || '');
        setHeight(data.height || '');
        setWeight(data.weight || '');
        setPassword(data.password || '');
        setConfirmPassword(data.confirmPassword || '');
        setUserEmail(data.userEmail || route.params?.email || '');
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setDataLoaded(true);
    }
  };

  const saveOnboardingData = async () => {
    try {
      const data = {
        currentStep,
        firstName,
        gender,
        position,
        gradYear,
        highSchool,
        club,
        strengths,
        growthAreas,
        trainingFrequency,
        motto,
        profileSummary,
        height,
        weight,
        password,
        confirmPassword,
        userEmail,
      };
      
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const clearOnboardingData = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      // Button bounce animation
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep(currentStep + 1);
      // Award XP for completing each step
      addXP(35, `Completed Step ${currentStep}`);
      
      // Reset animations for next step
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
    } else {
      // Onboarding completed - create account and navigate to paywall
      try {
        // Award completion bonus XP
        addXP(200, 'Completed Extended Onboarding');
        
        // Clear onboarding data since we're done
        await clearOnboardingData();
        
        // Navigate to paywall
        navigation.navigate('Paywall');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Still navigate to paywall even if there's an error
        navigation.navigate('Paywall');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
    } else {
      navigation.goBack();
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return firstName.trim().length > 0;
      case 2:
        return gender && position && gradYear;
      case 3:
        return highSchool.name.trim() && highSchool.city.trim() && highSchool.state.trim();
      case 4:
        return !club.enabled || (club.org_name.trim() && club.team_name.trim());
      case 5:
        return strengths.length > 0 && growthAreas.length > 0 && trainingFrequency !== null;
      case 6:
        return motto.trim().length > 0 && profileSummary.trim().length > 0;
      case 7:
        return password.trim().length > 0 && confirmPassword.trim().length > 0 && userEmail.trim().length > 0;
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Welcome";
      case 2: return "Profile";
      case 3: return "School";
      case 4: return "Club";
      case 5: return "Skills";
      case 6: return "Goals";
      case 7: return "Account";
      default: return "Setup";
    }
  };

  const getCoachMessage = () => {
    switch (currentStep) {
      case 1: return "Welcome to the championship level! What should we call you on the field?";
      case 2: return "Time to build your player profile — let's show what position dominates!";
      case 3: return "Rep your school with pride — where do you make magic happen?";
      case 4: return "Club ball? Elite level training deserves recognition!";
      case 5: return "Every champion knows their strengths and growth areas — what's yours?";
      case 6: return "Champions have vision — what drives your game to the next level?";
      case 7: return "Final step, champion — let's lock in your account and get you started!";
      default: return "Let's keep building your game!";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.headerSection}>
              <Text style={styles.title}>Welcome to the Squad!</Text>
              <Text style={styles.subtitle}>{getCoachMessage()}</Text>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.sectionTitle}>First Name</Text>
              <TextInput
                style={[
                  styles.nameInput,
                  firstName.trim() && styles.nameInputActive
                ]}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (text.trim() && !firstName.trim()) {
                    addXP(25, 'Started entering name');
                  }
                }}
                placeholder="Your first name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
              {firstName.trim() && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </View>
              )}
            </View>

            {firstName.trim() && (
              <Animated.View style={styles.welcomeCard}>
                <Text style={styles.welcomeMessage}>
                  Welcome to the championship level, {firstName}! 🏆
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.headerSection}>
              <Text style={styles.title}>Lock In Your Account</Text>
              <Text style={styles.subtitle}>{getCoachMessage()}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
              {/* Email */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Your champion email</Text>
                <TextInput
                  style={[
                    styles.nameInput,
                    userEmail.trim() && styles.nameInputActive
                  ]}
                  value={userEmail}
                  onChangeText={(text) => setUserEmail(text)}
                  placeholder="champion@example.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                />
                {userEmail.trim() && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  </View>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Create your secure password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.nameInput,
                      password.trim() && styles.nameInputActive
                    ]}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    placeholder="Strong password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Confirm your password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.nameInput,
                      confirmPassword.trim() && styles.nameInputActive
                    ]}
                    value={confirmPassword}
                    onChangeText={(text) => setConfirmPassword(text)}
                    placeholder="Confirm password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        );

      default:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Step {currentStep}</Text>
            <Text style={styles.subtitle}>Content for step {currentStep}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Game HUD Stepper */}
          <OnboardingStepper 
            currentStep={currentStep + 2} // +2 because name collection is step 1, path selection is step 2
            totalSteps={8}
            stepTitle={getStepTitle()}
          />

          {/* Content */}
          <View style={styles.content}>
            {renderStep()}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.textSecondary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !canContinue() && styles.nextButtonDisabled
                ]}
                onPress={handleNext}
                disabled={!canContinue()}
              >
                <LinearGradient
                  colors={canContinue() ? [theme.colors.primary, theme.colors.primary + 'DD'] : [theme.colors.neutral300, theme.colors.neutral300]}
                  style={styles.nextButtonGradient}
                >
                  <Text style={[
                    styles.nextText,
                    !canContinue() && styles.nextTextDisabled
                  ]}>
                    {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={canContinue() ? theme.colors.white : theme.colors.textTertiary}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.neutral100,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.neutral200,
  },
  nameInputActive: {
    borderBottomColor: theme.colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  welcomeCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  welcomeMessage: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 8,
    padding: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
  nextTextDisabled: {
    color: theme.colors.textTertiary,
  },
});