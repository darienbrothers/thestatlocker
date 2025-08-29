import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { OnboardingStepper } from '../components/gamification';
import { XPRewardAnimation } from '../components/gamification/XPRewardAnimation';
import { useGamificationStore } from '../stores/gamificationStore';

interface BasicInfoScreenProps {
  navigation: any;
  route: { params?: { firstName?: string; lastName?: string } };
}

const BOYS_POSITIONS = [
  'Attack', 'Midfield', 'Defense', 'Goalie', 'LSM', 'FOGO'
];

const GIRLS_POSITIONS = [
  'Attack', 'Midfield', 'Defense', 'Goalie'
];

const GRADUATION_YEARS = [
  { year: 2025, grade: 'Senior' },
  { year: 2026, grade: 'Junior' },
  { year: 2027, grade: 'Sophomore' },
  { year: 2028, grade: 'Freshman' },
  { year: 2029, grade: '8th Grade' },
];

export default function BasicInfoScreen({ navigation, route }: BasicInfoScreenProps) {
  const { firstName, lastName } = route.params || {};
  const [gender, setGender] = useState<'boys' | 'girls' | ''>('');
  const [position, setPosition] = useState<string>('');
  const [graduationYear, setGraduationYear] = useState<number | null>(null);
  const [showXPReward, setShowXPReward] = useState(false);
  const [hasCompletedStep, setHasCompletedStep] = useState(false);
  const { totalXP, addXP } = useGamificationStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const positionFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate position section when gender changes
    if (gender) {
      Animated.timing(positionFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      positionFadeAnim.setValue(0);
    }
  }, [gender]);

  const handleGenderSelect = (selectedGender: 'boys' | 'girls') => {
    setGender(selectedGender);
    setPosition(''); // Reset position when gender changes
  };

  const handlePositionSelect = (selectedPosition: string) => {
    setPosition(selectedPosition);
  };

  const handleYearSelect = (year: number) => {
    setGraduationYear(year);
  };

  const handleContinue = () => {
    if (gender && position && graduationYear && !hasCompletedStep) {
      // Prevent duplicate XP rewards
      setHasCompletedStep(true);
      
      // Add XP for completing the step
      addXP(35, 'Basic information completed');
      
      // Show XP reward animation
      setShowXPReward(true);
      
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
      ]).start();
    }
  };

  const handleXPAnimationComplete = () => {
    setShowXPReward(false);
    // Navigate after XP animation completes
    navigation.navigate('HighSchool', { 
      firstName,
      lastName,
      gender,
      position,
      graduationYear
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const currentPositions = gender === 'boys' ? BOYS_POSITIONS : gender === 'girls' ? GIRLS_POSITIONS : [];
  const isValid = gender && position && graduationYear;

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={2}
        totalSteps={8}
        stepTitle="Basic Information"
        showBackButton={true}
        onBackPress={handleBack}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* XP Reward Animation */}
        <XPRewardAnimation
          visible={showXPReward}
          xpAmount={35}
          message="Profile taking shape!"
          onComplete={handleXPAnimationComplete}
        />
        
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
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Text style={styles.title}>
                  Tell us about yourself, {firstName}!
                </Text>
                <Text style={styles.subtitle}>
                  This helps us personalize your lacrosse journey
                </Text>
              </View>

              {/* Gender Selection */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>I play *</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      gender === 'boys' && styles.optionCardSelected
                    ]}
                    onPress={() => handleGenderSelect('boys')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionEmoji}>🥍</Text>
                      <Text style={[
                        styles.optionText,
                        gender === 'boys' && styles.optionTextSelected
                      ]}>
                        Boys Lacrosse
                      </Text>
                      {gender === 'boys' && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      gender === 'girls' && styles.optionCardSelected
                    ]}
                    onPress={() => handleGenderSelect('girls')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionEmoji}>🥍</Text>
                      <Text style={[
                        styles.optionText,
                        gender === 'girls' && styles.optionTextSelected
                      ]}>
                        Girls Lacrosse
                      </Text>
                      {gender === 'girls' && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Position Selection - Shows after gender is selected */}
              {gender && (
                <Animated.View 
                  style={[
                    styles.sectionContainer,
                    { opacity: positionFadeAnim }
                  ]}
                >
                  <Text style={styles.sectionTitle}>Position *</Text>
                  <View style={styles.positionGrid}>
                    {currentPositions.map((pos) => (
                      <TouchableOpacity
                        key={pos}
                        style={[
                          styles.positionCard,
                          position === pos && styles.positionCardSelected
                        ]}
                        onPress={() => handlePositionSelect(pos)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.positionText,
                          position === pos && styles.positionTextSelected
                        ]}>
                          {pos}
                        </Text>
                        {position === pos && (
                          <View style={styles.positionCheckmark}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              )}

              {/* Graduation Year Selection */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Graduation Year *</Text>
                <View style={styles.yearGrid}>
                  {GRADUATION_YEARS.map(({ year, grade }) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearCard,
                        graduationYear === year && styles.yearCardSelected
                      ]}
                      onPress={() => handleYearSelect(year)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.yearText,
                        graduationYear === year && styles.yearTextSelected
                      ]}>
                        {year}
                      </Text>
                      <Text style={[
                        styles.gradeText,
                        graduationYear === year && styles.gradeTextSelected
                      ]}>
                        {grade}
                      </Text>
                      {graduationYear === year && (
                        <View style={styles.yearCheckmark}>
                          <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Continue Button */}
              <View style={styles.buttonSection}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <TouchableOpacity
                    style={[styles.continueButton, !isValid && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!isValid || hasCompletedStep}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isValid && !hasCompletedStep ? [theme.colors.primary, theme.colors.primary + 'DD'] : [theme.colors.neutral300, theme.colors.neutral300]}
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.buttonGradient}
                    >
                      <Text style={[styles.buttonText, (!isValid || hasCompletedStep) && styles.disabledButtonText]}>
                        Continue
                      </Text>
                      <Ionicons 
                        name="arrow-forward" 
                        size={20} 
                        color={isValid && !hasCompletedStep ? theme.colors.white : theme.colors.textTertiary} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                
                <Text style={styles.helperText}>
                  Building your personalized lacrosse profile
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
    minHeight: 600,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
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
  // Gender Options
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
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
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  checkmark: {
    position: 'absolute',
    right: 0,
  },
  // Position Grid
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
  },
  positionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  positionText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  positionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  positionCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  // Year Grid
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    minWidth: 85,
    alignItems: 'center',
    position: 'relative',
  },
  yearCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  yearText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
  },
  yearTextSelected: {
    color: theme.colors.primary,
  },
  gradeText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  gradeTextSelected: {
    color: theme.colors.primary,
  },
  yearCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  // Button Section
  buttonSection: {
    gap: 12,
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
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
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
  disabledButtonText: {
    color: theme.colors.textTertiary,
  },
  helperText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
