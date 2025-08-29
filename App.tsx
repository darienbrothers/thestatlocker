import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CustomSplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import NameCollectionScreen from './src/screens/NameCollectionScreen';
import OnboardingStartScreen from './src/screens/OnboardingStartScreen';
import OnboardingExtendedScreen from './src/screens/OnboardingExtendedScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { useAuthStore } from './src/stores/authStore';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Anton-Regular': require('./assets/fonts/Anton-Regular.ttf'),
          'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
          'PlusJakartaSans-Medium': require('./assets/fonts/PlusJakartaSans-Medium.ttf'),
          'PlusJakartaSans-SemiBold': require('./assets/fonts/PlusJakartaSans-SemiBold.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
    
    // Initialize auth listener
    initialize();
    
    // Handle app state changes to show splash on every foreground
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        setShowSplash(true);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup on unmount
    return () => {
      appStateSubscription.remove();
    };
  }, [initialize]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!appIsReady || isLoading) {
    return null;
  }

  // Show custom splash screen first
  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  const getInitialRouteName = () => {
    // Always start with Welcome screen for unauthenticated users
    // This ensures we don't get stuck in a loading state
    if (!isAuthenticated) {
      return 'Welcome';
    }
    if (!user?.onboarding_completed) {
      return 'NameCollection';
    }
    return 'MainTabs';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={getInitialRouteName()}
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="NameCollection" component={NameCollectionScreen} />
            <Stack.Screen name="OnboardingStart" component={OnboardingStartScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingExtendedScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
