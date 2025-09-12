import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../../shared/stores/authStore';
import { useGamificationStore } from '../../../shared/stores/gamificationStore';
import { SEASON_GOALS } from '../../../data/goals/seasonGoals';
import { OnboardingStepper } from '../../../components/gamification/OnboardingStepper';
import { theme } from '../../../constants/theme';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'personal' | 'season' | 'recruiting';
  level: 'rookie' | 'pro' | 'veteran';
  target: string;
  trackingType: 'automatic' | 'manual';
}

interface GoalsScreenProps {
  navigation: any;
  route: {
    params: {
      firstName?: string;
      lastName?: string;
      profileImage?: string;
      sport?: string;
      position?: string;
      graduationYear?: string;
      highSchool?: string;
      city?: string;
      state?: string;
      clubEnabled?: boolean;
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

  // Get position from route params
  const { position } = route.params;

  // Initialize with existing selected goals from route params
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    route.params.selectedGoals || []
  );
  const [goalsByLevel, setGoalsByLevel] = useState<Record<string, Goal[]>>({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    rookie: false,
    pro: false,
    veteran: false,
  });

  // Get position-specific goals from SEASON_GOALS
  const getPositionGoals = useCallback(() => {
    if (!position) {
      return [];
    }

    // Map position names to SEASON_GOALS keys
    const positionMap: { [key: string]: string } = {
      Attack: 'Attack',
      Midfield: 'Midfield',
      Defense: 'Defense',
      Goalie: 'Goalie',
      FOGO: 'FOGO',
      LSM: 'LSM',
      SSDM: 'SSDM',
    };

    const mappedPosition = positionMap[position];
    if (!mappedPosition) {
      return [];
    }

    // Get goals for both genders and combine them
    const boysGoals =
      SEASON_GOALS.boys[mappedPosition as keyof typeof SEASON_GOALS.boys] || [];
    const girlsGoals =
      SEASON_GOALS.girls[mappedPosition as keyof typeof SEASON_GOALS.girls] ||
      [];

    // Convert SeasonGoal to Goal format and add difficulty levels
    const convertedGoals = [...boysGoals, ...girlsGoals].map(
      (goal: any, index: number) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        icon: goal.icon,
        category: 'season' as const,
        level: (index < 5 ? 'rookie' : index < 10 ? 'pro' : 'veteran') as
          | 'rookie'
          | 'pro'
          | 'veteran',
        target: `${goal.targetValue} ${goal.unit}`,
        trackingType: 'automatic' as const,
      }),
    );

    return convertedGoals;
  }, [position]);

  // Get position-specific display name
  const getPositionDisplayName = () => {
    if (!position) {
      return 'Player';
    }
    return position === 'Goalie' ? 'Goalie' : position;
  };

  const inspireMeAutoSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Clear current selections
    setSelectedGoals([]);

    // Get position-specific goals
    const allGoals = getPositionGoals();

    // Randomly select 3 goals
    const shuffledGoals = [...allGoals].sort(() => Math.random() - 0.5);
    const randomSelectedGoals = shuffledGoals.slice(0, MAX_GOALS);
    const randomGoalIds = randomSelectedGoals.map(goal => goal.id);

    // Update goalsByLevel to ensure selected goals are visible in their dropdowns
    const updatedGoalsByLevel: Record<string, Goal[]> = {
      rookie: [],
      pro: [],
      veteran: [],
    };

    // Group selected goals by level
    const selectedGoalsByLevel: Record<string, Goal[]> = {
      rookie: [],
      pro: [],
      veteran: [],
    };

    randomSelectedGoals.forEach(selectedGoal => {
      const level = selectedGoal.level;
      if (selectedGoalsByLevel[level]) {
        selectedGoalsByLevel[level].push(selectedGoal);
      }
    });

    // For each level, ensure all selected goals for that level are visible
    Object.keys(selectedGoalsByLevel).forEach(levelKey => {
      const level = levelKey as keyof typeof selectedGoalsByLevel;
      const selectedGoalsForLevel = selectedGoalsByLevel[level] || [];
      const currentVisibleGoals = goalsByLevel[level] || [];

      if (selectedGoalsForLevel.length > 0) {
        // Start with all selected goals for this level
        const visibleGoals = [...selectedGoalsForLevel];

        // Add non-selected goals from current visible goals to fill up to 3
        const nonSelectedVisibleGoals = currentVisibleGoals.filter(
          goal => !randomGoalIds.includes(goal.id),
        );

        // Fill remaining slots (up to 3 total)
        const remainingSlots = 3 - visibleGoals.length;
        if (remainingSlots > 0) {
          visibleGoals.push(
            ...nonSelectedVisibleGoals.slice(0, remainingSlots),
          );
        }

        updatedGoalsByLevel[level] = visibleGoals;
      }
    });

    // Fill remaining slots for levels that don't have selected goals
    Object.keys(updatedGoalsByLevel).forEach(levelKey => {
      const level = levelKey as keyof typeof updatedGoalsByLevel;
      if (updatedGoalsByLevel[level]?.length === 0) {
        // No selected goals for this level, keep current visible goals
        updatedGoalsByLevel[level] = [...(goalsByLevel[level] || [])];
      }

      // Ensure we have 3 goals visible for each level
      const levelGoals = allGoals.filter(goal => goal.level === level);
      const currentGoals = updatedGoalsByLevel[level] || [];
      const currentCount = currentGoals.length;
      if (currentCount < 3) {
        const additionalGoals = levelGoals
          .filter(goal => !currentGoals.find(g => g.id === goal.id))
          .slice(0, 3 - currentCount);
        updatedGoalsByLevel[level] = [...currentGoals, ...additionalGoals];
      }
    });

    setGoalsByLevel(updatedGoalsByLevel);
    setSelectedGoals(randomGoalIds);
  };

  const clearAllGoals = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals([]);
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const MAX_GOALS = 3;

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
  }, [fadeAnim, slideAnim]);

  // Initialize goals by level on component mount
  useEffect(() => {
    const allGoals = getPositionGoals();

    // Show only 3 goals at a time for each difficulty, but include all selected goals
    const selectedGoalsSet = new Set(selectedGoals);
    
    const getGoalsForLevel = (level: 'rookie' | 'pro' | 'veteran') => {
      const levelGoals = allGoals.filter(goal => goal.level === level);
      const selectedLevelGoals = levelGoals.filter(goal => selectedGoalsSet.has(goal.id));
      const unselectedLevelGoals = levelGoals.filter(goal => !selectedGoalsSet.has(goal.id));
      
      // Always show selected goals + up to 3 total
      return [...selectedLevelGoals, ...unselectedLevelGoals.slice(0, Math.max(0, 3 - selectedLevelGoals.length))];
    };

    setGoalsByLevel({
      rookie: getGoalsForLevel('rookie'),
      pro: getGoalsForLevel('pro'),
      veteran: getGoalsForLevel('veteran'),
    });
  }, [getPositionGoals, selectedGoals]);

  const getGoalsForLevel = (level: string): Goal[] => {
    return goalsByLevel[level] || [];
  };

  const isValid = selectedGoals.length > 0;

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        // Deselecting - light haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev.filter(id => id !== goalId);
      } else if (prev.length < MAX_GOALS) {
        // Selecting - medium haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return [...prev, goalId];
      }
      return prev;
    });
  };

  const toggleSection = (level: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const shuffleGoalsForLevel = (level: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get all position-specific goals for this level
    const allGoals = getPositionGoals();
    const allLevelGoals = allGoals.filter(goal => goal.level === level);

    if (allLevelGoals.length === 0) {
      return;
    }

    // Shuffle and show 3 different goals
    const shuffledGoals = [...allLevelGoals]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Update the goals display
    setGoalsByLevel((prev: Record<string, Goal[]>) => ({
      ...prev,
      [level]: shuffledGoals,
    }));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'rookie':
        return '#10B981'; // Green
      case 'pro':
        return '#F59E0B'; // Orange
      case 'veteran':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getTrackingHint = (trackingType: string) => {
    return trackingType === 'automatic'
      ? 'Updates automatically from game stats'
      : 'Track progress manually in recruiting tab';
  };

  const getButtonText = (count: number) => {
    if (count === 0) {
      return 'Select Your Goals';
    }
    if (count === 1) {
      return 'Continue with 1 Goal';
    }
    if (count === 2) {
      return 'Continue with 2 Goals';
    }
    return `Continue with ${count} Goals`;
  };

  const renderGoalSection = (title: string, goals: Goal[], level: string) => {
    if (goals.length === 0) {
      return null;
    }

    const levelColor = getLevelColor(level);
    const isExpanded = expandedSections[level];

    return (
      <View style={styles.goalSection}>
        <TouchableOpacity
          style={styles.goalSectionHeader}
          onPress={() => toggleSection(level)}
        >
          <View style={styles.goalSectionTitleContainer}>
            <View
              style={[styles.levelIndicator, { backgroundColor: levelColor }]}
            />
            <Text style={styles.goalSectionTitle}>{title}</Text>
            <Text style={styles.goalSectionCount}>({goals.length})</Text>
          </View>
          <View style={styles.goalSectionActions}>
            <TouchableOpacity
              style={styles.shuffleIconButton}
              onPress={e => {
                e.stopPropagation();
                shuffleGoalsForLevel(level);
              }}
            >
              <Ionicons name="shuffle" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.goalSectionContent}>
            {goals.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoals.includes(goal.id) && styles.goalCardSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  toggleGoalSelection(goal.id);
                }}
              >
                <View style={styles.goalCardContent}>
                  <View style={styles.goalCardHeader}>
                    <View style={styles.goalCardTitleContainer}>
                      <Text
                        style={[
                          styles.goalCardTitle,
                          selectedGoals.includes(goal.id) &&
                            styles.goalCardTitleSelected,
                        ]}
                      >
                        {goal.title}
                      </Text>
                      <Text
                        style={[
                          styles.goalCardTarget,
                          selectedGoals.includes(goal.id) &&
                            styles.goalCardTargetSelected,
                        ]}
                      >
                        Target: {goal.target}
                      </Text>
                    </View>
                    {selectedGoals.includes(goal.id) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.white}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.goalCardHint,
                      selectedGoals.includes(goal.id) &&
                        styles.goalCardHintSelected,
                    ]}
                  >
                    {getTrackingHint(goal.trackingType)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      return;
    }

    // Success haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Save goals to user profile if authenticated
      if (isAuthenticated && user) {
        await updateUser({
          goals: {
            ...user.goals,
            improvementAreas: selectedGoals,
          },
        });
      }

      // Add XP for completing goals selection
      if (selectedGoals.length >= 3) {
        addXP(50, 'Goals Selection Complete');
      }

      navigation.navigate('Review', {
        ...route.params,
        goals: selectedGoals,
      });
    } catch (error) {
      console.error('Error saving goals:', error);
      // Still navigate even if save fails
      navigation.navigate('Review', {
        ...route.params,
        goals: selectedGoals,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
            bounces={true}
            scrollEventThrottle={16}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Image
                source={require('../../../../assets/logos/logoBlack.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>
                Lock in Your {getPositionDisplayName()} Season Targets
              </Text>
              <Text style={styles.subtitle}>
                Pick up to 3 goals. Track progress automatically after every
                game.
              </Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {selectedGoals.length} of {MAX_GOALS} goals selected
                </Text>
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.inspireMeButton}
                onPress={inspireMeAutoSelect}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.inspireMeGradient}
                >
                  <Ionicons
                    name="shuffle"
                    size={20}
                    color={theme.colors.white}
                  />
                  <Text style={styles.inspireMeText}>Inspire Me</Text>
                </LinearGradient>
              </TouchableOpacity>

              {selectedGoals.length > 0 && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={clearAllGoals}
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.actionHint}>
                {selectedGoals.length === 0
                  ? 'Let us pick 3 random goals from our library to get you started'
                  : `${selectedGoals.length} of ${MAX_GOALS} goals selected`}
              </Text>
            </View>

            {/* Selected Goals Display */}
            {selectedGoals.length > 0 && (
              <View style={styles.selectedGoalsContainer}>
                <Text style={styles.selectedGoalsTitle}>
                  Your Selected Goals:
                </Text>
                <View style={styles.selectedGoalsList}>
                  {selectedGoals.map(goalId => {
                    const allGoals = getPositionGoals();
                    const goal = allGoals.find(g => g.id === goalId);
                    if (!goal) {
                      return null;
                    }

                    const levelColor = getLevelColor(goal.level);
                    const levelLabel =
                      goal.level.charAt(0).toUpperCase() + goal.level.slice(1);

                    return (
                      <View key={goalId} style={styles.selectedGoalItem}>
                        <View
                          style={[
                            styles.selectedGoalBadge,
                            { backgroundColor: levelColor },
                          ]}
                        >
                          <Text style={styles.selectedGoalBadgeText}>
                            {levelLabel}
                          </Text>
                        </View>
                        <Text style={styles.selectedGoalTitle}>
                          {goal.title}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Dropdown Goal Sections by Difficulty */}
            <View style={styles.goalSectionsContainer}>
              {renderGoalSection(
                'Rookie Goals',
                getGoalsForLevel('rookie'),
                'rookie',
              )}
              {renderGoalSection('Pro Goals', getGoalsForLevel('pro'), 'pro')}
              {renderGoalSection(
                'Veteran Goals',
                getGoalsForLevel('veteran'),
                'veteran',
              )}
            </View>

            {/* Footer with reassurance copy */}
            {selectedGoals.length > 0 && (
              <View style={styles.footerSection}>
                <Text style={styles.footerText}>
                  You can change goals anytime—your progress stays saved.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              transform: [{ scale: bounceAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, !isValid && styles.disabledButton]}
            onPress={handleContinue}
            disabled={!isValid}
          >
            <LinearGradient
              colors={
                isValid
                  ? [theme.colors.primary, theme.colors.primaryDark]
                  : [theme.colors.neutral300, theme.colors.neutral400]
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
                {getButtonText(selectedGoals.length)}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isValid ? theme.colors.white : theme.colors.textTertiary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
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
    paddingTop: 8,
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: theme.colors.neutral50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    overflow: 'hidden',
    marginBottom: 16,
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
  selectedGoalCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  disabledGoalCard: {
    opacity: 0.5,
    backgroundColor: theme.colors.neutral50,
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
    flex: 1,
    flexShrink: 1,
  },
  selectedGoalTitleWhite: {
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
  footerSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 34,
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
  selectedGoalChip: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  selectedGoalChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  // Goal Card Enhancements
  goalIconContainer: {
    marginRight: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  goalTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  selectedGoalTarget: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  disabledGoalTarget: {
    color: theme.colors.textTertiary,
  },
  trackingHint: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  selectedTrackingHint: {
    color: theme.colors.white,
    opacity: 0.8,
  },
  disabledTrackingHint: {
    color: theme.colors.textTertiary,
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral50,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral200,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeFilterChipText: {
    color: theme.colors.white,
  },
  // Dropdown Goal Sections
  goalSectionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  goalSection: {
    backgroundColor: theme.colors.neutral50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    marginBottom: 16,
    overflow: 'hidden',
  },
  goalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.white,
  },
  goalSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  goalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  goalSectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  goalSectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shuffleIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '10',
  },
  goalSectionContent: {
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
  goalCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  goalCardContent: {
    flex: 1,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  goalCardTitleContainer: {
    flex: 1,
  },
  goalCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  goalCardTitleSelected: {
    color: theme.colors.white,
  },
  goalCardTarget: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  goalCardTargetSelected: {
    color: theme.colors.white,
    opacity: 0.9,
  },
  goalCardHint: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  goalCardHintSelected: {
    color: theme.colors.white,
    opacity: 0.8,
  },
  // Action Buttons
  actionButtonsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  inspireMeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 8,
  },
  inspireMeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  inspireMeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  clearAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral300,
    backgroundColor: theme.colors.white,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  actionHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Selected Goals Display
  selectedGoalsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.neutral50,
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedGoalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  selectedGoalsList: {
    gap: 8,
  },
  selectedGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedGoalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedGoalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  selectedGoalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    flex: 1,
  },
});

export default GoalsScreen;
