import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../constants/theme';
import { SeasonGoalsCard } from '../progress/SeasonGoalsCard';
import { BadgesList } from '../badges/BadgesList';
import { StreaksContainer } from '../streaks/StreaksContainer';
import { gamificationIntegrationService } from '../../services/GamificationIntegrationService';

interface GamificationDashboardProps {
  userId: string;
  userPosition: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userId,
  userPosition,
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data =
        await gamificationIntegrationService.getDashboardSummary(userId);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading gamification dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Season Goals Progress */}
      <SeasonGoalsCard userId={userId} />

      {/* Skills & Drills Streaks */}
      <StreaksContainer userId={userId} />

      {/* Achievements/Badges */}
      <BadgesList userId={userId} userPosition={userPosition} />

      {/* Summary Stats */}
      {dashboardData && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Progress</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dashboardData.activeStreaks}
              </Text>
              <Text style={styles.summaryLabel}>Active Streaks</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dashboardData.totalBadges}
              </Text>
              <Text style={styles.summaryLabel}>Badges Earned</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {dashboardData.progress?.overallProgress || 0}%
              </Text>
              <Text style={styles.summaryLabel}>Goals Progress</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: 40,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
