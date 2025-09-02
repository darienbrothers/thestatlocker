import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';

const { width } = Dimensions.get('window');

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

export function OnboardingStepper({ 
  currentStep, 
  totalSteps, 
  stepTitle,
  onBackPress,
  showBackButton = false
}: OnboardingStepperProps) {
  const progress = currentStep / totalSteps;
  
  return (
    <View style={styles.container}>
      {/* Inline Back Button and Progress Bar */}
      <View style={styles.progressRow}>
        {/* Back Button */}
        {showBackButton && onBackPress ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        
        {/* Progress Bar Container */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
          
          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < currentStep && styles.progressDotCompleted,
                  index === currentStep - 1 && styles.progressDotCurrent,
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* Right spacer for balance */}
        <View style={styles.rightSpacer} />
      </View>
      
      {/* Centered Step Title */}
      {stepTitle && (
        <View style={styles.titleContainer}>
          <Text style={styles.stepTitle}>{stepTitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  backButtonPlaceholder: {
    width: 40,
    marginRight: 8,
  },
  progressContainer: {
    flex: 1,
    position: 'relative',
  },
  rightSpacer: {
    width: 48,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.neutral100,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  dotsContainer: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  progressDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.neutral200,
    borderWidth: 2,
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.primary,
  },
  progressDotCurrent: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.1 }],
  },
});
