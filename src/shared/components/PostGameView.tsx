import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from '@/constants/theme';
import { GameStats } from '@/types';

interface PostGameViewProps {
  stats: GameStats;
  updateStat: (key: keyof GameStats, increment?: number) => void;
  actualPosition: string;
  opponent: string;
  teamScore: string;
  setTeamScore: (value: string) => void;
  opponentScore: string;
  setOpponentScore: (value: string) => void;
  venue: string;
  setVenue: (value: string) => void;
  onSaveGame: () => void;
  isLoading: boolean;
}

const PostGameView: React.FC<PostGameViewProps> = ({
  stats,
  updateStat,
  actualPosition,
  opponent,
  teamScore,
  setTeamScore,
  opponentScore,
  setOpponentScore,
  venue,
  setVenue,
  onSaveGame,
  isLoading,
}) => {
  const StatInput = ({
    label,
    value,
    onChangeValue,
    color = colors.primary,
  }: {
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

  // Live Calculations
  const shootingPercentage =
    stats.shots > 0 ? ((stats.goals / stats.shots) * 100).toFixed(1) : '0.0';
  const shotsOnGoalPercentage =
    stats.shots > 0
      ? ((stats.shotsOnGoal / stats.shots) * 100).toFixed(1)
      : '0.0';
  const totalPoints = stats.goals + stats.assists;
  const savePercentage =
    actualPosition === 'Goalie' &&
    (stats.saves || 0) + (stats.goalsAgainst || 0) > 0
      ? (
          ((stats.saves || 0) /
            ((stats.saves || 0) + (stats.goalsAgainst || 0))) *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Game Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.gameResult}>
          <Text style={styles.opponentName}>vs {opponent}</Text>
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <View style={styles.scoreInputs}>
              <View style={styles.scoreInput}>
                <Text style={styles.teamLabel}>Your Team</Text>
                <TextInput
                  style={styles.scoreField}
                  value={teamScore}
                  onChangeText={setTeamScore}
                  placeholder="0"
                  keyboardType="numeric"
                  textAlign="center"
                />
              </View>
              <Text style={styles.scoreSeparator}>-</Text>
              <View style={styles.scoreInput}>
                <Text style={styles.teamLabel}>{opponent}</Text>
                <TextInput
                  style={styles.scoreField}
                  value={opponentScore}
                  onChangeText={setOpponentScore}
                  placeholder="0"
                  keyboardType="numeric"
                  textAlign="center"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Final Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Final Details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Venue (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={venue}
            onChangeText={setVenue}
            placeholder="Enter game location"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Stats Review */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.positionBadge}>Position: {actualPosition}</Text>
          <Text style={styles.sectionTitle}>Review Your Stats</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Make any final adjustments to your performance statistics
        </Text>

        <View style={styles.statsGrid}>
          <StatInput
            label="Goals"
            value={stats.goals}
            onChangeValue={value => updateStat('goals', value - stats.goals)}
            color={colors.success}
          />
          <StatInput
            label="Assists"
            value={stats.assists}
            onChangeValue={value =>
              updateStat('assists', value - stats.assists)
            }
            color={colors.primary}
          />
          <StatInput
            label="Shots"
            value={stats.shots}
            onChangeValue={value => updateStat('shots', value - stats.shots)}
          />
          <StatInput
            label="Shots on Goal"
            value={stats.shotsOnGoal}
            onChangeValue={value =>
              updateStat('shotsOnGoal', value - stats.shotsOnGoal)
            }
          />
          <StatInput
            label="Turnovers"
            value={stats.turnovers}
            onChangeValue={value =>
              updateStat('turnovers', value - stats.turnovers)
            }
            color={colors.error}
          />
          <StatInput
            label="Ground Balls"
            value={stats.groundBalls}
            onChangeValue={value =>
              updateStat('groundBalls', value - stats.groundBalls)
            }
          />
          <StatInput
            label="Caused Turnovers"
            value={stats.causedTurnovers}
            onChangeValue={value =>
              updateStat('causedTurnovers', value - stats.causedTurnovers)
            }
            color={colors.success}
          />
          <StatInput
            label="Fouls"
            value={stats.fouls}
            onChangeValue={value => updateStat('fouls', value - stats.fouls)}
            color={colors.warning}
          />

          {/* Position-specific stats */}
          {actualPosition === 'Goalie' && (
            <>
              <StatInput
                label="Saves"
                value={stats.saves || 0}
                onChangeValue={value =>
                  updateStat('saves', value - (stats.saves || 0))
                }
                color={colors.success}
              />
              <StatInput
                label="Goals Against"
                value={stats.goalsAgainst || 0}
                onChangeValue={value =>
                  updateStat('goalsAgainst', value - (stats.goalsAgainst || 0))
                }
                color={colors.error}
              />
            </>
          )}

          {actualPosition === 'FOGO' && (
            <>
              <StatInput
                label="Faceoff Wins"
                value={stats.faceoffWins || 0}
                onChangeValue={value =>
                  updateStat('faceoffWins', value - (stats.faceoffWins || 0))
                }
                color={colors.success}
              />
              <StatInput
                label="Faceoff Losses"
                value={stats.faceoffLosses || 0}
                onChangeValue={value =>
                  updateStat(
                    'faceoffLosses',
                    value - (stats.faceoffLosses || 0),
                  )
                }
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
          <Text style={styles.sectionTitle}>Performance Summary</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Calculated stats from your performance
        </Text>

        <View style={styles.calculationsGrid}>
          <View style={styles.calculationCard}>
            <Text style={styles.calculationValue}>{shootingPercentage}%</Text>
            <Text style={styles.calculationLabel}>Shooting %</Text>
          </View>
          <View style={styles.calculationCard}>
            <Text style={styles.calculationValue}>
              {shotsOnGoalPercentage}%
            </Text>
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

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={onSaveGame}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving Game...' : 'Save Game'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryHeader: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gameResult: {
    alignItems: 'center',
  },
  opponentName: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scoreInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreInput: {
    alignItems: 'center',
  },
  teamLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scoreField: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.text,
    backgroundColor: colors.background,
  },
  scoreSeparator: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading,
    color: colors.textSecondary,
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: spacing.sm,
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
    backgroundColor: colors.surface,
  },
  saveButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  saveButtonText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.heading,
    color: colors.surface,
    marginLeft: spacing.sm,
  },
});

export default PostGameView;
