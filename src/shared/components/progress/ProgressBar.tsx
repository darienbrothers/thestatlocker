import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../constants/theme';

interface ProgressBarProps {
  title: string;
  current: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
  unit?: string;
  statType?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  current,
  target,
  percentage,
  isCompleted,
  unit = '',
  statType,
}) => {
  const isImprovementGoal = statType === 'improvement';
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {!isImprovementGoal ? (
          <Text style={[styles.percentage, isCompleted && styles.completedText]}>
            {percentage}%
          </Text>
        ) : (
          <Text style={styles.improvementLabel}>Goal Set</Text>
        )}
      </View>

      {!isImprovementGoal && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(percentage, 100)}%` },
                isCompleted && styles.completedFill,
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        {!isImprovementGoal ? (
          <Text style={styles.stats}>
            {current.toLocaleString()}
            {unit} / {target.toLocaleString()}
            {unit}
          </Text>
        ) : (
          <Text style={styles.improvementText}>
            Work towards this improvement area throughout the season
          </Text>
        )}
        {isCompleted && <Text style={styles.completedLabel}>✓ Completed</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  completedText: {
    color: theme.colors.success,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  completedFill: {
    backgroundColor: theme.colors.success,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stats: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  completedLabel: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  improvementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  improvementText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
