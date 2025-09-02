import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/theme';
import { OnboardingStepper } from '../components/gamification';
import { XPRewardAnimation } from '../components/gamification/XPRewardAnimation';
import { useGamificationStore } from '../stores/gamificationStore';

interface NameCollectionScreenProps {
  navigation: any;
}

export default function NameCollectionScreen({ navigation }: NameCollectionScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showXPReward, setShowXPReward] = useState(false);
  const { totalXP, addXP } = useGamificationStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const firstNameBounce = useRef(new Animated.Value(1)).current;
  const lastNameBounce = useRef(new Animated.Value(1)).current;

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

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    if (text.trim() && !firstName.trim()) {
      // First time entering name - bounce animation + XP
      addXP(15, 'Started entering name');
      Animated.sequence([
        Animated.timing(firstNameBounce, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(firstNameBounce, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    if (text.trim() && !lastName.trim()) {
      // First time entering last name - bounce animation + XP
      addXP(10, 'Added last name');
      Animated.sequence([
        Animated.timing(lastNameBounce, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(lastNameBounce, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleContinue = () => {
    if (firstName.trim() && lastName.trim()) {
      // Add XP for completing the step
      addXP(25, 'Name collection completed');
      
      // Show XP reward animation
      setShowXPReward(true);
      
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
      ]).start();
    }
  };

  const handleXPAnimationComplete = () => {
    setShowXPReward(false);
    // Navigate after XP animation completes
    navigation.navigate('BasicInfo', { firstName, lastName });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={1}
        totalSteps={8}
        stepTitle="Welcome"
        showBackButton={true}
        onBackPress={handleBack}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* XP Reward Animation */}
        <XPRewardAnimation
          visible={showXPReward}
          xpAmount={25}
          message="Great start to your journey!"
          onComplete={handleXPAnimationComplete}
        />
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
                }
              ]}
            >
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
                <Text style={styles.title}>Welcome to the squad!</Text>
                <Text style={styles.subtitle}>
                  What should we call you on the field?
                </Text>
              </View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                <Animated.View 
                  style={[
                    styles.inputCard,
                    { transform: [{ scale: firstNameBounce }] },
                    !firstName.trim() && styles.inputCardRequired
                  ]}
                >
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        firstName.trim() && styles.textInputActive,
                        !firstName.trim() && styles.textInputRequired
                      ]}
                      value={firstName}
                      onChangeText={handleFirstNameChange}
                      placeholder="Your first name"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      autoFocus
                    />
                    {firstName.trim() && (
                      <View style={styles.inputIcon}>
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                      </View>
                    )}
                  </View>
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.inputCard,
                    { transform: [{ scale: lastNameBounce }] },
                    !lastName.trim() && styles.inputCardRequired
                  ]}
                >
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        lastName.trim() && styles.textInputActive,
                        !lastName.trim() && styles.textInputRequired
                      ]}
                      value={lastName}
                      onChangeText={handleLastNameChange}
                      placeholder="Your last name"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleContinue}
                    />
                    {lastName.trim() && (
                      <View style={styles.inputIcon}>
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                      </View>
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Continue Button */}
              <View style={styles.buttonSection}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <TouchableOpacity
                    style={[styles.continueButton, !isValid && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!isValid}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isValid ? [theme.colors.primary, theme.colors.primary + 'DD'] : [theme.colors.neutral300, theme.colors.neutral300]}
                      start={[0, 0]}
                      end={[1, 1]}
                      style={styles.buttonGradient}
                    >
                      <Text style={[styles.buttonText, !isValid && styles.disabledButtonText]}>
                        Continue
                      </Text>
                      <Ionicons 
                        name="arrow-forward" 
                        size={20} 
                        color={isValid ? theme.colors.white : theme.colors.textTertiary} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                
                <Text style={styles.helperText}>
                  🏆 We'll personalize your championship journey
                </Text>
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
    minHeight: 500,
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    width: 70,
    height: 70,
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
  // Input Section
  inputSection: {
    gap: 14,
    paddingVertical: 16,
  },
  inputCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.neutral100,
  },
  inputCardRequired: {
    borderColor: theme.colors.error + '30',
    backgroundColor: theme.colors.error + '05',
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    paddingVertical: 8,
    paddingRight: 32,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.neutral200,
    backgroundColor: 'transparent',
  },
  textInputActive: {
    borderBottomColor: theme.colors.primary,
  },
  textInputRequired: {
    borderBottomColor: theme.colors.error + '50',
  },
  inputIcon: {
    position: 'absolute',
    right: 4,
    top: 8,
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
});
