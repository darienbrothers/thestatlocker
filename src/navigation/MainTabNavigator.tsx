import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';
import { colors, fonts, fontSizes, COLORS, FONTS } from '../constants/theme';
import { useGamificationStore } from '../stores/gamificationStore';

interface PositionStrengthsData {
  [key: string]: string[];
}

interface GenderStrengths {
  boys: PositionStrengthsData;
  girls: PositionStrengthsData;
}

const Tab = createBottomTabNavigator<MainTabParamList>();

// Skeleton screens for testing onboarding flow
function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { totalXP, currentLevel, xpToNextLevel } = useGamificationStore((state) => ({
    totalXP: state.totalXP,
    currentLevel: state.currentLevel,
    xpToNextLevel: state.xpToNextLevel
  }));

  return (
    <SafeAreaView style={[styles.placeholder, { paddingBottom: insets.bottom }]}>
      <Text style={styles.placeholderText}>🏠 Home Dashboard</Text>
      <Text style={styles.placeholderSubtext}>Welcome to StatLocker!</Text>
      <Text style={styles.placeholderSubtext}>Your athletic journey starts here</Text>
      <View style={styles.xpContainer}>
        <Text style={styles.xpText}>Level {currentLevel.name}</Text>
        <Text style={styles.xpText}>XP: {totalXP} / {xpToNextLevel}</Text>
        <View style={styles.xpProgressBar}>
          <View style={[styles.xpProgressBarFill, { width: `${(totalXP / xpToNextLevel) * 100}%` }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>📊 Stats</Text>
      <Text style={styles.placeholderSubtext}>Track your performance</Text>
    </View>
  );
}

function RecruitingScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>🎯 Recruiting</Text>
      <Text style={styles.placeholderSubtext}>Connect with colleges</Text>
    </View>
  );
}

function GoalsScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>🏆 Goals</Text>
      <Text style={styles.placeholderSubtext}>Set and achieve your targets</Text>
    </View>
  );
}

// Placeholder for FAB functionality
function FABPlaceholder() {
  return null; // This won't be rendered as a screen
}

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: colors.neutral200,
          height: 85 + insets.bottom,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: fontSizes.xs,
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'AddStat') {
            // This is our FAB - we'll render a custom component
            return (
              <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab}>
                  <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
              </View>
            );
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
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ tabBarLabel: 'Stats' }}
      />
      <Tab.Screen 
        name="AddStat" 
        component={FABPlaceholder}
        options={{ 
          tabBarLabel: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.fabButton}
              onPress={() => {
                // TODO: Open add stat modal
                console.log('FAB pressed - open add stat modal');
              }}
            >
              <View style={styles.fab}>
                <Ionicons name="add" size={28} color="white" />
              </View>
            </TouchableOpacity>
          ),
        }}
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
    backgroundColor: COLORS.background,
    padding: 20,
  },
  placeholderText: {
    fontSize: fontSizes['2xl'],
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: fontSizes.base,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  xpContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  xpText: {
    fontSize: fontSizes.base,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  xpProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral200,
    overflow: 'hidden',
  },
  xpProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  fabContainer: {
    top: -15,
  },
  fabButton: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
