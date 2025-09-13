import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboardAwareScrolling } from '@/utils/keyboardUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '@/components/gamification';
import { useAuthStore } from '@/shared/stores/authStore';
import { clearOnboardingData } from '@/utils/onboardingStorage';

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
      goals?: any[]; // Can be string[] or UserGoal[]
      gpa?: string;
      hasHonorsAP?: boolean | null;
      satScore?: string;
      actScore?: string;
      academicInterest?: string;
      academicInterests?: string[];
      academicAwards?: string;
    };
  };
}

export default function ReviewScreen({ navigation, route }: ReviewScreenProps) {
  // Enhanced keyboard-aware scrolling
  const { scrollViewRef, handleInputFocus, handleInputBlur } =
    useKeyboardAwareScrolling();

  // State to track current data (will be updated when returning from edit screens)
  const [currentData, setCurrentData] = useState(route.params || {});

  // Extract current data from state
  const {
    firstName,
    lastName,
    profileImage,
    gender,
    position,
    graduationYear,
    height,
    sport,
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
    academicInterests,
    academicAwards,
  } = currentData;

  // Update data when screen comes into focus (after returning from edit screens)
  useFocusEffect(
    React.useCallback(() => {
      if (route.params) {
        setCurrentData({ ...route.params });
      }
    }, [])
  );

  const { createUserWithOnboardingData, completeOnboarding } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
    },
  });

  // Input refs for keyboard handling
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

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

  // Password strength validation - memoized to prevent infinite updates
  const validatePasswordStrength = React.useCallback((password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(prev => {
      // Only update if values actually changed
      if (prev.score !== score || 
          prev.checks.length !== checks.length ||
          prev.checks.uppercase !== checks.uppercase ||
          prev.checks.lowercase !== checks.lowercase ||
          prev.checks.number !== checks.number) {
        return { score, checks };
      }
      return prev;
    });
  }, []);


  // Get goal title from SEASON_GOALS data - NEVER show raw IDs
  const getGoalTitle = (goalId: string): string => {
    if (!goalId || typeof goalId !== 'string') return 'Goal';
    
    // Search through all season goals to find the proper title
    const allGoals = [
      ...Object.values(SEASON_GOALS.boys).flat(),
      ...Object.values(SEASON_GOALS.girls).flat()
    ];
    
    const foundGoal = allGoals.find(goal => goal.id === goalId);
    if (foundGoal) {
      return foundGoal.title;
    }
    
    // Fallback: convert ID to readable format without adding + to numbers
    return goalId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Girls?$/i, '') // Remove trailing "Girls" 
      .replace(/Boys?$/i, '')  // Remove trailing "Boys"
      .trim();
  };

  const handleEnterLocker = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    if (passwordStrength.score < 3) {
      alert('Please create a stronger password with at least 8 characters, including uppercase, lowercase, and a number.');
      return;
    }

    try {
      setIsCreatingUser(true);
      console.log('Starting account creation process...');

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
        academicInterests,
        academicAwards,
      };

      console.log('Creating user with onboarding data...');
      // Create user in Firebase with all onboarding data
      await createUserWithOnboardingData(onboardingData);
      console.log('User created successfully, clearing onboarding data...');

      // Clear onboarding form data from AsyncStorage
      await clearOnboardingData();
      console.log('Onboarding data cleared, completing onboarding and navigating to MainTabs...');

      // TEMPORARY: Skip paywall and go directly to MainTabs
      // Complete onboarding first
      await completeOnboarding();
      
      // Navigate directly to MainTabs
      navigation.navigate('MainTabs', { onboardingData });
      console.log('Navigation to MainTabs initiated');
    } catch (error: any) {
      console.error('Error in handleEnterLocker:', error);
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

  // Goals data for title lookup - using local data to avoid unused import
  const SEASON_GOALS = {
    boys: {
      Attack: [
        { id: 'score_1_per_game', title: 'Score at least 1 goal per game' },
        { id: 'avg_2_assists', title: 'Average 2+ assists per game' },
        { id: 'shooting_60_percent', title: 'Maintain 60%+ shooting accuracy' },
        { id: 'ground_balls_3_plus', title: 'Record 3+ ground balls per game' },
        {
          id: 'limit_turnovers_2',
          title: 'Limit turnovers to under 2 per game',
        },
        { id: 'dodge_success_70', title: 'Maintain 70%+ dodge success rate' },
        { id: 'man_up_goals_3', title: 'Score 3+ man-up goals this season' },
      ],
      Midfield: [
        { id: 'contribute_2_points', title: 'Contribute 2+ points per game' },
        {
          id: 'ground_balls_50_percent',
          title: 'Win 50%+ ground balls attempted',
        },
        {
          id: 'clear_80_percent',
          title: 'Clear ball successfully 80%+ of the time',
        },
        {
          id: 'score_assist_every_game',
          title: 'Score or assist in every game',
        },
        { id: 'cause_1_turnover', title: 'Record 1 caused turnover per game' },
        {
          id: 'transition_goals_5',
          title: 'Score 5+ transition goals this season',
        },
        { id: 'faceoff_wins_40', title: 'Win 40%+ of face-offs taken' },
      ],
      Defense: [
        {
          id: 'hold_matchup_2_goals',
          title: 'Hold matchup to under 2 goals per game',
        },
        {
          id: 'ground_balls_70_percent',
          title: 'Win 70%+ ground balls attempted',
        },
        {
          id: 'cause_1_turnover_def',
          title: 'Cause at least 1 turnover per game',
        },
        {
          id: 'clear_80_percent_def',
          title: 'Clear successfully on 80%+ attempts',
        },
        { id: 'limit_penalties_2', title: 'Commit under 2 penalties per game' },
        {
          id: 'slides_help_80',
          title: 'Make successful slides 80%+ of the time',
        },
        { id: 'takeaways_2_per_game', title: 'Record 2+ takeaways per game' },
      ],
      Goalie: [
        {
          id: 'save_55_percent',
          title: 'Maintain at least 55% save percentage',
        },
        { id: 'goals_under_8', title: 'Keep opponents under 8 goals per game' },
        {
          id: 'saves_10_plus_5_games',
          title: 'Record 10+ saves in at least 5 games',
        },
        { id: 'shutout_games_2', title: 'Record 2+ shutout games this season' },
        {
          id: 'ground_balls_2_plus_goalie',
          title: 'Record 2+ ground balls per game',
        },
        {
          id: 'limit_goals_allowed_streaks',
          title: 'Limit opponent scoring streaks to 2 goals',
        },
        {
          id: 'save_streaks_5_plus',
          title: 'Record 5+ consecutive saves at least 3 times',
        },
      ],
      FOGO: [
        { id: 'faceoff_60_percent', title: 'Win 60%+ of face-offs' },
        {
          id: 'ground_balls_3_plus_fogo',
          title: 'Average 3+ ground balls per game',
        },
        {
          id: 'limit_faceoff_turnovers',
          title: 'Limit turnovers to under 1 per game',
        },
        {
          id: 'faceoff_streaks_3',
          title: 'Keep face-off win streaks of 3+ in a row',
        },
        { id: 'wing_play_success_70', title: 'Win 70%+ of wing battles' },
        {
          id: 'fast_break_goals_8',
          title: 'Score 8+ fast break goals this season',
        },
      ],
    },
    girls: {
      Attack: [
        {
          id: 'score_1_per_game_girls',
          title: 'Score at least 1 goal per game',
        },
        { id: 'avg_2_assists_girls', title: 'Average 2+ assists per game' },
        {
          id: 'shooting_55_percent_girls',
          title: 'Maintain 55%+ shooting accuracy',
        },
        {
          id: 'draw_ground_balls_3_girls',
          title: 'Record 3+ draw controls or ground balls per game',
        },
        {
          id: 'limit_turnovers_2_girls',
          title: 'Limit turnovers to under 2 per game',
        },
      ],
      Midfield: [
        {
          id: 'draw_controls_3_girls',
          title: 'Record 3+ draw controls per game',
        },
        {
          id: 'contribute_2_points_girls',
          title: 'Contribute 2+ points per game',
        },
        {
          id: 'ground_balls_50_percent_girls',
          title: 'Win 50%+ ground balls attempted',
        },
        {
          id: 'transition_80_percent_girls',
          title: 'Transition successfully on 80%+ clears',
        },
        {
          id: 'cause_1_turnover_girls',
          title: 'Record 1 caused turnover per game',
        },
      ],
      Defense: [
        {
          id: 'hold_matchup_2_goals_girls',
          title: 'Hold matchup to under 2 goals per game',
        },
        {
          id: 'ground_balls_2_plus_girls',
          title: 'Record 2+ ground balls per game',
        },
        {
          id: 'cause_1_turnover_def_girls',
          title: 'Cause at least 1 turnover per game',
        },
        {
          id: 'transition_80_percent_def_girls',
          title: 'Transition successfully on 80%+ clears',
        },
        {
          id: 'limit_penalties_2_girls',
          title: 'Commit under 2 penalties per game',
        },
      ],
      Goalie: [
        {
          id: 'save_50_percent_girls',
          title: 'Maintain at least 50% save percentage',
        },
        {
          id: 'goals_under_10_girls',
          title: 'Keep opponents under 10 goals per game',
        },
        {
          id: 'saves_8_plus_5_games_girls',
          title: 'Record 8+ saves in at least 5 games',
        },
        {
          id: 'transition_75_percent_girls',
          title: 'Transition ball successfully on 75%+ clears',
        },
        {
          id: 'communicate_90_percent_girls',
          title: 'Communicate on 90% of defensive possessions',
        },
      ],
    },
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.ScrollView
            ref={scrollViewRef}
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Header with Progress Breadcrumb */}
            <View style={styles.header}>

              {/* Animated Checkmark Stamp */}
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    transform: [
                      { scale: checkmarkAnim },
                      {
                        rotate: checkmarkAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.checkmarkCircle}>
                  <Ionicons
                    name="checkmark"
                    size={28}
                    color={theme.colors.white}
                  />
                </View>
              </Animated.View>

              <Text style={styles.title}>Your Locker is Ready</Text>
              <Text style={styles.subtitle}>
                Review and confirm your profile details below
              </Text>
              
              {/* Reassuring Copy */}
              <Text style={styles.reassuranceText}>
                You can edit anything later from your profile.
              </Text>
            </View>

            {/* Player Card Hero */}
            <View style={styles.playerCard}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.playerCardGradient}
              >
                {/* Editable Player Avatar */}
                <TouchableOpacity 
                  style={styles.playerAvatar}
                  onPress={() => navigation.navigate('ProfileImage', {
                    ...route.params,
                    fromReview: true
                  })}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {firstName?.charAt(0)}
                      {lastName?.charAt(0)}
                    </Text>
                  )}
                  {/* Edit Badge */}
                  <View style={styles.editBadge}>
                    <Ionicons name="pencil" size={12} color={theme.colors.white} />
                  </View>
                </TouchableOpacity>

                {/* Editable Player Info */}
                <View style={styles.playerInfo}>
                  <TouchableOpacity 
                    style={styles.nameRow}
                    onPress={() => navigation.navigate('NameEntry', {
                      ...route.params,
                      fromReview: true
                    })}
                  >
                    <Text style={styles.playerName}>
                      {firstName} {lastName}
                    </Text>
                    <Ionicons name="pencil" size={14} color={theme.colors.white} style={styles.editIcon} />
                  </TouchableOpacity>
                  
                  {/* Compact Player Chips */}
                  <View style={styles.playerChips}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{position}</Text>
                    </View>
                    {jerseyNumber && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>#{jerseyNumber}</Text>
                      </View>
                    )}
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Class of {graduationYear}</Text>
                    </View>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{gender === 'boys' ? 'Boys' : 'Girls'}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.playerSchool}>{schoolName}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Team Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons
                    name="school"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.cardTitle}>Team Information</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('TeamInformation', {
                      ...route.params,
                      fromReview: true,
                    })
                  }
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                {/* High School Section */}
                <View style={styles.teamSection}>
                  <Text style={styles.teamSectionTitle}>High School</Text>
                  <Text style={styles.cardMainText}>{schoolName}</Text>
                  <Text style={styles.cardSubText}>
                    {city}, {state} • {level}
                  </Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        #
                        {jerseyNumber && jerseyNumber.trim()
                          ? jerseyNumber.trim()
                          : 'TBD'}
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        Class of {graduationYear}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Club Team Section */}
                {clubEnabled && (
                  <View style={[styles.teamSection, styles.teamSectionSpacing]}>
                    <Text style={styles.teamSectionTitle}>Club Team</Text>
                    <Text style={styles.cardMainText}>
                      {clubOrgName} - {clubTeamName}
                    </Text>
                    <Text style={styles.cardSubText}>
                      {clubCity}, {clubState}
                    </Text>
                    {clubJerseyNumber && clubJerseyNumber.trim() && (
                      <View style={styles.clubJerseyBadge}>
                        <Text style={styles.badgeText}>
                          #
                          {clubJerseyNumber.trim()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Season Goals Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons
                    name="flag"
                    size={24}
                    color={theme.colors.success}
                  />
                </View>
                <Text style={styles.cardTitle}>Season Goals</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('Goals', {
                      ...route.params,
                      fromReview: true,
                    })
                  }
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                {goals && goals.length > 0 ? (
                  <View style={styles.goalsContainer}>
                    {goals.map((goal: any, index: number) => (
                      <View key={index} style={styles.goalBullet}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.goalBulletText}>
                          {typeof goal === 'string'
                            ? getGoalTitle(goal)
                            : goal.title || goal.id}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.goalsContainer}>
                    <View style={styles.goalBullet}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.goalBulletText}>
                        Score at least 1 goal per game
                      </Text>
                    </View>
                    <View style={styles.goalBullet}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.goalBulletText}>
                        Average 2 assists per game
                      </Text>
                    </View>
                    <View style={styles.goalBullet}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.goalBulletText}>
                        Maintain 70% ground ball success
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Academic Card */}
            {(gpa || satScore || actScore || academicInterest || academicInterests?.length || hasHonorsAP || academicAwards) && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconContainer}>
                    <Ionicons name="book" size={24} color={theme.colors.info} />
                  </View>
                  <Text style={styles.cardTitle}>Academic</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      navigation.navigate('Academic', {
                        ...route.params,
                        fromReview: true,
                      })
                    }
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  {gpa && <Text style={styles.cardMainText}>GPA: {gpa}</Text>}
                  {(satScore || actScore) && (
                    <Text style={styles.cardSubText}>
                      {satScore ? `SAT: ${satScore}` : ''}
                      {satScore && actScore ? ' • ' : ''}
                      {actScore ? `ACT: ${actScore}` : ''}
                    </Text>
                  )}
                  {(academicInterests?.length || academicInterest) && (
                    <Text style={styles.cardSubText}>
                      Interests: {academicInterests?.length ? academicInterests.join(', ') : academicInterest}
                    </Text>
                  )}
                  {hasHonorsAP && (
                    <Text style={styles.cardSubText}>
                      Honors/AP Courses
                    </Text>
                  )}
                  {academicAwards && (
                    <Text style={styles.cardSubText}>
                      Awards: {academicAwards}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Optimized Account Creation Card */}
            <View style={styles.accountCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons
                    name="person-add"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.cardTitle}>Create Your Account</Text>
              </View>

              <View style={styles.accountFormContainer}>
                {/* Email Input */}
                <View style={styles.compactInputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="Email address"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => handleInputFocus(emailInputRef)}
                    onBlur={handleInputBlur}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </View>
                
                {/* Password Input */}
                <View style={styles.compactInputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        validatePasswordStrength(text);
                      }}
                      onFocus={() => handleInputFocus(passwordInputRef)}
                      onBlur={handleInputBlur}
                      placeholder="Create a secure password"
                      placeholderTextColor={theme.colors.neutral400}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleEnterLocker}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.strengthMeter}>
                        <View style={[
                          styles.strengthBar,
                          {
                            width: `${(passwordStrength.score / 4) * 100}%`,
                            backgroundColor: 
                              passwordStrength.score <= 1 ? '#ef4444' :
                              passwordStrength.score <= 2 ? '#f59e0b' :
                              passwordStrength.score <= 3 ? '#eab308' : '#10b981'
                          }
                        ]} />
                      </View>
                      <Text style={styles.strengthText}>
                        {passwordStrength.score <= 1 ? 'Weak' :
                         passwordStrength.score <= 2 ? 'Fair' :
                         passwordStrength.score <= 3 ? 'Good' : 'Strong'}
                      </Text>
                    </View>
                  )}
                  
                  {/* Always Visible Password Requirements */}
                  <View style={styles.passwordChecklist}>
                    <View style={styles.checklistItem}>
                      <Ionicons 
                        name={passwordStrength.checks.length ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={passwordStrength.checks.length ? '#10b981' : theme.colors.neutral400}
                      />
                      <Text style={[styles.checklistText, passwordStrength.checks.length && styles.checklistTextComplete]}>
                        At least 8 characters
                      </Text>
                    </View>
                    <View style={styles.checklistItem}>
                      <Ionicons 
                        name={passwordStrength.checks.uppercase ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={passwordStrength.checks.uppercase ? '#10b981' : theme.colors.neutral400}
                      />
                      <Text style={[styles.checklistText, passwordStrength.checks.uppercase && styles.checklistTextComplete]}>
                        One uppercase letter
                      </Text>
                    </View>
                    <View style={styles.checklistItem}>
                      <Ionicons 
                        name={passwordStrength.checks.lowercase ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={passwordStrength.checks.lowercase ? '#10b981' : theme.colors.neutral400}
                      />
                      <Text style={[styles.checklistText, passwordStrength.checks.lowercase && styles.checklistTextComplete]}>
                        One lowercase letter
                      </Text>
                    </View>
                    <View style={styles.checklistItem}>
                      <Ionicons 
                        name={passwordStrength.checks.number ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={passwordStrength.checks.number ? '#10b981' : theme.colors.neutral400}
                      />
                      <Text style={[styles.checklistText, passwordStrength.checks.number && styles.checklistTextComplete]}>
                        One number
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Trust & Compliance Microcopy */}
            <View style={styles.complianceContainer}>
              <Text style={styles.complianceText}>
                By creating an account, you agree to our{' '}
                <Text 
                  style={styles.complianceLink}
                  onPress={() => Linking.openURL('https://thestatlocker.com/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text 
                  style={styles.complianceLink}
                  onPress={() => Linking.openURL('https://thestatlocker.com/privacy')}
                >
                  Privacy Policy
                </Text>
                . Your data is encrypted and secure.
              </Text>
            </View>

            {/* Enhanced Enter Button */}
            <TouchableOpacity
              style={[
                styles.enterButton,
                (!email || !password || passwordStrength.score < 3 || isCreatingUser) &&
                  styles.enterButtonDisabled,
              ]}
              onPress={handleEnterLocker}
              disabled={!email || !password || passwordStrength.score < 3 || isCreatingUser}
            >
              {isCreatingUser ? (
                <>
                  <Text style={styles.enterButtonText}>Creating Your Locker...</Text>
                  <Ionicons
                    name="hourglass"
                    size={20}
                    color={theme.colors.white}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.enterButtonText}>Enter the Locker</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={theme.colors.white}
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </Animated.ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  commitmentSectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  commitmentOptions: {
    marginBottom: 20,
  },
  commitmentOption: {
    backgroundColor: theme.colors.neutral50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  commitmentOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  commitmentOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commitmentOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  commitmentOptionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  commitmentOptionTitleSelected: {
    color: theme.colors.primary,
  },
  commitmentOptionSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  commitmentDisplay: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  teamSection: {
    marginBottom: 8,
  },
  teamSectionSpacing: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral100,
  },
  // New UI Enhancement Styles
  progressBreadcrumb: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  breadcrumbText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  reassuranceText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIcon: {
    opacity: 0.8,
  },
  playerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
  },
  // Password Strength Meter Styles
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  strengthMeter: {
    height: 4,
    backgroundColor: theme.colors.neutral200,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    textAlign: 'right',
  },
  passwordChecklist: {
    marginTop: 8,
    gap: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  checklistTextComplete: {
    color: '#10b981',
    textDecorationLine: 'line-through',
  },
  // Compliance and Trust Styles
  complianceContainer: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  complianceText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  complianceLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.medium,
    textDecorationLine: 'underline',
  },
  // Optimized Account Card Styles
  accountCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accountFormContainer: {
    marginTop: 16,
  },
  compactInputContainer: {
    marginBottom: 16,
  },
  compactPasswordValidation: {
    marginTop: 8,
  },
  strengthMeterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  compactStrengthText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.medium,
    minWidth: 40,
  },
  compactChecklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compactChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  compactChecklistText: {
    fontSize: 10,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
  },
  teamSectionTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamSectionTitleContainer: {
    flex: 1,
  },
  clubJerseyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    marginTop: 8,
  },
});
