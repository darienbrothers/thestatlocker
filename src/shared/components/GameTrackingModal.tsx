import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, fonts, fontSizes, spacing } from '@/constants/theme';
import { GameStats } from '@/types';
import { useGameStore } from '@shared/stores/gameStore';
import { useAuthStore } from '@shared/stores/authStore';
import PreGameSetupView from '@shared/components/PreGameSetupView';
import LiveTrackingView from '@shared/components/LiveTrackingView';
import PostGameView from '@shared/components/PostGameView';
import DemoModalManager from './DemoModalManager';
import { DEMO_GAME_DATA } from '@shared/data/mockData';

export type GameTrackingMode = 'setup' | 'live' | 'post-game';

interface GameTrackingModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: GameTrackingMode;
  onGameLogged?: (gameData: any) => void;
  demoMode?: boolean;
}

const GameTrackingModal: React.FC<GameTrackingModalProps> = ({
  visible,
  onClose,
  initialMode = 'setup',
  onGameLogged,
  demoMode = false,
}) => {
  const { user } = useAuthStore();
  const { logGame, isLoading } = useGameStore();

  // Use user's actual position from auth store, fallback to default
  const actualPosition = user?.position || 'Attack';

  // Modal state
  const [mode, setMode] = useState<GameTrackingMode>(initialMode);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // Animation values
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // Game Details
  const [opponent, setOpponent] = useState('');
  const [gameDate, setGameDate] = useState(new Date());
  const [seasonType, setSeasonType] = useState<'School Season' | 'Club Season'>(
    'School Season',
  );
  const [venue, setVenue] = useState('');
  const [teamScore, setTeamScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');

  // Initialize stats with position-specific fields
  const getInitialStats = (): GameStats => {
    const baseStats: GameStats = {
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnGoal: 0,
      turnovers: 0,
      groundBalls: 0,
      causedTurnovers: 0,
      fouls: 0,
      penalties: 0,
    };

    // Add position-specific stats
    if (actualPosition === 'Goalie') {
      baseStats.saves = 0;
      baseStats.goalsAgainst = 0;
    } else if (actualPosition === 'FOGO') {
      baseStats.faceoffWins = 0;
      baseStats.faceoffLosses = 0;
    }

    return baseStats;
  };

  const [stats, setStats] = useState<GameStats>(() => getInitialStats());

  // Update stats when position changes
  useEffect(() => {
    if (visible) {
      setStats(getInitialStats());
    }
  }, [actualPosition, visible]);

  // Reset modal when closed
  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setMode(initialMode);
        setGameStartTime(null);
        setIsGameActive(false);
        setOpponent('');
        setVenue('');
        setTeamScore('');
        setOpponentScore('');
        setStats(getInitialStats());
      }, 300);
    }
  }, [visible, initialMode]);

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleStartGame = () => {
    if (!opponent.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter an opponent name to start the game',
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGameStartTime(new Date());
    setIsGameActive(true);
    setMode('live');
  };

  const handleEndGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGameActive(false);
    setMode('post-game');
  };

  const handleSaveGame = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const gameData = {
        userId: user.id,
        date: gameDate,
        opponent: opponent.trim(),
        venue: venue || '',
        seasonType,
        gameType: 'Regular Season' as const,
        isHome: true,
        teamScore: teamScore ? parseInt(teamScore, 10) : 0,
        opponentScore: opponentScore ? parseInt(opponentScore, 10) : 0,
        stats,
        position: actualPosition,
        notes: '',
        gameStartTime,
        gameEndTime: new Date(),
      };

      await logGame(gameData);

      if (onGameLogged) {
        await onGameLogged(gameData);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Game logged successfully!', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to log game. Please try again.');
    }
  };

  const updateStat = (key: keyof GameStats, increment: number = 1) => {
    setStats(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + increment),
    }));

    // Haptic feedback for stat updates
    if (increment > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'setup':
        return 'Start New Game';
      case 'live':
        return `Live: vs ${opponent}`;
      case 'post-game':
        return 'Game Summary';
      default:
        return 'Game Tracking';
    }
  };

  const slideTransform = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  if (demoMode) {
    return (
      <DemoModalManager
        visible={visible}
        onClose={onClose}
        demoType="game_tracking"
      >
        <View style={styles.demoContent}>
          <Text style={styles.demoTitle}>Game Tracking Demo</Text>
          <Text style={styles.demoDescription}>
            Experience the complete game tracking flow from setup to post-game
            analysis.
          </Text>

          <View style={styles.demoSteps}>
            <View style={styles.demoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Pre-Game Setup</Text>
                <Text style={styles.stepDescription}>
                  Enter opponent, venue, and game details
                </Text>
              </View>
            </View>

            <View style={styles.demoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Live Tracking</Text>
                <Text style={styles.stepDescription}>
                  Track stats in real-time during the game
                </Text>
              </View>
            </View>

            <View style={styles.demoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Post-Game Review</Text>
                <Text style={styles.stepDescription}>
                  Review stats and save your performance
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.demoGameCard}>
            <Text style={styles.demoGameTitle}>
              Sample Game: vs {DEMO_GAME_DATA.opponent}
            </Text>
            <View style={styles.demoStats}>
              <View style={styles.demoStatItem}>
                <Text style={styles.demoStatValue}>
                  {DEMO_GAME_DATA.stats.goals}
                </Text>
                <Text style={styles.demoStatLabel}>Goals</Text>
              </View>
              <View style={styles.demoStatItem}>
                <Text style={styles.demoStatValue}>
                  {DEMO_GAME_DATA.stats.assists}
                </Text>
                <Text style={styles.demoStatLabel}>Assists</Text>
              </View>
              <View style={styles.demoStatItem}>
                <Text style={styles.demoStatValue}>
                  {DEMO_GAME_DATA.stats.shots}
                </Text>
                <Text style={styles.demoStatLabel}>Shots</Text>
              </View>
              <View style={styles.demoStatItem}>
                <Text style={styles.demoStatValue}>
                  {DEMO_GAME_DATA.stats.groundBalls}
                </Text>
                <Text style={styles.demoStatLabel}>GBs</Text>
              </View>
            </View>
            <Text style={styles.demoResult}>
              Final Score: {DEMO_GAME_DATA.teamScore} -{' '}
              {DEMO_GAME_DATA.opponentScore}
            </Text>
          </View>
        </View>
      </DemoModalManager>
    );
  }

  return (
    <Modal visible={visible} animationType="none" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Animated.View style={slideTransform}>
              <Text style={styles.headerTitle}>{getModalTitle()}</Text>
              {mode === 'live' && isGameActive && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </Animated.View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Dynamic Content Based on Mode */}
          <Animated.View style={[styles.modalContent, slideTransform]}>
            {mode === 'setup' && (
              <PreGameSetupView
                opponent={opponent}
                setOpponent={setOpponent}
                gameDate={gameDate}
                setGameDate={setGameDate}
                seasonType={seasonType}
                setSeasonType={setSeasonType}
                venue={venue}
                setVenue={setVenue}
                actualPosition={actualPosition}
                onStartGame={handleStartGame}
              />
            )}

            {mode === 'live' && (
              <LiveTrackingView
                stats={stats}
                updateStat={updateStat}
                actualPosition={actualPosition}
                opponent={opponent}
                gameStartTime={gameStartTime}
                onEndGame={handleEndGame}
              />
            )}

            {mode === 'post-game' && (
              <PostGameView
                stats={stats}
                updateStat={updateStat}
                actualPosition={actualPosition}
                opponent={opponent}
                teamScore={teamScore}
                setTeamScore={setTeamScore}
                opponentScore={opponentScore}
                setOpponentScore={setOpponentScore}
                venue={venue}
                setVenue={setVenue}
                onSaveGame={handleSaveGame}
                isLoading={isLoading}
              />
            )}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.text,
    textAlign: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
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
  headerSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  demoContent: {
    flex: 1,
    padding: spacing.md,
  },
  demoTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  demoDescription: {
    fontSize: fontSizes.base,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  demoSteps: {
    marginBottom: spacing.lg,
  },
  demoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.surface,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  demoGameCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  demoGameTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  demoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  demoStatItem: {
    alignItems: 'center',
  },
  demoStatValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.primary,
  },
  demoStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  demoResult: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.text,
    textAlign: 'center',
  },
});

export default GameTrackingModal;
