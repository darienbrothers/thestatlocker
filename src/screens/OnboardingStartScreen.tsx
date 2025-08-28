import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';

type OnboardingStartNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingStart'>;

export default function OnboardingStartScreen() {
  const navigation = useNavigation<OnboardingStartNavigationProp>();

  const handleQuickStart = () => {
    navigation.navigate('OnboardingQuick');
  };

  const handleExtended = () => {
    navigation.navigate('OnboardingExtended');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's Get Started</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to set up your StatLocker profile
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.quickOption} onPress={handleQuickStart}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Quick Start</Text>
              <Text style={styles.optionTime}>5 steps. Fast setup.</Text>
            </View>
            <Text style={styles.optionDescription}>
              Get the essentials done quickly. You can always customize more later.
            </Text>
            <View style={styles.optionFeatures}>
              <Text style={styles.featureItem}>• Basic profile info</Text>
              <Text style={styles.featureItem}>• Team details</Text>
              <Text style={styles.featureItem}>• Performance goals</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.extendedOption} onPress={handleExtended}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Make It Mine</Text>
              <Text style={styles.optionTime}>About 2 minutes</Text>
            </View>
            <Text style={styles.optionDescription}>
              Personalize your experience with detailed preferences and settings.
            </Text>
            <View style={styles.optionFeatures}>
              <Text style={styles.featureItem}>• Everything in Quick Start</Text>
              <Text style={styles.featureItem}>• Training preferences</Text>
              <Text style={styles.featureItem}>• Notification settings</Text>
              <Text style={styles.featureItem}>• Personal motto</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't worry - you can change these settings anytime in your profile.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  quickOption: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 180,
  },
  extendedOption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 180,
  },
  optionHeader: {
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionTime: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionDescription: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  optionFeatures: {
    gap: spacing.xs,
  },
  featureItem: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
