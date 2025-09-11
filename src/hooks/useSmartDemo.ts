import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/shared/stores/authStore';
import { DemoType } from '@/components/demo/SmartDemoSystem';

interface DemoState {
  hasSeenDemo: Record<DemoType, boolean>;
  lastDemoShown?: string;
  demoCount: number;
}

const DEMO_STORAGE_KEY = 'smart_demo_state';

export const useSmartDemo = () => {
  const [demoState, setDemoState] = useState<DemoState>({
    hasSeenDemo: {
      game_tracking: false,
      college_pipeline: false,
      profile_features: false,
      skills_drills: false,
    },
    demoCount: 0,
  });
  const [activeDemoType, setActiveDemoType] = useState<DemoType | null>(null);
  const { user } = useAuthStore();

  // Load demo state from storage
  useEffect(() => {
    loadDemoState();
  }, []);

  const loadDemoState = async () => {
    try {
      const stored = await AsyncStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setDemoState(parsedState);
      }
    } catch (error) {
      console.error('Failed to load demo state:', error);
    }
  };

  const saveDemoState = async (newState: DemoState) => {
    try {
      await AsyncStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(newState));
      setDemoState(newState);
    } catch (error) {
      console.error('Failed to save demo state:', error);
    }
  };

  // Determine if user should see a demo based on experience level
  const shouldShowDemo = (demoType: DemoType): boolean => {
    // Don't show if already seen
    if (demoState.hasSeenDemo[demoType]) {
      return false;
    }

    // Get user experience level (placeholder - would integrate with actual game data)
    const gamesCount = 0; // TODO: Get from game store
    const experienceLevel =
      gamesCount === 0 ? 'new' : gamesCount < 4 ? 'beginner' : 'experienced';

    // Smart triggering logic
    switch (demoType) {
      case 'game_tracking':
        // Always show for new users, show advanced tips for beginners
        return experienceLevel === 'new' || experienceLevel === 'beginner';

      case 'college_pipeline':
        // Show after user has some game data or completes profile
        return (
          experienceLevel === 'beginner' || experienceLevel === 'experienced'
        );

      case 'profile_features':
        // Show for new users or when profile completion is low
        return experienceLevel === 'new' || !user?.hasCompletedOnboarding;

      case 'skills_drills':
        // Show for all users but with different content
        return true;

      default:
        return false;
    }
  };

  // Trigger a demo
  const triggerDemo = (demoType: DemoType) => {
    if (shouldShowDemo(demoType)) {
      setActiveDemoType(demoType);
    }
  };

  // Mark demo as completed
  const completeDemoType = async (demoType: DemoType) => {
    const newState = {
      ...demoState,
      hasSeenDemo: {
        ...demoState.hasSeenDemo,
        [demoType]: true,
      },
      lastDemoShown: new Date().toISOString(),
      demoCount: demoState.demoCount + 1,
    };

    await saveDemoState(newState);
    setActiveDemoType(null);
  };

  // Close demo without marking as completed
  const closeDemoType = () => {
    setActiveDemoType(null);
  };

  // Reset all demo states (for testing or user preference)
  const resetDemoState = async () => {
    const resetState: DemoState = {
      hasSeenDemo: {
        game_tracking: false,
        college_pipeline: false,
        profile_features: false,
        skills_drills: false,
      },
      demoCount: 0,
    };

    await saveDemoState(resetState);
  };

  // Get contextual demo suggestions
  const getContextualSuggestions = (): DemoType[] => {
    const suggestions: DemoType[] = [];

    Object.keys(demoState.hasSeenDemo).forEach(demoType => {
      if (shouldShowDemo(demoType as DemoType)) {
        suggestions.push(demoType as DemoType);
      }
    });

    return suggestions;
  };

  return {
    demoState,
    activeDemoType,
    shouldShowDemo,
    triggerDemo,
    completeDemoType,
    closeDemoType,
    resetDemoState,
    getContextualSuggestions,
  };
};
