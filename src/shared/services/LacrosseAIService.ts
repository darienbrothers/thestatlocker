import { openAIService, type LacrosseInsightRequest, type OpenAIResponse } from './OpenAIService';

export interface LacrossePlayerStats {
  position: 'Attack' | 'Midfield' | 'Defense' | 'LSM' | 'Goalie';
  games: Array<{
    id: string;
    date: string;
    opponent: string;
    goals: number;
    assists: number;
    groundBalls: number;
    shots: number;
    saves?: number;
    faceoffWins?: number;
    faceoffAttempts?: number;
    causedTurnovers?: number;
    unassistedGoals?: number;
    manUpGoals?: number;
    gameWinningGoals?: number;
  }>;
}

export interface LacrosseInsight {
  id: string;
  type: 'performance_analysis' | 'improvement_suggestions' | 'trend_analysis' | 'goal_prediction';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  generatedAt: Date;
  playerPosition: string;
  actionable: boolean;
  relatedStats?: string[];
}

export interface SeasonProjection {
  goals: { current: number; projected: number; confidence: number };
  assists: { current: number; projected: number; confidence: number };
  groundBalls: { current: number; projected: number; confidence: number };
  saves?: { current: number; projected: number; confidence: number };
  faceoffWinPercentage?: { current: number; projected: number; confidence: number };
}

class LacrosseAIService {
  /**
   * Generate comprehensive AI insights for a lacrosse player
   */
  async generatePlayerInsights(playerStats: LacrossePlayerStats): Promise<LacrosseInsight[]> {
    const insights: LacrosseInsight[] = [];
    
    try {
      // Generate different types of insights
      const insightTypes: Array<LacrosseInsightRequest['insightType']> = [
        'performance_analysis',
        'improvement_suggestions',
        'trend_analysis',
        'goal_prediction'
      ];

      const seasonStats = this.calculateSeasonStats(playerStats);
      const recentGames = this.getRecentGamesData(playerStats.games);

      for (const insightType of insightTypes) {
        const request: LacrosseInsightRequest = {
          playerPosition: playerStats.position,
          recentGames,
          seasonStats,
          insightType,
        };

        const aiResponse = await openAIService.generateLacrosseInsight(request);
        
        if (aiResponse.success) {
          insights.push(this.createInsightFromResponse(aiResponse, insightType, playerStats.position));
        }
      }

      return insights;
    } catch (error) {
      console.error('Error generating player insights:', error);
      return this.getFallbackInsights(playerStats.position);
    }
  }

  /**
   * Generate specific insight type
   */
  async generateSpecificInsight(
    playerStats: LacrossePlayerStats,
    insightType: LacrosseInsightRequest['insightType']
  ): Promise<LacrosseInsight | null> {
    try {
      const seasonStats = this.calculateSeasonStats(playerStats);
      const recentGames = this.getRecentGamesData(playerStats.games);

      const request: LacrosseInsightRequest = {
        playerPosition: playerStats.position,
        recentGames,
        seasonStats,
        insightType,
      };

      const aiResponse = await openAIService.generateLacrosseInsight(request);
      
      if (aiResponse.success) {
        return this.createInsightFromResponse(aiResponse, insightType, playerStats.position);
      }

      return null;
    } catch (error) {
      console.error('Error generating specific insight:', error);
      return null;
    }
  }

  /**
   * Calculate season projections
   */
  calculateSeasonProjections(playerStats: LacrossePlayerStats, totalSeasonGames: number = 20): Promise<SeasonProjection> {
    const seasonStats = this.calculateSeasonStats(playerStats);
    const gamesPlayed = seasonStats.totalGames;
    const remainingGames = Math.max(0, totalSeasonGames - gamesPlayed);

    if (gamesPlayed === 0) {
      return Promise.resolve({
        goals: { current: 0, projected: 0, confidence: 0 },
        assists: { current: 0, projected: 0, confidence: 0 },
        groundBalls: { current: 0, projected: 0, confidence: 0 },
      });
    }

    // Calculate averages and project
    const goalsPerGame = seasonStats.totalGoals / gamesPlayed;
    const assistsPerGame = seasonStats.totalAssists / gamesPlayed;
    const groundBallsPerGame = seasonStats.totalGroundBalls / gamesPlayed;

    // Apply trend analysis for more accurate projections
    const recentTrend = this.calculateRecentTrend(playerStats.games);
    const trendMultiplier = 1 + (recentTrend * 0.1); // Adjust projection based on trend

    const projection: SeasonProjection = {
      goals: {
        current: seasonStats.totalGoals,
        projected: Math.round((goalsPerGame * trendMultiplier) * totalSeasonGames),
        confidence: Math.min(gamesPlayed / 10, 1), // Higher confidence with more games
      },
      assists: {
        current: seasonStats.totalAssists,
        projected: Math.round((assistsPerGame * trendMultiplier) * totalSeasonGames),
        confidence: Math.min(gamesPlayed / 10, 1),
      },
      groundBalls: {
        current: seasonStats.totalGroundBalls,
        projected: Math.round((groundBallsPerGame * trendMultiplier) * totalSeasonGames),
        confidence: Math.min(gamesPlayed / 10, 1),
      },
    };

    // Add position-specific projections
    if (playerStats.position === 'Goalie' && seasonStats.totalSaves) {
      const savesPerGame = seasonStats.totalSaves / gamesPlayed;
      projection.saves = {
        current: seasonStats.totalSaves,
        projected: Math.round(savesPerGame * totalSeasonGames),
        confidence: Math.min(gamesPlayed / 8, 1),
      };
    }

    if (seasonStats.totalFaceoffWins && seasonStats.totalFaceoffWins > 0) {
      const faceoffWinRate = seasonStats.totalFaceoffWins / gamesPlayed;
      projection.faceoffWinPercentage = {
        current: faceoffWinRate,
        projected: faceoffWinRate * trendMultiplier,
        confidence: Math.min(gamesPlayed / 12, 1),
      };
    }

    return Promise.resolve(projection);
  }

  /**
   * Get position-specific performance benchmarks
   */
  getPositionBenchmarks(position: string): Record<string, { excellent: number; good: number; average: number }> {
    const benchmarks = {
      Attack: {
        goalsPerGame: { excellent: 3.0, good: 2.0, average: 1.2 },
        assistsPerGame: { excellent: 2.5, good: 1.5, average: 0.8 },
        shootingPercentage: { excellent: 65, good: 50, average: 35 },
        groundBallsPerGame: { excellent: 2.5, good: 1.8, average: 1.2 },
      },
      Midfield: {
        goalsPerGame: { excellent: 2.0, good: 1.2, average: 0.7 },
        assistsPerGame: { excellent: 2.0, good: 1.2, average: 0.6 },
        groundBallsPerGame: { excellent: 3.5, good: 2.5, average: 1.8 },
        causedTurnoversPerGame: { excellent: 1.5, good: 1.0, average: 0.5 },
      },
      Defense: {
        groundBallsPerGame: { excellent: 4.0, good: 3.0, average: 2.0 },
        causedTurnoversPerGame: { excellent: 2.0, good: 1.3, average: 0.8 },
        clearSuccessRate: { excellent: 85, good: 75, average: 65 },
      },
      LSM: {
        groundBallsPerGame: { excellent: 3.5, good: 2.8, average: 2.0 },
        causedTurnoversPerGame: { excellent: 1.8, good: 1.2, average: 0.7 },
        goalsPerGame: { excellent: 0.8, good: 0.4, average: 0.2 },
      },
      Goalie: {
        savePercentage: { excellent: 65, good: 55, average: 45 },
        savesPerGame: { excellent: 12, good: 9, average: 6 },
        clearSuccessRate: { excellent: 80, good: 70, average: 60 },
      },
    };

    return benchmarks[position as keyof typeof benchmarks] || {};
  }

  /**
   * Calculate comprehensive season statistics
   */
  private calculateSeasonStats(playerStats: LacrossePlayerStats) {
    const games = playerStats.games;
    
    return {
      totalGames: games.length,
      totalGoals: games.reduce((sum, game) => sum + game.goals, 0),
      totalAssists: games.reduce((sum, game) => sum + game.assists, 0),
      totalGroundBalls: games.reduce((sum, game) => sum + game.groundBalls, 0),
      totalShots: games.reduce((sum, game) => sum + game.shots, 0),
      totalSaves: games.reduce((sum, game) => sum + (game.saves || 0), 0) || undefined,
      totalFaceoffWins: games.reduce((sum, game) => sum + (game.faceoffWins || 0), 0) || undefined,
      totalCausedTurnovers: games.reduce((sum, game) => sum + (game.causedTurnovers || 0), 0) || undefined,
    };
  }

  /**
   * Get recent games data for AI analysis
   */
  private getRecentGamesData(games: LacrossePlayerStats['games']) {
    return games
      .slice(-5) // Last 5 games
      .map(game => ({
        date: game.date,
        goals: game.goals,
        assists: game.assists,
        groundBalls: game.groundBalls,
        shots: game.shots,
        saves: game.saves,
        faceoffWins: game.faceoffWins,
        causedTurnovers: game.causedTurnovers,
      }));
  }

  /**
   * Calculate recent performance trend
   */
  private calculateRecentTrend(games: LacrossePlayerStats['games']): number {
    if (games.length < 4) return 0;

    const recentGames = games.slice(-4);
    const olderGames = games.slice(-8, -4);

    if (olderGames.length === 0) return 0;

    const recentAvg = recentGames.reduce((sum, game) => sum + game.goals + game.assists, 0) / recentGames.length;
    const olderAvg = olderGames.reduce((sum, game) => sum + game.goals + game.assists, 0) / olderGames.length;

    if (olderAvg === 0) return 0;

    return (recentAvg - olderAvg) / olderAvg; // Percentage change
  }

  /**
   * Create insight object from AI response
   */
  private createInsightFromResponse(
    aiResponse: OpenAIResponse,
    insightType: LacrosseInsightRequest['insightType'],
    position: string
  ): LacrosseInsight {
    const insightConfig = {
      performance_analysis: {
        title: 'Performance Analysis',
        category: 'Performance',
        priority: 'high' as const,
        actionable: false,
      },
      improvement_suggestions: {
        title: 'Training Focus',
        category: 'Development',
        priority: 'high' as const,
        actionable: true,
      },
      trend_analysis: {
        title: 'Performance Trends',
        category: 'Analytics',
        priority: 'medium' as const,
        actionable: false,
      },
      goal_prediction: {
        title: 'Season Projections',
        category: 'Goals',
        priority: 'medium' as const,
        actionable: false,
      },
    };

    const config = insightConfig[insightType];

    return {
      id: `${insightType}-${Date.now()}`,
      type: insightType,
      title: config.title,
      content: aiResponse.content,
      priority: config.priority,
      category: config.category,
      generatedAt: new Date(),
      playerPosition: position,
      actionable: config.actionable,
    };
  }

  /**
   * Fallback insights when AI is unavailable
   */
  private getFallbackInsights(position: string): LacrosseInsight[] {
    const fallbackInsights = {
      Attack: [
        {
          id: 'fallback-attack-1',
          type: 'improvement_suggestions' as const,
          title: 'Training Focus',
          content: 'Focus on developing your weak-hand shooting and off-ball movement to create better scoring opportunities.',
          priority: 'high' as const,
          category: 'Development',
          generatedAt: new Date(),
          playerPosition: position,
          actionable: true,
        },
      ],
      Midfield: [
        {
          id: 'fallback-midfield-1',
          type: 'improvement_suggestions' as const,
          title: 'Training Focus',
          content: 'Work on your transition game and face-off skills to add more value in critical situations.',
          priority: 'high' as const,
          category: 'Development',
          generatedAt: new Date(),
          playerPosition: position,
          actionable: true,
        },
      ],
      Defense: [
        {
          id: 'fallback-defense-1',
          type: 'improvement_suggestions' as const,
          title: 'Training Focus',
          content: 'Focus on your footwork and stick checks to improve your ability to force turnovers.',
          priority: 'high' as const,
          category: 'Development',
          generatedAt: new Date(),
          playerPosition: position,
          actionable: true,
        },
      ],
    };

    return fallbackInsights[position as keyof typeof fallbackInsights] || [];
  }
}

export const lacrosseAIService = new LacrosseAIService();
