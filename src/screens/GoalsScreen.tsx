import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '../components/gamification';
import { XPRewardAnimation } from '../components/gamification/XPRewardAnimation';
import { useGamificationStore } from '../stores/gamificationStore';
import Slider from '@react-native-community/slider';

interface GoalsScreenProps {
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
    } 
  };
}

interface Goal {
  key: string;
  name: string;
  min: number;
  max: number;
  default: number;
  unit: string;
}

interface PositionData {
  [key: string]: Goal[];
}

interface GenderPositions {
  boys: PositionData;
  girls: PositionData;
}

interface PositionStrengthsData {
  [key: string]: string[];
}

interface GenderStrengths {
  boys: PositionStrengthsData;
  girls: PositionStrengthsData;
}

interface PositionGrowthAreasData {
  [key: string]: string[];
}

interface GenderGrowthAreas {
  boys: PositionGrowthAreasData;
  girls: PositionGrowthAreasData;
}

// Position-specific goals data
const POSITION_GOALS: GenderPositions = {
  boys: {
    Attack: [
      { key: 'goals_per_game', name: 'Goals per Game', min: 0.5, max: 4, default: 2, unit: 'goals' },
      { key: 'assists_per_game', name: 'Assists per Game', min: 0.5, max: 3, default: 1.5, unit: 'assists' },
      { key: 'shooting_percentage', name: 'Shooting %', min: 30, max: 70, default: 45, unit: '%' },
    ],
    Midfield: [
      { key: 'ground_balls_per_game', name: 'Ground Balls per Game', min: 2, max: 8, default: 4, unit: 'GBs' },
      { key: 'goals_per_game', name: 'Goals per Game', min: 0.5, max: 3, default: 1.5, unit: 'goals' },
      { key: 'faceoff_percentage', name: 'Faceoff Win %', min: 40, max: 80, default: 55, unit: '%' },
    ],
    Defense: [
      { key: 'caused_turnovers_per_game', name: 'Caused TOs per Game', min: 1, max: 4, default: 2, unit: 'CTs' },
      { key: 'ground_balls_per_game', name: 'Ground Balls per Game', min: 2, max: 6, default: 3, unit: 'GBs' },
      { key: 'goals_allowed_per_game', name: 'Goals Allowed (max)', min: 1, max: 5, default: 2, unit: 'goals' },
    ],
    Goalie: [
      { key: 'save_percentage', name: 'Save Percentage', min: 50, max: 80, default: 65, unit: '%' },
      { key: 'goals_allowed_per_game', name: 'Goals Allowed (max)', min: 4, max: 12, default: 8, unit: 'goals' },
      { key: 'clear_percentage', name: 'Clear Success %', min: 70, max: 95, default: 80, unit: '%' },
    ],
    LSM: [
      { key: 'caused_turnovers_per_game', name: 'Caused TOs per Game', min: 1, max: 4, default: 2, unit: 'CTs' },
      { key: 'ground_balls_per_game', name: 'Ground Balls per Game', min: 3, max: 7, default: 4, unit: 'GBs' },
      { key: 'goals_per_game', name: 'Goals per Game', min: 0.2, max: 1.5, default: 0.5, unit: 'goals' },
    ],
    FOGO: [
      { key: 'faceoff_percentage', name: 'Faceoff Win %', min: 50, max: 85, default: 65, unit: '%' },
      { key: 'ground_balls_per_game', name: 'Ground Balls per Game', min: 4, max: 10, default: 6, unit: 'GBs' },
      { key: 'clean_wins_percentage', name: 'Clean Win %', min: 30, max: 70, default: 45, unit: '%' },
    ],
  },
  girls: {
    Attack: [
      { key: 'goals_per_game', name: 'Goals per Game', min: 0.5, max: 4, default: 2, unit: 'goals' },
      { key: 'assists_per_game', name: 'Assists per Game', min: 0.5, max: 3, default: 1.5, unit: 'assists' },
      { key: 'shooting_percentage', name: 'Shooting %', min: 35, max: 75, default: 50, unit: '%' },
    ],
    Midfield: [
      { key: 'goals_per_game', name: 'Goals per Game', min: 0.5, max: 3, default: 1.5, unit: 'goals' },
      { key: 'assists_per_game', name: 'Assists per Game', min: 0.5, max: 2.5, default: 1.2, unit: 'assists' },
      { key: 'ground_balls_per_game', name: 'Ground Balls per Game', min: 2, max: 6, default: 3, unit: 'GBs' },
    ],
    Defense: [
      { key: 'caused_turnovers_per_game', name: 'Caused TOs per Game', min: 1, max: 4, default: 2, unit: 'CTs' },
      { key: 'ground_balls_per_game', name: 'Ground Balls per Game', min: 2, max: 6, default: 3, unit: 'GBs' },
      { key: 'interceptions_per_game', name: 'Interceptions per Game', min: 0.5, max: 3, default: 1.5, unit: 'INTs' },
    ],
    Goalie: [
      { key: 'save_percentage', name: 'Save Percentage', min: 45, max: 75, default: 60, unit: '%' },
      { key: 'goals_allowed_per_game', name: 'Goals Allowed (max)', min: 6, max: 15, default: 10, unit: 'goals' },
      { key: 'clear_percentage', name: 'Clear Success %', min: 65, max: 90, default: 75, unit: '%' },
    ],
  },
};

// Position-specific strengths and growth areas
const POSITION_STRENGTHS: GenderStrengths = {
  boys: {
    Attack: ['Shooting Accuracy', 'Dodging', 'Stick Protection', 'Field Vision', 'Finishing', 'Quick Release'],
    Midfield: ['Ground Balls', 'Transition', 'Faceoffs', 'Two-Way Play', 'Conditioning', 'Field Vision'],
    Defense: ['Defensive Positioning', 'Physicality', 'Communication', 'Stick Checks', 'Clearing', 'Sliding'],
    Goalie: ['Reaction Time', 'Positioning', 'Communication', 'Clearing', 'Mental Toughness', 'Hand-Eye Coordination'],
    LSM: ['Defensive Positioning', 'Transition Defense', 'Stick Checks', 'Ground Balls', 'Communication', 'Athleticism'],
    FOGO: ['Faceoff Technique', 'Quick Hands', 'Ground Balls', 'Wing Play', 'Conditioning', 'Mental Focus'],
  },
  girls: {
    Attack: ['Shooting Accuracy', 'Dodging', 'Stick Skills', 'Field Vision', 'Finishing', 'Free Position'],
    Midfield: ['Transition', 'Draw Controls', 'Two-Way Play', 'Conditioning', 'Field Vision', 'Passing'],
    Defense: ['Defensive Positioning', 'Interceptions', 'Communication', 'Marking', 'Clearing', 'Footwork'],
    Goalie: ['Reaction Time', 'Positioning', 'Communication', 'Clearing', 'Mental Toughness', 'Arc Movement'],
  },
};

const POSITION_GROWTH_AREAS: GenderGrowthAreas = {
  boys: {
    Attack: ['Off-Hand Development', 'Shooting Consistency', 'Decision Making', 'Physicality', 'Defensive Awareness'],
    Midfield: ['Faceoff Consistency', 'Defensive Positioning', 'Conditioning', 'Stick Protection', 'Leadership'],
    Defense: ['Footwork', 'Stick Skills', 'Communication', 'Clearing Under Pressure', 'Body Positioning'],
    Goalie: ['Arc Movement', 'Outlet Passing', 'Confidence', 'Reading Plays', 'Vocal Leadership'],
    LSM: ['Offensive Skills', 'Transition Offense', 'Stick Skills', 'Conditioning', 'Decision Making'],
    FOGO: ['Wing Play', 'Defensive Skills', 'Transition', 'Stick Skills', 'Game Awareness'],
  },
  girls: {
    Attack: ['Off-Hand Development', 'Decision Making', 'Physicality', 'Defensive Awareness', 'Free Position Conversion'],
    Midfield: ['Draw Control Consistency', 'Defensive Positioning', 'Conditioning', 'Stick Protection', 'Leadership'],
    Defense: ['Footwork', 'Stick Skills', 'Communication', 'Marking Consistency', 'Transition Offense'],
    Goalie: ['Arc Movement', 'Outlet Passing', 'Confidence', 'Reading Plays', 'Vocal Leadership'],
  },
};

export default function GoalsScreen({ navigation, route }: GoalsScreenProps) {
  const { 
    firstName, lastName, gender, position, graduationYear, schoolName, city, state, level,
    clubEnabled, clubOrgName, clubTeamName, clubCity, clubState 
  } = route.params || {};

  const [selectedGoals, setSelectedGoals] = useState<{[key: string]: number}>({});
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedGrowthAreas, setSelectedGrowthAreas] = useState<string[]>([]);
  const [showXPReward, setShowXPReward] = useState(false);
  const [hasCompletedStep, setHasCompletedStep] = useState(false);
  const { totalXP, addXP } = useGamificationStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const goalCardAnims = useRef<{[key: string]: Animated.Value}>({}).current;

  const positionGoals = gender && position ? POSITION_GOALS[gender][position] || [] : [];
  const positionStrengths = gender && position ? POSITION_STRENGTHS[gender][position] || [] : [];
  const positionGrowthAreas = gender && position ? POSITION_GROWTH_AREAS[gender][position] || [] : [];

  useEffect(() => {
    // Initialize default goals
    const defaultGoals: {[key: string]: number} = {};
    positionGoals.forEach(goal => {
      defaultGoals[goal.key] = goal.default;
      goalCardAnims[goal.key] = new Animated.Value(1);
    });
    setSelectedGoals(defaultGoals);
  }, [position, gender]);

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

  const handleGoalChange = (key: string, value: number) => {
    setSelectedGoals(prev => ({ ...prev, [key]: value }));
    
    // Animate the goal card
    const animValue = goalCardAnims[key] || (goalCardAnims[key] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(animValue, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handleStrengthToggle = (strength: string) => {
    setSelectedStrengths(prev => 
      prev.includes(strength) 
        ? prev.filter(s => s !== strength)
        : prev.length < 5 ? [...prev, strength] : prev
    );
  };

  const handleGrowthAreaToggle = (area: string) => {
    setSelectedGrowthAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : prev.length < 3 ? [...prev, area] : prev
    );
  };

  const handleContinue = () => {
    const hasGoals = Object.keys(selectedGoals).length > 0;
    const hasStrengths = selectedStrengths.length >= 2;
    const hasGrowthAreas = selectedGrowthAreas.length >= 1;

    if (hasGoals && hasStrengths && hasGrowthAreas && !hasCompletedStep) {
      setHasCompletedStep(true);
      
      // Convert goals to Goal[] format
      const goals = Object.entries(selectedGoals).map(([key, target]) => ({
        key,
        target
      }));
      
      addXP(50, 'Goals and development plan set!');
      setShowXPReward(true);
      
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
    
    const goals = Object.entries(selectedGoals).map(([key, target]) => ({
      key,
      target
    }));
    
    navigation.navigate('Review', {
      firstName, lastName, gender, position, graduationYear, schoolName, city, state, level,
      clubEnabled, clubOrgName, clubTeamName, clubCity, clubState,
      goals: selectedGoals,
      strengths: selectedStrengths,
      growthAreas: selectedGrowthAreas,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isValid = Object.keys(selectedGoals).length > 0 && selectedStrengths.length >= 2 && selectedGrowthAreas.length >= 1;

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingStepper 
        currentStep={5}
        totalSteps={8}
        stepTitle="Goals & Development"
        showBackButton={true}
        onBackPress={handleBack}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <XPRewardAnimation
          visible={showXPReward}
          xpAmount={50}
          message="Goals and development plan set!"
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
                <LinearGradient
                  colors={[theme.colors.primary + '15', theme.colors.primary + '05']}
                  style={styles.headerGradient}
                >
                  <Text style={styles.title}>
                    Set your goals, {firstName}! 🎯
                  </Text>
                  <Text style={styles.subtitle}>
                    Create SMART goals to track your {position} development
                  </Text>
                </LinearGradient>
              </View>

              {/* SMART Goals Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trophy" size={24} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Performance Goals</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Set measurable targets for this season. You can adjust these anytime in the Goals tab.
                </Text>
                
                <View style={styles.goalsGrid}>
                  {positionGoals.map((goal: Goal) => (
                    <Animated.View 
                      key={goal.key}
                      style={[
                        styles.goalCard,
                        { transform: [{ scale: goalCardAnims[goal.key] || 1 }] }
                      ]}
                    >
                      <LinearGradient
                        colors={[theme.colors.white, theme.colors.primary + '02']}
                        style={styles.goalCardGradient}
                      >
                        <Text style={styles.goalName}>{goal.name}</Text>
                        <View style={styles.goalValueContainer}>
                          <Text style={styles.goalValue}>
                            {selectedGoals[goal.key]?.toFixed(goal.unit === '%' ? 0 : 1)} {goal.unit}
                          </Text>
                        </View>
                        <Slider
                          style={styles.slider}
                          minimumValue={goal.min}
                          maximumValue={goal.max}
                          value={selectedGoals[goal.key] || goal.default}
                          onValueChange={(value) => handleGoalChange(goal.key, value)}
                          minimumTrackTintColor={theme.colors.primary}
                          maximumTrackTintColor={theme.colors.neutral200}
                        />
                        <View style={styles.goalRange}>
                          <Text style={styles.rangeText}>{goal.min}</Text>
                          <Text style={styles.rangeText}>{goal.max}</Text>
                        </View>
                      </LinearGradient>
                    </Animated.View>
                  ))}
                </View>
              </View>

              {/* Strengths Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={24} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Your Strengths</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Select 2-5 areas where you excel (Selected: {selectedStrengths.length}/5)
                </Text>
                
                <View style={styles.tagsContainer}>
                  {positionStrengths.map((strength: string) => (
                    <TouchableOpacity
                      key={strength}
                      style={[
                        styles.tagButton,
                        selectedStrengths.includes(strength) && styles.tagButtonSelected
                      ]}
                      onPress={() => handleStrengthToggle(strength)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={selectedStrengths.includes(strength) 
                          ? [theme.colors.primary, theme.colors.primary + 'DD']
                          : [theme.colors.white, theme.colors.neutral50]
                        }
                        style={styles.tagGradient}
                      >
                        <Text style={[
                          styles.tagText,
                          selectedStrengths.includes(strength) && styles.tagTextSelected
                        ]}>
                          {strength}
                        </Text>
                        {selectedStrengths.includes(strength) && (
                          <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Growth Areas Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Growth Areas</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Select 1-3 areas you want to improve (Selected: {selectedGrowthAreas.length}/3)
                </Text>
                
                <View style={styles.tagsContainer}>
                  {positionGrowthAreas.map((area: string) => (
                    <TouchableOpacity
                      key={area}
                      style={[
                        styles.tagButton,
                        selectedGrowthAreas.includes(area) && styles.tagButtonSelected
                      ]}
                      onPress={() => handleGrowthAreaToggle(area)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={selectedGrowthAreas.includes(area) 
                          ? [theme.colors.primary, theme.colors.primary + 'DD']
                          : [theme.colors.white, theme.colors.neutral50]
                        }
                        style={styles.tagGradient}
                      >
                        <Text style={[
                          styles.tagText,
                          selectedGrowthAreas.includes(area) && styles.tagTextSelected
                        ]}>
                          {area}
                        </Text>
                        {selectedGrowthAreas.includes(area) && (
                          <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

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
                      colors={isValid && !hasCompletedStep 
                        ? [theme.colors.primary, theme.colors.primary + 'DD'] 
                        : [theme.colors.neutral300, theme.colors.neutral300]
                      }
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.buttonGradient}
                    >
                      <Text style={[styles.buttonText, (!isValid || hasCompletedStep) && styles.disabledButtonText]}>
                        Set My Goals
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
                  🚀 Building your personalized development roadmap
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
  },
  // Header Section
  headerSection: {
    marginBottom: 32,
  },
  headerGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
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
  // Goals Grid
  goalsGrid: {
    gap: 16,
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
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutral100,
  },
  goalName: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  goalValueContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  goalValue: {
    fontSize: 24,
    fontFamily: theme.fonts.anton,
    color: theme.colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  goalRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
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
