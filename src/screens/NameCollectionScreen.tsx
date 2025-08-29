import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { OnboardingStepper } from '../components/gamification';
import { useGamificationStore } from '../stores/gamificationStore';

interface NameCollectionScreenProps {
  navigation: any;
}

export default function NameCollectionScreen({ navigation }: NameCollectionScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    if (firstName.trim()) {
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
        navigation.navigate('OnboardingStart', { 
          firstName: firstName.trim(),
          lastName: lastName.trim() 
        });
      });
    }
  };

  const isValid = firstName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Game HUD Stepper */}
      <OnboardingStepper 
        currentStep={1}
        totalSteps={8}
        currentXP={totalXP}
        stepTitle="Welcome"
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logos/logoBlack.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
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
                { transform: [{ scale: firstNameBounce }] }
              ]}
            >
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  firstName.trim() && styles.textInputActive
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
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </View>
              )}
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputCard,
                { transform: [{ scale: lastNameBounce }] }
              ]}
            >
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  lastName.trim() && styles.textInputActive
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
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </View>
              )}
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
                    Let's Build Your Game
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 48,
    height: 48,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fonts.anton,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Input Section
  inputSection: {
    gap: 20,
    paddingVertical: 20,
  },
  inputCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.neutral100,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    fontFamily: theme.fonts.jakarta.regular,
    color: theme.colors.textPrimary,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.neutral200,
  },
  textInputActive: {
    borderBottomColor: theme.colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  // Button Section
  buttonSection: {
    gap: 16,
    paddingBottom: 20,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
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
