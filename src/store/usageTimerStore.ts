
import { create } from 'zustand';

interface UsageTime {
  day: string;
  minutes: number;
}

interface UsageTimerState {
  startTime: number | null;
  dailyUsage: UsageTime[];
  startTimer: () => void;
  stopTimer: () => void;
  loadSavedUsage: () => void;
}

export const useUsageTimerStore = create<UsageTimerState>((set, get) => ({
  startTime: null,
  dailyUsage: [],
  
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
  }
}));
