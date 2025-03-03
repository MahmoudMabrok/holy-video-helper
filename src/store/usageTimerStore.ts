
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import supabase from '../../supabase/connect'

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

    if(!dailyUsage) return; 

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

      const { error } = await supabase
        .from('app_usage_leaderboard')
        .upsert({
          id: userId,
          total_minutes: totalMinutes,
          last_updated: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to sync usage: ${error.message}`);
      }
      
      // Refresh the leaderboard data
      await get().fetchLeaderboard();
      
      toast.success('Usage time synced to leaderboard');
    } catch (error) {
      console.error('Error syncing with leaderboard:', error);
      toast.error('Failed to update leaderboard. Please try again later.');
    }
  },
  
  fetchLeaderboard: async () => {
    try {
   
      const { data, error } = await supabase
      .from('app_usage_leaderboard')
      .select('id, total_minutes, last_updated')
      .order('total_minutes', { ascending: false });

      console.log('response', data, error);
      
  
      set({ leaderboard: data || [] });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard. Please try again later.');
    }
  }
}));
