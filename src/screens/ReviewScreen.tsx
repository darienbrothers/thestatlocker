import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Switch, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '../components/gamification';
import { useAuthStore } from '../shared/stores/authStore';

interface ReviewScreenProps {
  navigation: any;
  route: { 
    params?: { 
      firstName?: string; 
      lastName?: string; 
      gender?: 'boys' | 'girls'; 
      position?: string; 
      graduationYear?: number;
      height?: string;
      sport?: string;
      schoolName?: string;
      city?: string;
      state?: string;
      level?: 'Varsity' | 'JV' | 'Freshman';
      jerseyNumber?: string;
      clubEnabled?: boolean;
      clubOrgName?: string;
      clubTeamName?: string;
      clubCity?: string;
      clubState?: string;
      clubJerseyNumber?: string;
      goals?: string[];
      gpa?: string;
      hasHonorsAP?: boolean | null;
      satScore?: string;
      actScore?: string;
      academicInterest?: string;
      academicAwards?: string;
    } 
  };
}

export default function ReviewScreen({ navigation, route }: ReviewScreenProps) {
  const { 
    firstName, lastName, gender, position, graduationYear, height, sport,
    schoolName, city, state, level, jerseyNumber,
    clubEnabled, clubOrgName, clubTeamName, clubCity, clubState, clubJerseyNumber,
    goals, gpa, hasHonorsAP, satScore, actScore, academicInterest, academicAwards
  } = route.params || {};

  const { createUserWithOnboardingData } = useAuthStore();
  const [commitment, setCommitment] = useState(true);
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
        height,
        sport: sport || 'lacrosse',
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
        goals,
        gpa,
        hasHonorsAP,
        satScore,
        actScore,
        academicInterest,
        academicAwards,
      };
      
      // Create user in Firebase with all onboarding data
      await createUserWithOnboardingData(onboardingData);
      
      // Navigate to paywall screen before dashboard
      navigation.navigate('Paywall');
    } catch (error: any) {
      alert(`Error creating account: ${error.message}`);
      setIsCreatingUser(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Helper function to get goal title from goal ID
  const getGoalTitle = (goalId: string): string => {
    const goalTitles: { [key: string]: string } = {
      'score_1_per_game': 'Score at least 1 goal per game',
      'avg_2_assists': 'Average 2+ assists per game',
      'shooting_60_percent': 'Maintain 60%+ shooting accuracy',
      'ground_balls_3_plus': 'Record 3+ ground balls per game',
      'limit_turnovers_2': 'Limit turnovers to under 2 per game',
      'contribute_2_points': 'Contribute 2+ points per game',
      'ground_balls_50_percent': 'Win 50%+ ground balls attempted',
      'clear_80_percent': 'Clear ball successfully 80%+ of the time',
      'score_assist_every_game': 'Score or assist in every game',
      'cause_1_turnover': 'Record 1 caused turnover per game',
      'hold_matchup_2_goals': 'Hold matchup to under 2 goals per game',
      'ground_balls_70_percent': 'Win 70%+ ground balls attempted',
      'cause_1_turnover_def': 'Cause at least 1 turnover per game',
      'clear_80_percent_def': 'Clear successfully on 80%+ attempts',
      'limit_penalties_2': 'Commit under 2 penalties per game',
      'save_55_percent': 'Maintain at least 55% save percentage',
      'goals_under_8': 'Keep opponents under 8 goals per game',
      'clear_80_percent_goalie': 'Clear ball successfully 80%+ of the time',
      'saves_10_plus_5_games': 'Record 10+ saves in at least 5 games',
      'communicate_90_percent': 'Communicate on 90% of defensive possessions',
      'faceoff_60_percent': 'Win 60%+ of face-offs',
      'ground_balls_3_plus_fogo': 'Average 3+ ground balls per game',
      'limit_faceoff_turnovers': 'Limit turnovers to under 1 per game',
      'faceoff_streaks_3': 'Keep face-off win streaks of 3+ in a row',
      // Girls lacrosse goals
      'score_1_per_game_girls': 'Score at least 1 goal per game',
      'avg_2_assists_girls': 'Average 2+ assists per game',
      'shooting_55_percent_girls': 'Maintain 55%+ shooting accuracy',
      'draw_ground_balls_3_girls': 'Record 3+ draw controls or ground balls per game',
      'limit_turnovers_2_girls': 'Limit turnovers to under 2 per game',
      'draw_controls_3_girls': 'Record 3+ draw controls per game',
      'contribute_2_points_girls': 'Contribute 2+ points per game',
      'ground_balls_50_percent_girls': 'Win 50%+ ground balls attempted',
      'transition_80_percent_girls': 'Transition successfully on 80%+ clears',
      'cause_1_turnover_girls': 'Record 1 caused turnover per game',
      'hold_matchup_2_goals_girls': 'Hold matchup to under 2 goals per game',
      'ground_balls_2_plus_girls': 'Record 2+ ground balls per game',
      'cause_1_turnover_def_girls': 'Cause at least 1 turnover per game',
      'transition_80_percent_def_girls': 'Transition successfully on 80%+ clears',
      'limit_penalties_2_girls': 'Commit under 2 penalties per game',
      'save_50_percent_girls': 'Maintain at least 50% save percentage',
      'goals_under_10_girls': 'Keep opponents under 10 goals per game',
      'saves_8_plus_5_games_girls': 'Record 8+ saves in at least 5 games',
      'transition_75_percent_girls': 'Transition ball successfully on 75%+ clears',
      'communicate_90_percent_girls': 'Communicate on 90% of defensive possessions',
    };
    return goalTitles[goalId] || goalId;
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
          <View style={styles.titleContainer}>
            <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
            <Text style={styles.title}>Locker Check</Text>
          </View>
          <Text style={styles.subtitle}>
            Here's your setup. Ready to step into your locker?
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

            {/* High School Section */}
            <View style={styles.summarySection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="school" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionLabel}>High School</Text>
                <TouchableOpacity onPress={() => navigation.navigate('HighSchool', route.params)}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionValue}>
                {schoolName} • {city}, {state}
              </Text>
              <Text style={styles.sectionSubValue}>
                {level}{jerseyNumber ? ` • #${jerseyNumber}` : ''}
              </Text>
            </View>

            {/* Club Team Section */}
            {clubEnabled && (
              <View style={styles.summarySection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trophy" size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionLabel}>Club Team</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ClubTeam', route.params)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.sectionValue}>
                  {clubOrgName} - {clubTeamName}
                </Text>
                <Text style={styles.sectionSubValue}>
                  {clubCity}, {clubState}{clubJerseyNumber ? ` • #${clubJerseyNumber}` : ''}
                </Text>
              </View>
            )}

            {/* Season Goals Section */}
            <View style={styles.summarySection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="golf" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionLabel}>Season Goals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Goals', route.params)}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              </View>
              {goals && goals.length > 0 ? (
                <View style={styles.goalsContainer}>
                  {goals.map((goalId: string, index: number) => (
                    <View key={index} style={styles.goalItem}>
                      <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                      <Text style={styles.goalText}>{getGoalTitle(goalId)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.sectionValue}>No goals selected</Text>
              )}
            </View>

            {/* Academic Section (Optional) */}
            {(gpa || satScore || actScore || academicInterest) && (
              <View style={styles.summarySection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="school" size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionLabel}>Academic</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Academic', route.params)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.academicInfo}>
                  {gpa && <Text style={styles.sectionValue}>GPA: {gpa}</Text>}
                  {(satScore || actScore) && (
                    <Text style={styles.sectionValue}>
                      {satScore ? `SAT: ${satScore}` : ''}{satScore && actScore ? ' • ' : ''}{actScore ? `ACT: ${actScore}` : ''}
                    </Text>
                  )}
                  {academicInterest && <Text style={styles.sectionValue}>Interest: {academicInterest}</Text>}
                </View>
              </View>
            )}
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
            <Text style={styles.enterButtonText}>Enter My Locker 🚀</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
    marginLeft: 12,
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
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  editLink: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
  },
  sectionValue: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  sectionSubValue: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  goalsContainer: {
    gap: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  academicInfo: {
    gap: 4,
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
  bottomSpacer: {
    height: 40,
  },
});
