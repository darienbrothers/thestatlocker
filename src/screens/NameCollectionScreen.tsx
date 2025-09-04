import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingStepper } from '@/components/gamification';
import { colors, fonts, fontSizes } from '@/constants/theme';

// Define particle type outside component
interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

const NameCollectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [particles] = useState<Particle[]>([]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Computed values
  const isFormValid = firstName.trim() && lastName.trim();

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
      Animated.timing(progressAnim, {
        toValue: 0.125, // 1/8 progress (step 1 of 8)
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();

    // Subtle glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


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
        // Navigate after animation completes
        navigation.navigate('BasicInfo', { firstName: firstName.trim(), lastName: lastName.trim() });
      });
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to add a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };


  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stepper with Back Button */}
      <OnboardingStepper 
        currentStep={1}
        totalSteps={8}
        stepTitle="Let's get to know you"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView 
            style={styles.mainContent}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >

          {/* Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>
                Name Plate
              </Text>
              <Text style={styles.subtitle}>
                Every locker starts with a name plate. Add yours to get started.
              </Text>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
              <Text style={styles.sectionLabel}>Your Game Face</Text>
              <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="camera" size={32} color={colors.textSecondary} />
                    <Text style={styles.profileImageText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.modernInput}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.modernInput}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter your last name"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                </View>
              </View>
            </View>
          </Animated.View>


          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
        
        {/* Continue Button - Fixed at bottom */}
        <View style={styles.fixedButtonContainer}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isFormValid && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <LinearGradient
              colors={isFormValid ? [colors.primary, colors.primaryDark] : [colors.neutral300, colors.neutral400]}
              style={styles.buttonGradient}
            >
              <Animated.View style={[
                styles.buttonContent,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }
              ]}>
                <Ionicons 
                  name="rocket" 
                  size={20} 
                  color={isFormValid ? colors.white : colors.textTertiary} 
                  style={styles.buttonIcon}
                />
                <Text style={[
                  styles.continueButtonText,
                  !isFormValid && styles.continueButtonTextDisabled
                ]}>
                  Next
                </Text>
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
        
      {/* Particle Burst Effects */}
      {particles.map((particle, index) => (
        <Animated.View 
          key={index}
          style={[
            styles.particle,
            {
              left: particle.x,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }],
            },
          ]}
        />
      ))}
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
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 400,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.anton,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral100,
    borderWidth: 3,
    borderColor: colors.neutral200,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    marginTop: 8,
  },
  inputSection: {
    gap: 24,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modernInput: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.regular,
    color: colors.textPrimary,
    paddingRight: 12,
  },
  inputIcon: {
    marginLeft: 8,
  },
  fixedButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingBottom: 34,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  continueButtonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.white,
  },
  continueButtonTextDisabled: {
    color: colors.textTertiary,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

export default NameCollectionScreen;
