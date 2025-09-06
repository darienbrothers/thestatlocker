import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingStepper } from '@/components/gamification';
import { colors, fonts, fontSizes } from '@/constants/theme';

const ProfileImageScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  // Get name data from previous screen
  const { firstName, lastName } = route.params || {};
  
  // State
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form validation - profile image is required
  const isFormValid = profileImage !== null;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

  const loadData = async () => {
    try {
      const savedProfileImage = await AsyncStorage.getItem('onboarding_profileImage');
      if (savedProfileImage) setProfileImage(savedProfileImage);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      if (profileImage) {
        await AsyncStorage.setItem('onboarding_profileImage', profileImage);
      }
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  // Start animations function
  const startAnimations = () => {
    // Enhanced pulsing animation for profile picture to guide user interaction
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { 
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true 
        }),
        Animated.timing(glowAnim, { 
          toValue: 0.4, 
          duration: 1000, 
          useNativeDriver: true 
        }),
      ])
    );
    pulseAnimation.start();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Load data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
      startAnimations();
    }, [])
  );

  // Save data when profile image changes
  useEffect(() => {
    if (profileImage) {
      saveData();
    }
  }, [profileImage]);

  const handleContinue = () => {
    if (profileImage) {
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
        // Navigate to next screen (BasicInfo)
        navigation.navigate('BasicInfo', { 
          firstName: firstName, 
          lastName: lastName,
          profileImage: profileImage
        });
      });
    }
  };


  const handleBackPress = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to add a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
      return;
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return;
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Your Game Face',
      'Choose how you\'d like to add your profile picture',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <OnboardingStepper 
          currentStep={2}
          totalSteps={9}
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 240 : 120}
        >
          <View style={styles.mainContent}>
            <Animated.View 
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={styles.headerSection}>
                <Image 
                  source={require('../../../../assets/logos/logoBlack.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>
                  Show your game face, {firstName}!
                </Text>
                <Text style={styles.subtitle}>
                  Add a profile picture so your teammates can recognize you on the field and in the locker room.
                </Text>
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.profileContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={styles.profileSection}>
                <TouchableOpacity 
                  style={styles.profileImageTouchable} 
                  onPress={showImageOptions}
                  activeOpacity={0.8}
                >
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <Animated.View style={[
                      styles.profileImagePlaceholder,
                      {
                        opacity: glowAnim,
                      }
                    ]}>
                      <View style={styles.cameraIconContainer}>
                        <Ionicons name="camera" size={48} color={colors.primary} />
                      </View>
                      <Text style={styles.profileImageText}>Tap to Add Photo</Text>
                      <Text style={styles.profileImageSubtext}>Camera or Photo Library</Text>
                    </Animated.View>
                  )}
                </TouchableOpacity>
                
                {profileImage && (
                  <TouchableOpacity 
                    style={styles.changePhotoButton}
                    onPress={showImageOptions}
                  >
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
          
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
                <View style={styles.buttonContent}>
                  <Text style={[
                    styles.continueButtonText,
                    !isFormValid && styles.continueButtonTextDisabled
                  ]}>
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
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    paddingBottom: 32,
  },
  headerSection: {
    alignItems: 'center',
  },
  profileContainer: {
    paddingBottom: 40,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 24,
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
    paddingHorizontal: 8,
  },
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageTouchable: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.neutral50,
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  profileImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileImageText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  profileImageSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  fixedButtonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.neutral100,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
  },
  continueButtonWrapper: {
    flex: 1,
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
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
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
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.semiBold,
    color: colors.white,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonTextDisabled: {
    color: colors.neutral500,
  },
});

export default ProfileImageScreen;
