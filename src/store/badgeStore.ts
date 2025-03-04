
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export type BadgeType = 
  | 'time-30min'
  | 'time-1hour'
  | 'time-5hour'
  | 'video-first'
  | 'video-5complete'
  | 'app-first-open'
  | 'app-5-days'
  | 'app-10-days'
  | 'app-20-days';

interface BadgeState {
  badges: Record<BadgeType, Badge>;
  earnBadge: (type: BadgeType) => void;
  checkTimeBadges: (totalMinutes: number) => void;
  checkVideoCompletionBadges: (completedVideos: number) => void;
  checkAppUsageBadges: () => void;
  recordAppOpen: () => void;
  dailyOpenDates: string[];
  consecutiveDays: number;
}

const badgeDefinitions: Record<BadgeType, Omit<Badge, 'earned' | 'earnedAt'>> = {
  'time-30min': {
    id: 'time-30min',
    name: '30-Minute Viewer',
    description: 'Watched videos for 30 minutes',
    icon: 'badge-check',
  },
  'time-1hour': {
    id: 'time-1hour',
    name: '1-Hour Enthusiast',
    description: 'Watched videos for 1 hour',
    icon: 'badge-plus',
  },
  'time-5hour': {
    id: 'time-5hour',
    name: '5-Hour Dedicated',
    description: 'Watched videos for 5 hours',
    icon: 'award',
  },
  'video-first': {
    id: 'video-first',
    name: 'First Video',
    description: 'Finished watching your first video',
    icon: 'badge',
  },
  'video-5complete': {
    id: 'video-5complete',
    name: '5 Videos Completed',
    description: 'Finished watching 5 videos',
    icon: 'trophy',
  },
  'app-first-open': {
    id: 'app-first-open',
    name: 'First Timer',
    description: 'Opened the app for the first time',
    icon: 'star',
  },
  'app-5-days': {
    id: 'app-5-days',
    name: '5-Day Streak',
    description: 'Used the app for 5 consecutive days',
    icon: 'calendar-check',
  },
  'app-10-days': {
    id: 'app-10-days',
    name: '10-Day Streak',
    description: 'Used the app for 10 consecutive days',
    icon: 'check-check',
  },
  'app-20-days': {
    id: 'app-20-days',
    name: '20-Day Streak',
    description: 'Used the app for 20 consecutive days',
    icon: 'trophy',
  },
};

// Initialize badges with earned: false
const initializeBadges = (): Record<BadgeType, Badge> => {
  const badges: Record<BadgeType, Badge> = {} as Record<BadgeType, Badge>;
  
  (Object.keys(badgeDefinitions) as BadgeType[]).forEach((key) => {
    badges[key] = {
      ...badgeDefinitions[key],
      earned: false,
    };
  });
  
  return badges;
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Check if two dates are consecutive
const areDatesConsecutive = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Reset time part for proper day difference calculation
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Get the difference in days
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      badges: initializeBadges(),
      dailyOpenDates: [],
      consecutiveDays: 0,
      
      earnBadge: (type: BadgeType) => {
        const { badges } = get();
        
        // If badge is already earned, do nothing
        if (badges[type].earned) return;
        
        const now = new Date().toISOString();
        
        // Update the badge
        set((state) => ({
          badges: {
            ...state.badges,
            [type]: {
              ...state.badges[type],
              earned: true,
              earnedAt: now,
            },
          },
        }));
        
        // Show a toast notification
        toast.success(`🏆 Badge earned: ${badges[type].name}`, {
          description: badges[type].description,
          duration: 5000,
        });
      },
      
      checkTimeBadges: (totalMinutes: number) => {
        if (totalMinutes >= 30) {
          get().earnBadge('time-30min');
        }
        
        if (totalMinutes >= 60) {
          get().earnBadge('time-1hour');
        }
        
        if (totalMinutes >= 300) {
          get().earnBadge('time-5hour');
        }
      },
      
      checkVideoCompletionBadges: (completedVideos: number) => {
        if (completedVideos >= 1) {
          get().earnBadge('video-first');
        }
        
        if (completedVideos >= 5) {
          get().earnBadge('video-5complete');
        }
      },

      recordAppOpen: () => {
        const today = getTodayDateString();
        const { dailyOpenDates } = get();
        
        // Check if we already recorded today
        if (dailyOpenDates.includes(today)) {
          return;
        }
        
        // Add today to the list of open dates
        const newDailyOpenDates = [...dailyOpenDates, today].sort();
        
        // Calculate consecutive days
        let consecutiveDays = 1; // Start with today
        for (let i = newDailyOpenDates.length - 1; i > 0; i--) {
          if (areDatesConsecutive(newDailyOpenDates[i-1], newDailyOpenDates[i])) {
            consecutiveDays++;
          } else {
            break;
          }
        }
        
        set({ 
          dailyOpenDates: newDailyOpenDates,
          consecutiveDays 
        });
        
        // Check for app open badges
        get().checkAppUsageBadges();
      },
      
      checkAppUsageBadges: () => {
        const { dailyOpenDates, consecutiveDays } = get();
        
        // First-time open badge
        if (dailyOpenDates.length >= 1) {
          get().earnBadge('app-first-open');
        }
        
        // Consecutive days badges
        if (consecutiveDays >= 5) {
          get().earnBadge('app-5-days');
        }
        
        if (consecutiveDays >= 10) {
          get().earnBadge('app-10-days');
        }
        
        if (consecutiveDays >= 20) {
          get().earnBadge('app-20-days');
        }
      },
    }),
    {
      name: 'user-badges',
    }
  )
);
