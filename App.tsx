import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CustomSplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import {
  NameEntryScreen,
  ProfileImageScreen,
  BasicInfoScreen,
  TeamInformationScreen,
  AcademicScreen,
  GoalsScreen,
  ReviewScreen,
} from './src/features/onboarding';
import PaywallScreen from './src/screens/PaywallScreen';
import MainTabNavigator from './src/app/navigation/MainTabNavigator';
import { useAuthStore } from './src/shared/stores/authStore';
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

    // Initialize auth listener - only run once
    initialize();
  }, []); // Empty dependency array to run only once

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
    console.log('🔍 getInitialRouteName called:', {
      isAuthenticated,
      hasCompletedOnboarding: user?.hasCompletedOnboarding,
      hasFirstName: !!user?.firstName,
      timestamp: new Date().toISOString()
    });
    
    // Always start with Welcome screen for unauthenticated users
    if (!isAuthenticated) {
      console.log('➡️ Returning Welcome (not authenticated)');
      return 'Welcome';
    }
    
    // If user has completed onboarding, go to main app
    if (user?.hasCompletedOnboarding) {
      console.log('➡️ Returning MainTabs (completed onboarding)');
      return 'MainTabs';
    }
    
    // For authenticated users without completed onboarding, start at Welcome
    // and let the navigation flow handle where they should go
    console.log('➡️ Returning Welcome (authenticated but not completed)');
    return 'Welcome';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <NavigationContainer
          key={isAuthenticated && !user?.hasCompletedOnboarding ? 'onboarding' : 'main'}
        >
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
            <Stack.Screen name="NameEntry" component={NameEntryScreen} />
            <Stack.Screen name="ProfileImage" component={ProfileImageScreen} />
            <Stack.Screen name="BasicInfo" component={BasicInfoScreen as any} />
            <Stack.Screen
              name="TeamInformation"
              component={TeamInformationScreen as any}
            />
            <Stack.Screen name="Academic" component={AcademicScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen as any} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Paywall" component={PaywallScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
