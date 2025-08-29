import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingStartScreenProps {
  navigation: any;
  route: { params?: { firstName?: string } };
}

export default function OnboardingStartScreen({ navigation, route }: OnboardingStartScreenProps) {
  const firstName = route.params?.firstName || 'Athlete';

  const handleQuickStart = () => {
    navigation.navigate('OnboardingQuick');
  };

  const handleExtended = () => {
    navigation.navigate('OnboardingExtended');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/logos/logoBlack.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>
          Your athletic journey starts here.
          </Text>
          <Text style={styles.headerText}>
            Choose your path.
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
              Quick setup to get you started with basic stats tracking
            </Text>
          </TouchableOpacity>

          {/* Pro Path - Extended */}
          <TouchableOpacity 
            style={styles.proCardContainer}
            onPress={handleExtended}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[
                theme.colors.primary + '08',
                theme.colors.primary + '04',
                'rgba(255, 255, 255, 0.5)'
              ]}
              style={styles.proCard}
            >
              <View style={styles.proGlowBorder} />
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
                Complete profile setup with goals, training plans, and personalized insights
              </Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>RECOMMENDED</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer Microcopy */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            We'll help you organize your season, track progress, and share a clean athletic profile. Outcomes are always yours.
          </Text>
        </View>
      </View>
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
  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    width: 64,
    height: 64,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 28,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  // Option Cards
  optionsContainer: {
    gap: 16,
  },
  rookieCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral200,
    padding: 20,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  proCardContainer: {
    position: 'relative',
  },
  proCard: {
    borderRadius: 16,
    padding: 20,
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rookieEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  proEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rookieTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  proTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.textPrimary,
  },
  timeTag: {
    backgroundColor: theme.colors.neutral100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proTimeTag: {
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  timeText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  proTimeText: {
    fontSize: 11,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.primary,
  },
  rookieDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  proDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 9,
    fontFamily: theme.fonts.jakarta.bold,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  // Footer Section
  footerSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 13,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
