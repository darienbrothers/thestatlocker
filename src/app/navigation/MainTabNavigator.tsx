import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { MainTabParamList } from './types';
import { tokens, COLORS, FONTS, fontSizes } from '@shared/theme';
import LockerHomeScreen from '@features/locker/screens/LockerHomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for other tabs
const StatsScreen = () => <></>;
const RecruitingScreen = () => <></>;
const GoalsScreen = () => <></>;

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 85 + insets.bottom,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: fontSizes.xs,
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Recruiting') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={LockerHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ title: 'Stats' }}
      />
      <Tab.Screen 
        name="Recruiting" 
        component={RecruitingScreen}
        options={{ title: 'Recruiting' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ title: 'Goals' }}
      />
    </Tab.Navigator>
  );
}
