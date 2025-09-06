import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStepper } from '@/components/gamification';
import { theme } from '@/constants/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';

type AcademicScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Academic'>;
type AcademicScreenRouteProp = RouteProp<RootStackParamList, 'Academic'>;

interface AcademicScreenProps {
  navigation: AcademicScreenNavigationProp;
  route: AcademicScreenRouteProp;
}

// Academic interests options
const ACADEMIC_INTERESTS = [
  'Business',
  'Engineering',
  'Pre-Med/Health Sciences',
  'Communications',
  'Education',
  'Liberal Arts',
  'Computer Science',
  'Psychology',
  'Criminal Justice',
  'Sports Management',
  'Kinesiology',
  'Undecided',
  'Other'
];

export default function AcademicScreen({ navigation, route }: AcademicScreenProps) {
  const { 
    firstName, lastName, profileImage, sport, gender, position, graduationYear, height, 
    schoolName, city, state, level, jerseyNumber,
    clubEnabled, clubOrgName, clubTeamName, clubCity, clubState, clubJerseyNumber 
  } = route.params;

  const [gpa, setGpa] = useState('');
  const [hasHonorsAP, setHasHonorsAP] = useState<boolean | null>(null);
  const [satScore, setSatScore] = useState('');
  const [actScore, setActScore] = useState('');
  const [academicInterest, setAcademicInterest] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [academicAwards, setAcademicAwards] = useState('');
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    // Button press animation
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
    ]).start(() => {
      navigation.navigate('Goals', {
        firstName,
        lastName,
        profileImage,
        sport,
        gender,
        position,
        graduationYear,
        height,
        schoolName,
        city,
        state,
        level,
        jerseyNumber: jerseyNumber || '',
        clubEnabled,
        clubOrgName,
        clubTeamName,
        clubCity,
        clubState,
        clubJerseyNumber,
        // Academic data
        gpa: gpa.trim(),
        hasHonorsAP,
        satScore: satScore.trim(),
        actScore: actScore.trim(),
        academicInterest: academicInterest === 'Other' ? customInterest.trim() : academicInterest,
        academicAwards: academicAwards.trim(),
      });
    });
  };

  const handleSkip = () => {
    navigation.navigate('Goals', {
      firstName,
      lastName,
      profileImage,
      sport,
      gender,
      position,
      graduationYear,
      height,
      schoolName,
      city,
      state,
      level,
      jerseyNumber: jerseyNumber || '',
      clubEnabled,
      clubOrgName,
      clubTeamName,
      clubCity,
      clubState,
      clubJerseyNumber,
      gpa: '',
      hasHonorsAP: null,
      satScore: '',
      actScore: '',
      academicInterest: '',
      academicAwards: '',
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowInterestDropdown(false);
  };

  const handleInterestSelect = (interest: string) => {
    setAcademicInterest(interest);
    setShowInterestDropdown(false);
    if (interest !== 'Other') {
      setCustomInterest('');
    }
  };

  const validateGPA = (text: string) => {
    // Allow numbers and decimal point, max 4.0
    const numericValue = text.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    
    let validatedValue = numericValue;
    if (parseFloat(numericValue) > 4.0) {
      validatedValue = '4.0';
    }
    
    setGpa(validatedValue);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={6}
        totalSteps={8}
        stepTitle="Academics"
        showBackButton={true}
        onBackPress={handleBack}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.headerSection}>
                <View style={styles.titleContainer}>
                  <Ionicons name="school" size={32} color={theme.colors.primary} />
                  <Text style={styles.title}>Game Plan in the Classroom</Text>
                </View>
                <Text style={styles.subtitle}>
                  Coaches recruit the student, not just the athlete. Let's set up your academic profile to strengthen your recruiting toolkit.
                </Text>
              </View>

              {/* GPA Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Academic Performance</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>GPA (Unweighted) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={gpa}
                    onChangeText={validateGPA}
                    placeholder="e.g., 3.7"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="decimal-pad"
                    maxLength={4}
                    returnKeyType="next"
                  />
                </View>

                {/* Honors/AP Toggle */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Honors/AP Courses</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleOption,
                        hasHonorsAP === true && styles.selectedToggleOption
                      ]}
                      onPress={() => setHasHonorsAP(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.toggleContent}>
                        <Ionicons 
                          name="trophy" 
                          size={18} 
                          color={hasHonorsAP === true ? theme.colors.white : theme.colors.primary} 
                        />
                        <Text style={[
                          styles.toggleText,
                          hasHonorsAP === true && styles.selectedToggleText
                        ]}>
                          Yes, I take advanced courses
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.toggleOption,
                        hasHonorsAP === false && styles.selectedToggleOption
                      ]}
                      onPress={() => setHasHonorsAP(false)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.toggleContent}>
                        <Ionicons 
                          name="book" 
                          size={18} 
                          color={hasHonorsAP === false ? theme.colors.white : theme.colors.textSecondary} 
                        />
                        <Text style={[
                          styles.toggleText,
                          hasHonorsAP === false && styles.selectedToggleText
                        ]}>
                          Standard coursework
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Test Scores Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Test Scores (Optional)</Text>
                
                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>SAT Score</Text>
                    <TextInput
                      style={styles.textInput}
                      value={satScore}
                      onChangeText={setSatScore}
                      placeholder="1200"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="numeric"
                      maxLength={4}
                      returnKeyType="next"
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>ACT Score</Text>
                    <TextInput
                      style={styles.textInput}
                      value={actScore}
                      onChangeText={setActScore}
                      placeholder="28"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="numeric"
                      maxLength={2}
                      returnKeyType="next"
                    />
                  </View>
                </View>
              </View>

              {/* Academic Interest Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Academic Interest</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Intended Major/Field of Study</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowInterestDropdown(!showInterestDropdown)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownText,
                      !academicInterest && styles.placeholderText
                    ]}>
                      {academicInterest || 'Select your academic interest'}
                    </Text>
                    <Ionicons 
                      name={showInterestDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={theme.colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {showInterestDropdown && (
                    <View style={styles.dropdown}>
                      {ACADEMIC_INTERESTS.map((interest) => (
                        <TouchableOpacity
                          key={interest}
                          style={styles.dropdownItem}
                          onPress={() => handleInterestSelect(interest)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownItemText}>{interest}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {academicInterest === 'Other' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Specify Your Interest</Text>
                    <TextInput
                      style={styles.textInput}
                      value={customInterest}
                      onChangeText={setCustomInterest}
                      placeholder="Enter your field of interest"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                )}
              </View>

              {/* Academic Awards Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Academic Recognition (Optional)</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Awards & Honors</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={academicAwards}
                    onChangeText={setAcademicAwards}
                    placeholder="e.g., Honor Roll, National Honor Society, Dean's List"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primary + 'DD']}
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>
                        Add to My Profile
                      </Text>
                      <Ionicons 
                        name="arrow-forward" 
                        size={20} 
                        color={theme.colors.white} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipButtonText}>
                    Skip for now — add later in profile
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.helperText}>
                  📚 Building your complete student-athlete profile for recruiting success
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
    minHeight: 700,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Section Container
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  multilineInput: {
    height: 80,
    paddingTop: 16,
  },
  // Toggle Styles
  toggleContainer: {
    gap: 12,
  },
  toggleOption: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedToggleOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  selectedToggleText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  // Dropdown Styles
  dropdownButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textTertiary,
  },
  dropdown: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    maxHeight: 200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral100,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
  },
  // Button Section
  buttonSection: {
    gap: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.neutral100,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  helperText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
