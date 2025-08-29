import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import XPStrip from './XPStrip';

const { width } = Dimensions.get('window');

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  currentXP: number;
  stepTitle?: string;
  showXP?: boolean;
}

export function OnboardingStepper({ 
  currentStep, 
  totalSteps, 
  currentXP, 
  stepTitle,
  showXP = true 
}: OnboardingStepperProps) {
  const progress = currentStep / totalSteps;
  
  return (
    <View style={styles.container}>
      {/* XP Strip */}
      {showXP && (
        <View style={styles.xpContainer}>
          <XPStrip 
            currentXP={currentXP} 
            compact 
            showLabel={false}
          />
        </View>
      )}
      
      {/* Step Progress */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>
            Step {currentStep} of {totalSteps}
          </Text>
          {stepTitle && (
            <Text style={styles.stepTitle}>{stepTitle}</Text>
          )}
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + 'CC']}
            start={[0, 0]}
            end={[1, 0]}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
          
          {/* Step Dots */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index < currentStep && styles.stepDotCompleted,
                  index === currentStep - 1 && styles.stepDotCurrent,
                ]}
              >
                {index < currentStep - 1 && (
                  <Ionicons 
                    name="checkmark" 
                    size={12} 
                    color={theme.colors.white} 
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral100,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  xpContainer: {
    marginBottom: 12,
  },
  stepContainer: {
    gap: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.medium,
    color: theme.colors.textSecondary,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.primary,
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
  },
  dotsContainer: {
    position: 'absolute',
    top: -7,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.neutral200,
    borderWidth: 2,
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: theme.colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
