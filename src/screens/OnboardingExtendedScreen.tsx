import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Position, HighSchool, Club, Purpose, Focus, Goal } from '../types';
import { colors, fonts, fontSizes } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

type OnboardingExtendedScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OnboardingExtended'
>;

interface Props {
  navigation: OnboardingExtendedScreenNavigationProp;
}

const positions: Position[] = ['Goalie', 'Attack', 'Midfield', 'Defense', 'FOGO', 'LSM', 'SSDM'];
const levels = ['Varsity', 'JV', 'Freshman'] as const;
const gradYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);
const genders = ['boys', 'girls'] as const;

const purposes: { key: Purpose; label: string; description: string }[] = [
  { key: 'improve', label: 'Improve Performance', description: 'Get better at my sport' },
  { key: 'consistent', label: 'Stay Consistent', description: 'Build regular training habits' },
  { key: 'track', label: 'Track Progress', description: 'Monitor my development' },
  { key: 'profile', label: 'Build Profile', description: 'Create a clean athletic profile' },
  { key: 'accountable', label: 'Stay Accountable', description: 'Keep myself motivated' },
];

const focuses: { key: Focus; label: string }[] = [
  { key: 'skill', label: 'Technical Skills' },
  { key: 'game', label: 'Game Performance' },
  { key: 'conditioning', label: 'Physical Conditioning' },
  { key: 'confidence', label: 'Mental Confidence' },
  { key: 'leadership', label: 'Leadership' },
];

const strengthsOptions = [
  'Speed', 'Agility', 'Stick Skills', 'Vision', 'Leadership', 'Defense', 'Shooting', 
  'Passing', 'Dodging', 'Ground Balls', 'Faceoffs', 'Clearing', 'Riding'
];

const trainingDays = [1, 2, 3, 4, 5, 6, 7];

export default function OnboardingExtendedScreen({ navigation }: Props) {
  const { user, updateUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<'boys' | 'girls'>('boys');
  const [position, setPosition] = useState<Position | ''>('');
  const [gradYear, setGradYear] = useState<number | null>(null);
  const [highSchool, setHighSchool] = useState<HighSchool>({
    name: '',
    city: '',
    state: '',
    level: 'Varsity',
  });
  const [club, setClub] = useState<Club>({
    enabled: false,
    org_name: '',
    team_name: '',
  });
  const [purpose, setPurpose] = useState<Purpose | ''>('');
  const [focus, setFocus] = useState<Focus | ''>('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [growth, setGrowth] = useState<string[]>([]);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(3);
  const [motto, setMotto] = useState('');
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const toggleStrength = (strength: string) => {
    setStrengths(prev => 
      prev.includes(strength) 
        ? prev.filter(s => s !== strength)
        : [...prev, strength]
    );
  };

  const toggleGrowth = (growthArea: string) => {
    setGrowth(prev => 
      prev.includes(growthArea) 
        ? prev.filter(g => g !== growthArea)
        : [...prev, growthArea]
    );
  };

  const handleComplete = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name.');
      return;
    }
    if (!position || !gradYear || !highSchool.name || !highSchool.city || !highSchool.state) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = {
        firstName: firstName.trim(),
        gender,
        position,
        graduationYear: gradYear,
      };
      await updateUserProfile({
        firstName: formData.firstName,
        gender: formData.gender,
        position: formData.position,
        graduationYear: formData.graduationYear,
        highSchool: highSchool,
        club: club.enabled ? club : undefined,
        purpose: purpose || undefined,
        focus_30d: focus ? [focus] : undefined,
        strengths,
        growth,
        training_days_per_week: trainingDaysPerWeek,
        nudge: {
          time: '19:00',
          days: ['Sunday'],
          after_games_only: true,
        },
        motto,
        analytics_consent: analyticsConsent,
        goals: [],
        onboarding_completed: true,
      });
      
      navigation.navigate('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Welcome to StatLocker!</Text>
            <Text style={styles.stepSubtitle}>We're excited to have you on board.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>What's your first name?</Text>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gender</Text>
              <View style={styles.optionsRow}>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.optionButton,
                      gender === g && styles.optionButtonSelected,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        gender === g && styles.optionTextSelected,
                      ]}
                    >
                      {g === 'boys' ? "Boys' Lacrosse" : "Girls' Lacrosse"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Position</Text>
              <View style={styles.optionsGrid}>
                {positions.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[
                      styles.optionButton,
                      position === pos && styles.optionButtonSelected,
                    ]}
                    onPress={() => setPosition(pos)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        position === pos && styles.optionTextSelected,
                      ]}
                    >
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Graduation Year</Text>
              <View style={styles.optionsGrid}>
                {gradYears.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.optionButton,
                      gradYear === year && styles.optionButtonSelected,
                    ]}
                    onPress={() => setGradYear(year)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        gradYear === year && styles.optionTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>High School</Text>
            <Text style={styles.stepSubtitle}>Where do you play?</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>School Name *</Text>
              <TextInput
                style={styles.textInput}
                value={highSchool.name}
                onChangeText={(text) => setHighSchool(prev => ({ ...prev, name: text }))}
                placeholder="Enter your high school name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  value={highSchool.city}
                  onChangeText={(text) => setHighSchool(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  value={highSchool.state}
                  onChangeText={(text) => setHighSchool(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Team Level</Text>
              <View style={styles.levelOptions}>
                {levels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      highSchool.level === level && styles.levelButtonSelected,
                    ]}
                    onPress={() => setHighSchool(prev => ({ ...prev, level }))}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        highSchool.level === level && styles.levelTextSelected,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Club Team</Text>
            <Text style={styles.stepSubtitle}>Do you play club lacrosse?</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>I play club lacrosse</Text>
              <Switch
                value={club.enabled}
                onValueChange={(value) => setClub(prev => ({ ...prev, enabled: value }))}
                trackColor={{ false: colors.neutral200, true: colors.primary + '40' }}
                thumbColor={club.enabled ? colors.primary : colors.neutral400}
              />
            </View>

            {club.enabled && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Organization Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={club.org_name}
                    onChangeText={(text) => setClub(prev => ({ ...prev, org_name: text }))}
                    placeholder="e.g., True Lacrosse, FCA, etc."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Team Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={club.team_name}
                    onChangeText={(text) => setClub(prev => ({ ...prev, team_name: text }))}
                    placeholder="e.g., 2025 Blue, Elite, etc."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </>
            )}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Goals & Focus</Text>
            <Text style={styles.stepSubtitle}>What drives you?</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Primary Purpose</Text>
              <View style={styles.purposeOptions}>
                {purposes.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.purposeButton,
                      purpose === p.key && styles.purposeButtonSelected,
                    ]}
                    onPress={() => setPurpose(p.key)}
                  >
                    <Text
                      style={[
                        styles.purposeTitle,
                        purpose === p.key && styles.purposeTitleSelected,
                      ]}
                    >
                      {p.label}
                    </Text>
                    <Text
                      style={[
                        styles.purposeDescription,
                        purpose === p.key && styles.purposeDescriptionSelected,
                      ]}
                    >
                      {p.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>30-Day Focus</Text>
              <View style={styles.optionsGrid}>
                {focuses.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.optionButton,
                      focus === f.key && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFocus(f.key)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        focus === f.key && styles.optionTextSelected,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.stepTitle}>Strengths & Growth</Text>
            <Text style={styles.stepSubtitle}>Know yourself as an athlete</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Strengths (select 2-4)</Text>
              <View style={styles.optionsGrid}>
                {strengthsOptions.map((strength) => (
                  <TouchableOpacity
                    key={strength}
                    style={[
                      styles.optionButton,
                      strengths.includes(strength) && styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleStrength(strength)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        strengths.includes(strength) && styles.optionTextSelected,
                      ]}
                    >
                      {strength}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Growth Areas (select 2-3)</Text>
              <View style={styles.optionsGrid}>
                {strengthsOptions.map((growthArea) => (
                  <TouchableOpacity
                    key={growthArea}
                    style={[
                      styles.optionButton,
                      growth.includes(growthArea) && styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleGrowth(growthArea)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        growth.includes(growthArea) && styles.optionTextSelected,
                      ]}
                    >
                      {growthArea}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Training Days Per Week</Text>
              <View style={styles.optionsRow}>
                {trainingDays.map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayButton,
                      trainingDaysPerWeek === days && styles.dayButtonSelected,
                    ]}
                    onPress={() => setTrainingDaysPerWeek(days)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        trainingDaysPerWeek === days && styles.dayTextSelected,
                      ]}
                    >
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 7:
        return (
          <View>
            <Text style={styles.stepTitle}>Final Touches</Text>
            <Text style={styles.stepSubtitle}>Personalize your experience</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Personal Motto (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={motto}
                onChangeText={setMotto}
                placeholder="What motivates you?"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
              <Text style={styles.characterCount}>{motto.length}/100</Text>
            </View>

            <View style={styles.consentSection}>
              <View style={styles.switchRow}>
                <View style={styles.consentText}>
                  <Text style={styles.consentTitle}>Analytics Consent</Text>
                  <Text style={styles.consentDescription}>
                    Help us improve StatLocker by sharing anonymous usage data
                  </Text>
                </View>
                <Switch
                  value={analyticsConsent}
                  onValueChange={setAnalyticsConsent}
                  trackColor={{ false: colors.neutral200, true: colors.primary + '40' }}
                  thumbColor={analyticsConsent ? colors.primary : colors.neutral400}
                />
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Ready to get started!</Text>
              <Text style={styles.summaryText}>
                You're all set up as a {gender === 'boys' ? 'boys' : 'girls'} lacrosse {position?.toLowerCase()} 
                graduating in {gradYear}. Time to start tracking your progress!
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Complete Setup</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {/* Step Content */}
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep < totalSteps ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.completeButton, loading && styles.completeButtonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text style={styles.completeButtonText}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.neutral200,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral200,
    backgroundColor: colors.background,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  characterCount: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  levelOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral200,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  levelButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  levelText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  levelTextSelected: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.medium,
    color: colors.textPrimary,
  },
  purposeOptions: {
    gap: 12,
  },
  purposeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral200,
    backgroundColor: colors.background,
  },
  purposeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  purposeTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  purposeTitleSelected: {
    color: colors.primary,
  },
  purposeDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  purposeDescriptionSelected: {
    color: colors.primary + 'CC',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.neutral200,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: colors.white,
  },
  consentSection: {
    marginBottom: 24,
  },
  consentText: {
    flex: 1,
    marginRight: 16,
  },
  consentTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  summaryTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.primary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 34,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.white,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.white,
  },
});
