import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import LockerHomeScreen from '@features/locker/screens/LockerHomeScreen';

const Tab = createBottomTabNavigator();

function StatsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Stats</Text>
      <Text style={styles.placeholderSubtext}>Track your performance</Text>
    </View>
  );
}

function RecruitingScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Recruiting</Text>
      <Text style={styles.placeholderSubtext}>Connect with colleges</Text>
    </View>
  );
}

function GoalsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Goals</Text>
      <Text style={styles.placeholderSubtext}>Set and achieve your targets</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 85,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: theme.fontSizes.xs,
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
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ tabBarLabel: 'Stats' }}
      />
      <Tab.Screen 
        name="Recruiting" 
        component={RecruitingScreen}
        options={{ tabBarLabel: 'Recruiting' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ tabBarLabel: 'Goals' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  placeholderText: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
