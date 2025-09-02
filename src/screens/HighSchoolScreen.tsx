import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '../components/gamification';
import { XPRewardAnimation } from '../components/gamification/XPRewardAnimation';
import { useGamificationStore } from '../stores/gamificationStore';

interface HighSchoolScreenProps {
  navigation: any;
  route: { 
    params?: { 
      firstName?: string; 
      lastName?: string; 
      gender?: 'boys' | 'girls'; 
      position?: string; 
      graduationYear?: number;
    } 
  };
}

export default function HighSchoolScreen({ navigation, route }: HighSchoolScreenProps) {
  const { firstName, lastName, gender, position, graduationYear } = route.params || {};
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [level, setLevel] = useState<'Varsity' | 'JV' | 'Freshman' | ''>('');
  const [showXPReward, setShowXPReward] = useState(false);
  const [hasCompletedStep, setHasCompletedStep] = useState(false);
  const { totalXP, addXP } = useGamificationStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

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

  const handleLevelSelect = (selectedLevel: 'Varsity' | 'JV' | 'Freshman') => {
    setLevel(selectedLevel);
  };

  const handleContinue = () => {
    if (schoolName.trim() && city.trim() && state.trim() && level && !hasCompletedStep) {
      // Prevent duplicate XP rewards
      setHasCompletedStep(true);
      
      // Add XP for completing the step
      addXP(30, 'High school information completed');
      
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
    navigation.navigate('ClubTeam', { 
      firstName,
      lastName,
      gender,
      position,
      graduationYear,
      schoolName: schoolName.trim(),
      city: city.trim(),
      state: state.trim(),
      level
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isValid = schoolName.trim() && city.trim() && state.trim() && level;

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={3}
        totalSteps={8}
        stepTitle="High School"
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
          xpAmount={30}
          message="School spirit activated!"
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
                  Where do you play, {firstName}?
                </Text>
                <Text style={styles.subtitle}>
                  Tell us about your high school lacrosse program
                </Text>
              </View>

              {/* School Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>School Information *</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>School Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={schoolName}
                    onChangeText={setSchoolName}
                    placeholder="Enter your high school name"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.textInput}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>State</Text>
                    <TextInput
                      style={styles.textInput}
                      value={state}
                      onChangeText={setState}
                      placeholder="ST"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="characters"
                      maxLength={2}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              {/* Team Level Selection */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Team Level *</Text>
                <View style={styles.levelGrid}>
                  {(['Varsity', 'JV', 'Freshman'] as const).map((teamLevel) => (
                    <TouchableOpacity
                      key={teamLevel}
                      style={[
                        styles.levelCard,
                        level === teamLevel && styles.levelCardSelected
                      ]}
                      onPress={() => handleLevelSelect(teamLevel)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.levelText,
                        level === teamLevel && styles.levelTextSelected
                      ]}>
                        {teamLevel}
                      </Text>
                      {level === teamLevel && (
                        <View style={styles.levelCheckmark}>
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
                  🏫 Adding your school to your profile
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
  // Level Grid
  levelGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  levelCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    alignItems: 'center',
    position: 'relative',
  },
  levelCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  levelText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  levelTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  levelCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
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
