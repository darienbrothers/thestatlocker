import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../stores/authStore';
import { RootStackParamList } from '../types';
import { colors, fonts, spacing, fontSizes, borderRadius } from '../constants/theme';

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
      colors={[colors.background, colors.backgroundSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Image 
                source={require('../../assets/logos/logoBlack.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              
              <Text style={styles.title}>
                Welcome to StatLocker, {user?.firstName || 'Athlete'}!
              </Text>
              
              <Text style={styles.subtitle}>
                Let's get you set up to start tracking your performance
              </Text>
            </View>

            {/* Setup Options */}
            <View style={styles.optionsContainer}>
              {/* Quick Start Option */}
              <TouchableOpacity style={styles.optionCard} onPress={handleQuickStart}>
                <View style={styles.optionIcon}>
                  <Ionicons name="flash" size={32} color={colors.primary} />
                </View>
                
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Quick Start</Text>
                  <Text style={styles.optionDescription}>
                    Jump right in and set up your profile as you go
                  </Text>
                  <Text style={styles.optionTime}>2 minutes</Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Full Setup Option */}
              <TouchableOpacity style={styles.optionCard} onPress={handleCompleteSetup}>
                <View style={styles.optionIcon}>
                  <Ionicons name="settings" size={32} color={colors.success} />
                </View>
                
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Complete Setup</Text>
                  <Text style={styles.optionDescription}>
                    Tell us about your sport, goals, and preferences for a personalized experience
                  </Text>
                  <Text style={styles.optionTime}>5-8 minutes</Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you'll get:</Text>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.benefitText}>Personalized performance tracking</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.benefitText}>AI-powered insights and recommendations</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.benefitText}>Goal tracking and progress monitoring</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes['3xl'],
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
    marginBottom: spacing['2xl'],
  },
  optionsContainer: {
    marginBottom: spacing['2xl'],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  optionTime: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
  },
  benefitsContainer: {
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  benefitsTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
