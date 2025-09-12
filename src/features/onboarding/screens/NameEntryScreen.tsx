import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useKeyboardAwareScrolling } from '@/utils/keyboardUtils';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingStepper } from '@/components/gamification';
import { colors, fonts, fontSizes } from '@/constants/theme';

const NameEntryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Enhanced keyboard-aware scrolling
  const { scrollViewRef, handleInputFocus, handleInputBlur } =
    useKeyboardAwareScrolling();

  // State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Animation refs
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Input refs for keyboard handling
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);

  // Form validation
  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const loadData = async () => {
    try {
      const savedFirstName = await AsyncStorage.getItem('onboarding_firstName');
      const savedLastName = await AsyncStorage.getItem('onboarding_lastName');

      if (savedFirstName) {
        setFirstName(savedFirstName);
      }
      if (savedLastName) {
        setLastName(savedLastName);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('onboarding_firstName', firstName);
      await AsyncStorage.setItem('onboarding_lastName', lastName);
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  // Load data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  // Save data when inputs change
  useEffect(() => {
    if (firstName || lastName) {
      saveData();
    }
  }, [firstName, lastName]);

  // Button animation when form is valid
  useEffect(() => {
    if (isFormValid) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.02,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFormValid]);

  const handleContinue = () => {
    if (firstName.trim() && lastName.trim()) {
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
        // Navigate to ProfileImageScreen
        navigation.navigate('ProfileImage', {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      });
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingStepper
        currentStep={1}
        totalSteps={9}
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <View style={styles.headerSection}>
                  <Image
                    source={require('../../../../assets/logos/logoBlack.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.welcomeText}>Welcome to your locker</Text>
                  <Text style={styles.title}>What's your name, champ?</Text>
                  <Text style={styles.subtitle}>
                    Let's get you set up with a personalized experience in your
                    StatLocker.
                  </Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputSection}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>First Name</Text>
                    <TextInput
                      ref={firstNameInputRef}
                      style={styles.cleanInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter your first name"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onFocus={() =>
                        handleInputFocus(firstNameInputRef.current)
                      }
                      onBlur={handleInputBlur}
                      onSubmitEditing={() => {
                        lastNameInputRef.current?.focus();
                      }}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    <TextInput
                      ref={lastNameInputRef}
                      style={styles.cleanInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter your last name"
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="words"
                      returnKeyType="done"
                      onFocus={() => handleInputFocus(lastNameInputRef.current)}
                      onBlur={handleInputBlur}
                      onSubmitEditing={handleContinue}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.fixedButtonContainer}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isFormValid && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <LinearGradient
              colors={
                isFormValid
                  ? [colors.primary, colors.primaryDark]
                  : [colors.neutral300, colors.neutral400]
              }
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.continueButtonText,
                    !isFormValid && styles.continueButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={isFormValid ? colors.white : colors.neutral500}
                  style={styles.buttonIcon}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
    minHeight: 600,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  inputSection: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cleanInput: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.neutral200,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 56,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 34,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.neutral100,
  },
  continueButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  continueButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.white,
  },
  continueButtonTextDisabled: {
    color: colors.textTertiary,
  },
});

export default NameEntryScreen;
