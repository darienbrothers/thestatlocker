import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/constants/theme';
import { GameStats } from '@/types';

interface LiveTrackingViewProps {
  stats: GameStats;
  updateStat: (key: keyof GameStats, increment?: number) => void;
  actualPosition: string;
  opponent: string;
  gameStartTime: Date | null;
  onEndGame: () => void;
}

const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  stats,
  updateStat,
  actualPosition,
  opponent,
  gameStartTime,
  onEndGame,
}) => {
  const [gameTime, setGameTime] = useState('00:00');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Game timer
  useEffect(() => {
    if (!gameStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - gameStartTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setGameTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Pulse animation for live indicator
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handleQuickAction = (
    statKey: keyof GameStats,
    increment: number = 1,
  ) => {
    updateStat(statKey, increment);

    // Enhanced haptic feedback based on action type
    if (increment > 0) {
      if (statKey === 'goals' || statKey === 'saves') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        key: 'goals' as keyof GameStats,
        label: 'GOAL!',
        icon: 'football',
        color: colors.success,
      },
      {
        key: 'assists' as keyof GameStats,
        label: 'ASSIST!',
        icon: 'hand-left',
        color: colors.primary,
      },
      {
        key: 'shots' as keyof GameStats,
        label: 'SHOT',
        icon: 'radio-button-on',
        color: colors.warning,
      },
      {
        key: 'groundBalls' as keyof GameStats,
        label: 'GROUND BALL',
        icon: 'ellipse',
        color: colors.info,
      },
    ];

    if (actualPosition === 'Goalie') {
      return [
        {
          key: 'saves' as keyof GameStats,
          label: 'SAVE!',
          icon: 'shield',
          color: colors.success,
        },
        {
          key: 'goalsAgainst' as keyof GameStats,
          label: 'GOAL AGAINST',
          icon: 'close-circle',
          color: colors.error,
        },
        {
          key: 'groundBalls' as keyof GameStats,
          label: 'GROUND BALL',
          icon: 'ellipse',
          color: colors.info,
        },
        {
          key: 'causedTurnovers' as keyof GameStats,
          label: 'CAUSED TO',
          icon: 'swap-horizontal',
          color: colors.primary,
        },
      ];
    } else if (actualPosition === 'FOGO') {
      return [
        {
          key: 'faceoffWins' as keyof GameStats,
          label: 'FACEOFF WIN',
          icon: 'checkmark-circle',
          color: colors.success,
        },
        {
          key: 'faceoffLosses' as keyof GameStats,
          label: 'FACEOFF LOSS',
          icon: 'close-circle',
          color: colors.error,
        },
        ...baseActions.slice(2), // Include shots and ground balls
      ];
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  const ActionButton = ({ action }: { action: any }) => {
    const [buttonScale] = useState(new Animated.Value(1));

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      handleQuickAction(action.key);
    };

    return (
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: action.color }]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[action.color, action.color + '20']}
            style={styles.actionButtonGradient}
          >
            <Ionicons name={action.icon} size={32} color={action.color} />
            <Text style={[styles.actionButtonText, { color: action.color }]}>
              {action.label}
            </Text>
            <View style={[styles.statBadge, { backgroundColor: action.color }]}>
              <Text style={styles.statBadgeText}>
                {(stats[action.key as keyof GameStats] as number) || 0}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Game Status Header */}
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <Text style={styles.opponentName}>vs {opponent}</Text>
          <View style={styles.gameStatus}>
            <Animated.View
              style={[
                styles.liveIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </Animated.View>
            <Text style={styles.gameTimer}>{gameTime}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Summary */}
      <View style={styles.quickStats}>
        <Text style={styles.quickStatsTitle}>Quick Stats</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
        >
          {Object.entries(stats).map(([key, value]) => {
            if (value === undefined || value === 0) {
              return null;
            }
            return (
              <View key={key} style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{value}</Text>
                <Text style={styles.quickStatLabel}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Quick Action Buttons */}
      <ScrollView
        style={styles.actionsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <Text style={styles.actionsSubtitle}>
          Tap to instantly log stats during the game
        </Text>

        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <ActionButton key={index} action={action} />
          ))}
        </View>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <Text style={styles.additionalTitle}>Other Actions</Text>
          <View style={styles.smallActionsGrid}>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleQuickAction('turnovers')}
            >
              <Ionicons name="refresh" size={20} color={colors.error} />
              <Text style={styles.smallActionText}>Turnover</Text>
              <Text style={styles.smallActionCount}>{stats.turnovers}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleQuickAction('fouls')}
            >
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.smallActionText}>Foul</Text>
              <Text style={styles.smallActionCount}>{stats.fouls}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleQuickAction('causedTurnovers')}
            >
              <Ionicons
                name="swap-horizontal"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.smallActionText}>Caused TO</Text>
              <Text style={styles.smallActionCount}>
                {stats.causedTurnovers}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* End Game Button */}
      <View style={styles.endGameSection}>
        <TouchableOpacity
          style={styles.endGameButton}
          onPress={onEndGame}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.error, '#dc2626']}
            style={styles.endGameGradient}
          >
            <Ionicons name="stop" size={24} color="white" />
            <Text style={styles.endGameText}>End Game</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gameHeader: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gameInfo: {
    alignItems: 'center',
  },
  opponentName: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  gameStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: spacing.xs,
  },
  liveText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.error,
    letterSpacing: 1,
  },
  gameTimer: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  quickStats: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickStatsTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statsScroll: {
    flexDirection: 'row',
  },
  quickStatItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  quickStatValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.primary,
  },
  quickStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  actionsTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionsSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 80,
  },
  actionButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    flex: 1,
    marginLeft: spacing.md,
  },
  statBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadgeText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: 'white',
  },
  additionalActions: {
    marginTop: spacing.xl,
  },
  additionalTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  smallActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  smallActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallActionText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  smallActionCount: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  endGameSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  endGameButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  endGameGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  endGameText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: 'white',
    marginLeft: spacing.sm,
  },
});

export default LiveTrackingView;
