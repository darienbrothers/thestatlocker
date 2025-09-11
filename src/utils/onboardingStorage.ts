import AsyncStorage from '@react-native-async-storage/async-storage';

// All onboarding AsyncStorage keys
const ONBOARDING_KEYS = [
  'onboarding_firstName',
  'onboarding_lastName',
  'onboarding_profileImage',
  // Add any other onboarding keys here as they're discovered
];

/**
 * Clear all onboarding data from AsyncStorage
 * Should be called when onboarding is completed or when user wants to start fresh
 */
export const clearOnboardingData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(ONBOARDING_KEYS);
    console.log('Onboarding data cleared successfully');
  } catch (error) {
    console.error('Failed to clear onboarding data:', error);
  }
};

/**
 * Clear all onboarding data and progress
 * More comprehensive cleanup including progress store data
 */
export const resetOnboardingState = async (): Promise<void> => {
  try {
    // Clear onboarding form data
    await clearOnboardingData();

    // Clear progress store data (if any onboarding-specific keys exist)
    const allKeys = await AsyncStorage.getAllKeys();
    const progressKeys = allKeys.filter(
      key => key.startsWith('progress_') || key.includes('onboarding'),
    );

    if (progressKeys.length > 0) {
      await AsyncStorage.multiRemove(progressKeys);
    }

    console.log('Complete onboarding state reset');
  } catch (error) {
    console.error('Failed to reset onboarding state:', error);
  }
};
