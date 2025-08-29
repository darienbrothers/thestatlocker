import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { OnboardingStepper, BadgeTile } from '../components/gamification';
import { useGamificationStore } from '../stores/gamificationStore';
import { XP_VALUES } from '../utils/gamification';

const { width, height } = Dimensions.get('window');

interface OnboardingStartScreenProps {
  navigation: any;
  route: { params?: { firstName?: string; email?: string } };
}

export default function OnboardingStartScreen({ navigation, route }: OnboardingStartScreenProps) {
  const firstName = route.params?.firstName || 'Athlete';
  const email = route.params?.email;
  const { totalXP, badges, currentLevel, startOnboardingPath } = useGamificationStore();
  
  // Animation values
  const proCardPulse = useRef(new Animated.Value(1)).current;
  const proCardGlow = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

    // Pro card pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(proCardPulse, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(proCardPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pro card glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(proCardGlow, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(proCardGlow, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const handleQuickStart = () => {
    startOnboardingPath('rookie');
    navigation.navigate('OnboardingExtended', { email });
  };

  const handleExtended = () => {
    startOnboardingPath('pro');
    navigation.navigate('OnboardingExtended', { email });
  };

  const rookieBadge = badges.find(b => b.id === 'rookie_badge');
  const captainBadge = badges.find(b => b.id === 'captain_badge');

  return (
    <SafeAreaView style={styles.container}>
      {/* Game HUD Stepper */}
      <OnboardingStepper 
        currentStep={2}
        totalSteps={8}
        currentXP={totalXP}
        stepTitle="Choose Path"
      />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Badge Preview Section */}
        <View style={styles.badgeSection}>
          <Text style={styles.badgeLabel}>Unlock Achievements</Text>
          <View style={styles.badgePreview}>
            {rookieBadge && (
              <View style={styles.badgeContainer}>
                <BadgeTile 
                  badge={rookieBadge} 
                  size="small"
                />
                <Text style={styles.badgeText}>Rookie</Text>
              </View>
            )}
            {captainBadge && (
              <View style={styles.badgeContainer}>
                <BadgeTile 
                  badge={captainBadge} 
                  size="small"
                />
                <Text style={styles.badgeText}>Captain</Text>
              </View>
            )}
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>
            Ready to dominate, {firstName}?
          </Text>
          <Text style={styles.headerText}>
            Choose Your Training Path
          </Text>
          <Text style={styles.subHeaderText}>
            Fast XP boost or complete locker unlock — your call, champion
          </Text>
        </View>

        {/* Option Cards */}
        <View style={styles.optionsContainer}>
          {/* Rookie Path - Quick Start */}
          <TouchableOpacity 
            style={styles.rookieCard}
            onPress={handleQuickStart}
            activeOpacity={0.85}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.rookieEmoji}>⚡</Text>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.rookieTitle}>Rookie Path</Text>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeText}>2 min</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.rookieDescription}>
                Quick setup to get you tracking stats and building momentum
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.xpRewardContainer}>
                  <Ionicons name="flash" size={16} color={theme.colors.warning} />
                  <Text style={styles.xpRewardText}>+{XP_VALUES.ROOKIE_PATH} XP</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Pro Path - Extended */}
          <Animated.View
            style={[
              styles.proCardContainer,
              {
                transform: [{ scale: proCardPulse }],
              },
            ]}
          >
            <TouchableOpacity 
              onPress={handleExtended}
              activeOpacity={0.85}
              style={styles.proCardTouchable}
            >
              <LinearGradient
                colors={[
                  theme.colors.primary + '12',
                  theme.colors.primary + '08',
                  'rgba(255, 255, 255, 0.95)'
                ]}
                style={styles.proCard}
              >
                <Animated.View 
                  style={[
                    styles.proGlowBorder,
                    {
                      shadowOpacity: proCardGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.15, 0.4],
                      }),
                    },
                  ]} 
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.proEmoji}>🏆</Text>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.proTitle}>Pro Path</Text>
                      <View style={[styles.timeTag, styles.proTimeTag]}>
                        <Text style={styles.proTimeText}>5–8 min</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.proDescription}>
                    Complete profile with goals, training plans, and AI-powered insights
                  </Text>
                  <View style={styles.proFooter}>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>RECOMMENDED</Text>
                    </View>
                    <View style={styles.xpRewardContainer}>
                      <Ionicons name="trophy" size={16} color={theme.colors.primary} />
                      <Text style={[styles.xpRewardText, styles.proXpReward]}>+{XP_VALUES.PRO_PATH} XP</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="analytics" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Track Performance</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trophy" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Unlock Achievements</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
              <Text style={styles.benefitText}>Level Up Skills</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  // Badge Section
  badgeSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  badgeLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  badgePreview: {
    flexDirection: 'row',
    gap: 16,
  },
  badgeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 32,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Option Cards
  optionsContainer: {
    gap: 16,
  },
  rookieCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  proCardContainer: {
    position: 'relative',
  },
  proCardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  proCard: {
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },
  proGlowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rookieEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  proEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rookieTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  proTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  timeTag: {
    backgroundColor: theme.colors.neutral100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proTimeTag: {
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  timeText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  proTimeText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
  },
  rookieDescription: {
    fontSize: 15,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  proDescription: {
    fontSize: 15,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  xpRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpRewardText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  proXpReward: {
    color: theme.colors.primary,
  },
  proFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Footer Section
  footerSection: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  benefitItem: {
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 12,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
