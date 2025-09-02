import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Animated, Switch, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '../components/gamification';
import { XPRewardAnimation } from '../components/gamification/XPRewardAnimation';
import { useGamificationStore } from '../stores/gamificationStore';
import { useAuthStore } from '../stores/authStore';

interface ReviewScreenProps {
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
      clubEnabled?: boolean;
      clubOrgName?: string;
      clubTeamName?: string;
      clubCity?: string;
      clubState?: string;
      goals?: any;
      strengths?: string[];
      growthAreas?: string[];
    } 
  };
}

export default function ReviewScreen({ navigation, route }: ReviewScreenProps) {
  const { 
    firstName, lastName, gender, position, graduationYear, schoolName, city, state, level,
    clubEnabled, clubOrgName, clubTeamName, clubCity, clubState,
    goals, strengths, growthAreas
  } = route.params || {};

  const { addXP } = useGamificationStore();
  const { createUserWithOnboardingData } = useAuthStore();
  const [commitment, setCommitment] = useState(true);
  const [showXPReward, setShowXPReward] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Calculate commitment date (7 days from now)
  const commitmentDate = new Date();
  commitmentDate.setDate(commitmentDate.getDate() + 7);
  const formattedDate = commitmentDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  useEffect(() => {
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

  const handleEnterLocker = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    try {
      setIsCreatingUser(true);
      
      // Create complete onboarding data object
      const onboardingData = {
        firstName,
        lastName,
        email,
        password,
        gender,
        position,
        graduationYear,
        schoolName,
        city,
        state,
        level,
        clubEnabled,
        clubOrgName,
        clubTeamName,
        clubCity,
        clubState,
        goals,
        strengths,
        growthAreas,
        sport: 'lacrosse',
      };
      
      // Create user in Firebase with all onboarding data
      await createUserWithOnboardingData(onboardingData);
      
      // Award completion XP
      addXP(100, "Onboarding Complete! Welcome to your locker!");
      setShowXPReward(true);
      
      setTimeout(() => {
        setShowXPReward(false);
        navigation.navigate('MainTabs');
      }, 2000);
    } catch (error: any) {
      alert(`Error creating account: ${error.message}`);
      setIsCreatingUser(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper */}
      <OnboardingStepper 
        currentStep={7}
        totalSteps={7}
        stepTitle="Review & Commit"
        onBackPress={handleBack}
        showBackButton={true}
      />

      <Animated.ScrollView 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Review your profile and make your commitment to start tracking
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={[theme.colors.white, theme.colors.primary + '05']}
            style={styles.summaryGradient}
          >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {firstName?.charAt(0)}{lastName?.charAt(0)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{firstName} {lastName}</Text>
                <Text style={styles.profileDetails}>
                  {position} • Class of {graduationYear}
                </Text>
              </View>
            </View>

            {/* Summary Sections */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>High School</Text>
              <Text style={styles.sectionValue}>
                {schoolName} ({level}) • {city}, {state}
              </Text>
            </View>

            {clubEnabled && (
              <View style={styles.summarySection}>
                <Text style={styles.sectionLabel}>Club Team</Text>
                <Text style={styles.sectionValue}>
                  {clubOrgName} - {clubTeamName} • {clubCity}, {clubState}
                </Text>
              </View>
            )}

            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Goals Set</Text>
              <Text style={styles.sectionValue}>
                {goals ? Object.keys(goals).length : 0} performance targets
              </Text>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Strengths</Text>
              <View style={styles.tagContainer}>
                {strengths?.slice(0, 3).map((strength, index) => (
                  <View key={index} style={styles.strengthTag}>
                    <Text style={styles.tagText}>{strength}</Text>
                  </View>
                ))}
                {strengths && strengths.length > 3 && (
                  <Text style={styles.moreText}>+{strengths.length - 3} more</Text>
                )}
              </View>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Growth Areas</Text>
              <View style={styles.tagContainer}>
                {growthAreas?.slice(0, 2).map((area, index) => (
                  <View key={index} style={styles.growthTag}>
                    <Text style={styles.tagText}>{area}</Text>
                  </View>
                ))}
                {growthAreas && growthAreas.length > 2 && (
                  <Text style={styles.moreText}>+{growthAreas.length - 2} more</Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Email and Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {/* Commitment Section */}
        <View style={styles.commitmentCard}>
          <View style={styles.commitmentHeader}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.commitmentTitle}>Your Commitment</Text>
          </View>
          
          <View style={styles.commitmentToggle}>
            <View style={styles.commitmentText}>
              <Text style={styles.commitmentLabel}>
                I'll log my first game (or practice) by {formattedDate}
              </Text>
              <Text style={styles.commitmentSubtext}>
                This helps build your tracking habit early
              </Text>
            </View>
            <Switch
              value={commitment}
              onValueChange={setCommitment}
              trackColor={{ false: theme.colors.neutral200, true: theme.colors.primary + '30' }}
              thumbColor={commitment ? theme.colors.primary : theme.colors.neutral400}
            />
          </View>
        </View>

        {/* Enter Locker Button */}
        <TouchableOpacity 
          style={[styles.enterButton, !commitment && styles.enterButtonDisabled]}
          onPress={handleEnterLocker}
          disabled={!commitment || isCreatingUser}
        >
          <LinearGradient
            colors={commitment ? [theme.colors.primary, theme.colors.primaryDark] : [theme.colors.neutral300, theme.colors.neutral400]}
            style={styles.enterButtonGradient}
          >
            <Ionicons name="lock-open" size={20} color={theme.colors.white} />
            <Text style={styles.enterButtonText}>Enter Your Locker</Text>
            <Text style={styles.enterButtonSubtext}>+100 XP</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* XP Reward Animation */}
      {showXPReward && (
        <XPRewardAnimation
          visible={showXPReward}
          xpAmount={100}
          message="Onboarding Complete! Welcome to your locker!"
          onComplete={() => setShowXPReward(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral100,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  summarySection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  strengthTag: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  growthTag: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.warning + '30',
  },
  tagText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  moreText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  commitmentCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  commitmentTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  commitmentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commitmentText: {
    flex: 1,
    marginRight: 16,
  },
  commitmentLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  commitmentSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderColor: theme.colors.neutral200,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  enterButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  enterButtonDisabled: {
    opacity: 0.6,
  },
  enterButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  enterButtonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
  enterButtonSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 40,
  },
});
