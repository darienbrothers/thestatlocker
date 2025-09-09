import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '@/components/gamification';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';
import {
  SEASON_GOALS as ImportedSeasonGoals,
  RECRUITING_GOALS,
  PERSONAL_GOALS,
  convertToUserGoal,
  type Goal,
  type GoalCategory,
} from '@/data/goals';

type GoalsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Goals'
>;
type GoalsScreenRouteProp = RouteProp<RootStackParamList, 'Goals'>;

interface GoalsScreenProps {
  navigation: GoalsScreenNavigationProp;
  route: GoalsScreenRouteProp & {
    params?: {
      returnTo?: string;
      [key: string]: any;
    };
  };
}

// Goal selection state interface
interface SelectedGoalData {
  goal: Goal;
  category: GoalCategory;
}

// Helper functions for category display
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    scoring: 'football',
    assists: 'people',
    defense: 'shield',
    saves: 'hand-right',
    faceoffs: 'refresh',
    ground_balls: 'basketball',
    turnovers: 'hand-left',
    accuracy: 'target',
  };
  return iconMap[category] || 'star';
};

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    scoring: theme.colors.error,
    assists: theme.colors.success,
    defense: theme.colors.primary,
    saves: theme.colors.info,
    faceoffs: theme.colors.warning,
    ground_balls: '#8B5CF6', // Purple
    turnovers: '#F59E0B', // Amber
    accuracy: '#10B981', // Emerald
  };
  return colorMap[category] || theme.colors.primary;
};

export default function GoalsScreen({ navigation, route }: GoalsScreenProps) {
  const { gender, position } = route.params || {};

  // Goal selection state - now supports multiple categories
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoalData[]>([]);
  const [showCustomGoalModal, setShowCustomGoalModal] = useState(false);
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalDescription, setCustomGoalDescription] = useState('');
  const [customGoalCategory, setCustomGoalCategory] = useState('scoring');

  // Accordion section states
  const [expandedSections, setExpandedSections] = useState({
    season: true,
    recruiting: false,
    personal: false,
  });

  // Animation states
  const [progressAnim] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));
  const [modalAnim] = useState(new Animated.Value(0));

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const goalCardAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const sectionAnimations = useRef({
    season: new Animated.Value(1),
    recruiting: new Animated.Value(0),
    personal: new Animated.Value(0),
  }).current;

  // Get position-specific season goals
  const genderKey = gender as 'boys' | 'girls';
  const positionKey = position as keyof typeof ImportedSeasonGoals.boys;
  const seasonGoals = ImportedSeasonGoals[genderKey]?.[positionKey] || [];

  // Goals are now directly accessed from the imported arrays

  const handleGoalToggle = (goal: Goal, category: GoalCategory) => {
    setSelectedGoals(prev => {
      const existingIndex = prev.findIndex(
        selected => selected.goal.id === goal.id,
      );
      let newGoals;

      if (existingIndex >= 0) {
        // Remove goal if already selected
        newGoals = prev.filter((_, index) => index !== existingIndex);
      } else {
        // Check if category already has 3 goals
        const categoryGoals = prev.filter(
          selected => selected.category === category,
        );
        if (categoryGoals.length < 3) {
          // Add goal if category under limit
          newGoals = [...prev, { goal, category }];
        } else {
          // Category at limit, don't add
          return prev;
        }
      }

      // Add haptic feedback on selection
      if (newGoals.length !== prev.length) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Animate progress bar with spring effect
      Animated.spring(progressAnim, {
        toValue: newGoals.length,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }).start();

      return newGoals;
    });
  };

  const isGoalSelected = (goalId: string) =>
    selectedGoals.some(selected => selected.goal.id === goalId);
  const canSelectMoreInCategory = (category: GoalCategory) => {
    const categoryGoals = selectedGoals.filter(
      selected => selected.category === category,
    );
    return categoryGoals.length < 3;
  };
  const isComplete = selectedGoals.length >= 1; // Allow 1+ goals from any category

  // Get selection counts per category
  const getSelectionCounts = () => {
    const counts = { season: 0, recruiting: 0, personal: 0 };
    selectedGoals.forEach(selected => {
      counts[selected.category]++;
    });
    return counts;
  };

  const selectionCounts = getSelectionCounts();

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

  // Initialize goal card animations for all goal types
  useEffect(() => {
    const allGoals = [...seasonGoals, ...RECRUITING_GOALS, ...PERSONAL_GOALS];

    allGoals.forEach(goal => {
      if (!goalCardAnims[goal.id]) {
        goalCardAnims[goal.id] = new Animated.Value(1);
      }
    });
  }, [seasonGoals]);

  // Animate goal selection
  useEffect(() => {
    selectedGoals.forEach(({ goal }) => {
      const anim = goalCardAnims[goal.id];
      if (anim) {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [selectedGoals]);

  const handleContinue = () => {
    if (selectedGoals.length >= 1) {
      // Trigger confetti animation
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate after a short delay to show confetti
      setTimeout(() => {
        // Convert selected goals to UserGoal format
        const selectedGoalObjects = selectedGoals.map(({ goal, category }) =>
          convertToUserGoal(goal, category),
        );

        const { returnTo, ...otherParams } = route.params || {};
        if (returnTo === 'Review') {
          navigation.navigate('Review', {
            ...otherParams,
            goals: selectedGoalObjects,
          });
        } else {
          navigation.navigate('Review', {
            ...route.params,
            goals: selectedGoalObjects,
          });
        }
      }, 800);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    const isExpanded = expandedSections[section];
    setExpandedSections(prev => ({
      ...prev,
      [section]: !isExpanded,
    }));

    Animated.timing(sectionAnimations[section], {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSaveCustomGoal = () => {
    if (!customGoalTitle.trim() || !customGoalDescription.trim()) {
      return;
    }

    // For now, we'll skip custom goals and focus on the main three categories
    // This can be implemented later if needed

    setCustomGoalTitle('');
    setCustomGoalDescription('');
    setCustomGoalCategory('scoring');

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleCloseCustomGoalModal();
  };

  const handleCloseCustomGoalModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCustomGoalModal(false);
    });
  };

  const getCustomGoalCategoryOptions = () => [
    { value: 'scoring', label: 'Scoring' },
    { value: 'assists', label: 'Playmaking' },
    { value: 'defense', label: 'Defense' },
    { value: 'saves', label: 'Saves' },
    { value: 'faceoffs', label: 'Face-offs' },
    { value: 'ground_balls', label: 'Ground Balls' },
    { value: 'turnovers', label: 'Turnovers' },
    { value: 'accuracy', label: 'Accuracy' },
  ];

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
                },
              ]}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Image
                  source={require('../../../../assets/logos/logoBlack.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>
                  {position ? `Your ${position} Game Plan` : 'Season Goals'}
                </Text>
                <Text style={styles.subtitle}>
                  Build your personalized game plan. Choose 1-3 goals from each
                  category that matter most to your development.
                </Text>

                {/* Enhanced Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1, 2, 3],
                            outputRange: ['0%', '33%', '66%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {selectedGoals.length === 0 &&
                      'Choose goals from any category to get started'}
                    {selectedGoals.length > 0 &&
                      selectedGoals.length < 3 &&
                      `${selectedGoals.length} goal${selectedGoals.length > 1 ? 's' : ''} selected • Season: ${selectionCounts.season} • Recruiting: ${selectionCounts.recruiting} • Personal: ${selectionCounts.personal}`}
                    {selectedGoals.length >= 3 &&
                      `${selectedGoals.length} goals selected • Season: ${selectionCounts.season} • Recruiting: ${selectionCounts.recruiting} • Personal: ${selectionCounts.personal}`}
                  </Text>

                  {/* Clear All Button */}
                  {selectedGoals.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setSelectedGoals([])}
                    >
                      <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Three-Category Goal Selection */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="trophy"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Choose Your Goals</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Choose up to 3 goals from each category. Mix and match to
                  create your perfect development plan.
                </Text>

                {/* Season Goals Accordion */}
                <View style={styles.accordionSection}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleSection('season')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.accordionHeaderContent}>
                      <View
                        style={[
                          styles.accordionIcon,
                          { backgroundColor: '#EF4444' },
                        ]}
                      >
                        <Ionicons
                          name="trophy"
                          size={20}
                          color={theme.colors.white}
                        />
                      </View>
                      <View style={styles.accordionHeaderText}>
                        <Text style={styles.accordionTitle}>
                          Season Goals{' '}
                          {selectionCounts.season > 0 &&
                            `(${selectionCounts.season}/3)`}
                        </Text>
                        <Text style={styles.accordionSubtitle}>
                          {position
                            ? `${position}-specific performance goals`
                            : 'Performance goals tracked through game stats'}
                        </Text>
                      </View>
                    </View>
                    <Animated.View
                      style={[
                        styles.accordionChevron,
                        {
                          transform: [
                            {
                              rotate: sectionAnimations.season.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '180deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  <Animated.View
                    style={[
                      styles.accordionContent,
                      {
                        maxHeight: sectionAnimations.season.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 600],
                        }),
                        opacity: sectionAnimations.season,
                      },
                    ]}
                  >
                    <ScrollView
                      style={styles.accordionScrollView}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      <View style={styles.goalCardsContainer}>
                        {seasonGoals.slice(0, 12).map((goal: Goal) => {
                          const isSelected = isGoalSelected(goal.id);
                          const isDisabled =
                            !canSelectMoreInCategory('season') && !isSelected;

                          return (
                            <Animated.View
                              key={goal.id}
                              style={{
                                transform: [
                                  {
                                    scale: goalCardAnims[goal.id] || 1,
                                  },
                                ],
                              }}
                            >
                              <TouchableOpacity
                                style={[
                                  styles.goalSelectionCard,
                                  isSelected &&
                                    styles.goalSelectionCardSelected,
                                  isDisabled &&
                                    styles.goalSelectionCardDisabled,
                                ]}
                                onPress={() => handleGoalToggle(goal, 'season')}
                                activeOpacity={isDisabled ? 1 : 0.8}
                                disabled={isDisabled}
                              >
                                <LinearGradient
                                  colors={
                                    isSelected
                                      ? ['#EF4444', '#EF4444DD']
                                      : [
                                          theme.colors.white,
                                          theme.colors.neutral50,
                                        ]
                                  }
                                  style={styles.goalCardGradient}
                                >
                                  <View style={styles.goalCardHeader}>
                                    <View
                                      style={[
                                        styles.goalCategoryBadge,
                                        { backgroundColor: '#EF4444' },
                                      ]}
                                    >
                                      <Text
                                        style={styles.goalCategoryBadgeText}
                                      >
                                        SEASON
                                      </Text>
                                    </View>
                                    {isSelected && (
                                      <Animated.View
                                        style={styles.checkmarkContainer}
                                      >
                                        <Ionicons
                                          name="checkmark-circle"
                                          size={24}
                                          color={theme.colors.white}
                                        />
                                      </Animated.View>
                                    )}
                                  </View>
                                  <Text
                                    style={[
                                      styles.goalCardTitle,
                                      isSelected &&
                                        styles.goalCardTitleSelected,
                                    ]}
                                  >
                                    {goal.title}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.goalCardDescription,
                                      isSelected &&
                                        styles.goalCardDescriptionSelected,
                                    ]}
                                  >
                                    {goal.description}
                                  </Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            </Animated.View>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </Animated.View>
                </View>

                {/* Recruiting Goals Accordion */}
                <View style={styles.accordionSection}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleSection('recruiting')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.accordionHeaderContent}>
                      <View
                        style={[
                          styles.accordionIcon,
                          { backgroundColor: '#3B82F6' },
                        ]}
                      >
                        <Ionicons
                          name="school"
                          size={20}
                          color={theme.colors.white}
                        />
                      </View>
                      <View style={styles.accordionHeaderText}>
                        <Text style={styles.accordionTitle}>
                          Recruiting Goals{' '}
                          {selectionCounts.recruiting > 0 &&
                            `(${selectionCounts.recruiting}/3)`}
                        </Text>
                        <Text style={styles.accordionSubtitle}>
                          College preparation and visibility milestones
                        </Text>
                      </View>
                    </View>
                    <Animated.View
                      style={[
                        styles.accordionChevron,
                        {
                          transform: [
                            {
                              rotate: sectionAnimations.recruiting.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '180deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  <Animated.View
                    style={[
                      styles.accordionContent,
                      {
                        maxHeight: sectionAnimations.recruiting.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 800],
                        }),
                        opacity: sectionAnimations.recruiting,
                      },
                    ]}
                  >
                    <View style={styles.goalCardsContainer}>
                      {RECRUITING_GOALS.slice(0, 12).map(goal => {
                        const isSelected = isGoalSelected(goal.id);
                        const isDisabled =
                          !canSelectMoreInCategory('recruiting') && !isSelected;

                        return (
                          <Animated.View
                            key={goal.id}
                            style={{
                              transform: [
                                {
                                  scale: goalCardAnims[goal.id] || 1,
                                },
                              ],
                            }}
                          >
                            <TouchableOpacity
                              style={[
                                styles.goalSelectionCard,
                                isSelected && styles.goalSelectionCardSelected,
                                isDisabled && styles.goalSelectionCardDisabled,
                              ]}
                              onPress={() =>
                                handleGoalToggle(goal, 'recruiting')
                              }
                              activeOpacity={isDisabled ? 1 : 0.8}
                              disabled={isDisabled}
                            >
                              <LinearGradient
                                colors={
                                  isSelected
                                    ? ['#3B82F6', '#3B82F6DD']
                                    : [
                                        theme.colors.white,
                                        theme.colors.neutral50,
                                      ]
                                }
                                style={styles.goalCardGradient}
                              >
                                <View style={styles.goalCardHeader}>
                                  <View
                                    style={[
                                      styles.goalCategoryBadge,
                                      { backgroundColor: '#3B82F6' },
                                    ]}
                                  >
                                    <Text style={styles.goalCategoryBadgeText}>
                                      RECRUITING
                                    </Text>
                                  </View>
                                  {isSelected && (
                                    <Animated.View
                                      style={styles.checkmarkContainer}
                                    >
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={24}
                                        color={theme.colors.white}
                                      />
                                    </Animated.View>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.goalCardTitle,
                                    isSelected && styles.goalCardTitleSelected,
                                  ]}
                                >
                                  {goal.title}
                                </Text>
                                <Text
                                  style={[
                                    styles.goalCardDescription,
                                    isSelected &&
                                      styles.goalCardDescriptionSelected,
                                  ]}
                                >
                                  {goal.description}
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                  </Animated.View>
                </View>

                {/* Personal Development Goals Accordion */}
                <View style={styles.accordionSection}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleSection('personal')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.accordionHeaderContent}>
                      <View
                        style={[
                          styles.accordionIcon,
                          { backgroundColor: '#10B981' },
                        ]}
                      >
                        <Ionicons
                          name="fitness"
                          size={20}
                          color={theme.colors.white}
                        />
                      </View>
                      <View style={styles.accordionHeaderText}>
                        <Text style={styles.accordionTitle}>
                          Personal Development{' '}
                          {selectionCounts.personal > 0 &&
                            `(${selectionCounts.personal}/3)`}
                        </Text>
                        <Text style={styles.accordionSubtitle}>
                          Skills, training, and improvement goals
                        </Text>
                      </View>
                    </View>
                    <Animated.View
                      style={[
                        styles.accordionChevron,
                        {
                          transform: [
                            {
                              rotate: sectionAnimations.personal.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '180deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  <Animated.View
                    style={[
                      styles.accordionContent,
                      {
                        maxHeight: sectionAnimations.personal.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 800],
                        }),
                        opacity: sectionAnimations.personal,
                      },
                    ]}
                  >
                    <View style={styles.goalCardsContainer}>
                      {PERSONAL_GOALS.slice(0, 12).map(goal => {
                        const isSelected = isGoalSelected(goal.id);
                        const isDisabled =
                          !canSelectMoreInCategory('personal') && !isSelected;

                        return (
                          <Animated.View
                            key={goal.id}
                            style={{
                              transform: [
                                {
                                  scale: goalCardAnims[goal.id] || 1,
                                },
                              ],
                            }}
                          >
                            <TouchableOpacity
                              style={[
                                styles.goalSelectionCard,
                                isSelected && styles.goalSelectionCardSelected,
                                isDisabled && styles.goalSelectionCardDisabled,
                              ]}
                              onPress={() => handleGoalToggle(goal, 'personal')}
                              activeOpacity={isDisabled ? 1 : 0.8}
                              disabled={isDisabled}
                            >
                              <LinearGradient
                                colors={
                                  isSelected
                                    ? ['#10B981', '#10B981DD']
                                    : [
                                        theme.colors.white,
                                        theme.colors.neutral50,
                                      ]
                                }
                                style={styles.goalCardGradient}
                              >
                                <View style={styles.goalCardHeader}>
                                  <View
                                    style={[
                                      styles.goalCategoryBadge,
                                      { backgroundColor: '#10B981' },
                                    ]}
                                  >
                                    <Text style={styles.goalCategoryBadgeText}>
                                      PERSONAL
                                    </Text>
                                  </View>
                                  {isSelected && (
                                    <Animated.View
                                      style={styles.checkmarkContainer}
                                    >
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={24}
                                        color={theme.colors.white}
                                      />
                                    </Animated.View>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.goalCardTitle,
                                    isSelected && styles.goalCardTitleSelected,
                                  ]}
                                >
                                  {goal.title}
                                </Text>
                                <Text
                                  style={[
                                    styles.goalCardDescription,
                                    isSelected &&
                                      styles.goalCardDescriptionSelected,
                                  ]}
                                >
                                  {goal.description}
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                  </Animated.View>
                </View>
              </View>

              {/* Enhanced Continue Button with Confetti */}
              <View style={styles.buttonContainer}>
                {/* Enhanced Confetti particles */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.confettiParticle,
                      {
                        left: `${10 + i * 3.5}%`,
                        backgroundColor:
                          i % 4 === 0
                            ? theme.colors.primary
                            : i % 4 === 1
                              ? theme.colors.success
                              : i % 4 === 2
                                ? theme.colors.warning
                                : theme.colors.info,
                        transform: [
                          {
                            translateY: confettiAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -150 - Math.random() * 100],
                            }),
                          },
                          {
                            translateX: confettiAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, (Math.random() - 0.5) * 100],
                            }),
                          },
                          {
                            rotate: confettiAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [
                                '0deg',
                                `${360 + Math.random() * 360}deg`,
                              ],
                            }),
                          },
                        ],
                        opacity: confettiAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1, 0],
                        }),
                      },
                    ]}
                  />
                ))}

                <Animated.View
                  style={{
                    transform: [{ scale: bounceAnim }],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.continueButton,
                      !isComplete && styles.disabledButton,
                    ]}
                    onPress={handleContinue}
                    activeOpacity={isComplete ? 0.9 : 1}
                    disabled={!isComplete}
                  >
                    <LinearGradient
                      colors={
                        isComplete
                          ? [theme.colors.primary, theme.colors.primary + 'DD']
                          : [theme.colors.neutral300, theme.colors.neutral400]
                      }
                      style={styles.continueButtonGradient}
                    >
                      <Text
                        style={[
                          styles.continueButtonText,
                          !isComplete && styles.continueButtonTextDisabled,
                        ]}
                      >
                        {selectedGoals.length === 0 &&
                          'Choose your goals to continue'}
                        {selectedGoals.length === 1 && 'Continue with 1 goal'}
                        {selectedGoals.length >= 2 &&
                          selectedGoals.length <= 6 &&
                          `Continue with ${selectedGoals.length} goals`}
                        {selectedGoals.length > 6 && 'Build My Game Plan'}
                      </Text>
                      {isComplete && (
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color={theme.colors.white}
                        />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Custom Goal Creation Modal */}
      <Modal
        visible={showCustomGoalModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseCustomGoalModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseCustomGoalModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    opacity: modalAnim,
                    transform: [
                      {
                        scale: modalAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create Custom Goal</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={handleCloseCustomGoalModal}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>Goal Title *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={customGoalTitle}
                      onChangeText={setCustomGoalTitle}
                      placeholder="e.g., Score 15+ goals this season"
                      placeholderTextColor={theme.colors.textTertiary}
                      maxLength={60}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>Description *</Text>
                    <TextInput
                      style={[styles.modalInput, styles.modalTextArea]}
                      value={customGoalDescription}
                      onChangeText={setCustomGoalDescription}
                      placeholder="Describe what success looks like and why this goal matters to you..."
                      placeholderTextColor={theme.colors.textTertiary}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={150}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>Category</Text>
                    <View style={styles.categorySelector}>
                      {getCustomGoalCategoryOptions().map(
                        (option: { value: string; label: string }) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.categorySelectorButton,
                              customGoalCategory === option.value &&
                                styles.categorySelectorButtonActive,
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                              );
                              setCustomGoalCategory(option.value);
                            }}
                          >
                            <View
                              style={[
                                styles.categorySelectorIcon,
                                {
                                  backgroundColor: getCategoryColor(
                                    option.value,
                                  ),
                                },
                                customGoalCategory === option.value &&
                                  styles.categorySelectorIconActive,
                              ]}
                            >
                              <Ionicons
                                name={getCategoryIcon(option.value) as any}
                                size={16}
                                color={theme.colors.white}
                              />
                            </View>
                            <Text
                              style={[
                                styles.categorySelectorText,
                                customGoalCategory === option.value &&
                                  styles.categorySelectorTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleCloseCustomGoalModal}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalSaveButton,
                      (!customGoalTitle.trim() ||
                        !customGoalDescription.trim()) &&
                        styles.modalSaveButtonDisabled,
                    ]}
                    onPress={handleSaveCustomGoal}
                    disabled={
                      !customGoalTitle.trim() || !customGoalDescription.trim()
                    }
                  >
                    <Text
                      style={[
                        styles.modalSaveButtonText,
                        (!customGoalTitle.trim() ||
                          !customGoalDescription.trim()) &&
                          styles.modalSaveButtonTextDisabled,
                      ]}
                    >
                      Create Goal
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  logo: {
    width: 120,
    height: 40,
    alignSelf: 'center',
    marginBottom: 20,
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
    textAlign: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 32,
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
  // Enhanced Progress Styles
  clearButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  // Category Styles
  categorySection: {
    marginBottom: 24,
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingLeft: 16,
    paddingVertical: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
  },
  // Enhanced Goal Card Styles
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 2,
  },
  // Enhanced Button Styles
  buttonContainer: {
    position: 'relative',
    marginTop: 32,
  },
  confettiParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 20,
  },
  // Add Custom Goal Button Styles
  addCustomGoalButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    padding: 20,
    marginTop: 16,
  },
  addCustomGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCustomGoalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addCustomGoalText: {
    flex: 1,
  },
  addCustomGoalTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  addCustomGoalSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral200,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: theme.colors.neutral100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral100,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
  },
  categorySelectorButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  categorySelectorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  categorySelectorIconActive: {
    transform: [{ scale: 1.1 }],
  },
  categorySelectorText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  categorySelectorTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral200,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.neutral100,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: theme.colors.neutral300,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.white,
  },
  modalSaveButtonTextDisabled: {
    color: theme.colors.textTertiary,
  },
  // Accordion Styles
  accordionSection: {
    marginBottom: 16,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accordionHeaderText: {
    flex: 1,
  },
  accordionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  accordionSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  accordionChevron: {
    marginLeft: 12,
  },
  accordionContent: {
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Goal Category Badge
  goalCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  goalCategoryBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  accordionScrollView: {
    flex: 1,
  },
});
