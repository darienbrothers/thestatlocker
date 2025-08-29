import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { OnboardingStepper } from '../components/gamification';
import { XPRewardAnimation } from '../components/gamification/XPRewardAnimation';
import { useGamificationStore } from '../stores/gamificationStore';

interface ClubTeamScreenProps {
  navigation: any;
  route: { 
    params?: { 
      firstName?: string; 
      lastName?: string; 
      gender?: 'boys' | 'girls'; 
      position?: string; 
      graduationYear?: number;
      schoolName?: string;
      city?: string;
      state?: string;
      level?: 'Varsity' | 'JV' | 'Freshman';
    } 
  };
}

export default function ClubTeamScreen({ navigation, route }: ClubTeamScreenProps) {
  const { firstName, lastName, gender, position, graduationYear, schoolName, city, state, level } = route.params || {};
  const [clubEnabled, setClubEnabled] = useState<boolean | null>(null);
  const [clubOrgName, setClubOrgName] = useState('');
  const [clubTeamName, setClubTeamName] = useState('');
  const [clubCity, setClubCity] = useState('');
  const [clubState, setClubState] = useState('');
  const [showXPReward, setShowXPReward] = useState(false);
  const [hasCompletedStep, setHasCompletedStep] = useState(false);
  const { totalXP, addXP } = useGamificationStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const clubFormFadeAnim = useRef(new Animated.Value(0)).current;

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
    // Animate club form when enabled
    if (clubEnabled === true) {
      Animated.timing(clubFormFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      clubFormFadeAnim.setValue(0);
    }
  }, [clubEnabled]);

  const handleClubSelection = (enabled: boolean) => {
    setClubEnabled(enabled);
    if (!enabled) {
      // Clear club fields if disabled
      setClubOrgName('');
      setClubTeamName('');
      setClubCity('');
      setClubState('');
    }
  };

  const handleContinue = () => {
    const isValid = clubEnabled !== null && (
      clubEnabled === false || 
      (clubOrgName.trim() && clubTeamName.trim() && clubCity.trim() && clubState.trim())
    );

    if (isValid && !hasCompletedStep) {
      // Prevent duplicate XP rewards
      setHasCompletedStep(true);
      
      // Add XP for completing the step
      const xpAmount = clubEnabled ? 40 : 25; // More XP if they filled out club info
      const message = clubEnabled ? 'Club lacrosse player!' : 'High school focus!';
      addXP(xpAmount, 'Club team information completed');
      
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
    navigation.navigate('Goals', { 
      firstName,
      lastName,
      gender,
      position,
      graduationYear,
      schoolName,
      city,
      state,
      level,
      clubEnabled,
      clubOrgName: clubEnabled ? clubOrgName.trim() : undefined,
      clubTeamName: clubEnabled ? clubTeamName.trim() : undefined,
      clubCity: clubEnabled ? clubCity.trim() : undefined,
      clubState: clubEnabled ? clubState.trim() : undefined,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isValid = clubEnabled !== null && (
    clubEnabled === false || 
    (clubOrgName.trim() && clubTeamName.trim() && clubCity.trim() && clubState.trim())
  );

  const xpAmount = clubEnabled ? 40 : 25;
  const xpMessage = clubEnabled ? 'Club lacrosse player!' : 'High school focus!';

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={4}
        totalSteps={8}
        stepTitle="Club Team"
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
          xpAmount={xpAmount}
          message={xpMessage}
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
                  Do you play club lacrosse, {firstName}?
                </Text>
                <Text style={styles.subtitle}>
                  Many players compete for both their school and a club team
                </Text>
              </View>

              {/* Club Team Selection */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Club Team Participation *</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      clubEnabled === true && styles.optionCardSelected
                    ]}
                    onPress={() => handleClubSelection(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionEmoji}>🏆</Text>
                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.optionText,
                          clubEnabled === true && styles.optionTextSelected
                        ]}>
                          Yes, I play club lacrosse
                        </Text>
                        <Text style={[
                          styles.optionSubtext,
                          clubEnabled === true && styles.optionSubtextSelected
                        ]}>
                          Travel team, tournaments, showcases
                        </Text>
                      </View>
                      {clubEnabled === true && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      clubEnabled === false && styles.optionCardSelected
                    ]}
                    onPress={() => handleClubSelection(false)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionEmoji}>🏫</Text>
                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.optionText,
                          clubEnabled === false && styles.optionTextSelected
                        ]}>
                          No, just high school
                        </Text>
                        <Text style={[
                          styles.optionSubtext,
                          clubEnabled === false && styles.optionSubtextSelected
                        ]}>
                          Focused on school team only
                        </Text>
                      </View>
                      {clubEnabled === false && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Club Information Form - Shows when club is enabled */}
              {clubEnabled === true && (
                <Animated.View 
                  style={[
                    styles.sectionContainer,
                    { opacity: clubFormFadeAnim }
                  ]}
                >
                  <Text style={styles.sectionTitle}>Club Information *</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Organization Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={clubOrgName}
                      onChangeText={setClubOrgName}
                      placeholder="e.g., Elite Lacrosse Club, Hawks LC"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Team Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={clubTeamName}
                      onChangeText={setClubTeamName}
                      placeholder="e.g., 2026 Blue, U18 Elite"
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
                        value={clubCity}
                        onChangeText={setClubCity}
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
                        value={clubState}
                        onChangeText={setClubState}
                        placeholder="ST"
                        placeholderTextColor={theme.colors.textTertiary}
                        autoCapitalize="characters"
                        maxLength={2}
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                </Animated.View>
              )}

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
                  🥍 {clubEnabled === true ? 'Adding club team to your profile' : clubEnabled === false ? 'Focusing on high school lacrosse' : 'Choose your lacrosse path'}
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
  // Options
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
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  optionSubtext: {
    fontSize: 13,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  optionSubtextSelected: {
    color: theme.colors.primary + 'AA',
  },
  checkmark: {
    position: 'absolute',
    right: 0,
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
