import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Position, HighSchool } from '../types';
import { colors, fonts, fontSizes } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

type OnboardingQuickScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OnboardingQuick'
>;

interface Props {
  navigation: OnboardingQuickScreenNavigationProp;
}

const positions: Position[] = ['Goalie', 'Attack', 'Midfield', 'Defense', 'FOGO', 'LSM', 'SSDM'];
const levels = ['Varsity', 'JV', 'Freshman'] as const;
const gradYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);

export default function OnboardingQuickScreen({ navigation }: Props) {
  const { user, updateUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [gradYear, setGradYear] = useState<number | null>(null);
  const [highSchool, setHighSchool] = useState<HighSchool>({
    name: '',
    city: '',
    state: '',
    level: 'Varsity',
  });

  const handleComplete = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name.');
      return;
    }
    if (!position) {
      Alert.alert('Missing Information', 'Please select your position.');
      return;
    }
    if (!gradYear) {
      Alert.alert('Missing Information', 'Please select your graduation year.');
      return;
    }
    if (!highSchool.name || !highSchool.city || !highSchool.state) {
      Alert.alert('Missing Information', 'Please fill in your high school information.');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        sport: 'lacrosse',
        gender: 'boys', // Default for now - can be updated later
        position: position as Position,
        graduationYear: gradYear,
        team: highSchool.name,
        highSchool: highSchool,
        onboarding_completed: true,
        strengths: [],
        growth: [],
        training_days_per_week: 3,
        nudge: {
          time: '19:00',
          days: ['Sunday'],
          after_games_only: true,
        },
        motto: '',
        analytics_consent: false,
        goals: [],
      });
      
      navigation.navigate('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Quick Start</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>
          Let's get you set up with the essentials
        </Text>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your name?</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={(text) => setFirstName(text)}
              placeholder="Enter your first name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Text style={styles.welcomeMessage}>
            We're excited to have you on board, {firstName}!
          </Text>
        </View>

        {/* Position Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What position do you play?</Text>
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

        {/* Graduation Year */}
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

        {/* High School Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>High School Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>School Name</Text>
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
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                value={highSchool.city}
                onChangeText={(text) => setHighSchool(prev => ({ ...prev, city: text }))}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>State</Text>
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
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, loading && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
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
  subtitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
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
  footer: {
    padding: 24,
    paddingBottom: 34,
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
  welcomeMessage: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
