import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { OnboardingStepper } from '@/components/gamification';
import { theme } from '@/constants/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';

type AcademicScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Academic'
>;
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
  'Other',
];

export default function AcademicScreen({
  navigation,
  route,
}: AcademicScreenProps) {
  const {
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
    jerseyNumber,
    clubEnabled,
    clubOrgName,
    clubTeamName,
    clubCity,
    clubState,
    clubJerseyNumber,
    academicData,
    returnTo,
    fromReview,
    ...otherParams
  } = route.params;

  // Initialize academic data from route params if available (for persistence)
  const [gpa, setGpa] = useState(academicData?.gpa || '');
  const [hasHonorsAP, setHasHonorsAP] = useState<boolean | null>(
    academicData?.hasHonorsAP ?? null,
  );
  const [satScore, setSatScore] = useState(academicData?.satScore || '');
  const [actScore, setActScore] = useState(academicData?.actScore || '');
  const [academicInterests, setAcademicInterests] = useState<string[]>(
    academicData?.academicInterests || [],
  );
  const [customInterest, setCustomInterest] = useState(
    academicData?.customInterest || '',
  );
  const [academicAwards, setAcademicAwards] = useState(
    academicData?.academicAwards || '',
  );

  // Accordion section states
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    tests: false,
    interests: false,
    awards: false,
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const sectionAnimations = useRef({
    performance: new Animated.Value(1),
    tests: new Animated.Value(0),
    interests: new Animated.Value(0),
    awards: new Animated.Value(0),
  }).current;

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isExpanded = expandedSections[section];
    setExpandedSections(prev => ({
      ...prev,
      [section]: !isExpanded,
    }));

    Animated.timing(sectionAnimations[section], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getGpaFeedback = (gpaValue: string) => {
    const numGpa = parseFloat(gpaValue);
    if (isNaN(numGpa)) {
      return { text: '', color: theme.colors.white };
    }

    if (numGpa >= 3.7) {
      return { text: 'Excellent!', color: '#4CAF50' };
    }
    if (numGpa >= 3.3) {
      return { text: 'Great!', color: '#8BC34A' };
    }
    if (numGpa >= 3.0) {
      return { text: 'Good', color: '#FFC107' };
    }
    if (numGpa >= 2.5) {
      return { text: 'Fair', color: '#FF9800' };
    }
    return { text: 'Keep improving!', color: '#FF5722' };
  };

  const handleGpaChange = (value: string) => {
    // Allow only numbers and one decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    const numValue = parseFloat(cleanValue);
    if (numValue > 4.0) {
      return;
    }

    setGpa(cleanValue);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
      const updatedParams = {
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
        gpa: gpa.trim() || '',
        hasHonorsAP,
        satScore: satScore.trim() || '',
        actScore: actScore.trim() || '',
        academicInterest: academicInterests.length > 0 ? academicInterests.join(', ') : '',
        academicInterests: academicInterests.includes('Other')
          ? [...academicInterests.filter(i => i !== 'Other'), customInterest.trim()]
          : academicInterests,
        academicAwards: academicAwards.trim() || '',
        // Preserve academic data for future navigation
        academicData: {
          gpa: gpa.trim() || '',
          hasHonorsAP,
          satScore: satScore.trim() || '',
          actScore: actScore.trim() || '',
          academicInterests: academicInterests.includes('Other')
            ? [...academicInterests.filter(i => i !== 'Other'), customInterest.trim()]
            : academicInterests,
          customInterest: customInterest.trim() || '',
          academicAwards: academicAwards.trim() || '',
        },
        ...otherParams,
      };

      if (returnTo === 'Review') {
        navigation.navigate('Review', updatedParams);
      } else {
        navigation.navigate('Goals', updatedParams);
      }
    });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedParams = {
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
      academicInterests: [],
      academicAwards: '',
      // Preserve empty academic data structure for consistency
      academicData: {
        gpa: '',
        hasHonorsAP: null,
        satScore: '',
        actScore: '',
        academicInterests: [],
        customInterest: '',
        academicAwards: '',
      },
      ...otherParams,
    };

    if (fromReview || returnTo === 'Review') {
      navigation.navigate('Review', updatedParams);
    } else {
      navigation.navigate('Goals', updatedParams);
    }
  };

  const handleBack = () => {
    // Save current academic data before going back
    const currentAcademicData = {
      gpa,
      hasHonorsAP,
      satScore,
      actScore,
      academicInterests,
      customInterest,
      academicAwards,
    };

    // Navigate back to TeamInformation with all data preserved
    navigation.navigate('TeamInformation', {
      firstName,
      lastName,
      profileImage,
      sport,
      gender,
      position,
      graduationYear,
      height,
      // Preserve team data
      teamData: {
        schoolName,
        city,
        state,
        level,
        jerseyNumber,
        clubEnabled,
        clubOrgName,
        clubTeamName,
        clubCity,
        clubState,
        clubJerseyNumber,
      },
      // Save academic data for future use
      academicData: currentAcademicData,
      ...otherParams,
    } as any);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const gpaFeedback = getGpaFeedback(gpa);

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper
        currentStep={5}
        totalSteps={8}
        stepTitle="Academic Information"
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
                },
              ]}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Image
                  source={require('../../../../assets/logos/logoBlack.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Academic Excellence</Text>
                <Text style={styles.subtitle}>
                  Share your academic achievements and goals to showcase your
                  full potential
                </Text>
              </View>

              {/* Section 1: Academic Performance */}
              <View style={styles.accordionSection}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleSection('performance')}
                  activeOpacity={0.8}
                >
                  <View style={styles.accordionHeaderContent}>
                    <View style={styles.accordionIconContainer}>
                      <Ionicons
                        name="school"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={styles.accordionTitle}>
                      Academic Performance
                    </Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.accordionChevron,
                      {
                        transform: [
                          {
                            rotate: sectionAnimations.performance.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.white}
                    />
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.accordionContent,
                    {
                      maxHeight: sectionAnimations.performance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 200],
                      }),
                      opacity: sectionAnimations.performance,
                    },
                  ]}
                >
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>GPA (Unweighted)</Text>
                    <View style={styles.gpaInputContainer}>
                      <TextInput
                        style={styles.input}
                        value={gpa}
                        onChangeText={handleGpaChange}
                        placeholder="3.75"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="decimal-pad"
                        maxLength={4}
                      />
                      {gpaFeedback.text && (
                        <Text
                          style={[
                            styles.gpaFeedback,
                            { color: gpaFeedback.color },
                          ]}
                        >
                          {gpaFeedback.text}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Honors/AP Courses</Text>
                    <View style={styles.booleanContainer}>
                      {[
                        { value: true, label: 'Yes' },
                        { value: false, label: 'No' },
                      ].map(option => (
                        <TouchableOpacity
                          key={option.label}
                          style={[
                            styles.booleanButton,
                            hasHonorsAP === option.value &&
                              styles.booleanButtonActive,
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            setHasHonorsAP(option.value);
                          }}
                        >
                          <Text
                            style={[
                              styles.booleanButtonText,
                              hasHonorsAP === option.value &&
                                styles.booleanButtonTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Animated.View>
              </View>

              {/* Section 2: Standardized Tests */}
              <View style={styles.accordionSection}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleSection('tests')}
                  activeOpacity={0.8}
                >
                  <View style={styles.accordionHeaderContent}>
                    <View style={styles.accordionIconContainer}>
                      <Ionicons
                        name="document-text"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={styles.accordionTitle}>
                      Standardized Tests
                    </Text>
                    <Text style={styles.accordionSubtitle}>Optional</Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.accordionChevron,
                      {
                        transform: [
                          {
                            rotate: sectionAnimations.tests.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.white}
                    />
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.accordionContent,
                    {
                      maxHeight: sectionAnimations.tests.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 150],
                      }),
                      opacity: sectionAnimations.tests,
                    },
                  ]}
                >
                  <View style={styles.inputRow}>
                    <View
                      style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}
                    >
                      <Text style={styles.label}>SAT Score</Text>
                      <TextInput
                        style={styles.input}
                        value={satScore}
                        onChangeText={setSatScore}
                        placeholder="1450"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>

                    <View
                      style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}
                    >
                      <Text style={styles.label}>ACT Score</Text>
                      <TextInput
                        style={styles.input}
                        value={actScore}
                        onChangeText={setActScore}
                        placeholder="32"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </View>
                </Animated.View>
              </View>

              {/* Section 3: Academic Interests */}
              <View style={styles.accordionSection}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleSection('interests')}
                  activeOpacity={0.8}
                >
                  <View style={styles.accordionHeaderContent}>
                    <View style={styles.accordionIconContainer}>
                      <Ionicons
                        name="library"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={styles.accordionTitle}>
                      Academic Interests
                    </Text>
                    <Text style={styles.accordionSubtitle}>
                      {academicInterests.length}/3 selected
                    </Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.accordionChevron,
                      {
                        transform: [
                          {
                            rotate: sectionAnimations.interests.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.white}
                    />
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.accordionContent,
                    {
                      maxHeight: sectionAnimations.interests.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 400],
                      }),
                      opacity: sectionAnimations.interests,
                    },
                  ]}
                >
                  <Text style={styles.interestsHelper}>
                    Choose up to 3 areas of academic interest. Tap to select/deselect.
                    {academicInterests.includes('Undecided') ? ' Note: Selecting "Undecided" will clear other selections.' : ''}
                  </Text>
                  <View style={styles.interestsGrid}>
                    {ACADEMIC_INTERESTS.map(interest => (
                      <TouchableOpacity
                        key={interest}
                        style={[
                          styles.interestButton,
                          academicInterests.includes(interest) &&
                            styles.interestButtonActive,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          
                          if (academicInterests.includes(interest)) {
                            // Remove if already selected
                            setAcademicInterests(prev => prev.filter(i => i !== interest));
                          } else {
                            // Handle Undecided selection logic
                            if (interest === 'Undecided') {
                              // If selecting Undecided, clear all other interests
                              setAcademicInterests(['Undecided']);
                            } else {
                              // If selecting any other interest, remove Undecided if present
                              const filteredInterests = academicInterests.filter(i => i !== 'Undecided');
                              if (filteredInterests.length < 3) {
                                setAcademicInterests([...filteredInterests, interest]);
                              }
                            }
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.interestButtonText,
                            academicInterests.includes(interest) &&
                              styles.interestButtonTextActive,
                          ]}
                        >
                          {interest}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {academicInterests.includes('Other') && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Specify Interest</Text>
                      <TextInput
                        style={styles.input}
                        value={customInterest}
                        onChangeText={setCustomInterest}
                        placeholder="Enter your academic interest"
                        placeholderTextColor={theme.colors.textTertiary}
                      />
                    </View>
                  )}
                </Animated.View>
              </View>

              {/* Section 4: Awards & Honors */}
              <View style={styles.accordionSection}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleSection('awards')}
                  activeOpacity={0.8}
                >
                  <View style={styles.accordionHeaderContent}>
                    <View style={styles.accordionIconContainer}>
                      <Ionicons
                        name="trophy"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={styles.accordionTitle}>Awards & Honors</Text>
                    <Text style={styles.accordionSubtitle}>Optional</Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.accordionChevron,
                      {
                        transform: [
                          {
                            rotate: sectionAnimations.awards.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.white}
                    />
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.accordionContent,
                    {
                      maxHeight: sectionAnimations.awards.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 120],
                      }),
                      opacity: sectionAnimations.awards,
                    },
                  ]}
                >
                  <View style={styles.inputGroup}>
                    <View style={styles.labelWithTooltip}>
                      <Text style={styles.label}>Academic Awards</Text>
                      <Text style={styles.tooltip}>
                        Honor roll, academic scholarships, etc.
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={academicAwards}
                      onChangeText={setAcademicAwards}
                      placeholder="Honor Roll, National Honor Society, Academic Scholarship..."
                      placeholderTextColor={theme.colors.textTertiary}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </Animated.View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[
                      theme.colors.primary,
                      theme.colors.primaryDark || theme.colors.primary,
                    ]}
                    style={styles.buttonGradient}
                  >
                    <Animated.View
                      style={[
                        { flexDirection: 'row', alignItems: 'center', gap: 8 },
                        { transform: [{ scale: bounceAnim }] },
                      ]}
                    >
                      <Text style={styles.continueButtonText}>Next</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                      />
                    </Animated.View>
                  </LinearGradient>
                </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  accordionSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.primary,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  accordionSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginLeft: 8,
  },
  accordionChevron: {
    marginLeft: 12,
  },
  accordionContent: {
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  labelWithTooltip: {
    marginBottom: 8,
  },
  tooltip: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    opacity: 0.7,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  gpaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gpaFeedback: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  booleanContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  booleanButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  booleanButtonText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  booleanButtonTextActive: {
    color: '#FFFFFF',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  interestButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  interestButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  interestButtonText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  interestButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  continueButton: {
    flex: 2,
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
  continueButtonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: '#FFFFFF',
  },
  interestsHelper: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
});
