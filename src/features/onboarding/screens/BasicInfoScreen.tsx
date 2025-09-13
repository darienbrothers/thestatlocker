import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { OnboardingStepper } from '@/components/gamification';

interface BasicInfoScreenProps {
  navigation: any;
  route: {
    params: {
      firstName?: string;
      lastName?: string;
      profileImage?: string | null;
      fromReview?: boolean;
      sport?: string;
      gender?: 'boys' | 'girls';
      position?: string;
      graduationYear?: number;
      [key: string]: any;
    };
  };
}

const BOYS_POSITIONS = [
  'Attack',
  'Midfield',
  'Defense',
  'Goalie',
  'LSM',
  'FOGO',
];

const GIRLS_POSITIONS = ['Attack', 'Midfield', 'Defense', 'Goalie'];

const SPORTS = [
  { id: 'lacrosse', name: 'Lacrosse', icon: '🥍', available: true },
  { id: 'basketball', name: 'Basketball', icon: '🏀', available: false },
  { id: 'football', name: 'Football', icon: '🏈', available: false },
  { id: 'soccer', name: 'Soccer', icon: '⚽', available: false },
  { id: 'baseball', name: 'Baseball', icon: '⚾', available: false },
  { id: 'hockey', name: 'Hockey', icon: '🏒', available: false },
];

const GRADUATION_YEARS = [
  { year: 2025, grade: 'Senior' },
  { year: 2026, grade: 'Junior' },
  { year: 2027, grade: 'Sophomore' },
  { year: 2028, grade: 'Freshman' },
];

export default function BasicInfoScreen({
  navigation,
  route,
}: BasicInfoScreenProps) {
  const { firstName, lastName, profileImage, fromReview, sport: initialSport, gender: initialGender, position: initialPosition, graduationYear: initialGraduationYear, ...otherParams } = route.params || {};
  const [sport, setSport] = useState<string>(initialSport || '');
  const [gender, setGender] = useState<'boys' | 'girls' | ''>(initialGender || '');
  const [position, setPosition] = useState<string>(initialPosition || '');
  const [graduationYear, setGraduationYear] = useState<number | null>(initialGraduationYear || null);


  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const genderFadeAnim = useRef(new Animated.Value(0)).current;
  const positionFadeAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Animate gender section when sport changes
    if (sport === 'lacrosse') {
      Animated.timing(genderFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      genderFadeAnim.setValue(0);
    }
  }, [sport]);

  useEffect(() => {
    // Animate position section when gender changes
    if (gender) {
      Animated.timing(positionFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      positionFadeAnim.setValue(0);
    }
  }, [gender]);

  const handleSportSelect = (selectedSport: string) => {
    const sportData = SPORTS.find(s => s.id === selectedSport);
    if (!sportData?.available) {
      // Don't show alert, just don't allow selection
      return;
    }
    setSport(selectedSport);
    setGender(''); // Reset subsequent selections
    setPosition('');
  };

  const handleGenderSelect = (selectedGender: 'boys' | 'girls') => {
    setGender(selectedGender);
    setPosition(''); // Reset position when gender changes
  };

  const handlePositionSelect = (selectedPosition: string) => {
    setPosition(selectedPosition);
  };

  const handleYearSelect = (year: number) => {
    setGraduationYear(year);
  };

  const handleContinue = () => {
    if (sport && gender && position && graduationYear) {
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
      ]).start(() => {
        // Navigate based on fromReview parameter
        if (fromReview) {
          navigation.navigate('Review', {
            ...otherParams,
            firstName,
            lastName,
            profileImage,
            sport,
            gender,
            position,
            graduationYear,
          });
        } else {
          navigation.navigate('TeamInformation', {
            firstName,
            lastName,
            profileImage,
            sport,
            gender,
            position,
            graduationYear,
          });
        }
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const currentPositions =
    gender === 'boys'
      ? BOYS_POSITIONS
      : gender === 'girls'
        ? GIRLS_POSITIONS
        : [];
  const isValid =
    sport && gender && position && graduationYear;

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper
        currentStep={3}
        totalSteps={8}
        stepTitle="Basic Information"
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
            keyboardShouldPersistTaps="handled"
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
                <Text style={styles.title}>Build Your Player Profile</Text>
                <Text style={styles.subtitle}>
                  Time to show the world what you're made of. Let's build your
                  digital player card.
                </Text>
              </View>

              {/* Sport Selection */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="fitness"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>What's Your Game?</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Select your sport to get started.
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sportsCarousel}
                  style={styles.sportsScrollView}
                >
                  {SPORTS.map(sportOption => (
                    <TouchableOpacity
                      key={sportOption.id}
                      style={[
                        styles.sportCarouselCard,
                        sport === sportOption.id &&
                          styles.sportCarouselCardSelected,
                        !sportOption.available &&
                          styles.sportCarouselCardDisabled,
                      ]}
                      onPress={() => handleSportSelect(sportOption.id)}
                      activeOpacity={sportOption.available ? 0.8 : 1}
                    >
                      <View style={styles.sportCardContent}>
                        <Text style={styles.sportEmoji}>
                          {sportOption.icon}
                        </Text>
                        <Text
                          style={[
                            styles.sportText,
                            sport === sportOption.id &&
                              styles.sportTextSelected,
                            !sportOption.available && styles.sportTextDisabled,
                          ]}
                        >
                          {sportOption.name}
                        </Text>
                        {!sportOption.available && (
                          <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>
                              Coming Soon
                            </Text>
                          </View>
                        )}
                        {sport === sportOption.id && sportOption.available && (
                          <View style={styles.sportCheckmark}>
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={theme.colors.primary}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Gender Selection - Shows after sport is selected */}
              {sport === 'lacrosse' && (
                <Animated.View
                  style={[styles.sectionContainer, { opacity: genderFadeAnim }]}
                >
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="people"
                      size={20}
                      color={theme.colors.primary}
                      style={styles.sectionIcon}
                    />
                    <Text style={styles.sectionTitle}>
                      Boys or Girls League?
                    </Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Boys or Girls lacrosse?
                  </Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionCard,
                        gender === 'boys' && styles.optionCardSelected,
                      ]}
                      onPress={() => handleGenderSelect('boys')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.optionEmoji}>♂️</Text>
                        <Text
                          style={[
                            styles.optionText,
                            gender === 'boys' && styles.optionTextSelected,
                          ]}
                        >
                          Boys Lacrosse
                        </Text>
                        {gender === 'boys' && (
                          <View style={styles.checkmark}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={theme.colors.primary}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.optionCard,
                        gender === 'girls' && styles.optionCardSelected,
                      ]}
                      onPress={() => handleGenderSelect('girls')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.optionEmoji}>♀️</Text>
                        <Text
                          style={[
                            styles.optionText,
                            gender === 'girls' && styles.optionTextSelected,
                          ]}
                        >
                          Girls Lacrosse
                        </Text>
                        {gender === 'girls' && (
                          <View style={styles.checkmark}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={theme.colors.primary}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Player Card Section - Combined Position/Year/Height */}
              {sport === 'lacrosse' && gender && (
                <Animated.View
                  style={[
                    styles.sectionContainer,
                    { opacity: positionFadeAnim },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="card"
                      size={20}
                      color={theme.colors.primary}
                      style={styles.sectionIcon}
                    />
                    <Text style={styles.sectionTitle}>
                      Build Your Player Card
                    </Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Complete your digital player profile with these key details.
                  </Text>

                  <View style={styles.playerCardContainer}>
                    {/* Position Selection */}
                    <View style={styles.playerCardSection}>
                      <View style={styles.playerCardSectionHeader}>
                        <Ionicons
                          name="locate"
                          size={16}
                          color={theme.colors.primary}
                          style={styles.playerCardIcon}
                        />
                        <Text style={styles.playerCardSectionTitle}>
                          Position
                        </Text>
                      </View>
                      <View style={styles.positionGrid}>
                        {currentPositions.map(pos => (
                          <TouchableOpacity
                            key={pos}
                            style={[
                              styles.positionCard,
                              position === pos && styles.positionCardSelected,
                            ]}
                            onPress={() => handlePositionSelect(pos)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.positionText,
                                position === pos && styles.positionTextSelected,
                              ]}
                            >
                              {pos}
                            </Text>
                            {position === pos && (
                              <View style={styles.positionCheckmark}>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={16}
                                  color={theme.colors.primary}
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Graduation Year Selection */}
                    {position && (
                      <View style={styles.playerCardSection}>
                        <View style={styles.playerCardSectionHeader}>
                          <Ionicons
                            name="school"
                            size={16}
                            color={theme.colors.primary}
                            style={styles.playerCardIcon}
                          />
                          <Text style={styles.playerCardSectionTitle}>
                            Graduation Year
                          </Text>
                        </View>
                        <View style={styles.yearGrid}>
                          {GRADUATION_YEARS.map(({ year, grade }) => (
                            <TouchableOpacity
                              key={year}
                              style={[
                                styles.yearCard,
                                graduationYear === year &&
                                  styles.yearCardSelected,
                              ]}
                              onPress={() => handleYearSelect(year)}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.yearText,
                                  graduationYear === year &&
                                    styles.yearTextSelected,
                                ]}
                              >
                                {year}
                              </Text>
                              <Text
                                style={[
                                  styles.gradeText,
                                  graduationYear === year &&
                                    styles.gradeTextSelected,
                                ]}
                              >
                                {grade}
                              </Text>
                              {graduationYear === year && (
                                <View style={styles.yearCheckmark}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={theme.colors.primary}
                                  />
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                  </View>
                </Animated.View>
              )}

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
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isValid
                          ? [theme.colors.primary, theme.colors.primary + 'DD']
                          : [theme.colors.neutral300, theme.colors.neutral300]
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
                        Next
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
    justifyContent: 'space-between',
    minHeight: 600,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  // Section Container
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  // Sport Options
  optionsContainer: {
    gap: 12,
    marginTop: 4,
  },
  optionCardDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.neutral100,
  },
  optionTextDisabled: {
    color: theme.colors.textSecondary,
  },
  lockIcon: {
    position: 'absolute',
    right: 0,
  },
  optionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  checkmark: {
    position: 'absolute',
    right: 0,
  },
  // Position Grid
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
  },
  positionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  positionText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textPrimary,
  },
  positionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.jakarta.semiBold,
  },
  positionCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  // Year Grid
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    minWidth: 85,
    alignItems: 'center',
    position: 'relative',
  },
  yearCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  yearText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
  },
  yearTextSelected: {
    color: theme.colors.primary,
  },
  gradeText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  gradeTextSelected: {
    color: theme.colors.primary,
  },
  yearCheckmark: {
    position: 'absolute',
    top: 2,
    right: 2,
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
  // Player Card Layout
  playerCardContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  playerCardSection: {
    marginBottom: 24,
  },
  playerCardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerCardIcon: {
    marginRight: 8,
  },
  playerCardSectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 24,
  },
  // Logo
  logo: {
    width: 56,
    height: 56,
    marginBottom: 24,
  },
  // Sports Carousel
  sportsScrollView: {
    marginTop: 4,
  },
  sportsCarousel: {
    paddingHorizontal: 0,
    gap: 12,
  },
  sportCarouselCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 140,
    alignItems: 'center',
    position: 'relative',
  },
  sportCarouselCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  sportCarouselCardDisabled: {
    opacity: 0.7,
    backgroundColor: theme.colors.neutral50,
  },
  sportCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  sportText: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sportTextSelected: {
    color: theme.colors.primary,
  },
  sportTextDisabled: {
    color: theme.colors.textSecondary,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.neutral200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  sportCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
