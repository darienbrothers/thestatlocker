import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { OnboardingStepper } from '@/components/gamification';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';

type GoalsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Goals'>;
type GoalsScreenRouteProp = RouteProp<RootStackParamList, 'Goals'>;

interface GoalsScreenProps {
  navigation: GoalsScreenNavigationProp;
  route: GoalsScreenRouteProp;
}

interface SeasonGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'scoring' | 'assists' | 'defense' | 'saves' | 'faceoffs' | 'ground_balls' | 'turnovers' | 'accuracy';
}

interface PositionGoals {
  Attack: SeasonGoal[];
  Midfield: SeasonGoal[];
  Defense: SeasonGoal[];
  Goalie: SeasonGoal[];
  FOGO?: SeasonGoal[];
  LSM?: SeasonGoal[];
  SSDM?: SeasonGoal[];
}


interface GenderPositions {
  boys: PositionGoals;
  girls: PositionGoals;
}


// Master Goals Library - Position-specific season goals
const SEASON_GOALS: GenderPositions = {
  boys: {
    Attack: [
      { id: 'score_1_per_game', title: 'Score at least 1 goal per game', description: 'Track your scoring consistency this season', icon: 'football', category: 'scoring' },
      { id: 'avg_2_assists', title: 'Average 2+ assists per game', description: 'Be a playmaker for your teammates', icon: 'people', category: 'assists' },
      { id: 'shooting_60_percent', title: 'Maintain 60%+ shooting accuracy', description: 'Make every shot count', icon: 'target', category: 'accuracy' },
      { id: 'ground_balls_3_plus', title: 'Record 3+ ground balls per game', description: 'Win the 50/50 battles', icon: 'basketball', category: 'ground_balls' },
      { id: 'limit_turnovers_2', title: 'Limit turnovers to under 2 per game', description: 'Protect possession and be smart with the ball', icon: 'shield-checkmark', category: 'turnovers' },
      { id: 'dodge_success_70', title: 'Maintain 70%+ dodge success rate', description: 'Beat your defender consistently', icon: 'flash', category: 'accuracy' },
      { id: 'man_up_goals_3', title: 'Score 3+ man-up goals this season', description: 'Capitalize on extra-man opportunities', icon: 'trophy', category: 'scoring' },
    ],
    Midfield: [
      { id: 'contribute_2_points', title: 'Contribute 2+ points per game', description: 'Goals + assists combined impact', icon: 'trophy', category: 'scoring' },
      { id: 'ground_balls_50_percent', title: 'Win 50%+ ground balls attempted', description: 'Control possession battles', icon: 'basketball', category: 'ground_balls' },
      { id: 'clear_80_percent', title: 'Clear ball successfully 80%+ of the time', description: 'Transition defense to offense', icon: 'arrow-forward', category: 'defense' },
      { id: 'score_assist_every_game', title: 'Score or assist in every game', description: 'Make an offensive impact consistently', icon: 'flash', category: 'scoring' },
      { id: 'cause_1_turnover', title: 'Record 1 caused turnover per game', description: 'Create extra possessions for your team', icon: 'hand-left', category: 'turnovers' },
      { id: 'transition_goals_5', title: 'Score 5+ transition goals this season', description: 'Push the pace and score in transition', icon: 'arrow-forward', category: 'scoring' },
      { id: 'faceoff_wins_40', title: 'Win 40%+ of face-offs taken', description: 'Help control possession at the X', icon: 'refresh', category: 'faceoffs' },
    ],
    Defense: [
      { id: 'hold_matchup_2_goals', title: 'Hold matchup to under 2 goals per game', description: 'Shut down your assignment', icon: 'shield', category: 'defense' },
      { id: 'ground_balls_70_percent', title: 'Win 70%+ ground balls attempted', description: 'Dominate the ground game', icon: 'basketball', category: 'ground_balls' },
      { id: 'cause_1_turnover_def', title: 'Cause at least 1 turnover per game', description: 'Force mistakes and create opportunities', icon: 'hand-left', category: 'turnovers' },
      { id: 'clear_80_percent_def', title: 'Clear successfully on 80%+ attempts', description: 'Start the transition game', icon: 'arrow-forward', category: 'defense' },
      { id: 'limit_penalties_2', title: 'Commit under 2 penalties per game', description: 'Play aggressive but smart defense', icon: 'warning', category: 'defense' },
      { id: 'slides_help_80', title: 'Make successful slides 80%+ of the time', description: 'Provide effective help defense', icon: 'people', category: 'defense' },
      { id: 'takeaways_2_per_game', title: 'Record 2+ takeaways per game', description: 'Strip the ball and create turnovers', icon: 'hand-left', category: 'turnovers' },
    ],
    Goalie: [
      { id: 'save_55_percent', title: 'Maintain at least 55% save percentage', description: 'Stop more than half the shots you face', icon: 'hand-right', category: 'saves' },
      { id: 'goals_under_8', title: 'Keep opponents under 8 goals per game', description: 'Anchor a strong team defense', icon: 'shield-checkmark', category: 'saves' },
      { id: 'clear_80_percent_goalie', title: 'Clear ball successfully 80%+ of the time', description: 'Start fast breaks with accurate outlets', icon: 'arrow-forward', category: 'defense' },
      { id: 'saves_10_plus_5_games', title: 'Record 10+ saves in at least 5 games', description: 'Have multiple standout performances', icon: 'trophy', category: 'saves' },
      { id: 'communicate_90_percent', title: 'Communicate on 90% of defensive possessions', description: 'Be the quarterback of your defense', icon: 'megaphone', category: 'defense' },
      { id: 'shutout_games_2', title: 'Record 2+ shutout games this season', description: 'Completely shut down opposing offense', icon: 'shield-checkmark', category: 'saves' },
      { id: 'outlet_accuracy_85', title: 'Maintain 85%+ outlet pass accuracy', description: 'Start fast breaks with precision', icon: 'arrow-forward', category: 'accuracy' },
    ],
    FOGO: [
      { id: 'faceoff_60_percent', title: 'Win 60%+ of face-offs', description: 'Control possession from the X', icon: 'refresh', category: 'faceoffs' },
      { id: 'ground_balls_3_plus_fogo', title: 'Average 3+ ground balls per game', description: 'Clean up loose balls around the X', icon: 'basketball', category: 'ground_balls' },
      { id: 'limit_faceoff_turnovers', title: 'Limit turnovers to under 1 per game', description: 'Win clean and maintain possession', icon: 'checkmark-circle', category: 'turnovers' },
      { id: 'faceoff_streaks_3', title: 'Keep face-off win streaks of 3+ in a row', description: 'Build momentum with consecutive wins', icon: 'flame', category: 'faceoffs' },
      { id: 'wing_play_success_70', title: 'Win 70%+ of wing battles', description: 'Dominate the wings on face-offs', icon: 'trending-up', category: 'faceoffs' },
      { id: 'fast_break_goals_8', title: 'Score 8+ fast break goals this season', description: 'Turn face-off wins into quick scores', icon: 'flash', category: 'scoring' },
    ],
  },
  girls: {
    Attack: [
      { id: 'score_1_per_game_girls', title: 'Score at least 1 goal per game', description: 'Track your scoring consistency this season', icon: 'football', category: 'scoring' },
      { id: 'avg_2_assists_girls', title: 'Average 2+ assists per game', description: 'Be a playmaker for your teammates', icon: 'people', category: 'assists' },
      { id: 'shooting_55_percent_girls', title: 'Maintain 55%+ shooting accuracy', description: 'Make every shot count', icon: 'target', category: 'accuracy' },
      { id: 'draw_ground_balls_3_girls', title: 'Record 3+ draw controls or ground balls per game', description: 'Win possession battles', icon: 'basketball', category: 'ground_balls' },
      { id: 'limit_turnovers_2_girls', title: 'Limit turnovers to under 2 per game', description: 'Protect possession and be smart with the ball', icon: 'shield-checkmark', category: 'turnovers' },
    ],
    Midfield: [
      { id: 'draw_controls_3_girls', title: 'Record 3+ draw controls per game', description: 'Win the center circle battles', icon: 'refresh', category: 'ground_balls' },
      { id: 'contribute_2_points_girls', title: 'Contribute 2+ points per game', description: 'Goals + assists combined impact', icon: 'trophy', category: 'scoring' },
      { id: 'ground_balls_50_percent_girls', title: 'Win 50%+ ground balls attempted', description: 'Control possession battles', icon: 'basketball', category: 'ground_balls' },
      { id: 'transition_80_percent_girls', title: 'Transition successfully on 80%+ clears', description: 'Move the ball up field effectively', icon: 'arrow-forward', category: 'defense' },
      { id: 'cause_1_turnover_girls', title: 'Record 1 caused turnover per game', description: 'Create extra possessions for your team', icon: 'hand-left', category: 'turnovers' },
    ],
    Defense: [
      { id: 'hold_matchup_2_goals_girls', title: 'Hold matchup to under 2 goals per game', description: 'Shut down your assignment', icon: 'shield', category: 'defense' },
      { id: 'ground_balls_2_plus_girls', title: 'Record 2+ ground balls per game', description: 'Win the ground game consistently', icon: 'basketball', category: 'ground_balls' },
      { id: 'cause_1_turnover_def_girls', title: 'Cause at least 1 turnover per game', description: 'Force mistakes and create opportunities', icon: 'hand-left', category: 'turnovers' },
      { id: 'transition_80_percent_def_girls', title: 'Transition successfully on 80%+ clears', description: 'Start the offensive transition', icon: 'arrow-forward', category: 'defense' },
      { id: 'limit_penalties_2_girls', title: 'Commit under 2 penalties per game', description: 'Play aggressive but smart defense', icon: 'warning', category: 'defense' },
    ],
    Goalie: [
      { id: 'save_50_percent_girls', title: 'Maintain at least 50% save percentage', description: 'Stop half the shots you face', icon: 'hand-right', category: 'saves' },
      { id: 'goals_under_10_girls', title: 'Keep opponents under 10 goals per game', description: 'Anchor a strong team defense', icon: 'shield-checkmark', category: 'saves' },
      { id: 'saves_8_plus_5_games_girls', title: 'Record 8+ saves in at least 5 games', description: 'Have multiple standout performances', icon: 'trophy', category: 'saves' },
      { id: 'transition_75_percent_girls', title: 'Transition ball successfully on 75%+ clears', description: 'Start fast breaks with accurate outlets', icon: 'arrow-forward', category: 'defense' },
      { id: 'communicate_90_percent_girls', title: 'Communicate on 90% of defensive possessions', description: 'Be the quarterback of your defense', icon: 'megaphone', category: 'defense' },
    ],
  },
};


export default function GoalsScreen({ navigation, route }: GoalsScreenProps) {
  const { 
    gender, position
  } = route.params || {};

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const goalCardAnims = useRef<{[key: string]: Animated.Value}>({}).current;

  const genderKey = gender as 'boys' | 'girls';
  const positionKey = position as keyof PositionGoals;
  
  const positionGoals = SEASON_GOALS[genderKey]?.[positionKey] || [];

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else if (prev.length < 3) {
        return [...prev, goalId];
      }
      return prev;
    });
  };

  const isGoalSelected = (goalId: string) => selectedGoals.includes(goalId);
  const canSelectMore = selectedGoals.length < 3;
  const isComplete = selectedGoals.length === 3;

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

  // Initialize goal card animations
  useEffect(() => {
    positionGoals.forEach(goal => {
      if (!goalCardAnims[goal.id]) {
        goalCardAnims[goal.id] = new Animated.Value(1);
      }
    });
  }, [positionGoals]);

  // Animate goal selection
  useEffect(() => {
    selectedGoals.forEach(goalId => {
      if (goalCardAnims[goalId]) {
        Animated.sequence([
          Animated.timing(goalCardAnims[goalId], {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(goalCardAnims[goalId], {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [selectedGoals]);


  const handleContinue = () => {
    if (!isComplete) return;
    
    // Animate button press
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

    // Navigate to next screen with goals data
    navigation.navigate('Review', {
      ...route.params,
      goals: selectedGoals,
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
      <OnboardingStepper 
        currentStep={7}
        totalSteps={8}
        stepTitle="Season Goals"
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
                <View style={styles.titleContainer}>
                  <Ionicons name="trophy" size={32} color={theme.colors.primary} />
                  <Text style={styles.title}>Season Goals</Text>
                </View>
                <Text style={styles.subtitle}>
                  Every great season starts with a game plan. Choose 3 goals to track in your locker.
                </Text>
                
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(selectedGoals.length / 3) * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {selectedGoals.length} of 3 selected
                  </Text>
                </View>
              </View>

              {/* Season Goals Selection */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="golf" size={24} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Choose Your Season Goals</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Select exactly 3 goals to track your progress this season.
                </Text>
                
                <View style={styles.goalCardsContainer}>
                  {positionGoals.map((goal: SeasonGoal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalSelectionCard,
                        isGoalSelected(goal.id) && styles.goalSelectionCardSelected,
                        !canSelectMore && !isGoalSelected(goal.id) && styles.goalSelectionCardDisabled
                      ]}
                      onPress={() => handleGoalToggle(goal.id)}
                      activeOpacity={0.8}
                      disabled={!canSelectMore && !isGoalSelected(goal.id)}
                    >
                      <LinearGradient
                        colors={isGoalSelected(goal.id) 
                          ? [theme.colors.primary, theme.colors.primary + 'DD']
                          : [theme.colors.white, theme.colors.neutral50]
                        }
                        style={styles.goalCardGradient}
                      >
                        <View style={styles.goalCardHeader}>
                          <Ionicons 
                            name={goal.icon as any} 
                            size={24} 
                            color={isGoalSelected(goal.id) ? theme.colors.white : theme.colors.primary} 
                          />
                          {isGoalSelected(goal.id) && (
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
                          )}
                        </View>
                        <Text style={[
                          styles.goalCardTitle,
                          isGoalSelected(goal.id) && styles.goalCardTitleSelected
                        ]}>
                          {goal.title}
                        </Text>
                        <Text style={[
                          styles.goalCardDescription,
                          isGoalSelected(goal.id) && styles.goalCardDescriptionSelected
                        ]}>
                          {goal.description}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>


              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  {
                    opacity: isComplete ? 1 : 0.5,
                    transform: [{ scale: bounceAnim }],
                  }
                ]}
                onPress={handleContinue}
                activeOpacity={0.9}
                disabled={!isComplete}
              >
                <LinearGradient
                  colors={isComplete 
                    ? [theme.colors.primary, theme.colors.primary + 'DD']
                    : [theme.colors.neutral300, theme.colors.neutral400]
                  }
                  style={styles.continueButtonGradient}
                >
                  <Text style={[
                    styles.continueButtonText,
                    !isComplete && styles.continueButtonTextDisabled
                  ]}>
                    {isComplete ? 'Continue to Review' : `Select ${3 - selectedGoals.length} more goal${3 - selectedGoals.length === 1 ? '' : 's'}`}
                  </Text>
                  {isComplete && (
                    <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
  },
  // Header Section
  headerSection: {
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.neutral200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  // Section Styles
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  // Goal Cards Container
  goalCardsContainer: {
    gap: 12,
  },
  goalSelectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalSelectionCardSelected: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  goalSelectionCardDisabled: {
    opacity: 0.6,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalCardTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  goalCardTitleSelected: {
    color: theme.colors.white,
  },
  goalCardDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  goalCardDescriptionSelected: {
    color: theme.colors.white + 'DD',
  },
  goalCard: {
    borderRadius: 16,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  goalCardGradient: {
    padding: 20,
  },
  // Tags Container
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tagButtonSelected: {
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  tagGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  tagTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  // Button Section
  buttonSection: {
    gap: 12,
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
    marginRight: 8,
    textAlign: 'center',
    flex: 1,
  },
  continueButtonTextDisabled: {
    color: theme.colors.textTertiary,
    marginRight: 0,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
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
