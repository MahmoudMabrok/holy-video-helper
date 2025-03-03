
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface UsageTime {
  day: string;
  minutes: number;
}

interface LeaderboardEntry {
  id: string;
  total_minutes: number;
  last_updated: string;
}

interface UsageTimerState {
  startTime: number | null;
  dailyUsage: UsageTime[];
  userId: string;
  leaderboard: LeaderboardEntry[];
  startTimer: () => void;
  stopTimer: () => void;
  loadSavedUsage: () => void;
  syncWithLeaderboard: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}

// Initialize or get the user ID
const getUserId = (): string => {
  const savedId = localStorage.getItem('user_id');
  if (savedId) return savedId;
  
  const newId = uuidv4();
  localStorage.setItem('user_id', newId);
  return newId;
};

export const useUsageTimerStore = create<UsageTimerState>((set, get) => ({
  startTime: null,
  dailyUsage: [],
  userId: getUserId(),
  leaderboard: [],
  
  startTimer: () => {
    set({ startTime: Date.now() });
  },
  
  stopTimer: () => {
    const { startTime, dailyUsage } = get();
    
    if (!startTime) return;
    
    const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
    if (elapsedMinutes <= 0) return;
    
    const today = new Date().toLocaleDateString();
    const existingDayIndex = dailyUsage.findIndex(item => item.day === today);
    
    let newDailyUsage;
    
    if (existingDayIndex >= 0) {
      newDailyUsage = [...dailyUsage];
      newDailyUsage[existingDayIndex].minutes += elapsedMinutes;
    } else {
      newDailyUsage = [...dailyUsage, { day: today, minutes: elapsedMinutes }];
    }
    
    // Save to localStorage
    localStorage.setItem('daily_usage', JSON.stringify(newDailyUsage));
    
    set({ 
      startTime: null, 
      dailyUsage: newDailyUsage
    });
    
    // Sync with leaderboard automatically after updating local usage
    get().syncWithLeaderboard().catch(error => {
      console.error('Failed to sync with leaderboard:', error);
    });
  },
  
  loadSavedUsage: () => {
    try {
      const savedUsage = localStorage.getItem('daily_usage');
      if (savedUsage) {
        set({ dailyUsage: JSON.parse(savedUsage) });
      }
    } catch (error) {
      console.error('Error loading saved usage data:', error);
    }
  },
  
  syncWithLeaderboard: async () => {
    try {
      const { dailyUsage, userId } = get();
      const totalMinutes = dailyUsage.reduce((sum, day) => sum + day.minutes, 0);
      
      if (totalMinutes <= 0) return;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/app_usage_leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: userId,
          total_minutes: totalMinutes,
          last_updated: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync usage: ${response.status}`);
      }
      
      // Refresh the leaderboard data
      await get().fetchLeaderboard();
    } catch (error) {
      console.error('Error syncing with leaderboard:', error);
      toast.error('Failed to update leaderboard. Please try again later.');
    }
  },
  
  fetchLeaderboard: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/app_usage_leaderboard?select=id,total_minutes,last_updated&order=total_minutes.desc`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }
      
      const leaderboardData = await response.json();
      set({ leaderboard: leaderboardData });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard. Please try again later.');
    }
  }
}));
