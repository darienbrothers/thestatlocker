import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { useAuthStore } from '../../../shared/stores/authStore';
import { useGamificationStore } from '../../../shared/stores/gamificationStore';
import { OnboardingStepper } from '@/components/gamification';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'personal' | 'season' | 'recruiting';
}

// SMART Goals by Position
const ATTACK_GOALS: Goal[] = [
  {
    id: 'score_15_goals_season',
    title: 'Score 15+ Goals This Season',
    description: 'Achieve at least 15 goals by season end',
    icon: 'football',
    category: 'season',
  },
  {
    id: 'shooting_accuracy_65',
    title: 'Maintain 65%+ Shooting Accuracy',
    description: 'Keep shooting percentage above 65% all season',
    icon: 'target',
    category: 'season',
  },
  {
    id: 'assists_per_game_1_5',
    title: 'Average 1.5+ Assists Per Game',
    description: 'Contribute 1.5 or more assists each game',
    icon: 'hand-left',
    category: 'season',
  },
  {
    id: 'ground_balls_3_per_game',
    title: 'Win 3+ Ground Balls Per Game',
    description: 'Secure at least 3 ground balls every game',
    icon: 'basketball',
    category: 'season',
  },
  {
    id: 'limit_turnovers_1_5',
    title: 'Keep Turnovers Under 1.5 Per Game',
    description: 'Maintain ball security with minimal turnovers',
    icon: 'shield-checkmark',
    category: 'season',
  },
];

const MIDFIELD_GOALS: Goal[] = [
  {
    id: 'points_per_game_2',
    title: 'Average 2+ Points Per Game',
    description: 'Combine goals and assists for 2+ points per game',
    icon: 'stats-chart',
    category: 'season',
  },
  {
    id: 'faceoff_wins_55_percent',
    title: 'Win 55%+ of Face-offs',
    description: 'Dominate face-off circle with 55%+ win rate',
    icon: 'refresh-circle',
    category: 'season',
  },
  {
    id: 'ground_balls_4_per_game',
    title: 'Secure 4+ Ground Balls Per Game',
    description: 'Control possession with 4+ ground balls per game',
    icon: 'basketball',
    category: 'season',
  },
  {
    id: 'clear_success_80_percent',
    title: 'Clear Ball Successfully 80%+ of Time',
    description: 'Move ball upfield successfully 4 out of 5 times',
    icon: 'arrow-up-circle',
    category: 'season',
  },
  {
    id: 'caused_turnovers_1_per_game',
    title: 'Force 1+ Turnover Per Game',
    description: 'Create defensive pressure resulting in turnovers',
    icon: 'hand-right',
    category: 'season',
  },
];

const DEFENSE_GOALS: Goal[] = [
  {
    id: 'hold_opponent_under_2_goals',
    title: 'Hold Matchup to Under 2 Goals Per Game',
    description: 'Limit direct opponent to less than 2 goals per game',
    icon: 'shield',
    category: 'season',
  },
  {
    id: 'ground_balls_5_per_game',
    title: 'Win 5+ Ground Balls Per Game',
    description: 'Dominate ground ball battles with 5+ per game',
    icon: 'basketball',
    category: 'season',
  },
  {
    id: 'caused_turnovers_1_5_per_game',
    title: 'Force 1.5+ Turnovers Per Game',
    description: 'Apply pressure to create 1.5+ turnovers per game',
    icon: 'hand-right',
    category: 'season',
  },
  {
    id: 'clear_success_85_percent',
    title: 'Clear Successfully 85%+ of Time',
    description: 'Move ball out of defensive zone 85%+ of attempts',
    icon: 'arrow-up-circle',
    category: 'season',
  },
  {
    id: 'slides_communication_90',
    title: 'Communicate on 90%+ of Slides',
    description: 'Provide clear communication during defensive rotations',
    icon: 'chatbubbles',
    category: 'season',
  },
];

const GOALIE_GOALS: Goal[] = [
  {
    id: 'save_percentage_60_plus',
    title: 'Maintain 60%+ Save Percentage',
    description: 'Stop 6 out of every 10 shots faced',
    icon: 'shield-checkmark',
    category: 'season',
  },
  {
    id: 'goals_against_under_8',
    title: 'Allow Under 8 Goals Per Game',
    description: 'Keep team competitive by limiting goals against',
    icon: 'trending-down',
    category: 'season',
  },
  {
    id: 'saves_10_plus_5_games',
    title: 'Record 10+ Saves in 5+ Games',
    description: 'Have at least 5 games with double-digit saves',
    icon: 'trophy',
    category: 'season',
  },
  {
    id: 'clear_assists_15_season',
    title: 'Record 15+ Clear Assists This Season',
    description: 'Contribute to offense with 15+ clear assists',
    icon: 'arrow-forward-circle',
    category: 'season',
  },
  {
    id: 'ground_balls_2_per_game',
    title: 'Secure 2+ Ground Balls Per Game',
    description: 'Help defense by winning ground balls in crease',
    icon: 'basketball',
    category: 'season',
  },
];

const RECRUITING_GOALS: Goal[] = [
  {
    id: 'create_highlight_video',
    title: 'Create Professional Highlight Video',
    description: 'Compile 3-5 minute highlight reel by mid-season',
    icon: 'videocam',
    category: 'recruiting',
  },
  {
    id: 'contact_20_college_coaches',
    title: 'Contact 20+ College Coaches',
    description: 'Reach out to 20+ coaches at target schools',
    icon: 'mail',
    category: 'recruiting',
  },
  {
    id: 'attend_3_college_camps',
    title: 'Attend 3+ College Camps/Showcases',
    description: 'Participate in camps at target schools',
    icon: 'school',
    category: 'recruiting',
  },
  {
    id: 'maintain_3_5_gpa',
    title: 'Maintain 3.5+ GPA',
    description: 'Keep academic eligibility with strong grades',
    icon: 'library',
    category: 'recruiting',
  },
  {
    id: 'complete_sat_act_prep',
    title: 'Complete SAT/ACT Prep Course',
    description: 'Improve standardized test scores for college admission',
    icon: 'document-text',
    category: 'recruiting',
  },
];

const PERSONAL_GOALS: Goal[] = [
  {
    id: 'leadership_captain_role',
    title: 'Earn Team Leadership Role',
    description: 'Be selected as team captain or assistant captain',
    icon: 'people',
    category: 'personal',
  },
  {
    id: 'mentor_younger_players',
    title: 'Mentor 2+ Younger Players',
    description: 'Take 2+ underclassmen under your wing',
    icon: 'heart',
    category: 'personal',
  },
  {
    id: 'perfect_attendance_practice',
    title: 'Perfect Practice Attendance',
    description: 'Attend every practice and team meeting',
    icon: 'checkmark-circle',
    category: 'personal',
  },
  {
    id: 'community_service_20_hours',
    title: 'Complete 20+ Hours Community Service',
    description: 'Give back to community with volunteer work',
    icon: 'hand-right',
    category: 'personal',
  },
  {
    id: 'improve_fitness_benchmarks',
    title: 'Improve All Fitness Benchmarks by 10%',
    description: 'Increase speed, strength, and endurance by 10%',
    icon: 'fitness',
    category: 'personal',
  },
];

interface GoalsScreenProps {
  navigation: any;
  route: {
    params?: {
      firstName?: string;
      lastName?: string;
      profileImage?: string | null;
      sport?: string;
      gender?: string;
      position?: string;
      graduationYear?: number;
      height?: string;
      schoolName?: string;
      city?: string;
      state?: string;
      level?: string;
      jerseyNumber?: string;
      clubEnabled?: boolean;
      clubOrgName?: string;
      clubTeamName?: string;
      clubCity?: string;
      clubState?: string;
      clubJerseyNumber?: string;
      selectedGoals?: string[];
      [key: string]: any;
    };
  };
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation, route }) => {
  const { updateUser, user, isAuthenticated } = useAuthStore();
  const { addXP } = useGamificationStore();
  
  // Initialize with existing selected goals from route params
  const [selectedGoals, setSelectedGoals] = useState<string[]>(route.params?.selectedGoals || []);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  // Animation values
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

  // Get goals based on user's position
  const getGoalsByPosition = (position: string): Goal[] => {
    const pos = position?.toLowerCase();
    switch (pos) {
      case 'attack':
      case 'attacker':
        return ATTACK_GOALS;
      case 'midfield':
      case 'midfielder':
        return MIDFIELD_GOALS;
      case 'defense':
      case 'defender':
        return DEFENSE_GOALS;
      case 'goalie':
      case 'goalkeeper':
        return GOALIE_GOALS;
      default:
        return MIDFIELD_GOALS; // Default to midfield
    }
  };
  
  const userPosition = route.params?.position || 'Midfield';
  const seasonGoals = getGoalsByPosition(userPosition);

  const isGoalSelected = (goalId: string) => {
    return selectedGoals.includes(goalId);
  };

  const toggleGoalSelection = (goalId: string) => {
    if (isGoalSelected(goalId)) {
      setSelectedGoals(prev => prev.filter(id => id !== goalId));
    } else if (selectedGoals.length < 6) {
      setSelectedGoals(prev => [...prev, goalId]);
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isValid = selectedGoals.length > 0;

  const handleContinue = async () => {
    if (selectedGoals.length === 0) return;

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
    ]).start(async () => {
      try {
        // Only update user if authenticated, otherwise just navigate
        if (isAuthenticated && user) {
          await updateUser({ 
            goals: {
              improvementAreas: selectedGoals,
              collegeInterest: selectedGoals.some(goal => 
                ['create_highlight_video', 'contact_20_college_coaches', 'attend_3_college_camps', 'maintain_3_5_gpa', 'complete_sat_act_prep'].includes(goal)
              ),
            }
          });
          
          // Award XP for completing goals step
          addXP(50, 'Goals set - ready to achieve!');
        }
        
        // Navigate to next screen with all route params
        navigation.navigate('Review', {
          ...route.params,
          selectedGoals,
          goals: selectedGoals, // Pass goals in the format ReviewScreen expects
        });
      } catch (error) {
        console.error('Error saving goals:', error);
        // Still navigate even if save fails
        navigation.navigate('Review', {
          ...route.params,
          selectedGoals,
          goals: selectedGoals,
        });
      }
    });
  };

  const renderGoalCard = (goal: Goal) => {
    const isSelected = isGoalSelected(goal.id);
    const isDisabled = !isSelected && selectedGoals.length >= 6;

    return (
      <TouchableOpacity
        key={goal.id}
        style={[
          styles.goalCard,
          isSelected && styles.selectedGoalCard,
          isDisabled && styles.disabledGoalCard,
        ]}
        onPress={() => !isDisabled && toggleGoalSelection(goal.id)}
        disabled={isDisabled}
      >
        <View style={styles.goalCardContent}>
          <View style={styles.goalHeader}>
            <Ionicons
              name={goal.icon as any}
              size={24}
              color={
                isSelected
                  ? theme.colors.white
                  : isDisabled
                  ? theme.colors.textSecondary
                  : theme.colors.primary
              }
            />
            <View style={styles.goalTextContainer}>
              <Text
                style={[
                  styles.goalTitle,
                  isSelected && styles.selectedGoalTitle,
                  isDisabled && styles.disabledGoalTitle,
                ]}
              >
                {goal.title}
              </Text>
              <Text
                style={[
                  styles.goalDescription,
                  isSelected && styles.selectedGoalDescription,
                  isDisabled && styles.disabledGoalDescription,
                ]}
              >
                {goal.description}
              </Text>
            </View>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark" size={20} color={theme.colors.white} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderGoalSection = (title: string, goals: Goal[], sectionKey: string) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {goals.map(renderGoalCard)}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper
        currentStep={6}
        totalSteps={8}
        stepTitle="Set Your Goals"
        showBackButton={true}
        onBackPress={handleBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.scrollView,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header Section */}
                <View style={styles.headerSection}>
                  <Image
                    source={require('../../../../assets/logos/logoBlack.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.title}>Set Your Goals</Text>
                  <Text style={styles.subtitle}>
                    Choose up to 6 goals to focus on this season. Select from season goals based on your position, recruiting goals, and personal development goals.
                  </Text>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                      {selectedGoals.length} of 6 goals selected
                    </Text>
                  </View>
                </View>

                {/* Goals Sections */}
                <View style={styles.goalsContainer}>
                  {/* Season Goals Section - Based on Position */}
                  {renderGoalSection(`${userPosition} Season Goals`, seasonGoals, 'season')}
                  
                  {/* Recruiting Goals Section */}
                  {renderGoalSection('Recruiting & College Prep', RECRUITING_GOALS, 'recruiting')}
                  
                  {/* Personal Goals Section */}
                  {renderGoalSection('Personal Development', PERSONAL_GOALS, 'personal')}
                </View>
              </ScrollView>
            </Animated.View>

            {/* Continue Button */}
            <View style={styles.buttonSection}>
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !isValid && styles.disabledButton,
                  ]}
                  onPress={handleContinue}
                  disabled={!isValid}
                >
                  <LinearGradient
                    colors={
                      isValid
                        ? [theme.colors.primary, theme.colors.primaryDark]
                        : [theme.colors.neutral200, theme.colors.neutral200]
                    }
                    start={[0, 0]}
                    end={[1, 1]}
                    style={styles.buttonGradient}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        !isValid && styles.disabledButtonText,
                      ]}
                    >
                      Next ({selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected)
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={
                        isValid
                          ? theme.colors.white
                          : theme.colors.textTertiary
                      }
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    backgroundColor: theme.colors.neutral50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  goalsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  sectionContainer: {
    backgroundColor: theme.colors.neutral50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.neutral50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  goalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    padding: 16,
  },
  selectedGoalCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  disabledGoalCard: {
    opacity: 0.5,
    backgroundColor: theme.colors.neutral50,
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  selectedGoalTitle: {
    color: theme.colors.white,
  },
  disabledGoalTitle: {
    color: theme.colors.textSecondary,
  },
  goalDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  selectedGoalDescription: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  disabledGoalDescription: {
    color: theme.colors.textTertiary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral200,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  disabledButtonText: {
    color: theme.colors.textTertiary,
  },
});

export default GoalsScreen;
