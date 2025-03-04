
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
  | 'video-5complete';

interface BadgeState {
  badges: Record<BadgeType, Badge>;
  earnBadge: (type: BadgeType) => void;
  checkTimeBadges: (totalMinutes: number) => void;
  checkVideoCompletionBadges: (completedVideos: number) => void;
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

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      badges: initializeBadges(),
      
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
    }),
    {
      name: 'user-badges',
    }
  )
);
