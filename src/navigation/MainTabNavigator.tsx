import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { colors, fonts, fontSizes } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens - will be implemented in Phase 4
function LockerScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Locker Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming in Phase 4</Text>
    </View>
  );
}

function StatsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Stats Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming in Phase 4</Text>
    </View>
  );
}

function GoalsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Goals Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming in Phase 4</Text>
    </View>
  );
}

function RecruitingScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Recruiting Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming in Phase 4</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Profile Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming in Phase 4</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.neutral200,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.jakarta.medium,
          fontSize: fontSizes.xs,
        },
      }}
    >
      <Tab.Screen name="Locker" component={LockerScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Recruiting" component={RecruitingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
});
