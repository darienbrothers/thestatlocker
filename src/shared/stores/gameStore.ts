import { create } from 'zustand';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Game, GameStats, OnboardingChecklist } from '@/types';

interface GameStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  onboardingChecklists: OnboardingChecklist[];
  
  // Actions
  logGame: (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  fetchUserGames: (userId: string) => Promise<void>;
  updateGameStats: (gameId: string, stats: GameStats) => Promise<void>;
  completeChecklistItem: (checklistId: string) => Promise<void>;
  initializeChecklists: (userId: string) => void;
  
  // Getters
  getTotalGames: () => number;
  getSeasonStats: (seasonType?: string) => GameStats;
  getRecentGames: (limit?: number) => Game[];
  getPendingChecklists: () => OnboardingChecklist[];
}

const initialChecklists: Omit<OnboardingChecklist, 'id'>[] = [
  {
    title: 'Log Your First Game',
    description: 'Track your performance in your first game to start building your stats',
    completed: false,
    xpReward: 50,
    icon: '🥍',
    action: 'LOG_GAME'
  },
  {
    title: 'Add Target Colleges',
    description: 'Add 3-5 colleges you\'re interested in for recruiting',
    completed: false,
    xpReward: 30,
    icon: '🎓',
    action: 'ADD_COLLEGES'
  },
  {
    title: 'Complete Your Profile',
    description: 'Upload a profile photo and add your jersey number',
    completed: false,
    xpReward: 25,
    icon: '👤',
    action: 'COMPLETE_PROFILE'
  }
];

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  isLoading: false,
  error: null,
  onboardingChecklists: [],

  logGame: async (gameData) => {
    try {
      set({ isLoading: true, error: null });
      
      const gameToSave = {
        ...gameData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'games'), gameToSave);
      
      const newGame: Game = {
        ...gameToSave,
        id: docRef.id
      };

      set(state => ({
        games: [newGame, ...state.games],
        isLoading: false
      }));

      // Complete "Log First Game" checklist if this is the first game
      const { games, completeChecklistItem, onboardingChecklists } = get();
      if (games.length === 1) {
        const logGameChecklist = onboardingChecklists.find(c => c.action === 'LOG_GAME');
        if (logGameChecklist && !logGameChecklist.completed) {
          await completeChecklistItem(logGameChecklist.id);
        }
      }

    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchUserGames: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      const q = query(
        collection(db, 'games'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const games: Game[] = [];
      
      querySnapshot.forEach((doc) => {
        games.push({
          id: doc.id,
          ...doc.data()
        } as Game);
      });

      set({ games, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateGameStats: async (gameId, stats) => {
    try {
      set({ isLoading: true, error: null });
      
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        stats,
        updatedAt: new Date()
      });

      set(state => ({
        games: state.games.map(game =>
          game.id === gameId
            ? { ...game, stats, updatedAt: new Date() }
            : game
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  completeChecklistItem: async (checklistId) => {
    try {
      // Update local state immediately for better UX
      set(state => ({
        onboardingChecklists: state.onboardingChecklists.map(item =>
          item.id === checklistId
            ? { ...item, completed: true }
            : item
        )
      }));

      // TODO: Update in Firestore when we add user preferences collection
      // For now, we'll just update local state
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  initializeChecklists: (userId) => {
    const checklists: OnboardingChecklist[] = initialChecklists.map((item, index) => ({
      ...item,
      id: `${userId}_checklist_${index}`
    }));
    
    set({ onboardingChecklists: checklists });
  },

  // Getters
  getTotalGames: () => {
    return get().games.length;
  },

  getSeasonStats: (seasonType) => {
    const { games } = get();
    const filteredGames = seasonType 
      ? games.filter(game => game.seasonType === seasonType)
      : games;

    return filteredGames.reduce((totals, game) => ({
      goals: totals.goals + game.stats.goals,
      assists: totals.assists + game.stats.assists,
      shots: totals.shots + game.stats.shots,
      shotsOnGoal: totals.shotsOnGoal + game.stats.shotsOnGoal,
      turnovers: totals.turnovers + game.stats.turnovers,
      groundBalls: totals.groundBalls + game.stats.groundBalls,
      causedTurnovers: totals.causedTurnovers + game.stats.causedTurnovers,
      fouls: totals.fouls + game.stats.fouls,
      penalties: totals.penalties + game.stats.penalties,
      saves: totals.saves ? totals.saves + (game.stats.saves || 0) : (game.stats.saves || 0),
      goalsAgainst: totals.goalsAgainst ? totals.goalsAgainst + (game.stats.goalsAgainst || 0) : (game.stats.goalsAgainst || 0),
      faceoffWins: totals.faceoffWins ? totals.faceoffWins + (game.stats.faceoffWins || 0) : (game.stats.faceoffWins || 0),
      faceoffLosses: totals.faceoffLosses ? totals.faceoffLosses + (game.stats.faceoffLosses || 0) : (game.stats.faceoffLosses || 0),
    }), {
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnGoal: 0,
      turnovers: 0,
      groundBalls: 0,
      causedTurnovers: 0,
      fouls: 0,
      penalties: 0,
      saves: 0,
      goalsAgainst: 0,
      faceoffWins: 0,
      faceoffLosses: 0,
    });
  },

  getRecentGames: (limit = 5) => {
    return get().games.slice(0, limit);
  },

  getPendingChecklists: () => {
    return get().onboardingChecklists.filter(item => !item.completed);
  }
}));
