
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import supabase from '../../supabase/connect'
import { useBadgeStore } from './badgeStore';

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
  getTotalUsageMinutes: () => number;
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
    
    // Check for time-based badges
    const totalMinutes = get().getTotalUsageMinutes();
    useBadgeStore.getState().checkTimeBadges(totalMinutes);
    
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
        
        // Check for time-based badges on load
        const totalMinutes = get().getTotalUsageMinutes();
        useBadgeStore.getState().checkTimeBadges(totalMinutes);
      }
    } catch (error) {
      console.error('Error loading saved usage data:', error);
    }
  },
  
  getTotalUsageMinutes: () => {
    const { dailyUsage } = get();
    return dailyUsage.reduce((sum, day) => sum + day.minutes, 0);
  },
  
  syncWithLeaderboard: async () => {
    try {
      const { dailyUsage, userId } = get();
      const totalMinutes = dailyUsage.reduce((sum, day) => sum + day.minutes, 0);

      console.log('Syncing with leaderboard. Total minutes:', totalMinutes, 'User ID:', userId);

      // First check if the user exists in the leaderboard
      const { data: existingUser, error: fetchError } = await supabase
        .from('app_usage_leaderboard')
        .select('id')
        .eq('id', userId)
        .single();
      
      console.log('Existing user check:', existingUser, fetchError);

      let result;
      
      if (!existingUser) {
        // Insert new user
        console.log('Inserting new user into leaderboard');
        result = await supabase
          .from('app_usage_leaderboard')
          .insert({
            id: userId,
            total_minutes: totalMinutes,
            last_updated: new Date().toISOString()
          });
      } else {
        // Update existing user
        console.log('Updating existing user in leaderboard');
        result = await supabase
          .from('app_usage_leaderboard')
          .update({
            total_minutes: totalMinutes,
            last_updated: new Date().toISOString()
          })
          .eq('id', userId);
      }

      console.log('Upsert result:', result);
      
      if (result.error) {
        throw new Error(`Failed to sync usage: ${result.error.message}`);
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
      console.log('Fetching leaderboard data');
      const { data, error } = await supabase
        .from('app_usage_leaderboard')
        .select('id, total_minutes, last_updated')
        .order('total_minutes', { ascending: false });

      console.log('Leaderboard response:', data, error);
      
      if (error) {
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }
  
      set({ leaderboard: data || [] });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard. Please try again later.');
    }
  }
}));
