import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';

export type DemoType =
  | 'game_tracking'
  | 'college_pipeline'
  | 'profile_features'
  | 'skills_drills';

interface DemoSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: string;
  tips?: string[];
  cta?: string;
}

interface SmartDemoSystemProps {
  visible: boolean;
  demoType: DemoType;
  onClose: () => void;
  onComplete: () => void;
}

export const SmartDemoSystem: React.FC<SmartDemoSystemProps> = ({
  visible,
  demoType,
  onClose,
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  // Determine user experience level based on games logged
  const getUserExperienceLevel = () => {
    // TODO: Get actual game count from game store
    const gamesCount = 0; // Placeholder

    if (gamesCount === 0) {
      return 'new';
    }
    if (gamesCount < 4) {
      return 'beginner';
    }
    return 'experienced';
  };

  const experienceLevel = getUserExperienceLevel();

  // Demo content based on type and experience level
  const getDemoContent = (): DemoSlide[] => {
    const baseContent = {
      game_tracking: {
        new: [
          {
            id: 'intro',
            title: 'Track Every Game',
            subtitle: 'Your stats tell your story',
            description:
              'StatLocker helps you capture every goal, assist, and key moment that showcases your lacrosse skills to college coaches.',
            icon: 'stats-chart' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Live tracking during games',
              'Post-game stat entry',
              'Automatic performance insights',
            ],
            cta: 'Start Your First Game',
          },
          {
            id: 'live_tracking',
            title: 'Live Game Tracking',
            subtitle: 'Real-time stat capture',
            description:
              'Track goals, assists, ground balls, and more as they happen. Never miss a stat that could impress coaches.',
            icon: 'play-circle' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Tap to record stats instantly',
              'Focus on the game, not the paperwork',
              'Automatic time stamps',
            ],
          },
          {
            id: 'insights',
            title: 'AI-Powered Insights',
            subtitle: 'Understand your performance',
            description:
              'Get personalized analysis of your strengths, trends, and areas for improvement after every game.',
            icon: 'bulb' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Performance trends',
              'Strength identification',
              'Improvement suggestions',
            ],
          },
        ],
        beginner: [
          {
            id: 'advanced_tracking',
            title: 'Advanced Tracking Tips',
            subtitle: 'Level up your stat game',
            description:
              "You've logged some games! Here are pro tips to get even more value from your tracking.",
            icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Track defensive stats too',
              'Note game conditions',
              'Add context to big plays',
            ],
          },
        ],
        experienced: [
          {
            id: 'analytics',
            title: 'Deep Analytics',
            subtitle: 'Advanced performance metrics',
            description:
              'Unlock advanced analytics and trend analysis to fine-tune your game.',
            icon: 'analytics' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Season trend analysis',
              'Position-specific metrics',
              'Comparative performance',
            ],
          },
        ],
      },
      college_pipeline: {
        new: [
          {
            id: 'pipeline_intro',
            title: 'Your College Pipeline',
            subtitle: 'Connect with coaches',
            description:
              'Build relationships with college coaches by sharing your verified stats and highlight moments.',
            icon: 'school' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Verified stat sharing',
              'Coach communication tools',
              'Recruitment timeline tracking',
            ],
            cta: 'Explore Recruiting',
          },
          {
            id: 'profile_building',
            title: 'Build Your Profile',
            subtitle: 'Stand out to coaches',
            description:
              'Create a comprehensive athletic profile that showcases your stats, achievements, and potential.',
            icon: 'person' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Academic achievements',
              'Athletic accomplishments',
              'Character references',
            ],
          },
        ],
        beginner: [
          {
            id: 'coach_outreach',
            title: 'Coach Outreach',
            subtitle: 'Make meaningful connections',
            description:
              'Learn how to effectively communicate with college coaches using your verified stats.',
            icon: 'mail' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Personalized messages',
              'Stat highlights',
              'Follow-up strategies',
            ],
          },
        ],
        experienced: [
          {
            id: 'advanced_recruiting',
            title: 'Advanced Recruiting',
            subtitle: 'Maximize your opportunities',
            description:
              'Use advanced recruiting tools and analytics to target the right programs.',
            icon: 'rocket' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Program matching',
              'Scholarship analysis',
              'Decision tracking',
            ],
          },
        ],
      },
      profile_features: {
        new: [
          {
            id: 'profile_intro',
            title: 'Your Athletic Profile',
            subtitle: 'More than just stats',
            description:
              'Your StatLocker profile combines stats, achievements, and character to tell your complete story.',
            icon: 'id-card' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Academic achievements',
              'Leadership roles',
              'Community involvement',
            ],
            cta: 'Complete Your Profile',
          },
        ],
        beginner: [
          {
            id: 'profile_optimization',
            title: 'Profile Optimization',
            subtitle: 'Make it shine',
            description:
              'Tips to make your profile stand out to coaches and showcase your best qualities.',
            icon: 'star' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Professional photos',
              'Achievement highlights',
              'Personal statement',
            ],
          },
        ],
        experienced: [
          {
            id: 'profile_analytics',
            title: 'Profile Analytics',
            subtitle: 'Track your visibility',
            description:
              'See how coaches are engaging with your profile and optimize for better results.',
            icon: 'eye' as keyof typeof Ionicons.glyphMap,
            tips: [
              'View analytics',
              'Engagement tracking',
              'Optimization suggestions',
            ],
          },
        ],
      },
      skills_drills: {
        new: [
          {
            id: 'skills_intro',
            title: 'Skills & Drills',
            subtitle: 'Improve every day',
            description:
              'Access position-specific drills and track your skill development over time.',
            icon: 'fitness' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Position-specific drills',
              'Progress tracking',
              'Video tutorials',
            ],
            cta: 'Start Training',
          },
        ],
        beginner: [
          {
            id: 'skill_tracking',
            title: 'Track Your Progress',
            subtitle: 'See your improvement',
            description:
              'Log your training sessions and see how your skills develop over time.',
            icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
            tips: ['Training logs', 'Skill assessments', 'Progress charts'],
          },
        ],
        experienced: [
          {
            id: 'advanced_training',
            title: 'Advanced Training',
            subtitle: 'Elite-level development',
            description:
              'Access advanced training programs and connect with specialized coaches.',
            icon: 'trophy' as keyof typeof Ionicons.glyphMap,
            tips: [
              'Elite programs',
              'Specialized coaching',
              'Performance optimization',
            ],
          },
        ],
      },
    };

    return baseContent[demoType][experienceLevel] || baseContent[demoType].new;
  };

  const slides = getDemoContent();

  useEffect(() => {
    if (visible) {
      setCurrentSlide(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible || slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];
  if (!currentSlideData) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.background}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <View style={styles.progressContainer}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentSlide && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.slideContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={currentSlideData.icon}
                  size={64}
                  color={theme.colors.white}
                />
              </View>

              <Text style={styles.title}>{currentSlideData.title}</Text>
              <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
              <Text style={styles.description}>
                {currentSlideData.description}
              </Text>

              {currentSlideData.tips && (
                <View style={styles.tipsContainer}>
                  {currentSlideData.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.success}
                      />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                onPress={handlePrevious}
                style={[
                  styles.navButton,
                  currentSlide === 0 && styles.navButtonDisabled,
                ]}
                disabled={currentSlide === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={
                    currentSlide === 0
                      ? theme.colors.neutral400
                      : theme.colors.white
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {currentSlide === slides.length - 1
                    ? currentSlideData.cta || 'Get Started'
                    : 'Next'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white + '40',
  },
  progressDotActive: {
    backgroundColor: theme.colors.white,
  },
  closeButton: {
    padding: 8,
  },
  slideContent: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fonts.anton,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 32,
  },
  tipsContainer: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.white,
    opacity: 0.9,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.primary,
  },
});
