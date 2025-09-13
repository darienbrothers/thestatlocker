import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../shared/stores/authStore';
import { useGameStore } from '../../../shared/stores/gameStore';
import GameTrackingModal from '../../../shared/components/GameTrackingModal';
import { theme } from '../../../constants/theme';
import { SEASON_GOALS } from '../../../data/goals/seasonGoals';

const { width } = Dimensions.get('window');

const { colors, fonts, fontSizes, spacing, borderRadius } = theme;

const LockerHomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { games, fetchUserGames } = useGameStore();
  const [gameModalVisible, setGameModalVisible] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'High School' | 'Club'>('High School');

  // Fetch games when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchUserGames(user.uid);
    }
  }, [user?.uid, fetchUserGames]);

  // Get current team context based on selected season
  const getCurrentTeamContext = () => {
    if (selectedSeason === 'High School') {
      return {
        teamName: user?.highSchool?.name || 'High School Team',
        jerseyNumber: user?.highSchool?.jerseyNumber || user?.jerseyNumber || '00',
        city: user?.highSchool?.city,
        state: user?.highSchool?.state,
        level: user?.level,
      };
    } else {
      return {
        teamName: user?.club?.name || 'Club Team',
        jerseyNumber: user?.club?.jerseyNumber || '00',
        city: user?.club?.city,
        state: user?.club?.state,
        level: 'Club',
      };
    }
  };

  const teamContext = getCurrentTeamContext();

  // Get position-specific season goals
  const getPositionGoals = () => {
    if (!user?.position || !user?.gender) return [];
    const gender = user.gender as 'boys' | 'girls';
    const position = user.position as keyof typeof SEASON_GOALS.boys;
    
    if (SEASON_GOALS[gender] && SEASON_GOALS[gender][position]) {
      return SEASON_GOALS[gender][position].slice(0, 3); // Show top 3 goals
    }
    return [];
  };

  const positionGoals = getPositionGoals();

  // Calculate goal progress based on current stats
  const calculateGoalProgress = (goal: any) => {
    if (!filteredGames.length) return 0;
    
    const totalGames = filteredGames.length;
    let currentValue = 0;
    
    switch (goal.category) {
      case 'scoring':
        if (goal.unit.includes('goals/game')) {
          const totalGoals = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.goals || 0), 0);
          currentValue = totalGames > 0 ? totalGoals / totalGames : 0;
        } else {
          currentValue = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.goals || 0), 0);
        }
        break;
      case 'saves':
        if (goal.unit.includes('percentage')) {
          const totalSaves = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.saves || 0), 0);
          const totalShots = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.shotsFaced || 0), 0);
          currentValue = totalShots > 0 ? (totalSaves / totalShots) * 100 : 0;
        } else {
          currentValue = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.saves || 0), 0);
        }
        break;
      case 'assists':
        if (goal.unit.includes('assists/game')) {
          const totalAssists = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.assists || 0), 0);
          currentValue = totalGames > 0 ? totalAssists / totalGames : 0;
        } else {
          currentValue = filteredGames.reduce((sum: number, game: any) => sum + (game.stats?.assists || 0), 0);
        }
        break;
      default:
        currentValue = 0;
    }
    
    return Math.min((currentValue / goal.targetValue) * 100, 100);
  };

  // Filter games for current user and season
  const filteredGames = useMemo(() => {
    if (!user?.uid || !games) return [];
    const seasonMapping = {
      'High School': 'School Season',
      'Club': 'Club Season'
    };
    return games.filter((game: any) => 
      game.userId === user.uid && game.seasonType === seasonMapping[selectedSeason]
    );
  }, [games, user?.uid, selectedSeason]);

  // Stats calculation functions
  const getCurrentStats = () => {
    const totalSaves = filteredGames.reduce((total: number, game: any) => total + (game.stats?.saves || 0), 0);
    const totalShots = filteredGames.reduce((total: number, game: any) => total + (game.stats?.shotsFaced || 0), 0);
    const goalsAgainst = filteredGames.reduce((total: number, game: any) => total + (game.stats?.goalsAgainst || 0), 0);
    const savePercentage = totalShots > 0 ? Math.round((totalSaves / totalShots) * 100) : 0;
    
    return { totalSaves, totalShots, goalsAgainst, savePercentage };
  };

  const getStatTrend = (statType: string) => {
    if (filteredGames.length < 2) return { trend: 0, isUp: false };
    
    const recentGames = filteredGames.slice(0, 3);
    const olderGames = filteredGames.slice(3, 6);
    
    const recentAvg = recentGames.reduce((sum: number, game: any) => 
      sum + (game.stats?.[statType] || 0), 0) / recentGames.length;
    const olderAvg = olderGames.length > 0 ? 
      olderGames.reduce((sum: number, game: any) => sum + (game.stats?.[statType] || 0), 0) / olderGames.length : 0;
    
    const trend = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;
    return { trend: Math.abs(trend), isUp: trend > 0 };
  };

  const handleGameAdded = () => {
    if (user?.uid) {
      fetchUserGames(user.uid);
    }
  };

  const statCards = [
    {
      title: 'Save Percentage',
      value: `${getCurrentStats().savePercentage}%`,
      trend: getStatTrend('savePercentage'),
      icon: 'shield-checkmark',
      color: colors.primary,
    },
    {
      title: 'Total Saves',
      value: getCurrentStats().totalSaves.toString(),
      trend: getStatTrend('saves'),
      icon: 'hand-left',
      color: colors.success,
    },
    {
      title: 'Goals Against',
      value: getCurrentStats().goalsAgainst.toString(),
      trend: getStatTrend('goalsAgainst'),
      icon: 'warning',
      color: colors.warning,
    },
  ];


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Player Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <Image
                source={
                  user?.photoURL ? { uri: user.photoURL } : require('../../../../assets/images/default-avatar.png')
                }
                style={styles.heroProfileImage}
              />
              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.heroPosition}>
                  {user?.position || 'Player'} • #{teamContext.jerseyNumber}
                </Text>
                <Text style={styles.heroTeam}>
                  {teamContext.teamName}
                  {teamContext.city && teamContext.state && ` • ${teamContext.city}, ${teamContext.state}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Season Toggle */}
          <View style={styles.seasonToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedSeason === 'High School' && styles.toggleButtonActive
              ]}
              onPress={() => setSelectedSeason('High School')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedSeason === 'High School' && styles.toggleTextActive
                ]}
              >
                HS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedSeason === 'Club' && styles.toggleButtonActive
              ]}
              onPress={() => setSelectedSeason('Club')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedSeason === 'Club' && styles.toggleTextActive
                ]}
              >
                Club
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 2x2 Stats Grid with Trend Indicators */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsGrid}>
            {statCards.slice(0, 4).map((stat, index) => (
              <View key={index} style={styles.statGridItem}>
                <View style={styles.statGridHeader}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  <View style={styles.trendIndicator}>
                    <Ionicons
                      name={stat.trend.isUp ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={stat.trend.isUp ? colors.success : colors.error}
                    />
                    <Text
                      style={[
                        styles.trendPercentage,
                        { color: stat.trend.isUp ? colors.success : colors.error },
                      ]}
                    >
                      {stat.trend.trend}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.statGridValue}>{stat.value}</Text>
                <Text style={styles.statGridLabel}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Per Game Averages */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Per Game Averages</Text>
          <View style={styles.averagesContainer}>
            <Text style={styles.averagesSubtitle}>
              Based on {filteredGames.length} games this {selectedSeason.toLowerCase()} season
            </Text>
            <View style={styles.averagesGrid}>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>
                  {filteredGames.length > 0 
                    ? (getCurrentStats().totalSaves / filteredGames.length).toFixed(1)
                    : '0.0'
                  }
                </Text>
                <Text style={styles.averageLabel}>Saves/Game</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>
                  {filteredGames.length > 0 
                    ? (getCurrentStats().goalsAgainst / filteredGames.length).toFixed(1)
                    : '0.0'
                  }
                </Text>
                <Text style={styles.averageLabel}>Goals Against/Game</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>
                  {getCurrentStats().savePercentage}%
                </Text>
                <Text style={styles.averageLabel}>Save %</Text>
              </View>
              <View style={styles.averageItem}>
                <Text style={styles.averageValue}>
                  {filteredGames.length > 0 
                    ? (filteredGames.reduce((sum: number, game: any) => 
                        sum + (game.stats?.groundBalls || 0), 0) / filteredGames.length).toFixed(1)
                    : '0.0'
                  }
                </Text>
                <Text style={styles.averageLabel}>Ground Balls/Game</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Position-Specific Season Goals */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Season Goals</Text>
          <View style={styles.goalHeader}>
            <Text style={styles.goalSubtitle}>
              {user?.position || 'Player'}-specific goals for {selectedSeason.toLowerCase()} season
            </Text>
          </View>
          {positionGoals.length > 0 ? (
            positionGoals.map((goal) => {
              const progress = calculateGoalProgress(goal);
              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleContainer}>
                      <Ionicons name={goal.icon as any} size={20} color={colors.primary} />
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                    </View>
                    <Text style={styles.goalProgress}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${progress}%`,
                          backgroundColor: progress >= 100 ? colors.success : colors.primary
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.motivationText}>{goal.description}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyGoalsContainer}>
              <Ionicons name="trophy" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyGoalsText}>
                No goals available for your position
              </Text>
              <Text style={styles.emptyGoalsSubtext}>
                Complete your profile setup to see personalized goals
              </Text>
            </View>
          )}
        </View>

        {/* AI Insights Preview */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.aiInsightCard}>
            <View style={styles.aiInsightHeader}>
              <MaterialIcons name="psychology" size={24} color={colors.primary} />
              <Text style={styles.aiInsightTitle}>Performance Analysis</Text>
            </View>
            <View style={styles.blurredContent}>
              <Text style={styles.blurredText}>
                Your save percentage has improved by 12% over the last 5 games...
              </Text>
              <Text style={styles.blurredText}>
                Focus on low shots to continue this trend...
              </Text>
            </View>
            <TouchableOpacity style={styles.unlockButton}>
              <Ionicons name="lock-closed" size={16} color={colors.white} />
              <Text style={styles.unlockButtonText}>Unlock Premium Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Events & Schedule */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventsContainer}>
            <View style={styles.miniCalendar}>
              <Text style={styles.calendarMonth}>December 2024</Text>
              <View style={styles.calendarGrid}>
                {/* Mini calendar implementation would go here */}
                <Text style={styles.calendarPlaceholder}>📅 Mini Calendar</Text>
              </View>
            </View>
            <View style={styles.eventActions}>
              <TouchableOpacity
                style={styles.eventActionButton}
                onPress={() => setGameModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.eventActionText}>Add Game</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.eventActionButtonSecondary}>
                <Ionicons name="download" size={20} color={colors.primary} />
                <Text style={styles.eventActionTextSecondary}>Import Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Games Enhanced */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          {filteredGames.length > 0 ? (
            filteredGames.slice(0, 3).map((game: any, index: number) => (
              <View key={index} style={styles.enhancedGameCard}>
                <View style={styles.gameCardHeader}>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameOpponent}>vs {game.opponent}</Text>
                    <Text style={styles.gameDate}>
                      {new Date(game.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.gameBadges}>
                    <View style={[styles.badge, styles.winBadge]}>
                      <Text style={styles.badgeText}>W</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.gameStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{game.stats?.saves || 0}</Text>
                    <Text style={styles.statLabel}>Saves</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{game.stats?.goalsAgainst || 0}</Text>
                    <Text style={styles.statLabel}>GA</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {game.stats?.saves && game.stats?.shotsFaced
                        ? Math.round((game.stats.saves / game.stats.shotsFaced) * 100)
                        : 0}%
                    </Text>
                    <Text style={styles.statLabel}>Save %</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.expandButton}>
                  <Text style={styles.expandText}>View Full Stats</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                No games logged yet. Start tracking your performance!
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setGameModalVisible(true)}
              >
                <Text style={styles.emptyStateButtonText}>Log Your First Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Game Tracking Modal */}
      <GameTrackingModal
        visible={gameModalVisible}
        onClose={() => setGameModalVisible(false)}
        onGameLogged={handleGameAdded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Hero Player Card Styles
  heroCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroProfileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: colors.white,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroPosition: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.regular,
    color: colors.white,
    opacity: 0.9,
  },
  heroTeam: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  editButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
  },
  // Season Toggle Styles
  seasonToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.white,
  },
  toggleText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  // Stat Carousel Styles
  statCarouselContainer: {
    marginTop: spacing.lg,
  },
  statCarouselContent: {
    paddingHorizontal: spacing.md,
  },
  statCard: {
    width: width - 80,
    marginHorizontal: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    marginLeft: spacing.xs,
  },
  statValue: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  drillDownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  drillDownText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  // Section Styles
  sectionContainer: {
    margin: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  // Season Goals Styles
  goalCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalTitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    flex: 1,
  },
  goalProgress: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 3,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  motivationText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  goalSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyGoalsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyGoalsText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyGoalsSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statGridItem: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendPercentage: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    marginLeft: spacing.xs,
  },
  statGridValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statGridLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  // Per Game Averages Styles
  averagesContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  averagesSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  averagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  averageItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  averageValue: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  averageLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // AI Insights Styles
  aiInsightCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiInsightTitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  blurredContent: {
    opacity: 0.5,
    marginBottom: spacing.md,
  },
  blurredText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  unlockButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  unlockButtonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  // Events & Schedule Styles
  eventsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniCalendar: {
    flex: 1,
    marginRight: spacing.md,
  },
  calendarMonth: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  calendarGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  calendarPlaceholder: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
  eventActions: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventActionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  eventActionText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  eventActionButtonSecondary: {
    backgroundColor: colors.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  eventActionTextSecondary: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  // Enhanced Games Styles
  enhancedGameCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  gameOpponent: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  gameDate: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.regular,
    color: colors.textSecondary,
  },
  gameBadges: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  winBadge: {
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  expandText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.jakarta.medium,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  // Empty State Styles
  emptyState: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.jakarta.medium,
    color: colors.white,
  },
});

export default LockerHomeScreen;
