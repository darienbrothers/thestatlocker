import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, fonts, fontSizes, spacing, borderRadius } from '@/constants/theme';
import { GameStats } from '@/types';
import { useGameStore } from '@shared/stores/gameStore';
import { useAuthStore } from '@shared/stores/authStore';
import { useGamificationStore } from '@shared/stores/gamificationStore';

interface LogGameModalProps {
  visible: boolean;
  onClose: () => void;
  userPosition?: string;
  onGameLogged?: (gameData: any) => void;
}

const LogGameModal: React.FC<LogGameModalProps> = ({ visible, onClose, userPosition, onGameLogged }) => {
  const { user } = useAuthStore();
  const { logGame, isLoading } = useGameStore();
  const { addXP } = useGamificationStore();
  
  // Use user's actual position from auth store, fallback to prop, then default
  const actualPosition = user?.position || userPosition || 'Attack';

  // Game Details
  const [opponent, setOpponent] = useState('');
  const [gameDate, setGameDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [seasonType, setSeasonType] = useState<'School Season' | 'Club Season'>('School Season');
  const [venue, setVenue] = useState('');
  const [teamScore, setTeamScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');

  // Stats
  const [stats, setStats] = useState<GameStats>({
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnGoal: 0,
    turnovers: 0,
    groundBalls: 0,
    causedTurnovers: 0,
    fouls: 0,
    penalties: 0,
  });

  // Position-specific stats
  useEffect(() => {
    if (actualPosition === 'Goalie') {
      setStats(prev => ({ ...prev, saves: 0, goalsAgainst: 0 }));
    } else if (actualPosition === 'FOGO') {
      setStats(prev => ({ ...prev, faceoffWins: 0, faceoffLosses: 0 }));
    }
  }, [actualPosition]);

  // Live Calculations
  const shootingPercentage = stats.shots > 0 ? ((stats.goals / stats.shots) * 100).toFixed(1) : '0.0';
  const shotsOnGoalPercentage = stats.shots > 0 ? ((stats.shotsOnGoal / stats.shots) * 100).toFixed(1) : '0.0';
  const totalPoints = stats.goals + stats.assists;
  const savePercentage = actualPosition === 'Goalie' && (stats.saves || 0) + (stats.goalsAgainst || 0) > 0 
    ? (((stats.saves || 0) / ((stats.saves || 0) + (stats.goalsAgainst || 0))) * 100).toFixed(1) 
    : '0.0';

  const updateStat = (key: keyof GameStats, value: number) => {
    setStats(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const handleSaveGame = async () => {
    if (!opponent.trim()) {
      Alert.alert('Error', 'Please enter an opponent name');
      return;
    }

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
        isHome: true, // Default for now
        teamScore: teamScore ? parseInt(teamScore) : 0,
        opponentScore: opponentScore ? parseInt(opponentScore) : 0,
        stats,
        position: actualPosition as string,
        notes: '',
      };

      await logGame(gameData);
      await addXP(25, 'Game Logged'); // Award XP for logging game
      
      // Call the gamification callback if provided
      if (onGameLogged) {
        await onGameLogged(gameData);
      }
      
      Alert.alert('Success', 'Game logged successfully!', [
        { text: 'OK', onPress: onClose }
      ]);
      
      // Reset form
      setOpponent('');
      setVenue('');
      setTeamScore('');
      setOpponentScore('');
      setStats({
        goals: 0,
        assists: 0,
        shots: 0,
        shotsOnGoal: 0,
        turnovers: 0,
        groundBalls: 0,
        causedTurnovers: 0,
        fouls: 0,
        penalties: 0,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to log game. Please try again.');
    }
  };

  const StatInput = ({ label, value, onChangeValue, color = colors.primary }: {
    label: string;
    value: number;
    onChangeValue: (value: number) => void;
    color?: string;
  }) => (
    <View style={styles.statInputContainer}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statControls}>
        <TouchableOpacity
          style={[styles.statButton, { borderColor: color }]}
          onPress={() => onChangeValue(value - 1)}
        >
          <Ionicons name="remove" size={20} color={color} />
        </TouchableOpacity>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <TouchableOpacity
          style={[styles.statButton, { borderColor: color }]}
          onPress={() => onChangeValue(value + 1)}
        >
          <Ionicons name="add" size={20} color={color} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log a New Game</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Game Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Game Details</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Basic information about the game</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Opponent</Text>
              <TextInput
                style={styles.textInput}
                value={opponent}
                onChangeText={setOpponent}
                placeholder="Enter opponent name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Game Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {gameDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Season Type</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    seasonType === 'School Season' && styles.segmentButtonActive
                  ]}
                  onPress={() => setSeasonType('School Season')}
                >
                  <Text style={[
                    styles.segmentText,
                    seasonType === 'School Season' && styles.segmentTextActive
                  ]}>
                    School Season
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    seasonType === 'Club Season' && styles.segmentButtonActive
                  ]}
                  onPress={() => setSeasonType('Club Season')}
                >
                  <Text style={[
                    styles.segmentText,
                    seasonType === 'Club Season' && styles.segmentTextActive
                  ]}>
                    Club Season
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.positionBadge}>Position: {actualPosition}</Text>
              <Text style={styles.sectionTitle}>Your Stats ({actualPosition})</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Enter your performance statistics for this game</Text>

            <View style={styles.statsGrid}>
              <StatInput
                label="Goals"
                value={stats.goals}
                onChangeValue={(value) => updateStat('goals', value)}
                color={colors.success}
              />
              <StatInput
                label="Assists"
                value={stats.assists}
                onChangeValue={(value) => updateStat('assists', value)}
                color={colors.primary}
              />
              <StatInput
                label="Shots"
                value={stats.shots}
                onChangeValue={(value) => updateStat('shots', value)}
              />
              <StatInput
                label="Shots on Goal"
                value={stats.shotsOnGoal}
                onChangeValue={(value) => updateStat('shotsOnGoal', value)}
              />
              <StatInput
                label="Turnovers"
                value={stats.turnovers}
                onChangeValue={(value) => updateStat('turnovers', value)}
                color={colors.error}
              />
              <StatInput
                label="Ground Balls"
                value={stats.groundBalls}
                onChangeValue={(value) => updateStat('groundBalls', value)}
              />
              <StatInput
                label="Caused Turnovers"
                value={stats.causedTurnovers}
                onChangeValue={(value) => updateStat('causedTurnovers', value)}
                color={colors.success}
              />
              <StatInput
                label="Fouls"
                value={stats.fouls}
                onChangeValue={(value) => updateStat('fouls', value)}
                color={colors.warning}
              />

              {/* Position-specific stats */}
              {actualPosition === 'Goalie' && (
                <>
                  <StatInput
                    label="Saves"
                    value={stats.saves || 0}
                    onChangeValue={(value) => updateStat('saves', value)}
                    color={colors.success}
                  />
                  <StatInput
                    label="Goals Against"
                    value={stats.goalsAgainst || 0}
                    onChangeValue={(value) => updateStat('goalsAgainst', value)}
                    color={colors.error}
                  />
                </>
              )}

              {actualPosition === 'FOGO' && (
                <>
                  <StatInput
                    label="Faceoff Wins"
                    value={stats.faceoffWins || 0}
                    onChangeValue={(value) => updateStat('faceoffWins', value)}
                    color={colors.success}
                  />
                  <StatInput
                    label="Faceoff Losses"
                    value={stats.faceoffLosses || 0}
                    onChangeValue={(value) => updateStat('faceoffLosses', value)}
                    color={colors.error}
                  />
                </>
              )}
            </View>
          </View>

          {/* Live Calculations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Live Calculations</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Auto-calculated stats as you type</Text>

            <View style={styles.calculationsGrid}>
              <View style={styles.calculationCard}>
                <Text style={styles.calculationValue}>{shootingPercentage}%</Text>
                <Text style={styles.calculationLabel}>Shooting %</Text>
              </View>
              <View style={styles.calculationCard}>
                <Text style={styles.calculationValue}>{shotsOnGoalPercentage}%</Text>
                <Text style={styles.calculationLabel}>Shots on Goal %</Text>
              </View>
              <View style={styles.calculationCard}>
                <Text style={styles.calculationValue}>{totalPoints}</Text>
                <Text style={styles.calculationLabel}>Total Points</Text>
              </View>
              {actualPosition === 'Goalie' && (
                <View style={styles.calculationCard}>
                  <Text style={styles.calculationValue}>{savePercentage}%</Text>
                  <Text style={styles.calculationLabel}>Save %</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveGame}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Game'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={gameDate}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setGameDate(selectedDate);
              }
            }}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  dateText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.text,
  },
  segmentTextActive: {
    color: colors.surface,
  },
  positionBadge: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statInputContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.medium,
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  calculationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calculationCard: {
    width: '48%',
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  calculationValue: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  calculationLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.heading,
    color: colors.surface,
  },
});

export default LogGameModal;
