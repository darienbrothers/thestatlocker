import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Switch, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { OnboardingStepper } from '@/components/gamification';
import { useAuthStore } from '@/shared/stores/authStore';

interface ReviewScreenProps {
  navigation: any;
  route: { 
    params?: { 
      firstName?: string; 
      lastName?: string; 
      profileImage?: string | null | undefined;
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
    firstName, lastName, profileImage, gender, position, graduationYear, height, sport,
    schoolName, city, state, level, jerseyNumber,
    clubEnabled, clubOrgName, clubTeamName, clubCity, clubState, clubJerseyNumber,
    goals, gpa, hasHonorsAP, satScore, actScore, academicInterest, academicAwards
  } = route.params || {};

  const { createUserWithOnboardingData } = useAuthStore();
  const [commitment, setCommitment] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  // Commitment tracking for credibility
  const [commitmentDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

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
    
    // Animate checkmark stamp after a delay
    setTimeout(() => {
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

  const handleEnterLocker = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    if (!commitment) {
      alert('Please confirm your commitment to get started');
      return;
    }
    
    try {
      setIsCreatingUser(true);
      
      // Create complete onboarding data object
      const onboardingData = {
        firstName,
        lastName,
        profileImage,
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
        // Commitment tracking for credibility system
        hasCommitment: commitment,
        commitmentDate: commitmentDate.toISOString(),
        commitmentCreatedAt: new Date().toISOString(),
      };
      
      // Create user in Firebase with all onboarding data
      await createUserWithOnboardingData(onboardingData);
      
      // Navigate to paywall screen with onboarding data
      navigation.navigate('Paywall', { onboardingData });
    } catch (error: any) {
      alert(`Error creating account: ${error.message}`);
      setIsCreatingUser(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Goals', route.params);
    }
  };

  // Goals data for title lookup
  const SEASON_GOALS = {
    boys: {
      Attack: [
        { id: 'score_1_per_game', title: 'Score at least 1 goal per game' },
        { id: 'avg_2_assists', title: 'Average 2+ assists per game' },
        { id: 'shooting_60_percent', title: 'Maintain 60%+ shooting accuracy' },
        { id: 'ground_balls_3_plus', title: 'Record 3+ ground balls per game' },
        { id: 'limit_turnovers_2', title: 'Limit turnovers to under 2 per game' },
        { id: 'dodge_success_70', title: 'Maintain 70%+ dodge success rate' },
        { id: 'man_up_goals_3', title: 'Score 3+ man-up goals this season' },
      ],
      Midfield: [
        { id: 'contribute_2_points', title: 'Contribute 2+ points per game' },
        { id: 'ground_balls_50_percent', title: 'Win 50%+ ground balls attempted' },
        { id: 'clear_80_percent', title: 'Clear ball successfully 80%+ of the time' },
        { id: 'score_assist_every_game', title: 'Score or assist in every game' },
        { id: 'cause_1_turnover', title: 'Record 1 caused turnover per game' },
        { id: 'transition_goals_5', title: 'Score 5+ transition goals this season' },
        { id: 'faceoff_wins_40', title: 'Win 40%+ of face-offs taken' },
      ],
      Defense: [
        { id: 'hold_matchup_2_goals', title: 'Hold matchup to under 2 goals per game' },
        { id: 'ground_balls_70_percent', title: 'Win 70%+ ground balls attempted' },
        { id: 'cause_1_turnover_def', title: 'Cause at least 1 turnover per game' },
        { id: 'clear_80_percent_def', title: 'Clear successfully on 80%+ attempts' },
        { id: 'limit_penalties_2', title: 'Commit under 2 penalties per game' },
        { id: 'slides_help_80', title: 'Make successful slides 80%+ of the time' },
        { id: 'takeaways_2_per_game', title: 'Record 2+ takeaways per game' },
      ],
      Goalie: [
        { id: 'save_55_percent', title: 'Maintain at least 55% save percentage' },
        { id: 'goals_under_8', title: 'Keep opponents under 8 goals per game' },
        { id: 'saves_10_plus_5_games', title: 'Record 10+ saves in at least 5 games' },
        { id: 'shutout_games_2', title: 'Record 2+ shutout games this season' },
        { id: 'ground_balls_2_plus_goalie', title: 'Record 2+ ground balls per game' },
        { id: 'limit_goals_allowed_streaks', title: 'Limit opponent scoring streaks to 2 goals' },
        { id: 'save_streaks_5_plus', title: 'Record 5+ consecutive saves at least 3 times' },
      ],
      FOGO: [
        { id: 'faceoff_60_percent', title: 'Win 60%+ of face-offs' },
        { id: 'ground_balls_3_plus_fogo', title: 'Average 3+ ground balls per game' },
        { id: 'limit_faceoff_turnovers', title: 'Limit turnovers to under 1 per game' },
        { id: 'faceoff_streaks_3', title: 'Keep face-off win streaks of 3+ in a row' },
        { id: 'wing_play_success_70', title: 'Win 70%+ of wing battles' },
        { id: 'fast_break_goals_8', title: 'Score 8+ fast break goals this season' },
      ],
    },
    girls: {
      Attack: [
        { id: 'score_1_per_game_girls', title: 'Score at least 1 goal per game' },
        { id: 'avg_2_assists_girls', title: 'Average 2+ assists per game' },
        { id: 'shooting_55_percent_girls', title: 'Maintain 55%+ shooting accuracy' },
        { id: 'draw_ground_balls_3_girls', title: 'Record 3+ draw controls or ground balls per game' },
        { id: 'limit_turnovers_2_girls', title: 'Limit turnovers to under 2 per game' },
      ],
      Midfield: [
        { id: 'draw_controls_3_girls', title: 'Record 3+ draw controls per game' },
        { id: 'contribute_2_points_girls', title: 'Contribute 2+ points per game' },
        { id: 'ground_balls_50_percent_girls', title: 'Win 50%+ ground balls attempted' },
        { id: 'transition_80_percent_girls', title: 'Transition successfully on 80%+ clears' },
        { id: 'cause_1_turnover_girls', title: 'Record 1 caused turnover per game' },
      ],
      Defense: [
        { id: 'hold_matchup_2_goals_girls', title: 'Hold matchup to under 2 goals per game' },
        { id: 'ground_balls_2_plus_girls', title: 'Record 2+ ground balls per game' },
        { id: 'cause_1_turnover_def_girls', title: 'Cause at least 1 turnover per game' },
        { id: 'transition_80_percent_def_girls', title: 'Transition successfully on 80%+ clears' },
        { id: 'limit_penalties_2_girls', title: 'Commit under 2 penalties per game' },
      ],
      Goalie: [
        { id: 'save_50_percent_girls', title: 'Maintain at least 50% save percentage' },
        { id: 'goals_under_10_girls', title: 'Keep opponents under 10 goals per game' },
        { id: 'saves_8_plus_5_games_girls', title: 'Record 8+ saves in at least 5 games' },
        { id: 'transition_75_percent_girls', title: 'Transition ball successfully on 75%+ clears' },
        { id: 'communicate_90_percent_girls', title: 'Communicate on 90% of defensive possessions' },
      ],
    },
  };

  // Helper function to get goal title from goal ID
  const getGoalTitle = (goalId: string): string => {
    // Search through all positions and genders to find the goal
    for (const genderKey of Object.keys(SEASON_GOALS) as Array<keyof typeof SEASON_GOALS>) {
      for (const positionKey of Object.keys(SEASON_GOALS[genderKey]) as Array<keyof typeof SEASON_GOALS[typeof genderKey]>) {
        const positionGoals = SEASON_GOALS[genderKey][positionKey] as Array<{id: string, title: string}>;
        const goal = positionGoals.find(g => g.id === goalId);
        if (goal) {
          return goal.title;
        }
      }
    }
    return goalId; // Fallback to ID if not found
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper */}
      <OnboardingStepper 
        currentStep={8}
        totalSteps={8}
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
          {/* Animated Checkmark Stamp */}
          <Animated.View 
            style={[
              styles.checkmarkContainer,
              {
                transform: [
                  { scale: checkmarkAnim },
                  { rotate: checkmarkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })}
                ]
              }
            ]}
          >
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={28} color={theme.colors.white} />
            </View>
          </Animated.View>
          
          <Text style={styles.title}>Your Locker is Ready</Text>
          <Text style={styles.subtitle}>
            Review and confirm your profile details below
          </Text>
        </View>

        {/* Player Card Hero */}
        <View style={styles.playerCard}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.playerCardGradient}
          >
            {/* Player Avatar */}
            <View style={styles.playerAvatar}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {firstName?.charAt(0)}{lastName?.charAt(0)}
                </Text>
              )}
            </View>
            
            {/* Player Info */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{firstName} {lastName}</Text>
              <Text style={styles.playerPosition}>{position}</Text>
              <View style={styles.playerDetails}>
                <Text style={styles.playerDetailText}>{sport ? sport.charAt(0).toUpperCase() + sport.slice(1) : 'Lacrosse'} • Class of {graduationYear}</Text>
                <Text style={styles.playerSchool}>{schoolName}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* High School Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="school" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>High School</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('HighSchool', { ...route.params, returnTo: 'Review' })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardMainText}>{schoolName}</Text>
            <Text style={styles.cardSubText}>{city}, {state} • {level}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>#{jerseyNumber || 'TBD'}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Class of {graduationYear}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Club Team Card */}
        {clubEnabled && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="trophy" size={24} color={theme.colors.warning} />
              </View>
              <Text style={styles.cardTitle}>Club Team</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('ClubTeam', { ...route.params, returnTo: 'Review' })}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardMainText}>{clubOrgName} - {clubTeamName}</Text>
              <Text style={styles.cardSubText}>
                {clubCity}, {clubState}{clubJerseyNumber ? ` • #${clubJerseyNumber}` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Season Goals Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="flag" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.cardTitle}>Season Goals</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('Goals', { ...route.params, returnTo: 'Review' })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            {goals && goals.length > 0 ? (
              <View style={styles.goalsContainer}>
                {goals.map((goalId: string, index: number) => (
                  <View key={index} style={styles.goalBullet}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.goalBulletText}>{getGoalTitle(goalId)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.goalsContainer}>
                <View style={styles.goalBullet}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.goalBulletText}>Score at least 1 goal per game</Text>
                </View>
                <View style={styles.goalBullet}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.goalBulletText}>Average 2 assists per game</Text>
                </View>
                <View style={styles.goalBullet}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.goalBulletText}>Maintain 70% ground ball success</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Academic Card */}
        {(gpa || satScore || actScore || academicInterest) && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="book" size={24} color={theme.colors.info} />
              </View>
              <Text style={styles.cardTitle}>Academic</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('Academic', { ...route.params, returnTo: 'Review' })}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              {gpa && <Text style={styles.cardMainText}>GPA: {gpa}</Text>}
              {(satScore || actScore) && (
                <Text style={styles.cardSubText}>
                  {satScore ? `SAT: ${satScore}` : ''}{satScore && actScore ? ' • ' : ''}{actScore ? `ACT: ${actScore}` : ''}
                </Text>
              )}
              {academicInterest && <Text style={styles.cardSubText}>Interest: {academicInterest}</Text>}
            </View>
          </View>
        )}

        {/* Final Steps Card */}
        <View style={styles.finalStepsCard}>
          <View style={styles.cardHeaderCentered}>
            <Text style={styles.cardTitleFullCentered}>Create Your Account</Text>
          </View>
          
          <View style={styles.accountDescription}>
            <Text style={styles.accountDescriptionText}>
              You're almost there! Create your account to save your personalized locker and start tracking your {sport || 'lacrosse'} journey.
            </Text>
          </View>
          
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a secure password"
                placeholderTextColor={theme.colors.neutral400}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Commitment Section */}
          <View style={styles.commitmentSection}>
            <View style={styles.commitmentToggle}>
              <View style={styles.commitmentText}>
                <Text style={styles.commitmentLabel}>
                  I'll log my first game by {formattedDate}
                </Text>
                <Text style={styles.commitmentSubtext}>
                  Build your tracking habit early
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
        </View>

        {/* Enter Button */}
        <TouchableOpacity 
          style={[
            styles.enterButton, 
            (!commitment || !email || !password || isCreatingUser) && styles.enterButtonDisabled
          ]}
          onPress={handleEnterLocker}
          disabled={!commitment || !email || !password || isCreatingUser}
        >
          <Text style={styles.enterButtonText}>Enter the Locker</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
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
    alignItems: 'center',
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Player Card Hero
  playerCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  playerCardGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.white,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.white,
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  playerDetails: {
    gap: 2,
  },
  playerDetailText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  playerSchool: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Info Cards
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  cardHeaderCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  cardTitleCentered: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  cardTitleFullCentered: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '10',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardMainText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSubText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  goalsContainer: {
    gap: 12,
  },
  goalBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginTop: 6,
  },
  goalBulletText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  // Final Steps Card
  finalStepsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  accountDescription: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  accountDescriptionText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  commitmentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral100,
    marginTop: 8,
    paddingTop: 20,
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
    paddingHorizontal: 20,
    paddingTop: 8,
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
  inputLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderColor: theme.colors.neutral200,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enterButtonDisabled: {
    backgroundColor: theme.colors.neutral300,
    shadowOpacity: 0.1,
  },
  enterButtonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.white,
  },
  // Badge styles
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.primary,
  },
  editProfileButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  editProfileText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: 40,
  },
});
