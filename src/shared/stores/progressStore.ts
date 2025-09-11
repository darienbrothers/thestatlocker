import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TaskProgress {
  id: string;
  title: string;
  description: string;
  action: string;
  completed: boolean;
  completedAt?: Date;
  viewCount: number;
  lastViewedAt?: Date;
}

export interface UserProgress {
  userId?: string | undefined;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  demoTasksCompleted: string[];
  totalDemoViews: number;
  lastActiveAt: Date;
  tasks: TaskProgress[];
}

interface ProgressState {
  progress: UserProgress;
  isLoading: boolean;

  // Actions
  initializeProgress: (userId?: string) => Promise<void>;
  markTaskCompleted: (taskId: string) => Promise<void>;
  incrementTaskView: (taskId: string) => Promise<void>;
  markOnboardingCompleted: () => Promise<void>;
  resetProgress: () => Promise<void>;
  getTaskProgress: (taskId: string) => TaskProgress | undefined;
  getCompletionPercentage: () => number;
}

const STORAGE_KEY = 'user_progress';

const defaultTasks: TaskProgress[] = [
  {
    id: 'DEMO_GAME_TRACKING',
    title: 'See Game Tracking in Action',
    description: 'Experience our live stat tracking',
    action: 'DEMO_GAME_TRACKING',
    completed: false,
    viewCount: 0,
  },
  {
    id: 'DEMO_RECRUITING',
    title: 'Preview College Pipeline',
    description: 'Tour recruiting tools and features',
    action: 'DEMO_RECRUITING',
    completed: false,
    viewCount: 0,
  },
  {
    id: 'DEMO_PROFILE',
    title: 'Tour Profile Features',
    description: 'See what a complete profile looks like',
    action: 'DEMO_PROFILE',
    completed: false,
    viewCount: 0,
  },
  {
    id: 'DEMO_SKILLS',
    title: 'Explore Skills & Drills',
    description: 'Discover position-specific training',
    action: 'DEMO_SKILLS',
    completed: false,
    viewCount: 0,
  },
];

const defaultProgress: UserProgress = {
  onboardingCompleted: false,
  demoTasksCompleted: [],
  totalDemoViews: 0,
  lastActiveAt: new Date(),
  tasks: defaultTasks,
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: defaultProgress,
  isLoading: false,

  initializeProgress: async (userId?: string) => {
    set({ isLoading: true });

    try {
      const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      const stored = await AsyncStorage.getItem(storageKey);

      if (stored) {
        const parsedProgress = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsedProgress.onboardingCompletedAt) {
          parsedProgress.onboardingCompletedAt = new Date(
            parsedProgress.onboardingCompletedAt,
          );
        }
        if (parsedProgress.lastActiveAt) {
          parsedProgress.lastActiveAt = new Date(parsedProgress.lastActiveAt);
        }
        parsedProgress.tasks = parsedProgress.tasks.map((task: any) => ({
          ...task,
          completedAt: task.completedAt
            ? new Date(task.completedAt)
            : undefined,
          lastViewedAt: task.lastViewedAt
            ? new Date(task.lastViewedAt)
            : undefined,
        }));

        set({
          progress: {
            ...parsedProgress,
            userId,
            lastActiveAt: new Date(),
          },
        });
      } else {
        // Initialize with default progress for new user
        const newProgress = {
          ...defaultProgress,
          userId,
          lastActiveAt: new Date(),
        };
        set({ progress: newProgress });

        // Save to storage
        await AsyncStorage.setItem(storageKey, JSON.stringify(newProgress));
      }
    } catch (error) {
      console.error('Failed to initialize progress:', error);
      set({ progress: { ...defaultProgress, userId } });
    } finally {
      set({ isLoading: false });
    }
  },

  markTaskCompleted: async (taskId: string) => {
    const { progress } = get();
    const now = new Date();

    const updatedTasks = progress.tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: true, completedAt: now }
        : task,
    );

    const updatedDemoTasksCompleted = progress.demoTasksCompleted.includes(
      taskId,
    )
      ? progress.demoTasksCompleted
      : [...progress.demoTasksCompleted, taskId];

    const updatedProgress = {
      ...progress,
      tasks: updatedTasks,
      demoTasksCompleted: updatedDemoTasksCompleted,
      lastActiveAt: now,
    };

    set({ progress: updatedProgress });

    // Save to storage
    try {
      const storageKey = progress.userId
        ? `${STORAGE_KEY}_${progress.userId}`
        : STORAGE_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Failed to save task completion:', error);
    }
  },

  incrementTaskView: async (taskId: string) => {
    const { progress } = get();
    const now = new Date();

    const updatedTasks = progress.tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            viewCount: task.viewCount + 1,
            lastViewedAt: now,
          }
        : task,
    );

    const updatedProgress = {
      ...progress,
      tasks: updatedTasks,
      totalDemoViews: progress.totalDemoViews + 1,
      lastActiveAt: now,
    };

    set({ progress: updatedProgress });

    // Save to storage
    try {
      const storageKey = progress.userId
        ? `${STORAGE_KEY}_${progress.userId}`
        : STORAGE_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Failed to save task view:', error);
    }
  },

  markOnboardingCompleted: async () => {
    const { progress } = get();
    const now = new Date();

    const updatedProgress = {
      ...progress,
      onboardingCompleted: true,
      onboardingCompletedAt: now,
      lastActiveAt: now,
    };

    set({ progress: updatedProgress });

    // Save to storage
    try {
      const storageKey = progress.userId
        ? `${STORAGE_KEY}_${progress.userId}`
        : STORAGE_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  },

  resetProgress: async () => {
    const { progress } = get();
    const resetProgress = {
      ...defaultProgress,
      userId: progress.userId,
      lastActiveAt: new Date(),
    };

    set({ progress: resetProgress });

    // Clear from storage
    try {
      const storageKey = progress.userId
        ? `${STORAGE_KEY}_${progress.userId}`
        : STORAGE_KEY;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }
  },

  getTaskProgress: (taskId: string) => {
    const { progress } = get();
    return progress.tasks.find(task => task.id === taskId);
  },

  getCompletionPercentage: () => {
    const { progress } = get();
    const completedTasks = progress.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / progress.tasks.length) * 100);
  },
}));
