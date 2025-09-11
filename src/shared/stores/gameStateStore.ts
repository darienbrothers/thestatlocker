import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

export interface GameState {
  isActive: boolean;
  gameId?: string;
  startTime?: Date;
  endTime?: Date;
  isPostGame: boolean; // True for 2 hours after game ends
  lastGameEndTime?: Date;
}

interface GameStateStore {
  gameState: GameState;
  startGame: (gameId: string) => void;
  endGame: () => void;
  clearPostGameState: () => void;
  checkPostGameStatus: () => void;
}

const POST_GAME_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const useGameStateStore = create<GameStateStore>((set, get) => ({
  gameState: {
    isActive: false,
    isPostGame: false,
  },

  startGame: (gameId: string) => {
    const startTime = new Date();

    set({
      gameState: {
        isActive: true,
        gameId,
        startTime,
        isPostGame: false,
      },
    });

    // Haptic feedback for game start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    console.log(`Game ${gameId} started at ${startTime.toISOString()}`);
  },

  endGame: () => {
    const endTime = new Date();
    const currentState = get().gameState;

    set({
      gameState: {
        ...currentState,
        isActive: false,
        endTime,
        isPostGame: true,
        lastGameEndTime: endTime,
      },
    });

    // Haptic feedback for game end
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Set timer to clear post-game state after 2 hours
    setTimeout(() => {
      get().clearPostGameState();
    }, POST_GAME_DURATION);

    console.log(
      `Game ended at ${endTime.toISOString()}, post-game state active`,
    );
  },

  clearPostGameState: () => {
    const currentState = get().gameState;

    set({
      gameState: {
        ...currentState,
        isPostGame: false,
      },
    });

    console.log('Post-game state cleared');
  },

  checkPostGameStatus: () => {
    const { gameState } = get();

    if (gameState.lastGameEndTime && gameState.isPostGame) {
      const now = new Date();
      const timeSinceEnd = now.getTime() - gameState.lastGameEndTime.getTime();

      if (timeSinceEnd > POST_GAME_DURATION) {
        get().clearPostGameState();
      }
    }
  },
}));
