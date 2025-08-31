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

import { colors, fonts, fontSizes, COLORS, FONTS } from '../constants/theme';
import { GameStats } from '../types';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useGamificationStore } from '../stores/gamificationStore';

interface LogGameModalProps {
  visible: boolean;
  onClose: () => void;
  userPosition?: string;
}

const LogGameModal: React.FC<LogGameModalProps> = ({ visible, onClose, userPosition = 'Attack' }) => {
  const { user } = useAuthStore();
  const { logGame, isLoading } = useGameStore();
  const { addXP } = useGamificationStore();

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
    if (userPosition === 'Goalie') {
      setStats(prev => ({ ...prev, saves: 0, goalsAgainst: 0 }));
    } else if (userPosition === 'FOGO') {
      setStats(prev => ({ ...prev, faceoffWins: 0, faceoffLosses: 0 }));
    }
  }, [userPosition]);

  // Live Calculations
  const shootingPercentage = stats.shots > 0 ? ((stats.goals / stats.shots) * 100).toFixed(1) : '0.0';
  const shotsOnGoalPercentage = stats.shots > 0 ? ((stats.shotsOnGoal / stats.shots) * 100).toFixed(1) : '0.0';
  const totalPoints = stats.goals + stats.assists;
  const savePercentage = userPosition === 'Goalie' && (stats.saves || 0) + (stats.goalsAgainst || 0) > 0 
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

    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const gameData = {
        userId: user.uid,
        date: gameDate,
        opponent: opponent.trim(),
        venue: venue.trim() || undefined,
        seasonType,
        gameType: 'Regular Season' as const,
        isHome: true, // Default for now
        teamScore: teamScore ? parseInt(teamScore) : undefined,
        opponentScore: opponentScore ? parseInt(opponentScore) : undefined,
        stats,
        position: userPosition,
        notes: undefined,
      };

      await logGame(gameData);
      await addXP(25, 'Game Logged'); // Award XP for logging game
      
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

  const StatInput = ({ label, value, onChangeValue, color = COLORS.primary }: {
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
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log a New Game</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Game Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
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
                placeholderTextColor={COLORS.textSecondary}
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
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
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
              <Text style={styles.positionBadge}>Position: {userPosition}</Text>
              <Text style={styles.sectionTitle}>Your Stats ({userPosition})</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Enter your performance statistics for this game</Text>

            <View style={styles.statsGrid}>
              <StatInput
                label="Goals"
                value={stats.goals}
                onChangeValue={(value) => updateStat('goals', value)}
                color={COLORS.success}
              />
              <StatInput
                label="Assists"
                value={stats.assists}
                onChangeValue={(value) => updateStat('assists', value)}
                color={COLORS.primary}
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
                color={COLORS.error}
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
                color={COLORS.success}
              />
              <StatInput
                label="Fouls"
                value={stats.fouls}
                onChangeValue={(value) => updateStat('fouls', value)}
                color={COLORS.warning}
              />

              {/* Position-specific stats */}
              {userPosition === 'Goalie' && (
                <>
                  <StatInput
                    label="Saves"
                    value={stats.saves || 0}
                    onChangeValue={(value) => updateStat('saves', value)}
                    color={COLORS.success}
                  />
                  <StatInput
                    label="Goals Against"
                    value={stats.goalsAgainst || 0}
                    onChangeValue={(value) => updateStat('goalsAgainst', value)}
                    color={COLORS.error}
                  />
                </>
              )}

              {userPosition === 'FOGO' && (
                <>
                  <StatInput
                    label="Faceoff Wins"
                    value={stats.faceoffWins || 0}
                    onChangeValue={(value) => updateStat('faceoffWins', value)}
                    color={COLORS.success}
                  />
                  <StatInput
                    label="Faceoff Losses"
                    value={stats.faceoffLosses || 0}
                    onChangeValue={(value) => updateStat('faceoffLosses', value)}
                    color={COLORS.error}
                  />
                </>
              )}
            </View>
          </View>

          {/* Live Calculations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={20} color={COLORS.primary} />
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
              {userPosition === 'Goalie' && (
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
              colors={[COLORS.primary, COLORS.primaryDark]}
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
            onChange={(event, selectedDate) => {
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  positionBadge: {
    fontSize: fontSizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: fontSizes.base,
    fontFamily: FONTS.body,
    color: COLORS.text,
    backgroundColor: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: fontSizes.base,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  segmentTextActive: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statInputContainer: {
    width: '48%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.text,
    marginBottom: 8,
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
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontFamily: FONTS.heading,
    marginHorizontal: 16,
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
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calculationValue: {
    fontSize: fontSizes['2xl'],
    fontFamily: FONTS.heading,
    color: COLORS.primary,
    marginBottom: 4,
  },
  calculationLabel: {
    fontSize: fontSizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSizes.base,
    fontFamily: FONTS.heading,
    color: 'white',
  },
});

export default LogGameModal;
