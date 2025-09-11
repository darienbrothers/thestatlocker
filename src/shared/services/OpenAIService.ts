interface OpenAIConfig {
  apiKey?: string;
  useMockMode: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  success: boolean;
  content: string;
  error?: string;
  tokensUsed?: number;
}

interface LacrosseInsightRequest {
  playerPosition: 'Attack' | 'Midfield' | 'Defense' | 'LSM' | 'Goalie';
  recentGames: Array<{
    date: string;
    goals: number;
    assists: number;
    groundBalls: number;
    shots: number;
    saves?: number;
    faceoffWins?: number;
    causedTurnovers?: number;
  }>;
  seasonStats: {
    totalGames: number;
    totalGoals: number;
    totalAssists: number;
    totalGroundBalls: number;
    totalShots: number;
    totalSaves?: number;
    totalFaceoffWins?: number;
    totalCausedTurnovers?: number;
  };
  insightType:
    | 'performance_analysis'
    | 'improvement_suggestions'
    | 'trend_analysis'
    | 'goal_prediction';
}

class OpenAIService {
  private config: OpenAIConfig;
  private mockResponses: Record<string, string[]> = {};

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY,
      useMockMode:
        !process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'development',
      model: 'gpt-4',
      maxTokens: 500,
      temperature: 0.7,
    };

    this.initializeMockResponses();
  }

  private initializeMockResponses(): void {
    this.mockResponses = {
      performance_analysis_Attack: [
        "Your shooting accuracy has improved 15% over the last 5 games! You're finding better shooting angles and taking higher percentage shots. Your 67% shooting percentage is well above the average for attack players.",
        'Strong offensive performance with 3.2 goals per game average. Your ability to create space with dodges has led to more quality scoring opportunities. Consider working on weak-hand shots to become even more unpredictable.',
        "Excellent ball movement - your 2.1 assists per game shows great field vision. You're making smart decisions about when to shoot vs. when to feed teammates in better positions.",
      ],
      performance_analysis_Midfield: [
        'Your two-way play is exceptional with strong contributions on both ends. 2.8 ground balls per game shows excellent hustle and field awareness. Your transition game has been a key factor in team success.',
        'Solid offensive production for a midfielder with 1.4 goals and 1.8 assists per game. Your ability to push transition and create fast-break opportunities is a major asset to your team.',
        'Your endurance and work rate stand out - maintaining consistent performance across all four quarters. Consider focusing on face-off skills to add another dimension to your game.',
      ],
      performance_analysis_Defense: [
        "Outstanding defensive presence with 2.4 caused turnovers per game. Your stick checks are well-timed and you're excellent at forcing opponents into difficult situations.",
        "Your clearing ability is a major strength - 85% clear success rate shows great decision-making under pressure. You're effectively transitioning defense to offense.",
        'Excellent communication and slide packages. Your 3.1 ground balls per game demonstrates great positioning and anticipation of where the ball will be.',
      ],
      performance_analysis_Goalie: [
        'Exceptional save percentage at 68% - well above league average. Your positioning and reaction time have been outstanding, especially on low shots.',
        "Your clearing accuracy of 78% is excellent for a goalie. You're making smart decisions about when to clear quickly vs. when to slow the game down.",
        "Strong leadership from the cage - your communication is helping organize the defense effectively. Your 12.3 saves per game shows you're facing a lot of shots and performing well under pressure.",
      ],
      improvement_suggestions_Attack: [
        'Focus on developing your weak-hand shooting - 85% of your goals come from your strong side. Defenders are starting to force you to your weak hand.',
        'Work on your off-ball movement. Creating better spacing and using picks more effectively will give you higher percentage scoring opportunities.',
        'Consider improving your dodging speed and change of direction. Adding a hesitation move or stutter step could help you create more separation from defenders.',
      ],
      improvement_suggestions_Midfield: [
        'Develop your face-off skills to add value in critical situations. Even winning 40% of face-offs would be a huge asset for your team.',
        'Work on your shooting accuracy from distance - midfielders who can score from 15+ yards are extremely valuable and hard to defend.',
        'Focus on your defensive positioning when sliding. Better angles will help you force turnovers more consistently.',
      ],
      improvement_suggestions_Defense: [
        'Work on your footwork when defending dodges. Staying lower and maintaining better body position will help you force more turnovers.',
        "Develop your outlet passing accuracy. Quick, accurate clears to the right players will improve your team's transition game.",
        'Practice your stick checks - focus on timing and targeting the bottom hand to be more effective at causing turnovers.',
      ],
      trend_analysis: [
        'Your performance shows a strong upward trend over the last month. Goals per game have increased from 1.8 to 2.4, and your shooting percentage has improved from 52% to 67%.',
        'Interesting pattern: your best games come after 1-2 days of rest. Your performance drops slightly in back-to-back games, suggesting conditioning could be a focus area.',
        'Your ground ball numbers spike in close games, showing great competitive drive. You average 4.2 ground balls in games decided by 2 goals or less vs. 2.8 in blowouts.',
      ],
      goal_prediction: [
        "Based on your current trajectory, you're on pace for 45-50 goals this season. Your improving shooting accuracy suggests you could reach the higher end of that range.",
        "If you maintain your current assist rate, you're projected to finish with 35-40 assists. Your field vision and decision-making continue to improve each game.",
        "Your ground ball pace suggests you'll finish with 80+ for the season, which would put you in the top 10% of players at your position.",
      ],
    };
  }

  /**
   * Generate lacrosse-specific insights using AI
   */
  async generateLacrosseInsight(
    request: LacrosseInsightRequest,
  ): Promise<OpenAIResponse> {
    if (this.config.useMockMode) {
      return this.getMockInsight(request);
    }

    try {
      const messages = this.buildLacrossePrompt(request);
      return await this.callOpenAI(messages);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response if API fails
      return this.getMockInsight(request);
    }
  }

  /**
   * Get mock insight for development/demo purposes
   */
  private getMockInsight(request: LacrosseInsightRequest): OpenAIResponse {
    const key = `${request.insightType}_${request.playerPosition}`;
    const fallbackKey = request.insightType;

    const responses = this.mockResponses[key] ||
      this.mockResponses[fallbackKey] || [
        'Great performance this season! Keep up the excellent work and continue focusing on the fundamentals.',
      ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      content: randomResponse || 'Mock response not available',
      tokensUsed: 0, // Mock mode uses no tokens
    };
  }

  /**
   * Build lacrosse-specific prompt for OpenAI
   */
  private buildLacrossePrompt(
    request: LacrosseInsightRequest,
  ): OpenAIMessage[] {
    const systemPrompt = `You are an expert lacrosse coach and analyst. Provide insightful, actionable feedback for lacrosse players based on their statistics and performance data. Focus on:

1. Position-specific analysis (Attack, Midfield, Defense, LSM, Goalie)
2. Lacrosse-specific terminology and concepts
3. Actionable improvement suggestions
4. Positive reinforcement combined with constructive feedback
5. Statistical trends and patterns

Keep responses concise (2-3 sentences), encouraging, and focused on lacrosse fundamentals.`;

    const userPrompt = this.buildUserPrompt(request);

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
  }

  /**
   * Build user prompt with player data
   */
  private buildUserPrompt(request: LacrosseInsightRequest): string {
    const { playerPosition, recentGames, seasonStats, insightType } = request;

    let prompt = `Player Position: ${playerPosition}\n\n`;

    // Season stats
    prompt += `Season Statistics (${seasonStats.totalGames} games):\n`;
    prompt += `- Goals: ${seasonStats.totalGoals} (${(seasonStats.totalGoals / seasonStats.totalGames).toFixed(1)} per game)\n`;
    prompt += `- Assists: ${seasonStats.totalAssists} (${(seasonStats.totalAssists / seasonStats.totalGames).toFixed(1)} per game)\n`;
    prompt += `- Ground Balls: ${seasonStats.totalGroundBalls} (${(seasonStats.totalGroundBalls / seasonStats.totalGames).toFixed(1)} per game)\n`;
    prompt += `- Shots: ${seasonStats.totalShots} (${((seasonStats.totalGoals / seasonStats.totalShots) * 100).toFixed(1)}% shooting)\n`;

    if (seasonStats.totalSaves) {
      prompt += `- Saves: ${seasonStats.totalSaves} (${(seasonStats.totalSaves / seasonStats.totalGames).toFixed(1)} per game)\n`;
    }

    if (seasonStats.totalFaceoffWins) {
      prompt += `- Face-off Wins: ${seasonStats.totalFaceoffWins}\n`;
    }

    if (seasonStats.totalCausedTurnovers) {
      prompt += `- Caused Turnovers: ${seasonStats.totalCausedTurnovers} (${(seasonStats.totalCausedTurnovers / seasonStats.totalGames).toFixed(1)} per game)\n`;
    }

    // Recent games trend
    if (recentGames.length > 0) {
      prompt += '\nRecent Games Performance:\n';
      recentGames.slice(-3).forEach((game, index) => {
        prompt += `Game ${index + 1}: ${game.goals}G, ${game.assists}A, ${game.groundBalls}GB, ${game.shots} shots\n`;
      });
    }

    // Insight type request
    const insightTypeMap = {
      performance_analysis:
        'Provide a performance analysis highlighting strengths and key statistics.',
      improvement_suggestions:
        'Suggest specific areas for improvement and training focus.',
      trend_analysis:
        'Analyze performance trends and patterns over recent games.',
      goal_prediction:
        'Predict potential season outcomes based on current performance trajectory.',
    };

    prompt += `\n${insightTypeMap[insightType]}`;

    return prompt;
  }

  /**
   * Call OpenAI API (when not in mock mode)
   */
  private async callOpenAI(messages: OpenAIMessage[]): Promise<OpenAIResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0]?.message?.content || 'No response generated',
      tokensUsed: data.usage?.total_tokens || 0,
    };
  }

  /**
   * Check if service is in mock mode
   */
  isMockMode(): boolean {
    return this.config.useMockMode;
  }

  /**
   * Enable/disable mock mode
   */
  setMockMode(enabled: boolean): void {
    this.config.useMockMode = enabled;
  }
}

export const openAIService = new OpenAIService();
export type { LacrosseInsightRequest, OpenAIResponse };
