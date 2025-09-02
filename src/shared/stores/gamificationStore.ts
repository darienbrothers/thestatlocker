import { create } from 'zustand';
import { 
  Badge, 
  XPReward, 
  Level,
  BADGES, 
  XP_VALUES,
  calculateLevel,
  calculateLevelProgress,
  getXPToNextLevel,
  awardXP,
  checkBadgeUnlock
} from '@/utils/gamification';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: Date;
}

interface GamificationState {
  // Core state
  totalXP: number;
  badges: Badge[];
  xpHistory: XPReward[];
  
  // Quest tracking
  currentQuests: Quest[];
  completedQuests: Quest[];
  
  // UI state
  showLevelUpAnimation: boolean;
  showBadgeUnlockAnimation: boolean;
  pendingXPAnimation: number | null;
  
  // Computed values (getters)
  currentLevel: Level;
  levelProgress: number;
  xpToNextLevel: number;
}

interface GamificationActions {
  // XP Management
  addXP: (amount: number, reason: string) => XPReward;
  setTotalXP: (xp: number) => void;
  
  // Badge Management
  unlockBadge: (badgeId: string) => void;
  resetBadges: () => void;
  
  // Quest Management
  addQuest: (quest: Omit<Quest, 'isCompleted'>) => void;
  completeQuest: (questId: string) => void;
  clearQuests: () => void;
  
  // Animation Control
  triggerLevelUpAnimation: () => void;
  triggerBadgeUnlockAnimation: () => void;
  setPendingXPAnimation: (xp: number | null) => void;
  clearAnimations: () => void;
  
  // Onboarding specific actions
  startOnboardingPath: (pathType: 'rookie' | 'pro') => void;
  completeOnboardingStep: (stepType: 'quick_quest' | 'extended_step', stepName: string) => void;
  completeOnboarding: (type: 'quick' | 'extended') => void;
  
  // Reset/Initialize
  resetGamification: () => void;
  initializeFromUser: (userData: any) => void;
}

type GamificationStore = GamificationState & GamificationActions;

const initialState: GamificationState = {
  totalXP: 0,
  badges: BADGES.map(badge => ({ ...badge, isUnlocked: false })),
  xpHistory: [],
  currentQuests: [],
  completedQuests: [],
  showLevelUpAnimation: false,
  showBadgeUnlockAnimation: false,
  pendingXPAnimation: null,
  currentLevel: calculateLevel(0),
  levelProgress: 0,
  xpToNextLevel: 100,
};

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  ...initialState,

  // XP Management
  addXP: (amount: number, reason: string) => {
    const currentXP = get().totalXP;
    const newXP = currentXP + amount;
    const currentLevel = get().currentLevel;
    const newLevel = calculateLevel(newXP);
    
    const reward = awardXP(currentXP, amount, reason);
    
    set(state => ({
      totalXP: newXP,
      xpHistory: [...state.xpHistory, reward],
      currentLevel: newLevel,
      levelProgress: calculateLevelProgress(newXP),
      xpToNextLevel: getXPToNextLevel(newXP),
      pendingXPAnimation: newXP,
      showLevelUpAnimation: currentLevel.id !== newLevel.id,
    }));

    return reward;
  },

  setTotalXP: (xp: number) => {
    set({
      totalXP: xp,
      currentLevel: calculateLevel(xp),
      levelProgress: calculateLevelProgress(xp),
      xpToNextLevel: getXPToNextLevel(xp),
    });
  },

  // Badge Management
  unlockBadge: (badgeId: string) => {
    set(state => ({
      badges: state.badges.map(badge => 
        badge.id === badgeId 
          ? { ...badge, isUnlocked: true }
          : badge
      ),
      showBadgeUnlockAnimation: true,
    }));
  },

  resetBadges: () => {
    set({
      badges: BADGES.map(badge => ({ ...badge, isUnlocked: false })),
    });
  },

  // Quest Management
  addQuest: (quest: Omit<Quest, 'isCompleted'>) => {
    set(state => ({
      currentQuests: [...state.currentQuests, { ...quest, isCompleted: false }],
    }));
  },

  completeQuest: (questId: string) => {
    const quest = get().currentQuests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    const completedQuest = { 
      ...quest, 
      isCompleted: true, 
      completedAt: new Date() 
    };

    // Award XP for quest completion
    get().addXP(quest.xpReward, `Completed: ${quest.title}`);

    set(state => ({
      currentQuests: state.currentQuests.map(q => 
        q.id === questId ? completedQuest : q
      ),
      completedQuests: [...state.completedQuests, completedQuest],
    }));
  },

  clearQuests: () => {
    set({
      currentQuests: [],
      completedQuests: [],
    });
  },

  // Animation Control
  triggerLevelUpAnimation: () => {
    set({ showLevelUpAnimation: true });
  },

  triggerBadgeUnlockAnimation: () => {
    set({ showBadgeUnlockAnimation: true });
  },

  setPendingXPAnimation: (xp: number | null) => {
    set({ pendingXPAnimation: xp });
  },

  clearAnimations: () => {
    set({
      showLevelUpAnimation: false,
      showBadgeUnlockAnimation: false,
      pendingXPAnimation: null,
    });
  },

  // Onboarding specific actions
  startOnboardingPath: (pathType: 'rookie' | 'pro') => {
    const xpAmount = pathType === 'rookie' ? XP_VALUES.ROOKIE_PATH : XP_VALUES.PRO_PATH;
    get().addXP(xpAmount, `Started ${pathType} onboarding path`);
  },

  completeOnboardingStep: (stepType: 'quick_quest' | 'extended_step', stepName: string) => {
    const xpAmount = stepType === 'quick_quest' ? XP_VALUES.QUICK_QUEST : XP_VALUES.EXTENDED_STEP;
    get().addXP(xpAmount, `Completed: ${stepName}`);
  },

  completeOnboarding: (type: 'quick' | 'extended') => {
    const badgeId = type === 'quick' ? 'rookie_badge' : 'captain_badge';
    get().unlockBadge(badgeId);
    
    // Clear current quests as onboarding is complete
    get().clearQuests();
  },

  // Reset/Initialize
  resetGamification: () => {
    set(initialState);
  },

  initializeFromUser: (userData: any) => {
    const userXP = userData?.gamification?.totalXP || 0;
    const userBadges = userData?.gamification?.badges || [];
    
    set({
      totalXP: userXP,
      currentLevel: calculateLevel(userXP),
      levelProgress: calculateLevelProgress(userXP),
      xpToNextLevel: getXPToNextLevel(userXP),
      badges: BADGES.map(badge => ({
        ...badge,
        isUnlocked: userBadges.includes(badge.id),
      })),
    });
  },
}));
