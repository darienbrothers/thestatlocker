import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../stores/authStore';
import { RootStackParamList } from '../types';
import { colors, fonts, spacing, fontSizes, borderRadius } from '../constants/theme';

const { height: screenHeight } = Dimensions.get('window');

type OnboardingStartNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingStart'>;

export default function OnboardingStartScreen() {
  const navigation = useNavigation<OnboardingStartNavigationProp>();
  const { user } = useAuthStore();

  const handleQuickStart = () => {
    navigation.navigate('OnboardingQuick');
  };

  const handleCompleteSetup = () => {
    navigation.navigate('OnboardingExtended');
  };

  return (
    <LinearGradient
      colors={['#FAFAFA', '#F5F5F7']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logos/logoBlack.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Welcome, {user?.firstName || 'Athlete'}!
            </Text>
            
            <Text style={styles.subtitle}>
              Choose your setup experience
            </Text>
          </View>

          {/* Setup Options */}
          <View style={styles.optionsContainer}>
            {/* Quick Start Option */}
            <TouchableOpacity style={[styles.optionCard, styles.quickStartCard]} onPress={handleQuickStart}>
              <LinearGradient
                colors={[colors.primary, '#6366F1']}
                style={styles.optionGradient}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="flash" size={28} color={colors.white} />
                  </View>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeText}>2 min</Text>
                  </View>
                </View>
                
                <Text style={styles.optionTitle}>Quick Start</Text>
                <Text style={styles.optionDescription}>
                  Essential setup to get you started immediately
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Complete Setup Option */}
            <TouchableOpacity style={[styles.optionCard, styles.completeCard]} onPress={handleCompleteSetup}>
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <View style={[styles.optionIconContainer, styles.completeIcon]}>
                    <Ionicons name="star" size={28} color={colors.primary} />
                  </View>
                  <View style={[styles.timeTag, styles.completeTimeTag]}>
                    <Text style={[styles.timeText, styles.completeTimeText]}>5-8 min</Text>
                  </View>
                </View>
                
                <Text style={[styles.optionTitle, styles.completeTitle]}>Make It Mine</Text>
                <Text style={[styles.optionDescription, styles.completeDescription]}>
                  Personalized setup for the full StatLocker experience
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <Ionicons name="analytics" size={20} color={colors.primary} />
              <Text style={styles.benefitText}>Performance insights</Text>
            </View>
            
            <View style={styles.benefitRow}>
              <Ionicons name="trophy" size={20} color={colors.primary} />
              <Text style={styles.benefitText}>Goal tracking</Text>
            </View>
            
            <View style={styles.benefitRow}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.benefitText}>Progress monitoring</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 48,
    height: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  optionCard: {
    borderRadius: borderRadius.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  quickStartCard: {
    overflow: 'hidden',
  },
  completeCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  optionGradient: {
    padding: spacing.xl,
  },
  optionContent: {
    padding: spacing.xl,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeIcon: {
    backgroundColor: colors.primary + '15',
  },
  timeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  completeTimeTag: {
    backgroundColor: colors.primary + '15',
  },
  timeText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.white,
  },
  completeTimeText: {
    color: colors.primary,
  },
  optionTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.jakarta.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  completeTitle: {
    color: colors.textPrimary,
  },
  optionDescription: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  completeDescription: {
    color: colors.textSecondary,
  },
  benefitsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
