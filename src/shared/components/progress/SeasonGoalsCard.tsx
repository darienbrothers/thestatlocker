import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../constants/theme';
import { ProgressBar } from './ProgressBar';
import { progressService, type ProgressSummary } from '../../services/ProgressService';

interface SeasonGoalsCardProps {
  userId: string;
}

export const SeasonGoalsCard: React.FC<SeasonGoalsCardProps> = ({ userId }) => {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progressData = await progressService.getSeasonGoalProgress(userId);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Season Goals</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  if (!progress || progress.seasonGoals.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Season Goals</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No season goals set yet</Text>
          <Text style={styles.emptySubtext}>Set your goals to track progress</Text>
        </View>
      </View>
    );
  }

  const completedGoals = progress.seasonGoals.filter(goal => goal.isCompleted).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Season Goals</Text>
        <View style={styles.overallProgress}>
          <Text style={styles.overallPercentage}>{progress.overallProgress}%</Text>
          <Text style={styles.overallLabel}>Overall</Text>
        </View>
      </View>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {completedGoals} of {progress.seasonGoals.length} goals completed
        </Text>
      </View>

      <ScrollView style={styles.goalsContainer} showsVerticalScrollIndicator={false}>
        {progress.seasonGoals.map((goal) => (
          <ProgressBar
            key={goal.goalId}
            title={goal.title}
            current={goal.current}
            target={goal.target}
            percentage={goal.percentage}
            isCompleted={goal.isCompleted}
            unit={getUnitForStatType(goal.statType)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const getUnitForStatType = (statType: string): string => {
  switch (statType) {
    case 'savePercentage':
      return '%';
    case 'saves':
    case 'goals':
    case 'assists':
    case 'groundBalls':
    case 'points':
      return '';
    default:
      return '';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  overallProgress: {
    alignItems: 'center',
  },
  overallPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  overallLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  summary: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  goalsContainer: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
