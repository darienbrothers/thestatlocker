import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { MainTabParamList } from './types';
import { RootStackParamList } from '@/types';
import { theme } from '@/constants/theme';
import LockerHomeScreen from '@features/locker/screens/LockerHomeScreen';
import { FABActionWheel } from '@/components/common/FABActionWheel';
import { useGameStateStore } from '@/shared/stores/gameStateStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import GameTrackingModal from '@/shared/components/GameTrackingModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for other tabs
const StatsScreen = () => <></>;
const RecruitingScreen = () => <></>;
const SkillsScreen = () => <></>;

interface MainTabNavigatorProps {
  route?: RouteProp<RootStackParamList, 'MainTabs'>;
}

// Custom FAB Component
const FloatingActionButton: React.FC<{ onPress: () => void }> = ({
  onPress,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [breathingAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const { gameState, checkPostGameStatus } = useGameStateStore();

  React.useEffect(() => {
    // Check post-game status on mount
    checkPostGameStatus();
  }, []);

  React.useEffect(() => {
    // Different animations based on game state
    if (gameState.isActive) {
      // Active game: pulsing red animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else if (gameState.isPostGame) {
      // Post-game: gentle bounce animation
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.08,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      bounceLoop.start();
      return () => bounceLoop.stop();
    } else {
      // Default: subtle breathing animation
      const breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );
      breathingLoop.start();
      return () => breathingLoop.stop();
    }
  }, [gameState.isActive, gameState.isPostGame]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  // Get FAB colors and icon based on game state
  const getFABAppearance = () => {
    if (gameState.isActive) {
      return {
        colors: [theme.colors.error, '#DC2626'] as const, // Red gradient for active game
        icon: 'pause' as keyof typeof Ionicons.glyphMap,
      };
    } else if (gameState.isPostGame) {
      return {
        colors: [theme.colors.warning, '#D97706'] as const, // Orange gradient for post-game
        icon: 'create' as keyof typeof Ionicons.glyphMap,
      };
    } else {
      return {
        colors: [theme.colors.primary, theme.colors.primaryDark] as const, // Default purple
        icon: 'add' as keyof typeof Ionicons.glyphMap,
      };
    }
  };

  const fabAppearance = getFABAppearance();
  const animationScale = gameState.isActive ? pulseAnim : breathingAnim;

  return (
    <View style={styles.fabContainer}>
      <Animated.View
        style={[
          styles.fabWrapper,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, animationScale) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={fabAppearance.colors}
            style={styles.fabGradient}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Ionicons
              name={fabAppearance.icon}
              size={28}
              color={theme.colors.white}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function MainTabNavigator({ route }: MainTabNavigatorProps) {
  const insets = useSafeAreaInsets();
  const onboardingData = route?.params?.onboardingData;
  const [actionWheelVisible, setActionWheelVisible] = useState(false);
  const [showLogGameModal, setShowLogGameModal] = useState(false);
  const { markTaskCompleted } = useProgressStore();

  const handleFABPress = () => {
    setActionWheelVisible(true);
  };

  const handleActionWheelClose = () => {
    setActionWheelVisible(false);
  };

  // Calculate FAB position for action wheel
  const fabPosition = {
    x: screenWidth / 2,
    y: screenHeight - 75 - 32, // Updated to match new FAB position
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }: { route: any }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.white,
            borderTopColor: theme.colors.neutral200,
            borderTopWidth: 1,
            height: 85 + insets.bottom,
            paddingBottom: insets.bottom + 10,
            paddingTop: 8,
            shadowColor: theme.colors.black,
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontFamily: theme.fonts.jakarta.medium,
            fontSize: 11,
            marginTop: -2,
          },
          tabBarIcon: ({
            focused,
            color,
            size,
          }: {
            focused: boolean;
            color: string;
            size: number;
          }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Recruiting') {
              iconName = focused ? 'school' : 'school-outline';
            } else if (route.name === 'Skills') {
              iconName = focused ? 'barbell' : 'barbell-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          options={{ title: 'Home' }}
          component={(props: StackScreenProps<MainTabParamList, 'Home'>) => (
            <LockerHomeScreen {...props} onboardingData={onboardingData} />
          )}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: 'Stats' }}
        />
        <Tab.Screen
          name="FAB"
          component={View}
          options={{
            title: '',
            tabBarButton: () => null, // Hide the tab button for FAB
          }}
        />
        <Tab.Screen
          name="Recruiting"
          component={RecruitingScreen}
          options={{ title: 'Recruiting' }}
        />
        <Tab.Screen
          name="Skills"
          component={SkillsScreen}
          options={{ title: 'Skills' }}
        />
      </Tab.Navigator>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleFABPress} />

      {/* FAB Action Wheel */}
      <FABActionWheel
        visible={actionWheelVisible}
        onClose={handleActionWheelClose}
        fabPosition={fabPosition}
        onLiveTrack={() => {
          setActionWheelVisible(false);
          // TODO: Implement live tracking
        }}
        onPostGame={() => {
          setActionWheelVisible(false);
          setShowLogGameModal(true);
        }}
      />

      {/* Game Tracking Modal */}
      <GameTrackingModal
        visible={showLogGameModal}
        onClose={async () => {
          setShowLogGameModal(false);
          await markTaskCompleted('DEMO_GAME_TRACKING');
        }}
        initialMode="setup"
        onGameLogged={gameData => {
          console.log('Game logged:', gameData);
        }}
        demoMode={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 75, // Shifted further up to sit more prominently above nav bar
    left: '50%',
    marginLeft: -32, // Half of FAB width (64px)
    zIndex: 1000,
  },
  fabWrapper: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
