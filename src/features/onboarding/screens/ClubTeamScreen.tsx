import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { OnboardingStepper } from '@/components/gamification';

interface ClubTeamScreenProps {
  navigation: any;
  route: { 
    params?: { 
      firstName?: string; 
      lastName?: string; 
      profileImage?: string | null;
      sport?: string;
      gender?: 'boys' | 'girls'; 
      position?: string; 
      graduationYear?: number;
      height?: string;
      schoolName?: string;
      city?: string;
      state?: string;
      level?: 'Varsity' | 'JV' | 'Freshman';
    } 
  };
}

export default function ClubTeamScreen({ navigation, route }: ClubTeamScreenProps) {
  const { firstName, lastName, profileImage, sport, gender, position, graduationYear, height, schoolName, city, state, level } = route.params || {};
  const [clubEnabled, setClubEnabled] = useState<boolean | null>(null);
  const [clubOrgName, setClubOrgName] = useState('');
  const [clubTeamName, setClubTeamName] = useState('');
  const [clubCity, setClubCity] = useState('');
  const [clubState, setClubState] = useState('');
  const [clubJerseyNumber, setClubJerseyNumber] = useState('');
  
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

  const handleClubToggle = (enabled: boolean) => {
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
      // Navigate after animation completes
      navigation.navigate('Academic', { 
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
        clubEnabled,
        clubOrgName: clubEnabled ? clubOrgName : '',
        clubTeamName: clubEnabled ? clubTeamName : '',
        clubCity: clubEnabled ? clubCity : '',
        clubState: clubEnabled ? clubState : '',
        clubJerseyNumber: clubEnabled ? clubJerseyNumber.trim() : ''
      });
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={5}
        totalSteps={8}
        stepTitle="Club Colors"
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
                <Text style={styles.title}>Club Colors</Text>
                <Text style={styles.subtitle}>
                  Your locker isn't complete without your club team. Who do you rep outside of school?
                </Text>
              </View>

              {/* Club Participation Toggle */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Club Participation</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      clubEnabled === true && styles.selectedToggleOption
                    ]}
                    onPress={() => handleClubToggle(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.toggleContent}>
                      <Ionicons name="trophy" size={20} color={clubEnabled === true ? theme.colors.white : theme.colors.primary} />
                      <Text style={[
                        styles.toggleText,
                        clubEnabled === true && styles.selectedToggleText
                      ]}>
                        Yes, I play club ball
                      </Text>
                    </View>
                    <Text style={[
                      styles.toggleSubtext,
                      clubEnabled === true && styles.selectedToggleSubtext
                    ]}>
                      Tournaments, showcases, travel team
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      clubEnabled === false && styles.selectedToggleOption
                    ]}
                    onPress={() => handleClubToggle(false)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.toggleContent}>
                      <Ionicons name="school" size={20} color={clubEnabled === false ? theme.colors.white : theme.colors.textSecondary} />
                      <Text style={[
                        styles.toggleText,
                        clubEnabled === false && styles.selectedToggleText
                      ]}>
                        No, just high school for now
                      </Text>
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
                      placeholder="e.g., Hawks LC, 3d Lacrosse, Elite LC"
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

                  {/* Club Jersey Number */}
                  <View style={styles.inputContainer}>
                    <View style={styles.jerseyHeader}>
                      <Ionicons name="shirt-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.inputLabel}>Jersey Number (Optional)</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={clubJerseyNumber}
                      onChangeText={setClubJerseyNumber}
                      placeholder="What number do you rep for your club?"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="numeric"
                      maxLength={3}
                      returnKeyType="done"
                    />
                  </View>
                </Animated.View>
              )}

              {/* Continue Button */}
              <View style={styles.buttonSection}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <TouchableOpacity
                    style={[styles.continueButton]}
                    onPress={handleContinue}
                    disabled={false}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primary + 'DD']}
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>
                        {clubEnabled === true ? 'Add My Club Colors' : clubEnabled === false ? 'Lock In My School' : 'Continue'}
                      </Text>
                      <Ionicons 
                        name="arrow-forward" 
                        size={20} 
                        color={theme.colors.white} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                
                <Text style={styles.helperText}>
                  {clubEnabled === true ? '🎽 Repping your club colors in the locker' : clubEnabled === false ? '🏫 High school pride locked in' : '🥍 Choose your lacrosse path'}
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
  // Toggle Styles
  toggleContainer: {
    gap: 12,
  },
  toggleOption: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 4,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  selectedToggleText: {
    color: theme.colors.white,
  },
  toggleSubtext: {
    fontSize: 13,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
    lineHeight: 18,
  },
  selectedToggleSubtext: {
    color: theme.colors.white + 'CC',
  },
  // Jersey Header
  jerseyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});
